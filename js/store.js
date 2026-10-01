/* ============================================================
   The Reading Room: loan ledger & management store
   All state lives in localStorage so it persists across catalog,
   shelf, and librarian desk pages without any backend.
   ============================================================ */

const LOAN_KEY = "reading-room:loans";
const HISTORY_KEY = "reading-room:history";
const CUSTOM_BOOKS_KEY = "reading-room:custom-books";
const COPIES_OVERRIDE_KEY = "reading-room:copies-override";
const WAITLIST_KEY = "reading-room:waitlist";
const LOAN_DAYS = 14;

function readJson(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Could not read ${key}`, e);
    return fallback;
  }
}

function writeJson(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Could not write ${key}`, e);
  }
}

const Store = {
  /** Return all books: default catalog + custom librarian additions + copy overrides */
  getAllBooks() {
    const baseBooks = (typeof BOOKS !== "undefined" ? BOOKS : []);
    const custom = readJson(CUSTOM_BOOKS_KEY, []);
    const overrides = readJson(COPIES_OVERRIDE_KEY, {});

    // Combine base and custom books
    const combined = [...baseBooks, ...custom];

    // Apply any physical copy overrides
    return combined.map(b => {
      const copyCount = overrides[b.id] !== undefined ? overrides[b.id] : b.copies;
      return { ...b, copies: Math.max(1, copyCount) };
    });
  },

  /** Find a book by id across the entire catalog */
  getBook(id) {
    return this.getAllBooks().find(b => b.id === id) || null;
  },

  /** Add a brand new book to the library catalog */
  addBook(data) {
    const custom = readJson(CUSTOM_BOOKS_KEY, []);
    const id = data.id || `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    
    // Default gradient palette
    const palette = [
      "linear-gradient(155deg,#2e4053 0%,#1b2631 60%,#11171d 100%)",
      "linear-gradient(155deg,#5b2c6f 0%,#3b1c47 60%,#200f27 100%)",
      "linear-gradient(155deg,#196f3d 0%,#114b29 60%,#082715 100%)",
      "linear-gradient(155deg,#784212 0%,#4e2a0b 60%,#2a1606 100%)",
      "linear-gradient(155deg,#641e16 0%,#43130d 60%,#240906 100%)"
    ];
    const cover = data.cover || palette[Math.floor(Math.random() * palette.length)];

    const newBook = {
      id,
      title: data.title.trim(),
      author: data.author.trim(),
      genre: data.genre || "Fiction",
      year: Number(data.year) || new Date().getFullYear(),
      blurb: data.blurb ? data.blurb.trim() : "Catalog entry newly acquired by The Reading Room.",
      call: data.call ? data.call.trim() : `LIB ${Math.floor(100 + Math.random() * 800)} ${data.author.slice(0, 3).toUpperCase()}`,
      copies: Math.max(1, Number(data.copies) || 2),
      spine: data.spine || "#2b3e50",
      cover,
      emblem: data.emblem || "leaf",
      epigraph: data.epigraph ? data.epigraph.trim() : "Every page turned is a thought shared.",
      pages: Array.isArray(data.pages) && data.pages.length === 4
        ? data.pages
        : [
            data.chapter1 || `The acquisition notes for ${data.title} are freshly penned into the ledger. A quiet excitement settles over the shelves.`,
            `Readers have long sought stories of this kind. In the stillness of the library, the pages open with a faint fragrance of binding glue and paper.`,
            `Every volume here has its own temperament, shaped by the hands that hold it and the afternoons given over to its sentences.`,
            `The story continues for those who take it home. Sign your name on the card to borrow this edition for the coming fortnight.`
          ]
    };

    custom.push(newBook);
    writeJson(CUSTOM_BOOKS_KEY, custom);
    window.dispatchEvent(new CustomEvent("reading-room:catalog-changed"));
    window.dispatchEvent(new CustomEvent("reading-room:loans-changed"));
    return newBook;
  },

  /** Restock or adjust copies of a book */
  updateCopies(bookId, delta) {
    const overrides = readJson(COPIES_OVERRIDE_KEY, {});
    const book = this.getBook(bookId);
    if (!book) return;
    const current = overrides[bookId] !== undefined ? overrides[bookId] : book.copies;
    const next = Math.max(1, current + delta);
    overrides[bookId] = next;
    writeJson(COPIES_OVERRIDE_KEY, overrides);
    window.dispatchEvent(new CustomEvent("reading-room:catalog-changed"));
    window.dispatchEvent(new CustomEvent("reading-room:loans-changed"));
    return next;
  },

  /** All active loans */
  getLoans() {
    return readJson(LOAN_KEY, []);
  },

  /** Loans for a particular book id */
  loansFor(bookId) {
    return this.getLoans().filter(l => l.bookId === bookId);
  },

  /** How many copies of a book are currently on the shelf */
  availableCopies(book) {
    const bookObj = typeof book === "string" ? this.getBook(book) : book;
    if (!bookObj) return 0;
    const out = this.getLoans().filter(l => l.bookId === bookObj.id).length;
    return Math.max(0, bookObj.copies - out);
  },

  /** Has this browser already borrowed this title? Returns loan or null */
  activeLoanFor(bookId) {
    return this.getLoans().find(l => l.bookId === bookId) || null;
  },

  /** Borrow a copy */
  borrow(book, borrowerName) {
    const loans = this.getLoans();
    const bookObj = typeof book === "string" ? this.getBook(book) : book;
    if (!bookObj) return null;

    const out = loans.filter(l => l.bookId === bookObj.id).length;
    if (out >= bookObj.copies) return null;

    const now = new Date();
    const due = new Date(now.getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000);

    const loan = {
      id: `${bookObj.id}-${now.getTime()}`,
      bookId: bookObj.id,
      borrowerName: borrowerName.trim(),
      borrowedAt: now.toISOString(),
      dueAt: due.toISOString(),
      renewals: 0
    };

    loans.push(loan);
    writeJson(LOAN_KEY, loans);

    // If this borrower was on the waitlist for this book, remove them
    this.removeWaitlistByBookAndName(bookObj.id, borrowerName);

    window.dispatchEvent(new CustomEvent("reading-room:loans-changed"));
    return loan;
  },

  /** Renew an active loan (+14 days) */
  renewLoan(loanId, extraDays = 14) {
    const loans = this.getLoans();
    const idx = loans.findIndex(l => l.id === loanId);
    if (idx === -1) return null;

    const loan = loans[idx];
    const currentDue = new Date(loan.dueAt).getTime();
    const newDue = new Date(currentDue + extraDays * 24 * 60 * 60 * 1000);

    loan.dueAt = newDue.toISOString();
    loan.renewals = (loan.renewals || 0) + 1;
    writeJson(LOAN_KEY, loans);

    window.dispatchEvent(new CustomEvent("reading-room:loans-changed"));
    return loan;
  },

  /** Return a loan: removes from active loans and logs into Reading History */
  returnLoan(loanId) {
    const loans = this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return null;

    // Remove from active loans
    const remaining = loans.filter(l => l.id !== loanId);
    writeJson(LOAN_KEY, remaining);

    // Save into history
    const history = readJson(HISTORY_KEY, []);
    const historyEntry = {
      id: `hist-${loan.id}`,
      bookId: loan.bookId,
      borrowerName: loan.borrowerName,
      borrowedAt: loan.borrowedAt,
      returnedAt: new Date().toISOString(),
      rating: 0,
      notes: ""
    };
    history.unshift(historyEntry); // newest first
    writeJson(HISTORY_KEY, history);

    window.dispatchEvent(new CustomEvent("reading-room:loans-changed"));
    window.dispatchEvent(new CustomEvent("reading-room:history-changed"));
    return historyEntry;
  },

  /** All reading history */
  getHistory() {
    return readJson(HISTORY_KEY, []);
  },

  /** Update user rating for a returned book (1-5 stars) */
  setHistoryRating(historyId, rating) {
    const history = this.getHistory();
    const entry = history.find(h => h.id === historyId);
    if (entry) {
      entry.rating = Math.max(1, Math.min(5, Number(rating)));
      writeJson(HISTORY_KEY, history);
      window.dispatchEvent(new CustomEvent("reading-room:history-changed"));
    }
  },

  /** Waitlist / Reservation management */
  getWaitlist() {
    return readJson(WAITLIST_KEY, []);
  },

  joinWaitlist(bookId, borrowerName) {
    const waitlist = this.getWaitlist();
    const name = borrowerName.trim();
    if (!name) return null;

    // Check if already in waitlist
    const existing = waitlist.find(w => w.bookId === bookId && w.borrowerName.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const entry = {
      id: `wait-${bookId}-${Date.now()}`,
      bookId,
      borrowerName: name,
      joinedAt: new Date().toISOString()
    };
    waitlist.push(entry);
    writeJson(WAITLIST_KEY, waitlist);
    window.dispatchEvent(new CustomEvent("reading-room:waitlist-changed"));
    return entry;
  },

  removeWaitlistByBookAndName(bookId, borrowerName) {
    const waitlist = this.getWaitlist();
    const filtered = waitlist.filter(w => !(w.bookId === bookId && w.borrowerName.toLowerCase() === borrowerName.trim().toLowerCase()));
    writeJson(WAITLIST_KEY, filtered);
    window.dispatchEvent(new CustomEvent("reading-room:waitlist-changed"));
  },

  waitlistCountFor(bookId) {
    return this.getWaitlist().filter(w => w.bookId === bookId).length;
  },

  /** Days remaining until due (negative = overdue) */
  daysUntilDue(loan) {
    const due = new Date(loan.dueAt).getTime();
    const now = Date.now();
    return Math.ceil((due - now) / (24 * 60 * 60 * 1000));
  },

  formatDate(iso) {
    if (!iso) return ", ";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  },

  formatDateTime(iso) {
    if (!iso) return ", ";
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
  },

  /** Generate and trigger download of circulation CSV report */
  downloadCirculationCSV() {
    const loans = this.getLoans();
    const history = this.getHistory();
    const books = this.getAllBooks();

    let csv = "THE READING ROOM · CIRCULATION & INVENTORY REPORT\r\n";
    csv += `Generated at: ${new Date().toLocaleString()}\r\n\r\n`;

    // Section 1: Active Loans
    csv += "--- ACTIVE LOANS ---\r\n";
    csv += "Loan ID,Book Title,Call Number,Borrower Name,Borrowed Date,Due Date,Days Remaining,Status,Renewals\r\n";
    for (const loan of loans) {
      const b = this.getBook(loan.bookId);
      const title = b ? `"${b.title.replace(/"/g, '""')}"` : "Unknown";
      const call = b ? `"${b.call}"` : ", ";
      const borrower = `"${loan.borrowerName.replace(/"/g, '""')}"`;
      const days = this.daysUntilDue(loan);
      const status = days < 0 ? "OVERDUE" : (days <= 3 ? "DUE SOON" : "ACTIVE");
      csv += `${loan.id},${title},${call},${borrower},${this.formatDate(loan.borrowedAt)},${this.formatDate(loan.dueAt)},${days},${status},${loan.renewals || 0}\r\n`;
    }

    csv += "\r\n--- RETURNED LOANS (HISTORY) ---\r\n";
    csv += "History ID,Book Title,Borrower Name,Borrowed Date,Returned Date,Rating (1-5)\r\n";
    for (const h of history) {
      const b = this.getBook(h.bookId);
      const title = b ? `"${b.title.replace(/"/g, '""')}"` : "Unknown";
      const borrower = `"${h.borrowerName.replace(/"/g, '""')}"`;
      csv += `${h.id},${title},${borrower},${this.formatDate(h.borrowedAt)},${this.formatDate(h.returnedAt)},${h.rating || "Not rated"}\r\n`;
    }

    csv += "\r\n--- CATALOG & INVENTORY ---\r\n";
    csv += "Book ID,Title,Author,Genre,Year,Call Number,Total Copies,Available Copies\r\n";
    for (const b of books) {
      const title = `"${b.title.replace(/"/g, '""')}"`;
      const author = `"${b.author.replace(/"/g, '""')}"`;
      const avail = this.availableCopies(b);
      csv += `${b.id},${title},${author},"${b.genre}",${b.year},"${b.call}",${b.copies},${avail}\r\n`;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reading-room-circulation-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Global polyfill for getBook if called from older scripts
function getBook(id) {
  return Store.getBook(id);
}
