/* app.js - mejora: edición/borrado en Config + icono tablas + robustez */

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
  // ID-friendly key
  return name.replace(/\s+/g, '__');
}

/* ---------- Navegación ---------- */
function mostrar(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");

  // Si abrimos config, forzamos recargar UI para reflejar cambios
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
  const manual = parseFloat(document.getElementById("extraManual").value || "0");
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
  const manual = parseFloat(document.getElementById("extraManualTabla").value || "0");
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
  const madera = document.getElementById("madera").value;
  const ancho = parseFloat(document.getElementById("ancho").value);
  const largo = parseFloat(document.getElementById("largo").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const tipoVenta = document.getElementById("tipoVenta").value;
  const manualInput = parseFloat(document.getElementById("extraManual").value || "0");

  if (!ancho || !largo || !altura) {
    alert("Completa todas las medidas");
    return;
  }

  // pies redondeados
  const pies = Math.round((ancho * largo * altura) / 12);
  document.getElementById("piesBloque").textContent = "Pies: " + pies;

  const valorBase = pies * config.maderas[madera].publico;
  const costo = pies * config.maderas[madera].costo;

  // extra por defecto (por pie)
  let extraPorDefecto = 0;
  if (tipoVenta === "ASERRADO") extraPorDefecto = pies * config.aserrado;
  if (tipoVenta === "ASERRADO+CEPILLADO") extraPorDefecto = pies * (config.aserrado + config.cepillado);

  // OVERRIDE MANUAL FORZADO: si manualInput > 0 -> uso EXACTO y se ignoran procesos
  let extra = 0;
  if (manualInput > 0) {
    extra = manualInput;
  } else {
    extra = extraPorDefecto;
  }

  const total = Math.round(valorBase + extra);
  const utilidad = Math.round(total - costo);

  document.getElementById("resultado").textContent = "$" + total.toLocaleString();
  document.getElementById("utilidad").textContent = "Utilidad: $" + utilidad.toLocaleString();
}

function guardarVenta() {
  try { calcular(); } catch(e){ /* ignore */ }

  const totalTexto = document.getElementById("resultado").textContent;
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

  if (!ancho || !grosor || !altura || !cantidad) {
    alert("Completa todos los campos");
    return;
  }

  // pie unitario puede ser decimal — pies totales redondeados
  const pieUnitario = (ancho * grosor * altura) / 12;
  const piesTotales = Math.round(pieUnitario * cantidad);

  document.getElementById("piesTablaTot").textContent = "Pies totales: " + piesTotales;

  const valorBase = piesTotales * config.maderas[madera].publico;
  const costo = piesTotales * config.maderas[madera].costo;

  // extra por defecto (por pie) aplicable si cepillada
  let extraPorDefecto = 0;
  if (cepillada === "SI") extraPorDefecto = piesTotales * config.cepillado;

  // OVERRIDE MANUAL FORZADO para tablas: si manualTabla>0 -> uso EXACTO
  let extra = 0;
  if (manualTabla > 0) {
    extra = manualTabla;
  } else {
    extra = extraPorDefecto;
  }

  const total = Math.round(valorBase + extra);
  const utilidad = Math.round(total - costo);

  document.getElementById("resultadoTabla").textContent = "$" + total.toLocaleString();
  document.getElementById("utilidadTabla").textContent = "Utilidad: $" + utilidad.toLocaleString();
}

function guardarVentaTabla() {
  try { calcularTabla(); } catch(e){ /* ignore */ }
  const totalTexto = document.getElementById("resultadoTabla").textContent;
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

  // limpiar >7 días
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

  document.getElementById("resumenSemana").textContent =
    "Ventas hoy: $" + ventasHoy.toLocaleString();
}

/* ---------- CONFIG UI (edición + borrado) ---------- */
function cargarConfigUI() {
  document.getElementById("configAserrado").value = config.aserrado;
  document.getElementById("configCepillado").value = config.cepillado;

  const contenedor = document.getElementById("listaMaderas");
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
  // procesos
  config.aserrado = parseFloat(document.getElementById("configAserrado").value || 0);
  config.cepillado = parseFloat(document.getElementById("configCepillado").value || 0);

  const nuevasMaderas = {};

  Object.keys(config.maderas).forEach(nombreOriginal => {
    const key = safeKey(nombreOriginal);
    const elNombre = document.getElementById("nombre_" + key);
    const elCosto = document.getElementById("costo_" + key);
    const elPublico = document.getElementById("publico_" + key);

    if (!elNombre) return; // por seguridad

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

/* ---------- Inicializar ---------- */
window.onload = function () {
  config = JSON.parse(localStorage.getItem("config")) || config;
  cargarMaderas();
  actualizarResumen();
  cargarConfigUI();

  // listeners para comportamiento override UX
  const em = document.getElementById("extraManual");
  if (em) em.addEventListener("input", toggleManualOverride);
  const emt = document.getElementById("extraManualTabla");
  if (emt) emt.addEventListener("input", toggleManualOverrideTabla);
};