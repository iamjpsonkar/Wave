import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups,
  listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs,
  saveDoc, saveDocIfUnchanged, slug
} from '../src/storage.ts';
import { conflictCopyPath, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } from '../src/safety.ts';

class MemoryFileHandle {
  constructor(name, data='') { this.kind='file'; this.name=name; this.data=data; this.lastModified=Date.now(); }
  async getFile() {
    const data=this.data, name=this.name, lastModified=this.lastModified;
    const file=new File([data],name,{lastModified});
    return file;
  }
  async createWritable() {
    let pending='';
    return {
      write:async value=>{pending=typeof value==='string'?value:await value.text();},
      close:async()=>{this.data=pending;this.lastModified=Date.now();},
      abort:async()=>{}
    };
  }
}
class MemoryDirectoryHandle {
  constructor(name='root'){this.kind='directory';this.name=name;this.entriesMap=new Map();}
  async getFileHandle(name,options={}) {
    const current=this.entriesMap.get(name);
    if(current&&current.kind==='directory')throw new DOMException('Type mismatch','TypeMismatchError');
    if(!current&&!options.create)throw new DOMException('Missing file','NotFoundError');
    if(!current){const created=new MemoryFileHandle(name);this.entriesMap.set(name,created);return created;}
    return current;
  }
  async getDirectoryHandle(name,options={}) {
    const current=this.entriesMap.get(name);
    if(current&&current.kind!=='directory')throw new DOMException('Type mismatch','TypeMismatchError');
    if(!current&&!options.create)throw new DOMException('Missing directory','NotFoundError');
    if(!current){const created=new MemoryDirectoryHandle(name);this.entriesMap.set(name,created);return created;}
    return current;
  }
  async removeEntry(name){if(!this.entriesMap.has(name))throw new DOMException('Missing entry','NotFoundError');this.entriesMap.delete(name);}
  async *entries(){for(const item of this.entriesMap.entries())yield item;}
}
async function fixture(){
  const root=new MemoryDirectoryHandle('Test Workspace');
  const workspace=await openWorkspace(root);
  return {root,workspace};
}

