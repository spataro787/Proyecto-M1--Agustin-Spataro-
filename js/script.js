let bloqueados = [];
let historial = [];
let favoritas = [];
let paletaActual = [];

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

  if (bloqueados.length !== cantidad) {
    bloqueados = new Array(cantidad).fill(null);
  }

  paletaActual = [];

  for (let i = 0; i < cantidad; i++) {
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color");

    let hsl, hex, hue, saturation, lightness;

    if (bloqueados[i]) {
      ({ hsl, hex, hue, saturation, lightness } = bloqueados[i]);
      colorDiv.classList.add("locked");
    } else {
      hue = random(360);
      saturation = random(50) + 50;
      lightness = random(40) + 40;

      hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      hex = hslToHex(hue, saturation, lightness);
    }

    // 👇 NUEVO DISEÑO (HEX + HSL)
    colorDiv.innerHTML = `
      <div class="color-info">
        <div class="codes">
          <span class="hex">${hex}</span>
          <span class="hsl">${hsl}</span>
        </div>
        <button class="lock">${bloqueados[i] ? "🔒" : "🔓"}</button>
      </div>
    `;

    colorDiv.style.setProperty("--color", hsl);

    const lockBtn = colorDiv.querySelector(".lock");

    // BLOQUEAR / DESBLOQUEAR
    lockBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (bloqueados[i]) {
        bloqueados[i] = null;
        lockBtn.textContent = "🔓";
        colorDiv.classList.remove("locked");
        registrarAccion("desbloquear", `Color ${i}`);
      } else {
        bloqueados[i] = { hsl, hex, hue, saturation, lightness };
        lockBtn.textContent = "🔒";
        colorDiv.classList.add("locked");
        registrarAccion("bloquear", `Color ${i}`);
      }
    });

    // COPIAR (solo HEX 👇)
    colorDiv.addEventListener("click", () => {
      navigator.clipboard.writeText(hex);
      alert("Copiado: " + hex);
      registrarAccion("copiar", hex);
    });

    paleta.appendChild(colorDiv);

    paletaActual.push({ hsl, hex });
  }

  registrarAccion("generar", `${cantidad} colores`);
}

// =======================
// GUARDAR PALETA
// =======================
function guardarPaletaActual() {
  if (paletaActual.length === 0) return;

  favoritas.push([...paletaActual]);

  registrarAccion("guardar", "Paleta guardada");
  mostrarFavoritas();
}

// =======================
// CARGAR PALETA
// =======================
function cargarPaleta(paletaGuardada) {
  paleta.innerHTML = "";
  paletaActual = [...paletaGuardada];

  bloqueados = new Array(paletaGuardada.length).fill(null);

  paletaGuardada.forEach((colorObj, i) => {
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color");

    colorDiv.innerHTML = `
      <div class="color-info">
        <div class="codes">
          <span class="hex">${colorObj.hex}</span>
          <span class="hsl">${colorObj.hsl}</span>
        </div>
        <button class="lock">🔓</button>
      </div>
    `;

    colorDiv.style.setProperty("--color", colorObj.hsl);

    const lockBtn = colorDiv.querySelector(".lock");

    lockBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (bloqueados[i]) {
        bloqueados[i] = null;
        lockBtn.textContent = "🔓";
        colorDiv.classList.remove("locked");
      } else {
        bloqueados[i] = colorObj;
        lockBtn.textContent = "🔒";
        colorDiv.classList.add("locked");
      }
    });

    colorDiv.addEventListener("click", () => {
      navigator.clipboard.writeText(colorObj.hex);
      alert("Copiado: " + colorObj.hex);
    });

    paleta.appendChild(colorDiv);
  });

  registrarAccion("cargar", "Paleta cargada");
}

// =======================
// ELIMINAR
// =======================
function eliminarPaleta(index) {
  favoritas.splice(index, 1);
  mostrarFavoritas();
  registrarAccion("eliminar", `Paleta ${index + 1}`);
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

    const preview = document.createElement("div");
    preview.classList.add("preview");

    paletaGuardada.forEach((colorObj) => {
      const mini = document.createElement("div");
      mini.classList.add("mini-color");
      mini.style.background = colorObj.hsl;
      preview.appendChild(mini);
    });

    const btnCargar = document.createElement("button");
    btnCargar.textContent = "Cargar";
    btnCargar.addEventListener("click", () => {
      cargarPaleta(paletaGuardada);
    });

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
botonGenerar.addEventListener("click", () => {
  const cantidad = Number(selectorCantidad.value);
  crearPaleta(cantidad);
});

botonGuardar.addEventListener("click", guardarPaletaActual);

selectorFormato.addEventListener("change", () => {
  if (paletaActual.length > 0) {
    cargarPaleta(paletaActual);
  }
});