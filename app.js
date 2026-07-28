// --- PREMIUM AUTOELEVADORES - APPLICATION ENGINE ---

// 1. DATASETS (Simulating a local database)
const forklifts = [
  {
    id: "toyota-8fg25",
    name: "Toyota 8FG25",
    brand: "Toyota",
    type: "Autoelevador",
    capacity: 2500, // kg
    height: 4.7,    // meters
    year: 2026,
    condition: "Nuevo",
    image: "assets/diesel_forklift.png",
    description: "Autoelevador nafta/GNC de la prestigiosa serie 8 de Toyota. Máxima ergonomía, confiabilidad insuperable y sistema SAS (Sistema de Estabilidad Activa) exclusivo de Toyota para prevención de vuelcos.",
    specs: {
      engine: "Toyota 4Y (Nafta/GNC)",
      transmission: "Powershift Toyota",
      turningRadius: "2280 mm",
      mastType: "Triple FFL (Full Free Lift)"
    }
  },
  {
    id: "hecha-hq25d",
    name: "Hecha HQ25D",
    brand: "Hecha",
    type: "Autoelevador",
    capacity: 2500,
    height: 4.5,
    year: 2025,
    condition: "Nuevo",
    image: "assets/diesel_forklift.png",
    description: "Autoelevador diésel Hecha HQ Series. Equipado con motor Isuzu japonés de alto torque, transmisión powershift de alta resistencia y mástil de amplio campo visual. Excelente relación costo-beneficio.",
    specs: {
      engine: "Isuzu C240 (Japón)",
      transmission: "Powershift Automática",
      turningRadius: "2700 mm",
      mastType: "Dúplex de amplia visibilidad"
    }
  },
  {
    id: "toyota-7fbe18",
    name: "Toyota 7FBE18",
    brand: "Toyota",
    type: "Autoelevador",
    capacity: 1800,
    height: 4.8,
    year: 2023,
    condition: "Usado",
    image: "assets/electric_forklift.png",
    description: "Autoelevador eléctrico Toyota de 3 ruedas. Excelente radio de giro ideal para depósitos con pasillos angostos. Sistema de control de corriente alterna (AC) para una aceleración y frenado suaves y precisos.",
    specs: {
      voltage: "48V AC",
      turningRadius: "1550 mm",
      controller: "Toyota SAS-AC",
      mastType: "Dúplex FFL"
    }
  },
  {
    id: "toyota-swe120",
    name: "Toyota SWE120",
    brand: "Toyota",
    type: "Apiladora",
    capacity: 1200,
    height: 3.3,
    year: 2025,
    condition: "Nuevo",
    image: "assets/apilador.png",
    description: "Apilador eléctrico de conductor acompañante Toyota BT Staxio. Excelente maniobrabilidad en espacios reducidos, elevación suave y control progresivo del mástil para máxima seguridad de la carga.",
    specs: {
      voltage: "24V BT Powerdrive",
      turningRadius: "1450 mm",
      controller: "Toyota AC System",
      mastType: "Dúplex FFL"
    }
  },
  {
    id: "hecha-he20s",
    name: "Hecha HE20S",
    brand: "Hecha",
    type: "Apiladora",
    capacity: 2000,
    height: 4.5,
    year: 2024,
    condition: "Usado",
    image: "assets/apilador.png",
    description: "Apilador eléctrico de conductor a pie Hecha. Con tecnología de motor de tracción AC libre de mantenimiento, estructura robusta y brazos estabilizadores para cargas pesadas a gran altura.",
    specs: {
      voltage: "24V AC",
      turningRadius: "1750 mm",
      controller: "Curtis AC Controller",
      mastType: "Triple FFL de alta visibilidad"
    }
  },
  {
    id: "toyota-lwe200",
    name: "Toyota LWE200",
    brand: "Toyota",
    type: "Zorra Transpallet",
    capacity: 2000,
    height: 0.2,
    year: 2026,
    condition: "Nuevo",
    image: "assets/transpallet.jpg",
    description: "Zorra transpaleta eléctrica BT Levio. Compacta, ligera y potente, diseñada para operaciones de carga y descarga rápidas en camiones y depósitos de venta minorista. Parada de seguridad de emergencia.",
    specs: {
      voltage: "24V / Lithium-Ion",
      turningRadius: "1390 mm",
      controller: "Toyota Powerdrive",
      mastType: "Simple de perfil bajo"
    }
  },
  {
    id: "hecha-hpt30",
    name: "Hecha HPT30",
    brand: "Hecha",
    type: "Zorra Transpallet",
    capacity: 3000,
    height: 0.2,
    year: 2025,
    condition: "Nuevo",
    image: "assets/transpallet.jpg",
    description: "Transpaleta manual (zorra) Hecha super reforzada. Capacidad de carga de 3 toneladas, ruedas dobles de poliuretano de alta durabilidad y bomba hidráulica monobloque a prueba de fugas.",
    specs: {
      chassis: "Acero reforzado de 4mm",
      wheels: "Doble rodillo de Poliuretano",
      pump: "Hidráulica monobloque",
      mastType: "Manual"
    }
  },
  {
    id: "toyota-lwe160-usada",
    name: "Toyota LWE160",
    brand: "Toyota",
    type: "Zorra Transpallet",
    capacity: 1600,
    height: 0.2,
    year: 2022,
    condition: "Usado",
    image: "assets/transpallet.jpg",
    description: "Zorra transpaleta eléctrica Toyota BT Levio usada y totalmente reacondicionada a nuevo en nuestro taller. Batería en excelente estado de salud, ideal para trabajos de media intensidad a costo reducido.",
    specs: {
      voltage: "24V BT Castor Link",
      turningRadius: "1350 mm",
      controller: "Toyota AC Drive",
      mastType: "Simple de perfil bajo"
    }
  }
];

