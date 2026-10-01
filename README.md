# The Reading Room: a small library system

A UI/UX‑focused midterm project: a library catalog where you can preview any
book as a real, page‑turning 3D book before deciding to borrow it, then sign
a library card with your name to take it home.

There is no backend and no build step. Everything runs from static files,
with all borrowing state kept in the browser's `localStorage` so it persists
between the two pages and across reloads.

## Opening the project

1. Open this folder (`library-system/`) directly in VS Code.
2. Because the pages load fonts and use `localStorage`, don't just double‑click
   `index.html` from the file explorer (`file://` URLs disable storage in some
   browsers). Instead, serve the folder with any static server, for example:
   - VS Code: install the **Live Server** extension, right‑click `index.html`,
     choose "Open with Live Server".
   - Or, with Python installed, run `python3 -m http.server 5500` from this
     folder and open `http://localhost:5500`.
3. Start on `index.html` (the Catalog).

## What to try

- **Browse, search & sort**, search by title/author/genre/year, sort by Title (A-Z), Year, or Availability, and filter with dynamic genre chip counts.
- **Preview a book in 3D**, click any cover. It opens as a closed book you can click to open; once open, turn pages with arrow buttons or keyboard arrow keys.
- **Borrow it & Join waitlist**, from the panel beside the reader, sign your name on the library card. If all copies are checked out, join the waitlist to reserve the next copy!
- **My Shelf & Renewals**, see everything borrowed with live due dates. Click **Renew (+14d)** to extend your loan, or return anytime with sound and celebratory confetti.
- **Reading History & Star Ratings**, returned books move to your permanent reading log where you can review them and award 1–5 star ratings.
- **Librarian Desk (Staff Portal)**, a full operational management system:
  - Live statistics dashboard (Titles, Physical Copies, Active Loans, Overdue Alerts).
  - Active circulation ledger with one-click return and renewal actions.
  - Catalog inventory management with live stock adjusters (`+` / `-`).
  - Accession intake form to add brand-new books directly to the live catalog.
  - One-click export of the complete circulation ledger as a CSV file.
- **Sound**, synthesized page-turn/stamp/return sounds generated via Web Audio API.
- **Reset demo library**, clears demo data and resets all ledgers.

## File structure

```
library-system/
├── index.html            Catalog page (search, sort, genre chips, book grid)
├── shelf.html            "My Shelf" page (active loans, renew, reading history)
├── admin.html            "Librarian Desk" (operations, inventory, intake, CSV export)
├── PRESENTATION_GUIDE.md 10-minute presentation guide & team contribution script
├── css/
│   ├── style.css         Design tokens, layout, nav, catalog grid, shelf, admin
│   └── book3d.css        The 3D book modal: closed book, page-turning reader
├── js/
│   ├── data.js           Book catalog dataset (original titles & page text)
│   ├── store.js          Full storage engine (loans, history, waitlist, custom books, CSV)
│   ├── sound.js          Synthesized WebAudio sound effects
│   ├── toast.js          Accessible toast notifications
│   ├── book3d.js         3D book preview modal & card widget
│   ├── common.js         Shared navigation & sound toggle behavior
│   ├── catalog.js        Catalog page search, sort, and chip filtering wiring
│   ├── shelf.js          Shelf page tabs, renew, and history ratings wiring
│   └── admin.js          Librarian Desk circulation, inventory, and intake wiring
└── README.md
```

## Notes on the content

All book titles, authors, blurbs and page text are original, written for
this project's UI demo, none of it is reproduced from a real book. Cover
art is generated entirely with CSS gradients and small inline icons, so
nothing here depends on external images or fonts you don't already have
(only Google Fonts are loaded remotely, for typography).

## Design notes

The visual language is drawn from the physical objects of a real reading
room rather than generic "app" styling: a ledger‑green nav bar with a brass
rule, index‑card‑style book entries, a due‑date stamp card, and an actual
hinge‑and‑page‑turn animation for the 3D book, built with plain CSS 3D
transforms (`perspective`, `rotateY`, `backface-visibility`), no 3D or
animation libraries.
