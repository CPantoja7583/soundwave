// ── Burger menu ──────────────────────────────────────
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");
 
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    toggle.setAttribute("aria-expanded", isOpen);
  });
}
 
// ── Nuevo álbum toggle ───────────────────────────────
function toggleNuevoAlbum(value) {
  const div = document.getElementById("nuevo-album");
  if (!div) return;
  div.style.display = value === "nuevo" ? "flex" : "none";
}
 
// ── Nuevo género toggle ──────────────────────────────
function toggleNuevoGenero(value) {
  const div   = document.getElementById("nuevo-genero");
  const input = document.getElementById("nuevo-genero-input");
  if (!div || !input) return;
 
  if (value === "nuevo") {
    div.style.display = "block";
    input.required = true;
  } else {
    div.style.display = "none";
    input.required = false;
  }
}
 // ── Carrusel ─────────────────────────────────────────
const track   = document.getElementById("carousel-track");
const btnPrev = document.querySelector(".carousel-arrow--prev");
const btnNext = document.querySelector(".carousel-arrow--next");

if (track) {

  const items      = Array.from(track.children);
  const totalItems = items.length;
  const SCROLL_AMOUNT = 320;

  // ── Drag con mouse ───────────────────────────────────
  let isDragging  = false;
  let startX      = 0;
  let startScroll = 0;

  track.addEventListener("mousedown", (e) => {
    isDragging  = true;
    startX      = e.pageX;
    startScroll = track.scrollLeft;
    track.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    track.scrollLeft = startScroll - (e.pageX - startX);
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = "";
  });

  // ── Swipe táctil ─────────────────────────────────────
  let touchStartX      = 0;
  let touchScrollStart = 0;

  track.addEventListener("touchstart", (e) => {
    touchStartX      = e.touches[0].pageX;
    touchScrollStart = track.scrollLeft;
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    track.scrollLeft = touchScrollStart - (e.touches[0].pageX - touchStartX);
  }, { passive: true });

  // ── Menos de 5 items: sin autoplay, solo flechas y drag ──
  if (totalItems < 5) {

    function applyManualScroll(delta) {
      let moved = 0;
      const step = delta / 20;

      function animate() {
        if (Math.abs(moved) < Math.abs(delta)) {
          track.scrollLeft += step;
          moved += step;
          requestAnimationFrame(animate);
        }
      }
      requestAnimationFrame(animate);
    }

    if (btnPrev && btnNext) {
      btnPrev.addEventListener("click", () => applyManualScroll(-SCROLL_AMOUNT));
      btnNext.addEventListener("click", () => applyManualScroll(SCROLL_AMOUNT));
    }

  // ── 5 o más items: loop infinito con autoplay ─────────
  } else {

    // Clona 4 veces para tener suficiente contenido
    for (let i = 0; i < 4; i++) {
      items.forEach(item => track.appendChild(item.cloneNode(true)));
    }

    let paused = false;

    function autoScroll() {
      if (!paused) {
        track.scrollLeft += 0.6;

        const singleBlock = track.scrollWidth / 5;
        if (track.scrollLeft >= singleBlock * 4) {
          track.scrollLeft -= singleBlock * 3;
        }
      }
      requestAnimationFrame(autoScroll);
    }

    requestAnimationFrame(autoScroll);

    // Pausa al hover
    track.addEventListener("mouseenter", () => paused = true);
    track.addEventListener("mouseleave", () => paused = false);

    // Pausa al drag
    track.addEventListener("mousedown", () => paused = true);
    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      paused = false;
    });

    // Pausa al touch
    track.addEventListener("touchstart", () => paused = true, { passive: true });
    track.addEventListener("touchend",   () => paused = false);

    // Flechas con animación
    function applyManualScroll(delta) {
      paused = true;

      let moved = 0;
      const step = delta / 20;

      function animate() {
        if (Math.abs(moved) < Math.abs(delta)) {
          track.scrollLeft += step;
          moved += step;
          requestAnimationFrame(animate);
        } else {
          paused = false;
        }
      }
      requestAnimationFrame(animate);
    }

    if (btnPrev && btnNext) {
      btnPrev.addEventListener("click", () => applyManualScroll(-SCROLL_AMOUNT));
      btnNext.addEventListener("click", () => applyManualScroll(SCROLL_AMOUNT));
    }
  }
}
 
// ── DOM listo ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
 
  // ── Shuffle ──────────────────────────────────────────
  const shuffleButton = document.querySelector("[data-shuffle-button]");
  const shuffleTitle  = document.querySelector("[data-shuffle-title]");
  const shuffleMeta   = document.querySelector("[data-shuffle-meta]");
 
  function formatSeconds(seconds) {
    const safeSeconds = Number(seconds) || 0;
    const minutes  = Math.floor(safeSeconds / 60);
    const remaining = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }
 
  async function requestShuffleSong() {
    const response = await fetch("/api/canciones/shuffle", {
      headers: { Accept: "application/json" }
    });
 
    if (!response.ok) {
      throw new Error("No se pudo obtener una nueva cancion.");
    }
 
    const payload = await response.json();
 
    if (!payload.ok || !payload.data) {
      throw new Error("La respuesta del shuffle vino vacia.");
    }
 
    return payload.data;
  }
 
async function updateShuffleCard() {
  if (!shuffleButton || !shuffleTitle || !shuffleMeta) return;

  try {
    shuffleButton.disabled = true;
    shuffleButton.style.opacity = "0.5";

    const song = await requestShuffleSong();
    shuffleTitle.textContent = song.titulo;
    shuffleMeta.textContent  = `${song.artista.nombre} · ${formatSeconds(song.duracion)}`;


    const playForm = document.getElementById("shuffle-play-form");
    if (playForm) {
      playForm.action = `/canciones/${song.id}/reproducir`;
    }

  } catch (error) {
    console.error(error);
  } finally {
    shuffleButton.disabled = false;
    shuffleButton.style.opacity = "";
  }
}
 
  if (shuffleButton) {
    shuffleButton.addEventListener("click", updateShuffleCard);
  }
 
  // ── Album toggle ─────────────────────────────────────
  const selectAlbum = document.getElementById("albumId");
  if (selectAlbum) {
    toggleNuevoAlbum(selectAlbum.value);
    selectAlbum.addEventListener("change", (e) => toggleNuevoAlbum(e.target.value));
  }
 
});
 