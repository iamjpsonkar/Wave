import test from 'node:test';
import assert from 'node:assert/strict';
import * as helpers from '../../helpers/storage-fixtures.js';
const { addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups, listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs, saveDoc, saveDocIfUnchanged, slug, conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } = helpers;

test('backup is listed only after its completion marker is written',async()=>{
  const {workspace}=await fixture();
  await saveDoc(workspace.documents,'A.md','alpha');
  const name=await createBackup(workspace);
  const backups=await listBackups(workspace.backups);
  assert.equal(backups.length,1);
  assert.equal(backups[0].name,name);
  assert.equal(backups[0].documents,1);
});

test('incomplete backup snapshots are not offered for restore',async()=>{
  const {workspace}=await fixture();
  workspace.assets.entries=async function*(){throw new Error('simulated read failure');};
  await assert.rejects(()=>createBackup(workspace),/simulated read failure/);
  assert.deepEqual(await listBackups(workspace.backups),[]);
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
