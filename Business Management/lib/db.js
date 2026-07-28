import { openDB } from 'idb';

const DB_NAME = 'giftyours_db';
const DB_VERSION = 1;

export const initDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Products
      if (!db.objectStoreNames.contains('products')) {
        const ps = db.createObjectStore('products', { keyPath: 'id' });
        ps.createIndex('category', 'category');
        ps.createIndex('status', 'status');
      }
      // Customers
      if (!db.objectStoreNames.contains('customers')) {
        const cs = db.createObjectStore('customers', { keyPath: 'id' });
        cs.createIndex('phone', 'phone');
      }
      // Sales
      if (!db.objectStoreNames.contains('sales')) {
        const ss = db.createObjectStore('sales', { keyPath: 'id' });
        ss.createIndex('date', 'date');
        ss.createIndex('customerId', 'customerId');
      }
      // Invoices
      if (!db.objectStoreNames.contains('invoices')) {
        const is = db.createObjectStore('invoices', { keyPath: 'id' });
        is.createIndex('date', 'date');
        is.createIndex('status', 'status');
        is.createIndex('customerId', 'customerId');
      }
      // Expenses
      if (!db.objectStoreNames.contains('expenses')) {
        const es = db.createObjectStore('expenses', { keyPath: 'id' });
        es.createIndex('date', 'date');
        es.createIndex('category', 'category');
      }
      // Stock History
      if (!db.objectStoreNames.contains('stock_history')) {
        const sh = db.createObjectStore('stock_history', { keyPath: 'id' });
        sh.createIndex('productId', 'productId');
        sh.createIndex('date', 'date');
      }
      // Settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });

// Generic CRUD helpers
export const dbGet = async (store, id) => {
  const db = await initDB();
  return db.get(store, id);
};
export const dbGetAll = async (store) => {
  const db = await initDB();
  return db.getAll(store);
};
export const dbPut = async (store, value) => {
  const db = await initDB();
  return db.put(store, value);
};
export const dbDelete = async (store, id) => {
  const db = await initDB();
  return db.delete(store, id);
};
export const dbClear = async (store) => {
  const db = await initDB();
  return db.clear(store);
};
export const dbGetByIndex = async (store, index, value) => {
  const db = await initDB();
  return db.getAllFromIndex(store, index, value);
};
