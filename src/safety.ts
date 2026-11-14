export interface DraftLike { updatedAt:number; id?:number }
export function newestDraft<T extends DraftLike>(records:T[]):T|undefined{
  return records.reduce<T|undefined>((latest,record)=>!latest||record.updatedAt>latest.updatedAt||(record.updatedAt===latest.updatedAt&&(record.id??0)>(latest.id??0))?record:latest,undefined);
}
export function isWorkspaceGenerationCurrent<T>(expectedGeneration:number,actualGeneration:number,expectedWorkspace:T,actualWorkspace:T|null):boolean{
  return expectedGeneration===actualGeneration&&expectedWorkspace===actualWorkspace;
}
export function conflictCopyPath(path:string):string{
  return path.replace(/\.md$/i,'')+'-conflict-copy.md';
}
export function relativeAssetPath(documentPath:string,assetName:string):string{
  const depth=documentPath.split('/').filter(Boolean).length;
  return '../'.repeat(depth)+'assets/'+assetName;
}

export function enqueueWorkspaceTask<T extends object>(queues:WeakMap<T,Promise<void>>,workspace:T,operation:()=>Promise<void>):Promise<void>{
  const previous=queues.get(workspace)??Promise.resolve();
  const current=previous.catch(()=>undefined).then(operation);
  queues.set(workspace,current);
  void current.finally(()=>{if(queues.get(workspace)===current)queues.delete(workspace);}).catch(()=>undefined);
  return current;
}

export async function flushUntilStable<T>(read:()=>{value:T;revision:number},persist:(value:T,revision:number)=>Promise<unknown>,isCurrent:()=>boolean=()=>true):Promise<void>{
  while(isCurrent()){
    const snapshot=read();
    await persist(snapshot.value,snapshot.revision);
    if(!isCurrent()||read().revision===snapshot.revision)return;
  }
}
