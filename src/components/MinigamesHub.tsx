import React, { useState } from 'react';
import { Brain, LockKeyhole, SearchCheck } from 'lucide-react';
import { soundFX } from '../utils/sound.ts';
import { ForensicMemoryGame } from './minigames/ForensicMemoryGame.tsx';
import { SafeCrackerGame } from './minigames/SafeCrackerGame.tsx';
import { SpotDifferenceGame } from './minigames/SpotDifferenceGame.tsx';

type MinigameTab = 'differences' | 'safe' | 'memory';

export const MinigamesHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MinigameTab>('differences');

  const tabs: Array<{ id: MinigameTab; label: string; subtitle: string; icon: React.ReactNode }> = [
    {
      id: 'differences',
      label: 'Escena del Crimen',
      subtitle: 'Encuentra 6 diferencias',
      icon: <SearchCheck className="h-4 w-4" />,
    },
    {
      id: 'safe',
      label: 'Caja Fuerte',
      subtitle: 'Descifra 4 dígitos',
      icon: <LockKeyhole className="h-4 w-4" />,
    },
    {
      id: 'memory',
      label: 'Memoria Forense',
      subtitle: 'Evidencia perdida',
      icon: <Brain className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundFX.tabSwitch();
                setActiveTab(tab.id);
              }}
              className={`flex min-h-[56px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                active
                  ? 'border-[#8B5A2B] bg-[#EFE2CE] text-[#3D2414] dark:border-[#C88D4B] dark:bg-[#3A2416] dark:text-[#FBF3E6]'
                  : 'border-[#D9C5A9] bg-[#FBF6EE] text-[#5C3A21] hover:bg-[#F5ECE0] dark:border-[#4A3222] dark:bg-[#22160F] dark:text-[#EAD8BE] dark:hover:bg-[#2C1C12]'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  active
                    ? 'bg-[#7C4D2B] text-white dark:bg-[#8B5A2B]'
                    : 'bg-[#EAD8BE] text-[#6E4423] dark:bg-[#332116] dark:text-[#F3D590]'
                }`}
              >
                {tab.icon}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{tab.label}</div>
                <div className="truncate text-xs text-[#7A5E46] dark:text-[#C8B297]">
                  {tab.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activeTab === 'differences' && <SpotDifferenceGame />}
      {activeTab === 'safe' && <SafeCrackerGame />}
      {activeTab === 'memory' && <ForensicMemoryGame />}
    </div>
  );
};
