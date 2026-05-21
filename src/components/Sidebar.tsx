/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Province, Faction, GameState } from '../types';
import { FACTION_COLORS } from '../constants';
import { Shield, Target, ScrollText, TrendingUp, MapPin, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  state: GameState;
  onExecuteOffensive: (id: string) => void;
  onSelectProvince: (id: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onExecuteOffensive, onSelectProvince }) => {
  const selectedProvince = state.selectedProvinceId ? state.provinces[state.selectedProvinceId] : null;
  const selectedArmy = state.selectedArmyId ? state.armies.find(a => a.id === state.selectedArmyId) : null;

  return (
    <aside className="w-80 h-full bg-[#E4E3E0] border-l-2 border-[#1A1A1A] flex flex-col overflow-hidden shadow-2xl">
      {/* Details Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence mode="wait">
          {selectedArmy ? (
            <motion.div
              key={`army-${selectedArmy.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="border-b-2 border-[#1A1A1A] pb-2">
                <div className="flex items-center gap-2 text-gray-500 uppercase font-mono text-[10px]">
                  <Swords size={12} /> Division Command
                </div>
                <h2 className="text-2xl font-serif font-bold italic">Military Force</h2>
                <div className="text-[10px] font-mono text-gray-500 uppercase">{selectedArmy.faction} Territory Center</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <DetailBox label="Faction" value={selectedArmy.faction} color={FACTION_COLORS[selectedArmy.faction]} />
                <DetailBox label="Moves Left" value={`${selectedArmy.movesLeft}/2`} />
                <DetailBox label="Manpower" value={selectedArmy.manpower.toLocaleString()} />
                <DetailBox label="Morale" value={`${selectedArmy.morale}%`} />
                <DetailBox label="Militarization" value={`${selectedArmy.militarization}%`} />
              </div>

              <div className="bg-white/50 p-3 rounded border border-gray-300 space-y-2">
                <p className="text-[10px] font-mono text-gray-600">
                   <span className="font-bold underline uppercase">Command Directive:</span> Right-click an adjacent province on the map to move or attack.
                </p>
                <ul className="text-[10px] list-disc list-inside text-gray-500 font-mono">
                  <li>Cost: 1 Command Point</li>
                  <li>Manpower determines combat strength</li>
                  <li>Morale drops after combat</li>
                </ul>
              </div>

              <button
                onClick={() => onSelectProvince(null)}
                className="w-full bg-gray-200 text-gray-600 py-2 rounded text-xs font-mono font-bold hover:bg-gray-300 transition-all"
              >
                DESELECT FORCE
              </button>
            </motion.div>
          ) : selectedProvince ? (
            <motion.div
              key={selectedProvince.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="border-b-2 border-[#1A1A1A] pb-2">
                <div className="flex items-center gap-2 text-gray-500 uppercase font-mono text-[10px]">
                  <MapPin size={12} /> Strategic Sector
                </div>
                <h2 className="text-2xl font-serif font-bold italic">{selectedProvince.name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <DetailBox label="Control" value={selectedProvince.owner} color={FACTION_COLORS[selectedProvince.owner]} />
                <DetailBox label="Terrain" value={selectedProvince.terrain} />
                <DetailBox label="Strategic Val" value={`${selectedProvince.strategicValue}/10`} />
                <DetailBox label="Fortification" value={`LVL ${selectedProvince.fortification}`} />
              </div>

              <div className="bg-white/50 p-3 rounded border border-gray-300 space-y-2">
                <div className="flex justify-between items-center text-xs">
                   <div className="flex items-center gap-1"><TrendingUp size={12}/> Manpower</div>
                   <span className="font-bold">{selectedProvince.manpower}</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${(selectedProvince.manpower / 200) * 100}%` }} />
                </div>
                
                <div className="flex justify-between items-center text-xs pt-1">
                   <div className="flex items-center gap-1"><Shield size={12}/> Industrial Capacity</div>
                   <span className="font-bold">{selectedProvince.industry}</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-600 h-full" style={{ width: `${(selectedProvince.industry / 150) * 100}%` }} />
                </div>
              </div>

              {/* Removed Execute Offensive button to focus on Army movement */}
              <div className="pt-4 border-t border-gray-300">
                <p className="text-[10px] font-mono text-gray-500 italic">
                  Select a friendly army to command operations in this theater.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-20">
              <ScrollText size={48} className="opacity-20" />
              <p className="text-xs font-mono uppercase tracking-widest text-center px-10">Select a province or army to view tactical intelligence</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Estado de Guerra Panel (Replaces History) */}
      <div className="h-64 bg-[#1A1A1A] p-4 text-[11px] font-serif text-gray-400 overflow-hidden flex flex-col shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)]">
        <div className="text-[#A67C52] border-b-2 border-[#A67C52]/30 pb-2 mb-3 flex justify-between items-center">
           <span className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
             <TrendingUp size={16} /> ESTADO DE GUERRA
           </span>
           <span className="text-[10px] opacity-60 font-mono">EST. 1936</span>
        </div>
        
        <div className="flex-1 space-y-3">
          <FactionStatusItem 
            faction="Zona Republicana" 
            color={FACTION_COLORS[Faction.REPUBLICAN]} 
            desc="Control decentralized; loyalist forces."
          />
          <FactionStatusItem 
            faction="Zona Nacionalista" 
            color={FACTION_COLORS[Faction.NATIONALIST]} 
            desc="Military uprising; centralized command."
          />
          <FactionStatusItem 
            faction="Portugal" 
            color={FACTION_COLORS[Faction.PORTUGAL]} 
            desc="Luso-Spanish neutral zone."
          />
          <FactionStatusItem 
            faction="Territorios en disputa" 
            color={FACTION_COLORS[Faction.NEUTRAL]} 
            desc="Contested or neutral regions."
          />
        </div>

        <div className="mt-auto pt-2 border-t border-gray-800 text-[9px] font-mono italic opacity-40">
          Last operational update: Turn {state.turn}
        </div>
      </div>
    </aside>
  );
};

const FactionStatusItem = ({ faction, color, desc }: { faction: string, color: string, desc: string }) => (
  <div className="flex gap-3 group">
    <div className="w-1 bg-[#A67C52]/20 group-hover:bg-[#A67C52] transition-colors" />
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color }} />
        <span className="font-bold text-white/90 uppercase tracking-tight text-[10px]">{faction}</span>
      </div>
      <p className="text-gray-500 text-[9px] leading-tight italic">{desc}</p>
    </div>
  </div>
);

const DetailBox = ({ label, value, color }: { label: string, value: string, color?: string }) => (
  <div className="bg-white/80 p-2 rounded border border-gray-300">
    <div className="text-[8px] text-gray-500 uppercase tracking-tighter">{label}</div>
    <div className="text-sm font-bold uppercase truncate" style={{ color }}>{value}</div>
  </div>
);
