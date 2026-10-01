/* ============================================================
   The Reading Room: catalog page
   ============================================================ */

(function () {
  const grid = document.getElementById("catalogGrid");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");
  const sortSelect = document.getElementById("sortSelect");
  const sortDropdown = document.getElementById("sortDropdown");
  const sortBtn = document.getElementById("sortBtn");
  const sortCurrentLabel = document.getElementById("sortCurrentLabel");
  const chipsEl = document.getElementById("genreChips");
  const metaEl = document.getElementById("shelfMeta");

  let activeGenre = "All";
  let query = "";
  let sortMode = "default";
  let lastCount = null;

  function getBooks() {
    return Store.getAllBooks();
  }

  function buildChips() {
    const allBooks = getBooks();
    const uniqueGenres = [...new Set(allBooks.map(b => b.genre))].sort();
    const genres = ["All", ...uniqueGenres];

    chipsEl.innerHTML = genres.map(g => {
      const count = g === "All" ? allBooks.length : allBooks.filter(b => b.genre === g).length;
      const color = g === "All" ? "#6C3CE9" : genreColor(g);
      return `
        <button class="chip${g === activeGenre ? " on" : ""}" data-genre="${g}" style="--chip-color:${color}" aria-label="Filter by ${g}, ${count} titles">
          <span class="chip-dot"></span>${g} <span class="chip-count">${count}</span>
        </button>
      `;
    }).join("");

    chipsEl.querySelectorAll(".chip").forEach((btn, idx) => {
      btn.addEventListener("mouseenter", () => {
        Sound.chipHover(idx);
      });
      btn.addEventListener("click", () => {
        activeGenre = btn.dataset.genre;
        Sound.click();
        buildChips();
        render();
      });
    });
  }

  function cardHtml(book) {
    const avail = Store.availableCopies(book);
    const isOut = avail === 0;
    const accent = genreColor(book.genre);
    const waitCount = Store.waitlistCountFor(book.id);

    return `
      <article class="book-card" tabindex="0" data-id="${book.id}" role="button" aria-label="Preview ${book.title} by ${book.author}" style="--accent:${accent}">
        <div class="mini-cover-wrap">
          <div class="mini-cover" style="background:${book.cover}">
            ${renderCoverArt(book.id)}
            <div class="emblem">${EMBLEMS[book.emblem] || ""}</div>
            <div class="face"><span class="title">${book.title}</span></div>
            <div class="spine-edge"></div>
            <div class="pages-edge"></div>
          </div>
        </div>
        <div class="book-info">
          <div class="genre-tag">${book.genre} &middot; ${book.year}</div>
          <h3>${book.title}</h3>
          <div class="author">${book.author}</div>
          <div class="avail${isOut ? " out" : ""}">
            <span class="dot"></span>
            ${isOut ? (waitCount > 0 ? `Out &middot; ${waitCount} reserved` : "All copies checked out") : `${avail} of ${book.copies} available`}
          </div>
        </div>
      </article>
    `;
  }

  function matches(book) {
    const q = query.trim().toLowerCase();
    const genreOk = activeGenre === "All" || book.genre === activeGenre;
    if (!genreOk) return false;
    if (!q) return true;
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.genre.toLowerCase().includes(q) ||
      String(book.year).includes(q) ||
      (book.call && book.call.toLowerCase().includes(q))
    );
  }

  function sortList(list) {
    const copy = [...list];
    switch (sortMode) {
      case "title-asc":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return copy.sort((a, b) => b.title.localeCompare(a.title));
      case "year-desc":
        return copy.sort((a, b) => b.year - a.year);
      case "year-asc":
        return copy.sort((a, b) => a.year - b.year);
      case "avail-first":
        return copy.sort((a, b) => Store.availableCopies(b) - Store.availableCopies(a));
      default:
        return copy;
    }
  }

  function render() {
    const allBooks = getBooks();
    const filtered = allBooks.filter(matches);
    const list = sortList(filtered);

    metaEl.innerHTML = `<span class="stat-num" id="statNum">${lastCount === null ? list.length : lastCount}</span> title${list.length === 1 ? "" : "s"} on the shelf`;
    animateCount(document.getElementById("statNum"), list.length, 450);
    lastCount = list.length;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <strong>No titles match that search</strong>
          <p>Try another keyword, clear the genre filter, or reset your search.</p>
          <button class="btn btn-secondary btn-sm" id="resetFiltersBtn" style="margin-top:12px">Clear search &amp; filters</button>
        </div>
      `;
      const resetBtn = grid.querySelector("#resetFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          query = "";
          searchInput.value = "";
          activeGenre = "All";
          if (clearBtn) clearBtn.hidden = true;
          buildChips();
          render();
        });
      }
      return;
    }

    grid.innerHTML = list.map(cardHtml).join("");
    grid.querySelectorAll(".book-card").forEach((card, i) => {
      card.style.animationDelay = `${Math.min(i, 10) * 35}ms`;
      const open = () => { Sound.click(); BookModal.open(card.dataset.id); };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      card.addEventListener("mouseenter", () => { Sound.bookHover(i); });
      card.addEventListener("pointerdown", () => { Sound.bookHover(i); });
    });
  }

  searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    if (clearBtn) clearBtn.hidden = query.length === 0;
    render();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      query = "";
      searchInput.value = "";
      clearBtn.hidden = true;
      searchInput.focus();
      window.dispatchEvent(new CustomEvent("reading-room:advance-quote"));
      render();
    });
  }

  function setSortMode(val, label) {
    sortMode = val;
    if (sortSelect) sortSelect.value = val;
    if (sortCurrentLabel && label) {
      sortCurrentLabel.textContent = label;
    }
    if (sortDropdown) {
      sortDropdown.querySelectorAll(".sort-option").forEach(opt => {
        const isMatch = opt.dataset.value === val;
        opt.classList.toggle("selected", isMatch);
        opt.setAttribute("aria-selected", isMatch ? "true" : "false");
      });
      sortDropdown.classList.remove("open");
      if (sortBtn) sortBtn.setAttribute("aria-expanded", "false");
    }
    render();
  }

  if (sortBtn && sortDropdown) {
    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = sortDropdown.classList.toggle("open");
      sortBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      Sound.click();
    });

    sortDropdown.querySelectorAll(".sort-option").forEach((opt, idx) => {
      opt.addEventListener("mouseenter", () => {
        Sound.chipHover(idx);
      });
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const val = opt.dataset.value;
        const span = opt.querySelector("span");
        const label = span ? span.textContent.trim() : opt.textContent.trim();
        Sound.click();
        setSortMode(val, label);
      });
    });

    document.addEventListener("click", (e) => {
      if (sortDropdown.classList.contains("open") && !sortDropdown.contains(e.target)) {
        sortDropdown.classList.remove("open");
        if (sortBtn) sortBtn.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sortDropdown.classList.contains("open")) {
        sortDropdown.classList.remove("open");
        if (sortBtn) {
          sortBtn.setAttribute("aria-expanded", "false");
          sortBtn.focus();
        }
      }
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const selectedOpt = sortSelect.options[sortSelect.selectedIndex];
      setSortMode(e.target.value, selectedOpt ? selectedOpt.text : null);
      Sound.click();
    });
  }

  window.addEventListener("reading-room:loans-changed", () => {
    buildChips();
    render();
  });

  window.addEventListener("reading-room:catalog-changed", () => {
    buildChips();
    render();
  });

  window.addEventListener("reading-room:waitlist-changed", render);

  buildChips();
  render();
})();
