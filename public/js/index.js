const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    toggle.setAttribute("aria-expanded", isOpen);
  });
}

const shuffleButton = document.querySelector("[data-shuffle-button]");
const shuffleTitle = document.querySelector("[data-shuffle-title]");
const shuffleMeta = document.querySelector("[data-shuffle-meta]");

function formatSeconds(seconds) {
  const safeSeconds = Number(seconds) || 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

async function requestShuffleSong() {
  const response = await fetch("/api/canciones/shuffle", {
    headers: {
      Accept: "application/json"
    }
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
  if (!shuffleButton || !shuffleTitle || !shuffleMeta) {
    return;
  }

  const originalLabel = shuffleButton.textContent.trim();

  try {
    shuffleButton.disabled = true;
    shuffleButton.textContent = "Cargando...";

    const song = await requestShuffleSong();
    shuffleTitle.textContent = song.titulo;
    shuffleMeta.textContent = `${song.artista.nombre} · ${formatSeconds(song.duracion)}`;
  } catch (error) {
    console.error(error);
    shuffleButton.textContent = "Reintentar";
    return;
  } finally {
    shuffleButton.disabled = false;
  }

  shuffleButton.textContent = originalLabel;
}

if (shuffleButton) {
  shuffleButton.addEventListener("click", updateShuffleCard);
}

function toggleNuevoAlbum(value) {
  const div = document.getElementById("nuevo-album");
  if (!div) return;
  div.style.display = value === "nuevo" ? "flex" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("albumId");
  if (select) {
    toggleNuevoAlbum(select.value);
    select.addEventListener("change", (event) => toggleNuevoAlbum(event.target.value));
  }
});
