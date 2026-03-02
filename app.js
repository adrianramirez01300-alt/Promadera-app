// app.js — versión comercial nominal (redondeo hacia arriba)

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
function makeId() {
  return String(Date.now()) + '_' + Math.random().toString(36).slice(2);
}

/* ---------- Navegación ---------- */
function mostrar(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
  const el = document.getElementById(id);
  if (el) el.classList.add("activa");
}

/* ---------- Cargar maderas ---------- */
function cargarMaderas() {
  const selectBloque = document.getElementById("madera");
  const selectTabla  = document.getElementById("maderaTabla");

  if (selectBloque) selectBloque.innerHTML = "";
  if (selectTabla)  selectTabla.innerHTML  = "";

  Object.keys(config.maderas).forEach(nombre => {
    const option1 = document.createElement("option");
    option1.value = nombre;
    option1.textContent = nombre;
    if (selectBloque) selectBloque.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = nombre;
    option2.textContent = nombre;
    if (selectTabla) selectTabla.appendChild(option2);
  });
}

/* ---------- BLOQUES ---------- */
function calcular() {
  const madera = document.getElementById("madera").value;
  const ancho = parseFloat(document.getElementById("ancho").value || "0");
  const largo = parseFloat(document.getElementById("largo").value || "0");
  const altura = parseFloat(document.getElementById("altura").value || "0");
  const tipoVenta = document.getElementById("tipoVenta").value;
  const manualInput = parseFloat(document.getElementById("extraManual").value || "0");

  if (!ancho || !largo || !altura || !madera) {
    alert("Completa todas las medidas");
    return;
  }

  const pies = Math.round((ancho * largo * altura) / 12);
  document.getElementById("piesBloque").textContent = "Pies: " + pies;

  const maderaCfg = config.maderas[madera];
  const valorBase = pies * maderaCfg.publico;
  const costo = pies * maderaCfg.costo;

  let extra = 0;
  if (tipoVenta === "ASERRADO") extra = pies * config.aserrado;
  if (tipoVenta === "ASERRADO+CEPILLADO")
    extra = pies * (config.aserrado + config.cepillado);

  if (manualInput > 0) extra = manualInput;

  const total = Math.round(valorBase + extra);
  const utilidad = Math.round(total - costo);

  document.getElementById("resultado").textContent = "$" + total.toLocaleString();
  document.getElementById("utilidad").textContent = "Utilidad: $" + utilidad.toLocaleString();
}

/* ---------- TABLAS (NOMINAL COMERCIAL REAL) ---------- */
function calcularTabla() {
  const madera = document.getElementById("maderaTabla").value;
  const ancho = parseFloat(document.getElementById("anchoTabla").value || "0");
  const grosor = parseFloat(document.getElementById("grosorTabla").value || "0");
  const alturaCm = parseFloat(document.getElementById("alturaTabla").value || "0");
  const cantidad = parseFloat(document.getElementById("cantidadTabla").value || "0");
  const tipoTabla = document.getElementById("tipoTabla").value;
  const manualTabla = parseFloat(document.getElementById("extraManualTabla").value || "0");

  if (!ancho || !grosor || !alturaCm || !cantidad || !madera) {
    alert("Completa todos los campos");
    return;
  }

  // 🔥 CONVERSIÓN NOMINAL (REDONDEO HACIA ARRIBA)
  const anchoPulg = Math.ceil(ancho / 2.54);
  const grosorPulg = Math.ceil(grosor / 2.54);
  const largoPies = Math.ceil(alturaCm / 30.48);

  const pieUnitario = (anchoPulg * grosorPulg * largoPies) / 12;
  const piesTotales = Math.round(pieUnitario * cantidad * 100) / 100;

  document.getElementById("piesTablaTot").textContent =
    "Pies totales: " + piesTotales;

  const maderaCfg = config.maderas[madera];
  const valorBase = piesTotales * maderaCfg.publico;
  const costo = piesTotales * maderaCfg.costo;

  let extra = 0;
  if (tipoTabla === "ASERRADO")
    extra = piesTotales * config.aserrado;
  if (tipoTabla === "ASERRADO+CEPILLADO")
    extra = piesTotales * (config.aserrado + config.cepillado);

  if (manualTabla > 0) extra = manualTabla;

  const total = Math.round(valorBase + extra);
  const utilidad = Math.round(total - costo);

  document.getElementById("resultadoTabla").textContent =
    "$" + total.toLocaleString();
  document.getElementById("utilidadTabla").textContent =
    "Utilidad: $" + utilidad.toLocaleString();
}

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', function () {
  config = JSON.parse(localStorage.getItem("config")) || config;
  cargarMaderas();
});