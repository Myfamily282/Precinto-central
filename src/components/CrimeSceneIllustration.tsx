import React from 'react';
import type { DifferenceSpot } from '../data/spotDifferenceCases.ts';

interface CrimeSceneIllustrationProps {
  caseId: string;
  variant: 'original' | 'altered';
  foundIds: string[];
  differences: DifferenceSpot[];
  hintSpotId?: string | null;
  onTapScene?: (xPct: number, yPct: number) => void;
}

export const CrimeSceneIllustration: React.FC<CrimeSceneIllustrationProps> = ({
  caseId,
  variant,
  foundIds,
  differences,
  hintSpotId,
  onTapScene,
}) => {
  const isAltered = variant === 'altered';

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onTapScene) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    onTapScene(xPct, yPct);
  };

  return (
    <svg
      viewBox="0 0 400 300"
      onClick={handleClick}
      className="h-auto w-full select-none rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-900 cursor-crosshair"
      role="img"
      aria-label={`Escena ${caseId} (${variant === 'original' ? 'Archivo original' : 'Escena alterada'})`}
    >
      {caseId === 'office_precinct' && (
        <g>
          {/* Wall & Floor */}
          <rect width="400" height="210" fill="#E2E8F0" />
          <rect y="210" width="400" height="90" fill="#CBD5E1" />
          <rect x="60" y="222" width="280" height="62" rx="8" fill="#1E3A8A" fillOpacity="0.85" />

          {/* Bookshelf right */}
          <rect x="330" y="34" width="52" height="176" fill="#78350F" rx="4" />
          <rect x="336" y="48" width="40" height="26" fill="#451A03" />
          <rect x="338" y="54" width="9" height="20" fill="#3B82F6" />
          <rect x="349" y="52" width="9" height="22" fill="#D97706" />
          <rect x="360" y="56" width="12" height="18" fill="#F8FAFC" />
          <rect x="336" y="96" width="40" height="26" fill="#451A03" />
          <rect x="340" y="102" width="14" height="20" fill="#059669" />

          {/* 1. Wall Clock (80, 66) - hand angle changes */}
          <circle cx="80" cy="66" r="24" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
          <circle cx="80" cy="66" r="2" fill="#0F172A" />
          <line x1="80" y1="66" x2="80" y2="49" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          {isAltered ? (
            <line x1="80" y1="66" x2="65" y2="75" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <line x1="80" y1="66" x2="94" y2="66" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* 2. Framed Map (208, 72) - tilted in altered */}
          <g transform={isAltered ? 'rotate(11 208 72)' : undefined}>
            <rect x="164" y="42" width="88" height="60" rx="3" fill="#FEF3C7" stroke="#78350F" strokeWidth="5" />
            <path d="M174 82L194 60L212 74L238 54" stroke="#D97706" strokeWidth="3" fill="none" />
            <circle cx="222" cy="84" r="6" fill="#2563EB" />
          </g>

          {/* Desk */}
          <rect x="88" y="168" width="224" height="16" rx="4" fill="#92400E" />
          <rect x="102" y="184" width="196" height="60" fill="#78350F" />
          {/* Left drawer */}
          <rect x="112" y="194" width="54" height="20" rx="2" fill="#B45309" />
          <circle cx="139" cy="204" r="2.5" fill="#FCD34D" />

          {/* 5. Right Drawer (256, 216) - pulled open in altered */}
          {isAltered ? (
            <g>
              <rect x="228" y="198" width="60" height="28" rx="3" fill="#451A03" />
              <rect x="232" y="206" width="56" height="24" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="2" />
              <rect x="242" y="202" width="24" height="10" fill="#F8FAFC" />
              <circle cx="260" cy="218" r="3" fill="#FEF08A" />
            </g>
          ) : (
            <g>
              <rect x="232" y="194" width="54" height="20" rx="2" fill="#B45309" />
              <circle cx="259" cy="204" r="2.5" fill="#FCD34D" />
            </g>
          )}

          {/* 3. Desk Lamp (308, 117) - color changes */}
          <rect x="282" y="158" width="28" height="10" rx="3" fill="#334155" />
          <path d="M296 158L308 124L290 112" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M274 114L306 102L316 128L282 126Z"
            fill={isAltered ? '#DC2626' : '#059669'}
            stroke="#0F172A"
            strokeWidth="2"
          />

          {/* 4. Mug (140, 162) - tipped & spilled in altered */}
          {isAltered ? (
            <g>
              <ellipse cx="152" cy="166" rx="18" ry="4" fill="#451A03" />
              <rect x="122" y="150" width="22" height="16" rx="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            </g>
          ) : (
            <g>
              <rect x="130" y="144" width="18" height="24" rx="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
              <path d="M148 150C155 150 155 162 148 162" stroke="#94A3B8" strokeWidth="3" fill="none" />
            </g>
          )}

          {/* 6. Muddy Footprint on rug (104, 252) - present only in altered */}
          {isAltered && (
            <g transform="translate(92 242) rotate(-14)">
              <ellipse cx="10" cy="10" rx="7" ry="11" fill="#451A03" fillOpacity="0.75" />
              <rect x="5" y="23" width="10" height="7" rx="2" fill="#451A03" fillOpacity="0.75" />
            </g>
          )}
        </g>
      )}

      {caseId === 'museum_hall' && (
        <g>
          {/* Gallery wall and marble floor */}
          <rect width="400" height="205" fill="#F1F5F9" />
          <rect y="205" width="400" height="95" fill="#CBD5E1" />
          <path d="M0 245H400M100 205L40 300M300 205L360 300" stroke="#94A3B8" strokeWidth="1.5" />

          {/* 1. Ceiling Spotlight (200, 36) - off in altered */}
          <rect x="186" y="14" width="28" height="16" rx="4" fill="#334155" />
          {!isAltered && (
            <polygon points="186,30 214,30 250,150 150,150" fill="#FEF08A" fillOpacity="0.32" />
          )}

          {/* 2. Left Wall Artwork (76, 102) */}
          <rect x="44" y="64" width="64" height="76" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
          {isAltered ? (
            <g>
              <circle cx="76" cy="102" r="18" fill="#DC2626" />
              <rect x="64" y="90" width="24" height="24" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            </g>
          ) : (
            <g>
              <polygon points="76,78 96,120 56,120" fill="#2563EB" />
              <circle cx="86" cy="88" r="7" fill="#F59E0B" />
            </g>
          )}

          {/* Right Plant */}
          <rect x="316" y="164" width="34" height="42" rx="4" fill="#92400E" />
          <ellipse cx="333" cy="144" rx="22" ry="26" fill="#059669" />

          {/* Central Pedestal & Glass Case */}
          <rect x="164" y="168" width="72" height="58" rx="4" fill="#475569" />
          <rect x="168" y="114" width="64" height="54" rx="4" fill="#93C5FD" fillOpacity="0.28" stroke="#3B82F6" strokeWidth="2" />

          {/* 3. Gem / Cube inside case (200, 138) */}
          {isAltered ? (
            <rect x="188" y="132" width="24" height="24" rx="2" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
          ) : (
            <polygon points="200,124 216,138 200,156 184,138" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
          )}

          {/* 4. Crack in Glass (224, 159) */}
          {isAltered && (
            <path d="M214 126L222 142L216 154L228 164" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* 5. Security Stanchions & Rope (108, 222) */}
          <rect x="64" y="192" width="8" height="46" fill="#D97706" />
          <rect x="142" y="192" width="8" height="46" fill="#D97706" />
          {isAltered ? (
            <path d="M70 202Q90 238 96 244" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M70 202Q107 224 144 202" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" fill="none" />
          )}

          {/* 6. Note on Floor (304, 246) */}
          {isAltered && (
            <g transform="translate(288 236) rotate(12)">
              <rect width="30" height="20" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
              <line x1="5" y1="7" x2="24" y2="7" stroke="#92400E" strokeWidth="2" />
              <line x1="5" y1="13" x2="18" y2="13" stroke="#92400E" strokeWidth="2" />
            </g>
          )}
        </g>
      )}

      {caseId === 'station_cafe' && (
        <g>
          <rect width="400" height="200" fill="#FEF3C7" />
          <rect y="200" width="400" height="100" fill="#E2E8F0" />

          {/* 1. Menu Chalkboard (96, 72) */}
          <rect x="44" y="34" width="104" height="72" rx="4" fill="#1E293B" stroke="#78350F" strokeWidth="5" />
          <line x1="60" y1="54" x2="130" y2="54" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="70" x2="122" y2="70" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
          {isAltered ? (
            <line x1="56" y1="86" x2="134" y2="62" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          ) : (
            <line x1="60" y1="86" x2="112" y2="86" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* 2. Hanging Pendant Lamps (296, 57) */}
          <line x1="220" y1="0" x2="220" y2="42" stroke="#1E293B" strokeWidth="3" />
          <path d="M200 58L240 58L230 42H210Z" fill="#0F172A" />

          <line x1="296" y1="0" x2="296" y2="42" stroke="#1E293B" strokeWidth="3" />
          <path d="M276 58L316 58L306 42H286Z" fill={isAltered ? '#2563EB' : '#0F172A'} />

          {/* Counter */}
          <rect x="130" y="168" width="190" height="58" rx="6" fill="#92400E" />
          <rect x="122" y="160" width="206" height="12" rx="4" fill="#451A03" />

          {/* 4. Newspaper on counter (184, 165) */}
          <rect x="164" y="150" width="38" height="14" rx="2" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />
          {isAltered ? (
            <rect x="168" y="153" width="30" height="5" fill="#DC2626" />
          ) : (
            <rect x="168" y="153" width="30" height="5" fill="#1E293B" />
          )}

          {/* 5. Banknote on counter (252, 171) */}
          {isAltered && (
            <rect x="238" y="154" width="28" height="12" rx="2" fill="#10B981" stroke="#065F46" strokeWidth="1.5" />
          )}

          {/* 3. Coat Rack & Umbrella (344, 168) */}
          <line x1="354" y1="86" x2="354" y2="232" stroke="#451A03" strokeWidth="6" strokeLinecap="round" />
          <line x1="340" y1="232" x2="368" y2="232" stroke="#451A03" strokeWidth="6" strokeLinecap="round" />
          {!isAltered && (
            <g>
              <path d="M342 132V196" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
              <path d="M342 132C342 122 332 122 332 130" stroke="#78350F" strokeWidth="3" fill="none" />
            </g>
          )}

          {/* 6. Suitcase under counter/floor (128, 246) */}
          {isAltered ? (
            <g>
              <rect x="92" y="226" width="54" height="36" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <rect x="112" y="218" width="14" height="8" rx="2" fill="#D97706" />
            </g>
          ) : (
            <g>
              <rect x="256" y="226" width="54" height="36" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <rect x="276" y="218" width="14" height="8" rx="2" fill="#D97706" />
            </g>
          )}
        </g>
      )}

      {/* Found Markers & Hint Pulse */}
      {differences.map((diff) => {
        const cx = diff.x * 4;
        const cy = diff.y * 3;
        const isFound = foundIds.includes(diff.id);
        const isHint = hintSpotId === diff.id && !isFound;
        if (!isFound && !isHint) return null;

        return (
          <g key={diff.id} className="pointer-events-none">
            {isFound && (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r="22"
                  fill="#10B981"
                  fillOpacity="0.2"
                  stroke="#10B981"
                  strokeWidth="3.5"
                />
                <circle cx={cx + 16} cy={cy - 16} r="9" fill="#10B981" />
                <path
                  d={`M${cx + 12} ${cy - 16}L${cx + 15} ${cy - 13}L${cx + 20} ${cy - 19}`}
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
            {isHint && (
              <circle
                cx={cx}
                cy={cy}
                r="26"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
