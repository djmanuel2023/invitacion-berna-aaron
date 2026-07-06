/* Interacciones de la invitación */
"use strict";

const weddingDate = new Date("2026-08-07T14:00:00-05:00");
const intro = document.getElementById("intro");
const invitation = document.getElementById("invitation");
const openButton = document.getElementById("openInvitation");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const sceneDots = document.getElementById("sceneDots");

let player = null;
let playerReady = false;
let invitationOpened = false;
let musicPlaying = false;

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("ytPlayer", {
    height: "1",
    width: "1",
    videoId: "NaZznqme2hg",
    playerVars: {
      autoplay: 0,
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
        if (invitationOpened) playMusic();
      },
      onStateChange: (event) => {
        musicPlaying = event.data === YT.PlayerState.PLAYING;
        updateMusicUI();
      }
    }
  });
};

function playMusic() {
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
  musicToggle.classList.toggle("is-paused", !musicPlaying);
  musicLabel.textContent = musicPlaying ? "Pausar" : "Música";
}

openButton.addEventListener("click", () => {
  invitationOpened = true;
  invitation.classList.add("is-ready");
  invitation.setAttribute("aria-hidden", "false");
  musicToggle.hidden = false;
  sceneDots.hidden = false;
  playMusic();

  intro.classList.add("is-opening");
  setTimeout(() => {
    intro.classList.add("is-hidden");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, 1050);
});

musicToggle.addEventListener("click", () => {
  if (!playerReady) {
    window.open("https://www.youtube.com/watch?v=NaZznqme2hg", "_blank", "noopener");
    return;
  }
  musicPlaying ? pauseMusic() : playMusic();
});

function pad(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  let diff = weddingDate.getTime() - now.getTime();
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.getElementById("days").textContent = pad(days);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Reveal effects
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.28 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Petals for the closing scene
const petals = document.getElementById("petals");
for (let i = 0; i < 24; i++) {
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.animationDuration = `${6 + Math.random() * 8}s`;
  petal.style.animationDelay = `${-Math.random() * 12}s`;
  petal.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
  petal.style.transform = `scale(${0.55 + Math.random() * 0.9})`;
  petals.appendChild(petal);
}

// Navigation dots
const scenes = [...document.querySelectorAll(".scene")];
scenes.forEach((scene, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Ir a la sección ${index + 1}`);
  dot.addEventListener("click", () => scene.scrollIntoView({ behavior: "smooth", block: "start" }));
  sceneDots.appendChild(dot);
});

const dots = [...sceneDots.querySelectorAll("button")];
const sceneObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const index = scenes.indexOf(entry.target);
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  });
}, { threshold: 0.55 });
scenes.forEach(scene => sceneObserver.observe(scene));

// Pause music when the tab is hidden, resume only if it was playing
let resumeAfterVisibility = false;
document.addEventListener("visibilitychange", () => {
  if (document.hidden && musicPlaying) {
    resumeAfterVisibility = true;
    pauseMusic();
  } else if (!document.hidden && resumeAfterVisibility) {
    resumeAfterVisibility = false;
    playMusic();
  }
});
