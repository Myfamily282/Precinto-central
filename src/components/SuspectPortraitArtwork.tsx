import React from 'react';

interface SuspectPortraitArtworkProps {
  avatarId: string;
  className?: string;
}

interface AvatarSpec {
  id: string;
  label: string;
  bg: string;
  skin: string;
  hair: string;
  coat: string;
  hairStyle: 'short' | 'bob' | 'slick' | 'curly' | 'bald';
  accessory: 'hat' | 'glasses' | 'scarf' | 'mustache' | 'earring' | 'none';
}

export const SUSPECT_AVATAR_SPECS: AvatarSpec[] = [
  {
    id: 'av_1',
    label: 'Inspector Vega',
    bg: '#CBD5E1',
    skin: '#F1C27D',
    hair: '#1E293B',
    coat: '#1E3A8A',
    hairStyle: 'slick',
    accessory: 'hat',
  },
  {
    id: 'av_2',
    label: 'Agente Morales',
    bg: '#E2E8F0',
    skin: '#E0AC69',
    hair: '#451A03',
    coat: '#334155',
    hairStyle: 'bob',
    accessory: 'glasses',
  },
  {
    id: 'av_3',
    label: 'Detective Ríos',
    bg: '#CBD5E1',
    skin: '#C68642',
    hair: '#0F172A',
    coat: '#3F2E21',
    hairStyle: 'short',
    accessory: 'mustache',
  },
  {
    id: 'av_4',
    label: 'Perito Luna',
    bg: '#E2E8F0',
    skin: '#FFDBAC',
    hair: '#7C2D12',
    coat: '#0F766E',
    hairStyle: 'curly',
    accessory: 'earring',
  },
  {
    id: 'av_5',
    label: 'Comisario Silva',
    bg: '#CBD5E1',
    skin: '#8D5524',
    hair: '#1E293B',
    coat: '#1E293B',
    hairStyle: 'bald',
    accessory: 'glasses',
  },
  {
    id: 'av_6',
    label: 'Investigadora Paz',
    bg: '#E2E8F0',
    skin: '#F1C27D',
    hair: '#0F172A',
    coat: '#7F1D1D',
    hairStyle: 'bob',
    accessory: 'scarf',
  },
  {
    id: 'av_7',
    label: 'Agente Torres',
    bg: '#CBD5E1',
    skin: '#E0AC69',
    hair: '#78350F',
    coat: '#374151',
    hairStyle: 'short',
    accessory: 'hat',
  },
  {
    id: 'av_8',
    label: 'Analista Solís',
    bg: '#E2E8F0',
    skin: '#C68642',
    hair: '#1E293B',
    coat: '#4338CA',
    hairStyle: 'curly',
    accessory: 'none',
  },
];

export const SuspectPortraitArtwork: React.FC<SuspectPortraitArtworkProps> = ({
  avatarId,
  className = '',
}) => {
  const spec =
    SUSPECT_AVATAR_SPECS.find((a) => a.id === avatarId) ?? SUSPECT_AVATAR_SPECS[0];

  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label={spec.label}
    >
      {/* Mugshot background */}
      <rect width="100" height="120" fill={spec.bg} />
      <path
        d="M0 20H100M0 40H100M0 60H100M0 80H100M0 100H100"
        stroke="#475569"
        strokeOpacity="0.3"
        strokeWidth="1"
      />

      {/* Shoulders / Coat */}
      <path d="M14 120C16 92 30 82 50 82C70 82 84 92 86 120H14Z" fill={spec.coat} />
      <path d="M40 82L50 100L60 82" fill="#F8FAFC" />

      {/* Scarf accessory */}
      {spec.accessory === 'scarf' && (
        <path d="M32 82H68L62 96H38L32 82Z" fill="#D97706" />
      )}

      {/* Neck */}
      <rect x="42" y="68" width="16" height="18" rx="6" fill={spec.skin} />

      {/* Hair back for bob/curly */}
      {spec.hairStyle === 'bob' && (
        <path d="M24 48C24 26 36 18 50 18C64 18 76 26 76 48V74H68V48H32V74H24V48Z" fill={spec.hair} />
      )}
      {spec.hairStyle === 'curly' && (
        <g fill={spec.hair}>
          <circle cx="30" cy="40" r="11" />
          <circle cx="70" cy="40" r="11" />
          <circle cx="36" cy="26" r="11" />
          <circle cx="64" cy="26" r="11" />
          <circle cx="50" cy="22" r="12" />
        </g>
      )}

      {/* Head */}
      <rect x="30" y="26" width="40" height="48" rx="19" fill={spec.skin} />

      {/* Hair top */}
      {spec.hairStyle === 'short' && (
        <path d="M30 42C30 26 40 21 50 21C60 21 70 26 70 42C63 34 37 34 30 42Z" fill={spec.hair} />
      )}
      {spec.hairStyle === 'slick' && (
        <path d="M29 40C30 24 40 20 52 20C64 20 71 27 71 40C62 32 42 30 29 40Z" fill={spec.hair} />
      )}
      {spec.hairStyle === 'bob' && (
        <path d="M30 40C32 26 40 22 50 22C60 22 68 26 70 40C62 33 40 33 30 40Z" fill={spec.hair} />
      )}

      {/* Eyes & Brows */}
      <circle cx="41" cy="48" r="2.6" fill="#0F172A" />
      <circle cx="59" cy="48" r="2.6" fill="#0F172A" />
      <path d="M36 42H45M55 42H64" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />

      {/* Glasses */}
      {spec.accessory === 'glasses' && (
        <g stroke="#0F172A" strokeWidth="2">
          <rect x="34" y="43" width="13" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.2" />
          <rect x="53" y="43" width="13" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.2" />
          <line x1="47" y1="48" x2="53" y2="48" />
        </g>
      )}

      {/* Nose & Mouth */}
      <path d="M50 48V56L48 57" stroke="#92400E" strokeOpacity="0.5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M44 63H56" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />

      {/* Mustache */}
      {spec.accessory === 'mustache' && (
        <path d="M40 61C43 58 48 58 50 60C52 58 57 58 60 61" stroke={spec.hair} strokeWidth="3.5" strokeLinecap="round" />
      )}

      {/* Earring */}
      {spec.accessory === 'earring' && (
        <circle cx="29" cy="54" r="2.6" stroke="#F59E0B" strokeWidth="1.6" />
      )}

      {/* Detective Fedora Hat */}
      {spec.accessory === 'hat' && (
        <g>
          <path d="M22 31H78" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <path d="M33 30L37 14H63L67 30H33Z" fill="#334155" />
          <rect x="34" y="25" width="32" height="3.5" fill="#D97706" />
        </g>
      )}
    </svg>
  );
};