const spareParts = [
  // Bombas e Hidráulica
  { oem: "HYD-4022", name: "Bomba Hidráulica de Engranajes", machine: "Toyota 8FG25", system: "hidraulico", category: "bombas", price: 2200, stock: "in", desc: "Bomba principal de flujo constante para mástiles triples", image: "assets/bomba_hidraulica.jpg" },
  { oem: "HYD-4050", name: "Válvula de Control Multipista", machine: "Hangcha XS-20", system: "hidraulico", category: "valvulas", price: 1450, stock: "in", desc: "Distribuidor hidráulico de 3 vías con joystick incorporado", image: "assets/bomba_hidraulica.jpg" },
  { oem: "HYD-5011", name: "Juego de Sellos Cilindro Elevación", machine: "HELI CPD15", system: "hidraulico", category: "sellos", price: 280, stock: "low", desc: "Retenes de poliuretano de alta resistencia a la fricción", image: "assets/bomba_hidraulica.jpg" },
  { oem: "HYD-1022", name: "Filtro de Aceite Hidráulico OEM-FIL-HID", machine: "Toyota 7FBE18", system: "hidraulico", category: "filtros", price: 85, stock: "in", desc: "Filtro de retorno de microfibra de 10 micrones", image: "assets/forklift_parts.png" },

  // Carburadores y Motor
  { oem: "CAR-4Y01", name: "Carburador Industrial Toyota 4Y", machine: "Toyota 8FG25", system: "motor", category: "carburadores", price: 680, stock: "in", desc: "Carburador dual Nafta/GNC de alta eficiencia para motores Toyota 4Y", image: "assets/carburador_motor.jpg" },
  { oem: "CAR-K250", name: "Carburador Industrial Nissan K25", machine: "Hangcha CPCD35", system: "motor", category: "carburadores", price: 720, stock: "in", desc: "Carburador completo reacondicionado original para motor Nissan K25", image: "assets/carburador_motor.jpg" },
  { oem: "ENG-8012", name: "Filtro de Combustible Diésel", machine: "Hangcha CPCD35", system: "motor", category: "filtros", price: 95, stock: "in", desc: "Filtro de combustible de alta capacidad con separador de agua", image: "assets/carburador_motor.jpg" },
  { oem: "ENG-9033", name: "Alternador de Motor 12V 80A", machine: "Hecha HQ25D", system: "motor", category: "electrico", price: 420, stock: "low", desc: "Alternador reforzado contra polvo y vibraciones industriales", image: "assets/carburador_motor.jpg" },
  { oem: "TRN-2015", name: "Disco de Fricción Transmisión Powershift", machine: "Toyota 8FG25", system: "motor", category: "mecanico", price: 310, stock: "in", desc: "Placa de fricción de bronce sintetizado para transmisión powershift", image: "assets/carburador_motor.jpg" },

  // Neumáticos y Ruedas
  { oem: "NEU-7001", name: "Neumático Macizo Súper Elástico 7.00-12", machine: "Toyota 8FG25", system: "rodado", category: "neumaticos", price: 350, stock: "in", desc: "Cubierta maciza de goma antihuella para autoelevadores de 2.5 Tn", image: "assets/neumaticos_ruedas.jpg" },
  { oem: "NEU-6009", name: "Rueda Directriz de Poliuretano 200x50", machine: "Toyota SWE120", system: "rodado", category: "neumaticos", price: 180, stock: "in", desc: "Rueda de tracción de poliuretano vulcanizado para zorras y apiladores", image: "assets/neumaticos_ruedas.jpg" },
  { oem: "NEU-5002", name: "Llantas de Acero Dividida 5.00F-10", machine: "HELI CPD15", system: "rodado", category: "neumaticos", price: 290, stock: "in", desc: "Juego de llantas apernadas reforzadas para eje delantero", image: "assets/neumaticos_ruedas.jpg" },

  // Sistema Eléctrico / Baterías
  { oem: "ELE-1090", name: "Controlador de Motor AC Zapi Dual", machine: "Hangcha XS-20", system: "electrico", category: "controladores", price: 2400, stock: "low", desc: "Inversor de frecuencia AC programable para tracción y elevación", image: "assets/bateria_electrica.jpg" },
  { oem: "ELE-4850", name: "Batería Industrial de Tracción 48V 500Ah", machine: "Hangcha XS-20", system: "electrico", category: "baterias", price: 1850, stock: "in", desc: "Cofre completo de celdas de plomo-ácido con sistema de llenado centralizado", image: "assets/bateria_electrica.jpg" },
  { oem: "ELE-3012", name: "Faro de Seguridad LED Blue Spot", machine: "HELI CPD15", system: "electrico", category: "luces", price: 140, stock: "in", desc: "Proyector de haz azul de seguridad de alta visibilidad para almacenes", image: "assets/bateria_electrica.jpg" },

  // Mástil y Desplazador
  { oem: "MST-5020", name: "Rodamiento de Mástil Telescópico 3m", machine: "Toyota 8FG25", system: "mastil", category: "mecanico", price: 210, stock: "in", desc: "Rodamiento radial y axial reforzado para perfil de mástil", image: "assets/forklift_parts.png" },
  { oem: "MST-9102", name: "Cadena de Elevación Flar (BL634)", machine: "Hangcha CPCD35", system: "mastil", category: "mecanico", price: 460, stock: "low", desc: "Cadena de eslabones de acero aleado de alta tensión", image: "assets/forklift_parts.png" }
];

function ensureDatabaseSeeded() {
  try {
    if (!localStorage.getItem('m9-inventory-db')) {
      const initialDB = {
        autoelevadores: [
          { id: 1, name: 'Hangcha XS-20 Eléctrico', brand: 'Hangcha', capacity: '2.000 kg', motor: 'Eléctrico', hours: 1200, price: 18500, status: 'active', visible: true, img: 'assets/electric_forklift.png' },
          { id: 2, name: 'HELI CPD15 Eléctrico',     brand: 'HELI',    capacity: '1.500 kg', motor: 'Eléctrico', hours: 850,  price: 14200, status: 'active', visible: true, img: 'assets/apiladora.jpg' },
          { id: 3, name: 'Toyota 8FGF15 GLP',         brand: 'Toyota',  capacity: '1.500 kg', motor: 'GLP',       hours: 3400, price: 22000, status: 'active', visible: true, img: 'assets/autoelevador.jpg' },
          { id: 4, name: 'Hangcha CPCD35 Diesel',     brand: 'Hangcha', capacity: '3.500 kg', motor: 'Diesel',    hours: 2100, price: 27500, status: 'active', visible: true, img: 'assets/diesel_forklift.png' },
          { id: 5, name: 'Hecha CBD20 Eléctrico',     brand: 'Hecha',   capacity: '2.000 kg', motor: 'Eléctrico', hours: 600,  price: 12800, status: 'paused', visible: false, img: 'assets/apilador.png' },
        ],
        repuestos: [
          { id: 1, oem: 'OEM-BAT-48500', name: 'Batería 48V 500Ah',   category: 'Eléctrico',  stock: 12, price: 1850, status: 'active', compat: 'Hangcha XS-20, HELI CPD15', img: 'assets/bateria_electrica.jpg' },
          { id: 2, oem: 'OEM-FIL-HID',  name: 'Filtro Hidráulico',    category: 'Hidráulico', stock: 45, price: 85,   status: 'active', compat: 'Universal',                   img: 'assets/forklift_parts.png' },
          { id: 3, oem: 'OEM-PAF-T15',  name: 'Pastillas de Freno',   category: 'Frenos',     stock: 8,  price: 120,  status: 'active', compat: 'Toyota 8FGF15, HELI CPD15',   img: 'assets/forklift_parts.png' },
          { id: 4, oem: 'OEM-BOM-H20',  name: 'Bomba Hidráulica',     category: 'Hidráulico', stock: 3,  price: 2200, status: 'active', compat: 'Hangcha XS-20, Hangcha CPCD35', img: 'assets/bomba_hidraulica.jpg' },
          { id: 5, oem: 'OEM-CAR-4880', name: 'Cargador 48V 80A',     category: 'Eléctrico',  stock: 6,  price: 780,  status: 'active', compat: 'Universal eléctrico',         img: 'assets/bateria_electrica.jpg' },
          { id: 6, oem: 'OEM-MAS-T3M',  name: 'Mástil Telescópico 3m',category: 'Estructura', stock: 0,  price: 4500, status: 'paused', compat: 'Hangcha XS-20',                 img: 'assets/forklift_parts.png' },
        ],
        camiones: [
          { id: 1, name: 'Mercedes Benz Actros 2651', brand: 'Mercedes Benz', capacity: '26 Tn', motor: 'Diesel', hours: 380000, price: 95000, status: 'active', visible: true, img: 'assets/truck.png' },
          { id: 2, name: 'Volvo FH 460',              brand: 'Volvo',         capacity: '24 Tn', motor: 'Diesel', hours: 210000, price: 110000, status: 'active', visible: true, img: 'assets/truck.png' },
          { id: 3, name: 'Scania R450 6×2',           brand: 'Scania',        capacity: '22 Tn', motor: 'Diesel', hours: 290000, price: 88000, status: 'paused', visible: false, img: 'assets/truck.png' },
        ],
        leads: {
          nuevas: [
            { id: 'L001', client: 'Juan García', phone: '+54 9 11 5678-1234', product: 'Autoelevador Eléctrico 2T', date: '2026-07-23', urgency: 'alta', notes: [] },
            { id: 'L002', client: 'Logística del Sur SRL', phone: '+54 9 11 8765-4321', product: '5 unidades Hangcha XS-20', date: '2026-07-22', urgency: 'alta', notes: [] },
          ],
          cotizacion: [
            { id: 'L003', client: 'Carlos Mendoza', phone: '+54 9 11 5555-4444', product: 'Filtro hidráulico OEM-FIL-HID x10', date: '2026-07-21', urgency: 'media', notes: ['Cliente pidió precio final el viernes'] },
          ],
          enviado: [
            { id: 'L004', client: 'Frigorífico Norte SA', phone: '+54 9 11 7777-8888', product: 'Hangcha CPCD35 Diesel 3.5T', date: '2026-07-19', urgency: 'media', notes: ['Presupuesto enviado por mail el 19/07'] },
          ],
          ganado: [
            { id: 'L005', client: 'Distribuidora Pérez', phone: '+54 9 11 9999-0000', product: '2× HELI CPD15 Eléctrico', date: '2026-07-15', urgency: 'normal', notes: ['¡Cerrado! Entrega programada para 30/07'] },
          ],
        },
        reviews: [
          { id: 'R001', author: 'Carlos Mendoza', stars: 5, date: 'hace 2 meses', text: 'Excelente atención y servicio. Compramos un autoelevador Toyota y quedamos muy conformes con la calidad del equipo y el asesoramiento del equipo de ventas. Muy profesionales.', visible: true },
          { id: 'R002', author: 'Logística del Sur SRL', stars: 4, date: 'hace 4 meses', text: 'Adquirimos 3 unidades Hangcha para nuestro depósito. El servicio postventa es impecable, responden rápido y los repuestos son originales. Los recomendamos sin dudas.', visible: true },
          { id: 'R003', author: 'María González', stars: 5, date: 'hace 1 mes', text: 'Muy buena experiencia. El equipo de trabajo es muy atento y nos asesoraron perfectamente para elegir el apilador eléctrico que necesitábamos. Entrega en tiempo y forma.', visible: true },
          { id: 'R004', author: 'Distribuidora Norte SA', stars: 4, date: 'hace 6 meses', text: 'Buen servicio técnico y atención al cliente. Los repuestos OEM llegan rápido y a buen precio. Seguimos eligiéndolos para el mantenimiento de toda nuestra flota.', visible: true },
          { id: 'R005', author: 'Ricardo Flores', stars: 5, date: 'hace 3 semanas', text: 'Compramos un autoelevador diesel de segunda mano en excelente estado. Precio justo, documentación en orden y garantía real. Muy recomendable para empresas que buscan calidad.', visible: true },
        ]
      };
      localStorage.setItem('m9-inventory-db', JSON.stringify(initialDB));
    }
  } catch(e) {}
}

