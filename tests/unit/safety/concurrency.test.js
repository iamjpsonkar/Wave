import test from 'node:test';
import assert from 'node:assert/strict';
import * as helpers from '../../helpers/storage-fixtures.js';
const { addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups, listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs, saveDoc, saveDocIfUnchanged, slug, conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } = helpers;

test('revision flush persists edits typed while an earlier save is pending',async()=>{
  let revision=1,content='first',writes=0;
  const saved=[];
  await flushUntilStable(()=>({value:content,revision}),async(value)=>{writes++;saved.push(value);if(writes===1){content='typed during save';revision++;}},()=>true);
  assert.deepEqual(saved,['first','typed during save']);
  assert.equal(writes,2);
});

test('workspace task queues serialize each workspace independently',async()=>{
  const queues=new WeakMap(),workspaceA={},workspaceB={},events=[];
  let release;
  const blocker=new Promise(resolve=>{release=resolve;});
  const first=enqueueWorkspaceTask(queues,workspaceA,async()=>{events.push('a1-start');await blocker;events.push('a1-end');});
  const second=enqueueWorkspaceTask(queues,workspaceA,async()=>{events.push('a2');});
  const other=enqueueWorkspaceTask(queues,workspaceB,async()=>{events.push('b1');});
  await other;
  assert.deepEqual(events,['a1-start','b1']);
  release();
  await Promise.all([first,second]);
  assert.deepEqual(events,['a1-start','b1','a1-end','a2']);
});
