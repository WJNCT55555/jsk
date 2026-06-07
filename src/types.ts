/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Faction {
  REPUBLICAN = 'REPUBLICAN',
  NATIONALIST = 'NATIONALIST',
  PORTUGAL = 'PORTUGAL',
  NEUTRAL = 'NEUTRAL',
}

export interface Province {
  id: string;
  name: string;
  owner: Faction;
  isCoastal: boolean;
  manpower: number;
  industry: number;
  strategicValue: number; // 0-10
  terrain: 'urban' | 'plains' | 'mountains' | 'forest';
  fortification: number; // 0-3
}

export interface GameState {
  turn: number;
  date: string;
  currentPlayer: Faction;
  resources: {
    [Faction.REPUBLICAN]: ResourceSet;
    [Faction.NATIONALIST]: ResourceSet;
    [Faction.PORTUGAL]: ResourceSet;
  };
  provinces: { [key: string]: Province };
  armies: Army[];
  selectedProvinceId: string | null;
  selectedArmyId: string | null;
  selectedArmyIds: string[];
  history: string[];
}

export interface ArmyComposition {
  infantry: number;   // Number of infantry soldiers
  artillery: number;  // Number of artillery crew/forces
  tanks: number;      // Number of tank forces
}

export interface Army {
  id: string;
  faction: Faction;
  provinceId: string;
  movesLeft: number; // Max 2 per turn
  manpower: number;  // Total troop count (infantry + artillery + tanks)
  maxManpower: number; // Designed max/total troop count
  composition: ArmyComposition; // Current composition
  designedComposition: ArmyComposition; // Designed composition
  morale: number;    // Fighting spirit (0-100)
  militarization: number; // Experience/Efficiency (0-100)
}

export interface ResourceSet {
  manpower: number;
  industrialCapacity: number;
  commandPoints: number; // 2 per turn
  supplies: number;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  condition: (state: GameState) => boolean;
  effect: (state: GameState) => GameState;
}
