/* ══════════════════════════════════════════════════════════════════
   MAQUINARIA 9 DE ABRIL — SUPABASE CLIENT & CLOUD SYNC MODULE
   Conexión en la nube con Supabase (PostgreSQL + REST API)
══════════════════════════════════════════════════════════════════ */

'use strict';

(function(global) {
  const DEFAULT_URL = 'https://ktfrpccefxhlrrwlahmk.supabase.co';
  
  let _client = null;

  const M9Supabase = {
    getUrl() {
      return localStorage.getItem('m9-supabase-url') || DEFAULT_URL;
    },
    getKey() {
      return localStorage.getItem('m9-supabase-key') || '';
    },
    isConfigured() {
      const key = this.getKey();
      return Boolean(key && key.trim().length > 10);
    },
    getClient() {
      if (_client) return _client;
      if (!this.isConfigured()) return null;
      if (!global.supabase || !global.supabase.createClient) {
        console.warn('Supabase SDK no está cargado en window.supabase');
        return null;
      }
      try {
        _client = global.supabase.createClient(this.getUrl(), this.getKey());
        return _client;
      } catch (err) {
        console.error('Error al inicializar cliente Supabase:', err);
        return null;
      }
    },
    saveCredentials(url, key) {
      localStorage.setItem('m9-supabase-url', (url || DEFAULT_URL).trim());
      localStorage.setItem('m9-supabase-key', (key || '').trim());
      _client = null; // reset client instance
      return this.isConfigured();
    },
    async testConnection() {
      const client = this.getClient();
      if (!client) return { ok: false, error: 'Credenciales de Supabase no configuradas.' };
      try {
        const { data, error } = await client.from('autoelevadores').select('id').limit(1);
        if (error) throw error;
        return { ok: true, data };
      } catch (err) {
        return { ok: false, error: err.message || 'Error conectando con Supabase.' };
      }
    },
    async fetchTable(tableName) {
      const client = this.getClient();
      if (!client) return { data: null, error: 'No conectado' };
      const { data, error } = await client
        .from(tableName)
        .select('*')
        .order('id', { ascending: false });
      return { data, error };
    },
    async upsertRow(tableName, row) {
      const client = this.getClient();
      if (!client) return { data: null, error: 'No conectado' };
      const { data, error } = await client
        .from(tableName)
        .upsert(row, { onConflict: 'id' })
        .select();
      if (error) console.error(`Error upsertRow (${tableName}):`, error);
      return { data, error };
    },
    async deleteRow(tableName, id) {
      const client = this.getClient();
      if (!client) return { data: null, error: 'No conectado' };
      const { data, error } = await client
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) console.error(`Error deleteRow (${tableName}):`, error);
      return { data, error };
    },
    async syncAllToSupabase(DB, leadsArray) {
      const client = this.getClient();
      if (!client) return { ok: false, error: 'No se pudo conectar a Supabase. Verificá tu Anon Key.' };

      let counts = { autoelevadores: 0, camiones: 0, repuestos: 0, leads: 0 };
      const errors = [];

      try {
        // 1. Autoelevadores (Autoelevadores, Apiladoras, Zorras)
        if (DB.autoelevadores && DB.autoelevadores.length) {
          const rows = DB.autoelevadores.map(item => ({
            id: Number(item.id),
            name: item.name || '',
            brand: item.brand || '',
            capacity: item.capacity || '',
            motor: item.motor || '',
            hours: Number(item.hours) || 0,
            price: Number(item.price) || 0,
            status: item.status || 'active',
            visible: item.visible !== false,
            img: item.img || null,
            images: Array.isArray(item.images) ? item.images : (item.img ? [item.img] : []),
            type: item.type || 'Autoelevador',
            year: Number(item.year) || null,
            condition: item.condition || 'Nuevo',
            description: item.description || ''
          }));
          const { error } = await client.from('autoelevadores').upsert(rows, { onConflict: 'id' });
          if (error) errors.push(`autoelevadores: ${error.message}`);
          else counts.autoelevadores = rows.length;
        }

        // 2. Camiones
        if (DB.camiones && DB.camiones.length) {
          const rows = DB.camiones.map(item => ({
            id: Number(item.id),
            name: item.name || '',
            brand: item.brand || '',
            capacity: item.capacity || '',
            motor: item.motor || '',
            hours: Number(item.hours) || 0,
            price: Number(item.price) || 0,
            status: item.status || 'active',
            visible: item.visible !== false,
            img: item.img || null,
            images: Array.isArray(item.images) ? item.images : (item.img ? [item.img] : []),
            year: Number(item.year) || null,
            condition: item.condition || 'Nuevo',
            description: item.description || ''
          }));
          const { error } = await client.from('camiones').upsert(rows, { onConflict: 'id' });
          if (error) errors.push(`camiones: ${error.message}`);
          else counts.camiones = rows.length;
        }

        // 3. Repuestos
        if (DB.repuestos && DB.repuestos.length) {
          const rows = DB.repuestos.map(item => ({
            id: Number(item.id),
            oem: item.oem || '',
            name: item.name || '',
            category: item.category || 'Varios',
            stock: Number(item.stock) || 0,
            price: Number(item.price) || 0,
            status: item.status || 'active',
            compat: item.compat || '',
            img: item.img || null
          }));
          const { error } = await client.from('repuestos').upsert(rows, { onConflict: 'id' });
          if (error) errors.push(`repuestos: ${error.message}`);
          else counts.repuestos = rows.length;
        }

        // 4. Leads / Cotizaciones
        let flatLeads = [];
        const sourceLeads = (leadsArray && (Array.isArray(leadsArray) ? leadsArray.length > 0 : Object.keys(leadsArray).length > 0))
          ? leadsArray
          : (DB && DB.leads);
        if (Array.isArray(sourceLeads)) {
          flatLeads = sourceLeads;
        } else if (sourceLeads && typeof sourceLeads === 'object') {
          for (const [statusKey, list] of Object.entries(sourceLeads)) {
            if (Array.isArray(list)) {
              list.forEach(item => {
                flatLeads.push({ ...item, status: statusKey });
              });
            }
          }
        }
        if (flatLeads.length > 0) {
          const rows = flatLeads.map((item, idx) => ({
            id: parseInt(String(item.id).replace(/\D/g, '')) || (idx + 1),
            client: item.client || 'Sin nombre',
            company: item.company || '',
            phone: item.phone || '',
            email: item.email || '',
            unit: item.product || item.unit || '',
            unit_id: Number(item.unitId) || null,
            status: item.status || 'nuevas',
            notes: Array.isArray(item.notes) ? item.notes.join(' | ') : String(item.notes || '')
          }));
          const { error } = await client.from('leads').upsert(rows, { onConflict: 'id' });
          if (error) errors.push(`leads: ${error.message}`);
          else counts.leads = rows.length;
        }


        if (errors.length > 0) {
          return { ok: false, error: errors.join('; '), counts };
        }
        return { ok: true, counts };
      } catch (err) {
        return { ok: false, error: err.message || 'Error inesperado durante la sincronización.' };
      }
    },
    async fetchAllAndCache() {
      if (!this.isConfigured()) return { ok: false, error: 'No configurado' };
      try {
        const [autosRes, camsRes, repsRes, leadsRes] = await Promise.all([
          this.fetchTable('autoelevadores'),
          this.fetchTable('camiones'),
          this.fetchTable('repuestos'),
          this.fetchTable('leads')
        ]);
        if (autosRes.error || camsRes.error || repsRes.error) {
          throw new Error('Error consultando tablas desde Supabase');
        }
        const syncedDB = {
          autoelevadores: autosRes.data || [],
          camiones: camsRes.data || [],
          repuestos: repsRes.data || []
        };
        localStorage.setItem('m9-inventory-db', JSON.stringify(syncedDB));
        if (leadsRes.data) {
          localStorage.setItem('m9-crm-leads', JSON.stringify(leadsRes.data));
        }
        return { ok: true, DB: syncedDB, leads: leadsRes.data || [] };
      } catch (err) {
        console.warn('No se pudo refrescar caché desde Supabase:', err.message);
        return { ok: false, error: err.message };
      }
    }
  };

  global.M9Supabase = M9Supabase;
})(window);
