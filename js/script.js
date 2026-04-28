let bloqueados = [];
let historial = [];
let favoritas = [];

// =======================
// UTILIDADES
// =======================
function random(num) {
  return Math.floor(Math.random() * num);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);

  const f = n =>
    Math.round(
      255 *
        (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
    );

  return (
    "#" +
    [f(0), f(8), f(4)]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

// =======================
// HISTORIAL
// =======================
function registrarAccion(tipo, detalle) {
  historial.push({
    tipo,
    detalle,
    fecha: new Date().toLocaleTimeString()
  });

  console.log(historial);
}

// =======================
// DOM
// =======================
const botonGenerar = document.getElementById("BotonColor");
const botonGuardar = document.getElementById("guardar");
const paleta = document.getElementById("paleta");
const selectorCantidad = document.getElementById("cantidad");
const selectorFormato = document.getElementById("formato");

// =======================
// CREAR PALETA
// =======================
function crearPaleta(cantidad) {
  paleta.innerHTML = "";

  for (let i = 0; i < cantidad; i++) {
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color");

    let hsl, hex, hue, saturation, lightness;

    if (bloqueados[i]) {
      ({ hsl, hex, hue, saturation, lightness } = bloqueados[i]);
    } else {
      hue = random(360);
      saturation = random(50) + 50;
      lightness = random(40) + 40;

      hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      hex = hslToHex(hue, saturation, lightness);
    }

    const formato = selectorFormato.value;
    const colorMostrar = formato === "hex" ? hex : hsl;

    colorDiv.innerHTML = `
      <span>${colorMostrar}</span>
      <button class="lock">${bloqueados[i] ? "🔒" : "🔓"}</button>
    `;

    colorDiv.style.setProperty("--color", hsl);

    // BLOQUEAR
    const lockBtn = colorDiv.querySelector(".lock");

    lockBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (bloqueados[i]) {
        bloqueados[i] = null;
        lockBtn.textContent = "🔓";
        registrarAccion("desbloquear", `Color ${i}`);
      } else {
        bloqueados[i] = { hsl, hex, hue, saturation, lightness };
        lockBtn.textContent = "🔒";
        registrarAccion("bloquear", `Color ${i}`);
      }
    });

    // COPIAR
    colorDiv.addEventListener("click", () => {
      navigator.clipboard.writeText(colorMostrar);
      alert("Copiado: " + colorMostrar);
      registrarAccion("copiar", colorMostrar);
    });

    paleta.appendChild(colorDiv);
  }

  registrarAccion("generar", `${cantidad} colores`);
}

// =======================
// GUARDAR PALETA
// =======================
function guardarPaletaActual() {
  const colores = [];

  document.querySelectorAll(".color").forEach((div) => {
    const hsl = getComputedStyle(div).getPropertyValue("--color").trim();

    const valores = hsl.match(/\d+/g);
    const [h, s, l] = valores.map(Number);

    const hex = hslToHex(h, s, l);

    colores.push({ hsl, hex });
  });

  favoritas.push(colores);

  console.log("Favoritas:", favoritas);
  registrarAccion("guardar", "Paleta guardada (HSL + HEX)");

  mostrarFavoritas();
}

// =======================
// CARGAR PALETA
// =======================
function cargarPaleta(paletaGuardada) {
  paleta.innerHTML = "";

  const formato = selectorFormato.value;

  paletaGuardada.forEach((colorObj) => {
    const color = formato === "hex" ? colorObj.hex : colorObj.hsl;

    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color");

    colorDiv.innerHTML = `
      <span>${color}</span>
      <button class="lock">🔓</button>
    `;

    colorDiv.style.setProperty("--color", colorObj.hsl);

    colorDiv.addEventListener("click", () => {
      navigator.clipboard.writeText(color);
      alert("Copiado: " + color);
    });

    paleta.appendChild(colorDiv);
  });

  registrarAccion("cargar", "Paleta cargada");
}

// =======================
// ELIMINAR PALETA
// =======================
function eliminarPaleta(index) {
  favoritas.splice(index, 1);
  mostrarFavoritas();
  registrarAccion("eliminar", `Paleta ${index + 1} eliminada`);
}

// =======================
// MOSTRAR FAVORITAS
// =======================
function mostrarFavoritas() {
  const contenedor = document.getElementById("favoritas");
  contenedor.innerHTML = "";

  favoritas.forEach((paletaGuardada, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("paleta-fav");

    // PREVIEW
    const preview = document.createElement("div");
    preview.classList.add("preview");

    paletaGuardada.forEach((colorObj) => {
      const mini = document.createElement("div");
      mini.classList.add("mini-color");
      mini.style.background = colorObj.hsl;
      preview.appendChild(mini);
    });

    // BOTÓN CARGAR
    const btnCargar = document.createElement("button");
    btnCargar.textContent = "Cargar";
    btnCargar.addEventListener("click", () => {
      cargarPaleta(paletaGuardada);
    });

    // BOTÓN ELIMINAR
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.addEventListener("click", () => {
      eliminarPaleta(index);
    });

    wrapper.appendChild(preview);
    wrapper.appendChild(btnCargar);
    wrapper.appendChild(btnEliminar);

    contenedor.appendChild(wrapper);
  });
}

// =======================
// EVENTOS
// =======================

// Generar
botonGenerar.addEventListener("click", () => {
  const cantidad = Number(selectorCantidad.value);
  crearPaleta(cantidad);

  const hue = random(360);
  document.body.style.backgroundColor = `hsl(${hue}, 60%, 50%)`;
});

// Guardar
botonGuardar.addEventListener("click", guardarPaletaActual);

// Cambio de formato dinámico
selectorFormato.addEventListener("change", () => {
  const ultima = favoritas[favoritas.length - 1];
  if (ultima) {
    cargarPaleta(ultima);
  }
});