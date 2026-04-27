

// Variedad//
let bloqueados = [];

//cCrear valores aleatorios de colores //
function random(num) {
  return Math.floor(Math.random() * num);
}
// Convierte un color de formato hsl --> hex//
function hslToHex(h, s, l) {
  s /= 100; 
  l /= 100;

  //Matematica para colores //
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);

  // Calcula cada componenre//
  const f = n =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

  //Comvierte los valores//
  return( "#" + [f(0), f(8), f(4)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("") );
  }

// De js a html//
const boton = document.getElementById("BotonCoor");
const paleta = document.getElementById("paleta");
const selector = document.getElementById("cantidad");
const formatoSelector = document.getElementById("formato");


// Crea Paleta //
function crearPaleta(cantidad) {
  paleta.innerHTML = "";


  // Crea un bloqueo visual para cada color //
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

    // HTML interno
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

    // Aplica color
    colorDiv.style.setProperty("--color", hsl);

    // BOTÓN BLOQUEO
    const lockBtn = colorDiv.querySelector(".lock");

    lockBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (bloqueados[i]) {
        bloqueados[i] = null;
        lockBtn.textContent = "🔓";
      } else {
        bloqueados[i] = { hsl, hex, hue, saturation, lightness };
        lockBtn.textContent = "🔒";
      }
    });

    // COPIAR COLOR
    colorDiv.addEventListener("click", () => {
      navigator.clipboard.writeText(colorMostrar);
      alert("Copiado: " + colorMostrar);
    });

    paleta.appendChild(colorDiv);
  }
}

// =======================
// EVENTO BOTÓN
// =======================
boton.addEventListener("click", () => {
  const cantidad = Number(selector.value);
  crearPaleta(cantidad);

  // Cambia fondo
  const hue = random(360);
  const fondo = `hsl(${hue}, 60%, 50%)`;
  document.body.style.backgroundColor = fondo;
});