/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProvinceMap } from './components/ProvinceMap';
import { useGameState } from './hooks/useGameState';

export default function App() {
  const { state, selectProvince, selectArmy, endTurn, moveArmy, executeOffensive } = useGameState();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#D7D2BF] overflow-hidden text-[#1A1A1A]">
      <Header 
        turn={state.turn} 
        date={state.date} 
        currentPlayer={state.currentPlayer} 
        resources={state.resources} 
        onEndTurn={endTurn}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Central Map Area */}
        <section className="flex-1 flex flex-col p-6 space-y-4 relative overflow-y-auto">
          <div className="flex justify-between items-end border-b-2 border-[#1A1A1A] pb-2">
            <div>
              <h2 className="text-4xl font-serif italic font-bold">Iberian Peninsula</h2>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Tactical Situation Map - Civil War Command</p>
            </div>
            <div className="flex flex-col items-end text-xs font-mono text-gray-600">
              <span>RESOLUTION: SCALE 1:1,000,000</span>
              <span>PROJECTION: MERCATOR</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden">
             <ProvinceMap 
              provinces={state.provinces} 
              armies={state.armies}
              selectedId={state.selectedProvinceId} 
              selectedArmyId={state.selectedArmyId}
              onSelect={selectProvince} 
              onSelectArmy={selectArmy}
              onMoveArmy={moveArmy}
            />
          </div>

          {/* Map Footer Decoration removed */}
        </section>

        {/* Tactical Info Panel */}
        <Sidebar 
          state={state} 
          onExecuteOffensive={executeOffensive} 
          onSelectProvince={selectProvince} 
        />
      </main>

      {/* Decorative Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]" />
    </div>
  );
}

