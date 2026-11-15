import test from 'node:test';
import assert from 'node:assert/strict';
import { conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } from '../../../src/safety.ts';

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
