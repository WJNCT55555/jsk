/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProvinceMap } from './components/ProvinceMap';
import { useGameState } from './hooks/useGameState';

export default function App() {
  const { state, selectProvince, selectArmy, endTurn, moveArmy, executeOffensive, recruitArmy, reinforceArmy, mergeSelectedArmies } = useGameState();

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
        <section className="flex-1 flex flex-col p-6 relative overflow-hidden">
          <div className="flex-1 flex items-center justify-center overflow-hidden">
             <ProvinceMap 
              provinces={state.provinces} 
              armies={state.armies}
              selectedId={state.selectedProvinceId} 
              selectedArmyId={state.selectedArmyId}
              selectedArmyIds={state.selectedArmyIds}
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
          onRecruitArmy={recruitArmy}
          onReinforceArmy={reinforceArmy}
          onSelectArmy={selectArmy}
          onMergeArmies={mergeSelectedArmies}
        />
      </main>

      {/* Decorative Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]" />
    </div>
  );
}

