// Shared renderer for all pages. Pages choose what to render with body[data-page].
const data = window.portfolioData;

const lastFmApiKey = "25e5a2008d8bb0c1021207d4f50bbd4d";
const lastFmUser = "rawenergon";

const CLICK_SOUND = "/src/click.mp3"; // ← drop your click sound at src/click.mp3

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function playClick() {
  try {
    const a = new Audio(CLICK_SOUND);
    a.volume = 0.35;
    a.play();
  } catch {}
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function externalAttrs(href) {
  return href.startsWith("http") ? ' target="_blank" rel="noreferrer"' : "";
}

/* ============================================================
   HEADER
   ============================================================ */
function initHeader() {
  const moreButton = $("#moreButton");
  const moreMenu = $("#moreMenu");
  moreButton?.addEventListener("click", () => {
    playClick();
    const isOpen = moreMenu.classList.toggle("is-open");
    moreButton.setAttribute("aria-expanded", String(isOpen));
  });

  // Click sound on all internal nav links
  document.querySelectorAll(".nav a[href^='/'], .more-menu a[href^='/']").forEach(link => {
    link.addEventListener("click", (e) => {
      playClick();
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".more-wrap")) {
      moreMenu?.classList.remove("is-open");
      moreButton?.setAttribute("aria-expanded", "false");
    }
  });
}

/* ============================================================
   THEME
   ============================================================ */
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.dataset.theme = savedTheme;
}

/* ============================================================
   LAST.FM
   ============================================================ */
function imageFromTrack(track) {
  const images = track?.image || [];
  return [...images].reverse().find((item) => item["#text"])?.["#text"]
    || "https://via.placeholder.com/160/121212/ffffff?text=ADI";
}

async function fetchTrack() {
  const status = $("#status");
  const song   = $("#song");
  const artist = $("#artist");
  const cover  = $("#cover");
  const dot    = $("#dot");
  if (!status || !song || !artist || !cover || !dot) return;
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFmUser}&api_key=${lastFmApiKey}&format=json&limit=1&_=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Last.fm ${res.status}`);
    const json = await res.json();
    const track = json?.recenttracks?.track?.[0];
    if (!track) throw new Error("No track");
    const nowPlaying = track["@attr"]?.nowplaying === "true";
    const imgUrl = imageFromTrack(track);
    if (cover.src !== imgUrl) cover.src = imgUrl;
    cover.alt = track.name;
    song.textContent   = track.name || "Unknown";
    artist.textContent = track.artist?.["#text"] || "Unknown";
    status.textContent = nowPlaying ? "Now playing" : "Last played";
    dot.style.background = nowPlaying ? "#1DB954" : "#6b7280";
  } catch (err) {
    status.textContent = "Unavailable";
    song.textContent   = "—";
    artist.textContent = "—";
    dot.style.background = "#6b7280";
  }
}

async function fetchRealViews() {
  const el = $("#views");
  if (!el) return;
  let count = 0;
  // Primary: CountAPI (free, no auth, reliable)
  try {
    const hit = sessionStorage.getItem("adi_hit");
    const ep = hit ? "get" : "hit";
    const res = await fetch(`https://api.countapi.xyz/${ep}/adibxr/portfolio`);
    if (res.ok) {
      const d = await res.json();
      count = d?.value ?? 0;
      if (!hit) sessionStorage.setItem("adi_hit", "1");
    }
  } catch {}
  // Fallback: GoatCounter
  if (!count) {
    try {
      const res = await fetch("https://adibxr.goatcounter.com/api/v0/stats/total");
      if (res.ok) {
        const d = await res.json();
        count = d?.total ?? d?.count ?? 0;
      }
    } catch {}
  }
  // Last resort: localStorage
  if (!count) {
    try {
      const key = "adi_pv";
      let c = parseInt(localStorage.getItem(key) || "0");
      if (!sessionStorage.getItem("adi_session_counted")) {
        c += 1;
        localStorage.setItem(key, c);
        sessionStorage.setItem("adi_session_counted", "1");
      }
      count = c;
    } catch { el.textContent = "—"; return; }
  }
  el.textContent = Number(count).toLocaleString();
}

async function fetchGithubGraph() {
  const container = $("#gh-graph");
  if (!container) return;
  try {
    const res = await fetch("https://github-contributions-api.jogruber.de/v4/rawenergon?y=2026");
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderGithubGraph(container, data.contributions || []);
  } catch {
    container.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:16px 0">Could not load contribution data.</p>';
  }
}

