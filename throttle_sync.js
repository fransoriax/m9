const fs = require('fs');
let app = fs.readFileSync('app_v12.js', 'utf8');

const targetFunc = `async function syncWithSupabaseIfAvailable() {
  if (window.M9Supabase && window.M9Supabase.isConfigured()) {
    try {
      const res = await window.M9Supabase.fetchAllAndCache();
      if (res.ok && res.DB) {
        window.M9_DB_CACHE = res.DB;`;

const replacement = `async function syncWithSupabaseIfAvailable() {
  if (window.M9Supabase && window.M9Supabase.isConfigured()) {
    try {
      const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
      const lastSync = localStorage.getItem('m9-db-last-sync');
      const rawDB = localStorage.getItem('m9-inventory-db');
      
      // If we have data and it's fresh, skip background fetch to prevent unnecessary re-renders
      if (rawDB && lastSync && (Date.now() - parseInt(lastSync)) < CACHE_DURATION_MS) {
        window.M9_DB_CACHE = JSON.parse(rawDB);
        return;
      }

      const res = await window.M9Supabase.fetchAllAndCache();
      if (res.ok && res.DB) {
        window.M9_DB_CACHE = res.DB;
        localStorage.setItem('m9-db-last-sync', Date.now().toString());`;

if (app.includes(targetFunc)) {
    app = app.replace(targetFunc, replacement);
    fs.writeFileSync('app_v12.js', app);
    console.log('syncWithSupabaseIfAvailable updated (LF)');
} else if (app.includes(targetFunc.replace(/\n/g, '\r\n'))) {
    app = app.replace(targetFunc.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));
    fs.writeFileSync('app_v12.js', app);
    console.log('syncWithSupabaseIfAvailable updated (CRLF)');
} else {
    console.log('Could not find syncWithSupabaseIfAvailable block');
}
