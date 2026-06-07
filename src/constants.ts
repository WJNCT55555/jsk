/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Faction, Province } from './types';

// Simplified SVG path data for a few key regions for initial setup
// In a real app, I would include all 50, but I'll focus on the core layout first.
// Comprehensive listing of Spanish provinces with historical ownership in July 1936
export const INITIAL_PROVINCES: { [key: string]: Province } = {
  // --- REPUBLICAN ZONE (Approx. July 1936) ---
  madrid: {
    id: 'madrid', name: 'Madrid', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 120, industry: 100, strategicValue: 10, terrain: 'urban', fortification: 2
  },
  barcelona: {
    id: 'barcelona', name: 'Barcelona', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 110, industry: 120, strategicValue: 10, terrain: 'urban', fortification: 1
  },
  valencia: {
    id: 'valencia', name: 'Valencia', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 80, industry: 60, strategicValue: 8, terrain: 'plains', fortification: 0
  },
  vizcaya: {
    id: 'vizcaya', name: 'Vizcaya', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 50, industry: 80, strategicValue: 7, terrain: 'urban', fortification: 1
  },
  guipuzcoa: {
    id: 'guipuzcoa', name: 'Guipúzcoa', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 40, industry: 50, strategicValue: 6, terrain: 'mountains', fortification: 0
  },
  asturias: {
    id: 'asturias', name: 'Asturias', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 60, industry: 70, strategicValue: 6, terrain: 'mountains', fortification: 1
  },
  santander: {
    id: 'santander', name: 'Santander', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 40, industry: 30, strategicValue: 5, terrain: 'mountains', fortification: 0
  },
  murcia: {
    id: 'murcia', name: 'Murcia', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 50, industry: 40, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  malaga: {
    id: 'malaga', name: 'Malaga', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 50, industry: 30, strategicValue: 6, terrain: 'urban', fortification: 0
  },
  alicante: {
    id: 'alicante', name: 'Alicante', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 45, industry: 35, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  gerona: {
    id: 'gerona', name: 'Gerona', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 30, industry: 10, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  lerida: {
    id: 'lerida', name: 'Lérida', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 30, industry: 15, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  tarragona: {
    id: 'tarragona', name: 'Tarragona', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 35, industry: 20, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  badajoz: {
    id: 'badajoz', name: 'Badajoz', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 45, industry: 15, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  almeria: {
    id: 'almeria', name: 'Almería', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 30, industry: 10, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  jaen: {
    id: 'jaen', name: 'Jaén', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 40, industry: 15, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  castellon: {
    id: 'castellon', name: 'Castellón', owner: Faction.REPUBLICAN,
    isCoastal: true, manpower: 35, industry: 15, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  albacete: {
    id: 'albacete', name: 'Albacete', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 30, industry: 10, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  ciudadreal: {
    id: 'ciudadreal', name: 'Ciudad Real', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 35, industry: 10, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  cuenca: {
    id: 'cuenca', name: 'Cuenca', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 25, industry: 5, strategicValue: 3, terrain: 'mountains', fortification: 0
  },
  guadalajara: {
    id: 'guadalajara', name: 'Guadalajara', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 25, industry: 10, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  toledo: {
    id: 'toledo', name: 'Toledo', owner: Faction.REPUBLICAN,
    isCoastal: false, manpower: 40, industry: 15, strategicValue: 6, terrain: 'plains', fortification: 2
  },

  // --- NATIONALIST ZONE (Approx. July 1936) ---
  burgos: {
    id: 'burgos', name: 'Burgos', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 40, industry: 20, strategicValue: 7, terrain: 'plains', fortification: 1
  },
  sevilla: {
    id: 'sevilla', name: 'Sevilla', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 90, industry: 50, strategicValue: 8, terrain: 'urban', fortification: 1
  },
  coruna: {
    id: 'coruna', name: 'La Coruña', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 50, industry: 30, strategicValue: 6, terrain: 'mountains', fortification: 0
  },
  lugo: {
    id: 'lugo', name: 'Lugo', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 35, industry: 10, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  orense: {
    id: 'orense', name: 'Orense', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 30, industry: 10, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  pontevedra: {
    id: 'pontevedra', name: 'Pontevedra', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 45, industry: 20, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  leon: {
    id: 'leon', name: 'León', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 45, industry: 25, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  zamora: {
    id: 'zamora', name: 'Zamora', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 30, industry: 10, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  salamanca: {
    id: 'salamanca', name: 'Salamanca', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 40, industry: 15, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  avila: {
    id: 'avila', name: 'Ávila', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 25, industry: 5, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  segovia: {
    id: 'segovia', name: 'Segovia', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 25, industry: 10, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  valladolid: {
    id: 'valladolid', name: 'Valladolid', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 50, industry: 40, strategicValue: 6, terrain: 'plains', fortification: 0
  },
  palencia: {
    id: 'palencia', name: 'Palencia', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 30, industry: 15, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  soria: {
    id: 'soria', name: 'Soria', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 20, industry: 5, strategicValue: 3, terrain: 'plains', fortification: 0
  },
  navarra: {
    id: 'navarra', name: 'Navarra', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 60, industry: 20, strategicValue: 7, terrain: 'mountains', fortification: 2
  },
  alava: {
    id: 'alava', name: 'Álava', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 30, industry: 25, strategicValue: 5, terrain: 'mountains', fortification: 0
  },
  rioja: {
    id: 'rioja', name: 'La Rioja', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 35, industry: 20, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  zaragoza: {
    id: 'zaragoza', name: 'Zaragoza', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 70, industry: 40, strategicValue: 8, terrain: 'urban', fortification: 1
  },
  huesca: {
    id: 'huesca', name: 'Huesca', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 25, industry: 10, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  teruel: {
    id: 'teruel', name: 'Teruel', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 20, industry: 5, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  caceres: {
    id: 'caceres', name: 'Cáceres', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 40, industry: 10, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  cadiz: {
    id: 'cadiz', name: 'Cádiz', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 50, industry: 30, strategicValue: 7, terrain: 'urban', fortification: 1
  },
  huelva: {
    id: 'huelva', name: 'Huelva', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 35, industry: 20, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  cordoba: {
    id: 'cordoba', name: 'Córdoba', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 60, industry: 20, strategicValue: 6, terrain: 'plains', fortification: 0
  },
  granada: {
    id: 'granada', name: 'Granada', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 50, industry: 20, strategicValue: 6, terrain: 'urban', fortification: 1
  },
  balears: {
    id: 'balears', name: 'Islas Baleares', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 30, industry: 10, strategicValue: 6, terrain: 'plains', fortification: 1
  },
  oviedo: {
    id: 'oviedo', name: 'Oviedo', owner: Faction.NATIONALIST, 
    isCoastal: false, manpower: 20, industry: 10, strategicValue: 4, terrain: 'urban', fortification: 2
  },
  ceuta: {
    id: 'ceuta', name: 'Ceuta', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 15, industry: 5, strategicValue: 6, terrain: 'urban', fortification: 1
  },
  melilla: {
    id: 'melilla', name: 'Melilla', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 15, industry: 5, strategicValue: 6, terrain: 'urban', fortification: 1
  },
  laspalmas: {
    id: 'laspalmas', name: 'Las Palmas', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 30, industry: 10, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  santacruzdetenerife: {
    id: 'santacruzdetenerife', name: 'Santa Cruz de Tenerife', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 30, industry: 10, strategicValue: 5, terrain: 'mountains', fortification: 0
  },
  // --- SPANISH MOROCCO (Protectorate) ---
  tetouan: {
    id: 'tetouan', name: 'Tétouan', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 40, industry: 15, strategicValue: 8, terrain: 'mountains', fortification: 1
  },
  larache: {
    id: 'larache', name: 'Larache', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 30, industry: 10, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  nador: {
    id: 'nador', name: 'Nador', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 35, industry: 10, strategicValue: 5, terrain: 'mountains', fortification: 0
  },
  chefchaouen: {
    id: 'chefchaouen', name: 'Chefchaouen', owner: Faction.NATIONALIST,
    isCoastal: false, manpower: 25, industry: 5, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  alhoceima: {
    id: 'alhoceima', name: 'Al Hoceïma', owner: Faction.NATIONALIST,
    isCoastal: true, manpower: 30, industry: 10, strategicValue: 6, terrain: 'mountains', fortification: 0
  },

  // --- PORTUGAL (Estado Novo) ---
  lisboa: {
    id: 'lisboa', name: 'Lisboa', owner: Faction.PORTUGAL,
    isCoastal: true, manpower: 100, industry: 80, strategicValue: 10, terrain: 'urban', fortification: 1
  },
  porto: {
    id: 'porto', name: 'Porto', owner: Faction.PORTUGAL,
    isCoastal: true, manpower: 80, industry: 70, strategicValue: 8, terrain: 'urban', fortification: 0
  },
  setubal: {
    id: 'setubal', name: 'Setúbal', owner: Faction.PORTUGAL,
    isCoastal: true, manpower: 40, industry: 50, strategicValue: 6, terrain: 'plains', fortification: 0
  },
  coimbra: {
    id: 'coimbra', name: 'Coimbra', owner: Faction.PORTUGAL,
    isCoastal: true, manpower: 35, industry: 20, strategicValue: 5, terrain: 'mountains', fortification: 0
  },
  faro: {
    id: 'faro', name: 'Faro', owner: Faction.PORTUGAL,
    isCoastal: true, manpower: 30, industry: 15, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  beja: {
    id: 'beja', name: 'Beja', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 25, industry: 10, strategicValue: 3, terrain: 'plains', fortification: 0
  },
  evora: {
    id: 'evora', name: 'Évora', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 25, industry: 10, strategicValue: 3, terrain: 'plains', fortification: 0
  },
  portalegre: {
    id: 'portalegre', name: 'Portalegre', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 20, industry: 5, strategicValue: 3, terrain: 'mountains', fortification: 0
  },
  aveiro: {
    id: 'aveiro', name: 'Aveiro', owner: Faction.PORTUGAL,
    isCoastal: true, manpower: 45, industry: 30, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  braga: {
    id: 'braga', name: 'Braga', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 50, industry: 40, strategicValue: 6, terrain: 'mountains', fortification: 0
  },
  braganca: {
    id: 'braganca', name: 'Bragança', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 20, industry: 5, strategicValue: 3, terrain: 'mountains', fortification: 0
  },
  castelobranco: {
    id: 'castelobranco', name: 'Castelo Branco', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 25, industry: 10, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
  guarda: {
    id: 'guarda', name: 'Guarda', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 20, industry: 5, strategicValue: 3, terrain: 'mountains', fortification: 0
  },
  leiria: {
    id: 'leiria', name: 'Leiria', owner: Faction.PORTUGAL,
    isCoastal: true, manpower: 40, industry: 25, strategicValue: 5, terrain: 'plains', fortification: 0
  },
  santarem: {
    id: 'santarem', name: 'Santarém', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 35, industry: 20, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  vianadocastelo: {
    id: 'vianadocastelo', name: 'Viana do Castelo', owner: Faction.PORTUGAL,
    isCoastal: true, manpower: 30, industry: 15, strategicValue: 4, terrain: 'plains', fortification: 0
  },
  vilareal: {
    id: 'vilareal', name: 'Vila Real', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 25, industry: 10, strategicValue: 3, terrain: 'mountains', fortification: 0
  },
  viseu: {
    id: 'viseu', name: 'Viseu', owner: Faction.PORTUGAL,
    isCoastal: false, manpower: 30, industry: 15, strategicValue: 4, terrain: 'mountains', fortification: 0
  },
};

export const PROVINCE_ADJACENCY: { [key: string]: string[] } = {
  madrid: ['toledo', 'guadalajara', 'cuenca', 'avila', 'segovia'],
  barcelona: ['tarragona', 'lerida', 'gerona'],
  valencia: ['castellon', 'alicante', 'cuenca', 'teruel', 'albacete'],
  sevilla: ['huelva', 'cadiz', 'malaga', 'cordoba', 'badajoz'],
  burgos: ['santander', 'vizcaya', 'alava', 'rioja', 'soria', 'segovia', 'valladolid', 'palencia'],
  vizcaya: ['santander', 'guipuzcoa', 'alava', 'burgos'],
  zaragoza: ['huesca', 'lerida', 'tarragona', 'teruel', 'guadalajara', 'soria', 'rioja', 'navarra'],
  badajoz: ['caceres', 'toledo', 'ciudadreal', 'cordoba', 'sevilla', 'huelva', 'evora'],
  toledo: ['madrid', 'avila', 'caceres', 'badajoz', 'ciudadreal', 'cuenca'],
  burgos_adjacent: ['burgos'], // Helper
  // Add more systematically for core regions
  huelva: ['sevilla', 'badajoz', 'faro', 'beja'],
  cadiz: ['sevilla', 'malaga'],
  malaga: ['cadiz', 'sevilla', 'cordoba', 'granada'],
  granada: ['malaga', 'cordoba', 'jaen', 'almeria', 'murcia'],
  cordoba: ['badajoz', 'sevilla', 'malaga', 'granada', 'jaen', 'ciudadreal'],
  jaen: ['cordoba', 'granada', 'almeria', 'murcia', 'albacete', 'ciudadreal'],
  almeria: ['granada', 'jaen', 'murcia'],
  murcia: ['almeria', 'jaen', 'albacete', 'alicante'],
  alicante: ['valencia', 'albacete', 'murcia'],
  albacete: ['valencia', 'cuenca', 'ciudadreal', 'jaen', 'murcia', 'alicante'],
  ciudadreal: ['toledo', 'badajoz', 'cordoba', 'jaen', 'albacete', 'cuenca'],
  cuenca: ['madrid', 'guadalajara', 'teruel', 'valencia', 'albacete', 'ciudadreal', 'toledo'],
  guadalajara: ['madrid', 'segovia', 'soria', 'zaragoza', 'teruel', 'cuenca'],
  segovia: ['madrid', 'avila', 'valladolid', 'burgos', 'guadalajara'],
  avila: ['madrid', 'segovia', 'valladolid', 'salamanca', 'caceres', 'toledo'],
  caceres: ['avila', 'salamanca', 'badajoz', 'toledo', 'portalegre', 'castelobranco'],
  salamanca: ['avila', 'valladolid', 'zamora', 'caceres', 'guarda'],
  zamora: ['salamanca', 'valladolid', 'leon', 'orense', 'braganca'],
  valladolid: ['segovia', 'avila', 'salamanca', 'zamora', 'leon', 'palencia', 'burgos'],
  palencia: ['burgos', 'valladolid', 'leon', 'santander'],
  leon: ['palencia', 'valladolid', 'zamora', 'orense', 'lugo', 'asturias', 'santander'],
  asturias: ['leon', 'lugo', 'santander', 'oviedo'],
  santander: ['asturias', 'leon', 'palencia', 'burgos', 'vizcaya'],
  guipuzcoa: ['vizcaya', 'alava', 'navarra'],
  alava: ['vizcaya', 'guipuzcoa', 'navarra', 'rioja', 'burgos'],
  navarra: ['guipuzcoa', 'alava', 'rioja', 'zaragoza', 'huesca'],
  rioja: ['burgos', 'alava', 'navarra', 'zaragoza', 'soria'],
  soria: ['burgos', 'rioja', 'zaragoza', 'guadalajara'],
  huesca: ['navarra', 'zaragoza', 'lerida'],
  lerida: ['huesca', 'zaragoza', 'tarragona', 'barcelona', 'gerona'],
  gerona: ['barcelona', 'lerida'],
  tarragona: ['barcelona', 'lerida', 'zaragoza', 'teruel', 'castellon'],
  teruel: ['zaragoza', 'tarragona', 'castellon', 'valencia', 'cuenca', 'guadalajara'],
  castellon: ['tarragona', 'teruel', 'valencia'],
  coruna: ['lugo', 'pontevedra'],
  lugo: ['coruna', 'orense', 'leon', 'asturias', 'pontevedra'],
  orense: ['lugo', 'pontevedra', 'zamora', 'leon', 'braganca', 'vilareal'],
  pontevedra: ['coruna', 'lugo', 'orense', 'vianadocastelo'],
};

export const INITIAL_ARMIES = [
  { id: 'rep_1', faction: Faction.REPUBLICAN, provinceId: 'madrid', movesLeft: 2, manpower: 5000, maxManpower: 5000, composition: { infantry: 3000, artillery: 1500, tanks: 500 }, designedComposition: { infantry: 3000, artillery: 1500, tanks: 500 }, morale: 80, militarization: 40 },
  { id: 'rep_2', faction: Faction.REPUBLICAN, provinceId: 'barcelona', movesLeft: 2, manpower: 4500, maxManpower: 4500, composition: { infantry: 3000, artillery: 1000, tanks: 500 }, designedComposition: { infantry: 3000, artillery: 1000, tanks: 500 }, morale: 85, militarization: 35 },
  { id: 'rep_3', faction: Faction.REPUBLICAN, provinceId: 'valencia', movesLeft: 2, manpower: 3000, maxManpower: 3000, composition: { infantry: 2000, artillery: 1000, tanks: 0 }, designedComposition: { infantry: 2000, artillery: 1000, tanks: 0 }, morale: 75, militarization: 30 },
  { id: 'nat_1', faction: Faction.NATIONALIST, provinceId: 'burgos', movesLeft: 2, manpower: 6000, maxManpower: 6000, composition: { infantry: 4000, artillery: 1000, tanks: 1000 }, designedComposition: { infantry: 4000, artillery: 1000, tanks: 1000 }, morale: 70, militarization: 50 },
  { id: 'nat_2', faction: Faction.NATIONALIST, provinceId: 'sevilla', movesLeft: 2, manpower: 5500, maxManpower: 5500, composition: { infantry: 3500, artillery: 1500, tanks: 500 }, designedComposition: { infantry: 3500, artillery: 1500, tanks: 500 }, morale: 75, militarization: 55 },
  { id: 'nat_3', faction: Faction.NATIONALIST, provinceId: 'zaragoza', movesLeft: 2, manpower: 4000, maxManpower: 4000, composition: { infantry: 3000, artillery: 1000, tanks: 0 }, designedComposition: { infantry: 3000, artillery: 1000, tanks: 0 }, morale: 65, militarization: 45 },
  { id: 'nat_morocco', faction: Faction.NATIONALIST, provinceId: 'tetouan', movesLeft: 2, manpower: 8000, maxManpower: 8000, composition: { infantry: 5000, artillery: 2000, tanks: 1000 }, designedComposition: { infantry: 5000, artillery: 2000, tanks: 1000 }, morale: 90, militarization: 70 },
];

export const FACTION_COLORS = {
  [Faction.REPUBLICAN]: '#6F4C8E', // Desaturated Purple (Historical look)
  [Faction.NATIONALIST]: '#E2B04E', // Earthy Yellow (Historical look)
  [Faction.PORTUGAL]: '#738C6C', // Sage Green
  [Faction.NEUTRAL]: '#D4C9B3', // Beige/Parchment
};

export const UI_COLORS = {
  paper: '#E6E2D3',
  ocean: '#9EBAC1', // More distinct light blue ocean
  ink: '#2A2621',
  accent: '#A67C52', // Brassy/Bronze
};

export const MAJOR_CITIES = [
  { name: 'Madrid', coords: [-3.7038, 40.4168], isCapital: true },
  { name: 'Barcelona', coords: [2.1734, 41.3851] },
  { name: 'Valencia', coords: [-0.3763, 39.4699] },
  { name: 'Sevilla', coords: [-5.9845, 37.3891] },
  { name: 'Zaragoza', coords: [-0.8891, 41.6488] },
  { name: 'Bilbao', coords: [-2.9350, 43.2630] },
  { name: 'Málaga', coords: [-4.4203, 36.7213] },
  { name: 'Lisboa', coords: [-9.1393, 38.7223], isCapital: true },
  { name: 'Porto', coords: [-8.6291, 41.1579] },
  { name: 'A Coruña', coords: [-8.4115, 43.3623] },
  { name: 'Burgos', coords: [-3.6969, 42.3439] },
  { name: 'Granada', coords: [-3.5986, 37.1773] },
  { name: 'Cartagena', coords: [-0.9821, 37.6051] },
  { name: 'Badajoz', coords: [-6.9706, 38.8794] },
  { name: 'Oviedo', coords: [-5.8448, 43.3614] },
  { name: 'Palma', coords: [2.6502, 39.5696] },
];