test('slug produces a safe Markdown filename',()=>{
  assert.equal(slug('Project Plan'),'project-plan.md');
  assert.equal(slug('!!!'),'untitled.md');
});
test('createDoc never overwrites a page with the same requested name',async()=>{
  const {workspace}=await fixture();
  const first=await createDoc(workspace.documents,'Notes.md','first');
  const second=await createDoc(workspace.documents,'Notes.md','second');
  assert.equal(first,'Notes.md');
  assert.equal(second,'Notes-2.md');
  assert.equal(await readDoc(workspace.documents,first),'first');
  assert.equal(await readDoc(workspace.documents,second),'second');
});
test('Trash restore chooses an unused path and preserves existing files',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'Notes.md','new page');
  const id='aabbccdd-1122-3344-5566-77889900aabb';
  await workspace.trash.getFileHandle(id+'.md',{create:true}).then(async h=>{const w=await h.createWritable();await w.write('trashed page');await w.close();});
  const meta={id,title:'Old notes',originalPath:'Notes.md',deletedAt:new Date().toISOString()};
  await workspace.trash.getFileHandle(id+'.json',{create:true}).then(async h=>{const w=await h.createWritable();await w.write(JSON.stringify(meta));await w.close();});
  const restored=await restoreTrashItem(workspace.trash,workspace.documents,id);
  assert.equal(restored,'Notes-2.md');
  assert.equal(await readDoc(workspace.documents,'Notes.md'),'new page');
  assert.equal(await readDoc(workspace.documents,restored),'trashed page');
});
test('malformed Trash metadata does not prevent listing valid entries',async()=>{
  const {workspace}=await fixture();
  const id='aabbccdd-1122-3344-5566-77889900aabb';
  for(const [name,value] of [[id+'.md','valid'],[id+'.json',JSON.stringify({id,title:'Valid',originalPath:'Valid.md',deletedAt:new Date().toISOString()})],['broken.json','{bad'],['orphan.md','orphan']]){
    const h=await workspace.trash.getFileHandle(name,{create:true}),w=await h.createWritable();await w.write(value);await w.close();
  }
  const listing=await listTrashDetailed(workspace.trash);
  assert.equal(listing.items.length,1);
  assert.ok(listing.issues.some(issue=>issue.includes('broken.json')));
  assert.ok(listing.issues.some(issue=>issue.includes('orphan.md')));
});
test('backup is listed only after its completion marker is written',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'A.md','alpha');
  const name=await createBackup(workspace);
  const backups=await listBackups(workspace.backups);
  assert.equal(backups.length,1);
  assert.equal(backups[0].name,name);
  assert.equal(backups[0].documents,1);
});
test('saveDocIfUnchanged refuses to overwrite external edits',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'Notes.md','original');
  await saveDoc(workspace.documents,'Notes.md','changed externally');
  await assert.rejects(()=>saveDocIfUnchanged(workspace.documents,'Notes.md','my draft','original'),/changed outside Wave/);
  assert.equal(await readDoc(workspace.documents,'Notes.md'),'changed externally');
});
test('createFolder returns full nested path and rejects duplicate names',async()=>{
  const {workspace}=await fixture();
  assert.equal(await createFolder(workspace.documents,'Projects/Backend'),'Projects/Backend');
  await assert.rejects(()=>createFolder(workspace.documents,'Projects/Backend'),/already exists/);
});
test('asset lookup permission errors are not treated as free filenames',async()=>{
  const denied=new MemoryDirectoryHandle('assets');
  denied.getFileHandle=async()=>{throw new DOMException('Denied','NotAllowedError');};
  await assert.rejects(()=>addAsset(denied,new File(['data'],'diagram.png',{type:'image/png'})),/Denied/);
});

test('concurrent page creation and case-only names never overwrite',async()=>{
  const {workspace}=await fixture();
  const [one,two]=await Promise.all([
    createDoc(workspace.documents,'Notes.md','first'),
    createDoc(workspace.documents,'notes.md','second')
  ]);
  assert.notEqual(one.toLocaleLowerCase(),two.toLocaleLowerCase());
  assert.equal(await readDoc(workspace.documents,one),'first');
  assert.equal(await readDoc(workspace.documents,two),'second');
});
test('concurrent same-name asset uploads receive distinct filenames',async()=>{
  const {workspace}=await fixture();
  const [one,two]=await Promise.all([
    addAsset(workspace.assets,new File(['one'],'photo.png',{type:'image/png'})),
    addAsset(workspace.assets,new File(['two'],'photo.png',{type:'image/png'}))
  ]);
  assert.notEqual(one,two);
  assert.equal(await(await(await workspace.assets.getFileHandle(one)).getFile()).text(),'one');
  assert.equal(await(await(await workspace.assets.getFileHandle(two)).getFile()).text(),'two');
});
test('incomplete backup snapshots are not offered for restore',async()=>{
  const {workspace}=await fixture();
  workspace.assets.entries=async function*(){throw new Error('simulated read failure');};
  await assert.rejects(()=>createBackup(workspace),/simulated read failure/);
  assert.deepEqual(await listBackups(workspace.backups),[]);
});

