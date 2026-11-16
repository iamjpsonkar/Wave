import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups,
  listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs,
  saveDoc, saveDocIfUnchanged, slug
} from '../../../src/storage.ts';
import { conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } from '../../../src/safety.ts';
import { MemoryDirectoryHandle, fixture } from '../../helpers/storage-fixtures.js';

function injectWritableFailure(directory, filename, phase) {
  let triggered = false;
  let aborted = false;
  const originalGetFileHandle = directory.getFileHandle.bind(directory);
  const patchedHandles = new WeakSet();
  directory.getFileHandle = async (name, options = {}) => {
    const handle = await originalGetFileHandle(name, options);
    if (name !== filename || patchedHandles.has(handle)) return handle;
    patchedHandles.add(handle);
    const originalCreateWritable = handle.createWritable.bind(handle);
    handle.createWritable = async () => {
      const writer = await originalCreateWritable();
      return {
        write: async value => {
          if (!triggered && phase === 'write') {
            triggered = true;
            throw new Error(`injected write failure for ${filename}`);
          }
          return writer.write(value);
        },
        close: async () => {
          if (!triggered && phase === 'close') {
            triggered = true;
            throw new Error(`injected close failure for ${filename}`);
          }
          return writer.close();
        },
        abort: async () => {
          aborted = true;
          return writer.abort();
        }
      };
    };
    return handle;
  };
  return { wasTriggered: () => triggered, wasAborted: () => aborted };
}

function injectBackupCopyFailure(workspace, filename, phase) {
  let injection = null;
  const originalGetDirectoryHandle = workspace.backups.getDirectoryHandle.bind(workspace.backups);
  workspace.backups.getDirectoryHandle = async (name, options = {}) => {
    const backup = await originalGetDirectoryHandle(name, options);
    if (!injection && name.startsWith('backup-')) {
      const originalGetChild = backup.getDirectoryHandle.bind(backup);
      backup.getDirectoryHandle = async (childName, childOptions = {}) => {
        const child = await originalGetChild(childName, childOptions);
        if (!injection && childName === 'documents') {
          injection = injectWritableFailure(child, filename, phase);
        }
        return child;
      };
    }
    return backup;
  };
  return () => injection;
}

function injectRestoreCopyFailure(workspace, filename, phase) {
  let injection = null;
  const originalGetDirectoryHandle = workspace.root.getDirectoryHandle.bind(workspace.root);
  workspace.root.getDirectoryHandle = async (name, options = {}) => {
    const target = await originalGetDirectoryHandle(name, options);
    if (!injection && name.includes('-restore-')) {
      const originalGetWave = target.getDirectoryHandle.bind(target);
      target.getDirectoryHandle = async (childName, childOptions = {}) => {
        const wave = await originalGetWave(childName, childOptions);
        if (childName === '.wave') {
          const originalGetStorage = wave.getDirectoryHandle.bind(wave);
          wave.getDirectoryHandle = async (storageName, storageOptions = {}) => {
            const storage = await originalGetStorage(storageName, storageOptions);
            if (!injection && storageName === 'documents') {
              injection = injectWritableFailure(storage, filename, phase);
            }
            return storage;
          };
        }
        return wave;
      };
    }
    return target;
  };
  return () => injection;
}


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
  const snapshot=await(await workspace.backups.getDirectoryHandle(name)).getDirectoryHandle('documents');
  assert.equal(await readDoc(snapshot,'A.md'),'alpha');
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

test('restore rejects backup mutation during copying and marks the destination incomplete',async()=>{
  const {root,workspace}=await fixture();
  await saveDoc(workspace.documents,'A.md','alpha');
  const backupName=await createBackup(workspace);
  const source=await workspace.backups.getDirectoryHandle(backupName);
  const sourceDocs=await source.getDirectoryHandle('documents');
  const file=await sourceDocs.getFileHandle('A.md');
  const originalGetFile=file.getFile.bind(file);
  let calls=0;
  file.getFile=async()=>{
    calls++;
    if(calls===2){
      const copiedRead=await originalGetFile();
      file.data='changed by external writer during restore';
      file.lastModified++;
      return copiedRead;
    }
    return originalGetFile();
  };
  await assert.rejects(()=>restoreBackupToNewWorkspace(workspace,backupName),/Backup files changed during restore/);
  const targets=[];
  for await(const [name,handle] of root.entries())if(handle.kind==='directory'&&name.includes('-restore-'))targets.push({name,handle});
  assert.equal(targets.length,1);
  const wave=await targets[0].handle.getDirectoryHandle('.wave');
  const marker=JSON.parse(await(await(await wave.getFileHandle('restore-status.json')).getFile()).text());
  assert.equal(marker.status,'failed');
  await assert.rejects(()=>openWorkspace(targets[0].handle),/incomplete backup restore/);
});


