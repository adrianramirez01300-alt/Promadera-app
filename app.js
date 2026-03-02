// ================= CONFIG BASE =================

let config = JSON.parse(localStorage.getItem("config")) || {
  maderas: {
    "Cedro": { costo: 5000, publico: 6500 },
    "Moncoro": { costo: 3800, publico: 4800 },
    "Roble": { costo: 6500, publico: 8000 }
  },
  aserrado: 1200,
  cepillado: 1500
};

function safeKey(name) {
  return name.replace(/\s+/g, '__');
}

// ================= NAVEGACIÓN =================

function mostrar(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
  const el = document.getElementById(id);
  if (el) el.classList.add("activa");

  if (id === "config") cargarConfigUI();
}

// ================= SELECT MADERAS =================

function cargarMaderas() {
  const selectBloque = document.getElementById("madera");
  const selectTabla = document.getElementById("maderaTabla");

  if (selectBloque) selectBloque.innerHTML = "";
  if (selectTabla) selectTabla.innerHTML = "";

  Object.keys(config.maderas).forEach(nombre => {
    const opt1 = document.createElement("option");
    opt1.value = nombre;
    opt1.textContent = nombre;
    if (selectBloque) selectBloque.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = nombre;
    opt2.textContent = nombre;
    if (selectTabla) selectTabla.appendChild(opt2);
  });
}

// ================= BLOQUES =================

function calcular() {
  const madera = document.getElementById("madera").value;
  const ancho = parseFloat(document.getElementById("ancho").value || 0);
  const largo = parseFloat(document.getElementById("largo").value || 0);
  const altura = parseFloat(document.getElementById("altura").value || 0);
  const tipoVenta = document.getElementById("tipoVenta").value;
  const manualInput = parseFloat(document.getElementById("extraManual").value || 0);

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
  if (tipoVenta === "ASERRADO+CEPILLADO") extra = pies * (config.aserrado + config.cepillado);
  if (manualInput > 0) extra = manualInput;

  const total = Math.round(valorBase + extra);
  const utilidad = Math.round(total - costo);

  document.getElementById("resultado").textContent = "$" + total.toLocaleString();
  document.getElementById("utilidad").textContent = "Utilidad: $" + utilidad.toLocaleString();
}

// ================= TABLAS (6.56 CORRECTO) =================

function calcularTabla() {
  const madera = document.getElementById("maderaTabla").value;

  const anchoCm = parseFloat(document.getElementById("anchoTabla").value || 0);
  const grosorCm = parseFloat(document.getElementById("grosorTabla").value || 0);
  const alturaCm = parseFloat(document.getElementById("alturaTabla").value || 0);
  const cantidad = parseFloat(document.getElementById("cantidadTabla").value || 0);

  const tipoTabla = document.getElementById("tipoTabla").value;
  const manualTabla = parseFloat(document.getElementById("extraManualTabla").value || 0);

  if (!anchoCm || !grosorCm || !alturaCm || !cantidad || !madera) {
    alert("Completa todos los campos");
    return;
  }

  const anchoPulg = Math.ceil(anchoCm / 2.54);
  const grosorPulg = grosorCm / 2.54;
  const largoPies = Math.ceil(alturaCm / 30.48);

  const pieUnitario = (anchoPulg * grosorPulg * largoPies) / 12;
  const piesTotales = Math.round(pieUnitario * cantidad * 100) / 100;

  document.getElementById("piesTablaTot").textContent = "Pies totales: " + piesTotales;

  const maderaCfg = config.maderas[madera];
  const valorBase = piesTotales * maderaCfg.publico;
  const costo = piesTotales * maderaCfg.costo;

  let extra = 0;
  if (tipoTabla === "ASERRADO") extra = piesTotales * config.aserrado;
  if (tipoTabla === "ASERRADO+CEPILLADO") extra = piesTotales * (config.aserrado + config.cepillado);
  if (manualTabla > 0) extra = manualTabla;

  const total = Math.round(valorBase + extra);
  const utilidad = Math.round(total - costo);

  document.getElementById("resultadoTabla").textContent = "$" + total.toLocaleString();
  document.getElementById("utilidadTabla").textContent = "Utilidad: $" + utilidad.toLocaleString();
}

// ================= CONFIG =================

function cargarConfigUI() {
  const contenedor = document.getElementById("listaMaderas");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  Object.keys(config.maderas).forEach(nombre => {
    const madera = config.maderas[nombre];
    const key = safeKey(nombre);

    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    const inputNombre = document.createElement("input");
    inputNombre.value = nombre;
    inputNombre.id = "nombre_" + key;

    const inputCosto = document.createElement("input");
    inputCosto.type = "number";
    inputCosto.value = madera.costo;
    inputCosto.id = "costo_" + key;

    const inputPublico = document.createElement("input");
    inputPublico.type = "number";
    inputPublico.value = madera.publico;
    inputPublico.id = "publico_" + key;

    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.onclick = function () {
      eliminarMadera(nombre);
    };

    div.appendChild(inputNombre);
    div.appendChild(inputCosto);
    div.appendChild(inputPublico);
    div.appendChild(btn);

    contenedor.appendChild(div);
  });

  document.getElementById("configAserrado").value = config.aserrado;
  document.getElementById("configCepillado").value = config.cepillado;
}

function guardarConfig() {
  const nuevasMaderas = {};

  Object.keys(config.maderas).forEach(nombre => {
    const key = safeKey(nombre);

    const nuevoNombre = document.getElementById("nombre_" + key).value.trim();
    const nuevoCosto = parseFloat(document.getElementById("costo_" + key).value || 0);
    const nuevoPublico = parseFloat(document.getElementById("publico_" + key).value || 0);

    if (!nuevoNombre) return;

    nuevasMaderas[nuevoNombre] = { costo: nuevoCosto, publico: nuevoPublico };
  });

  config.maderas = nuevasMaderas;
  config.aserrado = parseFloat(document.getElementById("configAserrado").value || 0);
  config.cepillado = parseFloat(document.getElementById("configCepillado").value || 0);

  localStorage.setItem("config", JSON.stringify(config));

  cargarMaderas();
  cargarConfigUI();
}

function eliminarMadera(nombre) {
  delete config.maderas[nombre];
  localStorage.setItem("config", JSON.stringify(config));
  cargarMaderas();
  cargarConfigUI();
}

// ================= INIT =================

document.addEventListener("DOMContentLoaded", function () {
  config = JSON.parse(localStorage.getItem("config")) || config;
  cargarMaderas();
});