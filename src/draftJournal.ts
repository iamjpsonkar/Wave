interface DraftRecord {
  id?: number;
  workspace: FileSystemDirectoryHandle;
  path: string;
  content: string;
  updatedAt: number;
}
const DATABASE='wave-draft-journal';
const STORE='drafts';
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
async function findDraft(db:IDBDatabase,workspace:FileSystemDirectoryHandle,path:string):Promise<DraftRecord|undefined>{
  const records=await allDrafts(db);
  for(const record of records){
    if(record.path!==path)continue;
    try{if(await record.workspace.isSameEntry(workspace))return record;}catch{/* stale handles are ignored */}
  }
  return undefined;
}
export async function saveDraft(workspace:FileSystemDirectoryHandle,path:string,content:string):Promise<void>{
  if(!('indexedDB' in window))return;
  const db=await openDatabase();
  try{
    const previous=await findDraft(db,workspace,path);
    await new Promise<void>((resolve,reject)=>{
      const transaction=db.transaction(STORE,'readwrite');
      const record:DraftRecord={...(previous?.id?{id:previous.id}:{}),workspace,path,content,updatedAt:Date.now()};
      transaction.objectStore(STORE).put(record);
      transaction.oncomplete=()=>resolve();
      transaction.onerror=()=>reject(transaction.error??new Error('Could not save a recovery draft.'));
      transaction.onabort=()=>reject(transaction.error??new Error('Draft journal update was aborted.'));
    });
  }finally{db.close();}
}
export async function getDraft(workspace:FileSystemDirectoryHandle,path:string):Promise<DraftRecord|undefined>{
  if(!('indexedDB' in window))return undefined;
  const db=await openDatabase();
  try{return await findDraft(db,workspace,path);}finally{db.close();}
}
export async function clearDraft(workspace:FileSystemDirectoryHandle,path:string):Promise<void>{
  if(!('indexedDB' in window))return;
  const db=await openDatabase();
  try{
    const previous=await findDraft(db,workspace,path);
    if(!previous?.id)return;
    await new Promise<void>((resolve,reject)=>{
      const transaction=db.transaction(STORE,'readwrite');
      transaction.objectStore(STORE).delete(previous.id!);
      transaction.oncomplete=()=>resolve();
      transaction.onerror=()=>reject(transaction.error??new Error('Could not clear the recovered draft.'));
      transaction.onabort=()=>reject(transaction.error??new Error('Draft journal cleanup was aborted.'));
    });
  }finally{db.close();}
}
