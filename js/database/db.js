/**
 * Data Journey - IndexedDB Promise-based Database Engine
 */

import { DB_NAME, DB_VERSION, STORES, SCHEMA_DEFINITIONS } from './schema.js';

let dbInstance = null;
let openPromise = null;

export class Database {
  /**
   * Initializes and opens the IndexedDB instance
   */
  static async open() {
    if (dbInstance) {
      console.log('[IndexedDB] Reusing existing dbInstance');
      return dbInstance;
    }
    if (openPromise) {
      console.log('[IndexedDB] Reusing existing openPromise in flight');
      return openPromise;
    }

    console.log('[IndexedDB] Starting indexedDB.open for', DB_NAME, 'v', DB_VERSION);
    openPromise = new Promise((resolve, reject) => {
      let isSettled = false;
      const timeout = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          openPromise = null;
          console.warn('[IndexedDB] Open request timeout after 12s; rejecting.');
          reject(new Error('IndexedDB open timed out'));
        }
      }, 12000);

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        console.log(`[IndexedDB] Upgrading schema to version ${DB_VERSION}`);
        try {
          const db = event.target.result;
          const tx = event.target.transaction || request.transaction;

          // Create object stores and indexes if they do not exist
          Object.entries(SCHEMA_DEFINITIONS).forEach(([storeName, config]) => {
            let store;
            if (!db.objectStoreNames.contains(storeName)) {
              store = db.createObjectStore(storeName, { keyPath: config.keyPath });
            } else if (tx) {
              store = tx.objectStore(storeName);
            }

            if (store && config.indexes) {
              config.indexes.forEach((idx) => {
                if (!store.indexNames.contains(idx.name)) {
                  store.createIndex(idx.name, idx.keyPath, { unique: idx.unique });
                }
              });
            }
          });
        } catch (err) {
          console.error('[IndexedDB] Error during onupgradeneeded:', err);
          if (!isSettled) {
            isSettled = true;
            openPromise = null;
            clearTimeout(timeout);
            reject(err);
          }
        }
      };

      request.onsuccess = (event) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeout);
          dbInstance = event.target.result;
          openPromise = null;
          dbInstance.onversionchange = () => {
            console.log('[IndexedDB] Database version change requested. Closing connection.');
            dbInstance.close();
            dbInstance = null;
          };
          console.log('[IndexedDB] Database opened successfully');
          resolve(dbInstance);
        }
      };

      request.onerror = (event) => {
        if (!isSettled) {
          isSettled = true;
          openPromise = null;
          clearTimeout(timeout);
          console.error('[IndexedDB] Failed to open database:', event.target.error);
          reject(event.target.error);
        }
      };

      request.onblocked = () => {
        console.warn('[IndexedDB] Database open blocked. Another tab or connection is open.');
      };
    });

    return openPromise;
  }

  /**
   * Helper to execute a transaction
   */
  static async transaction(storeNames, mode, callback) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, mode);
      let result;

      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);

      try {
        result = callback(tx);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Get a single record by primary key
   */
  static async get(storeName, key) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      console.warn(`[IndexedDB] get failed on store ${storeName}:`, err);
      return null;
    }
  }

  /**
   * Get all records from a store
   */
  static async getAll(storeName) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (err) {
      console.warn(`[IndexedDB] getAll failed on store ${storeName}:`, err);
      return [];
    }
  }

  /**
   * Get all records matching an index query
   */
  static async getAllByIndex(storeName, indexName, query) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.getAll(query);

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Put (insert or update) a record
   */
  static async put(storeName, record) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(record);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Bulk put multiple records
   */
  static async bulkPut(storeName, records) {
    if (!records || records.length === 0) return;
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      records.forEach((record) => store.put(record));

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Delete a record by key
   */
  static async delete(storeName, key) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Clear all records in a single store
   */
  static async clearStore(storeName) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Clear all stores in the database
   */
  static async clearAllStores() {
    const storeList = Object.values(STORES);
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeList, 'readwrite');
      storeList.forEach((storeName) => {
        tx.objectStore(storeName).clear();
      });

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Export entire database to a JSON-serializable object
   */
  static async exportAll() {
    const backup = {
      app: 'Ascendra',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      stores: {}
    };

    const storeNames = Object.values(STORES);
    for (const storeName of storeNames) {
      backup.stores[storeName] = await this.getAll(storeName);
    }

    return backup;
  }

  /**
   * Import data from JSON object
   * mode: 'replace' (clears DB first) or 'merge' (appends or updates by ID)
   */
  static async importAll(data, mode = 'replace') {
    if (!data || !data.stores) {
      throw new Error('Invalid backup file structure: missing stores payload.');
    }

    if (mode === 'replace') {
      await this.clearAllStores();
    }

    for (const [storeName, records] of Object.entries(data.stores)) {
      if (Object.values(STORES).includes(storeName) && Array.isArray(records)) {
        if (mode === 'merge') {
          // Merge logic: if record exists, update if backup has newer or equal updatedAt
          for (const item of records) {
            const existing = await this.get(storeName, item.id || item.key);
            if (!existing) {
              await this.put(storeName, item);
            } else {
              const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
              const incomingTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
              if (incomingTime >= existingTime) {
                await this.put(storeName, item);
              }
            }
          }
        } else {
          await this.bulkPut(storeName, records);
        }
      }
    }

    return true;
  }
}
