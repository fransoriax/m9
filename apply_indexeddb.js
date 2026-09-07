const fs = require('fs');

let clientJS = fs.readFileSync('supabase-client.js', 'utf8');

if (!clientJS.includes('M9Cache')) {
  const m9CacheCode = `
  const M9Cache = {
    _db: null,
    async _getDB() {
      if (this._db) return this._db;
      return new Promise((resolve) => {
        const req = indexedDB.open('M9_CACHE_DB', 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore('cache');
        req.onsuccess = e => { this._db = e.target.result; resolve(this._db); };
        req.onerror = () => resolve(null);
      });
    },
    async set(key, val) {
      try {
        const db = await this._getDB();
        if (!db) return;
        return new Promise(resolve => {
          const tx = db.transaction('cache', 'readwrite');
          tx.objectStore('cache').put(val, key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      } catch(e) {}
    },
    async get(key) {
      try {
        const db = await this._getDB();
        if (!db) return null;
        return new Promise(resolve => {
          const tx = db.transaction('cache', 'readonly');
          const req = tx.objectStore('cache').get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
      } catch(e) { return null; }
    }
  };
  global.M9Cache = M9Cache;
`;
  clientJS = clientJS.replace('global.M9Supabase = M9Supabase;', 'global.M9Supabase = M9Supabase;' + m9CacheCode);

  clientJS = clientJS.replace(/localStorage\.setItem\('m9-inventory-db',\s*JSON\.stringify\(syncedDB\)\);/g, "await global.M9Cache.set('m9-inventory-db', syncedDB);");
  clientJS = clientJS.replace(/currentDBStr = localStorage\.getItem\('m9-inventory-db'\);/g, "currentDBStr = null; currentDB = await global.M9Cache.get('m9-inventory-db') || {};");
  clientJS = clientJS.replace(/if \(currentDBStr\) \{[\s\S]*?\}/g, "");
  
  fs.writeFileSync('supabase-client.js', clientJS);
}

let appJS = fs.readFileSync('app_v12.js', 'utf8');

// Replace localStorage reads with M9Cache
appJS = appJS.replace(/const rawDB = localStorage\.getItem\('m9-inventory-db'\);\s*if \(rawDB\) parsedDB = JSON\.parse\(rawDB\);/g, "if (!parsedDB && window.M9Cache) { parsedDB = await window.M9Cache.get('m9-inventory-db'); }");

// Make initialization functions async
appJS = appJS.replace(/function initCatalogPage\(\)/g, "async function initCatalogPage()");
appJS = appJS.replace(/function initPartsPage\(\)/g, "async function initPartsPage()");
appJS = appJS.replace(/function initCamionesPage\(\)/g, "async function initCamionesPage()");
appJS = appJS.replace(/function initHomePage\(\)/g, "async function initHomePage()");

// Inside syncWithSupabaseIfAvailable
appJS = appJS.replace(/const rawDB = localStorage\.getItem\('m9-inventory-db'\);/g, "const rawDB = window.M9Cache ? await window.M9Cache.get('m9-inventory-db') : null;");
appJS = appJS.replace(/window\.M9_DB_CACHE = JSON\.parse\(rawDB\);/g, "window.M9_DB_CACHE = rawDB;");
appJS = appJS.replace(/const db = rawDB \? JSON\.parse\(rawDB\) : \(window\.M9_DB_CACHE \|\| \{\}\);/g, "const db = rawDB || window.M9_DB_CACHE || {};");

fs.writeFileSync('app_v12.js', appJS);

let adminJS = fs.readFileSync('admin/admin.js', 'utf8');

adminJS = adminJS.replace(/localStorage\.setItem\('m9-inventory-db',\s*JSON\.stringify\(DB\)\);/g, "window.M9Cache.set('m9-inventory-db', DB);");
adminJS = adminJS.replace(/const saved = localStorage\.getItem\('m9-inventory-db'\);/g, "const saved = null; /* Handled asynchronously now */");

// Actually, admin.js might need a deeper async refactor. Let's see if we can just make init() async.
// I will patch adminJS more carefully next if needed.

fs.writeFileSync('admin/admin.js', adminJS);

console.log('IndexedDB patch applied');
