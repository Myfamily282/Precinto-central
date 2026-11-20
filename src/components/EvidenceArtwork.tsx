import React from 'react';

interface EvidenceArtworkProps {
  itemId: string;
  className?: string;
}

export const PrecinctHeroIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 560 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Mesa de evidencia del precinto"
  >
    <defs>
      <linearGradient id="deskTop" x1="0" y1="0" x2="560" y2="320" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="folderGrad" x1="120" y1="70" x2="360" y2="260" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
      <linearGradient id="brassRing" x1="310" y1="80" x2="450" y2="220" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>

    <rect width="560" height="320" rx="24" fill="url(#deskTop)" />
    {/* Subtle grid lines on briefing mat */}
    <path d="M40 80H520M40 160H520M40 240H520M140 24V296M280 24V296M420 24V296" stroke="#334155" strokeWidth="1" strokeOpacity="0.45" />

    {/* Case File Sheet */}
    <g transform="rotate(-4 240 160)">
      <rect x="115" y="56" width="230" height="214" rx="14" fill="url(#folderGrad)" />
      <rect x="135" y="78" width="90" height="10" rx="5" fill="#1D4ED8" />
      <rect x="135" y="98" width="145" height="6" rx="3" fill="#94A3B8" />
      <rect x="135" y="114" width="120" height="6" rx="3" fill="#CBD5E1" />

      {/* Polaroid Evidence Frame 1 */}
      <rect x="136" y="138" width="84" height="102" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="144" y="146" width="68" height="68" rx="4" fill="#EFF6FF" />
      <circle cx="178" cy="180" r="18" fill="#F59E0B" fillOpacity="0.25" stroke="#D97706" strokeWidth="3" />
      <path d="M178 168V180L186 185" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />

      {/* Polaroid Evidence Frame 2 */}
      <g transform="rotate(7 278 184)">
        <rect x="234" y="136" width="84" height="102" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="242" y="144" width="68" height="68" rx="4" fill="#FEF3C7" />
        <circle cx="276" cy="178" r="18" fill="#FFFFFF" stroke="#B45309" strokeWidth="3" />
        <polygon points="276,163 280,178 276,193 272,178" fill="#DC2626" />
      </g>
    </g>

    {/* Magnifying Glass */}
    <g>
      <circle cx="382" cy="148" r="64" fill="#3B82F6" fillOpacity="0.14" stroke="url(#brassRing)" strokeWidth="10" />
      <path d="M342 126C352 108 372 98 392 100" stroke="#FFFFFF" strokeWidth="5" strokeOpacity="0.65" strokeLinecap="round" />
      <path d="M428 194L478 244" stroke="#B45309" strokeWidth="16" strokeLinecap="round" />
      <path d="M428 194L478 244" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
    </g>

    {/* Evidence Marker Tag */}
    <g transform="translate(52 186) rotate(-8)">
      <path d="M18 0H54L68 62H4L18 0Z" fill="#F59E0B" />
      <text x="36" y="42" textAnchor="middle" fill="#0F172A" fontSize="24" fontWeight="800" fontFamily="monospace">
        01
      </text>
    </g>
  </svg>
);

