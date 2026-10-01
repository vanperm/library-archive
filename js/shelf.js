/* ============================================================
   The Reading Room: my shelf page & reading history
   ============================================================ */

(function () {
  const activeList = document.getElementById("loanList");
  const historyList = document.getElementById("historyList");
  const metaEl = document.getElementById("shelfPageMeta");
  const tabActive = document.getElementById("tabActiveLoans");
  const tabHistory = document.getElementById("tabReadingHistory");
  const badgeActive = document.getElementById("badgeActiveCount");
  const badgeHistory = document.getElementById("badgeHistoryCount");

  let currentTab = "active";
  let lastCount = null;

  function dueTag(loan) {
    const days = Store.daysUntilDue(loan);
    let cls = "";
    let label = `Due in ${days} day${days === 1 ? "" : "s"}`;
    if (days < 0) { cls = "over"; label = `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`; }
    else if (days <= 3) { cls = "soon"; }
    return `<span class="due-tag ${cls}">${label} &middot; ${Store.formatDate(loan.dueAt)}</span>`;
  }

  function cardHtml(loan, book) {
    if (!book) return "";
    const accent = genreColor(book.genre);
    const renewedTag = loan.renewals ? `<span class="borrower-tag" style="background:#e0e7ff;color:#3730a3">Renewed ${loan.renewals}x</span>` : "";

    return `
      <div class="loan-card" data-loan="${loan.id}" style="--accent:${accent}">
        <div class="loan-cover" style="background:${book.cover}">
          ${renderCoverArt(book.id, "small")}
          <span>${book.title}</span>
        </div>
        <div class="loan-body">
          <h3>${book.title}</h3>
          <div class="author">${book.author} &middot; <span style="font-family:var(--mono);font-size:0.8rem">${book.call}</span></div>
          <div class="loan-tags">
            ${dueTag(loan)}
            <span class="borrower-tag">borrowed by ${loan.borrowerName}</span>
            ${renewedTag}
          </div>
        </div>
        <div class="loan-actions" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" data-preview="${book.id}">Preview</button>
          <button class="btn btn-secondary btn-sm" data-renew="${loan.id}" title="Extend due date by 14 days">Renew (+14d)</button>
          <button class="btn btn-clay btn-sm" data-return="${loan.id}">Return</button>
        </div>
      </div>
    `;
  }

  function renderStars(historyId, currentRating) {
    let html = '<div class="star-rating" role="radiogroup" aria-label="Rating">';
    for (let s = 1; s <= 5; s++) {
      const filled = s <= currentRating ? " filled" : "";
      html += `<span class="star${filled}" data-history="${historyId}" data-star="${s}" role="button" aria-label="${s} star">&#9733;</span>`;
    }
    html += '</div>';
    return html;
  }

  function historyCardHtml(entry, book) {
    if (!book) return "";
    const accent = genreColor(book.genre);

    return `
      <div class="loan-card" data-history="${entry.id}" style="--accent:${accent}">
        <div class="loan-cover" style="background:${book.cover}">
          ${renderCoverArt(book.id, "small")}
          <span>${book.title}</span>
        </div>
        <div class="loan-body">
          <h3>${book.title}</h3>
          <div class="author">${book.author} &middot; <span style="font-family:var(--mono);font-size:0.8rem">${book.call}</span></div>
          <div class="loan-tags" style="margin-bottom:8px">
            <span class="due-tag" style="background:#f1f5f9;color:#475569">Returned &middot; ${Store.formatDate(entry.returnedAt)}</span>
            <span class="borrower-tag">reader: ${entry.borrowerName}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:0.85rem">
            <span style="color:var(--ink-muted)">Your rating:</span>
            ${renderStars(entry.id, entry.rating || 0)}
          </div>
        </div>
        <div class="loan-actions">
          <button class="btn btn-outline btn-sm" data-preview="${book.id}">Preview Again</button>
        </div>
      </div>
    `;
  }

  function render() {
    const loans = Store.getLoans().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
    const history = Store.getHistory();

    if (badgeActive) badgeActive.textContent = loans.length;
    if (badgeHistory) badgeHistory.textContent = history.length;

    // Header meta text
    if (currentTab === "active") {
      if (loans.length) {
        metaEl.innerHTML = `<span class="stat-num" id="statNum2">${lastCount === null ? loans.length : lastCount}</span> book${loans.length === 1 ? "" : "s"} currently on loan to you`;
        animateCount(document.getElementById("statNum2"), loans.length, 450);
      } else {
        metaEl.textContent = "No active loans right now";
      }
      lastCount = loans.length;

      if (!loans.length) {
        activeList.innerHTML = `
          <div class="empty-state">
            <strong>Your shelf is empty</strong>
            <p>Borrow a book from the catalog and it will show up here with its due date.</p>
            <a href="index.html" class="btn btn-primary btn-sm" style="margin-top:14px;display:inline-block">Browse Catalog</a>
          </div>
        `;
      } else {
        activeList.innerHTML = loans.map(loan => cardHtml(loan, Store.getBook(loan.bookId))).join("");
      }
    } else {
      metaEl.innerHTML = `<span>${history.length} book${history.length === 1 ? "" : "s"} in your completed reading log</span>`;

      if (!history.length) {
        historyList.innerHTML = `
          <div class="empty-state">
            <strong>No reading history yet</strong>
            <p>Books returned from your shelf will be automatically preserved here so you can review and rate them.</p>
          </div>
        `;
      } else {
        historyList.innerHTML = history.map(entry => historyCardHtml(entry, Store.getBook(entry.bookId))).join("");
      }
    }

    // Attach Active Loan Actions
    activeList.querySelectorAll("[data-return]").forEach(btn => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".loan-card");
        const loanId = btn.dataset.return;
        const loan = Store.getLoans().find(l => l.id === loanId);
        const book = loan ? Store.getBook(loan.bookId) : null;
        Confetti.burst(btn, 16);
        card.classList.add("leaving");
        Sound.success();
        setTimeout(() => {
          Store.returnLoan(loanId);
          if (book) Toast.show(`Returned "${book.title}". Added to Reading History.`);
          render();
        }, 280);
      });
    });

    activeList.querySelectorAll("[data-renew]").forEach(btn => {
      btn.addEventListener("click", () => {
        const loanId = btn.dataset.renew;
        const renewed = Store.renewLoan(loanId, 14);
        if (renewed) {
          Sound.stamp();
          Toast.show(`Loan renewed! New due date is ${Store.formatDate(renewed.dueAt)}.`);
          render();
        }
      });
    });

    activeList.querySelectorAll("[data-preview]").forEach(btn => {
      btn.addEventListener("click", () => {
        Sound.click();
        BookModal.open(btn.dataset.preview);
      });
    });

    // Attach History Actions
    historyList.querySelectorAll(".star").forEach(starEl => {
      starEl.addEventListener("click", () => {
        const historyId = starEl.dataset.history;
        const star = Number(starEl.dataset.star);
        Store.setHistoryRating(historyId, star);
        Sound.click();
        Toast.show(`Rating updated: ${star} star${star === 1 ? "" : "s"}!`);
        render();
      });
    });

    historyList.querySelectorAll("[data-preview]").forEach(btn => {
      btn.addEventListener("click", () => {
        Sound.click();
        BookModal.open(btn.dataset.preview);
      });
    });

    activeList.querySelectorAll(".loan-card").forEach((card, idx) => {
      card.addEventListener("mouseenter", () => Sound.bookHover(idx));
    });
    historyList.querySelectorAll(".loan-card").forEach((card, idx) => {
      card.addEventListener("mouseenter", () => Sound.bookHover(idx));
    });
  }

  // Tab switching
  if (tabActive && tabHistory) {
    tabActive.addEventListener("click", () => {
      currentTab = "active";
      tabActive.classList.add("active");
      tabActive.setAttribute("aria-selected", "true");
      tabHistory.classList.remove("active");
      tabHistory.setAttribute("aria-selected", "false");
      activeList.hidden = false;
      historyList.hidden = true;
      Sound.click();
      render();
    });

    tabHistory.addEventListener("click", () => {
      currentTab = "history";
      tabHistory.classList.add("active");
      tabHistory.setAttribute("aria-selected", "true");
      tabActive.classList.remove("active");
      tabActive.setAttribute("aria-selected", "false");
      activeList.hidden = true;
      historyList.hidden = false;
      Sound.click();
      render();
    });
  }

  window.addEventListener("reading-room:loans-changed", render);
  window.addEventListener("reading-room:history-changed", render);
  render();
})();
