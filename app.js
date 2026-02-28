// app.js - versión corregida para activación (DOMContentLoaded)
// Basada en los archivos originales subidos: index.html y app.js.  [oai_citation:2‡index.html](sediment://file_00000000baa471f5a41cb4f8187483fc)  [oai_citation:3‡app.js](sediment://file_000000009ef871f5b927b21d08b5ca9c)

let config = JSON.parse(localStorage.getItem("config")) || {
  maderas: {
    "Cedro": { costo: 5000, publico: 6500 },
    "Moncoro": { costo: 3800, publico: 4800 },
    "Roble": { costo: 6500, publico: 8000 }
  },
  aserrado: 1200,
  cepillado: 1500
};

/* ---------- Utils ---------- */
function safeKey(name) {
  return name.replace(/\s+/g, '__');
}

/* ---------- Navegación ---------- */
function mostrar(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
  const el = document.getElementById(id);
  if (el) el.classList.add("activa");

  if (id === 'config') cargarConfigUI();
}

/* ---------- Cargar maderas ---------- */
function cargarMaderas() {
  const selectBloque = document.getElementById("madera");
  const selectTabla  = document.getElementById("maderaTabla");

  if (selectBloque) selectBloque.innerHTML = "";
  if (selectTabla)  selectTabla.innerHTML  = "";

  Object.keys(config.maderas).forEach(nombre => {
    const option1 = document.createElement("option");
    option1.value = nombre; option1.textContent = nombre;
    if (selectBloque) selectBloque.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = nombre; option2.textContent = nombre;
    if (selectTabla) selectTabla.appendChild(option2);
  });
}

/* ---------- UX helpers: override toggle ---------- */
function toggleManualOverride() {
  const input = document.getElementById("extraManual");
  const manual = parseFloat((input && input.value) || "0");
  const tipoVentaEl = document.getElementById("tipoVenta");
  if (!tipoVentaEl) return;
  if (manual > 0) {
    tipoVentaEl.disabled = true;
    tipoVentaEl.style.opacity = "0.5";
  } else {
    tipoVentaEl.disabled = false;
    tipoVentaEl.style.opacity = "1";
  }
}

function toggleManualOverrideTabla() {
  const input = document.getElementById("extraManualTabla");
  const manual = parseFloat((input && input.value) || "0");
  const cepilladaEl = document.getElementById("cepilladaTabla");
  if (!cepilladaEl) return;
  if (manual > 0) {
    cepilladaEl.disabled = true;
    cepilladaEl.style.opacity = "0.5";
  } else {
    cepilladaEl.disabled = false;
    cepilladaEl.style.opacity = "1";
  }
}

