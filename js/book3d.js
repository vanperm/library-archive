/* ============================================================
   The Reading Room: 3D book preview + borrowing card
   Builds one reusable modal, populated per book on open().
   ============================================================ */

const EMBLEMS = {
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 20c8-1 14-7 15-16-9 1-15 7-15 16Z"/><path d="M5 19c3-4 7-8 12-11"/></svg>',
  orbit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="2.4"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="4.2" ry="10" transform="rotate(35 12 12)"/></svg>',
  quill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M20 4c-7 1-13 6-15 15 9-2 14-8 15-15Z"/><path d="M5 19l3-3"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6 6-2Z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 17c0-6 1-10 6-10s6 4 6 10H6Z"/><path d="M4 17h16"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  window: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 3v18M6 21h12"/><path d="M4 7h6M14 7h6"/><path d="M4 7l-2.5 5a2.5 2.5 0 0 0 5 0L4 7ZM20 7l-2.5 5a2.5 2.5 0 0 0 5 0L20 7Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 3l2.4 6.5L21 11l-5 4.2L17.5 21 12 17.3 6.5 21 8 15.2 3 11l6.6-1.5L12 3Z"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="4.2"/><path d="M11 11l9 9M16 16l3-3M18 18l2.5-2.5"/></svg>'
};

const BookModal = (() => {
  let root, panel, book3dEl, closedView, readerView, spread, leftCol, rightCol;
  let panelInfo, indicatorEl, prevBtn, nextBtn;
  let currentBook = null;
  let leaves = [];
  let pageIndex = 0; // number of leaves flipped (0..leaves.length)

  function build() {
    root = document.createElement("div");
    root.className = "book-modal";
    root.innerHTML = `
      <div class="book-modal-backdrop"></div>
      <div class="book-modal-scroll">
        <div class="book-modal-panel" role="dialog" aria-modal="true">
          <button class="modal-close" aria-label="Close">&times;</button>
          <div class="book-stage">
            <div class="book-closed" id="bmClosed">
              <div class="cover3d" id="bmCover" tabindex="0" role="button" aria-label="Open the book">
                <div class="front-face">
                  <div class="cover-art-slot" id="bmCoverArt"></div>
                  <div class="emblem" id="bmEmblem"></div>
                  <div style="position:relative;z-index:2">
                    <div class="cover-title" id="bmCoverTitle"></div>
                    <div class="cover-author" id="bmCoverAuthor"></div>
                  </div>
                </div>
                <div class="spine-edge"></div>
                <div class="pages-edge"></div>
              </div>
            </div>
            <div class="open-hint" id="bmHint">Click the book to open it</div>

            <div class="book-reader" id="bmReader">
              <div class="spread">
                <div class="page-col left" id="bmLeft"></div>
                <div class="page-col right" id="bmRight"></div>
              </div>
              <div class="reader-controls">
                <button id="bmPrev" aria-label="Previous page">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <span class="reading-progress" id="bmIndicator"></span>
                <button id="bmNext" aria-label="Next page">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </div>
              <button class="close-book-btn" id="bmCloseBook">Close the book</button>
            </div>
          </div>

          <div class="book-panel" id="bmPanel"></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    panel = root.querySelector(".book-modal-panel");
    closedView = root.querySelector("#bmClosed");
    readerView = root.querySelector("#bmReader");
    leftCol = root.querySelector("#bmLeft");
    rightCol = root.querySelector("#bmRight");
    panelInfo = root.querySelector("#bmPanel");
    indicatorEl = root.querySelector("#bmIndicator");
    prevBtn = root.querySelector("#bmPrev");
    nextBtn = root.querySelector("#bmNext");

    root.querySelector(".modal-close").addEventListener("click", close);
    root.querySelector(".book-modal-backdrop").addEventListener("click", close);
    root.querySelector("#bmCover").addEventListener("click", openBookAnimation);
    root.querySelector("#bmCover").addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBookAnimation(); }
    });
    root.querySelector("#bmCloseBook").addEventListener("click", resetToClosed);
    prevBtn.addEventListener("click", () => turn(-1));
    nextBtn.addEventListener("click", () => turn(1));

    document.addEventListener("keydown", (e) => {
      if (!root.classList.contains("show")) return;
      if (e.key === "Escape") close();
      if (readerView.classList.contains("show")) {
        if (e.key === "ArrowRight") turn(1);
        if (e.key === "ArrowLeft") turn(-1);
      }
    });
  }

  function leafHtml(book, leaf) {
    return `
      <div class="leaf" data-leaf="${leaf.i}">
        <div class="leaf-face front">${leaf.front}</div>
        <div class="leaf-face back">${leaf.back}</div>
      </div>
    `;
  }

  function titlePlate(book) {
    return `<div class="static-plate title-plate">
      <div class="tp-title">${book.title}</div>
      <div class="tp-author">${book.author.toUpperCase()}</div>
      <div class="tp-rule"></div>
      <div class="tp-edition">The Reading Room · Preview Edition</div>
    </div>`;
  }

  function epigraphPlate(book) {
    return `<div class="static-plate">
      <div class="page-heading">Epigraph</div>
      <p class="page-text no-dropcap" style="font-style:italic;text-align:center">&ldquo;${book.epigraph}&rdquo;</p>
    </div>`;
  }

  function textPlate(heading, text) {
    return `<div class="static-plate" style="align-items:stretch;text-align:left;justify-content:flex-start">
      ${heading ? `<div class="page-heading">${heading}</div>` : ""}
      <div class="page-text">${text}</div>
    </div>`;
  }

  function exLibrisPlate() {
    return `<div class="static-plate">
      <div class="exlibris">
        <div class="el-mark">Ex Libris · The Reading Room</div>
        <div class="el-name-line"></div>
        <p>this book belongs, for a little while, to whoever is reading it now</p>
      </div>
    </div>`;
  }

  function endPlate() {
    return `<div class="static-plate end-plate">
      <div class="ep-label">End of preview</div>
      <p>Borrow this book from the panel on the right to keep reading.</p>
    </div>`;
  }

  function dueCardPlate(book) {
    return `<div class="static-plate">
      <div class="due-card">
        <div class="dc-head">DATE DUE &nbsp;·&nbsp; ${book.call}</div>
        <table><tbody id="bmDueRows"></tbody></table>
      </div>
    </div>`;
  }

  function buildLeaves(book) {
    const p = book.pages;
    leaves = [
      { i: 0, front: titlePlate(book), back: epigraphPlate(book) },
      { i: 1, front: textPlate("Chapter One", p[0]), back: textPlate("", p[1]) },
      { i: 2, front: textPlate("", p[2]), back: textPlate("", p[3]) },
      { i: 3, front: endPlate(), back: dueCardPlate(book) }
    ];

    rightCol.innerHTML = leaves.map(l => leafHtml(book, l)).join("");
    leftCol.innerHTML = exLibrisPlate();
    // duplicate a static plate under the right stack for the "fully read" end state
    rightCol.insertAdjacentHTML("afterbegin", `<div class="static-plate" style="z-index:-1"></div>`);

    pageIndex = 0;
    layoutLeaves();
    fillDueCard(book);
  }

  function fillDueCard(book) {
    const rows = root.querySelector("#bmDueRows");
    if (!rows) return;
    const loans = Store.loansFor(book.id);
    let html = "";
    for (let r = 0; r < 4; r++) {
      const loan = loans[r];
      if (loan) {
        html += `<tr><td class="stamped">${Store.formatDate(loan.dueAt)}</td><td class="stamped">${loan.borrowerName}</td></tr>`;
      } else {
        html += `<tr><td>&nbsp;</td><td>&nbsp;</td></tr>`;
      }
    }
    rows.innerHTML = html;
  }

  function layoutLeaves() {
    const total = leaves.length;
    root.querySelectorAll(".leaf").forEach(el => {
      const i = Number(el.dataset.leaf);
      const flipped = i < pageIndex;
      el.classList.toggle("flipped", flipped);
      el.style.zIndex = flipped ? i + 1 : total - i;
    });
    const pageTotal = total * 2;
    const pageNow = Math.min(pageIndex * 2, pageTotal);
    indicatorEl.textContent = `Page ${pageNow} of ${pageTotal}`;
    prevBtn.disabled = pageIndex === 0;
    nextBtn.disabled = pageIndex === total;
  }

  function turn(dir) {
    const total = leaves.length;
    const next = pageIndex + dir;
    if (next < 0 || next > total) return;
    pageIndex = next;
    layoutLeaves();
    Sound.pageTurn();
  }

  function openBookAnimation() {
    closedView.classList.add("opening");
    root.querySelector("#bmHint").style.opacity = "0";
    Sound.open();
    setTimeout(() => {
      closedView.style.display = "none";
      readerView.classList.add("show");
    }, 480);
  }

  function resetToClosed() {
    readerView.classList.remove("show");
    closedView.style.display = "flex";
    closedView.classList.remove("opening");
    root.querySelector("#bmHint").style.opacity = "1";
    pageIndex = 0;
    layoutLeaves();
    Sound.close();
  }

  function renderPanel(book) {
    const avail = Store.availableCopies(book);
    const activeLoan = Store.activeLoanFor(book.id);
    panelInfo.style.setProperty("--accent", genreColor(book.genre));

    panelInfo.innerHTML = `
      <div class="genre-tag">${book.genre} &middot; ${book.year}</div>
      <h2>${book.title}</h2>
      <div class="by">by ${book.author}</div>
      <p class="blurb">${book.blurb}</p>
      <div class="meta-row">
        <div class="meta-item"><div class="k">Call number</div><div class="v">${book.call}</div></div>
        <div class="meta-item"><div class="k">Copies</div><div class="v">${book.copies}</div></div>
        <div class="meta-item"><div class="k">Loan period</div><div class="v">${LOAN_DAYS} days</div></div>
      </div>
      <div class="card-widget" id="bmCardWidget"></div>
    `;

    const widget = root.querySelector("#bmCardWidget");

    if (activeLoan) {
      const days = Store.daysUntilDue(activeLoan);
      widget.innerHTML = `
        <div class="cw-head">
          <div class="cw-title">Your library card</div>
        </div>
        <div class="loan-status">
          <div class="ls-text">Checked out to <strong>${activeLoan.borrowerName}</strong><br>
            Due <span class="ls-due">${Store.formatDate(activeLoan.dueAt)}</span>
            ${days < 0 ? ` &middot; <span style="color:#b91c1c;font-weight:600">${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue</span>` : ""}
            ${activeLoan.renewals ? ` &middot; Renewed ${activeLoan.renewals}x` : ""}
          </div>
        </div>
        <div class="row" style="margin-top:14px;display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" id="bmRenewBtn">Renew (+14 days)</button>
          <button class="btn btn-clay btn-sm" id="bmReturnBtn">Return this book</button>
        </div>
      `;

      widget.querySelector("#bmRenewBtn").addEventListener("click", () => {
        const renewed = Store.renewLoan(activeLoan.id, 14);
        if (renewed) {
          Sound.stamp();
          Toast.show(`Loan extended! New due date is ${Store.formatDate(renewed.dueAt)}.`);
          renderPanel(book);
          fillDueCard(book);
        }
      });

      widget.querySelector("#bmReturnBtn").addEventListener("click", () => {
        Store.returnLoan(activeLoan.id);
        Sound.success();
        window.dispatchEvent(new CustomEvent("reading-room:loans-changed"));
        Toast.show(`Returned "${book.title}". Added to your Reading History.`);
        renderPanel(book);
        fillDueCard(book);
      });
    } else if (avail > 0) {
      widget.innerHTML = `
        <div class="cw-head">
          <div class="cw-title">Borrow this book</div>
          <div class="cw-avail"><span class="dot"></span>${avail} of ${book.copies} available</div>
        </div>
        <div class="name-field" id="bmNameField">
          <label for="bmNameInput">Your name, for the card</label>
          <input id="bmNameInput" type="text" placeholder="e.g. Amara Osei" autocomplete="off">
          <div class="field-error">Please write your name so we know who has it.</div>
        </div>
        <button class="btn btn-primary" id="bmBorrowBtn" style="width:100%" disabled>Stamp card &amp; borrow</button>
        <div class="cw-note">Due back in ${LOAN_DAYS} days. No account needed, just your name on the card.</div>
        <div class="stamp-burst" id="bmStamp">DUE<br>${new Date(Date.now() + LOAN_DAYS * 86400000).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</div>
      `;
      const input = widget.querySelector("#bmNameInput");
      const field = widget.querySelector("#bmNameField");
      const borrowBtn = widget.querySelector("#bmBorrowBtn");

      // Constraint over error message: the button simply isn't pressable
      // until there is a name to put on the card.
      const syncBorrowState = () => { borrowBtn.disabled = input.value.trim().length === 0; };
      input.addEventListener("input", () => { field.classList.remove("error"); syncBorrowState(); });
      syncBorrowState();

      borrowBtn.addEventListener("click", () => {
        const name = input.value.trim();
        if (!name) { // safety net only, the disabled state should prevent this
          field.classList.add("error");
          input.focus();
          return;
        }
        field.classList.remove("error");

        // Lock immediately so a fast double-click can't create two loans
        borrowBtn.disabled = true;
        input.disabled = true;

        const loan = Store.borrow(book, name);
        if (!loan) {
          Toast.show("Sorry, the last copy was just taken.");
          renderPanel(book);
          return;
        }
        const stamp = widget.querySelector("#bmStamp");
        stamp.classList.add("go");
        Sound.stamp();
        Confetti.burst(borrowBtn, 26);
        window.dispatchEvent(new CustomEvent("reading-room:loans-changed"));
        setTimeout(() => {
          Toast.show(`"${book.title}" is yours until ${Store.formatDate(loan.dueAt)}.`);
          renderPanel(book);
          fillDueCard(book);
        }, 650);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !borrowBtn.disabled) borrowBtn.click();
      });
    } else {
      // Out of stock -> Waitlist / Reservation affordance (Eliminating dead ends)
      const waitCount = Store.waitlistCountFor(book.id);
      widget.innerHTML = `
        <div class="cw-head">
          <div class="cw-title">Join the waitlist</div>
          <div class="cw-avail out"><span class="dot"></span>All ${book.copies} copies checked out</div>
        </div>
        <div class="cw-note" style="margin-bottom:12px">Every copy is currently with another reader. Leave your name to reserve the next returned copy.</div>
        <div class="name-field" id="bmWaitlistField">
          <label for="bmWaitlistInput">Your name, for reservation</label>
          <input id="bmWaitlistInput" type="text" placeholder="e.g. Liam Tanaka" autocomplete="off">
        </div>
        <button class="btn btn-outline" id="bmWaitlistBtn" style="width:100%" disabled>Reserve next available copy</button>
        <div style="margin-top:10px;font-size:0.8rem;color:var(--ink-muted);text-align:center">
          ${waitCount > 0 ? `${waitCount} person${waitCount === 1 ? "" : "s"} currently in line` : "Be the first in line for this title"}
        </div>
      `;
      const waitInput = widget.querySelector("#bmWaitlistInput");
      const waitBtn = widget.querySelector("#bmWaitlistBtn");

      waitInput.addEventListener("input", () => {
        waitBtn.disabled = waitInput.value.trim().length === 0;
      });

      waitBtn.addEventListener("click", () => {
        const name = waitInput.value.trim();
        if (!name) return;
        Store.joinWaitlist(book.id, name);
        Sound.stamp();
        Toast.show(`Reserved! We will hold the next copy of "${book.title}" for ${name}.`);
        renderPanel(book);
      });
    }
  }

  function open(bookId) {
    if (!root) build();
    const book = getBook(bookId);
    if (!book) return;
    currentBook = book;

    root.querySelector("#bmCoverTitle").textContent = book.title;
    root.querySelector("#bmCoverAuthor").textContent = book.author.toUpperCase();
    root.querySelector("#bmEmblem").innerHTML = EMBLEMS[book.emblem] || "";
    root.querySelector("#bmCoverArt").innerHTML = renderCoverArt(book.id);
    root.querySelector("#bmCover .front-face").style.background = book.cover;
    root.querySelector(".spine-edge") && (root.querySelector(".spine-edge").style.background = `linear-gradient(90deg, rgba(0,0,0,.45), rgba(0,0,0,.05))`);

    resetToClosed();
    buildLeaves(book);
    renderPanel(book);

    root.classList.add("show");
    document.body.classList.add("modal-open");
  }

  function close() {
    if (!root) return;
    root.classList.remove("show");
    document.body.classList.remove("modal-open");
  }

  return { open, close };
})();