function renderGithubGraph(container, contributions) {
  // Group into weeks (Sun=0 to Sat=6)
  const weeks = [];
  let week = [];
  // Pad first week with nulls if needed
  if (contributions.length) {
    const firstDay = new Date(contributions[0].date).getDay();
    for (let i = 0; i < firstDay; i++) week.push(null);
  }
  contributions.forEach((day) => {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length) weeks.push(week);

  const total = contributions.reduce((s, d) => s + d.count, 0);
  const year  = 2026;

  let tip = document.getElementById("gh-tip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "gh-tip";
    tip.className = "gh-tip";
    document.body.appendChild(tip);
  }

  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let monthRow = '<div class="gh-months">';
  let lastMonth = -1;
  weeks.forEach((wk) => {
    const first = wk.find(Boolean);
    if (!first) { monthRow += `<span></span>`; return; }
    const m = new Date(first.date).getMonth();
    monthRow += m !== lastMonth ? `<span>${monthLabels[m]}</span>` : `<span></span>`;
    lastMonth = m;
  });
  monthRow += '</div>';

  const dayLabels = `<div class="gh-days"><span>Mon</span><span>Wed</span><span>Fri</span></div>`;

  const grid = weeks.map((wk) => {
    const cells = wk.map((day) => {
      if (!day) return `<div class="gh-cell" data-level="0" data-empty="1"></div>`;
      const lvl = day.level ?? Math.min(4, Math.ceil(day.count / 2));
      return `<div class="gh-cell" data-level="${lvl}" data-date="${day.date}" data-count="${day.count}"></div>`;
    }).join("");
    return `<div class="gh-week">${cells}</div>`;
  }).join("");

  container.innerHTML = `
    <div class="gh-wrap">
      ${monthRow}
      <div class="gh-body">
        ${dayLabels}
        <div class="gh-grid">${grid}</div>
      </div>
    </div>
    <div class="gh-footer">
      <span>${total} contributions in ${year}</span>
      <span class="gh-legend">Less <span data-level="0"></span><span data-level="1"></span><span data-level="2"></span><span data-level="3"></span><span data-level="4"></span> More</span>
    </div>`;

  container.querySelectorAll(".gh-cell:not([data-empty])").forEach((cell) => {
    cell.addEventListener("mouseenter", () => {
      const count = cell.dataset.count;
      const date  = new Date(cell.dataset.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      tip.textContent = count === "0" ? `No contributions on ${date}` : `${count} contribution${+count !== 1 ? "s" : ""} on ${date}`;
      tip.classList.add("gh-tip--visible");
    });
    cell.addEventListener("mousemove", (e) => {
      tip.style.left = (e.clientX + 12) + "px";
      tip.style.top  = (e.clientY - 36) + "px";
    });
    cell.addEventListener("mouseleave", () => tip.classList.remove("gh-tip--visible"));
  });
}


/* ============================================================
   SOUND BUTTON
   ============================================================ */
function initSoundButton() {
  const button = $("#soundButton");
  if (!button) return;
  const audio = new Audio(data.person.sound);
  audio.preload = "auto";
  button.addEventListener("click", () => {
    audio.currentTime = 0;
    button.classList.add("is-playing");
    const p = audio.play();
    if (p !== undefined) {
      p.catch((err) => { console.warn("Audio:", err); button.classList.remove("is-playing"); });
    }
  });
  audio.addEventListener("ended", () => button.classList.remove("is-playing"));
  audio.addEventListener("error", () => button.classList.remove("is-playing"));
}



/* ============================================================
   SOCIAL LINK HOVER CARDS
   ============================================================ */
function initSocialCards() {
  let card = document.querySelector(".social-card");
  if (!card) {
    card = document.createElement("div");
    card.className = "social-card";
    document.body.appendChild(card);
  }

  let mouseX = 0, mouseY = 0, raf = null;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (card.classList.contains("is-visible")) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => positionSocialCard(card));
    }
  });

  function positionSocialCard(c) {
    const offset = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = c.offsetWidth  || 280;
    const ch = c.offsetHeight || 200;
    let x = mouseX + offset;
    let y = mouseY + offset;
    if (x + cw > vw - 12) x = mouseX - cw - offset;
    if (y + ch > vh - 12) y = mouseY - ch - offset;
    c.style.left = Math.max(8, x) + "px";
    c.style.top  = Math.max(8, y) + "px";
  }

  $$(".link-grid a[data-card]").forEach((anchor) => {
    let info;
    try { info = JSON.parse(anchor.dataset.card); } catch { return; }

    anchor.addEventListener("mouseenter", () => {
      card.innerHTML = `<img class="sc-png" src="${escapeHtml(info.cardImage || "")}" alt="${escapeHtml(info.name || "")}">`;
      const img = card.querySelector("img");
      // Position after image loads so we know real dimensions
      const show = () => {
        positionSocialCard(card);
        card.classList.add("is-visible");
      };
      if (img.complete) show();
      else img.addEventListener("load", show, { once: true });
    });

    anchor.addEventListener("mouseleave", () => card.classList.remove("is-visible"));
  });
}

/* ============================================================
   SVGL TECH STACK ICONS
   ============================================================ */
