/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Faction, ResourceSet } from '../types';
import { FACTION_COLORS } from '../constants';
import { Users, Factory, Swords, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  turn: number;
  date: string;
  currentPlayer: Faction;
  resources: { [key in Faction]?: ResourceSet };
  onEndTurn: () => void;
}

export const Header: React.FC<HeaderProps> = ({ turn, date, currentPlayer, resources, onEndTurn }) => {
  const currentRes = resources[currentPlayer];

  return (
    <header className="w-full bg-[#1A1A1A] text-[#E4E3E0] p-4 flex justify-between items-center border-b-4 border-[#B8860B] shadow-lg">
      <div className="flex flex-col">
        <h1 className="text-2xl font-serif italic tracking-wider uppercase">Fuego de Libertad</h1>
        <div className="flex gap-4 text-xs font-mono text-gray-400">
          <span>TURN: {turn}</span>
          <span>DATE: {date}</span>
        </div>
      </div>

      <div className="flex gap-8 items-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-gray-500">Active Command</span>
          <div 
            className="px-4 py-1 rounded text-sm font-bold border"
            style={{ 
              borderColor: FACTION_COLORS[currentPlayer], 
              color: FACTION_COLORS[currentPlayer],
              backgroundColor: `${FACTION_COLORS[currentPlayer]}11`
            }}
          >
            {currentPlayer}
          </div>
        </div>

        <div className="flex gap-6 border-l border-gray-700 pl-8">
          <ResourceItem icon={<ShieldCheck size={14} />} label="Command" value={currentRes?.commandPoints || 0} />
          <ResourceItem icon={<Users size={14} />} label="Manpower" value={currentRes?.manpower || 0} />
          <ResourceItem icon={<Factory size={14} />} label="Industry" value={currentRes?.industrialCapacity || 0} />
          <ResourceItem icon={<Swords size={14} />} label="Supplies" value={currentRes?.supplies || 0} />
        </div>

        <button 
          onClick={onEndTurn}
          className="bg-[#B8860B] hover:bg-[#9A6F09] text-black px-6 py-2 rounded font-bold transition-all active:scale-95 shadow-[0_4px_0_0_#8B6F00]"
        >
          END TURN
        </button>
      </div>
    </header>
  );
};

const ResourceItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="flex flex-col items-center group cursor-help" title={label}>
    <div className="flex items-center gap-1 text-[#B8860B]">
      {icon}
      <span className="text-lg font-mono font-bold leading-none">{value}</span>
    </div>
    <span className="text-[9px] uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">{label}</span>
  </div>
);
