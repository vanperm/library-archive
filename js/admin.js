/* ============================================================
   The Reading Room: Librarian Desk controller
   ============================================================ */

(function () {
  const statTitles = document.getElementById("statTitles");
  const statCopies = document.getElementById("statCopies");
  const statLoans = document.getElementById("statLoans");
  const statOverdue = document.getElementById("statOverdue");
  const statCardOverdue = document.getElementById("statCardOverdue");

  const circBody = document.getElementById("circulationTableBody");
  const invBody = document.getElementById("inventoryTableBody");

  const btnExportCsv = document.getElementById("btnExportCsv");
  const btnOpenIntake = document.getElementById("btnOpenIntake");
  const btnCancelIntake = document.getElementById("btnCancelIntake");
  const intakeModal = document.getElementById("intakeModal");
  const intakeForm = document.getElementById("intakeForm");

  function renderStats() {
    const books = Store.getAllBooks();
    const loans = Store.getLoans();

    const totalTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + b.copies, 0);
    const activeLoans = loans.length;
    const overdueCount = loans.filter(l => Store.daysUntilDue(l) < 0).length;

    statTitles.textContent = totalTitles;
    statCopies.textContent = totalCopies;
    statLoans.textContent = activeLoans;
    statOverdue.textContent = overdueCount;

    if (overdueCount > 0) {
      statCardOverdue.classList.add("alert");
    } else {
      statCardOverdue.classList.remove("alert");
    }
  }

  function renderCirculation() {
    const loans = Store.getLoans().sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

    if (loans.length === 0) {
      circBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:32px;color:var(--ink-muted)">
            All copies are currently safely on the shelves. No active loans recorded.
          </td>
        </tr>
      `;
      return;
    }

    circBody.innerHTML = loans.map(loan => {
      const book = Store.getBook(loan.bookId);
      const days = Store.daysUntilDue(loan);
      let statusHtml = '<span class="status-pill active">Active</span>';
      if (days < 0) {
        statusHtml = `<span class="status-pill overdue">${Math.abs(days)}d Overdue</span>`;
      } else if (days <= 3) {
        statusHtml = `<span class="status-pill soon">${days}d Left</span>`;
      }

      return `
        <tr data-loan="${loan.id}">
          <td>
            <strong>${book ? book.title : "Unknown Title"}</strong>
            <div style="font-size:0.75rem;color:var(--ink-muted)">${book ? book.author : ", "}</div>
          </td>
          <td><code style="font-family:var(--mono);font-size:0.82rem">${book ? book.call : ", "}</code></td>
          <td><strong>${loan.borrowerName}</strong></td>
          <td>${Store.formatDate(loan.dueAt)}</td>
          <td>${statusHtml}</td>
          <td style="text-align:right">
            <button type="button" class="btn btn-secondary btn-sm" data-admin-renew="${loan.id}">+14d</button>
            <button type="button" class="btn btn-clay btn-sm" data-admin-return="${loan.id}">Return</button>
          </td>
        </tr>
      `;
    }).join("");

    // Wire actions
    circBody.querySelectorAll("[data-admin-return]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.adminReturn;
        const loan = Store.getLoans().find(l => l.id === id);
        const book = loan ? Store.getBook(loan.bookId) : null;
        Store.returnLoan(id);
        Sound.success();
        Confetti.burst(btn, 14);
        Toast.show(`Checked in: "${book ? book.title : "Book"}" returned to inventory.`);
        render();
      });
    });

    circBody.querySelectorAll("[data-admin-renew]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.adminRenew;
        const renewed = Store.renewLoan(id, 14);
        if (renewed) {
          Sound.stamp();
          Toast.show(`Renewed! Due date updated to ${Store.formatDate(renewed.dueAt)}.`);
          render();
        }
      });
    });
  }

  function renderInventory() {
    const books = Store.getAllBooks();

    invBody.innerHTML = books.map(book => {
      const avail = Store.availableCopies(book);
      const isOut = avail === 0;

      return `
        <tr data-book="${book.id}">
          <td>
            <strong>${book.title}</strong>
            <div style="font-size:0.75rem;color:var(--ink-muted)">by ${book.author}</div>
          </td>
          <td>${book.genre} &middot; ${book.year}</td>
          <td><code style="font-family:var(--mono);font-size:0.82rem">${book.call}</code></td>
          <td>
            <div class="stock-stepper">
              <button type="button" class="stock-btn" data-stock-delta="-1" data-book="${book.id}" title="Remove copy">&minus;</button>
              <strong style="min-width:20px;text-align:center">${book.copies}</strong>
              <button type="button" class="stock-btn" data-stock-delta="1" data-book="${book.id}" title="Add copy">&plus;</button>
            </div>
          </td>
          <td>
            <span class="${isOut ? "status-pill overdue" : "status-pill active"}">
              ${isOut ? "All Out" : `${avail} on shelf`}
            </span>
          </td>
          <td style="text-align:right">
            <button type="button" class="btn btn-outline btn-sm" data-preview="${book.id}">Preview 3D</button>
          </td>
        </tr>
      `;
    }).join("");

    invBody.querySelectorAll("[data-stock-delta]").forEach(btn => {
      btn.addEventListener("click", () => {
        const bookId = btn.dataset.book;
        const delta = Number(btn.dataset.stockDelta);
        const next = Store.updateCopies(bookId, delta);
        Sound.click();
        Toast.show(`Stock updated: ${next} copies total.`);
        render();
      });
    });

    invBody.querySelectorAll("[data-preview]").forEach(btn => {
      btn.addEventListener("click", () => {
        Sound.click();
        BookModal.open(btn.dataset.preview);
      });
    });
  }

  function render() {
    renderStats();
    renderCirculation();
    renderInventory();
  }

  // Intake Modal wiring
  if (btnOpenIntake) {
    btnOpenIntake.addEventListener("click", () => {
      intakeModal.removeAttribute("hidden");
      document.getElementById("newTitle").focus();
      Sound.click();
    });
  }

  if (btnCancelIntake) {
    btnCancelIntake.addEventListener("click", () => {
      intakeModal.setAttribute("hidden", "true");
    });
  }

  if (intakeForm) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("newTitle").value.trim();
      const author = document.getElementById("newAuthor").value.trim();
      const genre = document.getElementById("newGenre").value;
      const year = document.getElementById("newYear").value;
      const copies = document.getElementById("newCopies").value;
      const blurb = document.getElementById("newBlurb").value.trim();
      const chapter = document.getElementById("newChapter").value.trim();

      if (!title || !author) {
        Toast.show("Please enter at least Title and Author.");
        return;
      }

      const newBook = Store.addBook({
        title,
        author,
        genre,
        year,
        copies,
        blurb,
        chapter1: chapter
      });

      Sound.stamp();
      Toast.show(`Accessioned "${newBook.title}" into catalog!`);
      intakeForm.reset();
      intakeModal.setAttribute("hidden", "true");
      render();
    });
  }

  // Export CSV
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      Sound.click();
      Store.downloadCirculationCSV();
      Toast.show("Circulation CSV report downloaded.");
    });
  }

  // Close modal on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !intakeModal.hasAttribute("hidden")) {
      intakeModal.setAttribute("hidden", "true");
    }
  });

  window.addEventListener("reading-room:loans-changed", render);
  window.addEventListener("reading-room:catalog-changed", render);

  render();
})();