// 2. DOM CONTENT LOADER & ROUTING
document.addEventListener("DOMContentLoaded", () => {
  ensureDatabaseSeeded();
  setupNavbar();
  
  // Detect current page with cleanUrls support (.html optional)
  const path = window.location.pathname;
  const rawPage = path.split("/").pop() || "index.html";
  const cleanPage = rawPage.replace(".html", "").toLowerCase();
  
  if (cleanPage === "index" || cleanPage === "") {
    initHomePage();
  } else if (cleanPage === "catalog") {
    initCatalogPage();
  } else if (cleanPage === "repuestos") {
    initPartsPage();
  } else if (cleanPage === "detalle") {
    initDetailPage();
  }
  
  setupGlobalModals();
  attachQuoteEvents();
});

// NAVBAR FUNCTIONALITY
function setupNavbar() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      toggle.querySelectorAll("span").forEach((bar, idx) => {
        if (menu.classList.contains("active")) {
          if (idx === 0) bar.style.transform = "rotate(45deg) translate(6px, 6px)";
          if (idx === 1) bar.style.opacity = "0";
          if (idx === 2) bar.style.transform = "rotate(-45deg) translate(5px, -5px)";
        } else {
          bar.style.transform = "none";
          bar.style.opacity = "1";
        }
      });
    });
  }
  
  // Highlight active link based on current page
  const links = document.querySelectorAll(".nav-link");
  const rawPage = window.location.pathname.split("/").pop() || "index.html";
  const currentClean = rawPage.replace(".html", "").toLowerCase();
  
  links.forEach(link => {
    const href = (link.getAttribute("href") || "").replace(".html", "").toLowerCase();
    if (href === currentClean || (currentClean === "" && (href === "index" || href === "/"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// 3. HOME PAGE ENGINE
function initHomePage() {

  // ── Entrance animations ──────────────────────────────────────
  const heroText    = document.getElementById('hero-text-parallax');
  const heroBadge   = document.getElementById('hero-brand-badge');
  const heroForklift = document.getElementById('hero-forklift-parallax');
  const heroModelBadge = document.querySelector('.hero-v2-model-badge');

  // Staggered reveal on load
  requestAnimationFrame(() => {
    if (heroText)       heroText.classList.add('visible');
    if (heroBadge)      heroBadge.classList.add('visible');
    if (heroForklift)   heroForklift.classList.add('visible');
    if (heroModelBadge) heroModelBadge.classList.add('visible');
  });

  // ── Scroll Parallax ──────────────────────────────────────────
  const heroBg = document.getElementById('hero-bg-parallax');
  const heroEl = document.getElementById('hero-main');
  let   ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  function updateParallax() {
    const scrolled    = window.pageYOffset;
    const heroHeight  = heroEl ? heroEl.offsetHeight : window.innerHeight;

    // Only animate while hero is visible
    if (scrolled < heroHeight * 1.5) {

      // Background drifts up slowest (deepest layer)
      if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.45}px)`;
      }

      // Forklift drifts at intermediate speed — creates "floating above" depth
      if (heroForklift) {
        // Pause the CSS float animation while scrolling so transforms don't conflict
        const isScrolling = scrolled > 30;
        heroForklift.style.animationPlayState = isScrolling ? 'paused' : 'running';
        if (isScrolling) {
          heroForklift.style.transform = `translateY(${scrolled * 0.18}px)`;
        } else {
          heroForklift.style.transform = '';
        }
      }

      // Text floats up slightly + fades out gently
      if (heroText) {
        heroText.style.transform = `translateY(${scrolled * 0.08}px)`;
        heroText.style.opacity   = `${Math.max(0, 1 - scrolled * 0.0018)}`;
      }
    }

    ticking = false;
  }

  // ── Category Slider Progress Listener ───────────────────────
  const catGrid = document.querySelector('.category-grid');
  const catProgressBar = document.getElementById('category-progress-bar');
  if (catGrid && catProgressBar) {
    catGrid.addEventListener('scroll', () => {
      const maxScroll = catGrid.scrollWidth - catGrid.clientWidth;
      if (maxScroll > 0) {
        const ratio = Math.min(1, Math.max(0, catGrid.scrollLeft / maxScroll));
        catProgressBar.style.width = `${33.3 + (ratio * 66.7)}%`;
      }
    }, { passive: true });
  }

  // ── Why Us Mobile Collapsible Listener ───────────────────────
  const whyUsToggleBtn = document.getElementById('why-us-toggle-btn');
  const whyUsList = document.getElementById('why-us-list');
  const whyUsToggleText = document.getElementById('why-us-toggle-text');
  
  if (whyUsToggleBtn && whyUsList && whyUsToggleText) {
    whyUsToggleBtn.addEventListener('click', () => {
      const isExpanded = whyUsList.classList.contains('expanded');
      if (isExpanded) {
        whyUsList.classList.remove('expanded');
        whyUsList.classList.add('collapsed');
        whyUsToggleBtn.classList.remove('expanded');
        whyUsToggleText.textContent = 'Ver todos los beneficios';
        whyUsToggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        whyUsList.classList.remove('collapsed');
        whyUsList.classList.add('expanded');
        whyUsToggleBtn.classList.add('expanded');
        whyUsToggleText.textContent = 'Ver menos';
        whyUsToggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // ── Home Parts Quick Search routing ──────────────────────────
  const quickSearchForm = document.getElementById('home-parts-search');
  if (quickSearchForm) {
    quickSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('home-search-input').value;
      if (query.trim()) {
        window.location.href = `repuestos.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
}


// 4. CATALOG PAGE ENGINE
function initCatalogPage() {
  const grid = document.getElementById("catalog-grid");
  const capacityRange = document.getElementById("filter-capacity");
  const capacityVal = document.getElementById("capacity-val");
  
  if (!grid) return;

  // 1. Combine static forklifts dataset with CRM items from localStorage
  let allEquipments = [...forklifts];
  try {
    const rawDB = localStorage.getItem('m9-inventory-db');
    if (rawDB) {
      const parsedDB = JSON.parse(rawDB);
      if (parsedDB.autoelevadores && Array.isArray(parsedDB.autoelevadores)) {
        parsedDB.autoelevadores.forEach(crmItem => {
          if (crmItem.visible !== false && !allEquipments.some(e => e.name.toLowerCase() === crmItem.name.toLowerCase())) {
            let capKg = 2500;
            if (crmItem.capacity) {
              const numMatch = crmItem.capacity.replace('.', '').match(/\d+/);
              if (numMatch) capKg = parseInt(numMatch[0]);
            }
            allEquipments.push({
              id: `crm-auto-${crmItem.id}`,
              name: crmItem.name,
              brand: crmItem.brand,
              type: crmItem.type || "Autoelevador",
              capacity: capKg,
              height: crmItem.height || 4.5,
              year: crmItem.year || 2025,
              condition: crmItem.condition || "Nuevo",
              image: crmItem.img ? crmItem.img.replace('../', '') : "assets/diesel_forklift.png",
              description: `Equipo de elevación industrial ${crmItem.brand} ${crmItem.name}.`,
              specs: {
                engine: crmItem.motor || "Convencional",
                transmission: "Powershift",
                hours: crmItem.hours ? `${crmItem.hours} hs` : "0 hs"
              }
            });
          }
        });
      }
    }
  } catch(e) { /* fallback to static forklifts */ }

  // 2. Populate Brand Filter Checkboxes Dynamically
  const brandContainer = document.getElementById("brand-filter-options");
  if (brandContainer) {
    const allBrands = [...new Set(allEquipments.map(item => item.brand).filter(Boolean))].sort();
    brandContainer.innerHTML = allBrands.map(b => `
      <label class="checkbox-label">
        <input type="checkbox" value="${b}" data-filter="brand" class="filter-checkbox">
        ${b}
      </label>
    `).join('');
  }

  // Render Function
  function renderForklifts(filteredData) {
    grid.innerHTML = "";
    if (filteredData.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; border: 1px dashed var(--border-color); border-radius: 8px;">
          <h3 style="font-family: var(--font-headings); font-size: 1.5rem; margin-bottom: 0.5rem;">No se encontraron equipos</h3>
          <p>Intente flexibilizar los filtros técnicos aplicados.</p>
        </div>
      `;
      return;
    }

    filteredData.forEach(fork => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-card-img-wrapper">
          <img class="product-card-img" src="${fork.image}" alt="${fork.name}" loading="lazy">
          <div class="product-card-badges">
            <span class="badge badge-yellow">${fork.condition}</span>
            <span class="badge badge-grey">${fork.type}</span>
          </div>
        </div>
        <div class="product-card-content">
          <span class="product-card-brand">${fork.brand}</span>
          <h3 class="product-card-title">${fork.name}</h3>
          <div class="product-card-specs">
            <div class="product-card-spec">
              <span class="product-card-spec-label">Capacidad</span>
              <span class="product-card-spec-val">${(fork.capacity / 1000).toFixed(1)} TN</span>
            </div>
            <div class="product-card-spec">
              <span class="product-card-spec-label">Elevación</span>
              <span class="product-card-spec-val">${fork.height.toFixed(1)} m</span>
            </div>
            <div class="product-card-spec">
              <span class="product-card-spec-label">Año</span>
              <span class="product-card-spec-val">${fork.year}</span>
            </div>
            <div class="product-card-spec">
              <span class="product-card-spec-label">Tracción</span>
              <span class="product-card-spec-val">${fork.type === "Autoelevador" ? "Nafta/GNC/Diésel" : "Eléctrica"}</span>
            </div>
          </div>
          <div class="product-card-actions">
            <a href="detalle.html?id=${fork.id}" class="btn btn-secondary">Ver Detalle</a>
            <button class="btn btn-primary open-quote-modal" data-product="${fork.name}">Cotizar</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    attachQuoteEvents();
  }

  // Update capacity label on input
  if (capacityRange && capacityVal) {
    capacityRange.addEventListener("input", () => {
      const tons = (capacityRange.value / 1000).toFixed(1);
      capacityVal.textContent = `${tons} TN`;
      applyFilters();
    });
  }

  // ── Mobile Catalog Filter Toggle & Active Count Badge ─────────
  const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
  const filtersContent = document.getElementById('filters-sidebar-content');
  const filterCountBadge = document.getElementById('filter-count-badge');

  if (mobileFilterToggle && filtersContent) {
    mobileFilterToggle.addEventListener('click', () => {
      const isExpanded = filtersContent.classList.contains('expanded-mobile');
      if (isExpanded) {
        filtersContent.classList.remove('expanded-mobile');
        filtersContent.classList.add('collapsed-mobile');
        mobileFilterToggle.classList.remove('active');
        mobileFilterToggle.setAttribute('aria-expanded', 'false');
      } else {
        filtersContent.classList.remove('collapsed-mobile');
        filtersContent.classList.add('expanded-mobile');
        mobileFilterToggle.classList.add('active');
        mobileFilterToggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function updateMobileFilterCountBadge() {
    if (!filterCountBadge) return;
    const activeCheckboxes = document.querySelectorAll('.filter-checkbox:checked').length;
    if (activeCheckboxes > 0) {
      filterCountBadge.textContent = activeCheckboxes;
      filterCountBadge.style.display = 'inline-block';
    } else {
      filterCountBadge.style.display = 'none';
    }
  }

  function applyFilters() {
    const selectedTypes = Array.from(document.querySelectorAll("input[data-filter='type']:checked")).map(el => el.value);
    const selectedBrands = Array.from(document.querySelectorAll("input[data-filter='brand']:checked")).map(el => el.value);
    const selectedConds = Array.from(document.querySelectorAll("input[data-filter='condition']:checked")).map(el => el.value);
    const maxCapacity = parseInt(capacityRange ? capacityRange.value : 7000);

    const filtered = allEquipments.filter(fork => {
      if (fork.type === "Camión" || fork.type === "Camiones") return false;
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(fork.type);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(fork.brand);
      const matchCond = selectedConds.length === 0 || selectedConds.includes(fork.condition);
      const matchCapacity = fork.capacity <= maxCapacity;

      return matchType && matchBrand && matchCond && matchCapacity;
    });

    updateMobileFilterCountBadge();
    renderForklifts(filtered);
  }

  // Attach change listeners to all checkboxes (including dynamically generated brands)
  document.querySelectorAll(".filter-checkbox").forEach(cb => {
    cb.addEventListener("change", applyFilters);
  });

  // Parse URL search parameters (e.g. ?type=Autoelevador, ?brand=Hangcha)
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get("type");
  const brandParam = urlParams.get("brand");

  if (typeParam) {
    const typeCb = document.querySelector(`input[data-filter='type'][value='${typeParam}']`);
    if (typeCb) typeCb.checked = true;
  }

  if (brandParam) {
    const brandCb = document.querySelector(`input[data-filter='brand'][value='${brandParam}']`);
    if (brandCb) brandCb.checked = true;
  }

  // Initial filtered render
  applyFilters();
}

function getMergedSpareParts() {
  let list = [...spareParts];
  try {
    const rawDB = localStorage.getItem('m9-inventory-db');
    if (rawDB) {
      const parsedDB = JSON.parse(rawDB);
      if (parsedDB.repuestos && Array.isArray(parsedDB.repuestos)) {
        parsedDB.repuestos.forEach(r => {
          if (r.status !== 'paused' && !list.some(x => x.oem === r.oem)) {
            let cat = "mecanico";
            const cLower = (r.category || "").toLowerCase();
            if (cLower.includes("eléctrico") || cLower.includes("electrico")) cat = "baterias";
            else if (cLower.includes("hidráulico") || cLower.includes("hidraulico")) cat = "bombas";
            else if (cLower.includes("filtro")) cat = "filtros";
            else if (cLower.includes("freno")) cat = "mecanico";

            let sys = "motor";
            if (cat === "baterias") sys = "electrico";
            if (cat === "bombas") sys = "hidraulico";

            let img = r.img ? r.img.replace('../', '').replace(/^\//, '') : "assets/forklift_parts.png";

            list.push({
              oem: r.oem,
              name: r.name,
              machine: r.compat || "Universal",
              system: sys,
              category: cat,
              price: r.price,
              stock: r.stock > 0 ? "in" : "low",
              desc: `Repuesto ${r.name} (${r.oem}). Compatible con ${r.compat || 'varios modelos'}.`,
              image: img
            });
          }
        });
      }
    }
  } catch(e) {}
  return list;
}

// 5. TECHNICAL PARTS SEARCH ENGINE (image_2.png style)
function initPartsPage() {
  const machineSelect = document.getElementById("select-machine");
  const systemSelect = document.getElementById("select-system");
  const categorySelect = document.getElementById("select-category");
  const partsTableBody = document.getElementById("parts-table-body");
  const partsSearchInput = document.getElementById("parts-search-input");
  const partsCountLabel = document.getElementById("parts-count-val");
  const clearFiltersBtn = document.getElementById("clear-parts-filters");

  if (!partsTableBody) return;

  const currentSpareParts = getMergedSpareParts();

  // Initialize unique selector values
  const machines = [...new Set(currentSpareParts.map(p => p.machine))];
  
  machines.forEach(m => {
    const option = document.createElement("option");
    option.value = m;
    option.textContent = m;
    machineSelect.appendChild(option);
  });

  // Cascading logic events
  machineSelect.addEventListener("change", () => {
    // Enable and update systems
    if (machineSelect.value) {
      systemSelect.removeAttribute("disabled");
      const matchedSystems = [...new Set(currentSpareParts.filter(p => p.machine === machineSelect.value).map(p => p.system))];
      
      systemSelect.innerHTML = `<option value="">-- Seleccionar Sistema --</option>`;
      matchedSystems.forEach(s => {
        const option = document.createElement("option");
        option.value = s;
        option.textContent = formatSystemName(s);
        systemSelect.appendChild(option);
      });
    } else {
      systemSelect.setAttribute("disabled", "true");
      systemSelect.innerHTML = `<option value="">-- Primero seleccione equipo --</option>`;
      categorySelect.setAttribute("disabled", "true");
      categorySelect.innerHTML = `<option value="">-- Primero seleccione sistema --</option>`;
    }
    applyPartsFilter();
  });

  systemSelect.addEventListener("change", () => {
    if (systemSelect.value) {
      categorySelect.removeAttribute("disabled");
      const matchedCats = [...new Set(currentSpareParts.filter(p => 
        p.machine === machineSelect.value && 
        p.system === systemSelect.value
      ).map(p => p.category))];
      
      categorySelect.innerHTML = `<option value="">-- Seleccionar Categoría --</option>`;
      matchedCats.forEach(c => {
        const option = document.createElement("option");
        option.value = c;
        option.textContent = formatCategoryName(c);
        categorySelect.appendChild(option);
      });
    } else {
      categorySelect.setAttribute("disabled", "true");
      categorySelect.innerHTML = `<option value="">-- Primero seleccione sistema --</option>`;
    }
    applyPartsFilter();
  });

  categorySelect.addEventListener("change", applyPartsFilter);
  
  if (partsSearchInput) {
    partsSearchInput.addEventListener("input", applyPartsFilter);
  }

  // Category cards click interaction
  const catCards = document.querySelectorAll(".part-cat-card");
  catCards.forEach(card => {
    card.addEventListener("click", () => {
      const catKey = card.dataset.catKey;
      
      // Toggle active class on cards
      catCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      // Filter logic according to key
      let matched = [];
      if (catKey === "bombas") {
        matched = currentSpareParts.filter(p => p.system === "hidraulico" || p.category === "bombas");
      } else if (catKey === "neumaticos") {
        matched = currentSpareParts.filter(p => p.category === "neumaticos" || p.system === "rodado");
      } else if (catKey === "carburadores") {
        matched = currentSpareParts.filter(p => p.system === "motor" || p.category === "carburadores");
      } else if (catKey === "electrico") {
        matched = currentSpareParts.filter(p => p.system === "electrico" || p.category === "baterias" || p.category === "controladores");
      } else {
        matched = currentSpareParts;
      }

      renderPartsTable(matched);

      // Scroll to table smoothly
      const resultsSection = document.querySelector(".parts-results-section");
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      machineSelect.value = "";
      systemSelect.innerHTML = `<option value="">-- Primero seleccione equipo --</option>`;
      systemSelect.setAttribute("disabled", "true");
      categorySelect.innerHTML = `<option value="">-- Primero seleccione sistema --</option>`;
      categorySelect.setAttribute("disabled", "true");
      catCards.forEach(c => c.classList.remove("active"));
      if (partsSearchInput) partsSearchInput.value = "";
      applyPartsFilter();
    });
  }

  function formatSystemName(sys) {
    const names = {
      hidraulico: "Sistema Hidráulico",
      motor: "Motor y Transmisión",
      rodado: "Neumáticos y Rodados",
      electrico: "Sistema Eléctrico",
      mastil: "Mástil y Desplazador"
    };
    return names[sys] || sys;
  }

  function formatCategoryName(cat) {
    const names = {
      bombas: "Bombas e Hidráulica",
      carburadores: "Carburadores y Motor",
      neumaticos: "Neumáticos y Ruedas",
      valvulas: "Válvulas de Comando",
      sellos: "Kits de Sellos y Empaques",
      filtros: "Filtros Técnicos",
      baterias: "Baterías e Inversores",
      controladores: "Controladores y Joysticks",
      luces: "Luces e Iluminación",
      mecanico: "Componentes Mecánicos"
    };
    return names[cat] || cat;
  }

  function applyPartsFilter() {
    catCards.forEach(c => c.classList.remove("active"));
    const selectedMachine = machineSelect.value;
    const selectedSystem = systemSelect.value;
    const selectedCategory = categorySelect.value;
    const searchQuery = partsSearchInput ? partsSearchInput.value.toLowerCase().trim() : "";

    const matchedParts = currentSpareParts.filter(part => {
      const matchMachine = !selectedMachine || part.machine === selectedMachine;
      const matchSystem = !selectedSystem || part.system === selectedSystem;
      const matchCategory = !selectedCategory || part.category === selectedCategory;
      
      const matchSearch = !searchQuery || 
        part.oem.toLowerCase().includes(searchQuery) ||
        part.name.toLowerCase().includes(searchQuery) ||
        part.machine.toLowerCase().includes(searchQuery);

      return matchMachine && matchSystem && matchCategory && matchSearch;
    });

    renderPartsTable(matchedParts);
  }

  function renderPartsTable(items) {
    partsTableBody.innerHTML = "";
    partsCountLabel.textContent = items.length;

    if (items.length === 0) {
      partsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            No se encontraron repuestos con los criterios aplicados. Intente otra búsqueda o limpie los filtros.
          </td>
        </tr>
      `;
      return;
    }

    items.forEach(item => {
      const row = document.createElement("tr");
      const stockText = item.stock === "in" ? "En Stock" : "Stock Crítico";
      const stockClass = item.stock === "in" ? "stock-in" : "stock-low";
      const fallbackImg = "assets/forklift_parts.png";
      
      row.innerHTML = `
        <td style="width: 70px;">
          <img src="${item.image || fallbackImg}" alt="${item.name}" class="part-thumb-img" loading="lazy">
        </td>
        <td class="part-oem">${item.oem}</td>
        <td>
          <div class="part-name" style="font-weight: 700;">${item.name}</div>
          <div class="part-compatibility" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Comp. ${item.machine} — ${item.desc}</div>
        </td>
        <td style="font-family: var(--font-headings); font-weight: 700; color: var(--primary-yellow); font-size: 1.05rem; white-space: nowrap;">
          USD $${(item.price || 100).toLocaleString('es-AR')}
        </td>
        <td><span class="stock-status ${stockClass}">${stockText}</span></td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-primary btn-sm add-to-cart-btn" data-oem="${item.oem}" style="padding: 0.4rem 0.85rem; font-size: 0.8rem; margin-right: 0.3rem;">
            🛒 Agregar
          </button>
          <button class="btn btn-outline-yellow btn-sm open-quote-modal" data-product="Repuesto OEM ${item.oem} - ${item.name}" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
            Cotizar
          </button>
        </td>
      `;
      partsTableBody.appendChild(row);
    });

    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const oem = btn.dataset.oem;
        PartsCart.addItem(oem);
      });
    });

    attachQuoteEvents();
  }

  // Initialize Parts Cart Engine
  PartsCart.init();

  // Check URL params for quick home redirects
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  if (searchParam && partsSearchInput) {
    partsSearchInput.value = searchParam;
    applyPartsFilter();
  } else {
    renderPartsTable(currentSpareParts);
  }
}

// 6. PRODUCT DETAIL LOADER
function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || "neo-25e";
  const item = forklifts.find(f => f.id === id);

  if (!item) {
    document.querySelector(".detail-layout").innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 8rem 0;">
        <h2>Equipo no encontrado</h2>
        <p style="margin-bottom: 2rem;">El autoelevador especificado no se encuentra en nuestro catálogo.</p>
        <a href="catalog.html" class="btn btn-primary">Volver al Catálogo</a>
      </div>
    `;
    return;
  }

  // Populate dynamic data
  document.getElementById("detail-brand").textContent = item.brand;
  document.getElementById("detail-title").textContent = item.name;
  document.getElementById("detail-condition-badge").textContent = item.condition;
  document.getElementById("detail-type-badge").textContent = item.type;
  document.getElementById("detail-description").textContent = item.description;

  // Set quotes product name input
  const inputProduct = document.getElementById("quote-product-name");
  if (inputProduct) {
    inputProduct.value = `${item.brand} ${item.name}`;
  }

  // Populate Specs
  const specList = document.getElementById("detail-specs-list");
  if (specList) {
    specList.innerHTML = `
      <div class="detail-spec-row">
        <span>Capacidad de carga</span>
        <span>${item.capacity} kg (${(item.capacity / 1000).toFixed(1)} TN)</span>
      </div>
      <div class="detail-spec-row">
        <span>Altura máxima de elevación</span>
        <span>${item.height.toFixed(1)} metros</span>
      </div>
      <div class="detail-spec-row">
        <span>Año de fabricación</span>
        <span>${item.year}</span>
      </div>
    `;

    // Add unique specs
    for (const [key, value] of Object.entries(item.specs)) {
      let label = key;
      if (key === "voltage") label = "Batería / Tensión";
      else if (key === "engine") label = "Motor Combustión";
      else if (key === "transmission") label = "Transmisión";
      else if (key === "turningRadius") label = "Radio de Giro";
      else if (key === "controller") label = "Controlador Electrónico";
      else if (key === "mastType") label = "Tipo de Mástil";

      const row = document.createElement("div");
      row.className = "detail-spec-row";
      row.innerHTML = `
        <span>${label}</span>
        <span>${value}</span>
      `;
      specList.appendChild(row);
    }
  }

  // Main gallery image
  const mainImg = document.getElementById("gallery-main-img");
  if (mainImg) mainImg.src = item.image;

  // Gallery thumbnails switcher
  const thumbs = document.querySelectorAll(".gallery-thumb");
  thumbs.forEach(thumb => {
    // Generate mock gallery variations or reuse assets
    const type = thumb.getAttribute("data-type");
    const thumbImg = thumb.querySelector("img");
    if (type === "main") {
      thumbImg.src = item.image;
    } else if (type === "detail") {
      thumbImg.src = "assets/hero_forklift.png";
    } else if (type === "parts") {
      thumbImg.src = "assets/forklift_parts.png";
    }

    thumb.addEventListener("click", () => {
      thumbs.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
      if (mainImg) {
        mainImg.style.opacity = "0.3";
        setTimeout(() => {
          mainImg.src = thumbImg.src;
          mainImg.style.opacity = "1";
        }, 150);
      }
    });
  });

  // PDF Spec Sheet download simulation
  const downloadBtn = document.getElementById("pdf-download-btn");
  const progressContainer = document.querySelector(".progress-bar-container");
  const progressBar = document.querySelector(".progress-bar");
  const pdfSizeEl = document.querySelector(".pdf-size");

  if (downloadBtn && progressContainer && progressBar) {
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      downloadBtn.style.pointerEvents = "none";
      downloadBtn.style.opacity = "0.7";
      progressContainer.style.display = "block";
      pdfSizeEl.textContent = "Preparando descarga...";

      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          pdfSizeEl.textContent = "Completado";
          setTimeout(() => {
            progressContainer.style.display = "none";
            progressBar.style.width = "0%";
            downloadBtn.style.pointerEvents = "all";
            downloadBtn.style.opacity = "1";
            pdfSizeEl.textContent = "PDF • 2.4 MB";
            
            // Show successful popup
            openNotificationModal("Ficha Técnica", `La ficha técnica para el equipo ${item.brand} ${item.name} se ha generado y descargado con éxito en su ordenador.`);
          }, 800);
        } else {
          width += 5;
          progressBar.style.width = `${width}%`;
          pdfSizeEl.textContent = `Descargando: ${width}%`;
        }
      }, 80);
    });
  }
}

// 7. GLOBAL MODAL CONTROLS
function setupGlobalModals() {
  const modal = document.getElementById("quote-modal");
  const overlay = modal ? modal.querySelector(".modal-overlay") : null;
  const modalClose = modal ? modal.querySelector(".btn-secondary") : null;
  const form = document.getElementById("modal-quote-form");

  if (modal && overlay) {
    overlay.addEventListener("click", () => closeModal(modal));
  }
  if (modalClose) {
    modalClose.addEventListener("click", () => closeModal(modal));
  }

  // Quote Form Submission logic
  const detailsForm = document.getElementById("detail-quote-form");
  if (detailsForm) {
    detailsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const product = document.getElementById("quote-product-name").value;
      const client = detailsForm.querySelector("input[type='text']").value;
      
      openNotificationModal("Cotización Enviada", `Gracias ${client}. Hemos recibido su consulta para el equipo ${product}. Un asesor comercial premium se contactará con usted a la brevedad.`);
      detailsForm.reset();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const product = document.getElementById("modal-product-title").textContent;
      const clientName = document.getElementById("modal-client-name").value;
      
      closeModal(modal);
      openNotificationModal("Cotización Solicitada", `Estimado ${clientName}, su cotización por el producto "${product}" ha sido registrada con éxito. Recibirá detalles en su casilla de correo.`);
      form.reset();
    });
  }
}

function attachQuoteEvents() {
  const buttons = document.querySelectorAll(".open-quote-modal");
  const modal = document.getElementById("quote-modal");
  
  if (!modal) return;

  buttons.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const productName = btn.getAttribute("data-product") || "Contacto General";
      const titleEl = document.getElementById("modal-product-title");
      if (titleEl) titleEl.textContent = productName;
      
      openModal(modal);
    };
  });
}

function openModal(modalEl) {
  modalEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
  modalEl.classList.remove("active");
  document.body.style.overflow = "";
}

function openNotificationModal(title, text) {
  let notifModal = document.getElementById("notification-modal");
  
  // Create on the fly if it doesn't exist
  if (!notifModal) {
    notifModal = document.createElement("div");
    notifModal.id = "notification-modal";
    notifModal.className = "modal";
    notifModal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-icon">✓</div>
        <h3 id="notif-title"></h3>
        <p id="notif-text" style="color: var(--text-secondary);"></p>
        <button class="btn btn-primary close-notif" style="width: 100%;">Aceptar</button>
      </div>
    `;
    document.body.appendChild(notifModal);
    
    notifModal.querySelector(".modal-overlay").addEventListener("click", () => notifModal.classList.remove("active"));
    notifModal.querySelector(".close-notif").addEventListener("click", () => {
      notifModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  document.getElementById("notif-title").textContent = title;
  document.getElementById("notif-text").textContent = text;
  
  notifModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// ================================================================
// BRANDS CAROUSEL ENGINE
// ================================================================
(function initBrandsCarousel() {
  const INTERVAL_MS = 5000; // ms per slide

  const carousel   = document.getElementById("brands-carousel");
  if (!carousel) return;

  const slides     = carousel.querySelectorAll(".brand-slide");
  const dots       = carousel.querySelectorAll(".brands-dot");
  const prevBtn    = document.getElementById("brands-prev");
  const nextBtn    = document.getElementById("brands-next");
  const progressEl = document.getElementById("brands-progress");

  let current  = 0;
  let timer    = null;

  function goTo(index) {
    // Wrap around
    index = (index + slides.length) % slides.length;

    // Deactivate old
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");

    // Activate new
    current = index;
    slides[current].classList.add("active");
    dots[current].classList.add("active");

    // Reset progress bar & elapsed counter
    elapsedOnPause = 0;
    startProgress(0);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  let slideStartTime = null;   // timestamp when current slide started
  let elapsedOnPause = 0;      // ms already elapsed when paused

  function startProgress(fromMs = 0) {
    if (!progressEl) return;
    const remaining = INTERVAL_MS - fromMs;
    const startPct  = (fromMs / INTERVAL_MS) * 100;
    progressEl.style.transition = "none";
    progressEl.style.width = startPct + "%";
    void progressEl.offsetWidth;  // force reflow
    progressEl.style.transition = `width ${remaining}ms linear`;
    progressEl.style.width = "100%";
  }

  function pauseProgress() {
    if (!progressEl) return;
    // Freeze the bar exactly where it is
    const w = parseFloat(getComputedStyle(progressEl).width);
    const total = parseFloat(getComputedStyle(progressEl.parentElement).width);
    const pct = total > 0 ? (w / total) * 100 : 0;
    progressEl.style.transition = "none";
    progressEl.style.width = pct + "%";
  }

  function startAutoPlay(fromMs = 0) {
    clearInterval(timer);
    const remaining = INTERVAL_MS - fromMs;
    slideStartTime = Date.now() - fromMs;
    timer = setTimeout(() => {
      next();
    }, remaining);
    startProgress(fromMs);
  }

  function stopAutoPlay() {
    clearTimeout(timer);
    clearInterval(timer);
    timer = null;
    // Save how much time has elapsed so we can resume from here
    elapsedOnPause = slideStartTime ? Math.min(Date.now() - slideStartTime, INTERVAL_MS) : 0;
    pauseProgress();
  }

  // Navigation buttons — restart timer cleanly on manual nav
  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); startAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); startAutoPlay(); });

  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      goTo(parseInt(dot.dataset.index, 10));
      startAutoPlay();
    });
  });

  // No mouse interaction — carousel runs continuously

  // Touch / swipe support
  let touchStartX = 0;
  carousel.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  carousel.addEventListener("touchend", e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      if (isInView) startAutoPlay();
    }
  }, { passive: true });

  // Keyboard support when carousel is in view
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { next(); if (isInView) startAutoPlay(); }
    if (e.key === "ArrowLeft")  { prev(); if (isInView) startAutoPlay(); }
  });

  // ── Visibility observer: stop when off-screen, restart when back ──
  let isInView = false;
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isInView = entry.isIntersecting;
      if (isInView) {
        // Carousel just entered the viewport — start fresh
        elapsedOnPause = 0;
        startAutoPlay(0);
      } else {
        // Carousel left the viewport — stop everything cleanly
        stopAutoPlay();
      }
    });
  }, {
    threshold: 0.1  // fire when at least 10% is visible
  });

  visibilityObserver.observe(carousel);
})();


