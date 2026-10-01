/* ============================================================
   The Reading Room: genre color coding
   Each genre gets its own accent hue, used on filter chips and
   as each card's glow/accent color.
   ============================================================ */

const GENRE_COLORS = {
  "Mystery": "#3E6FD9",
  "Science Fiction": "#7C4DFF",
  "Romance": "#FF5D8F",
  "Fantasy": "#22B573",
  "Classic Literature": "#C97A2B",
  "Poetry": "#9C6ADE",
  "Philosophy": "#5C7A99",
  "Adventure": "#FF8A3D",
  "Horror": "#C0392B",
  "Non-Fiction": "#10B981",
  "Fiction": "#4F46E5"
};

function genreColor(genre) {
  return GENRE_COLORS[genre] || "#6C3CE9";
}