// Map display name → svgl slug
const svglMap = {
  "react":"react","next.js":"nextjs","nextjs":"nextjs","python":"python",
  "node.js":"nodejs","nodejs":"nodejs","tailwind":"tailwindcss","mysql":"mysql",
  "html5":"html5","git":"git","graphql":"graphql","java":"java","django":"django",
  "php":"php","laravel":"laravel","three.js":"threejs","threejs":"threejs",
  "c++":"cplusplus","supabase":"supabase","typescript":"typescript","vercel":"vercel",
  "docker":"docker","postgresql":"postgresql","mongodb":"mongodb","figma":"figma",
  "vscode":"vscode","linux":"linux","rust":"rust","go":"go","redis":"redis",
};

async function loadStackIcons() {
  for (const item of data.stack) {
    const key = item.toLowerCase();
    const slug = svglMap[key] || key.replace(/[^a-z0-9]/g, "");
    const elId = "si-" + item.toLowerCase().replace(/[^a-z0-9]/g, "");
    const el = document.getElementById(elId);
    if (!el) continue;
    try {
      const res = await fetch(`https://svgl.app/library/${slug}.svg`);
      if (!res.ok) throw new Error();
      const svg = await res.text();
      el.innerHTML = svg;
    } catch {
      // fallback: first letter
      el.textContent = item[0].toUpperCase();
    }
  }
}

/* ============================================================
   ANIMATED VISITOR COUNTER
   ============================================================ */
