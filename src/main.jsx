import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ─── IndexedDB-backed storage polyfill ───────────────
// Mimics window.storage API used by the app, but uses IndexedDB
// to handle large file uploads (screenplays, pitch decks, etc.)
// that would exceed localStorage's ~5MB limit.

const DB_NAME = 'precariat-storage';
const STORE_NAME = 'kv';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbOp(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

window.storage = {
  async get(key) {
    const value = await dbOp('readonly', s => s.get(key));
    if (value === undefined) throw new Error('Key not found');
    return { key, value };
  },
  async set(key, value) {
    await dbOp('readwrite', s => s.put(value, key));
    return { key, value };
  },
  async delete(key) {
    await dbOp('readwrite', s => s.delete(key));
    return { key, deleted: true };
  },
  async list(prefix) {
    const keys = await dbOp('readonly', s => s.getAllKeys());
    const filtered = prefix ? keys.filter(k => k.startsWith(prefix)) : keys;
    return { keys: filtered };
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