test('Trash inspection completes an interrupted verified move safely',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'Interrupted.md','recover me');
  const id='11223344-5566-7788-9900-aabbccddeeff';
  const metadata={id,title:'Interrupted',originalPath:'Interrupted.md',deletedAt:new Date().toISOString()};
  for(const [name,value] of [[id+'.md','recover me'],[id+'.json',JSON.stringify(metadata)],[id+'.op.json',JSON.stringify({id,operation:'trash',state:'verified',originalPath:'Interrupted.md'})]]){
    const handle=await workspace.trash.getFileHandle(name,{create:true}),w=await handle.createWritable();await w.write(value);await w.close();
  }
  const listing=await listTrashDetailed(workspace.trash,workspace.documents);
  assert.equal(listing.items.length,1);
  await assert.rejects(()=>readDoc(workspace.documents,'Interrupted.md'),/Missing file/);
  await assert.rejects(()=>workspace.trash.getFileHandle(id+'.op.json'),/Missing file/);
});
test('Trash inspection rolls back an incomplete copy when original remains',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'Safe.md','original safe');
  const id='22334455-6677-8899-aabb-ccddeeff0011';
  const h=await workspace.trash.getFileHandle(id+'.md',{create:true}),w=await h.createWritable();await w.write('partial');await w.close();
  const op=await workspace.trash.getFileHandle(id+'.op.json',{create:true}),ow=await op.createWritable();await ow.write(JSON.stringify({id,operation:'trash',state:'content-copied',originalPath:'Safe.md'}));await ow.close();
  const listing=await listTrashDetailed(workspace.trash,workspace.documents);
  assert.equal(await readDoc(workspace.documents,'Safe.md'),'original safe');
  assert.equal(listing.items.length,0);
  assert.equal(listing.issues.length,0);
});

test('corrupt settings are preserved before a safe reset',async()=>{
  const {workspace}=await fixture();
  const handle=await workspace.wave.getFileHandle('settings.json');
  const writable=await handle.createWritable();await writable.write('{broken');await writable.close();
  await assert.rejects(()=>readWorkspaceSettings(workspace.wave),/corrupted/);
  const backupName=await backUpAndResetWorkspaceSettings(workspace.wave);
  assert.equal(await(await(await workspace.wave.getFileHandle(backupName)).getFile()).text(),'{broken');
  const settings=await readWorkspaceSettings(workspace.wave);
  assert.deepEqual(settings.favorites,[]);
});


