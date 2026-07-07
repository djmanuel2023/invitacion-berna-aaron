/* Invitación Berna & Aaron — V3 */
"use strict";

const weddingDate = new Date("2026-08-07T14:00:00-05:00");
const intro = document.getElementById("intro");
const invitation = document.getElementById("invitation");
const soundHint = document.getElementById("soundHint");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");

let player = null;
let playerReady = false;
let opened = false;
let opening = false;
let musicPlaying = false;
let autoplayAttempted = false;

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("ytPlayer", {
    height: "1",
    width: "1",
    videoId: "NaZznqme2hg",
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist: "NaZznqme2hg",
      modestbranding: 1,
      rel: 0,
      playsinline: 1
    },
    events: {
      onReady: () => {
        playerReady = true;
        attemptAutoplay();
      },
      onStateChange: (event) => {
        musicPlaying = event.data === YT.PlayerState.PLAYING;
        updateMusicUI();
        if (musicPlaying && soundHint) soundHint.style.opacity = "0";
      }
    }
  });
};

function attemptAutoplay() {
  if (!playerReady || !player || autoplayAttempted) return;
  autoplayAttempted = true;
  try {
    player.setVolume(42);
    player.playVideo();
  } catch (_) {}
}

function startMusic() {
  if (!playerReady || !player) return;
  try {
    player.setVolume(42);
    player.playVideo();
    musicPlaying = true;
    updateMusicUI();
  } catch (_) {}
}

function pauseMusic() {
  if (!playerReady || !player) return;
  try {
    player.pauseVideo();
    musicPlaying = false;
    updateMusicUI();
  } catch (_) {}
}

function updateMusicUI() {
  musicToggle.classList.toggle("paused", !musicPlaying);
  musicLabel.textContent = musicPlaying ? "Pausar" : "Música";
}

function openInvitation() {
  if (opening) return;
  opening = true;

  // El primer toque inicia la música antes de que termine la apertura del sobre.
  startMusic();
  invitation.classList.add("ready");
  invitation.setAttribute("aria-hidden", "false");
  musicToggle.hidden = false;

  // Pequeña pausa para que la música comience antes del cambio de pantalla.
  setTimeout(() => intro.classList.add("is-opening"), 260);
  setTimeout(() => {
    intro.classList.add("is-hidden");
    opened = true;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, 1250);
}

intro.addEventListener("pointerdown", () => startMusic(), { passive: true });
intro.addEventListener("click", openInvitation);
intro.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openInvitation();
  }
});

// Cualquier primer toque en la página sirve como respaldo para iniciar el audio.
document.addEventListener("pointerdown", startMusic, { once: true, passive: true });

musicToggle.addEventListener("click", () => {
  if (!playerReady) {
    window.open("https://www.youtube.com/watch?v=NaZznqme2hg", "_blank", "noopener");
    return;
  }
  musicPlaying ? pauseMusic() : startMusic();
});

function pad(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}
function updateCountdown() {
  let diff = weddingDate.getTime() - Date.now();
  if (diff < 0) diff = 0;
  document.getElementById("days").textContent = pad(Math.floor(diff / 86400000));
  document.getElementById("hours").textContent = pad(Math.floor((diff % 86400000) / 3600000));
  document.getElementById("minutes").textContent = pad(Math.floor((diff % 3600000) / 60000));
  document.getElementById("seconds").textContent = pad(Math.floor((diff % 60000) / 1000));
}
updateCountdown();
setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.2 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const petals = document.getElementById("petals");
for (let i = 0; i < 24; i++) {
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.animationDuration = `${6 + Math.random() * 8}s`;
  petal.style.animationDelay = `${-Math.random() * 12}s`;
  petal.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
  petals.appendChild(petal);
}

let resumeAfterVisibility = false;
document.addEventListener("visibilitychange", () => {
  if (document.hidden && musicPlaying) {
    resumeAfterVisibility = true;
    pauseMusic();
  } else if (!document.hidden && resumeAfterVisibility) {
    resumeAfterVisibility = false;
    startMusic();
  }
});


// Pase dinámico: ?pases=1, ?pases=2, ?pases=3 o ?pases=4
const passParams = new URLSearchParams(window.location.search);
let guestPasses = parseInt(passParams.get("pases") || passParams.get("invitados") || "1", 10);
if (![1, 2, 3, 4].includes(guestPasses)) guestPasses = 1;
const guestCountEl = document.getElementById("guestCount");
const guestLabelEl = document.getElementById("guestLabel");
if (guestCountEl) guestCountEl.textContent = String(guestPasses);
if (guestLabelEl) guestLabelEl.textContent = guestPasses === 1 ? "persona" : "personas";
const rsvpLinkDynamic = document.getElementById("rsvpLink");
if (rsvpLinkDynamic) {
  const mensaje = `Hola Berna y Aaron. Confirmo con mucho gusto mi asistencia a su boda del 07 de agosto de 2026 para ${guestPasses} ${guestPasses === 1 ? "persona" : "personas"}. ¡Gracias por la invitación!`;
  rsvpLinkDynamic.href = `https://wa.me/51974554969?text=${encodeURIComponent(mensaje)}`;
}
