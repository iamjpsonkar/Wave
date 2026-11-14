export interface Workspace { root: FileSystemDirectoryHandle; wave: FileSystemDirectoryHandle; documents: FileSystemDirectoryHandle; assets: FileSystemDirectoryHandle }
export interface Doc { id: string; title: string; updatedAt: number }
export async function openWorkspace(): Promise<Workspace> {
  if (!('showDirectoryPicker' in window)) throw new Error('Folder access requires Chrome or Edge in this preview.');
  const root = await window.showDirectoryPicker({ mode: 'readwrite' });
  const wave = await root.getDirectoryHandle('.wave', { create: true });
  const documents = await wave.getDirectoryHandle('documents', { create: true });
  const assets = await wave.getDirectoryHandle('assets', { create: true });
  const now = new Date().toISOString();
  try { await wave.getFileHandle('manifest.json'); }
  catch {
    await write(wave, 'manifest.json', JSON.stringify({ schemaVersion: 1, name: root.name, createdAt: now, updatedAt: now }, null, 2));
    await write(wave, 'settings.json', JSON.stringify({ format: 'markdown', appearance: 'system' }, null, 2));
  }
  return { root, wave, documents, assets };
}
async function write(dir: FileSystemDirectoryHandle, name: string, data: string | File) {
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable(); await writable.write(data); await writable.close();
}
export async function listDocs(dir: FileSystemDirectoryHandle): Promise<Doc[]> {
  const result: Doc[] = [];
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind !== 'file' || !name.endsWith('.md')) continue;
    const file = await (handle as FileSystemFileHandle).getFile(); const text = await file.text();
    result.push({ id: name, title: text.split('\n').find(x => x.trim())?.replace(/^#\s*/, '').trim() || name.replace(/\.md$/, ''), updatedAt: file.lastModified });
  }
  return result.sort((a, b) => b.updatedAt - a.updatedAt);
}
export async function readDoc(dir: FileSystemDirectoryHandle, name: string) { return (await (await dir.getFileHandle(name)).getFile()).text(); }
export async function saveDoc(dir: FileSystemDirectoryHandle, name: string, text: string) { await write(dir, name, text); }
export async function addAsset(dir: FileSystemDirectoryHandle, file: File) { await write(dir, file.name, file); }
export function slug(title: string) { return (title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'untitled') + '.md'; }
declare global { interface Window { showDirectoryPicker: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle> } }