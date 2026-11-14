export interface DraftLike { updatedAt:number; id?:number; [key:string]:unknown }
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