export const EvidenceArtwork: React.FC<EvidenceArtworkProps> = ({ itemId, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ${className}`}
    >
      <svg viewBox="0 0 220 220" fill="none" className="h-full w-full p-4" aria-label={itemId}>
        <defs>
          <radialGradient id="pedestalShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="goldMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="steelMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="ceramicWhite" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>

        <ellipse cx="110" cy="182" rx="68" ry="14" fill="url(#pedestalShadow)" />

        {itemId === 'pocket_watch' && (
          <g>
            <rect x="100" y="34" width="20" height="16" rx="4" fill="url(#goldMetal)" />
            <circle cx="110" cy="30" r="10" stroke="url(#goldMetal)" strokeWidth="4" />
            <circle cx="110" cy="116" r="62" fill="url(#goldMetal)" />
            <circle cx="110" cy="116" r="52" fill="#FEFCE8" stroke="#92400E" strokeWidth="2" />
            {/* Dial ticks */}
            <circle cx="110" cy="74" r="2.5" fill="#1E293B" />
            <circle cx="152" cy="116" r="2.5" fill="#1E293B" />
            <circle cx="110" cy="158" r="2.5" fill="#1E293B" />
            <circle cx="68" cy="116" r="2.5" fill="#1E293B" />
            {/* Hands */}
            <path d="M110 116V84" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M110 116L136 128" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="110" cy="116" r="5" fill="#B45309" />
          </g>
        )}

        {itemId === 'brass_compass' && (
          <g>
            <circle cx="110" cy="34" r="9" stroke="url(#goldMetal)" strokeWidth="4" />
            <circle cx="110" cy="116" r="62" fill="url(#goldMetal)" />
            <circle cx="110" cy="116" r="51" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
            <text x="110" y="80" textAnchor="middle" fill="#F8FAFC" fontSize="13" fontWeight="700">N</text>
            <text x="110" y="160" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="700">S</text>
            <text x="148" y="120" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="700">E</text>
            <text x="72" y="120" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="700">O</text>
            <polygon points="110,78 119,116 110,116 101,116" fill="#EF4444" />
            <polygon points="110,154 119,116 110,116 101,116" fill="#E2E8F0" />
            <circle cx="110" cy="116" r="6" fill="#F59E0B" />
          </g>
        )}

        {itemId === 'espresso_cup' && (
          <g>
            <ellipse cx="110" cy="164" rx="70" ry="16" fill="url(#ceramicWhite)" stroke="#94A3B8" strokeWidth="2" />
            <path d="M148 102C168 102 170 132 146 136" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round" />
            <path d="M68 92H150L140 156C138 164 82 164 80 156L68 92Z" fill="url(#ceramicWhite)" stroke="#94A3B8" strokeWidth="2" />
            <ellipse cx="109" cy="92" rx="41" ry="12" fill="#451A03" stroke="#E2E8F0" strokeWidth="2" />
            <ellipse cx="109" cy="92" rx="28" ry="6" fill="#92400E" fillOpacity="0.55" />
            <path d="M96 66C92 56 104 52 100 40" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
            <path d="M118 68C114 56 126 50 122 38" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
          </g>
        )}

        {itemId === 'ceramic_teapot' && (
          <g>
            {/* Spout */}
            <path d="M68 122C50 116 44 96 42 84L56 82C58 94 64 102 74 106Z" fill="url(#ceramicWhite)" stroke="#94A3B8" strokeWidth="2" />
            {/* Handle */}
            <path d="M150 96C178 92 182 142 150 144" stroke="#CBD5E1" strokeWidth="11" strokeLinecap="round" />
            {/* Body */}
            <ellipse cx="112" cy="126" rx="46" ry="40" fill="url(#ceramicWhite)" stroke="#94A3B8" strokeWidth="2" />
            {/* Lid */}
            <ellipse cx="112" cy="86" rx="28" ry="9" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="112" cy="73" r="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <path d="M84 128H140" stroke="#3B82F6" strokeWidth="3" strokeOpacity="0.45" strokeLinecap="round" />
          </g>
        )}

        {itemId === 'vintage_camera' && (
          <g>
            <rect x="64" y="64" width="24" height="12" rx="3" fill="url(#steelMetal)" />
            <rect x="136" y="60" width="20" height="14" rx="3" fill="#D97706" />
            <rect x="44" y="72" width="132" height="90" rx="12" fill="#1E293B" stroke="#475569" strokeWidth="2" />
            <rect x="44" y="72" width="132" height="28" rx="10" fill="url(#steelMetal)" />
            <circle cx="110" cy="122" r="34" fill="#334155" stroke="#CBD5E1" strokeWidth="5" />
            <circle cx="110" cy="122" r="22" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
            <circle cx="103" cy="114" r="6" fill="#93C5FD" fillOpacity="0.65" />
            <rect x="148" y="80" width="16" height="10" rx="2" fill="#0F172A" />
          </g>
        )}

        {itemId === 'field_binoculars' && (
          <g>
            <rect x="86" y="88" width="48" height="20" rx="4" fill="url(#goldMetal)" />
            <path d="M56 76L76 154H102L90 76H56Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />
            <path d="M164 76L144 154H118L130 76H164Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />
            <circle cx="72" cy="154" r="22" fill="url(#goldMetal)" />
            <circle cx="72" cy="154" r="15" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
            <circle cx="148" cy="154" r="22" fill="url(#goldMetal)" />
            <circle cx="148" cy="154" r="15" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
            <circle cx="67" cy="149" r="4" fill="#93C5FD" fillOpacity="0.7" />
            <circle cx="143" cy="149" r="4" fill="#93C5FD" fillOpacity="0.7" />
          </g>
        )}

        {itemId === 'skeleton_key' && (
          <g transform="rotate(-35 110 110)">
            <circle cx="66" cy="110" r="24" stroke="url(#goldMetal)" strokeWidth="10" />
            <circle cx="66" cy="110" r="10" stroke="#92400E" strokeWidth="2" />
            <rect x="88" y="104" width="88" height="12" rx="6" fill="url(#goldMetal)" />
            <rect x="148" y="114" width="10" height="22" rx="2" fill="url(#goldMetal)" />
            <rect x="164" y="114" width="10" height="16" rx="2" fill="url(#goldMetal)" />
          </g>
        )}

        {itemId === 'brass_padlock' && (
          <g>
            <path d="M78 100V74C78 52 142 52 142 74V100" stroke="url(#steelMetal)" strokeWidth="14" strokeLinecap="round" />
            <rect x="64" y="96" width="92" height="76" rx="14" fill="url(#goldMetal)" stroke="#92400E" strokeWidth="2" />
            <circle cx="110" cy="126" r="10" fill="#1E293B" />
            <path d="M105 130L103 150H117L115 130Z" fill="#1E293B" />
          </g>
        )}

        {itemId === 'fountain_pen' && (
          <g transform="rotate(-38 110 110)">
            <rect x="44" y="99" width="96" height="22" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="2" />
            <rect x="108" y="99" width="12" height="22" fill="url(#goldMetal)" />
            <polygon points="140,101 180,110 140,119" fill="url(#goldMetal)" />
            <line x1="156" y1="110" x2="176" y2="110" stroke="#0F172A" strokeWidth="2" />
            <circle cx="155" cy="110" r="2.5" fill="#0F172A" />
          </g>
        )}

        {itemId === 'paint_brush' && (
          <g transform="rotate(-38 110 110)">
            <rect x="34" y="102" width="102" height="16" rx="8" fill="#B45309" />
            <rect x="132" y="100" width="18" height="20" rx="2" fill="url(#steelMetal)" />
            <path d="M150 98C170 96 184 106 184 110C184 114 170 124 150 122Z" fill="#1E293B" />
            <path d="M168 103C177 106 183 108 183 110C183 112 177 114 168 117Z" fill="#3B82F6" />
          </g>
        )}

        {itemId === 'desk_lamp' && (
          <g>
            <ellipse cx="110" cy="170" rx="44" ry="12" fill="#1E293B" />
            <path d="M110 166L82 114L126 68" stroke="url(#goldMetal)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M114 58L154 88L128 112L98 80Z" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2" />
            <circle cx="136" cy="96" r="8" fill="#FDE047" />
          </g>
        )}

        {itemId === 'hand_lantern' && (
          <g>
            <path d="M84 72C84 44 136 44 136 72" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <rect x="78" y="72" width="64" height="14" rx="4" fill="#334155" />
            <rect x="82" y="86" width="56" height="68" rx="6" fill="#FEF3C7" stroke="#94A3B8" strokeWidth="3" />
            <path d="M110 104C118 114 118 128 110 134C102 128 102 114 110 104Z" fill="#F59E0B" />
            <rect x="74" y="154" width="72" height="18" rx="6" fill="#1E293B" />
          </g>
        )}

        {itemId === 'leather_briefcase' && (
          <g>
            <path d="M90 76V62C90 56 130 56 130 62V76" stroke="#78350F" strokeWidth="8" strokeLinecap="round" />
            <rect x="46" y="76" width="128" height="90" rx="12" fill="#92400E" stroke="#451A03" strokeWidth="2" />
            <path d="M46 112H174" stroke="#451A03" strokeWidth="3" />
            <rect x="78" y="106" width="16" height="16" rx="3" fill="url(#goldMetal)" />
            <rect x="126" y="106" width="16" height="16" rx="3" fill="url(#goldMetal)" />
          </g>
        )}

        {itemId === 'steel_safe' && (
          <g>
            <rect x="52" y="56" width="116" height="114" rx="14" fill="#334155" stroke="#0F172A" strokeWidth="3" />
            <rect x="66" y="70" width="88" height="86" rx="8" fill="#475569" stroke="#1E293B" strokeWidth="2" />
            <circle cx="110" cy="113" r="22" fill="url(#steelMetal)" stroke="#0F172A" strokeWidth="3" />
            <circle cx="110" cy="113" r="9" fill="#0F172A" />
            <rect x="148" y="84" width="10" height="18" rx="3" fill="#94A3B8" />
            <rect x="148" y="124" width="10" height="18" rx="3" fill="#94A3B8" />
          </g>
        )}

        {itemId === 'detective_badge' && (
          <g>
            <path
              d="M110 42L166 64V112C166 150 142 178 110 190C78 178 54 150 54 112V64L110 42Z"
              fill="url(#goldMetal)"
              stroke="#78350F"
              strokeWidth="3"
            />
            <circle cx="110" cy="112" r="32" fill="#1E3A8A" stroke="#FDE68A" strokeWidth="3" />
            <polygon
              points="110,88 116,104 133,104 119,114 124,130 110,120 96,130 101,114 87,104 104,104"
              fill="#FDE047"
            />
          </g>
        )}

        {itemId === 'wax_seal' && (
          <g>
            <rect x="46" y="74" width="128" height="86" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M46 74L110 124L174 74" stroke="#94A3B8" strokeWidth="2" fill="#E2E8F0" />
            <circle cx="110" cy="122" r="26" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
            <circle cx="110" cy="122" r="17" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M103 122L108 128L119 116" stroke="#FEF2F2" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
