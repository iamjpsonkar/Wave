export interface Workspace { root: FileSystemDirectoryHandle; wave: FileSystemDirectoryHandle; documents: FileSystemDirectoryHandle; assets: FileSystemDirectoryHandle; backups: FileSystemDirectoryHandle; trash: FileSystemDirectoryHandle }
export interface Doc { id: string; path: string; title: string; updatedAt: number; content: string }
export interface TrashItem { id: string; title: string; originalPath: string; deletedAt: string }
export async function openWorkspace(rootHandle?: FileSystemDirectoryHandle): Promise<Workspace> {
  if (!rootHandle && !('showDirectoryPicker' in window)) throw new Error('Folder access requires Chrome or Edge in this preview.');
  const root = rootHandle ?? await window.showDirectoryPicker({ mode: 'readwrite' });
  const wave = await root.getDirectoryHandle('.wave', { create: true });
  const documents = await wave.getDirectoryHandle('documents', { create: true });
  const assets = await wave.getDirectoryHandle('assets', { create: true });
  const backups = await wave.getDirectoryHandle('backups', { create: true });
  const trash = await wave.getDirectoryHandle('trash', { create: true });
  const now = new Date().toISOString();
  try { await wave.getFileHandle('manifest.json'); }
  catch { await write(wave, 'manifest.json', JSON.stringify({ schemaVersion: 1, name: root.name, createdAt: now, updatedAt: now }, null, 2)); }
  try { await wave.getFileHandle('settings.json'); }
  catch { await write(wave, 'settings.json', JSON.stringify({ format: 'markdown', appearance: 'system' }, null, 2)); }
  return { root, wave, documents, assets, backups, trash };
}
async function write(dir: FileSystemDirectoryHandle, name: string, data: string | File) {
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable(); await writable.write(data); await writable.close();
}
async function directoryForPath(root: FileSystemDirectoryHandle, path: string, create = false) {
  const parts = path.split('/').filter(Boolean);
  if (parts.some(part => part === '.' || part === '..' || part.includes('\\') || part.includes(':'))) {
    throw new Error('Invalid directory path.');
  }
  let current = root;
  for (const part of parts) current = await current.getDirectoryHandle(part, { create });
  return current;
}
async function fileForPath(root: FileSystemDirectoryHandle, path: string, create = false) {
  const parts = path.split('/').filter(Boolean);
  const name = parts.pop();
  if (!name || name === '.' || name === '..' || name.includes('\\') || name.includes(':')) throw new Error('Invalid document path.');
  const parent = await directoryForPath(root, parts.join('/'), create);
  return parent.getFileHandle(name, { create });
}
export async function listDocs(dir: FileSystemDirectoryHandle): Promise<Doc[]> {
  const result: Doc[] = [];
  async function walk(folder: FileSystemDirectoryHandle, prefix = '') {
    for await (const [name, handle] of folder.entries()) {
      const path = prefix ? prefix + '/' + name : name;
      if (handle.kind === 'directory') await walk(handle as FileSystemDirectoryHandle, path);
      else if (name.endsWith('.md')) {
        const file = await (handle as FileSystemFileHandle).getFile();
        const text = await file.text();
        result.push({ id: path, path, title: text.split('\n').find(x => x.trim())?.replace(/^#\s*/, '').trim() || name.replace(/\.md$/, ''), updatedAt: file.lastModified, content: text });
      }
    }
  }
  await walk(dir);
  return result.sort((a, b) => b.updatedAt - a.updatedAt);
}
export async function listFolders(dir: FileSystemDirectoryHandle): Promise<string[]> {
  const result: string[] = [];
  async function walk(folder: FileSystemDirectoryHandle, prefix = '') {
    for await (const [name, handle] of folder.entries()) {
      if (handle.kind !== 'directory') continue;
      const path = prefix ? prefix + '/' + name : name;
      result.push(path);
      await walk(handle as FileSystemDirectoryHandle, path);
    }
  }
  await walk(dir);
  return result.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
}

export async function readDoc(dir: FileSystemDirectoryHandle, path: string) { return (await (await fileForPath(dir, path)).getFile()).text(); }
export async function saveDoc(dir: FileSystemDirectoryHandle, path: string, text: string) {
  const file = await fileForPath(dir, path, true);
  const writable = await file.createWritable(); await writable.write(text); await writable.close();
}

async function copyFolder(source: FileSystemDirectoryHandle, destination: FileSystemDirectoryHandle) {
  for await (const [name, handle] of source.entries()) {
    if (handle.kind === 'directory') {
      const child = await destination.getDirectoryHandle(name, { create: true });
      await copyFolder(handle as FileSystemDirectoryHandle, child);
    } else {
      const file = await (handle as FileSystemFileHandle).getFile();
      await write(destination, name, file);
    }
  }
}
export async function createBackup(workspace: Workspace): Promise<string> {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = 'backup-' + stamp;
  const backup = await workspace.backups.getDirectoryHandle(name, { create: true });
  await copyFolder(workspace.documents, await backup.getDirectoryHandle('documents', { create: true }));
  await copyFolder(workspace.assets, await backup.getDirectoryHandle('assets', { create: true }));
  for (const filename of ['manifest.json', 'settings.json']) {
    try {
      const file = await (await workspace.wave.getFileHandle(filename)).getFile();
      await write(backup, filename, file);
    } catch { /* Settings may be absent in an older workspace; documents and assets are still backed up. */ }
  }
  return name;
}

export async function moveDocToTrash(documents: FileSystemDirectoryHandle, trash: FileSystemDirectoryHandle, path: string): Promise<void> {
  const file = await fileForPath(documents, path);
  const text = await (await file.getFile()).text();
  const id = crypto.randomUUID();
  const title = text.split('\n').find(line => line.trim())?.replace(/^#\s*/, '').trim() || path.split('/').pop() || 'Untitled';
  await write(trash, id + '.md', text);
  await write(trash, id + '.json', JSON.stringify({ id, title, originalPath: path, deletedAt: new Date().toISOString() }, null, 2));
  const parts = path.split('/').filter(Boolean);
  const name = parts.pop();
  const parent = await directoryForPath(documents, parts.join('/'));
  if (name) await parent.removeEntry(name);
}
export async function listTrash(trash: FileSystemDirectoryHandle): Promise<TrashItem[]> {
  const items: TrashItem[] = [];
  for await (const [name, handle] of trash.entries()) {
    if (handle.kind !== 'file' || !name.endsWith('.json')) continue;
    const data = JSON.parse(await (await (handle as FileSystemFileHandle).getFile()).text()) as TrashItem;
    items.push(data);
  }
  return items.sort((a,b)=>b.deletedAt.localeCompare(a.deletedAt));
}
export async function restoreTrashItem(trash: FileSystemDirectoryHandle, documents: FileSystemDirectoryHandle, id: string): Promise<string> {
  const metadata = JSON.parse(await (await (await trash.getFileHandle(id + '.json')).getFile()).text()) as TrashItem;
  const content = await (await (await trash.getFileHandle(id + '.md')).getFile()).text();
  let target = metadata.originalPath;
  try {
    await fileForPath(documents, target);
    const dot = target.lastIndexOf('.');
    target = (dot > target.lastIndexOf('/') ? target.slice(0,dot) : target) + '-restored' + (dot > target.lastIndexOf('/') ? target.slice(dot) : '.md');
  } catch { /* Original path is free. */ }
  await saveDoc(documents, target, content);
  await trash.removeEntry(id + '.md');
  await trash.removeEntry(id + '.json');
  return target;
}
export async function permanentlyDeleteTrashItem(trash: FileSystemDirectoryHandle, id: string): Promise<void> {
  await trash.removeEntry(id + '.md');
  await trash.removeEntry(id + '.json');
}

export async function addAsset(dir: FileSystemDirectoryHandle, file: File): Promise<string> {
  const original = file.name.split(/[\\/]/).pop() || 'attachment';
  const cleaned = original.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'attachment';
  const dot = cleaned.lastIndexOf('.');
  const stem = dot > 0 ? cleaned.slice(0, dot) : cleaned;
  const ext = dot > 0 ? cleaned.slice(dot) : '';
  let candidate = cleaned, index = 2;
  while (true) {
    try { await dir.getFileHandle(candidate); candidate = stem + '-' + index++ + ext; }
    catch { break; }
  }
  await write(dir, candidate, file);
  return candidate;
}
export async function createFolder(dir: FileSystemDirectoryHandle, path: string): Promise<string> {
  const parts = path.split('/').filter(Boolean);
  const requested = parts.pop() || '';
  const safe = requested.trim().replace(/[\\/:*?"<>|]/g, '-').replace(/^\.+|\.+$/g, '').slice(0, 60);
  if (!safe) throw new Error('Enter a valid folder name.');
  const parent = await directoryForPath(dir, parts.join('/'), true);
  await parent.getDirectoryHandle(safe, { create: true });
  return safe;
}
export function slug(title: string) { return (title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'untitled') + '.md'; }
declare global { interface Window { showDirectoryPicker: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle> } interface FileSystemDirectoryHandle { entries(): AsyncIterableIterator<[string, FileSystemHandle]> } }

export interface WorkspaceSettings {
  format?: string;
  appearance?: 'system' | 'light' | 'dark';
  favorites?: string[];
  [key: string]: unknown;
}

export async function readWorkspaceSettings(wave: FileSystemDirectoryHandle): Promise<WorkspaceSettings> {
  try {
    const file = await (await wave.getFileHandle('settings.json')).getFile();
    const parsed: unknown = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as WorkspaceSettings;
  } catch {
    return {};
  }
}

export async function writeWorkspaceSettings(wave: FileSystemDirectoryHandle, settings: WorkspaceSettings): Promise<void> {
  await write(wave, 'settings.json', JSON.stringify(settings, null, 2));
}

export async function listBackups(backups: FileSystemDirectoryHandle): Promise<string[]> {
  const names: string[] = [];
  for await (const [name, handle] of backups.entries()) {
    if (handle.kind === 'directory' && name.startsWith('backup-')) names.push(name);
  }
  return names.sort((a, b) => b.localeCompare(a));
}
