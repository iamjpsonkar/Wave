import {
  addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups,
  listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs,
  saveDoc, saveDocIfUnchanged, slug
} from '../../src/storage.ts';
import { conflictCopyPath, enqueueWorkspaceTask, flushUntilStable, isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath } from '../../src/safety.ts';

export {
  addAsset, backUpAndResetWorkspaceSettings, createBackup, createDoc, createFolder, createUniqueDirectory, listBackups,
  listTrashDetailed, openWorkspace, readDoc, readWorkspaceSettings, restoreBackupToNewWorkspace, restoreTrashItem, moveDocToTrash, listDocs, searchDocs,
  saveDoc, saveDocIfUnchanged, slug, conflictCopyPath, enqueueWorkspaceTask, flushUntilStable,
  isWorkspaceGenerationCurrent, newestDraft, relativeAssetPath
};

export class MemoryFileHandle {
  constructor(name, data='') { this.kind='file'; this.name=name; this.data=data; this.lastModified=Date.now(); }
  async getFile() {
    const data=this.data, name=this.name, lastModified=this.lastModified;
    return new File([data],name,{lastModified});
  }
  async createWritable() {
    let pending='';
    return {
      write:async value=>{pending=typeof value==='string'?value:await value.text();},
      close:async()=>{this.data=pending;this.lastModified=Date.now();},
      abort:async()=>{}
    };
  }
}
export class MemoryDirectoryHandle {
  constructor(name='root'){this.kind='directory';this.name=name;this.entriesMap=new Map();}
  async getFileHandle(name,options={}) {
    const current=this.entriesMap.get(name);
    if(current&&current.kind==='directory')throw new DOMException('Type mismatch','TypeMismatchError');
    if(!current&&!options.create)throw new DOMException('Missing file','NotFoundError');
    if(!current){const created=new MemoryFileHandle(name);this.entriesMap.set(name,created);return created;}
    return current;
  }
  async getDirectoryHandle(name,options={}) {
    const current=this.entriesMap.get(name);
    if(current&&current.kind!=='directory')throw new DOMException('Type mismatch','TypeMismatchError');
    if(!current&&!options.create)throw new DOMException('Missing directory','NotFoundError');
    if(!current){const created=new MemoryDirectoryHandle(name);this.entriesMap.set(name,created);return created;}
    return current;
  }
  async removeEntry(name){if(!this.entriesMap.has(name))throw new DOMException('Missing entry','NotFoundError');this.entriesMap.delete(name);}
  async *entries(){for(const item of this.entriesMap.entries())yield item;}
}
export async function fixture(){
  const root=new MemoryDirectoryHandle('Test Workspace');
  const workspace=await openWorkspace(root);
  return {root,workspace};
}
