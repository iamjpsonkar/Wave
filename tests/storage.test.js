import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addAsset, createBackup, createDoc, createFolder, listBackups,
  listTrashDetailed, openWorkspace, readDoc, restoreTrashItem,
  saveDoc, saveDocIfUnchanged, slug
} from '../src/storage.ts';

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
