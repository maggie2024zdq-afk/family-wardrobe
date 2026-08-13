// db.js — 本地数据层（IndexedDB，无第三方依赖，纯离线）
// 设计要点：以 accountId 隔离每个家庭成员的数据；IndexedDB 是“数据源真相”，离线即用。
const DB_NAME = 'familyWardrobeDB';
const DB_VERSION = 1;

const WardrobeDB = (() => {
  let db = null;

  function open() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('accounts')) {
          d.createObjectStore('accounts', { keyPath: 'id' });
        }
        if (!d.objectStoreNames.contains('items')) {
          const s = d.createObjectStore('items', { keyPath: 'id' });
          s.createIndex('accountId', 'accountId', { unique: false });
        }
        if (!d.objectStoreNames.contains('outfits')) {
          const s = d.createObjectStore('outfits', { keyPath: 'id' });
          s.createIndex('accountId', 'accountId', { unique: false });
        }
      };
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  function store(name, mode) {
    return db.transaction(name, mode).objectStore(name);
  }
  function p(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /* ---------- 账号（家庭成员） ---------- */
  const addAccount = (a) => open().then(() => p(store('accounts', 'readwrite').add(a)));
  const putAccount = (a) => open().then(() => p(store('accounts', 'readwrite').put(a)));
  const getAllAccounts = () => open().then(() => p(store('accounts').getAll()));
  const deleteAccount = (id) => open().then(() => p(store('accounts', 'readwrite').delete(id)));

  /* ---------- 衣物 ---------- */
  const addItem = (it) => open().then(() => p(store('items', 'readwrite').add(it)));
  const putItem = (it) => open().then(() => p(store('items', 'readwrite').put(it)));
  const deleteItem = (id) => open().then(() => p(store('items', 'readwrite').delete(id)));
  const getItem = (id) => open().then(() => p(store('items').get(id)));
  const getItemsByAccount = (accountId) => open().then(() =>
    p(store('items').index('accountId').getAll(IDBKeyRange.only(accountId)))
  );
  const deleteItemsByAccount = (accountId) => open().then(() => {
    const idx = store('items', 'readwrite').index('accountId');
    return new Promise((resolve) => {
      const req = idx.openCursor(IDBKeyRange.only(accountId));
      req.onsuccess = (e) => {
        const cur = e.target.result;
        if (cur) { cur.delete(); cur.continue(); } else resolve();
      };
    });
  });

  /* ---------- 搭配 ---------- */
  const addOutfit = (o) => open().then(() => p(store('outfits', 'readwrite').add(o)));
  const putOutfit = (o) => open().then(() => p(store('outfits', 'readwrite').put(o)));
  const deleteOutfit = (id) => open().then(() => p(store('outfits', 'readwrite').delete(id)));
  const getOutfitsByAccount = (accountId) => open().then(() =>
    p(store('outfits').index('accountId').getAll(IDBKeyRange.only(accountId)))
  );
  const deleteOutfitsByAccount = (accountId) => open().then(() => {
    const idx = store('outfits', 'readwrite').index('accountId');
    return new Promise((resolve) => {
      const req = idx.openCursor(IDBKeyRange.only(accountId));
      req.onsuccess = (e) => {
        const cur = e.target.result;
        if (cur) { cur.delete(); cur.continue(); } else resolve();
      };
    });
  });

  return {
    open, addAccount, putAccount, getAllAccounts, deleteAccount,
    addItem, putItem, deleteItem, getItem, getItemsByAccount, deleteItemsByAccount,
    addOutfit, putOutfit, deleteOutfit, getOutfitsByAccount, deleteOutfitsByAccount,
  };
})();
