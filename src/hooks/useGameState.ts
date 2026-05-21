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
  history: ['The war has begun. Factional divisions have split Spain.'],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const selectProvince = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedProvinceId: id, selectedArmyId: null }));
  }, []);

  const selectArmy = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedArmyId: id, selectedProvinceId: null }));
  }, []);

  const endTurn = useCallback(() => {
    setState((s) => {
      const nextPlayer = s.currentPlayer === Faction.REPUBLICAN ? Faction.NATIONALIST : Faction.REPUBLICAN;
      const nextTurn = nextPlayer === Faction.REPUBLICAN ? s.turn + 1 : s.turn;
      
      const newResources = { ...s.resources };
      
      // Reset CP for the player who just finished (or just start of their turn?)
      // Usually CP is per turn. User said "每回合玩家有两点指挥点数".
      // I'll reset the NEXT player's CP when their turn starts.
      newResources[nextPlayer] = {
        ...newResources[nextPlayer],
        commandPoints: 2
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
        history: [`${s.date}: Turn passed to ${nextPlayer}. Command Points replenished.`, ...s.history].slice(0, 50),
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
        
        // Calculate Combat Power
        const getPower = (a: Army) => a.manpower * (a.morale / 100) * (1 + a.militarization / 100);
        const attackerPower = getPower(army) * (0.8 + Math.random() * 0.4);
        const defenderPower = getPower(defender) * (0.8 + Math.random() * 0.4);

        // Calculate Losses
        const attackerLosses = Math.floor(defenderPower * 0.15);
        const defenderLosses = Math.floor(attackerPower * 0.2);
        
        const attackerMoraleLoss = Math.floor(10 + (attackerLosses / army.manpower) * 100);
        const defenderMoraleLoss = Math.floor(15 + (defenderLosses / defender.manpower) * 100);

        newArmies = newArmies.map(a => {
          if (a.id === armyId) {
            return { 
              ...a, 
              manpower: Math.max(0, a.manpower - attackerLosses),
              morale: Math.max(10, a.morale - attackerMoraleLoss),
              movesLeft: 0 
            };
          }
          if (a.id === defender.id) {
            return { 
              ...a, 
              manpower: Math.max(0, a.manpower - defenderLosses),
              morale: Math.max(10, a.morale - defenderMoraleLoss) 
            };
          }
          return a;
        });

        // Remove destroyed armies
        newArmies = newArmies.filter(a => a.manpower > 100);

        const isVictory = defenderLosses > attackerLosses;
        const resultText = isVictory ? 'Victory' : 'Stalemate';
        newHistory.unshift(
          `BATTLE IN ${targetProvince.name.toUpperCase()}: ${resultText}. ` +
          `Attacker lost ${attackerLosses}, Defender lost ${defenderLosses}.`
        );

        // If defender defeated, allow movement and capture
        const defenderStillThere = newArmies.some(a => a.id === defender.id);
        if (!defenderStillThere) {
          newArmies = newArmies.map(a => a.id === armyId ? { ...a, provinceId: targetProvinceId } : a);
          newProvinces[targetProvinceId] = { ...targetProvince, owner: s.currentPlayer };
          newHistory.unshift(`${army.faction} forces have secured ${targetProvince.name} after defeating the enemy.`);
        }
      } else {
        // Normal move without combat
        newArmies = newArmies.map(a => 
          a.id === armyId ? { ...a, provinceId: targetProvinceId, movesLeft: a.movesLeft - 1 } : a
        );

        // Capture logic
        if (targetProvince.owner !== s.currentPlayer) {
          newProvinces[targetProvinceId] = { ...targetProvince, owner: s.currentPlayer };
          newHistory.unshift(`${army.faction} army moved to ${targetProvince.name} and established control.`);
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

  // Simplified executeOffensive to use CP if needed, or maybe just remove it as we use moveArmy now
  const executeOffensive = useCallback((provinceId: string) => {
    // For now, redirect or implement basic offensive logic if user wants direct attack without army
    // But user asked for EU4-like where armies move.
    // I'll keep it as a "Quick Attack" if they have an adjacent army.
    return; 
  }, []);

  return { state, selectProvince, selectArmy, endTurn, moveArmy, executeOffensive };
}
