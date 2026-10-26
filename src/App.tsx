/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar, AppView } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExperienceSection } from './components/ExperienceSection';
import { CommissionSection } from './components/CommissionSection';
import { PreviousWorkPage, PreviousWorkSubPage } from './components/PreviousWorkPage';
import { CommissionInput } from './utils/portfolioLogic';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('portfolio');
  const [demoSubPage, setDemoSubPage] = useState<PreviousWorkSubPage>('all');
  const [selectedDiscipline, setSelectedDiscipline] =
    useState<CommissionInput['disciplineId']>('all-rounder');

  const handleOpenDemoView = (subPage: PreviousWorkSubPage = 'all') => {
    setDemoSubPage(subPage);
    setActiveView('previous-work');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F1EA] flex flex-col">
      <Navbar
        activeView={activeView}
        onChangeView={(v) => {
          if (v === 'previous-work') setDemoSubPage('all');
          setActiveView(v);
        }}
      />

      <main className="flex-1">
        {activeView === 'previous-work' ? (
          <PreviousWorkPage
            initialSubPage={demoSubPage}
            onBackToPortfolio={() => setActiveView('portfolio')}
          />
        ) : (
          <>
            <HeroSection
              onOpenPreviousWork={() => handleOpenDemoView('all')}
            />

            <ExperienceSection
              onSelectDisciplineForEstimate={(id) =>
                setSelectedDiscipline(id as CommissionInput['disciplineId'])
              }
              onOpenDemoSection={(sub) => handleOpenDemoView(sub)}
            />

            <CommissionSection
              selectedDiscipline={selectedDiscipline}
              onChangeDiscipline={setSelectedDiscipline}
            />
          </>
        )}
      </main>

      <footer className="border-t border-white/10 py-10 px-6 lg:px-12 bg-[#070709]">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div>
            <span className="text-white font-semibold">balo_xio</span>
            <span aria-hidden="true" className="mx-2 text-zinc-600">/</span>
            <span>Scripter (3+ Yrs) · UI Designer (2+ Yrs) · Modeler (2+ Yrs) · Animator (1+ Yr)</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#overview"
              onClick={() => setActiveView('portfolio')}
              className="text-zinc-400 hover:text-white underline underline-offset-4"
            >
              Overview
            </a>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <button
              type="button"
              onClick={() => handleOpenDemoView('all')}
              className="text-zinc-400 hover:text-[#DFC08A] underline underline-offset-4 cursor-pointer"
            >
              Previous Work (Demo)
            </button>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <a
              href="#estimator"
              onClick={() => setActiveView('portfolio')}
              className="text-zinc-400 hover:text-white underline underline-offset-4"
            >
              Specification Ledger
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