// ================================================================
// SCROLL REVEAL ENGINE
// ================================================================
(function initScrollReveal() {

  // ── 1. Auto-tag elements that need animation ─────────────────
  // (so we don't have to touch every HTML element manually)

  function tag(el, reveal, delay) {
    if (!el) return;
    el.setAttribute("data-reveal", reveal);
    if (delay) el.setAttribute("data-reveal-delay", delay);
  }

  // Brands section header — stagger each child
  tag(document.querySelector(".brands-section-header .section-tag"),        "fade-up", 0);
  tag(document.querySelector(".brands-section-header .brands-section-title"),"fade-up", 100);
  tag(document.querySelector(".brands-section-header .brands-section-sub"),  "fade-up", 200);

  // Carousel entrance — reliable fade-up + scale
  tag(document.querySelector(".brands-carousel-wrap"), "carousel-wrap", 150);

  // Category cards — stagger with fade-up
  document.querySelectorAll(".category-card").forEach((el, i) => {
    tag(el, "scale", i * 120);
  });

  // Section headers (generic)
  document.querySelectorAll(".section-header").forEach(el => {
    tag(el.querySelector(".section-tag"),      "fade-up", 0);
    tag(el.querySelector(".section-title"),    "fade-up", 100);
    tag(el.querySelector(".section-subtitle"), "fade-up", 200);
  });

  // Hero mini stats — stagger
  document.querySelectorAll(".hero-mini-stat").forEach((el, i) => {
    tag(el, "fade-up", i * 100);
  });

  // Parts quick finder box
  tag(document.querySelector(".finder-box"), "scale");

  // Trucks banner content
  tag(document.querySelector(".trucks-banner"), "fade-up");

  // Footer columns
  document.querySelectorAll(".footer-grid > div").forEach((el, i) => {
    tag(el, "fade-up", i * 80);
  });

  // ── 2. Intersection Observer ──────────────────────────────────
  if (!("IntersectionObserver" in window)) {
    // Fallback: reveal everything immediately
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        // Once revealed, stop watching
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,    // trigger as soon as 5% is visible
    rootMargin: "0px 0px 0px 0px"
  });

  // Observe all tagged elements
  document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));

  // ── 3. Watch for dynamically added elements ───────────────────
  // (useful if any section is injected later)
  const mutationObs = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.hasAttribute("data-reveal")) observer.observe(node);
        node.querySelectorAll?.("[data-reveal]").forEach(el => observer.observe(el));
      });
    });
  });
  mutationObs.observe(document.body, { childList: true, subtree: true });

})();