function animateCounter() {
  const el = document.getElementById("views");
  if (!el) return;
  // Watch for when views gets a real number then animate up
  const observer = new MutationObserver(() => {
    const raw = el.textContent.replace(/,/g, "");
    const target = parseInt(raw);
    if (isNaN(target) || target <= 0) return;
    observer.disconnect();
    let start = 0;
    const duration = 1200;
    const step = (timestamp) => {
      if (!step.startTime) step.startTime = timestamp;
      const progress = Math.min((timestamp - step.startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  observer.observe(el, { childList: true, characterData: true, subtree: true });
}

/* ============================================================
   SOCIAL ICON HELPER
   ============================================================ */
function getSocialIcon(label) {
  const l = label.toLowerCase();
  const icons = {
    github:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    twitter:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    x:        `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    mail:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>`,
    medium:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>`,
    instagram:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    resume:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  };
  const match = Object.keys(icons).find(k => l.includes(k));
  return match ? `<span class="social-icon">${icons[match]}</span>` : "";
}

/* ============================================================
   HOME PAGE
   ============================================================ */
function renderHome() {
  const root = $("#pageRoot");
  if (!root) return;

  root.innerHTML = `
    <section class="hero-band">
      <div class="mesh-bg" aria-hidden="true"></div>
      <div class="dot-field" aria-hidden="true"></div>
    </section>
    <section class="profile-row">
      <div class="avatar-wrap">
        <div class="avatar-frame" id="avatarFrame">
          <img id="avatarImg" src="${escapeHtml(data.person.avatar)}" alt="${escapeHtml(data.person.name)}">
        </div>
      </div>
      <div class="profile-copy">
        <h1>
          ${escapeHtml(data.person.name)}
          <img class="verified" src="icons/verified.svg" title="Verified" alt="verified" width="20" height="20">
          <button id="soundButton" class="sound-button" type="button" aria-label="Play voice">
            <span></span><span></span><span></span>
          </button>
        </h1>
        <p class="role-text">${escapeHtml(data.person.role)}</p>
        <div id="liveStatus" class="status-pill idle">
          <span class="dot"></span>
          <span id="liveStatusText">Loading...</span>
        </div>
      </div>
      <div class="views" aria-label="Page views"><span class="views-icon">👁</span><span id="views">--</span></div>
    </section>
    <div class="divider"></div>
    <section class="content-section" id="about">
      <h2>About</h2>
      <ul class="about-list">
        ${data.person.about.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="spotify-widget">
        <img id="cover" src="https://via.placeholder.com/160/121212/ffffff?text=ADI" alt="">
        <div class="track-copy">
          <div class="track-status"><span id="dot"></span><span id="status">Loading music...</span></div>
          <strong id="song">---</strong>
          <span id="artist">---</span>
        </div>
        <svg class="spotify-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.8-9.3-.9-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 4-.9 7.5-.6 10.3 1.1.4.2.4.6.2.9zm1.3-2.9c-.3.4-.8.5-1.2.2-3-1.8-7.6-2.3-11.2-1.2-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 4.2-1.2 9.3-.6 12.7 1.5.4.2.5.8.1 1.3zm.1-3c-3.6-2.1-9.5-2.3-12.9-1.2-.6.2-1.2-.2-1.4-.8-.2-.6.2-1.2.8-1.4 4-1.2 10.5-.9 14.7 1.5.6.3.8 1 .5 1.6-.3.6-1 .8-1.7.3z"/>
        </svg>
      </div>
    </section>
    <div class="divider"></div>
    <section class="content-section" id="connect">
      <h2>Connect</h2>
      <div class="link-grid">
        ${data.person.links.map((link) => {
          const cardJson = link.card ? JSON.stringify(link.card).replace(/"/g, "&quot;") : null;
          const cardAttr = cardJson ? ` data-card="${cardJson}"` : "";
          const icon = getSocialIcon(link.label);
          return `<a href="${escapeHtml(link.href)}"${externalAttrs(link.href)}${cardAttr} class="social-btn">${icon}<span>${escapeHtml(link.label)}</span></a>`;
        }).join("")}
      </div>
    </section>
    <div class="divider"></div>
    <section class="content-section">
      <h2>Experience</h2>
      <div class="exp-list">
        ${data.experience.map(renderExpItem).join("")}
      </div>
    </section>
    <div class="divider"></div>
    <section class="content-section">
      <h2>Projects</h2>
      <div class="project-grid home-projects">
        ${data.projects.slice(0, 2).map((project) => `
          <article class="project-card">
            <div class="project-card-img">
              <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} preview">
            </div>
            <div class="project-card-body">
              <div class="project-card-head">
                <h2>${escapeHtml(project.title)}</h2>
                <span class="project-status ${project.status === 'Live' ? 'status-live' : 'status-building'}">
                  <span class="status-dot"></span>${escapeHtml(project.status)}
                </span>
              </div>
              ${project.subtitle ? `<p class="project-subtitle">${escapeHtml(project.subtitle)}</p>` : ""}
              <p>${escapeHtml(project.description)}</p>
              <div class="pill-list">${project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
              <div class="project-card-links">
                ${project.links.map((link) => {
                  const isGitHub = link.label.toLowerCase().includes("github");
                  const icon = isGitHub ? `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>` : "";
                  return `<a href="${escapeHtml(link.href)}"${externalAttrs(link.href)} class="project-link-btn">${icon}${escapeHtml(link.label)}</a>`;
                }).join("")}
              </div>
            </div>
          </article>`).join("")}
      </div>
      <a href="/projects" class="see-all-link">Show all Projects →</a>
    </section>
    <div class="divider"></div>
    <section class="content-section">
      <h2>Stack</h2>
      <div class="stack-grid">
        ${data.stack.map(item => `
          <div class="stack-pill">
            <span class="stack-icon"><img src="${escapeHtml(item.icon)}" alt="${escapeHtml(item.name)}" onerror="this.style.display='none'"></span>
            <span>${escapeHtml(item.name)}</span>
          </div>`).join("")}
      </div>
    </section>
    <div class="divider"></div>
    <section class="content-section" id="github">
      <h2>GitHub Activity</h2>
      <div id="gh-graph" class="gh-graph">Loading contributions...</div>
    </section>
    <div class="divider"></div>
    <section class="content-section">
      <h2>Blogs</h2>
      <div class="blog-grid home-blogs">
        ${data.blogs.filter(b => b.pinned).map(post => `
<a class="blog-card" href="${escapeHtml(post.href || post.content || "#")}">
            <div class="blog-card-img" style="${post.image ? `background-image:url('${escapeHtml(post.image)}')` : "background:var(--panel-soft)"}">
              ${!post.image ? `<span class="blog-card-placeholder">✍</span>` : ""}
            </div>
            <div class="blog-card-body">
              <strong class="blog-card-title">${escapeHtml(post.title)}</strong>
              ${post.description ? `<p class="blog-card-desc">${escapeHtml(post.description)}</p>` : ""}
              <div class="blog-card-tags">${post.tags.map(t => `<span>${escapeHtml(t)}</span>`).join("")}</div>
              <div class="blog-card-footer">
                <span class="blog-card-date">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  ${escapeHtml(post.date)}
                </span>
                <span class="blog-read-more">Read More →</span>
              </div>
            </div>
          </a>`).join("")}
      </div>
      <a href="/blog" class="see-all-link">Show all Blogs →</a>
    </section>
    <div class="divider"></div>
    <section class="content-section" id="education">
      <h2>Education</h2>
      <div class="exp-list">
        ${data.education.map(renderEduItem).join("")}
      </div>
    </section>
    <div class="divider"></div>
    <section class="cta-section">
      <h2>Scrolled To Far</h2>
      <p class="cta-text">If you've read this far, you might be interested in what I do.</p>
      <a href="https://cal.com/rawenergon" target="_blank" rel="noreferrer" class="cta-button">
        <span class="cta-emoji">&#x1F385;</span> Book A Free Call
      </a>
    </section>`;

  initSoundButton();
  fetchTrack();
  fetchRealViews();
  fetchGithubGraph();
  setInterval(fetchTrack, 30000);
  setInterval(fetchRealViews, 60000);
  initSocialCards();
  animateCounter();
  initAccordion();
  updateLiveStatus();
  setInterval(updateLiveStatus, 15000);
  initGSAPAnimations();
}

/* ============================================================
   EXPERIENCE ITEM
   ============================================================ */
function renderExperienceItem(item) {
  return `
    <article class="text-entry">
      <div class="entry-head">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>@ ${escapeHtml(item.org)}</p>
        </div>
        <span>${escapeHtml(item.period)}</span>
      </div>
      <ul>${item.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
    </article>`;
}

/* ============================================================
   EXPERIENCE & EDUCATION ITEMS — expandable accordion
   ============================================================ */
const codeIcon = `<img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/code-2.svg" alt="" style="filter:invert(0.5)" width="15" height="15">`;

function renderExpItem(item) {
  const tags = item.tags?.length ? `<div class="exp-tags">${item.tags.map(t => `<span>${escapeHtml(t)}</span>`).join("")}</div>` : "";
  const details = item.points?.length ? `<div class="acc-body"><ul>${item.points.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>${tags}</div>` : "";
  return `
    <div class="exp-org"><span class="exp-dot"></span><strong>${escapeHtml(item.org)}</strong></div>
    <div class="acc-item">
      <button class="acc-head" type="button">
        <span class="acc-icon">${codeIcon}</span>
        <div class="acc-meta">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.type || "")} ${item.type && item.period ? "│" : ""} ${escapeHtml(item.period || "")}</span>
        </div>
        <div class="acc-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
      </button>
      ${details}
    </div>`;
}

function renderEduItem(item) {
  const icon = item.icon
    ? `<img src="${escapeHtml(item.icon)}" alt="" style="filter:invert(0.5)" width="15" height="15">`
    : codeIcon;
  return `
    <div class="exp-org"><span class="exp-dot"></span><strong>${escapeHtml(item.org)}</strong></div>
    <div class="acc-item">
      <div class="acc-head edu-head">
        <span class="acc-icon">${icon}</span>
        <div class="acc-meta">
          <strong>${escapeHtml(item.title)} <span style="color:var(--muted);font-weight:400">· ${escapeHtml(item.field)}</span></strong>
          <span>${escapeHtml(item.period)}</span>
        </div>
      </div>
    </div>`;
}

function initAccordion() {
  document.querySelectorAll(".acc-head").forEach(btn => {
    btn.addEventListener("click", () => {
      const body = btn.nextElementSibling;
      if (!body || !body.classList.contains("acc-body")) return;
      const open = btn.classList.toggle("is-open");
      if (open) {
        body.style.maxHeight = body.scrollHeight + "px";
        body.style.opacity = "1";
      } else {
        body.style.maxHeight = "0";
        body.style.opacity = "0";
      }
    });
  });
}


function renderProjectsPage() {
  const root = $("#pageRoot");
  root.innerHTML = `
    <section class="page-intro">
      <h1>Projects</h1>
      <p>Showcase of my work</p>
      <div class="page-subheader">
        <input type="text" id="projectSearch" class="page-search" placeholder="Search Projects..." aria-label="Search projects">
      </div>
    </section>
    <div class="project-grid" id="projectGrid"></div>`;

  const grid = $("#projectGrid");
  const searchInput = $("#projectSearch");

  function renderCards(q) {
    const norm = (q || "").toLowerCase().trim();
    const list = norm
      ? data.projects.filter(p => p.title.toLowerCase().includes(norm) || p.description.toLowerCase().includes(norm) || p.tags.some(t => t.toLowerCase().includes(norm)))
      : data.projects;
    grid.innerHTML = list.map((project) => `
      <article class="project-card">
        <div class="project-card-img">
          <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} preview">
        </div>
        <div class="project-card-body">
          <div class="project-card-head">
            <h2>${escapeHtml(project.title)}</h2>
            <span class="project-status ${project.status === 'Live' ? 'status-live' : 'status-building'}">
              <span class="status-dot"></span>${escapeHtml(project.status)}
            </span>
          </div>
          ${project.subtitle ? `<p class="project-subtitle">${escapeHtml(project.subtitle)}</p>` : ""}
          <p>${escapeHtml(project.description)}</p>
          <div class="pill-list">${project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="project-card-links">
            ${project.links.map((link) => {
              const isGitHub = link.label.toLowerCase().includes("github");
              const icon = isGitHub ? `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>` : "";
              return `<a href="${escapeHtml(link.href)}"${externalAttrs(link.href)} class="project-link-btn">${icon}${escapeHtml(link.label)}</a>`;
            }).join("")}
          </div>
        </div>
      </article>`).join("");
  }

  renderCards("");
  searchInput?.addEventListener("input", () => renderCards(searchInput.value));
}



/* ============================================================
   COMMAND PALETTE — rich version like reference image
   ============================================================ */
function initCommandPalette() {
  const dialog  = $("#commandDialog");
  const input   = $("#commandInput");
  const results = $("#commandResults");

  const pages = [
    { label: "Home",       hint: "Navigation", href: "/",           key: "H", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
    { label: "Work",       hint: "Navigation", href: "/projects",   key: "W", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>` },
    { label: "Projects",   hint: "Navigation", href: "/projects",   key: "P", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>` },
    { label: "Blog",       hint: "Navigation", href: "/blog",       key: "B", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 019 9"/><path d="M4 4a16 16 0 0116 16"/><circle cx="5" cy="19" r="1"/></svg>` },
    { label: "Bookmarks",  hint: "Navigation", href: "/bookmarks",  key: "M", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>` },
    { label: "Sponsor",    hint: "Navigation", href: "/sponsor",    key: "S", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>` },
  ];

  const projectItems = (data.projects || []).map(p => ({
    label: p.title,
    hint: "Project",
    href: p.links?.[0]?.href || "#",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`
  }));

  const features = [
    { label: "Toggle theme",  hint: "Feature", key: "D", action: () => { const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = t; localStorage.setItem("theme", t); }, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>` },

  ];

  let selectedIndex = -1;
  let allItems = [];

  function buildItems(q) {
    const norm = q.toLowerCase().trim();
    const matchedPages = pages.filter(p => p.label.toLowerCase().includes(norm));
    const matchedProjects = projectItems.filter(p => p.label.toLowerCase().includes(norm));
    const matchedFeatures = norm ? features.filter(f => f.label.toLowerCase().includes(norm)) : features;
    allItems = [...matchedPages, ...matchedProjects, ...matchedFeatures];

    let html = "";
    if (matchedPages.length) {
      html += `<div class="cmd-group-label">Navigation</div>`;
      html += matchedPages.map((p, i) => `
        <a class="cmd-item" href="${escapeHtml(p.href)}" data-idx="${i}">
          <span class="cmd-item-icon">${p.icon}</span>
          <span class="cmd-item-label">${escapeHtml(p.label)}</span>
          <span class="cmd-item-key">${escapeHtml(p.key)}</span>
        </a>`).join("");
    }
    if (matchedProjects.length) {
      html += `<div class="cmd-group-label">Projects</div>`;
      html += matchedProjects.map((p, i) => {
        const idx = matchedPages.length + i;
        return `
        <a class="cmd-item" href="${escapeHtml(p.href)}" data-idx="${idx}">
          <span class="cmd-item-icon">${p.icon}</span>
          <span class="cmd-item-label">${escapeHtml(p.label)}</span>
          <span class="cmd-item-hint">${escapeHtml(p.hint)}</span>
        </a>`;
      }).join("");
    }
    if (matchedFeatures.length) {
      html += `<div class="cmd-group-label">Feature</div>`;
      html += matchedFeatures.map((f, i) => {
        const idx = matchedPages.length + matchedProjects.length + i;
        return `
        <button class="cmd-item" data-idx="${idx}" type="button">
          <span class="cmd-item-icon">${f.icon}</span>
          <span class="cmd-item-label">${escapeHtml(f.label)}</span>
          <span class="cmd-item-key">${escapeHtml(f.key)}</span>
        </button>`;
      }).join("");
    }
    results.innerHTML = html || `<div class="cmd-empty">No results</div>`;
    selectedIndex = -1;
    updateSelected();

    results.querySelectorAll(".cmd-item[type=button]").forEach(btn => {
      const idx = parseInt(btn.dataset.idx);
      btn.addEventListener("click", () => { allItems[idx]?.action?.(); dialog.close(); });
    });
  }

  function updateSelected() {
    results.querySelectorAll(".cmd-item").forEach((el, i) => {
      el.classList.toggle("is-selected", i === selectedIndex);
      if (i === selectedIndex) el.scrollIntoView({ block: "nearest" });
    });
  }

  function open() {
    buildItems("");
    dialog.showModal();
    requestAnimationFrame(() => input.focus());
  }

  $$(".search-trigger").forEach(btn => btn.addEventListener("click", (e) => {
    playClick();
    open();
  }));

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); return; }
    if (!dialog.open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, allItems.length - 1); updateSelected(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); updateSelected(); }
    if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const item = allItems[selectedIndex];
      if (item?.action) { item.action(); dialog.close(); }
      else if (item?.href) { window.location.href = item.href; dialog.close(); }
    }
    if (e.key === "Escape") dialog.close();
    // Feature shortcuts D and V
    if (!input.value && e.key.toUpperCase() === "D") { features[0].action(); }
    if (!input.value && e.key.toUpperCase() === "V") { features[1].action(); }
  });

  input?.addEventListener("input", () => { buildItems(input.value); });
  dialog?.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog?.addEventListener("close", () => { input.value = ""; selectedIndex = -1; });
}

/* ============================================================
   LIVE STATUS — dynamic Gist-based status with typing
   ============================================================ */
const STATUS_GIST = "https://gist.githubusercontent.com/rawenergon/02d31daba4d7e70fc6aac6024f7b6133/raw/status.txt";

function typeText(el, text, speed = 25) {
  el.textContent = "";
  let i = 0;
  function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    }
  }
  step();
}

function setLiveStatus(text, type) {
  const pill = $("#liveStatus");
  const txt  = $("#liveStatusText");
  if (!pill || !txt) return;
  pill.className = "status-pill " + type;
  typeText(txt, text);
}

function toMin(t) {
  const [h, m] = t.trim().split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

async function updateLiveStatus() {
  try {
    const res = await fetch(STATUS_GIST + "?t=" + Date.now());
    const data = await res.text();
    const lines = data.trim().split("\n");
    const now = nowMinutes();
    let current = null;

    for (const line of lines) {
      const parts = line.split("|");
      if (parts.length < 3) continue;
      const range = parts[0].trim();
      const emoji = parts[1].trim();
      const label = parts[2].trim();
      const [start, end] = range.split("-");
      const s = toMin(start);
      const e = toMin(end);
      if (now >= s && now < e) {
        current = `${emoji} ${label}`;
        break;
      }
    }

    if (current) {
      setLiveStatus(current, "active");
    } else {
      setLiveStatus("🟡 Idle · Currently free", "idle");
    }
  } catch {
    setLiveStatus("⚪ Offline", "idle");
  }
}

/* ============================================================
   GSAP ANIMATIONS
   ============================================================ */
function initGSAPAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // Entrance — always visible (no opacity:0)
  gsap.from(".hero-band", { duration: 0.8, ease: "power2.out" });
  gsap.from(".profile-row", { y: 20, duration: 0.6, delay: 0.2, ease: "power2.out" });

}

/* ============================================================
   SPONSOR PAGE
   ============================================================ */
function renderSponsorPage() {
  const root = $("#pageRoot");
  const sponsors = {
    opensource: [],
    gold: [
      { name: "Abhinav", image: "https://cdn.hackclub.com/019ec9a6-9288-7831-a541-342569249249/abhinav.png", description: "Supporting the project." }
    ],
    silver: []
  };

  let html = `
    <section class="page-intro">
      <h1>Sponsors</h1>
      <p>Backed by the community.</p>
      <p style="margin-top:16px;color:var(--muted);font-size:15px;line-height:1.6">Grateful to the sponsors who make this open-source work possible.</p>
    </section>`;

  if (sponsors.opensource.length) {
    html += `
      <div class="content-section">
        <h2>Open Source Program</h2>
        <div class="sponsor-grid">
          ${sponsors.opensource.map(s => `
            <div class="sponsor-card sponsor-card--osponsor">
              <img src="${s.image}" alt="${s.name}" class="sponsor-logo sponsor-logo--large">
            </div>
          `).join("")}
        </div>
      </div>`;
  }

  if (sponsors.gold.length) {
    html += `
      <div class="content-section">
        <h2>Gold Sponsors</h2>
        <div class="sponsor-grid">
          ${sponsors.gold.map(s => `
            <div class="sponsor-card sponsor-card--gold">
              <img src="${s.image}" alt="${s.name}" class="sponsor-logo sponsor-logo--gold">
              <h3>${s.name}</h3>
              ${s.description ? `<p>${s.description}</p>` : ""}
            </div>
          `).join("")}
        </div>
      </div>`;
  }

  if (sponsors.silver.length) {
    html += `
      <div class="content-section">
        <h2>Silver Sponsors</h2>
        <div class="sponsor-grid">
          ${sponsors.silver.map(s => `
            <div class="sponsor-card sponsor-card--silver">
              <img src="${s.image}" alt="${s.name}" class="sponsor-logo sponsor-logo--silver">
              <p>${s.name}</p>
            </div>
          `).join("")}
        </div>
      </div>`;
  }

  html += `<div class="sponsor-cta"><div id="razorpay-cta"></div></div>`;
  root.innerHTML = html;

  const cta = $("#razorpay-cta");
  if (cta) {
    const f = document.createElement("form");
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/payment-button.js";
    s.dataset.payment_button_id = "pl_T1ltzHomhRxyID";
    s.async = true;
    f.appendChild(s);
    cta.appendChild(f);
  }
}

function renderThanksPage() {
  const root = $("#pageRoot");
  root.innerHTML = `
    <section class="thanks-page">
      <div class="thanks-card">
        <h1>Thank You!</h1>
        <p>Your support truly means a lot. It helps me keep building and sharing.</p>
        <a href="/" class="thanks-back">← Back home</a>
      </div>
    </section>`;
}

/* ============================================================
   BOOKMARKS PAGE
   ============================================================ */
const BOOKMARKS_GIST = "3c6321a801de8767eb4721bd27882ea6";

function bookmarkFavicon(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
  } catch {
    return "";
  }
}

function renderBookmarksPage() {
  const root = $("#pageRoot");
  root.innerHTML = `
    <section class="page-intro">
      <h1>Bookmarks</h1>
      <p>A collection of my favorite links.</p>
      <div class="bookmarks-search-wrap">
        <input type="text" id="bookmarksSearch" class="bookmarks-search" placeholder="Search Bookmarks..." aria-label="Search bookmarks">
      </div>
    </section>
    <div class="bookmarks-list" id="bookmarksList">
      <div class="bookmarks-loading">Loading bookmarks...</div>
    </div>`;

  const searchInput = $("#bookmarksSearch");
  let allBookmarks = [];

  searchInput?.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      renderBookmarkCategories(allBookmarks);
    } else {
      const filtered = allBookmarks.map(cat => ({
        ...cat,
        links: cat.links.filter(l =>
          l.name.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q)
        )
      })).filter(cat => cat.links.length > 0);
      renderBookmarkCategories(filtered);
    }
  });

  async function loadBookmarks() {
    const list = $("#bookmarksList");
    try {
      const res = await fetch(`https://api.github.com/gists/${BOOKMARKS_GIST}`);
      if (!res.ok) throw new Error("Failed to fetch gist");
      const gist = await res.json();
      const fileName = Object.keys(gist.files)[0];
      const raw = gist.files[fileName].content;
      const data = JSON.parse(raw);
      allBookmarks = data.categories || [];
      renderBookmarkCategories(allBookmarks);
    } catch (err) {
      list.innerHTML = '<div class="bookmarks-error">Failed to load bookmarks.</div>';
      console.error(err);
    }
  }

  function renderBookmarkCategories(categories) {
    const list = $("#bookmarksList");
    let globalIdx = 0;
    list.innerHTML = categories.map(cat => `
      <div class="bookmark-category">
        <h2 class="bookmark-category-title">${escapeHtml(cat.title)}</h2>
        ${cat.links.map(link => {
          globalIdx++;
          const host = (() => { try { return new URL(link.url).hostname; } catch { return ""; } })();
          return `
            <a class="bookmark-row" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">
              <span class="bookmark-number">${globalIdx}</span>
              <div class="bookmark-info">
                <strong>${escapeHtml(link.name)}</strong>
                <small>${escapeHtml(host)}</small>
              </div>
              <span class="bookmark-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
              </span>
            </a>`;
        }).join("")}
      </div>
    `).join("");

    list.querySelectorAll(".bookmark-row").forEach((row, i) => {
      gsap.from(row, {
        scrollTrigger: { trigger: row, start: "top 92%" },
        x: -12,
        duration: 0.4,
        delay: (i % 10) * 0.04,
        ease: "power2.out"
      });
    });
  }

  loadBookmarks();
}