/* ---------- BLOQUES ---------- */
function calcular() {
  const maderaEl = document.getElementById("madera");
  const madera = maderaEl ? maderaEl.value : null;
  const ancho = parseFloat(document.getElementById("ancho").value);
  const largo = parseFloat(document.getElementById("largo").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const tipoVentaEl = document.getElementById("tipoVenta");
  const tipoVenta = tipoVentaEl ? tipoVentaEl.value : "BRUTO";
  const manualInput = parseFloat(document.getElementById("extraManual").value || "0");

  if (!ancho || !largo || !altura || !madera) {
    alert("Completa todas las medidas");
    return;
  }

  const pies = Math.round((ancho * largo * altura) / 12);
  const piesEl = document.getElementById("piesBloque");
  if (piesEl) piesEl.textContent = "Pies: " + pies;

  const maderaCfg = (config.maderas && config.maderas[madera]) || { costo:0, publico:0 };
  const valorBase = pies * maderaCfg.publico;
  const costo = pies * maderaCfg.costo;

  let extraPorDefecto = 0;
  if (tipoVenta === "ASERRADO") extraPorDefecto = pies * config.aserrado;
  if (tipoVenta === "ASERRADO+CEPILLADO") extraPorDefecto = pies * (config.aserrado + config.cepillado);

  let extra = (manualInput > 0) ? manualInput : extraPorDefecto;

  const total = Math.round(valorBase + extra);
  const utilidad = Math.round(total - costo);

  const resEl = document.getElementById("resultado");
  if (resEl) resEl.textContent = "$" + total.toLocaleString();

  const utilEl = document.getElementById("utilidad");
  if (utilEl) utilEl.textContent = "Utilidad: $" + utilidad.toLocaleString();
}

function guardarVenta() {
  try { calcular(); } catch(e){ console.warn(e); }

  const totalTexto = (document.getElementById("resultado") && document.getElementById("resultado").textContent) || "";
  if (!totalTexto || totalTexto === "$0") {
    alert("Primero calcula la venta");
    return;
  }
  const total = parseInt(totalTexto.replace(/\D/g, ""), 10) || 0;
  guardarEnStorage(total);
}

/* ---------- TABLAS ---------- */
function calcularTabla() {
  const madera = document.getElementById("maderaTabla").value;
  const ancho = parseFloat(document.getElementById("anchoTabla").value);
  const grosor = parseFloat(document.getElementById("grosorTabla").value);
  const altura = parseFloat(document.getElementById("alturaTabla").value);
  const cantidad = parseFloat(document.getElementById("cantidadTabla").value);
  const cepillada = document.getElementById("cepilladaTabla").value;
  const manualTabla = parseFloat(document.getElementById("extraManualTabla").value || "0");

  if (!ancho || !grosor || !altura || !cantidad || !madera) {
    alert("Completa todos los campos");
    return;
  }

  const pieUnitario = (ancho * grosor * altura) / 12;
  const piesTotales = Math.round(pieUnitario * cantidad);

  const piesEl = document.getElementById("piesTablaTot");
  if (piesEl) piesEl.textContent = "Pies totales: " + piesTotales;

  const maderaCfg = (config.maderas && config.maderas[madera]) || { costo:0, publico:0 };
  const valorBase = piesTotales * maderaCfg.publico;
  const costo = piesTotales * maderaCfg.costo;

  let extraPorDefecto = 0;
  if (cepillada === "SI") extraPorDefecto = piesTotales * config.cepillado;

  let extra = (manualTabla > 0) ? manualTabla : extraPorDefecto;

  const total = Math.round(valorBase + extra);
  const utilidad = Math.round(total - costo);

  const resEl = document.getElementById("resultadoTabla");
  if (resEl) resEl.textContent = "$" + total.toLocaleString();

  const utilEl = document.getElementById("utilidadTabla");
  if (utilEl) utilEl.textContent = "Utilidad: $" + utilidad.toLocaleString();
}

function guardarVentaTabla() {
  try { calcularTabla(); } catch(e){ console.warn(e); }
  const totalTexto = (document.getElementById("resultadoTabla") && document.getElementById("resultadoTabla").textContent) || "";
  if (!totalTexto || totalTexto === "$0") {
    alert("Primero calcula la venta");
    return;
  }
  const total = parseInt(totalTexto.replace(/\D/g, ""), 10) || 0;
  guardarEnStorage(total);
}

/* ---------- STORAGE (7 días) ---------- */
function guardarEnStorage(total) {
  const hoy = new Date().toISOString().split("T")[0];
  let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  ventas.push({ fecha: hoy, total });

  ventas = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha);
    const diff = (new Date() - fechaVenta) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  localStorage.setItem("ventas", JSON.stringify(ventas));
  actualizarResumen();
  alert("Venta guardada");
}

function actualizarResumen() {
  const hoy = new Date().toISOString().split("T")[0];
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  const ventasHoy = ventas
    .filter(v => v.fecha === hoy)
    .reduce((sum, v) => sum + v.total, 0);

  const el = document.getElementById("resumenSemana");
  if (el) el.textContent = "Ventas hoy: $" + ventasHoy.toLocaleString();
}

/* ---------- CONFIG UI (edición + borrado) ---------- */
function cargarConfigUI() {
  const asErr = document.getElementById("configAserrado");
  const ceP = document.getElementById("configCepillado");
  if (asErr) asErr.value = config.aserrado;
  if (ceP) ceP.value = config.cepillado;

  const contenedor = document.getElementById("listaMaderas");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  Object.keys(config.maderas).forEach(nombre => {
    const madera = config.maderas[nombre];
    const key = safeKey(nombre);

    const div = document.createElement("div");
    div.className = "madera-row";

    div.innerHTML = `
      <label>Nombre</label>
      <input type="text" id="nombre_${key}" value="${nombre}">

      <label>Costo por pie</label>
      <input type="number" id="costo_${key}" value="${madera.costo}">

      <label>Precio público</label>
      <input type="number" id="publico_${key}" value="${madera.publico}">

      <div class="madera-actions">
        <button class="btn-eliminar" onclick="eliminarMadera('${nombre}')">Eliminar</button>
      </div>
    `;

    contenedor.appendChild(div);
  });
}

