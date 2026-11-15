import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups,
  listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs,
  saveDoc, saveDocIfUnchanged, slug
} from '../../../src/storage.ts';
import { conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } from '../../../src/safety.ts';
import { MemoryDirectoryHandle, fixture } from '../../helpers/storage-fixtures.js';

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

test('backup holds the workspace operation lock until the snapshot is verified',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'locked.md','before backup');
  const file=await workspace.documents.getFileHandle('locked.md');
  const originalGetFile=file.getFile.bind(file);
  let calls=0,enteredResolve,releaseResolve;
  const entered=new Promise(resolve=>{enteredResolve=resolve;});
  const release=new Promise(resolve=>{releaseResolve=resolve;});
  file.getFile=async()=>{calls++;if(calls===2){enteredResolve();await release;}return originalGetFile();};
  const backupPromise=createBackup(workspace);
  await entered;
  let saveFinished=false;
  const savePromise=saveDoc(workspace.documents,'locked.md','after backup').then(()=>{saveFinished=true;});
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal(saveFinished,false,'workspace write must wait for the backup lock');
  releaseResolve();
  const backupName=await backupPromise;
  await savePromise;
  const backupDocs=await(await workspace.backups.getDirectoryHandle(backupName)).getDirectoryHandle('documents');
  assert.equal(await readDoc(backupDocs,'locked.md'),'before backup');
  assert.equal(await readDoc(workspace.documents,'locked.md'),'after backup');
});

test('backup rejects a copied file that differs even if source content is restored before the final scan',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'race.md','stable original');
  const file=await workspace.documents.getFileHandle('race.md');
  const originalGetFile=file.getFile.bind(file);
  let calls=0;
  file.getFile=async()=>{calls++;if(calls===2)return new File(['mutated content'],'race.md',{lastModified:1});return originalGetFile();};
  await assert.rejects(()=>createBackup(workspace),/copied snapshot differs/);
  assert.deepEqual(await listBackups(workspace.backups),[]);
});

test('backup and Wave-managed writes share one workspace-wide lock',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'locked.md','before backup');
  const file=await workspace.documents.getFileHandle('locked.md');
  const originalGetFile=file.getFile.bind(file);
  let calls=0,enteredResolve,releaseResolve;
  const entered=new Promise(resolve=>{enteredResolve=resolve;});
  const release=new Promise(resolve=>{releaseResolve=resolve;});
  file.getFile=async()=>{calls++;if(calls===2){enteredResolve();await release;}return originalGetFile();};
  const backupPromise=createBackup(workspace);
  await entered;
  let saveFinished=false;
  const savePromise=saveDoc(workspace.documents,'locked.md','after backup').then(()=>{saveFinished=true;});
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal(saveFinished,false,'document mutation must wait until backup verification completes');
  releaseResolve();
  const backupName=await backupPromise;
  await savePromise;
  const backupDocs=await(await workspace.backups.getDirectoryHandle(backupName)).getDirectoryHandle('documents');
  assert.equal(await readDoc(backupDocs,'locked.md'),'before backup');
  assert.equal(await readDoc(workspace.documents,'locked.md'),'after backup');
});

test('backup rejects a copied file that differs from its before-and-after source snapshots',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'race.md','stable original');
  const file=await workspace.documents.getFileHandle('race.md');
  const originalGetFile=file.getFile.bind(file);
  let calls=0;
  file.getFile=async()=>{calls++;if(calls===2)return new File(['mutated content'],'race.md',{lastModified:1});return originalGetFile();};
  await assert.rejects(()=>createBackup(workspace),/copied snapshot differs/);
  assert.deepEqual(await listBackups(workspace.backups),[]);
});
