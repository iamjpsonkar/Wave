import test from 'node:test';
import assert from 'node:assert/strict';
import * as helpers from '../../helpers/storage-fixtures.js';
const { addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups, listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs, saveDoc, saveDocIfUnchanged, slug, conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } = helpers;

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
