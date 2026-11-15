import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups,
  listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs,
  saveDoc, saveDocIfUnchanged, slug
} from '../../../src/storage.ts';
import { conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } from '../../../src/safety.ts';
import { MemoryDirectoryHandle, fixture } from '../../helpers/storage-fixtures.js';

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

test('asset lookup permission errors are not treated as free filenames',async()=>{
  const denied=new MemoryDirectoryHandle('assets');
  denied.getFileHandle=async()=>{throw new DOMException('Denied','NotAllowedError');};
  await assert.rejects(()=>addAsset(denied,new File(['data'],'diagram.png',{type:'image/png'})),/Denied/);
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
