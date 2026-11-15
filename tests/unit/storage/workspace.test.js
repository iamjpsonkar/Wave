import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups,
  MAX_ATTACHMENT_SIZE_BYTES, validateAttachmentFile, validateAttachmentContent,
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
  await assert.rejects(()=>addAsset(denied,new File([new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])],'diagram.png',{type:'image/png'})),/Denied/);
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

test('attachment validation rejects active content, metadata mismatches, spoofed signatures and oversized files',async()=>{
  const {workspace}=await fixture();
  const expectReject = async (label, operation, pattern) => {
    console.log(`[attachment-test] START ${label}`);
    try { await assert.rejects(operation, pattern); console.log(`[attachment-test] PASS ${label}`); }
    catch (error) { console.error(`[attachment-test] FAIL ${label}`, { expected: String(pattern), errorName: error?.name, errorMessage: error?.message }); throw error; }
  };
  const expectAccept = async (label, operation) => {
    console.log(`[attachment-test] START ${label}`);
    try { await assert.doesNotReject(operation); console.log(`[attachment-test] PASS ${label}`); }
    catch (error) { console.error(`[attachment-test] FAIL ${label}`, { errorName: error?.name, errorMessage: error?.message }); throw error; }
  };
  const svg=new File(['<svg onload="alert(1)"></svg>'],'drawing.svg',{type:'image/svg+xml'});
  assert.throws(()=>validateAttachmentFile(svg),/executable or active content/);
  await expectReject('blocked SVG extension/MIME',()=>addAsset(workspace.assets,svg),/executable or active content/);
  const oversized={name:'large.bin',size:MAX_ATTACHMENT_SIZE_BYTES+1,type:'application/octet-stream'};
  assert.throws(()=>validateAttachmentFile(oversized),/25 MiB or smaller/);
  assert.throws(()=>validateAttachmentFile(new File(['not a png'],'photo.png',{type:'text/plain'})),/extension and MIME type do not match/);
  const spoofedSvg = new File(['<svg onload="alert(1)"></svg>'],'spoof.png',{type:'image/png'});
  await expectReject('SVG payload declared as PNG',()=>addAsset(workspace.assets,spoofedSvg),/active SVG or HTML content/);
  const renamedSvg = new File(['<svg onload="alert(1)"></svg>'],'renamed.png',{type:'image/png'});
  await expectReject('content-only SVG validation',()=>validateAttachmentContent(renamedSvg),/active SVG or HTML content/);
  await expectReject('invalid PDF signature',()=>addAsset(workspace.assets,new File(['not pdf'],'document.pdf',{type:'application/pdf'})),/content does not match/);
  const zipBytes=new Uint8Array([0x50,0x4b,0x03,0x04,0,0,0,0]);
  await expectReject('ZIP payload declared as text/plain',()=>addAsset(workspace.assets,new File([zipBytes],'notes.txt',{type:'text/plain'})),/content does not match/);
  await expectAccept('ZIP payload declared as application/zip',()=>addAsset(workspace.assets,new File([zipBytes],'archive.zip',{type:'application/zip'})));
  const genuinePng=new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]);
  await expectAccept('valid PNG signature',()=>addAsset(workspace.assets,new File([genuinePng],'valid.png',{type:'image/png'})));
  await expectAccept('unrecognized benign text payload',()=>addAsset(workspace.assets,new File(['safe text'],'notes.txt',{type:'text/plain'})));
});