// ================================================================
// REVIEWS CAROUSEL — lee desde localStorage (publicado por el CRM)
// ================================================================
(function initReviewsCarousel() {
  const track    = document.getElementById('reviews-track');
  const dotsWrap = document.getElementById('reviews-dots');
  const prevBtn  = document.getElementById('reviews-prev');
  const nextBtn  = document.getElementById('reviews-next');
  const emptyEl  = document.getElementById('reviews-empty');
  if (!track) return;

  const AVATAR_COLORS = ['#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#ec4899','#14b8a6'];

  // Reseñas de ejemplo — el admin las reemplaza vía localStorage
  const DEFAULT_REVIEWS = [
    { author: 'Carlos Mendoza',       stars: 5, date: 'hace 2 meses',  text: 'Excelente atención y servicio. Compramos un autoelevador Toyota y quedamos muy conformes con la calidad del equipo y el asesoramiento del equipo de ventas. Muy profesionales.' },
    { author: 'Logística del Sur SRL',stars: 5, date: 'hace 4 meses',  text: 'Adquirimos 3 unidades Hangcha para nuestro depósito. El servicio postventa es impecable, responden rápido y los repuestos son originales. Los recomendamos sin dudas.' },
    { author: 'María González',        stars: 5, date: 'hace 1 mes',    text: 'Muy buena experiencia. El equipo de trabajo es muy atento y nos asesoraron perfectamente para elegir el apilador eléctrico que necesitábamos. Entrega en tiempo y forma.' },
    { author: 'Distribuidora Norte SA',stars: 4, date: 'hace 6 meses',  text: 'Buen servicio técnico y atención al cliente. Los repuestos OEM llegan rápido y a buen precio. Seguimos eligiéndolos para el mantenimiento de toda nuestra flota.' },
    { author: 'Ricardo Flores',        stars: 5, date: 'hace 3 semanas',text: 'Compramos un autoelevador diesel de segunda mano en excelente estado. Precio justo, documentación en orden y garantía real. Muy recomendable para empresas que buscan calidad.' },
  ];

  function getColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function starsHTML(n) {
    return Array.from({ length: 5 }, (_, i) =>
      `<svg viewBox="0 0 24 24" width="15" height="15"
        fill="${i < n ? '#ffb800' : 'none'}"
        stroke="#ffb800" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>`
    ).join('');
  }

  function getVisibleCount() {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  // Leer desde localStorage; si no hay datos usar el fallback
  let reviews = DEFAULT_REVIEWS;
  try {
    const stored = localStorage.getItem('m9-reviews');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) reviews = parsed;
    }
  } catch(e) { /* usar default */ }

  // Render cards
  track.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-card-header">
        <div class="review-avatar" style="background:${getColor(r.author)}">
          ${r.author.trim()[0].toUpperCase()}
        </div>
        <div class="review-author-info">
          <div class="review-author-name">${r.author}</div>
          <div class="review-date">${r.date}</div>
        </div>
      </div>
      <div class="review-stars">${starsHTML(r.stars)}</div>
      <p class="review-text">${r.text}</p>
      <div class="review-google-icon">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
    </div>
  `).join('');

  // Carousel logic
  let current = 0;
  let autoTimer = null;

  function maxIndex() {
    return Math.max(0, reviews.length - getVisibleCount());
  }

  function getCardWidth() {
    const card = track.querySelector('.review-card');
    if (!card) return 0;
    return card.getBoundingClientRect().width + 24;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateDots();
    updateBtns();
  }

  function buildDots() {
    if (!dotsWrap) return;
    const total = maxIndex() + 1;
    dotsWrap.innerHTML = Array.from({ length: total }, (_, i) =>
      `<button class="reviews-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Ir a reseña ${i+1}"></button>`
    ).join('');
    dotsWrap.querySelectorAll('.reviews-dot').forEach(dot => {
      dot.addEventListener('click', () => { goTo(+dot.dataset.i); resetAuto(); });
    });
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.reviews-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  function updateBtns() {
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= maxIndex();
  }

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, 5000);
  }

  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  window.addEventListener('resize', () => { buildDots(); goTo(Math.min(current, maxIndex())); });

  track.closest('.reviews-carousel-wrap')?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.closest('.reviews-carousel-wrap')?.addEventListener('mouseleave', () => startAuto());

  // Esperar al siguiente frame para que el DOM esté pintado antes de medir
  requestAnimationFrame(() => {
    buildDots();
    goTo(0);
    startAuto();
  });

})();

// ================================================================
// PARTS SHOPPING CART ENGINE (Exclusive for Spare Parts)
// ================================================================
const PartsCart = {
  items: [],

  init() {
    this.loadFromStorage();
    this.setupUI();
    this.updateUI();
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('m9-parts-cart');
      if (saved) this.items = JSON.parse(saved);
    } catch(e) { this.items = []; }
  },

  saveToStorage() {
    try {
      localStorage.setItem('m9-parts-cart', JSON.stringify(this.items));
    } catch(e) {}
  },

  addItem(oem) {
    const allParts = getMergedSpareParts();
    const part = allParts.find(p => p.oem === oem);
    if (!part) return;

    const existing = this.items.find(i => i.oem === oem);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        oem: part.oem,
        name: part.name,
        price: part.price || 100,
        image: part.image || "assets/forklift_parts.png",
        machine: part.machine,
        quantity: 1
      });
    }

    this.saveToStorage();
    this.updateUI();
    this.openDrawer();
  },

  updateQuantity(oem, delta) {
    const item = this.items.find(i => i.oem === oem);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(oem);
    } else {
      this.saveToStorage();
      this.updateUI();
    }
  },

  removeItem(oem) {
    this.items = this.items.filter(i => i.oem !== oem);
    this.saveToStorage();
    this.updateUI();
  },

  clearCart() {
    this.items = [];
    this.saveToStorage();
    this.updateUI();
  },

  getTotalPrice() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  openDrawer() {
    const overlay = document.getElementById("cart-drawer-overlay");
    if (overlay) overlay.classList.add("open");
  },

  closeDrawer() {
    const overlay = document.getElementById("cart-drawer-overlay");
    if (overlay) overlay.classList.remove("open");
  },

  setupUI() {
    const toggleBtn = document.getElementById("cart-toggle-btn");
    const closeBtn = document.getElementById("cart-close-btn");
    const overlay = document.getElementById("cart-drawer-overlay");
    const clearBtn = document.getElementById("cart-clear-btn");
    const checkoutBtn = document.getElementById("cart-checkout-whatsapp");

    toggleBtn?.addEventListener("click", () => this.openDrawer());
    closeBtn?.addEventListener("click", () => this.closeDrawer());
    
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeDrawer();
    });

    clearBtn?.addEventListener("click", () => this.clearCart());

    checkoutBtn?.addEventListener("click", () => this.checkoutWhatsApp());
  },

  updateUI() {
    const badge = document.getElementById("cart-badge-count");
    const totalFloating = document.getElementById("cart-floating-total");
    const totalDrawer = document.getElementById("cart-total-price");
    const container = document.getElementById("cart-items-container");

    const totalCount = this.getTotalCount();
    const totalPrice = this.getTotalPrice();

    if (badge) badge.textContent = totalCount;
    if (totalFloating) totalFloating.textContent = `USD $${totalPrice.toLocaleString('es-AR')}`;
    if (totalDrawer) totalDrawer.textContent = `USD $${totalPrice.toLocaleString('es-AR')}`;

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom: 1rem;">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h4 style="font-family: var(--font-headings); font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.4rem;">Carrito Vacío</h4>
          <p style="font-size: 0.85rem;">Agregá los repuestos que necesites para generar el pedido rápido por WhatsApp.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-oem">OEM: ${item.oem}</div>
          <div class="cart-item-price-unit">USD $${item.price.toLocaleString('es-AR')} c/u</div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" onclick="PartsCart.updateQuantity('${item.oem}', -1)">−</button>
            <span class="cart-qty-num">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="PartsCart.updateQuantity('${item.oem}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-subtotal">USD $${(item.price * item.quantity).toLocaleString('es-AR')}</div>
        <button class="cart-item-remove" onclick="PartsCart.removeItem('${item.oem}')" title="Quitar item">✕</button>
      </div>
    `).join('');
  },

  checkoutWhatsApp() {
    if (this.items.length === 0) {
      alert("Tu carrito está vacío. Agregá al menos un repuesto antes de continuar.");
      return;
    }

    const number = "5491199999999";
    let message = `*SOLICITUD DE PEDIDO DE REPUESTOS — MAQUINARIAS 9 DE ABRIL*\n\n`;
    message += `Hola, quisiera realizar el pedido de los siguientes repuestos:\n\n`;

    this.items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   • Código OEM: ${item.oem}\n`;
      message += `   • Cantidad: ${item.quantity} u.\n`;
      message += `   • Subtotal: USD $${(item.price * item.quantity).toLocaleString('es-AR')}\n\n`;
    });

    message += `*TOTAL ESTIMADO: USD $${this.getTotalPrice().toLocaleString('es-AR')}*\n\n`;
    message += `Aguardamos confirmación de stock y métodos de pago. Gracias.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${number}?text=${encoded}`, '_blank');
  }
};


