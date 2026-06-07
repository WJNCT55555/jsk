/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Province, Faction, GameState, Army } from '../types';
import { FACTION_COLORS, UI_COLORS } from '../constants';
import { Shield, Target, ScrollText, TrendingUp, MapPin, Swords, Plus, Minus, Info, Flame, Users, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  state: GameState;
  onExecuteOffensive: (id: string) => void;
  onSelectProvince: (id: string | null) => void;
  onRecruitArmy: (provinceId: string, composition: { infantry: number; artillery: number; tanks: number }) => void;
  onReinforceArmy: (armyId: string) => void;
  onSelectArmy: (id: string | null, isShift?: boolean) => void;
  onMergeArmies: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  state, 
  onExecuteOffensive, 
  onSelectProvince, 
  onRecruitArmy, 
  onReinforceArmy,
  onSelectArmy,
  onMergeArmies
}) => {
  const selectedProvince = state.selectedProvinceId ? state.provinces[state.selectedProvinceId] : null;
  const selectedArmy = state.selectedArmyId ? state.armies.find(a => a.id === state.selectedArmyId) : null;

  // Multi-selection calculations
  const selectedArmies = state.armies.filter(a => state.selectedArmyIds.includes(a.id));
  const isMultipleSelected = selectedArmies.length > 1;

  // Recruitment formulation state
  const [recruitInf, setRecruitInf] = useState(2000); // 2000 soldiers step
  const [recruitArt, setRecruitArt] = useState(1000);
  const [recruitTnk, setRecruitTnk] = useState(0);

  // Reset counters when selected province shifts
  useEffect(() => {
    setRecruitInf(2000);
    setRecruitArt(1000);
    setRecruitTnk(0);
  }, [state.selectedProvinceId]);

  // Calculations for mobilize costs
  const reqManpower = recruitInf + recruitArt + recruitTnk;
  const reqSupplies = Math.floor(recruitInf * 0.03 + recruitArt * 0.06 + recruitTnk * 0.12);
  const reqIndustry = Math.floor(recruitArt * 0.04 + recruitTnk * 0.08);

  const playerRes = state.resources[state.currentPlayer];
  const hasEnoughManpower = (playerRes?.manpower || 0) >= reqManpower;
  const hasEnoughSupplies = (playerRes?.supplies || 0) >= reqSupplies;
  const hasEnoughIndustry = (playerRes?.industrialCapacity || 0) >= reqIndustry;
  const canMobilize = reqManpower > 0 && hasEnoughManpower && hasEnoughSupplies && hasEnoughIndustry;

  const handleMobilize = () => {
    if (!selectedProvince) return;
    onRecruitArmy(selectedProvince.id, {
      infantry: recruitInf,
      artillery: recruitArt,
      tanks: recruitTnk
    });
    // Reset selection counters
    setRecruitInf(2000);
    setRecruitArt(1000);
    setRecruitTnk(0);
  };

  const isArmyReinforceable = selectedArmy && 
    state.provinces[selectedArmy.provinceId]?.owner === state.currentPlayer;

  return (
    <aside className="w-80 h-full bg-[#E4E3E0] border-l-2 border-[#1A1A1A] flex flex-col overflow-hidden shadow-2xl">
      {/* Details Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence mode="wait">
          {isMultipleSelected ? (
            <motion.div
              key="multi-army"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="border-b-2 border-[#1A1A1A] pb-2">
                <div className="flex items-center gap-2 text-gray-500 uppercase font-mono text-[10px]">
                  <Swords size={12} className="text-red-700 animate-pulse" /> MULTI-DIVISION COMMAND
                </div>
                <h2 className="text-xl font-serif font-bold italic">
                  Selected Stacks ({selectedArmies.length})
                </h2>
                <div className="text-[10px] font-mono text-gray-500 uppercase">
                  Concentrated in {state.provinces[selectedArmies[0].provinceId]?.name}
                </div>
              </div>

              {(() => {
                const totalManpower = selectedArmies.reduce((sum, a) => sum + a.manpower, 0);
                const totalMaxManpower = selectedArmies.reduce((sum, a) => sum + (a.maxManpower || a.manpower), 0);
                const totalInf = selectedArmies.reduce((sum, a) => sum + a.composition.infantry, 0);
                const totalArt = selectedArmies.reduce((sum, a) => sum + a.composition.artillery, 0);
                const totalTnk = selectedArmies.reduce((sum, a) => sum + a.composition.tanks, 0);

                const avgMorale = totalManpower > 0 
                  ? Math.round(selectedArmies.reduce((sum, a) => sum + a.morale * a.manpower, 0) / totalManpower)
                  : Math.round(selectedArmies.reduce((sum, a) => sum + a.morale, 0) / selectedArmies.length);
                
                const avgMilitarization = totalManpower > 0 
                  ? Math.round(selectedArmies.reduce((sum, a) => sum + a.militarization * a.manpower, 0) / totalManpower)
                  : Math.round(selectedArmies.reduce((sum, a) => sum + a.militarization, 0) / selectedArmies.length);
                
                const minMoves = Math.min(...selectedArmies.map(a => a.movesLeft));
                const sameFaction = selectedArmies.every(a => a.faction === state.currentPlayer);

                return (
                  <div className="space-y-4">
                    {/* Combined Ratings */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <DetailBox label="Control" value={selectedArmies[0].faction} color={FACTION_COLORS[selectedArmies[0].faction]} />
                      <DetailBox label="Tactical Move Limit" value={`${minMoves}/2`} />
                      <DetailBox label="Weighted Morale" value={`${avgMorale}%`} />
                      <DetailBox label="Weighted Mil." value={`${avgMilitarization}%`} />
                    </div>

                    {/* Combined Composition segments */}
                    <div className="bg-white/80 p-3 rounded border border-gray-300 space-y-3 shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex justify-between border-b pb-1 font-serif">
                        <span>Combined Strength</span>
                        <span className="font-mono text-[10px] text-gray-500">
                          {totalManpower.toLocaleString()} / {totalMaxManpower.toLocaleString()} 兵力
                        </span>
                      </h3>

                      {totalManpower > 0 && (
                        <div className="w-full h-3.5 rounded overflow-hidden flex bg-gray-200 border border-gray-400">
                          <div 
                            className="bg-emerald-700 h-full border-r border-emerald-900 transition-all duration-500" 
                            style={{ width: `${(totalInf / totalManpower) * 100}%` }} 
                            title={`Infantry: ${totalInf}`}
                          />
                          <div 
                            className="bg-amber-600 h-full border-r border-amber-800 transition-all duration-500" 
                            style={{ width: `${(totalArt / totalManpower) * 100}%` }} 
                            title={`Artillery: ${totalArt}`}
                          />
                          <div 
                            className="bg-indigo-700 h-full transition-all duration-500" 
                            style={{ width: `${(totalTnk / totalManpower) * 100}%` }} 
                            title={`Tanks: ${totalTnk}`}
                          />
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between items-center text-emerald-800">
                          <div className="flex items-center gap-1"><Users size={12} className="opacity-70" /> 步兵 Infantry </div>
                          <span className="font-bold">{totalInf.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-800">
                          <div className="flex items-center gap-1"><Crosshair size={12} className="opacity-70" /> 炮兵 Artillery</div>
                          <span className="font-bold">{totalArt.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-indigo-800">
                          <div className="flex items-center gap-1"><Flame size={12} className="opacity-70" /> 坦克 Tanks</div>
                          <span className="font-bold">{totalTnk.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* List of Divisions in Selection */}
                    <div className="bg-white/90 p-3 rounded border border-gray-300 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-serif border-b pb-1">
                        Selected Sub-Divisions ({selectedArmies.length})
                      </h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {selectedArmies.map(a => (
                          <div key={a.id} className="flex justify-between items-center p-1.5 bg-gray-50 border border-gray-200 rounded text-[11px] font-mono">
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="checkbox" 
                                checked={true} 
                                onChange={() => onSelectArmy(a.id, true)}
                                className="rounded border-gray-400 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="font-bold text-gray-800">Div. {a.id.slice(-4).toUpperCase()}</span>
                            </div>
                            <div className="text-gray-500 font-bold flex gap-2">
                              <span>{a.manpower.toLocaleString()} 兵力</span>
                              <span className="text-amber-800">★{a.morale}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Merge Action Panel */}
                    {sameFaction ? (
                      <div className="bg-amber-50 border border-amber-300 p-3 rounded space-y-2">
                        <div className="text-[10px] text-amber-900 leading-normal flex gap-1.5">
                          <Info size={14} className="shrink-0 text-amber-700 mt-0.5" />
                          <span>
                            Merging will consolidate all soldiers and equipment into <strong>Div. {selectedArmies[0].id.slice(-4).toUpperCase()}</strong>. Morale and experience will be mathematically balanced.
                          </span>
                        </div>
                        <button
                          onClick={onMergeArmies}
                          className="w-full py-2 bg-gradient-to-r from-yellow-700 to-[#B8860B] hover:from-yellow-800 hover:to-[#9A6F09] text-white font-serif italic text-sm font-bold uppercase tracking-wider rounded transition-all shadow-[0_3px_0_0_#8B6F00] active:translate-y-0.5 active:shadow-none animate-pulse"
                        >
                          合并军队 Merge Selected Stacks
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-100/60 rounded border border-red-200 text-[10px] font-mono text-red-700 italic">
                        ⚠️ Cannot merge forces belonging to different factions.
                      </div>
                    )}

                    <button
                      onClick={() => onSelectArmy(null)}
                      className="w-full bg-gray-200 text-gray-600 py-2 rounded text-xs font-mono font-bold hover:bg-gray-300 transition-all uppercase tracking-wider"
                    >
                      Deselect Selection ({selectedArmies.length})
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          ) : selectedArmy ? (
            <motion.div
              key={`army-${selectedArmy.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="border-b-2 border-[#1A1A1A] pb-2">
                <div className="flex items-center gap-2 text-gray-500 uppercase font-mono text-[10px]">
                  <Swords size={12} /> DIVISION STATUS
                </div>
                <h2 className="text-xl font-serif font-bold italic">
                  Div. {selectedArmy.id.slice(-4).toUpperCase()}
                </h2>
                <div className="text-[10px] font-mono text-gray-500 uppercase">
                  Stationed in {state.provinces[selectedArmy.provinceId]?.name}
                </div>
              </div>

              {/* Combat Ratings */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <DetailBox label="Control" value={selectedArmy.faction} color={FACTION_COLORS[selectedArmy.faction]} />
                <DetailBox label="Action Moves" value={`${selectedArmy.movesLeft}/2`} />
                <DetailBox label="Morale Spirit" value={`${selectedArmy.morale}%`} />
                <DetailBox label="Militarization" value={`${selectedArmy.militarization}%`} />
              </div>

              {/* Composition Segment Card */}
              <div className="bg-white/80 p-3 rounded border border-gray-300 space-y-3 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex justify-between border-b pb-1 font-serif">
                  <span>兵力编制 Composition</span>
                  <span className="font-mono text-[10px] text-gray-500">
                    {selectedArmy.manpower.toLocaleString()} / {(selectedArmy.maxManpower || selectedArmy.manpower).toLocaleString()} 兵力
                  </span>
                </h3>

                {/* Micro Segment Bar */}
                {selectedArmy.manpower > 0 && (
                  <div className="w-full h-3.5 rounded overflow-hidden flex bg-gray-200 border border-gray-400">
                    <div 
                      className="bg-emerald-700 h-full border-r border-emerald-900 transition-all duration-500" 
                      style={{ width: `${(selectedArmy.composition.infantry / selectedArmy.manpower) * 100}%` }} 
                      title={`Infantry: ${selectedArmy.composition.infantry}`}
                    />
                    <div 
                      className="bg-amber-600 h-full border-r border-amber-800 transition-all duration-500" 
                      style={{ width: `${(selectedArmy.composition.artillery / selectedArmy.manpower) * 100}%` }} 
                      title={`Artillery: ${selectedArmy.composition.artillery}`}
                    />
                    <div 
                      className="bg-indigo-700 h-full transition-all duration-500" 
                      style={{ width: `${(selectedArmy.composition.tanks / selectedArmy.manpower) * 100}%` }} 
                      title={`Tanks: ${selectedArmy.composition.tanks}`}
                    />
                  </div>
                )}

                {/* Breakdown List */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-emerald-800">
                    <div className="flex items-center gap-1"><Users size={12} className="opacity-70" /> 步兵 Infantry </div>
                    <span className="font-bold">
                      {selectedArmy.composition.infantry.toLocaleString()} / {(selectedArmy.designedComposition?.infantry ?? selectedArmy.composition.infantry).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-amber-800 font-mono">
                    <div className="flex items-center gap-1"><Crosshair size={12} className="opacity-70" /> 炮兵 Artillery</div>
                    <span className="font-bold">
                      {selectedArmy.composition.artillery.toLocaleString()} / {(selectedArmy.designedComposition?.artillery ?? selectedArmy.composition.artillery).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-indigo-800">
                    <div className="flex items-center gap-1"><Flame size={12} className="opacity-70" /> 坦克 Tanks</div>
                    <span className="font-bold">
                      {selectedArmy.composition.tanks.toLocaleString()} / {(selectedArmy.designedComposition?.tanks ?? selectedArmy.composition.tanks).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tactical Reinforcement Panel */}
              {isArmyReinforceable ? (
                (() => {
                  const designedComp = selectedArmy.designedComposition || selectedArmy.composition;
                  const maxInfRestored = Math.max(0, Math.floor((designedComp.infantry - selectedArmy.composition.infantry) * 0.5));
                  const maxArtRestored = Math.max(0, Math.floor((designedComp.artillery - selectedArmy.composition.artillery) * 0.5));
                  const maxTnkRestored = Math.max(0, Math.floor((designedComp.tanks - selectedArmy.composition.tanks) * 0.5));

                  const totalMaxRestored = maxInfRestored + maxArtRestored + maxTnkRestored;
                  
                  // Calculate resource scale just like in useGameState.ts
                  let scale = 1.0;
                  const targetManpower = totalMaxRestored;
                  const targetSupplies = Math.floor(maxInfRestored * 0.03 + maxArtRestored * 0.06 + maxTnkRestored * 0.12);
                  const targetIndustrial = Math.floor(maxArtRestored * 0.04 + maxTnkRestored * 0.08);

                  const clientManpower = playerRes?.manpower || 0;
                  const clientSupplies = playerRes?.supplies || 0;
                  const clientIndustrial = playerRes?.industrialCapacity || 0;

                  if (targetManpower > 0) {
                    if (clientManpower < targetManpower) scale = Math.min(scale, clientManpower / targetManpower);
                    if (clientSupplies < targetSupplies) scale = Math.min(scale, clientSupplies / targetSupplies);
                    if (clientIndustrial < targetIndustrial) scale = Math.min(scale, clientIndustrial / targetIndustrial);
                  }

                  const actualInf = Math.floor(maxInfRestored * scale);
                  const actualArt = Math.floor(maxArtRestored * scale);
                  const actualTnk = Math.floor(maxTnkRestored * scale);
                  const actualTotal = actualInf + actualArt + actualTnk;

                  const costManpower = actualTotal;
                  const costSupplies = Math.floor(actualInf * 0.03 + actualArt * 0.06 + actualTnk * 0.12);
                  const costIndustrial = Math.floor(actualArt * 0.04 + actualTnk * 0.08);

                  // Has casualties to supplement?
                  const hasCasualties = (selectedArmy.maxManpower || selectedArmy.manpower) > selectedArmy.manpower;
                  const canAffordSupplement = actualTotal > 0 && 
                    clientManpower >= costManpower && 
                    clientSupplies >= costSupplies && 
                    clientIndustrial >= costIndustrial;

                  return (
                    <div className="bg-white/90 p-3 rounded border border-gray-300 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-serif border-b pb-1">
                        人员补充 Personnel Supplement
                      </h4>
                      <p className="text-[10px] text-gray-500 leading-tight">
                        Replenish up to 50% of lost division troops and rally military morale by 20%.
                      </p>

                      {!hasCasualties ? (
                        <div className="p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-[10px] font-mono text-center">
                          ✓ Division is already at 100% full strength
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          {/* Troop replenish prognosis */}
                          <div className="bg-gray-50/85 p-2 rounded border border-gray-200 text-[10px] space-y-1 font-mono">
                            <div className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Estimated Supplementation:</div>
                            <div className="flex justify-between text-emerald-800">
                              <span>Infantry Recruits:</span>
                              <span className="font-bold">+{actualInf.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-amber-800">
                              <span>Artillery Recruits:</span>
                              <span className="font-bold">+{actualArt.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-indigo-800">
                              <span>Tank Crew Recruits:</span>
                              <span className="font-bold">+{actualTnk.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-dashed my-1" />
                            <div className="flex justify-between font-bold text-gray-800">
                              <span>Total Supplements:</span>
                              <span>+{actualTotal.toLocaleString()} troops</span>
                            </div>
                            <div className="flex justify-between text-yellow-800 font-bold">
                              <span>Morale Boosted Target:</span>
                              <span>{selectedArmy.morale}% ➔ {Math.min(100, Math.floor(selectedArmy.morale * 1.2))}%</span>
                            </div>
                          </div>

                          {/* Cost list details */}
                          <div className="bg-gray-50/50 p-2 rounded border border-gray-200 text-[10px] space-y-1 font-mono">
                            <div className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Operation Resource Cost Bill:</div>
                            <div className="flex justify-between">
                              <span className={clientManpower < costManpower ? 'text-red-600 font-bold' : 'text-gray-700'}>
                                Manpower Recruits:
                              </span>
                              <span className="font-bold">{costManpower} / {clientManpower.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={clientSupplies < costSupplies ? 'text-red-600 font-bold' : 'text-gray-700'}>
                                Materials Supplies:
                              </span>
                              <span className="font-bold">{costSupplies} / {clientSupplies}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={clientIndustrial < costIndustrial ? 'text-red-600 font-bold' : 'text-gray-700'}>
                                Industrial Capacity:
                              </span>
                              <span className="font-bold">{costIndustrial} / {clientIndustrial}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onReinforceArmy(selectedArmy.id)}
                            disabled={!canAffordSupplement}
                            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold uppercase tracking-wider text-xs rounded transition-all shadow-[0_3px_0_0_#064e3b] active:translate-y-0.5 active:shadow-none"
                          >
                            Execute Supplement Action
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : selectedArmy && (
                <div className="p-3 bg-red-100/60 rounded border border-red-200 text-[10px] font-mono text-red-700 italic">
                  ⚠️ Division must be located inside friendly-controlled provinces to mobilize reinforcements.
                </div>
              )}

              {/* Show other armies in same province for easy shift-clicking */}
              {(() => {
                const armiesInSameProvince = state.armies.filter(
                  a => a.provinceId === selectedArmy.provinceId && a.id !== selectedArmy.id
                );
                if (armiesInSameProvince.length === 0) return null;

                return (
                  <div className="bg-white/80 p-3 rounded border border-gray-300 space-y-2 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-serif border-b pb-1">
                      同地块驻军 Stacked Force Units
                    </h3>
                    <p className="text-[9px] text-gray-500 leading-tight">
                      Check below to multi-select and merge regiments together into one division stack.
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
                      {/* Current Sele */}
                      <div className="flex justify-between items-center p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="checkbox" 
                            checked={true} 
                            disabled={selectedArmy.faction !== state.currentPlayer}
                            onChange={() => onSelectArmy(selectedArmy.id, true)}
                            className="rounded border-emerald-400 text-emerald-700 focus:ring-emerald-500"
                          />
                          <span className="font-bold text-emerald-950">Div. {selectedArmy.id.slice(-4).toUpperCase()}</span>
                        </div>
                        <span className="text-emerald-800 font-bold">{selectedArmy.manpower.toLocaleString()} 兵力</span>
                      </div>

                      {/* Stacked partners */}
                      {armiesInSameProvince.map(a => (
                        <div key={a.id} className="flex justify-between items-center p-1.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-mono hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="checkbox" 
                              checked={false} 
                              disabled={a.faction !== state.currentPlayer}
                              onChange={() => onSelectArmy(a.id, true)}
                              className="rounded border-gray-400 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="font-bold text-gray-700">Div. {a.id.slice(-4).toUpperCase()}</span>
                          </div>
                          <span className="text-gray-500 font-bold">{a.manpower.toLocaleString()} 兵力</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={() => onSelectProvince(null)}
                className="w-full bg-gray-200 text-gray-600 py-2 rounded text-xs font-mono font-bold hover:bg-gray-300 transition-all uppercase tracking-wider"
              >
                Deselect Command
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
                  <MapPin size={12} /> STRATEGIC SECTOR
                </div>
                <h2 className="text-xl font-serif font-bold italic">{selectedProvince.name}</h2>
              </div>

              {/* Sector details */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <DetailBox label="Control" value={selectedProvince.owner} color={FACTION_COLORS[selectedProvince.owner]} />
                <DetailBox label="Terrain" value={selectedProvince.terrain} />
                <DetailBox label="Strat. Value" value={`${selectedProvince.strategicValue}/10`} />
                <DetailBox label="Fortification" value={`LVL ${selectedProvince.fortification}`} />
              </div>

              {/* Province Garrison section showing stationed divisions */}
              {(() => {
                const armiesInProvince = state.armies.filter(a => a.provinceId === selectedProvince.id);
                if (armiesInProvince.length === 0) return null;

                return (
                  <div className="bg-white/80 p-3 rounded border border-gray-300 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-serif border-b pb-1 flex justify-between items-center">
                      <span>地块驻扎部队 Garrison Forces ({armiesInProvince.length})</span>
                      <span className="text-[9px] font-mono text-gray-400">CLICK TO COMMENCE</span>
                    </h3>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {armiesInProvince.map(a => (
                        <button
                          key={a.id}
                          onClick={() => onSelectArmy(a.id)}
                          className="w-full flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[11px] font-mono transition-all text-left"
                        >
                          <div className="flex items-center gap-1.5">
                            <Swords size={10} className={a.faction === state.currentPlayer ? 'text-emerald-700' : 'text-red-700'} />
                            <span className="font-bold text-gray-800">Div. {a.id.slice(-4).toUpperCase()}</span>
                            <span className="text-[9px] px-1 rounded bg-black/10 font-bold uppercase" style={{ color: FACTION_COLORS[a.faction] }}>
                              {a.faction.slice(0, 3)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 font-bold">
                            <span>{a.manpower.toLocaleString()} 兵力</span>
                            <span className="text-amber-800">★{a.morale}%</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Mobilization Section */}
              {selectedProvince.owner === state.currentPlayer ? (
                <div className="bg-white/80 p-3 rounded border border-gray-300 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-serif border-b pb-1 flex justify-between items-center">
                    <span>Mobilize New Division</span>
                    <span className="text-[9px] font-mono px-1 bg-yellow-100 text-yellow-800 rounded">EU4 COMPOSER</span>
                  </h3>
                  
                  {/* Selectors and adjusters */}
                  <div className="space-y-3">
                    <MobilizeAdjuster 
                      label="步兵 Infantry" 
                      value={recruitInf} 
                      onChange={setRecruitInf} 
                      color="text-emerald-800"
                      icon={<Users size={12} />}
                    />
                    <MobilizeAdjuster 
                      label="炮兵 Artillery" 
                      value={recruitArt} 
                      onChange={setRecruitArt} 
                      color="text-amber-800"
                      icon={<Crosshair size={12} />}
                    />
                    <MobilizeAdjuster 
                      label="坦克 Tanks" 
                      value={recruitTnk} 
                      onChange={setRecruitTnk} 
                      color="text-indigo-800"
                      icon={<Flame size={12} />}
                    />
                  </div>

                  {/* Operational Requirements and resources check */}
                  <div className="pt-2 border-t font-mono text-[10px] space-y-1 bg-gray-50/50 p-2 rounded">
                    <span className="text-[9px] font-bold text-gray-600 block uppercase">Operational Resource Bill:</span>
                    <div className="flex justify-between">
                      <span className={!(playerRes?.manpower && playerRes.manpower >= reqManpower) ? 'text-red-600 font-bold' : 'text-gray-700'}>
                        Manpower Recruits:
                      </span>
                      <span className="font-bold">{reqManpower.toLocaleString()} / {(playerRes?.manpower || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={!(playerRes?.supplies && playerRes.supplies >= reqSupplies) ? 'text-red-600 font-bold' : 'text-gray-700'}>
                        Material Supplies:
                      </span>
                      <span className="font-bold">{reqSupplies} / {playerRes?.supplies || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={!(playerRes?.industrialCapacity && playerRes.industrialCapacity >= reqIndustry) ? 'text-red-600 font-bold' : 'text-gray-700'}>
                        Industrial Capacity:
                      </span>
                      <span className="font-bold">{reqIndustry} / {playerRes?.industrialCapacity || 0}</span>
                    </div>
                  </div>

                  {/* Mobilize trigger button */}
                  <button
                    onClick={handleMobilize}
                    disabled={!canMobilize}
                    className="w-full py-2 bg-[#B8860B] hover:bg-[#9A6F09] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-serif italic text-black font-bold uppercase tracking-wider text-xs rounded transition-all shadow-[0_3px_0_0_#8B6F00] active:translate-y-0.5 active:shadow-none"
                  >
                    Mobilize Force
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-red-100/60 rounded border border-red-200 text-[10px] font-mono text-red-700 italic">
                  ⚠️ Cannot spawn military segments in province owned by neutral or enemy command structures.
                </div>
              )}

              {/* Province stats */}
              <div className="bg-white/50 p-3 rounded border border-gray-300 space-y-2">
                <div className="flex justify-between items-center text-xs">
                   <div className="flex items-center gap-1"><TrendingUp size={12}/> Sector Manpower</div>
                   <span className="font-bold">{selectedProvince.manpower}</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${(selectedProvince.manpower / 200) * 100}%` }} />
                </div>
                
                <div className="flex justify-between items-center text-xs pt-1">
                   <div className="flex items-center gap-1"><Shield size={12}/> Industrial Weight</div>
                   <span className="font-bold">{selectedProvince.industry}</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-600 h-full" style={{ width: `${(selectedProvince.industry / 150) * 100}%` }} />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-20">
              <ScrollText size={48} className="opacity-20" />
              <p className="text-xs font-mono uppercase tracking-widest text-center px-10">
                Select a province or division force on the map to begin commander directives
              </p>
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

interface MobilizeAdjusterProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color: string;
  icon: React.ReactNode;
}

const MobilizeAdjuster: React.FC<MobilizeAdjusterProps> = ({ label, value, onChange, color, icon }) => {
  const step = 1000;
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className={`font-bold flex items-center gap-1 ${color}`}>
          {icon} {label}
        </span>
        <span className="font-bold text-gray-700">{(value).toLocaleString()} Soldiers</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - step))}
          disabled={value <= 0}
          className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-30 transition-all font-bold border border-gray-400"
        >
          <Minus size={12} />
        </button>
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden h-2.5 relative border border-gray-300">
          <div 
            className="h-full bg-[#B8860B] opacity-80" 
            style={{ width: `${Math.min(100, (value / 8000) * 100)}%` }} 
          />
        </div>
        <button
          onClick={() => onChange(Math.min(8000, value + step))}
          disabled={value >= 8000}
          className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-30 transition-all font-bold border border-gray-400"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
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