test('backup copy write failure aborts the writer and leaves the snapshot unlisted', async () => {
  const { workspace } = await fixture();
  await saveDoc(workspace.documents, 'A.md', 'source remains intact');
  const getInjection = injectBackupCopyFailure(workspace, 'A.md', 'write');

  await assert.rejects(() => createBackup(workspace), /injected write failure for A\.md/);

  const injection = getInjection();
  assert.ok(injection?.wasTriggered());
  assert.ok(injection?.wasAborted());
  assert.equal(await readDoc(workspace.documents, 'A.md'), 'source remains intact');
  assert.deepEqual(await listBackups(workspace.backups), []);

  const failed = [];
  for await (const [name, handle] of workspace.backups.entries()) {
    if (handle.kind !== 'directory' || !name.startsWith('backup-')) continue;
    const status = JSON.parse(await (await (await handle.getFileHandle('backup-status.json')).getFile()).text());
    failed.push(status.status);
  }
  assert.deepEqual(failed, ['failed']);
});

test('backup copy close failure aborts the writer and leaves the snapshot unlisted', async () => {
  const { workspace } = await fixture();
  await saveDoc(workspace.documents, 'A.md', 'source remains intact');
  const getInjection = injectBackupCopyFailure(workspace, 'A.md', 'close');

  await assert.rejects(() => createBackup(workspace), /injected close failure for A\.md/);

  const injection = getInjection();
  assert.ok(injection?.wasTriggered());
  assert.ok(injection?.wasAborted());
  assert.equal(await readDoc(workspace.documents, 'A.md'), 'source remains intact');
  assert.deepEqual(await listBackups(workspace.backups), []);

  const failed = [];
  for await (const [name, handle] of workspace.backups.entries()) {
    if (handle.kind !== 'directory' || !name.startsWith('backup-')) continue;
    const status = JSON.parse(await (await (await handle.getFileHandle('backup-status.json')).getFile()).text());
    failed.push(status.status);
  }
  assert.deepEqual(failed, ['failed']);
});

test('restore copy write failure aborts the writer and blocks the incomplete destination', async () => {
  const { root, workspace } = await fixture();
  await saveDoc(workspace.documents, 'A.md', 'verified backup source');
  const backupName = await createBackup(workspace);
  const getInjection = injectRestoreCopyFailure(workspace, 'A.md', 'write');

  await assert.rejects(
    () => restoreBackupToNewWorkspace(workspace, backupName),
    /injected write failure for A\.md/
  );

  const injection = getInjection();
  assert.ok(injection?.wasTriggered());
  assert.ok(injection?.wasAborted());
  const source = await workspace.backups.getDirectoryHandle(backupName);
  assert.equal(await readDoc(await source.getDirectoryHandle('documents'), 'A.md'), 'verified backup source');

  const targets = [];
  for await (const [name, handle] of root.entries()) {
    if (handle.kind === 'directory' && name.includes('-restore-')) targets.push(handle);
  }
  assert.equal(targets.length, 1);
  const wave = await targets[0].getDirectoryHandle('.wave');
  const marker = JSON.parse(await (await (await wave.getFileHandle('restore-status.json')).getFile()).text());
  assert.equal(marker.status, 'failed');
  await assert.rejects(() => openWorkspace(targets[0]), /incomplete backup restore/);
});

test('restore copy close failure aborts the writer and blocks the incomplete destination', async () => {
  const { root, workspace } = await fixture();
  await saveDoc(workspace.documents, 'A.md', 'verified backup source');
  const backupName = await createBackup(workspace);
  const getInjection = injectRestoreCopyFailure(workspace, 'A.md', 'close');

  await assert.rejects(
    () => restoreBackupToNewWorkspace(workspace, backupName),
    /injected close failure for A\.md/
  );

  const injection = getInjection();
  assert.ok(injection?.wasTriggered());
  assert.ok(injection?.wasAborted());
  const source = await workspace.backups.getDirectoryHandle(backupName);
  assert.equal(await readDoc(await source.getDirectoryHandle('documents'), 'A.md'), 'verified backup source');

  const targets = [];
  for await (const [name, handle] of root.entries()) {
    if (handle.kind === 'directory' && name.includes('-restore-')) targets.push(handle);
  }
  assert.equal(targets.length, 1);
  const wave = await targets[0].getDirectoryHandle('.wave');
  const marker = JSON.parse(await (await (await wave.getFileHandle('restore-status.json')).getFile()).text());
  assert.equal(marker.status, 'failed');
  await assert.rejects(() => openWorkspace(targets[0]), /incomplete backup restore/);
});