/* ============================================================
   CLIENT-SIDE NAVIGATION
   ============================================================ */
function navigate(href) {
  if (!href || href.startsWith("http") || href.startsWith("mailto")) return;
  const path = href.startsWith("/") ? href : "/" + href;
  window.history.pushState({}, "", path);
  document.body.dataset.page = path.split("/")[1] || "home";
  routePage();
  window.scrollTo(0, 0);
}

// Intercept internal navigation clicks (skip blog — Jekyll handles it)
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#") || href.startsWith("?") || href.startsWith("/blog") || href.startsWith("/dashboard")) return;
  e.preventDefault();
  playClick();
  navigate(href);
});

// Handle browser back/forward
window.addEventListener("popstate", () => {
  document.body.dataset.page = window.location.pathname.split("/")[1] || "home";
  routePage();
});

/* ============================================================
   BOOT
   ============================================================ */
initHeader();
initTheme();
initCommandPalette();

// Generate real canvas noise into .noise-layer
(function() {
  const el = document.querySelector(".noise-layer");
  if (!el) return;
  const canvas = document.createElement("canvas");
  const SIZE = 256;
  canvas.width = canvas.height = SIZE;
  canvas.style.cssText = "width:100%;height:100%;object-fit:cover;";
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255 | 0;
    img.data[i] = img.data[i+1] = img.data[i+2] = v;
    img.data[i+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  el.appendChild(canvas);
  el.style.backgroundImage = `url(${canvas.toDataURL()})`;
  el.style.backgroundSize = "256px 256px";
  el.removeChild(canvas);
})();

// Populate quote on every page
const quoteEl = document.getElementById("siteQuote");
const quoteAuthorEl = document.getElementById("siteQuoteAuthor");
if (quoteEl && data.person.quote) {
  quoteEl.textContent = `"${data.person.quote.text}"`;
  quoteAuthorEl.innerHTML = `<span></span>${data.person.quote.author.toUpperCase()}<span></span>`;
}

/* ============================================================
   CLIENT-SIDE ROUTER — handles clean URLs locally
   ============================================================ */
function routePage() {
  const path = window.location.pathname;
  const currentPage = document.body.dataset.page || "";
  // Skip if page was rendered server-side (Jekyll)
  if (!currentPage) return;
  if (currentPage === "home" || path === "/" || path === "") { renderHome(); return; }
  if (currentPage === "projects")  { renderProjectsPage(); return; }
  if (currentPage === "bookmarks") { renderBookmarksPage(); return; }
  if (currentPage === "sponsor")   { renderSponsorPage(); return; }
  if (currentPage === "thanks")    { renderThanksPage(); return; }
}

routePage();