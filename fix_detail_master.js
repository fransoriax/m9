const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

// ── FIX 1: Make initDetailPage async and self-fetching ──────────────────────

// Replace the function signature and the first guard block
const oldDetailGuard = `// 6. PRODUCT DETAIL LOADER
function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || "toyota-8fg25";

  let item = forklifts.find(f => f.id.toString() === id.toString());
  if (!item && typeof staticTrucks !== "undefined") {
    item = staticTrucks.find(t => t.id.toString() === id.toString());
  }
  let parsedDB = window.M9_DB_CACHE || null;
  try {
    const rawDB = localStorage.getItem('m9-inventory-db');
    if (rawDB) parsedDB = JSON.parse(rawDB);
  } catch(e) {}
  
  if (!parsedDB && window.M9Supabase && window.M9Supabase.isConfigured()) {
    const detailContainer = document.querySelector(".detail-layout");
    if (detailContainer) {
      if (!document.getElementById("detail-loading-overlay")) {
        detailContainer.style.display = 'none';
        const loader = document.createElement("div");
        loader.id = "detail-loading-overlay";
        loader.innerHTML = \`
          <div style="text-align: center; padding: 6rem 2rem; width: 100%;">
            <div class="spinner" style="margin: 0 auto 1rem auto; width: 40px; height: 40px; border: 4px solid rgba(255, 198, 0, 0.2); border-left-color: var(--primary-yellow); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <h3 style="font-family: var(--font-headings); font-size: 1.5rem; margin-bottom: 0.5rem;">Cargando detalles...</h3>
          </div>
        \`;
        detailContainer.parentNode.insertBefore(loader, detailContainer);
      }
    }
    return;
  }

  const spinner = document.getElementById("detail-loading-spinner");
  if (spinner) spinner.remove();
  const overlay = document.getElementById("detail-loading-overlay");
  if (overlay) overlay.remove();
  const layout = document.querySelector(".detail-layout");
  if (layout) layout.style.display = '';
  const notFoundMsg = document.getElementById("not-found-msg");
  if (notFoundMsg) notFoundMsg.remove();`;

const newDetailGuard = `// 6. PRODUCT DETAIL LOADER
async function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || "toyota-8fg25";

  let parsedDB = window.M9_DB_CACHE || null;
  try {
    const rawDB = localStorage.getItem('m9-inventory-db');
    if (rawDB) parsedDB = JSON.parse(rawDB);
  } catch(e) {}

  // If no data at all, fetch directly from Supabase (handles localhost & first visits)
  if (!parsedDB && window.M9Supabase && window.M9Supabase.isConfigured()) {
    const detailContainer = document.querySelector(".detail-layout");
    if (detailContainer && !document.getElementById("detail-loading-overlay")) {
      detailContainer.style.display = 'none';
      const loader = document.createElement("div");
      loader.id = "detail-loading-overlay";
      loader.innerHTML = \`
        <div style="text-align: center; padding: 6rem 2rem; width: 100%;">
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          <div style="margin: 0 auto 1.5rem auto; width: 48px; height: 48px; border: 4px solid rgba(255,198,0,0.2); border-left-color: var(--primary-yellow); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <h3 style="font-family: var(--font-headings); font-size: 1.5rem; margin-bottom: 0.5rem;">Cargando detalles...</h3>
        </div>
      \`;
      detailContainer.parentNode.insertBefore(loader, detailContainer);
    }
    try {
      const res = await window.M9Supabase.fetchAllAndCache();
      if (res.ok && res.DB) {
        window.M9_DB_CACHE = res.DB;
        parsedDB = res.DB;
      }
    } catch(err) {
      console.warn('Error fetching Supabase data in detail page:', err);
    }
    const overlay2 = document.getElementById("detail-loading-overlay");
    if (overlay2) overlay2.remove();
    if (detailContainer) detailContainer.style.display = '';
  }

  // Cleanup any leftover loaders
  const spinner = document.getElementById("detail-loading-spinner");
  if (spinner) spinner.remove();
  const overlay = document.getElementById("detail-loading-overlay");
  if (overlay) overlay.remove();
  const notFoundMsg = document.getElementById("not-found-msg");
  if (notFoundMsg) notFoundMsg.remove();
  const layout = document.querySelector(".detail-layout");
  if (layout) layout.style.display = '';

  let item = null;`;

if (code.includes(oldDetailGuard)) {
  code = code.replace(oldDetailGuard, newDetailGuard);
  console.log('✔ FIX 1: initDetailPage made async');
} else {
  console.log('✘ FIX 1 not applied - string not found');
}

// ── FIX 2: Update the ID lookup to match auto-N and truck-N format ─────────

const oldLookup = `      const allEquip = [...(parsedDB.autoelevadores || []), ...(parsedDB.camiones || [])];
      const found = allEquip.find(e => e.id.toString() === id.toString() || \`crm-auto-\${e.id}\` === id || \`crm-truck-\${e.id}\` === id || (item && e.name.toLowerCase() === item.name.toLowerCase()));`;

const newLookup = `      const allEquip = [...(parsedDB.autoelevadores || []), ...(parsedDB.camiones || [])];
      const found = allEquip.find(e => {
        const eid = String(e.id);
        return eid === id ||
          \`auto-\${eid}\` === id ||
          \`truck-\${eid}\` === id ||
          \`crm-auto-\${eid}\` === id ||
          \`crm-truck-\${eid}\` === id;
      });`;

if (code.includes(oldLookup)) {
  code = code.replace(oldLookup, newLookup);
  console.log('✔ FIX 2: Detail page ID lookup updated');
} else {
  console.log('✘ FIX 2 not applied - string not found');
}

// ── FIX 3: Update catalog to use auto-N IDs ────────────────────────────────
const oldCatalogId = `            const staticMatch = forklifts.find(f => f.name.toLowerCase() === crmItem.name.toLowerCase());
            allEquipments.push({
              id: staticMatch ? staticMatch.id : \`crm-auto-\${crmItem.id}\`,`;

const newCatalogId = `            allEquipments.push({
              id: \`auto-\${crmItem.id}\`,`;

if (code.includes(oldCatalogId)) {
  code = code.replace(oldCatalogId, newCatalogId);
  console.log('✔ FIX 3: Catalog now uses auto-N IDs');
} else {
  console.log('✘ FIX 3 not applied - string not found');
}

// ── FIX 4: Update camiones catalog to use truck-N IDs ─────────────────────
const oldTruckId = `              allTrucks.push({
                id: staticMatch ? staticMatch.id : \`crm-truck-\${crmItem.id}\`,`;

const newTruckId = `              allTrucks.push({
                id: \`truck-\${crmItem.id}\`,`;

if (code.includes(oldTruckId)) {
  code = code.replace(oldTruckId, newTruckId);
  console.log('✔ FIX 4: Camiones catalog now uses truck-N IDs');
} else {
  console.log('✘ FIX 4 not applied - string not found');
}

fs.writeFileSync('app_v12.js', code);
console.log('\nDone writing app_v12.js');
