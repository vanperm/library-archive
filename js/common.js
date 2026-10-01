/* ============================================================
   The Reading Room: shared chrome behavior
   ============================================================ */

const ICON_SOUND_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 8.5a5 5 0 0 1 0 7"/><path d="M19.5 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICON_SOUND_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>';

function updateLoanBadge() {
  const badge = document.getElementById("navLoanCount");
  if (!badge) return;
  const n = Store.getLoans().length;
  badge.textContent = n;
  badge.style.display = n > 0 ? "inline-block" : "none";
}

function showSoundFeedback(muted) {
  let badge = document.getElementById("soundFeedbackBadge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "soundFeedbackBadge";
    badge.className = "sound-feedback-badge";
    document.body.appendChild(badge);
  }
  badge.innerHTML = muted ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> Audio Muted' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Audio Active';
  badge.classList.remove("show");
  void badge.offsetWidth;
  badge.classList.add("show");

  clearTimeout(badge._timer);
  badge._timer = setTimeout(() => {
    badge.classList.remove("show");
  }, 1800);
}

function initNav() {
  updateLoanBadge();
  window.addEventListener("reading-room:loans-changed", updateLoanBadge);

  const toggle = document.getElementById("soundToggle");
  if (toggle) {
    const paint = () => {
      const muted = Sound.isMuted();
      toggle.setAttribute("aria-pressed", (!muted).toString());
      toggle.setAttribute("aria-label", muted ? "Audio feedback is muted. Click to turn on." : "Audio feedback is on. Click to mute.");
      toggle.setAttribute("title", muted ? "Enable audio feedback" : "Mute audio feedback");
      toggle.innerHTML = muted ? ICON_SOUND_OFF : ICON_SOUND_ON;
    };
    paint();
    toggle.addEventListener("click", () => {
      const muted = Sound.toggle();
      paint();
      showSoundFeedback(muted);
      if (!muted) Sound.click();
    });
  }

  initHeroGlow();
  initQuoteRotator();
  initTitleRotator();
}

/** Dynamic rotating main titles across all 3 dashboards (Catalog, My Shelf, Librarian Desk). */
const HERO_TITLES = {
  catalog: [
    "Borrow something to read tonight.",
    "Open shelves, tactile pages, zero barriers.",
    "A living collection waiting for you."
  ],
  shelf: [
    "What you have borrowed.",
    "Your private reading sanctuary.",
    "Active loans and personal history."
  ],
  admin: [
    "Library Operations and Ledger.",
    "Circulation desk and acquisitions.",
    "Live collection management."
  ]
};

function initTitleRotator() {
  const titleEl = document.getElementById("heroTitle");
  if (!titleEl) return;

  const page = titleEl.dataset.page || "catalog";
  const titles = HERO_TITLES[page] || HERO_TITLES.catalog;
  let tIdx = 0;
  let tTimer = null;

  function advanceTitle() {
    tIdx = (tIdx + 1) % titles.length;
    titleEl.classList.add("fade-out");
    setTimeout(() => {
      titleEl.textContent = titles[tIdx];
      titleEl.classList.remove("fade-out");
    }, 350);
  }

  function startTitleTimer() {
    clearInterval(tTimer);
    tTimer = setInterval(advanceTitle, 13500);
  }

  startTitleTimer();

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      advanceTitle();
      startTitleTimer();
    }
  });

  window.addEventListener("reading-room:advance-quote", () => {
    advanceTitle();
    startTitleTimer();
  });
}

/** Dynamic rotating quotes across all 3 dashboards (Catalog, My Shelf, Librarian Desk). */
const HERO_QUOTES = {
  catalog: [
    "Every title below can be opened as a real, page-turning book before you decide, with opening chapters you can read right now.",
    "\u201CA room without books is like a body without a soul.\u201D \u00B7 Cicero",
    "\u201CThere is no friend as loyal as a book.\u201D \u00B7 Ernest Hemingway",
    "\u201CThe reading of all good books is like conversation with the finest minds of past centuries.\u201D \u00B7 Ren\u00E9 Descartes",
    "Open shelves, tactile pages, and zero late fees. Pick a volume to take home tonight."
  ],
  shelf: [
    "Everything checked out on this browser card, in the order it is due back. Renew your loan by two weeks, or return anytime.",
    "\u201CBooks are a uniquely portable magic.\u201D \u00B7 Stephen King",
    "Rate completed volumes with stars and preserve your private reading journey in the permanent archive.",
    "\u201CWhen you sell a man a book, you don't sell twelve ounces of paper, you sell a whole new life.\u201D \u00B7 Christopher Morley",
    "Synchronized across local patron storage. Your loans and reading history stay safe right here."
  ],
  admin: [
    "Monitor active borrowings across all patrons, adjust book inventory counts, catalog newly acquired volumes, and export circulation reports.",
    "\u201CTo build up a library is to create a life along with a world.\u201D \u00B7 Carlos Mar\u00EDa Dom\u00EDnguez",
    "Real-time inventory synchronization across all shelves, waitlists, and patron checkouts.",
    "\u201CThe only thing that you absolutely have to know, is the location of the library.\u201D \u00B7 Albert Einstein",
    "Dynamic live ledger tracking loan ratios, stock alerts, and instant CSV circulation exports."
  ]
};

function initQuoteRotator() {
  const rotatorEl = document.getElementById("heroQuoteRotator");
  if (!rotatorEl) return;

  const page = rotatorEl.dataset.page || "catalog";
  const list = HERO_QUOTES[page] || HERO_QUOTES.catalog;
  let idx = 0;
  let timer = null;

  function advanceQuote() {
    idx = (idx + 1) % list.length;
    rotatorEl.classList.add("fade-out");
    setTimeout(() => {
      rotatorEl.textContent = list[idx];
      rotatorEl.classList.remove("fade-out");
    }, 300);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(advanceQuote, 8500);
  }

  startTimer();

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      advanceQuote();
      startTimer();
    }
  });

  window.addEventListener("reading-room:advance-quote", () => {
    advanceQuote();
    startTimer();
  });
}

/** A soft glow in the hero that follows the cursor (mouse only, harmless if absent). */
function initHeroGlow() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty("--mx", x + "%");
    hero.style.setProperty("--my", y + "%");
  });
}

/** Animates a number counting up inside el's textContent (plain integer, no formatting). */
function animateCount(el, target, duration = 500) {
  if (!el) return;
  const start = Number(el.dataset.countFrom || 0);
  if (start === target) { el.textContent = target; return; }
  const startTime = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = value;
    if (p < 1) requestAnimationFrame(tick);
    else el.dataset.countFrom = target;
  }
  requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", initNav);