function mutateAfterInitialSnapshot(directory, mutation) {
  const originalEntries = directory.entries.bind(directory);
  let enumerations = 0;
  directory.entries = async function* () {
    enumerations++;
    if (enumerations === 2) await mutation();
    yield* originalEntries();
  };
  return () => enumerations;
}

async function renameMemoryFile(directory, from, to) {
  const source = await directory.getFileHandle(from);
  const data = await (await source.getFile()).text();
  await directory.removeEntry(from);
  const destination = await directory.getFileHandle(to, { create: true });
  const writer = await destination.createWritable();
  await writer.write(data);
  await writer.close();
}


test('backup rejects an external document rename between snapshot and copy', async () => {
  const { workspace } = await fixture();
  await saveDoc(workspace.documents, 'A.md', 'original content');
  const enumerations = mutateAfterInitialSnapshot(workspace.documents, () => renameMemoryFile(workspace.documents, 'A.md', 'Renamed.md'));

  await assert.rejects(() => createBackup(workspace), /Workspace files changed during backup/);

  assert.equal(enumerations(), 3);
  assert.equal(await readDoc(workspace.documents, 'Renamed.md'), 'original content');
  assert.deepEqual(await listBackups(workspace.backups), []);
  const statuses = [];
  for await (const [name, handle] of workspace.backups.entries()) {
    if (handle.kind !== 'directory' || !name.startsWith('backup-')) continue;
    statuses.push(JSON.parse(await (await (await handle.getFileHandle('backup-status.json')).getFile()).text()).status);
  }
  assert.deepEqual(statuses, ['failed']);
});

test('backup rejects an external document deletion between snapshot and copy', async () => {
  const { workspace } = await fixture();
  await saveDoc(workspace.documents, 'A.md', 'externally deleted content');
  const enumerations = mutateAfterInitialSnapshot(workspace.documents, () => workspace.documents.removeEntry('A.md'));

  await assert.rejects(() => createBackup(workspace), /Workspace files changed during backup/);

  assert.equal(enumerations(), 3);
  await assert.rejects(() => readDoc(workspace.documents, 'A.md'), /Missing file/);
  assert.deepEqual(await listBackups(workspace.backups), []);
});

test('restore rejects an external backup document rename during copying', async () => {
  const { root, workspace } = await fixture();
  await saveDoc(workspace.documents, 'A.md', 'verified backup content');
  const backupName = await createBackup(workspace);
  const source = await workspace.backups.getDirectoryHandle(backupName);
  const sourceDocuments = await source.getDirectoryHandle('documents');
  const enumerations = mutateAfterInitialSnapshot(sourceDocuments, () => renameMemoryFile(sourceDocuments, 'A.md', 'Renamed.md'));

  await assert.rejects(() => restoreBackupToNewWorkspace(workspace, backupName), /Backup files changed during restore/);

  assert.equal(enumerations(), 3);
  assert.equal(await readDoc(sourceDocuments, 'Renamed.md'), 'verified backup content');
  const targets = [];
  for await (const [name, handle] of root.entries()) {
    if (handle.kind === 'directory' && name.includes('-restore-')) targets.push(handle);
  }
  assert.equal(targets.length, 1);
  const wave = await targets[0].getDirectoryHandle('.wave');
  const marker = JSON.parse(await (await (await wave.getFileHandle('restore-status.json')).getFile()).text());
  assert.equal(marker.status, 'failed');
  await assert.rejects(() => openWorkspace(targets[0]), /incomplete backup restore/);
});

test('restore rejects an external backup document deletion during copying', async () => {
  const { root, workspace } = await fixture();
  await saveDoc(workspace.documents, 'A.md', 'verified backup content');
  const backupName = await createBackup(workspace);
  const source = await workspace.backups.getDirectoryHandle(backupName);
  const sourceDocuments = await source.getDirectoryHandle('documents');
  const enumerations = mutateAfterInitialSnapshot(sourceDocuments, () => sourceDocuments.removeEntry('A.md'));

  await assert.rejects(
    () => restoreBackupToNewWorkspace(workspace, backupName),
    /Backup files changed during restore|Backup contents do not match the completion manifest/
  );

  // The manifest comparison can detect a deletion before the later tree comparison runs.
  assert.equal(enumerations(), 2);
  await assert.rejects(() => readDoc(sourceDocuments, 'A.md'), /Missing file/);
  const targets = [];
  for await (const [name, handle] of root.entries()) {
    if (handle.kind === 'directory' && name.includes('-restore-')) targets.push(handle);
  }
  assert.equal(targets.length, 1);
  const wave = await targets[0].getDirectoryHandle('.wave');
  const marker = JSON.parse(await (await (await wave.getFileHandle('restore-status.json')).getFile()).text());
  assert.equal(marker.status, 'failed');
  await assert.rejects(() => openWorkspace(targets[0]), /incomplete backup restore/);
});