function guardarConfig() {
  config.aserrado = parseFloat(document.getElementById("configAserrado").value || 0);
  config.cepillado = parseFloat(document.getElementById("configCepillado").value || 0);

  const nuevasMaderas = {};

  Object.keys(config.maderas).forEach(nombreOriginal => {
    const key = safeKey(nombreOriginal);
    const elNombre = document.getElementById("nombre_" + key);
    const elCosto = document.getElementById("costo_" + key);
    const elPublico = document.getElementById("publico_" + key);

    if (!elNombre) return;

    const nuevoNombre = elNombre.value.trim();
    const nuevoCosto = parseFloat(elCosto.value || 0);
    const nuevoPublico = parseFloat(elPublico.value || 0);

    if (!nuevoNombre) return;

    if (nuevasMaderas[nuevoNombre]) {
      alert("Hay dos maderas con el mismo nombre: " + nuevoNombre + ". Cambia uno de los nombres.");
      throw new Error("Nombre duplicado en configuración");
    }

    nuevasMaderas[nuevoNombre] = {
      costo: nuevoCosto,
      publico: nuevoPublico
    };
  });

  if (Object.keys(nuevasMaderas).length === 0) {
    alert("Debe existir al menos una madera.");
    return;
  }

  config.maderas = nuevasMaderas;

  localStorage.setItem("config", JSON.stringify(config));
  cargarMaderas();
  cargarConfigUI();

  alert("Configuración actualizada correctamente");
}

function eliminarMadera(nombre) {
  if (Object.keys(config.maderas).length <= 1) {
    alert("Debe existir al menos una madera.");
    return;
  }

  if (!confirm("¿Seguro que deseas eliminar la madera: " + nombre + " ?")) return;

  delete config.maderas[nombre];

  localStorage.setItem("config", JSON.stringify(config));

  cargarMaderas();
  cargarConfigUI();
}

function agregarMadera() {
  const nombre = document.getElementById("nuevaMaderaNombre").value.trim();
  const costo = parseFloat(document.getElementById("nuevaMaderaCosto").value || 0);
  const publico = parseFloat(document.getElementById("nuevaMaderaPublico").value || 0);

  if (!nombre || !costo || !publico) {
    alert("Completa todos los datos");
    return;
  }

  if (config.maderas[nombre]) {
    alert("Esa madera ya existe");
    return;
  }

  config.maderas[nombre] = { costo, publico };
  localStorage.setItem("config", JSON.stringify(config));
  cargarConfigUI();
  cargarMaderas();

  document.getElementById("nuevaMaderaNombre").value = "";
  document.getElementById("nuevaMaderaCosto").value = "";
  document.getElementById("nuevaMaderaPublico").value = "";
}

/* ---------- Inicializar (DOMContentLoaded) ---------- */
document.addEventListener('DOMContentLoaded', function () {
  // cargar configuración
  config = JSON.parse(localStorage.getItem("config")) || config;
  cargarMaderas();
  actualizarResumen();
  cargarConfigUI();

  // Activación simple (solo si no está activa)
  try {
    const activa = localStorage.getItem("licenciaActiva");
    const overlay = document.getElementById("licencia-overlay");
    const licenciaInput = document.getElementById("licencia-input");

    if (!overlay) {
      console.warn("No se encontró #licencia-overlay en el DOM");
    } else {
      if (!activa) {
        overlay.style.display = "flex";
        // foco en input si existe
        if (licenciaInput) {
          licenciaInput.focus();
        }
      } else {
        overlay.style.display = "none";
      }
    }
  } catch (err) {
    console.warn("Error comprobando licencia:", err);
  }

  // listeners para comportamiento override UX
  const em = document.getElementById("extraManual");
  if (em) em.addEventListener("input", toggleManualOverride);
  const emt = document.getElementById("extraManualTabla");
  if (emt) emt.addEventListener("input", toggleManualOverrideTabla);

  // --- soporte Enter en input de licencia ---
  const licInput = document.getElementById("licencia-input");
  if (licInput) {
    licInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        verificarLicencia();
      }
    });
  }
});

// ===== SISTEMA DE ACTIVACIÓN SIMPLE =====

// Clave maestra privada
const CLAVES_VALIDAS = [
  "PmX9#72kL!Q4zR"
];

// Verificar clave
function verificarLicencia() {
  const input = document.getElementById("licencia-input");
  const overlay = document.getElementById("licencia-overlay");
  if (!input || !overlay) {
    alert("Error de activación: elemento no encontrado.");
    return;
  }

  const clave = input.value.trim();
  if (!clave) {
    alert("Ingrese la contraseña de activación.");
    input.focus();
    return;
  }

  if (CLAVES_VALIDAS.includes(clave)) {
    try {
      localStorage.setItem("licenciaActiva", "true");
      overlay.style.display = "none";
      input.value = "";
      alert("Activación correcta. La app ya está lista para usar.");
    } catch (err) {
      console.error("Error guardando licencia:", err);
      alert("Error guardando licencia en el dispositivo.");
    }
  } else {
    alert("Contraseña incorrecta");
    input.focus();
  }
}