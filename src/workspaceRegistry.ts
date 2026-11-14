const DATABASE = 'wave-local';
const STORE = 'workspaces';
const KEY = 'recent';

interface PermissionHandle extends FileSystemDirectoryHandle {
  queryPermission(options?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission(options?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local workspace registry.'));
  });
}

/** Stores only a FileSystemDirectoryHandle reference, never document contents. */
export async function rememberWorkspace(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put(handle, KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not remember this workspace.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Workspace registry update was aborted.'));
    });
  } finally {
    db.close();
  }
}

export async function getRememberedWorkspace(): Promise<FileSystemDirectoryHandle | null> {
  if (!('indexedDB' in window)) return null;
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      request.onsuccess = () => resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error('Could not read the recent workspace.'));
    });
  } finally {
    db.close();
  }
}

export async function clearRememberedWorkspace(): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).delete(KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not clear the recent workspace.'));
    });
  } finally {
    db.close();
  }
}

export async function ensureWorkspacePermission(handle: FileSystemDirectoryHandle): Promise<void> {
  const permissionHandle = handle as PermissionHandle;
  let permission = await permissionHandle.queryPermission({ mode: 'readwrite' });
  if (permission !== 'granted') {
    // Must be called from a user gesture; browsers may show a permission prompt.
    permission = await permissionHandle.requestPermission({ mode: 'readwrite' });
  }
  if (permission !== 'granted') {
    throw new Error('Wave does not have permission to access this folder. Choose the workspace again to grant access.');
  }
}
