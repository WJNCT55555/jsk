/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { GameState, Faction, Province, Army } from '../types';
import { INITIAL_PROVINCES, PROVINCE_ADJACENCY, INITIAL_ARMIES } from '../constants';

const INITIAL_STATE: GameState = {
  turn: 1,
  date: 'July 1936',
  currentPlayer: Faction.REPUBLICAN,
  resources: {
    [Faction.REPUBLICAN]: {
      manpower: 500,
      industrialCapacity: 300,
      commandPoints: 2,
      supplies: 200,
    },
    [Faction.NATIONALIST]: {
      manpower: 450,
      industrialCapacity: 250,
      commandPoints: 2,
      supplies: 250,
    },
    [Faction.PORTUGAL]: {
      manpower: 300,
      industrialCapacity: 150,
      commandPoints: 0,
      supplies: 100,
    },
  },
  provinces: INITIAL_PROVINCES,
  armies: INITIAL_ARMIES,
  selectedProvinceId: null,
  selectedArmyId: null,
  selectedArmyIds: [],
  history: ['The war has begun. Factional divisions have split Spain.'],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const selectProvince = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedProvinceId: id, selectedArmyId: null, selectedArmyIds: [] }));
  }, []);

  const selectArmy = useCallback((id: string | null, isShift: boolean = false) => {
    setState((s) => {
      if (!id) {
        return { ...s, selectedArmyId: null, selectedArmyIds: [], selectedProvinceId: null };
      }

      const clickedArmy = s.armies.find(a => a.id === id);
      if (!clickedArmy) return s;

      // If shift-clicking, we add to or toggle the selection, provided they are in the same province
      if (isShift) {
        const isAlreadySelected = s.selectedArmyIds.includes(id);
        let nextSelectedIds = [...s.selectedArmyIds];

        if (isAlreadySelected) {
          nextSelectedIds = nextSelectedIds.filter(x => x !== id);
        } else {
          // If we have some selected armies, check if they are in the same province and of the same faction
          const activeSels = s.armies.filter(a => s.selectedArmyIds.includes(a.id));
          const canSelect = activeSels.length === 0 || (
            activeSels[0].provinceId === clickedArmy.provinceId && 
            activeSels[0].faction === clickedArmy.faction &&
            clickedArmy.faction === s.currentPlayer
          );

          if (canSelect && clickedArmy.faction === s.currentPlayer) {
            nextSelectedIds.push(id);
          } else if (clickedArmy.faction === s.currentPlayer) {
            // Reset to just the newly clicked one if not in same province or faction or not current player
            nextSelectedIds = [id];
          }
        }

        const nextPrimaryId = nextSelectedIds.length > 0 ? nextSelectedIds[nextSelectedIds.length - 1] : null;
        return {
          ...s,
          selectedArmyId: nextPrimaryId,
          selectedArmyIds: nextSelectedIds,
          selectedProvinceId: null,
        };
      } else {
        // Simple click without Shift replaces selection
        return {
          ...s,
          selectedArmyId: id,
          selectedArmyIds: [id],
          selectedProvinceId: null,
        };
      }
    });
  }, []);

  const endTurn = useCallback(() => {
    setState((s) => {
      const nextPlayer = s.currentPlayer === Faction.REPUBLICAN ? Faction.NATIONALIST : Faction.REPUBLICAN;
      const nextTurn = nextPlayer === Faction.REPUBLICAN ? s.turn + 1 : s.turn;
      
      const newResources = { ...s.resources };
      
      // Calculate resource gain from controlled provinces
      let provinceManpower = 0;
      let provinceIndustry = 0;
      (Object.values(s.provinces) as Province[]).forEach(p => {
        if (p.owner === nextPlayer) {
          provinceManpower += p.manpower;
          provinceIndustry += p.industry;
        }
      });

      // Passive income calculations
      const manpowerGained = Math.floor(provinceManpower * 5); // 5x manpower score as raw recruits
      const suppliesGained = Math.floor(provinceIndustry * 0.8); // industry provides supplies

      const currNextRes = s.resources[nextPlayer];
      newResources[nextPlayer] = {
        manpower: (currNextRes?.manpower || 0) + manpowerGained,
        supplies: (currNextRes?.supplies || 0) + suppliesGained,
        commandPoints: 2, // Reset command points to 2
        industrialCapacity: (currNextRes?.industrialCapacity || 0) + Math.floor(provinceIndustry * 0.2), // industrial accumulation
      };

      // Reset moves for the NEXT player's armies
      const newArmies = s.armies.map(army => {
        if (army.faction === nextPlayer) {
          return { ...army, movesLeft: 2 };
        }
        return army;
      });

      return {
        ...s,
        turn: nextTurn,
        currentPlayer: nextPlayer,
        resources: newResources,
        armies: newArmies,
        history: [`${s.date}: Turn passed to ${nextPlayer}. Generated +${manpowerGained} Manpower, +${suppliesGained} Supplies.`, ...s.history].slice(0, 50),
      };
    });
  }, []);

  const moveArmy = useCallback((armyId: string, targetProvinceId: string) => {
    setState((s) => {
      const army = s.armies.find(a => a.id === armyId);
      if (!army || army.faction !== s.currentPlayer) return s;
      
      const currentCP = s.resources[s.currentPlayer].commandPoints;
      if (currentCP < 1) return s;
      if (army.movesLeft < 1) return s;

      // Check adjacency
      const adjacent = PROVINCE_ADJACENCY[army.provinceId] || [];
      if (!adjacent.includes(targetProvinceId)) return s;

      const targetProvince = s.provinces[targetProvinceId];
      const enemyArmies = s.armies.filter(a => a.provinceId === targetProvinceId && a.faction !== s.currentPlayer);
      
      let newArmies = [...s.armies];
      const newHistory = [...s.history];
      const newProvinces = { ...s.provinces };
      const newResources = { ...s.resources };

      // Deduct CP
      newResources[s.currentPlayer] = {
        ...newResources[s.currentPlayer],
        commandPoints: currentCP - 1
      };

      // Battle Logic if enemies are present
      if (enemyArmies.length > 0) {
        const defender = enemyArmies[0];
        
        // EU4-style Dice Rolls (1 to 9)
        const attackerRoll = Math.floor(Math.random() * 9) + 1;
        const defenderRoll = Math.floor(Math.random() * 9) + 1;

        // Terrain and fortifications
        const terrain = targetProvince.terrain;
        const fort = targetProvince.fortification || 0;

        let attackerTerrainMult = 1.0;
        let defenderTerrainMult = 1.0;
        let attackerTankMult = 1.0;

        if (terrain === 'mountains') {
          attackerTerrainMult -= 0.30;
          attackerTankMult = 0.4; // Tanks are heavily penalized in mountains
          defenderTerrainMult += 0.20 + (fort * 0.15);
        } else if (terrain === 'urban') {
          attackerTerrainMult -= 0.20;
          attackerTankMult = 0.6; // Tanks penalized in narrow city blocks
          defenderTerrainMult += 0.15 + (fort * 0.25);
        } else if (terrain === 'forest') {
          attackerTerrainMult -= 0.10;
          attackerTankMult = 0.8;
          defenderTerrainMult += 0.10 + (fort * 0.10);
        } else if (terrain === 'plains') {
          attackerTankMult = 1.35; // Tanks excel in plains (Shock charge bonus!)
        }

        const attComp = army.composition;
        const defComp = defender.composition;

        // Custom Unit Strengths
        // - Infantry: 1.0 combat factor (solid frontlines)
        // - Artillery: 1.5 combat support, ignores fortification barriers
        // - Tanks: 2.0 heavy charge force, excels on Plains
        const attInfPower = attComp.infantry * 1.0 * (terrain === 'urban' ? 1.25 : 1.0);
        const attArtPower = attComp.artillery * 1.5;
        const attTankPower = attComp.tanks * 2.0 * attackerTankMult;

        const defInfPower = defComp.infantry * 1.0 * (terrain === 'urban' ? 1.3 : 1.15); // Defender advantage
        const defArtPower = defComp.artillery * 1.5;
        const defTankPower = defComp.tanks * 2.0 * (terrain === 'plains' ? 1.35 : terrain === 'mountains' ? 0.4 : 1.0);

        // EU4 Fire and Shock components integrated
        const attTotalBaseSupport = attInfPower + attArtPower + attTankPower;
        const defTotalBaseSupport = defInfPower + defArtPower + defTankPower;

        const attackerPower = attTotalBaseSupport * (1 + army.morale / 100) * (1 + army.militarization / 100) * (attackerRoll + 3) * attackerTerrainMult;
        const defenderPower = defTotalBaseSupport * (1 + defender.morale / 100) * (1 + defender.militarization / 100) * (defenderRoll + 3) * defenderTerrainMult;

        // Base casualty estimations
        const totalBaseLossAttacker = Math.floor(defenderPower * 0.08);
        const totalBaseLossDefender = Math.floor(attackerPower * 0.11);

        // Back-Row Artillery Shielding: Artillery absorbs damage from front line
        const attArtRatio = attComp.artillery / Math.max(1, army.manpower);
        const defArtRatio = defComp.artillery / Math.max(1, defender.manpower);

        const attackerLossReduction = Math.min(0.25, attArtRatio * 0.8);
        const defenderLossReduction = Math.min(0.25, defArtRatio * 0.8);

        let finalAttackerLosses = Math.max(100, Math.floor(totalBaseLossAttacker * (1 - attackerLossReduction)));
        let finalDefenderLosses = Math.max(100, Math.floor(totalBaseLossDefender * (1 - defenderLossReduction)));

        // Ensure we do not kill more troop counts than exist
        finalAttackerLosses = Math.min(army.manpower, finalAttackerLosses);
        finalDefenderLosses = Math.min(defender.manpower, finalDefenderLosses);

        // Distribute casualties proportionally among regiments
        // Frontline (Inf + Tank) absorb 85% of standard losses, BACK-ROW (Artillery) takes 15%
        const distributeLosses = (comp: typeof army.composition, totalLosses: number) => {
          const totalUnits = comp.infantry + comp.artillery + comp.tanks;
          if (totalUnits <= 0) return { infantry: 0, artillery: 0, tanks: 0 };

          let infLoss = 0;
          let artLoss = 0;
          let tankLoss = 0;

          const frontUnits = comp.infantry + comp.tanks;
          
          if (frontUnits > 0) {
            const infShare = comp.infantry / frontUnits;
            const tankShare = comp.tanks / frontUnits;

            const frontLosses = totalLosses * 0.85;
            const backLosses = totalLosses * 0.15;

            infLoss = Math.min(comp.infantry, Math.floor(frontLosses * infShare));
            tankLoss = Math.min(comp.tanks, Math.floor(frontLosses * tankShare));
            artLoss = Math.min(comp.artillery, Math.floor(backLosses));

            // Distribute leftover remainders
            let leftover = totalLosses - (infLoss + artLoss + tankLoss);
            if (leftover > 0) {
              const remInf = comp.infantry - infLoss;
              const remArt = comp.artillery - artLoss;
              const remTank = comp.tanks - tankLoss;
              const remTotal = remInf + remArt + remTank;

              if (remTotal > 0) {
                infLoss += Math.min(remInf, Math.floor(leftover * (remInf / remTotal)));
                artLoss += Math.min(remArt, Math.floor(leftover * (remArt / remTotal)));
                tankLoss += Math.min(remTank, Math.floor(leftover * (remTank / remTotal)));
              }
            }
          } else {
            artLoss = Math.min(comp.artillery, totalLosses);
          }

          return {
            infantry: Math.max(0, comp.infantry - infLoss),
            artillery: Math.max(0, comp.artillery - artLoss),
            tanks: Math.max(0, comp.tanks - tankLoss),
          };
        };

        const nextAttComp = distributeLosses(attComp, finalAttackerLosses);
        const nextDefComp = distributeLosses(defComp, finalDefenderLosses);

        const nextAttManpower = nextAttComp.infantry + nextAttComp.artillery + nextAttComp.tanks;
        const nextDefManpower = nextDefComp.infantry + nextDefComp.artillery + nextDefComp.tanks;

        // Morale breaks
        const attackerLostRatio = finalAttackerLosses / Math.max(1, army.manpower);
        const defenderLostRatio = finalDefenderLosses / Math.max(1, defender.manpower);

        const attMoraleLoss = Math.floor(10 + attackerLostRatio * 100 + Math.max(0, defenderRoll - attackerRoll) * 3);
        const defMoraleLoss = Math.floor(15 + defenderLostRatio * 100 + Math.max(0, attackerRoll - defenderRoll) * 4);

        newArmies = newArmies.map(a => {
          if (a.id === armyId) {
            return { 
              ...a, 
              composition: nextAttComp,
              manpower: nextAttManpower,
              morale: Math.max(10, a.morale - attMoraleLoss),
              movesLeft: 0 
            };
          }
          if (a.id === defender.id) {
            return { 
              ...a, 
              composition: nextDefComp,
              manpower: nextDefManpower,
              morale: Math.max(10, a.morale - defMoraleLoss) 
            };
          }
          return a;
        });

        // Delete routed/wiped out forces
        newArmies = newArmies.filter(a => a.manpower > 150);

        const isVictory = defenderLostRatio >= attackerLostRatio;
        const resultText = isVictory ? 'Victory' : 'Stalemate';
        
        newHistory.unshift(
          `BATTLE OF ${targetProvince.name.toUpperCase()}: ${resultText}! ` +
          `Attacker (rolled ${attackerRoll}) lost ${finalAttackerLosses} [Remaining: ${nextAttComp.infantry} Inf, ${nextAttComp.artillery} Art, ${nextAttComp.tanks} Tnk]. ` +
          `Defender (rolled ${defenderRoll}) lost ${finalDefenderLosses} [Remaining: ${nextDefComp.infantry} Inf, ${nextDefComp.artillery} Art, ${nextDefComp.tanks} Tnk].`
        );

        // If defender completely routed, occupy
        const defenderStillThere = newArmies.some(a => a.id === defender.id);
        if (!defenderStillThere) {
          newArmies = newArmies.map(a => a.id === armyId ? { ...a, provinceId: targetProvinceId } : a);
          newProvinces[targetProvinceId] = { ...targetProvince, owner: s.currentPlayer };
          newHistory.unshift(`${army.faction} forces achieved a decisive breakthrough and won ${targetProvince.name}.`);
        }
      } else {
        // Normal move without combat
        newArmies = newArmies.map(a => 
          a.id === armyId ? { ...a, provinceId: targetProvinceId, movesLeft: a.movesLeft - 1 } : a
        );

        // Capture logic
        if (targetProvince.owner !== s.currentPlayer) {
          newProvinces[targetProvinceId] = { ...targetProvince, owner: s.currentPlayer };
          newHistory.unshift(`${army.faction} army took unoccupied province ${targetProvince.name}.`);
        } else {
          newHistory.unshift(`${army.faction} army repositioned to ${targetProvince.name}.`);
        }
      }

      return {
        ...s,
        armies: newArmies,
        resources: newResources,
        provinces: newProvinces,
        history: newHistory.slice(0, 50),
        selectedArmyId: armyId, // Keep it selected
      };
    });
  }, []);

  const recruitArmy = useCallback((provinceId: string, comp: { infantry: number, artillery: number, tanks: number }) => {
    setState((s) => {
      // Validate province control
      const province = s.provinces[provinceId];
      if (!province || province.owner !== s.currentPlayer) return s;

      const totalManpower = comp.infantry + comp.artillery + comp.tanks;
      if (totalManpower <= 0) return s;

      // Cost estimation:
      // Infantry: 1 manpower per soldier, 0.03 supplies per soldier
      // Artillery: 1 manpower per crew, 0.06 supplies, 0.03 IC
      // Tanks: 1 manpower, 0.10 supplies, 0.07 IC
      const manpowerCost = totalManpower;
      const suppliesCost = Math.floor(comp.infantry * 0.03 + comp.artillery * 0.06 + comp.tanks * 0.12);
      const industrialCost = Math.floor(comp.artillery * 0.04 + comp.tanks * 0.08);

      const res = s.resources[s.currentPlayer];
      if (res.manpower < manpowerCost || res.supplies < suppliesCost || res.industrialCapacity < industrialCost) {
        return s; // Not enough resources
      }

      // Deduct resources
      const newResources = { ...s.resources };
      newResources[s.currentPlayer] = {
        ...res,
        manpower: res.manpower - manpowerCost,
        supplies: res.supplies - suppliesCost,
        industrialCapacity: res.industrialCapacity - industrialCost,
      };

      const armyId = `army_${s.currentPlayer.slice(0, 3).toLowerCase()}_${Date.now()}`;
      const newArmy: Army = {
        id: armyId,
        faction: s.currentPlayer,
        provinceId,
        movesLeft: 0, // Recruited army cannot move immediately (EU style)
        manpower: totalManpower,
        maxManpower: totalManpower,
        composition: { ...comp },
        designedComposition: { ...comp },
        morale: 70, 
        militarization: s.currentPlayer === Faction.NATIONALIST ? 45 : 35,
      };

      return {
        ...s,
        resources: newResources,
        armies: [...s.armies, newArmy],
        history: [`Enabled mobilization in ${province.name}: +${comp.infantry} Inf, +${comp.artillery} Art, +${comp.tanks} Tanks in Division ${armyId.slice(-4).toUpperCase()}`, ...s.history].slice(0, 50),
        selectedProvinceId: provinceId,
      };
    });
  }, []);

  const reinforceArmy = useCallback((armyId: string) => {
    setState((s) => {
      const army = s.armies.find(a => a.id === armyId);
      if (!army || army.faction !== s.currentPlayer) return s;

      const province = s.provinces[army.provinceId];
      if (!province || province.owner !== s.currentPlayer) return s;

      // Calculate maximum possible 50% replenishment for each type based on losses
      const designedComp = army.designedComposition || army.composition;
      const maxInfRestored = Math.max(0, Math.floor((designedComp.infantry - army.composition.infantry) * 0.5));
      const maxArtRestored = Math.max(0, Math.floor((designedComp.artillery - army.composition.artillery) * 0.5));
      const maxTnkRestored = Math.max(0, Math.floor((designedComp.tanks - army.composition.tanks) * 0.5));

      const totalMaxRestored = maxInfRestored + maxArtRestored + maxTnkRestored;
      if (totalMaxRestored <= 0) return s; // Already at full strength

      // Base target costs for maximum possible 50% replenishment
      const targetManpower = totalMaxRestored;
      const targetSupplies = Math.floor(maxInfRestored * 0.03 + maxArtRestored * 0.06 + maxTnkRestored * 0.12);
      const targetIndustrial = Math.floor(maxArtRestored * 0.04 + maxTnkRestored * 0.08);

      const res = s.resources[s.currentPlayer];

      // Calculate replenishment scaling factor based on current resources available
      let scale = 1.0;
      if (res.manpower < targetManpower) {
        scale = Math.min(scale, res.manpower / targetManpower);
      }
      if (res.supplies < targetSupplies) {
        scale = Math.min(scale, res.supplies / targetSupplies);
      }
      if (res.industrialCapacity < targetIndustrial) {
        scale = Math.min(scale, res.industrialCapacity / targetIndustrial);
      }

      // Calculate final actual replenishment numbers safely
      const actualInf = Math.floor(maxInfRestored * scale);
      const actualArt = Math.floor(maxArtRestored * scale);
      const actualTnk = Math.floor(maxTnkRestored * scale);
      const actualTotal = actualInf + actualArt + actualTnk;

      if (actualTotal <= 0) return s; // Cannot afford even a single soldier

      // Deduct actual consumed resources
      const consumedManpower = actualTotal;
      const consumedSupplies = Math.floor(actualInf * 0.03 + actualArt * 0.06 + actualTnk * 0.12);
      const consumedIndustrial = Math.floor(actualArt * 0.04 + actualTnk * 0.08);

      const newResources = { ...s.resources };
      newResources[s.currentPlayer] = {
        ...res,
        manpower: Math.max(0, res.manpower - consumedManpower),
        supplies: Math.max(0, res.supplies - consumedSupplies),
        industrialCapacity: Math.max(0, res.industrialCapacity - consumedIndustrial),
      };

      // Boost morale by 20% of its current value: new morale = old morale + old morale * 0.20
      const moraleBonus = Math.floor(army.morale * 0.20);
      const nextMorale = Math.min(100, army.morale + moraleBonus);

      const newArmies = s.armies.map(a => {
        if (a.id === armyId) {
          return {
            ...a,
            composition: {
              infantry: a.composition.infantry + actualInf,
              artillery: a.composition.artillery + actualArt,
              tanks: a.composition.tanks + actualTnk,
            },
            manpower: a.manpower + actualTotal,
            morale: nextMorale,
          };
        }
        return a;
      });

      return {
        ...s,
        resources: newResources,
        armies: newArmies,
        history: [
          `Performed personnel supplement for Div. ${armyId.slice(-4).toUpperCase()}: +${actualTotal} troops (+${actualInf} Inf, +${actualArt} Art, +${actualTnk} Tnk). Morale boosted from ${army.morale}% to ${nextMorale}%.`,
          ...s.history
        ].slice(0, 50),
      };
    });
  }, []);

  const executeOffensive = useCallback((provinceId: string) => {
    return; 
  }, []);

  const mergeSelectedArmies = useCallback(() => {
    setState((s) => {
      if (s.selectedArmyIds.length <= 1) return s;

      // Filter armies that are currently selected and exist in the list
      const selectedArmies = s.armies.filter(a => s.selectedArmyIds.includes(a.id));
      if (selectedArmies.length <= 1) return s;

      // Verify they are all in the same province, of the same faction
      const baseProvinceId = selectedArmies[0].provinceId;
      const baseFaction = selectedArmies[0].faction;
      const allInSameProvinceAndFaction = selectedArmies.every(
        a => a.provinceId === baseProvinceId && a.faction === baseFaction
      );

      if (!allInSameProvinceAndFaction) return s;

      // We will merge everything into the first army of the selection
      const targetArmy = selectedArmies[0];
      const otherArmies = selectedArmies.slice(1);

      // Compute combined composition
      const combinedComposition = {
        infantry: selectedArmies.reduce((sum, a) => sum + a.composition.infantry, 0),
        artillery: selectedArmies.reduce((sum, a) => sum + a.composition.artillery, 0),
        tanks: selectedArmies.reduce((sum, a) => sum + a.composition.tanks, 0),
      };

      const combinedDesignedComposition = {
        infantry: selectedArmies.reduce((sum, a) => sum + (a.designedComposition?.infantry ?? a.composition.infantry), 0),
        artillery: selectedArmies.reduce((sum, a) => sum + (a.designedComposition?.artillery ?? a.composition.artillery), 0),
        tanks: selectedArmies.reduce((sum, a) => sum + (a.designedComposition?.tanks ?? a.composition.tanks), 0),
      };

      const totalManpower = selectedArmies.reduce((sum, a) => sum + a.manpower, 0);
      const totalMaxManpower = selectedArmies.reduce((sum, a) => sum + (a.maxManpower || a.manpower), 0);

      // Weighted averages
      let weightedMorale = targetArmy.morale;
      let weightedMilitarization = targetArmy.militarization;

      if (totalManpower > 0) {
        const sumMorale = selectedArmies.reduce((sum, a) => sum + (a.morale * a.manpower), 0);
        const sumMilitarization = selectedArmies.reduce((sum, a) => sum + (a.militarization * a.manpower), 0);
        weightedMorale = Math.round(sumMorale / totalManpower);
        weightedMilitarization = Math.round(sumMilitarization / totalManpower);
      }

      // Minimum moves left to prevent movement exploit
      const minMovesLeft = Math.min(...selectedArmies.map(a => a.movesLeft));

      // Construct the newly merged army
      const mergedArmy: Army = {
        ...targetArmy,
        manpower: totalManpower,
        maxManpower: totalMaxManpower,
        composition: combinedComposition,
        designedComposition: combinedDesignedComposition,
        morale: Math.min(100, Math.max(10, weightedMorale)),
        militarization: Math.min(100, Math.max(0, weightedMilitarization)),
        movesLeft: minMovesLeft,
      };

      // Create new armies list
      const otherSelectedIds = otherArmies.map(a => a.id);
      const newArmies = s.armies
        .map(a => (a.id === targetArmy.id ? mergedArmy : a))
        .filter(a => !otherSelectedIds.includes(a.id));

      const logMsg = `[Merger] Combined ${selectedArmies.length} divisions in ${s.provinces[baseProvinceId].name} into Division ${targetArmy.id.slice(-4).toUpperCase()} (Total: ${totalManpower.toLocaleString()} troops).`;

      return {
        ...s,
        armies: newArmies,
        selectedArmyId: targetArmy.id,
        selectedArmyIds: [targetArmy.id],
        history: [logMsg, ...s.history].slice(0, 50),
      };
    });
  }, []);

  return { state, selectProvince, selectArmy, endTurn, moveArmy, executeOffensive, recruitArmy, reinforceArmy, mergeSelectedArmies };
}
