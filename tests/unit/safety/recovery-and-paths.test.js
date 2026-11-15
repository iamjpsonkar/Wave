import test from 'node:test';
import assert from 'node:assert/strict';
import * as helpers from '../../helpers/storage-fixtures.js';
const { addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups, listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs, saveDoc, saveDocIfUnchanged, slug, conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } = helpers;

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
