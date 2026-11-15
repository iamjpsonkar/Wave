import test from 'node:test';
import assert from 'node:assert/strict';
import * as helpers from '../../helpers/storage-fixtures.js';
const { addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups, listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs, saveDoc, saveDocIfUnchanged, slug, conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } = helpers;

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
