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

const INTRO_URL = "./assets/intro/introduction.md";
const PROJECTS_INDEX_URL = "./assets/projects/projects.json";

// Common image extensions to probe when no explicit image is declared
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif", "avif", "svg"];

function splitParagraphs(text) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  return normalized
    .split(/\n\s*\n/)
    .map((b) => b.trim().replace(/\n/g, " "))
    .filter(Boolean);
}

function splitMarkdownParagraphs(text) {
  return splitParagraphs(text.replace(/\s*\n\s*/g, "\n")).map((paragraph) =>
    paragraph.replace(/^#+\s*/, "").trim(),
  );
}

function humanizeProjectSlug(slug) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function buildProjectUrl(root, value) {
  if (!value) return null;
  if (/^(?:https?:|\/\/|\/)/i.test(value)) {
    return value;
  }
  if (value === ".") {
    return root;
  }
  return `${root}/${value}`;
}

async function fetchTextResource(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.text();
  } catch (_e) {
    return null;
  }
}

async function resourceExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch (_e) {
    return false;
  }
}

/**
 * Probe a folder for the first image file that exists.
 * If `explicit` is provided (from projects.json), only that URL is checked.
 * Otherwise, common filenames + extensions are tried in order.
 * Returns the URL string if found, or null.
 */
async function resolveProjectImage(root, explicit) {
  if (explicit !== undefined && explicit !== null) {
    // Caller supplied an explicit value (may be empty string meaning "none")
    if (!explicit) return null;
    const url = buildProjectUrl(root, explicit);
    return (await resourceExists(url)) ? url : null;
  }

  // No explicit value — probe common names across all supported extensions
  const names = ["image", "thumbnail", "cover", "preview", "photo"];
  for (const name of names) {
    for (const ext of IMAGE_EXTENSIONS) {
      const url = `${root}/${name}.${ext}`;
      if (await resourceExists(url)) return url;
    }
  }
  return null;
}

/**
 * Probe a folder for the first video file that exists.
 * If `explicit` is provided (from projects.json), only that URL is checked.
 * Otherwise, common filenames + extensions are tried in order.
 * Returns the URL string if found, or null.
 */
async function resolveProjectVideo(root, explicit) {
  if (explicit !== undefined && explicit !== null) {
    if (!explicit) return null;
    const url = buildProjectUrl(root, explicit);
    return (await resourceExists(url)) ? url : null;
  }

  const videoExts = ["mp4", "webm", "mov", "ogg"];
  const names = ["video", "demo", "preview"];
  for (const name of names) {
    for (const ext of videoExts) {
      const url = `${root}/${name}.${ext}`;
      if (await resourceExists(url)) return url;
    }
  }
  return null;
}

async function loadProjectItems() {
  const manifest = await fetchTextResource(PROJECTS_INDEX_URL);
  if (!manifest) return [];

  try {
    const parsed = JSON.parse(manifest);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) =>
      typeof item === "string" ? { slug: item } : item,
    );
  } catch (_e) {
    return [];
  }
}

function parseProjectMarkdown(raw) {
  const text = raw.replace(/\r\n/g, "\n").trim();
  const lines = text.split("\n");
  let title = null;
  if (lines[0]?.startsWith("# ")) {
    title = lines.shift().slice(2).trim();
  }
  const description = splitMarkdownParagraphs(lines.join("\n"))[0] || "";
  return { title, description };
}