test('concurrent backups reserve distinct destination folders',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'A.md','alpha');
  const [first,second]=await Promise.all([createBackup(workspace),createBackup(workspace)]);
  assert.notEqual(first,second);
  assert.equal((await listBackups(workspace.backups)).length,2);
});
test('unique directory allocation never reuses an existing file or folder',async()=>{
  const {root}=await fixture();
  const first=await createUniqueDirectory(root,'restore-target','test-restore-allocation');
  const second=await createUniqueDirectory(root,'restore-target','test-restore-allocation');
  assert.equal(first.name,'restore-target');
  assert.equal(second.name,'restore-target-2');
  assert.equal((await root.getDirectoryHandle(first.name)).name,'restore-target');
});
test('backup restore skips a pre-existing destination and preserves it',async()=>{
  const {root,workspace}=await fixture();
  await saveDoc(workspace.documents,'A.md','alpha');
  const backupName=await createBackup(workspace);
  const OriginalDate=globalThis.Date;
  const fixed='2026-11-14T12:00:00.000Z';
  globalThis.Date=class extends OriginalDate{
    constructor(...args){super(...(args.length?args:[fixed]));}
    static now(){return new OriginalDate(fixed).getTime();}
  };
  try{
    const base='Test Workspace-restore-'+fixed.replace(/[:.]/g,'-');
    const existing=await root.getDirectoryHandle(base,{create:true});
    const sentinel=await existing.getFileHandle('keep.txt',{create:true}),writer=await sentinel.createWritable();
    await writer.write('do not overwrite');await writer.close();
    const restored=await restoreBackupToNewWorkspace(workspace,backupName);
    assert.equal(restored,base+'-2');
    assert.equal(await(await(await existing.getFileHandle('keep.txt')).getFile()).text(),'do not overwrite');
    const restoredWave=await(await root.getDirectoryHandle(restored)).getDirectoryHandle('.wave');
    assert.equal(await readDoc(await restoredWave.getDirectoryHandle('documents'),'A.md'),'alpha');
  }finally{globalThis.Date=OriginalDate;}
});
test('failed backup restore is marked and cannot be opened as a workspace',async()=>{
  const {root,workspace}=await fixture();
  await saveDoc(workspace.documents,'A.md','alpha');
  const backupName=await createBackup(workspace);
  const source=await workspace.backups.getDirectoryHandle(backupName);
  const sourceDocs=await source.getDirectoryHandle('documents');
  sourceDocs.entries=async function*(){throw new Error('simulated restore copy failure');};
  await assert.rejects(()=>restoreBackupToNewWorkspace(workspace,backupName),/simulated restore copy failure/);
  const targets=[];
  for await(const [name,handle] of root.entries())if(handle.kind==='directory'&&name.includes('-restore-'))targets.push({name,handle});
  assert.equal(targets.length,1);
  const wave=await targets[0].handle.getDirectoryHandle('.wave');
  const marker=JSON.parse(await(await(await wave.getFileHandle('restore-status.json')).getFile()).text());
  assert.equal(marker.status,'failed');
  await assert.rejects(()=>openWorkspace(targets[0].handle),/incomplete backup restore/);
});
test('concurrent restore of one Trash item creates only one page',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'Notes.md','restore exactly once');
  await moveDocToTrash(workspace.documents,workspace.trash,'Notes.md');
  let id='';
  for await(const [name,handle] of workspace.trash.entries())if(handle.kind==='file'&&name.endsWith('.json'))id=name.slice(0,-5);
  assert.ok(id);
  const results=await Promise.allSettled([
    restoreTrashItem(workspace.trash,workspace.documents,id),
    restoreTrashItem(workspace.trash,workspace.documents,id)
  ]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
  assert.equal((await listDocs(workspace.documents)).length,1);
  assert.equal(await readDoc(workspace.documents,'Notes.md'),'restore exactly once');
});
test('document titles, Trash titles and search snippets parse real newlines',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'actual-name.md','# Human Title\n\nbody text with phrase');
  const docs=await listDocs(workspace.documents);
  assert.equal(docs[0].title,'Human Title');
  const matches=await searchDocs(workspace.documents,'phrase');
  assert.equal(matches.length,1);
  assert.ok(!matches[0].snippet.includes('\\n'));
  await moveDocToTrash(workspace.documents,workspace.trash,'actual-name.md');
  const trash=await listTrashDetailed(workspace.trash);
  assert.equal(trash.items[0].title,'Human Title');
});
test('conflict-copy path strips only a Markdown extension',()=>{
  assert.equal(conflictCopyPath('folder/Notes.md'),'folder/Notes-conflict-copy.md');
  assert.equal(conflictCopyPath('folder/Notes.MD'),'folder/Notes-conflict-copy.md');
});
test('workspace generation guards reject stale asynchronous completions',()=>{
  const workspaceA={name:'A'},workspaceB={name:'B'};
  assert.equal(isWorkspaceGenerationCurrent(2,2,workspaceA,workspaceA),true);
  assert.equal(isWorkspaceGenerationCurrent(1,2,workspaceA,workspaceB),false);
  assert.equal(isWorkspaceGenerationCurrent(2,2,workspaceA,workspaceB),false);
});
test('draft journal chooses the newest duplicate recovery record',()=>{
  const records=[{id:1,updatedAt:100,content:'old'},{id:3,updatedAt:200,content:'new'},{id:2,updatedAt:200,content:'tie'}];
  assert.equal(newestDraft(records).content,'new');
});
test('attachment links resolve from root and nested document folders',()=>{
  assert.equal(relativeAssetPath('Notes.md','image.png'),'../assets/image.png');
  assert.equal(relativeAssetPath('Projects/Notes.md','image.png'),'../../assets/image.png');
  assert.equal(relativeAssetPath('Projects/Backend/Notes.md','image.png'),'../../../assets/image.png');
});
