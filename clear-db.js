const fs = require('fs');
let content = fs.readFileSync('admin/admin.js', 'utf8');

const emptyDB = `let DB = {
  autoelevadores: [],
  repuestos: [],
  camiones: [],
  leads: {
    nuevas: [],
    cotizacion: [],
    enviado: [],
    ganado: []
  },
  units: [],
  reviews: [],
  accounts: [
    {
      id: 'acc-1',
      user: 'admin',
      pass: 'admin',
      name: 'Administrador General',
      role: 'Superadmin CRM',
      isSuperAdmin: true,
      modules: ['inventario', 'cotizaciones', 'presupuestos', 'postventa', 'resenas', 'reportes', 'cuentas']
    }
  ],
  quotes: []
};`;

content = content.replace(/let DB = \{[\s\S]*?\n\};\n/, emptyDB + '\n');
fs.writeFileSync('admin/admin.js', content);
console.log('Replaced DB object');