function createProjectLink(link, root) {
  const url = buildProjectUrl(root, link.url || link.href || "");
  if (!url || !link.label) return null;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.textContent = link.label;
  return anchor;
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "card project-card";

  // ── Image: only rendered when an image file was confirmed to exist ──
  if (project.image) {
    const img = document.createElement("img");
    img.src = project.image;
    img.alt = project.title
      ? `${project.title} thumbnail`
      : "Project thumbnail";
    img.onerror = function () {
      // Hide the broken image rather than showing a placeholder,
      // since we already confirmed the file exists via HEAD request.
      this.style.display = "none";
    };
    card.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "card-body";

  const heading = document.createElement("h3");
  heading.className = "project-title";
  heading.textContent = project.title;

  // ── Watch Demo button: only rendered when a video file was confirmed to exist ──
  if (project.video) {
    const demoLink = document.createElement("a");
    demoLink.className = "watch-demo-link";
    demoLink.href = project.video;
    demoLink.target = "_blank";
    demoLink.rel = "noreferrer";
    demoLink.textContent = "Watch Demo";
    heading.appendChild(demoLink);
  }

  body.appendChild(heading);

  // ── Description: only rendered when intro.md text was found ──
  if (project.description) {
    const paragraph = document.createElement("p");
    paragraph.textContent = project.description;
    body.appendChild(paragraph);
  }

  card.appendChild(body);

  if (project.links?.length) {
    const linksBody = document.createElement("div");
    linksBody.className = "card-body";
    project.links.forEach((link, index) => {
      const anchor = createProjectLink(link, project.root);
      if (!anchor) return;
      linksBody.appendChild(anchor);
      if (index < project.links.length - 1) {
        linksBody.appendChild(document.createTextNode(" · "));
      }
    });
    card.appendChild(linksBody);
  }

  return card;
}

async function loadProjectsSection() {
  const grid = document.getElementById("projects-grid");
  const errEl = document.getElementById("projects-error");
  if (!grid || !errEl) return;

  try {
    const items = await loadProjectItems();
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("no projects found");
    }

    grid.innerHTML = "";

    for (const raw of items) {
      const slug = String(raw.slug || raw.id || raw.name || "").trim();
      if (!slug) continue;

      const root = `./assets/projects/${encodeURIComponent(slug)}`;
      let title = raw.title || humanizeProjectSlug(slug);
      let description = raw.description || "";

      // ── Resolve image: check if a real file exists ──
      // Pass `raw.image` if declared in JSON (even if ""), otherwise undefined
      // so the auto-probe kicks in.
      const image = await resolveProjectImage(
        root,
        "image" in raw ? raw.image : undefined,
      );

      // ── Resolve video: same pattern ──
      const video = await resolveProjectVideo(
        root,
        "video" in raw ? raw.video : undefined,
      );

      // ── Load description from intro.md only if not already supplied ──
      if (!description) {
        const introText = await fetchTextResource(`${root}/intro.md`);
        if (introText) {
          const parsed = parseProjectMarkdown(introText);
          if (parsed.title) title = parsed.title;
          description = parsed.description;
        }
        // If intro.md is missing or empty, description stays "" and is not rendered
      }

      const project = {
        root,
        title,
        description, // empty string → no <p> rendered
        image,       // null → no <img> rendered
        video,       // null → no Watch Demo button rendered
        links: Array.isArray(raw.links) ? raw.links : [],
      };

      grid.appendChild(createProjectCard(project));
    }

    if (!grid.children.length) {
      throw new Error("no projects found");
    }

    errEl.classList.add("hidden");
    errEl.textContent = "";
  } catch (error) {
    grid.innerHTML = "";
    errEl.classList.remove("hidden");
    errEl.textContent =
      "Could not load projects. Make sure project folders exist under assets/projects/.";
    console.error(error);
  }
}

if (document.getElementById("projects-grid")) {
  loadProjectsSection();
}

/** First line may be: Photo: filename.ext (same folder as introduction.md) */
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
      const originalPhoto = `./assets/intro/${encodeURIComponent(photoName)}`;
      const fallbackPhoto = photoName.replace(/\.[^.]+$/, (ext) =>
        ext.toLowerCase(),
      );
      const fallbackUrl =
        fallbackPhoto === photoName
          ? null
          : `./assets/intro/${encodeURIComponent(fallbackPhoto)}`;

      imgEl.alt = "Profile photo";
      imgEl.src = originalPhoto;
      imgEl.onerror = function () {
        if (fallbackUrl && this.src !== fallbackUrl) {
          this.onerror = null;
          this.src = fallbackUrl;
          return;
        }
        this.src =
          "https://placehold.co/600x360/232a3c/ffffff?text=Profile+Photo";
      };
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
      "Could not load introduction. Use a local server (not file://) and add assets/intro/introduction.md.";
    console.error(e);
  }
}

if (document.getElementById("introduction-body")) {
  loadIntroAssets();
}