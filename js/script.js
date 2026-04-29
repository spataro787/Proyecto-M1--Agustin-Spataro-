let bloqueados = [];
let historial = [];
let favoritas = [];
let paletaActual = [];


// (NOTIFICACIÓN)
function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");

  toast.textContent = mensaje;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}


//UTILIDADES

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


// LOCAL STORAGE

function guardarEnLocalStorage() {
  localStorage.setItem("favoritas", JSON.stringify(favoritas));
}

function cargarDesdeLocalStorage() {
  const data = localStorage.getItem("favoritas");

  if (data) {
    favoritas = JSON.parse(data);
    mostrarFavoritas();
  }
}


// HISTORIAL

function registrarAccion(tipo, detalle) {
  historial.push({
    tipo,
    detalle,
    fecha: new Date().toLocaleTimeString()
  });

  console.log(historial);
}


// DOM
const botonGenerar = document.getElementById("BotonColor");
const botonGuardar = document.getElementById("guardar");
const paleta = document.getElementById("paleta");
const selectorCantidad = document.getElementById("cantidad");
const selectorFormato = document.getElementById("formato");


// FORMATO
function obtenerCodigo(colorObj) {
  const formato = selectorFormato.value;

  if (formato === "hex") {
    return `
      <span class="hex principal">${colorObj.hex}</span>
      <span class="hsl secundario">${colorObj.hsl}</span>
    `;
  } else {
    return `
      <span class="hsl principal">${colorObj.hsl}</span>
      <span class="hex secundario">${colorObj.hex}</span>
    `;
  }
}


// CREAR PALETA
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

    colorDiv.innerHTML = `
      <div class="color-info">
        <div class="codes">
          ${obtenerCodigo({ hex, hsl })}
        </div>
        <button class="lock">${bloqueados[i] ? "🔒" : "🔓"}</button>
      </div>
    `;

    colorDiv.style.setProperty("--color", hsl);

    const lockBtn = colorDiv.querySelector(".lock");

    // BLOQUEAR
    lockBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (bloqueados[i]) {
        bloqueados[i] = null;
        lockBtn.textContent = "🔓";
        colorDiv.classList.remove("locked");
        mostrarToast("Color desbloqueado 🔓");
        registrarAccion("desbloquear", `Color ${i}`);
      } else {
        bloqueados[i] = { hsl, hex, hue, saturation, lightness };
        lockBtn.textContent = "🔒";
        colorDiv.classList.add("locked");
        mostrarToast("Color bloqueado 🔒");
        registrarAccion("bloquear", `Color ${i}`);
      }
    });

    // COPIAR
    colorDiv.addEventListener("click", () => {
      const formato = selectorFormato.value;
      const codigo = formato === "hex" ? hex : hsl;

      navigator.clipboard.writeText(codigo);
      mostrarToast("Copiado: " + codigo);

      registrarAccion("copiar", codigo);
    });

    paleta.appendChild(colorDiv);
    paletaActual.push({ hsl, hex });
  }

  mostrarToast("Paleta generada 🎨");
  registrarAccion("generar", `${cantidad} colores`);
}


// GUARDAR
function guardarPaletaActual() {
  if (paletaActual.length === 0) return;

  const existe = favoritas.some(p =>
    JSON.stringify(p) === JSON.stringify(paletaActual)
  );

  if (existe) {
    mostrarToast("Ya está guardada ⚠️");
    return;
  }

  favoritas.push([...paletaActual]);

  guardarEnLocalStorage();
  mostrarFavoritas();

  mostrarToast("Paleta guardada ⭐");
  registrarAccion("guardar", "Paleta guardada");
}


// CARGAR
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
          ${obtenerCodigo(colorObj)}
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
        mostrarToast("Color desbloqueado 🔓");
      } else {
        bloqueados[i] = colorObj;
        lockBtn.textContent = "🔒";
        colorDiv.classList.add("locked");
        mostrarToast("Color bloqueado 🔒");
      }
    });

    colorDiv.addEventListener("click", () => {
      const formato = selectorFormato.value;
      const codigo =
        formato === "hex" ? colorObj.hex : colorObj.hsl;

      navigator.clipboard.writeText(codigo);
      mostrarToast("Copiado: " + codigo);
    });

    paleta.appendChild(colorDiv);
  });

  mostrarToast("Paleta cargada 📂");
  registrarAccion("cargar", "Paleta cargada");
}


// ELIMINAR
function eliminarPaleta(index) {
  favoritas.splice(index, 1);

  guardarEnLocalStorage();
  mostrarFavoritas();

  mostrarToast("Paleta eliminada ❌");
  registrarAccion("eliminar", `Paleta ${index + 1}`);
}


// FAVORITAS
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


// EvENTOS
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

cargarDesdeLocalStorage();