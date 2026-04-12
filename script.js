const THEME_KEY = "portfolio-theme";

const yearSpan = document.getElementById("year");
const menuButton = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
const themeSwitchInput = document.getElementById("theme-switch-input");

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (_) {}
  if (themeSwitchInput) {
    const on = next === "dark";
    themeSwitchInput.checked = on;
    themeSwitchInput.setAttribute("aria-checked", on ? "true" : "false");
  }
}

function initTheme() {
  if (themeSwitchInput) {
    themeSwitchInput.checked = getTheme() === "dark";
    themeSwitchInput.setAttribute(
      "aria-checked",
      themeSwitchInput.checked ? "true" : "false",
    );
  }
}

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

initTheme();

if (themeSwitchInput) {
  themeSwitchInput.addEventListener("change", () => {
    applyTheme(themeSwitchInput.checked ? "dark" : "light");
  });
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

const INTRO_URL = "./assets/intro/introduction.txt";

function splitParagraphs(text) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  return normalized
    .split(/\n\s*\n/)
    .map((b) => b.trim().replace(/\n/g, " "))
    .filter(Boolean);
}

/** First line may be: Photo: filename.ext (same folder as introduction.txt) */
function parseIntro(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const first = (lines[0] ?? "").trim();
  const m = first.match(/^(?:Photo|Image):\s*(.+)$/i);
  let photoName = null;
  let start = 0;
  if (m) {
    const name = m[1].trim();
    if (name && !/[\\/]/.test(name) && !name.includes("..")) {
      photoName = name;
    }
    start = 1;
    if (lines[start]?.trim() === "") start += 1;
  }
  const body = lines.slice(start).join("\n");
  return { photoName, body };
}

async function loadIntroAssets() {
  const bodyEl = document.getElementById("introduction-body");
  const errEl = document.getElementById("introduction-error");
  const imgEl = document.getElementById("intro-hero-image");
  const splitEl = document.querySelector(".intro-split");
  if (!bodyEl || !errEl) return;

  try {
    const res = await fetch(INTRO_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("missing");

    const raw = await res.text();
    const { photoName, body } = parseIntro(raw);
    const paragraphs = splitParagraphs(body);

    bodyEl.innerHTML = "";
    for (const p of paragraphs) {
      const el = document.createElement("p");
      el.textContent = p;
      bodyEl.appendChild(el);
    }

    if (imgEl && photoName) {
      imgEl.src = `./assets/intro/${encodeURIComponent(photoName)}`;
      imgEl.alt = "Profile photo";
    }

    if (splitEl) {
      splitEl.classList.toggle("intro-split--no-photo", !photoName);
    }

    errEl.classList.add("hidden");
    errEl.textContent = "";
  } catch (e) {
    bodyEl.innerHTML = "";
    if (splitEl) splitEl.classList.add("intro-split--no-photo");
    errEl.classList.remove("hidden");
    errEl.textContent =
      "Could not load introduction. Use a local server (not file://) and add assets/intro/introduction.txt.";
    console.error(e);
  }
}

if (document.getElementById("introduction-body")) {
  loadIntroAssets();
}
