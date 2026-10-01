/* ============================================================
   The Reading Room: cover illustrations
   Small original line-art scenes per title, drawn directly in
   SVG so covers never depend on an external image loading.
   ============================================================ */

const COVER_ART = {
  "glass-orchard": `
    <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <line x1="20" y1="200" x2="180" y2="200"/>
      <path d="M55 200 L55 140"/>
      <circle cx="55" cy="105" r="34"/>
      <path d="M120 200 L120 120"/>
      <circle cx="120" cy="80" r="42"/>
      <path d="M165 200 L165 150"/>
      <circle cx="165" cy="118" r="28"/>
      <g stroke-width="2">
        <rect x="40" y="205" width="14" height="18" rx="2"/>
        <rect x="70" y="208" width="12" height="15" rx="2"/>
        <rect x="100" y="204" width="14" height="19" rx="2"/>
        <rect x="140" y="207" width="12" height="16" rx="2"/>
      </g>
    </g>`,

  "long-orbit": `
    <g fill="none" stroke="currentColor" stroke-width="2">
      <ellipse cx="100" cy="140" rx="82" ry="30"/>
      <ellipse cx="100" cy="140" rx="30" ry="82" transform="rotate(35 100 140)"/>
      <circle cx="100" cy="140" r="14" fill="currentColor" stroke="none"/>
      <g fill="currentColor" stroke="none">
        <circle cx="40" cy="50" r="2"/>
        <circle cx="160" cy="60" r="1.6"/>
        <circle cx="30" cy="210" r="1.8"/>
        <circle cx="175" cy="200" r="2"/>
        <circle cx="150" cy="40" r="1.4"/>
        <circle cx="60" cy="225" r="1.6"/>
      </g>
    </g>`,

  "letters-marguerite": `
    <g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <rect x="35" y="150" width="90" height="60" rx="3"/>
      <path d="M35 150 L80 188 L125 150"/>
      <g transform="translate(148,95)">
        <path d="M0 -28 C10 -18 10 -4 0 6 C-10 -4 -10 -18 0 -28Z"/>
        <path d="M0 -28 C10 -18 10 -4 0 6 C-10 -4 -10 -18 0 -28Z" transform="rotate(72)"/>
        <path d="M0 -28 C10 -18 10 -4 0 6 C-10 -4 -10 -18 0 -28Z" transform="rotate(144)"/>
        <path d="M0 -28 C10 -18 10 -4 0 6 C-10 -4 -10 -18 0 -28Z" transform="rotate(216)"/>
        <path d="M0 -28 C10 -18 10 -4 0 6 C-10 -4 -10 -18 0 -28Z" transform="rotate(288)"/>
        <circle cx="0" cy="0" r="5" fill="currentColor" stroke="none"/>
      </g>
    </g>`,

  "cartographers-daughter": `
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="110" r="55"/>
      <path d="M100 55 L100 165 M45 110 L155 110"/>
      <path d="M100 78 L112 110 L100 142 L88 110 Z" fill="currentColor" stroke="none" opacity=".9"/>
      <path d="M30 220 Q70 190 100 220 T170 220" stroke-width="2"/>
      <path d="M55 205 L70 180 L85 205 Z"/>
      <path d="M110 210 L128 178 L146 210 Z"/>
    </g>`,

  "hollow-bell-winter": `
    <g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M75 150 C75 100 125 100 125 150 L135 180 L65 180 Z"/>
      <rect x="92" y="182" width="16" height="10" rx="2"/>
      <circle cx="100" cy="196" r="6" fill="currentColor" stroke="none"/>
      <g stroke-width="1.6" fill="currentColor" stroke="none" opacity=".85">
        <circle cx="40" cy="60" r="2"/><circle cx="160" cy="75" r="1.6"/>
        <circle cx="55" cy="220" r="1.8"/><circle cx="150" cy="215" r="2"/>
        <circle cx="30" cy="130" r="1.5"/><circle cx="175" cy="140" r="1.7"/>
      </g>
    </g>`,

  "sonnets-rented-room": `
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="45" y="55" width="110" height="130" rx="2"/>
      <line x1="100" y1="55" x2="100" y2="185"/>
      <line x1="45" y1="120" x2="155" y2="120"/>
      <path d="M45 55 C35 90 35 150 45 185" stroke-width="1.8"/>
      <path d="M155 55 C165 90 165 150 155 185" stroke-width="1.8"/>
      <path d="M70 205 L80 195 L95 205 L108 193 L120 205" stroke-width="1.8"/>
    </g>`,

  "weight-small-decisions": `
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="100" y1="60" x2="100" y2="190"/>
      <line x1="55" y1="190" x2="145" y2="190"/>
      <line x1="45" y1="90" x2="155" y2="90"/>
      <path d="M45 90 L35 130 A20 12 0 0 0 55 130 Z"/>
      <path d="M155 90 L145 130 A20 12 0 0 0 165 130 Z"/>
      <circle cx="100" cy="70" r="24" stroke-width="1.6" opacity=".7"/>
    </g>`,

  "salt-road": `
    <g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 165 Q55 140 95 165 T175 165"/>
      <path d="M15 195 Q55 172 95 195 T175 195" stroke-width="1.8" opacity=".8"/>
      <path d="M15 225 Q55 204 95 225 T175 225" stroke-width="1.6" opacity=".6"/>
      <path d="M100 60 L107 78 L126 80 L112 92 L116 111 L100 100 L84 111 L88 92 L74 80 L93 78 Z" fill="currentColor" stroke="none" opacity=".9"/>
    </g>`,

  "house-remembers": `
    <g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M45 130 L100 80 L155 130"/>
      <rect x="55" y="130" width="90" height="75"/>
      <path d="M95 205 L95 155 L122 155 L118 205"/>
      <g transform="translate(150,60)" stroke-width="2">
        <circle cx="0" cy="0" r="10"/>
        <line x1="8" y1="7" x2="26" y2="25"/>
        <line x1="20" y1="19" x2="26" y2="13"/>
        <line x1="24" y1="23" x2="30" y2="17"/>
      </g>
    </g>`
,
  "tiny-habits": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="50" y="180" width="100" height="25" rx="3"/><rect x="65" y="150" width="70" height="25" rx="3"/><rect x="80" y="120" width="40" height="25" rx="3"/><circle cx="100" cy="85" r="14" fill="currentColor" stroke="none" opacity=".8"/><path d="M100 45 L100 65"/></g>',
  "currency-calm": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="100" cy="130" r="48"/><circle cx="100" cy="130" r="32" stroke-dasharray="4 6"/><line x1="100" y1="65" x2="100" y2="195"/><line x1="35" y1="130" x2="165" y2="130"/></g>',
  "midnight-branch": '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M50 210 Q100 160 100 90 Q100 160 150 210"/><line x1="100" y1="90" x2="100" y2="210" stroke-width="3"/><circle cx="100" cy="70" r="18"/><line x1="100" y1="70" x2="100" y2="58"/><line x1="100" y1="70" x2="110" y2="70"/></g>',
  "yesterday-again": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="40" y="90" width="120" height="85" rx="8"/><circle cx="75" cy="132" r="12"/><path d="M125 124 L125 140 M117 132 L133 132"/><path d="M60 210 L140 210"/></g>',
  "stolen-manuscript": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M60 70 L140 70 L125 195 L45 195 Z"/><line x1="75" y1="105" x2="125" y2="105"/><line x1="70" y1="135" x2="120" y2="135"/><line x1="65" y1="165" x2="105" y2="165"/><path d="M145 60 L165 40" stroke-width="3"/></g>',
  "salt-dunes": '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 200 Q70 140 120 180 T180 160"/><path d="M40 220 Q100 170 150 210"/><circle cx="140" cy="80" r="28" fill="currentColor" stroke="none" opacity=".85"/><circle cx="65" cy="60" r="14" stroke-width="1.8"/></g>',
  "solar-ward": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="100" cy="120" r="38"/><g stroke-width="2"><line x1="100" y1="65" x2="100" y2="45"/><line x1="100" y1="175" x2="100" y2="195"/><line x1="45" y1="120" x2="25" y2="120"/><line x1="155" y1="120" x2="175" y2="120"/></g></g>',
  "seven-summers": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M30 190 Q65 165 100 190 T170 190"/><path d="M45 215 Q80 190 115 215 T185 215"/><circle cx="100" cy="95" r="30"/><path d="M85 95 L115 95"/></g>',
  "hollow-crest": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M50 170 L100 75 L150 170 Z"/><rect x="70" y="170" width="60" height="50"/><rect x="90" y="185" width="20" height="35"/><circle cx="100" cy="125" r="10"/></g>'

,
  "gilded-terrace": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M40 210 L100 80 L160 210 Z"/><circle cx="100" cy="60" r="16"/><line x1="70" y1="170" x2="130" y2="170"/><line x1="85" y1="130" x2="115" y2="130"/></g>',
  "saltwater-notes": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M40 180 Q100 130 160 180"/><path d="M50 205 Q100 155 150 205"/><circle cx="100" cy="90" r="24"/><path d="M100 50 L100 66"/></g>',
  "river-beyond-ridge": '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M30 190 L85 100 L140 190"/><path d="M110 190 L145 130 L180 190"/><path d="M70 190 Q100 220 130 190 T180 210" stroke-width="2"/></g>',
  "ledger-human-kind": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="100" cy="115" r="42"/><circle cx="100" cy="115" r="26" stroke-dasharray="5 5"/><circle cx="100" cy="115" r="10" fill="currentColor" stroke="none"/><line x1="100" y1="55" x2="100" y2="175"/><line x1="40" y1="115" x2="160" y2="115"/></g>',
  "conversations-in-rain": '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="45" y="80" width="110" height="90" rx="6"/><line x1="100" y1="80" x2="100" y2="170"/><line x1="45" y1="125" x2="155" y2="125"/><path d="M60 210 L140 210 M75 195 L125 195" stroke-dasharray="3 4"/></g>'

};

function renderCoverArt(bookId, extraClass) {
  const art = COVER_ART[bookId];
  if (!art) return "";
  return `<svg class="cover-art-svg${extraClass ? " " + extraClass : ""}" viewBox="0 0 200 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${art}</svg>`;
}
