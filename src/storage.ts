export interface Workspace {
  root: FileSystemDirectoryHandle;
  wave: FileSystemDirectoryHandle;
  documents: FileSystemDirectoryHandle;
  assets: FileSystemDirectoryHandle;
  backups: FileSystemDirectoryHandle;
  trash: FileSystemDirectoryHandle;
}
export interface Doc { id: string; path: string; title: string; updatedAt: number; content: string }
export interface TrashItem { id: string; title: string; originalPath: string; deletedAt: string }
export interface TrashListing { items: TrashItem[]; issues: string[] }
export interface BackupInfo { name: string; createdAt: string; documents: number; assets: number }
export interface WorkspaceSettings {
  format?: string;
  appearance?: 'system' | 'light' | 'dark';
  favorites?: string[];
  [key: string]: unknown;
}
interface Manifest { schemaVersion: number; name: string; createdAt: string; updatedAt: string }

const writeQueues = new WeakMap<FileSystemDirectoryHandle, Map<string, Promise<unknown>>>();
const settingsQueues = new WeakMap<FileSystemDirectoryHandle, Promise<unknown>>();
const NOT_FOUND = 'NotFoundError';

const localWorkspaceLocks=new Map<string,Promise<unknown>>();
async function withWorkspaceLock<T>(name:string,operation:()=>Promise<T>):Promise<T>{
  const manager=typeof navigator!=='undefined'?(navigator as Navigator & {locks?:LockManager}).locks:undefined;
  if(manager)return manager.request('wave:'+name,{mode:'exclusive'},operation);
  const previous=localWorkspaceLocks.get(name)??Promise.resolve();
  const current=previous.catch(()=>undefined).then(operation);
  localWorkspaceLocks.set(name,current);
  try{return await current;}finally{if(localWorkspaceLocks.get(name)===current)localWorkspaceLocks.delete(name);}
}
function isNotFound(error: unknown): boolean {
  return error instanceof DOMException ? error.name === NOT_FOUND : Boolean(error && typeof error === 'object' && 'name' in error && error.name === NOT_FOUND);
}
function validatePath(path: string): string[] {
  if (!path || path.startsWith('/') || path.endsWith('/')) throw new Error('Invalid workspace path.');
  const parts = path.split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || /[\\\\:\\0]/.test(part))) throw new Error('Invalid workspace path.');
  return parts;
}
async function directoryForPath(root: FileSystemDirectoryHandle, path: string, create = false) {
  const parts = path ? validatePath(path) : [];
  let current = root;
  for (const part of parts) current = await current.getDirectoryHandle(part, { create });
  return current;
}
async function fileForPath(root: FileSystemDirectoryHandle, path: string, create = false) {
  const parts = validatePath(path);
  const name = parts.pop()!;
  const parent = await directoryForPath(root, parts.join('/'), create);
  return parent.getFileHandle(name, { create });
}
async function existsFile(dir: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  try { await dir.getFileHandle(name); return true; }
  catch (error) { if (isNotFound(error)) return false; throw error; }
}
async function existsDirectory(dir: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  try { await dir.getDirectoryHandle(name); return true; }
  catch (error) { if (isNotFound(error)) return false; throw error; }
}
export async function createUniqueDirectory(dir:FileSystemDirectoryHandle,baseName:string,lockName='directory-allocation'):Promise<{name:string;handle:FileSystemDirectoryHandle}>{
  return withWorkspaceLock(lockName,async()=>{
    let name=baseName,suffix=2;
    while(await hasCaseInsensitiveEntry(dir,name))name=baseName+'-'+suffix++;
    const handle=await dir.getDirectoryHandle(name,{create:true});
    return {name,handle};
  });
}
async function hasCaseInsensitiveEntry(dir:FileSystemDirectoryHandle,name:string):Promise<boolean>{
  const target=name.normalize('NFC').toLocaleLowerCase('en-US');
  for await(const [existing] of dir.entries())if(existing.normalize('NFC').toLocaleLowerCase('en-US')===target)return true;
  return false;
}
async function write(dir: FileSystemDirectoryHandle, name: string, data: string | File | Blob) {
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  try { await writable.write(data); await writable.close(); }
  catch (error) { try { await writable.abort(); } catch { /* preserve original write error */ } throw error; }
}
async function updateManifest(wave: FileSystemDirectoryHandle): Promise<void> {
  try {
    const file = await (await wave.getFileHandle('manifest.json')).getFile();
    const value = JSON.parse(await file.text()) as Partial<Manifest>;
    if (!value || typeof value !== 'object' || !Number.isInteger(value.schemaVersion)) return;
    await write(wave, 'manifest.json', JSON.stringify({ ...value, updatedAt: new Date().toISOString() }, null, 2));
  } catch (error) {
    if (isNotFound(error)) return;
    throw error;
  }
}
function queueWrite<T>(dir: FileSystemDirectoryHandle, path: string, operation: () => Promise<T>): Promise<T> {
  let queue = writeQueues.get(dir);
  if (!queue) { queue = new Map(); writeQueues.set(dir, queue); }
  const previous = queue.get(path) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);
  queue.set(path, current);
  void current.finally(() => { if (queue?.get(path) === current) queue.delete(path); }).catch(() => undefined);
  return current;
}
export async function openWorkspace(rootHandle?: FileSystemDirectoryHandle): Promise<Workspace> {
  if (!rootHandle && !('showDirectoryPicker' in window)) throw new Error('Folder access requires Chrome or Edge in this preview.');
  const root = rootHandle ?? await window.showDirectoryPicker({ mode: 'readwrite' });
  const wave = await root.getDirectoryHandle('.wave', { create: true });
  try{
    const restoreState=JSON.parse(await(await(await wave.getFileHandle('restore-status.json')).getFile()).text()) as {status?:string};
    if(restoreState.status!=='complete')throw new Error('This folder contains an incomplete backup restore and must not be used as a workspace.');
  }catch(error){if(!isNotFound(error))throw error;}
  const documents = await wave.getDirectoryHandle('documents', { create: true });
  const assets = await wave.getDirectoryHandle('assets', { create: true });
  const backups = await wave.getDirectoryHandle('backups', { create: true });
  const trash = await wave.getDirectoryHandle('trash', { create: true });
  const now = new Date().toISOString();
  if (!(await existsFile(wave, 'manifest.json'))) {
    await write(wave, 'manifest.json', JSON.stringify({ schemaVersion: 1, name: root.name, createdAt: now, updatedAt: now }, null, 2));
  }
  if (!(await existsFile(wave, 'settings.json'))) {
    await write(wave, 'settings.json', JSON.stringify({ format: 'markdown', appearance: 'system', favorites: [] }, null, 2));
  }
  return { root, wave, documents, assets, backups, trash };
}
export async function listDocs(dir: FileSystemDirectoryHandle): Promise<Doc[]> {
  const result: Doc[] = [];
  async function walk(folder: FileSystemDirectoryHandle, prefix = '') {
    for await (const [name, handle] of folder.entries()) {
      const path = prefix ? prefix + '/' + name : name;
      if (handle.kind === 'directory') await walk(handle as FileSystemDirectoryHandle, path);
      else if (name.toLowerCase().endsWith('.md')) {
        const file = await (handle as FileSystemFileHandle).getFile();
        const text = await file.slice(0, 4096).text();
        const first = text.split('\n').find(line => line.trim()) ?? '';
        result.push({ id: path, path, title: first.replace(/^#\s*/, '').trim() || name.replace(/\.md$/i, ''), updatedAt: file.lastModified, content: '' });
      }
    }
  }
  await walk(dir);
  return result.sort((a, b) => b.updatedAt - a.updatedAt);
}
export async function searchDocs(dir: FileSystemDirectoryHandle, query: string): Promise<Array<{path:string;snippet:string}>> {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  const matches: Array<{path:string;snippet:string}> = [];
  async function walk(folder: FileSystemDirectoryHandle, prefix = '') {
    for await (const [name, handle] of folder.entries()) {
      const path = prefix ? prefix + '/' + name : name;
      if (handle.kind === 'directory') await walk(handle as FileSystemDirectoryHandle, path);
      else if (name.toLowerCase().endsWith('.md')) {
        const text = await (await (handle as FileSystemFileHandle).getFile()).text();
        const index = text.toLocaleLowerCase().indexOf(needle);
        if (index >= 0) matches.push({ path, snippet: text.slice(Math.max(0,index-70), Math.min(text.length,index+needle.length+100)).replace(/\s+/g,' ').trim() });
      }
    }
  }
  await walk(dir);
  return matches;
}
export async function listFolders(dir: FileSystemDirectoryHandle): Promise<string[]> {
  const result: string[] = [];
  async function walk(folder: FileSystemDirectoryHandle, prefix = '') {
    for await (const [name, handle] of folder.entries()) {
      if (handle.kind !== 'directory') continue;
      const path = prefix ? prefix + '/' + name : name;
      result.push(path);
      await walk(handle as FileSystemDirectoryHandle, path);
    }
  }
  await walk(dir);
  return result.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
}
export async function readDoc(dir: FileSystemDirectoryHandle, path: string) {
  return (await (await fileForPath(dir, path)).getFile()).text();
}
export async function saveDoc(dir: FileSystemDirectoryHandle, path: string, text: string): Promise<void> {
  await queueWrite(dir, path, async () => {
    const file = await fileForPath(dir, path, true);
    const writable = await file.createWritable();
    try { await writable.write(text); await writable.close(); }
    catch (error) { try { await writable.abort(); } catch { /* keep original error */ } throw error; }
  });
}
export async function saveDocIfUnchanged(dir:FileSystemDirectoryHandle,path:string,text:string,expected:string|null):Promise<void>{
  await queueWrite(dir,path,async()=>{
    let current:string|null=null;
    try{current=await(await(await fileForPath(dir,path)).getFile()).text();}
    catch(error){if(!isNotFound(error))throw error;}
    if(current!==expected)throw new Error('This document changed outside Wave. Your draft is preserved; reload the latest file or save a separate copy.');
    const file=await fileForPath(dir,path,true),writable=await file.createWritable();
    try{await writable.write(text);await writable.close();}
    catch(error){try{await writable.abort();}catch{/* preserve original error */}throw error;}
  });
}
export async function touchWorkspaceMetadata(wave:FileSystemDirectoryHandle):Promise<void>{await updateManifest(wave);}
export async function createDoc(dir: FileSystemDirectoryHandle, requestedPath: string, text: string): Promise<string> {
  const parts = validatePath(requestedPath);
  const filename = parts.pop()!;
  const parent = await directoryForPath(dir, parts.join('/'), true);
  const dot = filename.lastIndexOf('.');
  const stem = dot > 0 ? filename.slice(0,dot) : filename;
  const ext = dot > 0 ? filename.slice(dot) : '';
  for (let index=1; index<10000; index++) {
    const candidate = index===1 ? filename : stem+'-'+index+ext;
    if (await existsFile(parent,candidate)) continue;
    const path=[...parts,candidate].join('/');
    try {
      await queueWrite(dir,path,()=>withWorkspaceLock('create:'+path.normalize('NFC').toLocaleLowerCase('en-US'),async()=>{
        if (await hasCaseInsensitiveEntry(parent,candidate)) throw new Error('A page with this name already exists.');
        await write(parent,candidate,text);
      }));
      return path;
    } catch(error) {
      if (error instanceof Error && error.message==='A page with this name already exists.') continue;
      throw error;
    }
  }
  throw new Error('Could not find an available page name.');
}
async function copyFolder(source: FileSystemDirectoryHandle, destination: FileSystemDirectoryHandle): Promise<{files:number;directories:number}> {
  let files=0,directories=0;
  for await (const [name, handle] of source.entries()) {
    if (handle.kind === 'directory') {
      const child = await destination.getDirectoryHandle(name, { create: true });
      const nested=await copyFolder(handle as FileSystemDirectoryHandle, child);
      files+=nested.files;directories+=nested.directories+1;
    } else {
      const file = await (handle as FileSystemFileHandle).getFile();
      await write(destination, name, file);files++;
    }
  }
  return {files,directories};
}
async function countFiles(dir:FileSystemDirectoryHandle):Promise<number>{
  let count=0;
  for await(const [,handle] of dir.entries()){
    if(handle.kind==='directory')count+=await countFiles(handle as FileSystemDirectoryHandle);
    else count++;
  }
  return count;
}
async function snapshotTree(dir:FileSystemDirectoryHandle,prefix=''):Promise<string>{
  const entries:string[]=[];
  for await(const [name,handle] of dir.entries()){
    const path=prefix?prefix+'/'+name:name;
    if(handle.kind==='directory')entries.push(await snapshotTree(handle as FileSystemDirectoryHandle,path));
    else{const file=await(handle as FileSystemFileHandle).getFile();const bytes=await file.arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',bytes);const hash=Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');entries.push(path+'|'+file.size+'|'+hash);}
  }
  return entries.sort().join('\\n');
}
async function optionalFileSnapshot(dir:FileSystemDirectoryHandle,name:string):Promise<string|null>{
  try{return await(await(await dir.getFileHandle(name)).getFile()).text();}
  catch(error){if(isNotFound(error))return null;throw error;}
}
export async function createBackup(workspace: Workspace): Promise<string> {
  return withWorkspaceLock('backup:'+workspace.root.name,async()=>{
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reserved=await createUniqueDirectory(workspace.backups,'backup-'+stamp,'backup-allocation');
  const name=reserved.name;
  const backup=reserved.handle;
  const startedAt=new Date().toISOString();
  await write(backup,'backup-status.json',JSON.stringify({status:'in-progress',startedAt},null,2));
  try {
    const beforeDocs=await snapshotTree(workspace.documents),beforeAssets=await snapshotTree(workspace.assets);const beforeManifest=await optionalFileSnapshot(workspace.wave,'manifest.json'),beforeSettings=await optionalFileSnapshot(workspace.wave,'settings.json');
    const docs=await copyFolder(workspace.documents,await backup.getDirectoryHandle('documents',{create:true}));
    const assets=await copyFolder(workspace.assets,await backup.getDirectoryHandle('assets',{create:true}));
    const afterDocs=await snapshotTree(workspace.documents),afterAssets=await snapshotTree(workspace.assets);
    if(beforeDocs!==afterDocs||beforeAssets!==afterAssets)throw new Error('Workspace files changed during backup. The snapshot is marked incomplete; retry when editing has stopped.');
    for(const filename of ['manifest.json','settings.json']){
      try{const file=await(await workspace.wave.getFileHandle(filename)).getFile();await write(backup,filename,file);}
      catch(error){if(!isNotFound(error))throw error;}
    }
    const afterManifest=await optionalFileSnapshot(workspace.wave,'manifest.json'),afterSettings=await optionalFileSnapshot(workspace.wave,'settings.json');
    if(beforeManifest!==afterManifest||beforeSettings!==afterSettings)throw new Error('Workspace settings changed during backup. The snapshot is marked incomplete; retry when editing has stopped.');
    const complete={status:'complete',startedAt,completedAt:new Date().toISOString(),documents:docs.files,assets:assets.files};
    await write(backup,'backup-status.json',JSON.stringify(complete,null,2));
    return name;
  } catch(error) {
    await write(backup,'backup-status.json',JSON.stringify({status:'failed',startedAt,failedAt:new Date().toISOString(),message:error instanceof Error?error.message:'Backup failed'},null,2)).catch(()=>undefined);
    throw error;
  }
  });
}
export async function listBackups(backups: FileSystemDirectoryHandle): Promise<BackupInfo[]> {
  const result:BackupInfo[]=[];
  for await(const [name,handle] of backups.entries()){
    if(handle.kind!=='directory'||!name.startsWith('backup-'))continue;
    try{
      const dir=handle as FileSystemDirectoryHandle;
      const status=JSON.parse(await(await(await dir.getFileHandle('backup-status.json')).getFile()).text()) as {status?:string;completedAt?:string;documents?:number;assets?:number};
      if(status.status==='complete'&&Number.isInteger(status.documents)&&Number.isInteger(status.assets)){
        result.push({name,createdAt:status.completedAt||name,documents:status.documents||0,assets:status.assets||0});
      }
    }catch{/* incomplete or corrupt snapshots are deliberately not restorable */}
  }
  return result.sort((a,b)=>b.name.localeCompare(a.name));
}
export async function restoreBackupToNewWorkspace(workspace:Workspace,name:string):Promise<string>{
  if(!/^backup-[a-zA-Z0-9T._-]+$/.test(name))throw new Error('Invalid backup name.');
  const source=await workspace.backups.getDirectoryHandle(name);
  const backupStatus=JSON.parse(await(await(await source.getFileHandle('backup-status.json')).getFile()).text()) as {status?:string;documents?:number;assets?:number};
  if(backupStatus.status!=='complete')throw new Error('This backup is incomplete and cannot be restored.');
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const reserved=await createUniqueDirectory(workspace.root,workspace.root.name+'-restore-'+stamp,'restore-allocation');
  const targetName=reserved.name,target=reserved.handle;
  const wave=await target.getDirectoryHandle('.wave',{create:true});
  const startedAt=new Date().toISOString();
  await write(wave,'restore-status.json',JSON.stringify({status:'in-progress',backup:name,startedAt},null,2));
  try{
    const docsCopied=await copyFolder(await source.getDirectoryHandle('documents'),await wave.getDirectoryHandle('documents',{create:true}));
    const assetsCopied=await copyFolder(await source.getDirectoryHandle('assets'),await wave.getDirectoryHandle('assets',{create:true}));
    if(docsCopied.files!==backupStatus.documents||assetsCopied.files!==backupStatus.assets)throw new Error('Backup contents do not match the completion manifest; restore was stopped.');
    for(const filename of ['manifest.json','settings.json']){
      try{const f=await(await source.getFileHandle(filename)).getFile();await write(wave,filename,f);}
      catch(error){if(!isNotFound(error))throw error;}
    }
    await write(wave,'restore-source.json',JSON.stringify({backup:name,restoredAt:new Date().toISOString()},null,2));
    await write(wave,'restore-status.json',JSON.stringify({status:'complete',backup:name,startedAt,completedAt:new Date().toISOString()},null,2));
    return targetName;
  }catch(error){
    await write(wave,'restore-status.json',JSON.stringify({status:'failed',backup:name,startedAt,failedAt:new Date().toISOString(),message:error instanceof Error?error.message:'Restore failed'},null,2)).catch(()=>undefined);
    throw error;
  }
}
export async function moveDocToTrash(documents: FileSystemDirectoryHandle, trash: FileSystemDirectoryHandle, path: string): Promise<void> {
  await withWorkspaceLock('trash:'+path,async()=>{
    const file=await fileForPath(documents,path);
    const text=await(await file.getFile()).text();
    const id=crypto.randomUUID();
    const title=text.split('\n').find(line=>line.trim())?.replace(/^#\s*/,'').trim()||path.split('/').pop()||'Untitled';
    const metadata:TrashItem={id,title,originalPath:path,deletedAt:new Date().toISOString()};
    const operation={id,operation:'trash',state:'copying',originalPath:path,startedAt:new Date().toISOString()};
    await write(trash,id+'.op.json',JSON.stringify(operation,null,2));
    await write(trash,id+'.md',text);
    await write(trash,id+'.op.json',JSON.stringify({...operation,state:'content-copied'},null,2));
    await write(trash,id+'.json',JSON.stringify(metadata,null,2));
    const verified=await(await(await trash.getFileHandle(id+'.md')).getFile()).text();
    if(verified!==text)throw new Error('Trash verification failed; original page was kept.');
    await write(trash,id+'.op.json',JSON.stringify({...operation,state:'verified'},null,2));
    const parts=validatePath(path),name=parts.pop()!;
    const parent=await directoryForPath(documents,parts.join('/'));
    await parent.removeEntry(name);
    await write(trash,id+'.op.json',JSON.stringify({...operation,state:'source-removed'},null,2));
    await trash.removeEntry(id+'.op.json');
  });
}
function validTrashItem(value:unknown):value is TrashItem{
  if(!value||typeof value!=='object')return false;
  const v=value as Partial<TrashItem>;
  if(typeof v.id!=='string'||!/^[a-f0-9-]{16,64}$/i.test(v.id))return false;
  if(typeof v.title!=='string'||typeof v.originalPath!=='string'||typeof v.deletedAt!=='string')return false;
  try{validatePath(v.originalPath);}catch{return false;}
  return !Number.isNaN(Date.parse(v.deletedAt));
}
async function removeIfPresent(dir:FileSystemDirectoryHandle,name:string):Promise<void>{
  try{await dir.removeEntry(name);}catch(error){if(!isNotFound(error))throw error;}
}
async function recoverTrashOperations(trash:FileSystemDirectoryHandle,documents:FileSystemDirectoryHandle):Promise<string[]>{
  const issues:string[]=[];
  for await(const [name,handle] of trash.entries()){
    if(handle.kind!=='file'||!name.endsWith('.op.json'))continue;
    try{
      const op=JSON.parse(await(await(handle as FileSystemFileHandle).getFile()).text()) as {id?:string;operation?:string;originalPath?:string;target?:string};
      if(typeof op.id!=='string'||name!==op.id+'.op.json')throw new Error('Invalid operation marker.');
      if(op.operation==='trash'&&typeof op.originalPath==='string'){
        let original:string|null=null,trashed:string|null=null,metadata:unknown=null;
        try{original=await readDoc(documents,op.originalPath);}catch(error){if(!isNotFound(error))throw error;}
        try{trashed=await(await(await trash.getFileHandle(op.id+'.md')).getFile()).text();}catch(error){if(!isNotFound(error))throw error;}
        try{metadata=JSON.parse(await(await(await trash.getFileHandle(op.id+'.json')).getFile()).text());}catch(error){if(!isNotFound(error)&&!(error instanceof SyntaxError))throw error;}
        if(trashed!==null&&trashed===original&&validTrashItem(metadata)&&metadata.id===op.id){
          const parts=validatePath(op.originalPath),leaf=parts.pop()!,parent=await directoryForPath(documents,parts.join('/'));
          await parent.removeEntry(leaf);
          await removeIfPresent(trash,op.id+'.op.json');
        }else if(original===null&&trashed!==null&&validTrashItem(metadata)&&metadata.id===op.id){
          await removeIfPresent(trash,op.id+'.op.json');
        }else if(original!==null){
          await removeIfPresent(trash,op.id+'.md');await removeIfPresent(trash,op.id+'.json');await removeIfPresent(trash,op.id+'.op.json');
        }else issues.push(name+': source and a verified Trash copy could not be found; manual recovery is required.');
      }else if(op.operation==='restore'&&typeof op.target==='string'){
        let target:string|null=null,trashed:string|null=null;
        try{target=await readDoc(documents,op.target);}catch(error){if(!isNotFound(error))throw error;}
        try{trashed=await(await(await trash.getFileHandle(op.id+'.md')).getFile()).text();}catch(error){if(!isNotFound(error))throw error;}
        if(target!==null&&trashed!==null&&target===trashed){
          await removeIfPresent(trash,op.id+'.md');await removeIfPresent(trash,op.id+'.json');await removeIfPresent(trash,op.id+'.op.json');
        }else if(target!==null&&trashed===null){
          await removeIfPresent(trash,op.id+'.json');await removeIfPresent(trash,op.id+'.op.json');
        }else if(target===null&&trashed!==null){
          await removeIfPresent(trash,op.id+'.op.json');
        }else issues.push(name+': restore destination or Trash source is missing; manual recovery is required.');
      }else throw new Error('Unknown Trash operation type.');
    }catch(error){issues.push(name+': '+(error instanceof Error?error.message:'operation recovery failed'));}
  }
  return issues;
}
export async function listTrashDetailed(trash:FileSystemDirectoryHandle,documents?:FileSystemDirectoryHandle):Promise<TrashListing>{
  const items:TrashItem[]=[],issues:string[]=documents?await recoverTrashOperations(trash,documents):[],metadataIds=new Set<string>(),markdownIds=new Set<string>();
  for await(const [name,handle] of trash.entries()){
    if(handle.kind!=='file')continue;
    if(name.endsWith('.md')){markdownIds.add(name.slice(0,-3));continue;}
    if(name.endsWith('.op.json')){issues.push(name+': incomplete or interrupted Trash operation; inspect before cleanup.');continue;}
    if(!name.endsWith('.json'))continue;
    try{
      const raw=JSON.parse(await(await(handle as FileSystemFileHandle).getFile()).text());
      if(!validTrashItem(raw)||name!==raw.id+'.json')throw new Error('Invalid Trash metadata.');
      metadataIds.add(raw.id);
      await trash.getFileHandle(raw.id+'.md');
      items.push(raw);
    }catch(error){issues.push(name+': '+(error instanceof Error?error.message:'unreadable metadata'));}
  }
  for(const id of markdownIds)if(!metadataIds.has(id))issues.push(id+'.md: orphaned Trash content; original page may still exist.');
  for(const id of metadataIds)if(!markdownIds.has(id))issues.push(id+'.json: missing Trash content.');
  return {items:items.sort((a,b)=>b.deletedAt.localeCompare(a.deletedAt)),issues};
}
export async function listTrash(trash: FileSystemDirectoryHandle): Promise<TrashItem[]> {
  return (await listTrashDetailed(trash)).items;
}
export async function restoreTrashItem(trash: FileSystemDirectoryHandle, documents: FileSystemDirectoryHandle, id: string): Promise<string> {
  if(!/^[a-f0-9-]{16,64}$/i.test(id))throw new Error('Invalid Trash item.');
  return withWorkspaceLock('trash-restore:'+id,async()=>{
  const metadata=JSON.parse(await(await(await trash.getFileHandle(id+'.json')).getFile()).text()) as unknown;
  if(!validTrashItem(metadata)||metadata.id!==id)throw new Error('Trash metadata is invalid; the item was not changed.');
  let target='';
  try{
    const operation=JSON.parse(await(await(await trash.getFileHandle(id+'.op.json')).getFile()).text()) as {operation?:string;state?:string;target?:string};
    if(operation.operation==='restore'&&typeof operation.target==='string'){
      const existing=await readDoc(documents,operation.target);
      try{const original=await(await(await trash.getFileHandle(id+'.md')).getFile()).text();if(existing===original)target=operation.target;}
      catch(error){if(isNotFound(error)&&operation.state==='destination-verified')target=operation.target;else throw error;}
    }
  }catch{/* no resumable restore marker */}
  if(!target){
    const content=await(await(await trash.getFileHandle(id+'.md')).getFile()).text();
    target=await createDoc(documents,metadata.originalPath,content);
    await write(trash,id+'.op.json',JSON.stringify({id,operation:'restore',state:'destination-verified',target,updatedAt:new Date().toISOString()},null,2));
    const check=await readDoc(documents,target);
    if(check!==content)throw new Error('Restored page verification failed; the Trash copy was retained.');
  }
  await trash.removeEntry(id+'.md').catch(error=>{if(!isNotFound(error))throw error;});
  await trash.removeEntry(id+'.json').catch(error=>{if(!isNotFound(error))throw error;});
  await trash.removeEntry(id+'.op.json').catch(error=>{if(!isNotFound(error))throw error;});
  return target;
  });
}
export async function permanentlyDeleteTrashItem(trash: FileSystemDirectoryHandle, id: string): Promise<void> {
  if(!/^[a-f0-9-]{16,64}$/i.test(id))throw new Error('Invalid Trash item.');
  try{await trash.removeEntry(id+'.md');}catch(error){if(!isNotFound(error))throw error;}
  try{await trash.removeEntry(id+'.json');}catch(error){if(!isNotFound(error))throw error;}
}
export async function addAsset(dir: FileSystemDirectoryHandle, file: File): Promise<string> {
  const original=file.name.split(/[\\\\/]/).pop()||'attachment';
  const cleaned=original.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,100)||'attachment';
  const dot=cleaned.lastIndexOf('.'),stem=dot>0?cleaned.slice(0,dot):cleaned,ext=dot>0?cleaned.slice(dot):'';
  return queueWrite(dir,'__asset-allocation__',()=>withWorkspaceLock('asset-allocation',async()=>{
    for(let n=1;n<10000;n++){
      const candidate=n===1?cleaned:stem+'-'+n+ext;
      if(await hasCaseInsensitiveEntry(dir,candidate))continue;
      await write(dir,candidate,file);
      const saved=await(await dir.getFileHandle(candidate)).getFile();
      if(saved.size!==file.size)throw new Error('Attachment verification failed.');
      return candidate;
    }
    throw new Error('Could not find an available attachment filename.');
  }));
}
export async function createFolder(dir: FileSystemDirectoryHandle, path: string): Promise<string> {
  const parts=path.split('/');
  if(parts.some(part=>!part.trim()))throw new Error('Enter a valid folder name.');
  const requested=parts.pop()!;
  const safe=requested.trim().replace(/[\\/:*?"<>|]/g,'-').replace(/^\\.+|\\.+$/g,'').slice(0,60);
  if(!safe)throw new Error('Enter a valid folder name.');
  const parent=await directoryForPath(dir,parts.join('/'),true);
  await withWorkspaceLock('folder:'+([...parts,safe].join('/')).normalize('NFC').toLocaleLowerCase('en-US'),async()=>{
    if(await hasCaseInsensitiveEntry(parent,safe))throw new Error('A folder or file with that name already exists.');
    await parent.getDirectoryHandle(safe,{create:true});
  });
  return [...parts,safe].join('/');
}
export function slug(title: string) { return (title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'untitled')+'.md'; }
export async function readWorkspaceSettings(wave: FileSystemDirectoryHandle): Promise<WorkspaceSettings> {
  let file:File;
  try{file=await(await wave.getFileHandle('settings.json')).getFile();}
  catch(error){if(isNotFound(error))return {format:'markdown',appearance:'system',favorites:[]};throw error;}
  let parsed:unknown;
  try{parsed=JSON.parse(await file.text());}catch{throw new Error('Workspace settings are corrupted. The original file was preserved; do not overwrite it until it is recovered.');}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Workspace settings have an invalid format. The original file was preserved.');
  return parsed as WorkspaceSettings;
}
export async function writeWorkspaceSettings(wave: FileSystemDirectoryHandle, settings: WorkspaceSettings): Promise<void> {
  const previous=settingsQueues.get(wave)??Promise.resolve();
  const current=previous.catch(()=>undefined).then(async()=>{await write(wave,'settings.json',JSON.stringify(settings,null,2));await updateManifest(wave);});
  settingsQueues.set(wave,current);
  try{await current;}finally{if(settingsQueues.get(wave)===current)settingsQueues.delete(wave);}
}
export async function backUpAndResetWorkspaceSettings(wave:FileSystemDirectoryHandle):Promise<string>{
  const original=await(await wave.getFileHandle('settings.json')).getFile();
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  let backupName='settings.corrupt-'+stamp+'.json',suffix=2;
  while(await existsFile(wave,backupName))backupName='settings.corrupt-'+stamp+'-'+suffix+++'.json';
  await write(wave,backupName,original);
  await writeWorkspaceSettings(wave,{format:'markdown',appearance:'system',favorites:[]});
  return backupName;
}
declare global {
  interface Window { showDirectoryPicker: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle> }
  interface FileSystemDirectoryHandle { entries(): AsyncIterableIterator<[string, FileSystemHandle]> }
}
