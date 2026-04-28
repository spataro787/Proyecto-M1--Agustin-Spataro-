let bloqueados = [];
let historial = [];
let favoritas = [];

// Random
function random(num) {
  return Math.floor(Math.random() * num);
}

// HSL --> HEX
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);

  const f = n =>
    Math.round(
      255 *
        (l -
          a *
            Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
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
  const accion = {
    tipo,
    detalle,
    fecha: new Date().toLocaleTimeString()
  };

  historial.push(accion);
  console.log(historial);
}

// =======================
// DOM
// =======================
const boton = document.getElementById("BotonColor");
const paleta = document.getElementById("paleta");
const selector = document.getElementById("cantidad");
const formatoSelector = document.getElementById("formato");

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
    

    const formato = formatoSelector.value;
    const colorMostrar = formato === "hex" ? hex : hsl;

    colorDiv.innerHTML = `
      <span>
        ${
          formato === "hex"
            ? `<span class="letra">#</span><span class="numero">${hex.slice(1)}</span>`
            : `hsl(<span class="numero">${hue}</span>, 
                   <span class="numero">${saturation}%</span>, 
                   <span class="numero">${lightness}%</span>)`
        }
      </span>
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
        registrarAccion("desbloquear", `Color ${i} desbloqueado`);
      } else {
        bloqueados[i] = { hsl, hex, hue, saturation, lightness };
        lockBtn.textContent = "🔒";
        registrarAccion("bloquear", `Color ${i} bloqueado`);
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

  registrarAccion("generar", `Se generaron ${cantidad} colores`);
}

// =======================
// BOTÓN
// =======================
boton.addEventListener("click", () => {
  const cantidad = Number(selector.value);
  crearPaleta(cantidad);

  document.getElementById("guardar").addEventListener("click", guardarPaletaActual);

  const hue = random(360);
  const fondo = `hsl(${hue}, 60%, 50%)`;
  document.body.style.backgroundColor = fondo;
});