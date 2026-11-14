import { newestDraft } from './safety';

interface DraftRecord {
  id?: number;
  workspace: FileSystemDirectoryHandle;
  path: string;
  content: string;
  updatedAt: number;
  tabId?: string;
}
let fallbackSessionId: string | undefined;
function currentTabId(): string {
  try {
    const key = 'wave-draft-session-id';
    let id = sessionStorage.getItem(key);
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); }
    return id;
  } catch {
    return fallbackSessionId ??= crypto.randomUUID();
  }
}
export function isCurrentTabDraft(draft: Pick<DraftRecord,'tabId'>): boolean {
  return draft.tabId===currentTabId();
}
const DATABASE='wave-draft-journal';
const STORE='drafts';
const localQueues=new Map<string,Promise<unknown>>();
function lockName(workspace:FileSystemDirectoryHandle,path:string):string{
  // Same-named workspaces may share a lock unnecessarily; this is safe and
  // ensures separate tabs cannot race while matching handles with isSameEntry().
  return 'wave-draft:'+workspace.name+':'+path;
}
async function withDraftLock<T>(workspace:FileSystemDirectoryHandle,path:string,operation:()=>Promise<T>):Promise<T>{
  const name=lockName(workspace,path);
  const manager=typeof navigator!=='undefined'?(navigator as Navigator & {locks?:LockManager}).locks:undefined;
  if(manager)return manager.request(name,{mode:'exclusive'},operation);
  const previous=localQueues.get(name)??Promise.resolve();
  const current=previous.catch(()=>undefined).then(operation);
  localQueues.set(name,current);
  try{return await current;}finally{if(localQueues.get(name)===current)localQueues.delete(name);}
}
function openDatabase():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DATABASE,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error??new Error('Could not open the local draft journal.'));
  });
}
async function allDrafts(db:IDBDatabase):Promise<DraftRecord[]>{
  return new Promise((resolve,reject)=>{
    const request=db.transaction(STORE,'readonly').objectStore(STORE).getAll();
    request.onsuccess=()=>resolve(request.result as DraftRecord[]);
    request.onerror=()=>reject(request.error??new Error('Could not read local drafts.'));
  });
}
async function findDrafts(db:IDBDatabase,workspace:FileSystemDirectoryHandle,path:string):Promise<DraftRecord[]>{
  const records=await allDrafts(db),matches:DraftRecord[]=[];
  for(const record of records){
    if(record.path!==path)continue;
    try{if(await record.workspace.isSameEntry(workspace))matches.push(record);}catch{/* stale handles are ignored */}
  }
  return matches;
}
function writeTransaction(db:IDBDatabase,operation:(store:IDBObjectStore)=>void):Promise<void>{
  return new Promise((resolve,reject)=>{
    // Ask the browser to complete the transaction only after its data has
    // been flushed to stable storage. Older engines may not support the
    // durability option, so retain the normal transaction as a fallback.
    let transaction:IDBTransaction;
    try{transaction=db.transaction(STORE,'readwrite',{durability:'strict'});}
    catch{transaction=db.transaction(STORE,'readwrite');}
    operation(transaction.objectStore(STORE));
    transaction.oncomplete=()=>resolve();
    transaction.onerror=()=>reject(transaction.error??new Error('Could not update the local draft journal.'));
    transaction.onabort=()=>reject(transaction.error??new Error('Draft journal update was aborted.'));
  });
}
export async function saveDraft(workspace:FileSystemDirectoryHandle,path:string,content:string):Promise<void>{
  if(!('indexedDB' in window))return;
  await withDraftLock(workspace,path,async()=>{
    const db=await openDatabase();
    try{
      const matches=await findDrafts(db,workspace,path);
      const tabId=currentTabId();
      // Keep one recovery record per browser tab. A successful save in one
      // tab must never erase another tab's unsaved draft for the same page.
      const ownMatches=matches.filter(record=>record.tabId===tabId);
      const legacyMatches=ownMatches.length?[]:matches.filter(record=>!record.tabId).slice(0,1);
      const candidates=ownMatches.length?ownMatches:legacyMatches;
      const previous=newestDraft(candidates);
      const updatedAt=Math.max(Date.now(),(previous?.updatedAt??0)+1);
      const record:DraftRecord={...(previous?.id?{id:previous.id}:{}),workspace,path,content,updatedAt,tabId};
      await writeTransaction(db,store=>{
        store.put(record);
        for(const duplicate of candidates)if(duplicate.id!==previous?.id&&duplicate.id!==undefined)store.delete(duplicate.id);
      });
    }finally{db.close();}
  });
}
export async function getDraft(workspace:FileSystemDirectoryHandle,path:string):Promise<DraftRecord|undefined>{
  if(!('indexedDB' in window))return undefined;
  return withDraftLock(workspace,path,async()=>{
    const db=await openDatabase();
    try{return newestDraft(await findDrafts(db,workspace,path));}finally{db.close();}
  });
}
export async function clearDraft(workspace:FileSystemDirectoryHandle,path:string):Promise<void>{
  if(!('indexedDB' in window))return;
  await withDraftLock(workspace,path,async()=>{
    const db=await openDatabase();
    try{
      const matches=await findDrafts(db,workspace,path);
      const tabId=currentTabId();
      const ownMatches=matches.filter(record=>record.tabId===tabId||!record.tabId);
      if(!ownMatches.length)return;
      await writeTransaction(db,store=>{for(const record of ownMatches)if(record.id!==undefined)store.delete(record.id);});
    }finally{db.close();}
  });
}
