// SVG Data URL representation of the FOTOGRAM personal album project from image 2
// Featuring Citycat Records, The Humans band, and CIAN the cat producer

export const FOTOGRAM_IMAGE_DATA_URL = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 640" width="1000" height="640">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b1720"/>
      <stop offset="100%" stop-color="#060c12"/>
    </linearGradient>
    <linearGradient id="purpleStage" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1035"/>
      <stop offset="100%" stop-color="#2d1b4e"/>
    </linearGradient>
    <linearGradient id="blueStage" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c2340"/>
      <stop offset="100%" stop-color="#14375e"/>
    </linearGradient>
    <linearGradient id="goldStage" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a2008"/>
      <stop offset="100%" stop-color="#4a3810"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1000" height="640" fill="url(#bgGrad)" rx="10"/>

  <!-- Top Logo & Brand -->
  <g transform="translate(370, 42)">
    <!-- Flower icon -->
    <circle cx="20" cy="18" r="6" fill="#f59e0b"/>
    <ellipse cx="20" cy="8" rx="4.5" ry="7" fill="#ef4444"/>
    <ellipse cx="29" cy="12" rx="4.5" ry="7" fill="#ec4899" transform="rotate(45 29 12)"/>
    <ellipse cx="30" cy="20" rx="4.5" ry="7" fill="#8b5cf6"/>
    <ellipse cx="27" cy="27" rx="4.5" ry="7" fill="#3b82f6" transform="rotate(45 27 27)"/>
    <ellipse cx="19" cy="28" rx="4.5" ry="7" fill="#10b981"/>
    <ellipse cx="11" cy="25" rx="4.5" ry="7" fill="#84cc16" transform="rotate(-45 11 25)"/>
    <ellipse cx="10" cy="17" rx="4.5" ry="7" fill="#eab308"/>

    <!-- Text FOTOGRAM -->
    <text x="48" y="26" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" letter-spacing="2">FOTOGRAM</text>
  </g>

  <!-- Subtitle -->
  <text x="500" y="125" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700">Your personal foto album</text>

  <!-- 12 Album Cards Grid (2 rows of 6) -->
  <!-- ROW 1 -->
  <!-- Card 1: Vocalist in emerald suit -->
  <g transform="translate(40, 160)">
    <rect width="138" height="180" rx="6" fill="url(#blueStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#0f172a"/>
    <circle cx="69" cy="55" r="18" fill="#10b981"/>
    <rect x="55" y="75" width="28" height="55" rx="4" fill="#047857"/>
    <line x1="69" y1="65" x2="69" y2="135" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="69" cy="55" r="4" fill="#f8fafc"/>
    <text x="69" y="152" text-anchor="middle" fill="#6ee7b7" font-size="10" font-family="sans-serif" font-weight="600">Soul Queen J</text>
  </g>

  <!-- Card 2: Guitarist in dark gold suit -->
  <g transform="translate(196, 160)">
    <rect width="138" height="180" rx="6" fill="url(#purpleStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#1e1b4b"/>
    <circle cx="69" cy="55" r="18" fill="#d97706"/>
    <rect x="52" y="75" width="34" height="55" rx="4" fill="#312e81"/>
    <!-- Guitar neck -->
    <line x1="30" y1="120" x2="95" y2="70" stroke="#fbbf24" stroke-width="4"/>
    <ellipse cx="50" cy="105" rx="14" ry="10" fill="#b45309" transform="rotate(-35 50 105)"/>
    <text x="69" y="152" text-anchor="middle" fill="#fde68a" font-size="10" font-family="sans-serif" font-weight="600">Leo (Guitar)</text>
  </g>

  <!-- Card 3: Bassist Slap Park -->
  <g transform="translate(352, 160)">
    <rect width="138" height="180" rx="6" fill="url(#blueStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#0f172a"/>
    <circle cx="69" cy="55" r="18" fill="#059669"/>
    <rect x="54" y="75" width="30" height="55" rx="4" fill="#065f46"/>
    <!-- Red/white bass guitar -->
    <line x1="35" y1="115" x2="105" y2="65" stroke="#ef4444" stroke-width="4"/>
    <ellipse cx="52" cy="102" rx="15" ry="11" fill="#dc2626" transform="rotate(-35 52 102)"/>
    <text x="69" y="152" text-anchor="middle" fill="#fca5a5" font-size="10" font-family="sans-serif" font-weight="600">Slap Park (Bass)</text>
  </g>

  <!-- Card 4: Red electric guitar on stage -->
  <g transform="translate(508, 160)">
    <rect width="138" height="180" rx="6" fill="url(#purpleStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#18181b"/>
    <circle cx="69" cy="55" r="18" fill="#e11d48"/>
    <rect x="55" y="75" width="28" height="55" rx="4" fill="#881337"/>
    <ellipse cx="69" cy="98" rx="16" ry="11" fill="#f43f5e"/>
    <text x="69" y="152" text-anchor="middle" fill="#fda4af" font-size="10" font-family="sans-serif" font-weight="600">Live Stage Groove</text>
  </g>

  <!-- Card 5: Master K on Keys -->
  <g transform="translate(664, 160)">
    <rect width="138" height="180" rx="6" fill="url(#purpleStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#2e1065"/>
    <circle cx="69" cy="52" r="18" fill="#a855f7"/>
    <rect x="54" y="72" width="30" height="50" rx="4" fill="#581c87"/>
    <!-- Synth keyboard with purple neon glow -->
    <rect x="25" y="98" width="88" height="20" rx="3" fill="#c084fc" stroke="#e9d5ff" stroke-width="1.5"/>
    <line x1="38" y1="98" x2="38" y2="114" stroke="#581c87" stroke-width="2"/>
    <line x1="52" y1="98" x2="52" y2="114" stroke="#581c87" stroke-width="2"/>
    <line x1="66" y1="98" x2="66" y2="114" stroke="#581c87" stroke-width="2"/>
    <line x1="80" y1="98" x2="80" y2="114" stroke="#581c87" stroke-width="2"/>
    <text x="69" y="152" text-anchor="middle" fill="#e9d5ff" font-size="10" font-family="sans-serif" font-weight="600">Master K (Keys)</text>
  </g>

  <!-- Card 6: Elena on Saxophone -->
  <g transform="translate(820, 160)">
    <rect width="138" height="180" rx="6" fill="url(#blueStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#0f172a"/>
    <circle cx="69" cy="55" r="18" fill="#38bdf8"/>
    <rect x="54" y="75" width="30" height="55" rx="4" fill="#0369a1"/>
    <!-- Sax curve -->
    <path d="M 64 65 Q 68 95 80 100 Q 88 104 88 115 A 10 10 0 0 1 68 115" stroke="#f59e0b" stroke-width="4" fill="none"/>
    <text x="69" y="152" text-anchor="middle" fill="#7dd3fc" font-size="10" font-family="sans-serif" font-weight="600">Elena (Sax)</text>
  </g>

  <!-- ROW 2 -->
  <!-- Card 7: Guitarist Tito -->
  <g transform="translate(40, 360)">
    <rect width="138" height="180" rx="6" fill="url(#purpleStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#1e1b4b"/>
    <circle cx="69" cy="55" r="18" fill="#818cf8"/>
    <rect x="54" y="75" width="30" height="55" rx="4" fill="#3730a3"/>
    <line x1="30" y1="120" x2="95" y2="70" stroke="#e0e7ff" stroke-width="4"/>
    <text x="69" y="152" text-anchor="middle" fill="#c7d2fe" font-size="10" font-family="sans-serif" font-weight="600">Tito (Percussion)</text>
  </g>

  <!-- Card 8: Brother G Vocals -->
  <g transform="translate(196, 360)">
    <rect width="138" height="180" rx="6" fill="url(#purpleStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#3b0764"/>
    <circle cx="69" cy="55" r="18" fill="#d8b4fe"/>
    <rect x="54" y="75" width="30" height="55" rx="4" fill="#6b21a8"/>
    <line x1="69" y1="65" x2="69" y2="135" stroke="#ffffff" stroke-width="2"/>
    <text x="69" y="152" text-anchor="middle" fill="#e9d5ff" font-size="10" font-family="sans-serif" font-weight="600">Brother G (Vocals)</text>
  </g>

  <!-- Card 9: Mellow L Vocals -->
  <g transform="translate(352, 360)">
    <rect width="138" height="180" rx="6" fill="url(#goldStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#292524"/>
    <circle cx="69" cy="55" r="18" fill="#fbbf24"/>
    <rect x="54" y="75" width="30" height="55" rx="4" fill="#78350f"/>
    <text x="69" y="152" text-anchor="middle" fill="#fef08a" font-size="10" font-family="sans-serif" font-weight="600">Mellow L (Vocals)</text>
  </g>

  <!-- Card 10: Big Joe behind Drums -->
  <g transform="translate(508, 360)">
    <rect width="138" height="180" rx="6" fill="url(#blueStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#0f172a"/>
    <circle cx="69" cy="48" r="18" fill="#38bdf8"/>
    <!-- Drum kit -->
    <ellipse cx="69" cy="98" rx="28" ry="14" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
    <ellipse cx="40" cy="85" rx="14" ry="7" fill="#64748b"/>
    <ellipse cx="98" cy="85" rx="14" ry="7" fill="#64748b"/>
    <text x="69" y="152" text-anchor="middle" fill="#fed7aa" font-size="10" font-family="sans-serif" font-weight="600">Big Joe (Drums)</text>
  </g>

  <!-- Card 11: Rick Trumpet & Brass -->
  <g transform="translate(664, 360)">
    <rect width="138" height="180" rx="6" fill="url(#purpleStage)" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#18181b"/>
    <circle cx="69" cy="55" r="18" fill="#e2e8f0"/>
    <rect x="52" y="75" width="34" height="55" rx="4" fill="#09090b"/>
    <line x1="45" y1="85" x2="88" y2="85" stroke="#eab308" stroke-width="3"/>
    <polygon points="88,78 100,85 88,92" fill="#eab308"/>
    <text x="69" y="152" text-anchor="middle" fill="#fef08a" font-size="10" font-family="sans-serif" font-weight="600">Rick (Trumpet)</text>
  </g>

  <!-- Card 12: CIAN THE KING OF CAT PRODUCERS! -->
  <g transform="translate(820, 360)">
    <rect width="138" height="180" rx="6" fill="url(#goldStage)" stroke="#eab308" stroke-width="2"/>
    <rect x="8" y="10" width="122" height="160" rx="4" fill="#1c1917"/>

    <!-- Black cap with NOS7 -->
    <path d="M 45 42 Q 69 22 93 42 Z" fill="#0a0a0a"/>
    <rect x="42" y="38" width="54" height="6" rx="2" fill="#000000"/>
    <text x="69" y="36" text-anchor="middle" fill="#ffffff" font-size="8" font-family="monospace" font-weight="bold">NOS7</text>

    <!-- Sleek Tabby Cat Head -->
    <ellipse cx="69" cy="58" rx="20" ry="18" fill="#d97706"/>
    <!-- Tabby Ears -->
    <polygon points="50,42 56,26 63,40" fill="#b45309"/>
    <polygon points="52,40 56,30 61,39" fill="#fca5a5"/>
    <polygon points="75,40 82,26 88,42" fill="#b45309"/>
    <polygon points="77,39 82,30 86,40" fill="#fca5a5"/>

    <!-- Cat face features -->
    <ellipse cx="61" cy="55" rx="3.5" ry="4.5" fill="#fef08a"/>
    <ellipse cx="77" cy="55" rx="3.5" ry="4.5" fill="#fef08a"/>
    <ellipse cx="61" cy="55" rx="1.5" ry="4" fill="#000000"/>
    <ellipse cx="77" cy="55" rx="1.5" ry="4" fill="#000000"/>
    <!-- Tabby stripes -->
    <line x1="69" y1="44" x2="69" y2="49" stroke="#78350f" stroke-width="2"/>
    <line x1="64" y1="46" x2="65" y2="50" stroke="#78350f" stroke-width="1.5"/>
    <line x1="74" y1="46" x2="73" y2="50" stroke="#78350f" stroke-width="1.5"/>
    <polygon points="67,61 71,61 69,63" fill="#f43f5e"/>

    <!-- Black & Gold striped jersey 'CITY CAT' -->
    <rect x="44" y="75" width="50" height="55" rx="5" fill="#09090b"/>
    <line x1="52" y1="75" x2="52" y2="130" stroke="#eab308" stroke-width="4"/>
    <line x1="64" y1="75" x2="64" y2="130" stroke="#eab308" stroke-width="4"/>
    <line x1="76" y1="75" x2="76" y2="130" stroke="#eab308" stroke-width="4"/>
    <line x1="86" y1="75" x2="86" y2="130" stroke="#eab308" stroke-width="4"/>

    <!-- Thick Gold Chain -->
    <path d="M 52 74 Q 69 90 86 74" stroke="#f59e0b" stroke-width="4" fill="none"/>
    <circle cx="69" cy="85" r="5" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>

    <text x="69" y="152" text-anchor="middle" fill="#fde047" font-size="10" font-family="sans-serif" font-weight="bold">CIAN (Producer)</text>
  </g>

  <!-- Bottom Brand Mark -->
  <text x="500" y="605" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="12" letter-spacing="1">CITYCAT PRODUCTIONS • THE HUMANS BAND ARCHIVE</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
})();
