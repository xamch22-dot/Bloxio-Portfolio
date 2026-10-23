/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar, AppView } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExperienceSection } from './components/ExperienceSection';
import { CommissionSection } from './components/CommissionSection';
import { BookingModal } from './components/BookingModal';
import { PrivateInboxPage } from './components/PrivateInboxPage';
import { PreviousWorkPage, PreviousWorkSubPage } from './components/PreviousWorkPage';
import { GoogleSitesExportModal } from './components/GoogleSitesExportModal';
import { CommissionInput, DisciplineId } from './utils/portfolioLogic';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('portfolio');
  const [demoSubPage, setDemoSubPage] = useState<PreviousWorkSubPage>('all');
  const [selectedDiscipline, setSelectedDiscipline] =
    useState<CommissionInput['disciplineId']>('all-rounder');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isGoogleSitesModalOpen, setIsGoogleSitesModalOpen] = useState(false);
  const [prefilledSummary, setPrefilledSummary] = useState('');
  const [inboxRefreshCount, setInboxRefreshCount] = useState(0);

  const handleOpenBooking = () => {
    setIsBookingOpen(true);
  };

  const handleOpenBookingWithSummary = (summary: string) => {
    setPrefilledSummary(summary);
    setIsBookingOpen(true);
  };

  const handleBookFromDemo = (discipline: DisciplineId, summary: string) => {
    setSelectedDiscipline(discipline);
    setPrefilledSummary(summary);
    setIsBookingOpen(true);
  };

  const handleOpenDemoView = (subPage: PreviousWorkSubPage = 'all') => {
    setDemoSubPage(subPage);
    setActiveView('previous-work');
  };

  return (
    <div className="min-h-screen bg-[#070908] text-zinc-100 flex flex-col">
      <Navbar
        activeView={activeView}
        onChangeView={(v) => {
          if (v === 'previous-work') setDemoSubPage('all');
          setActiveView(v);
        }}
        onOpenBooking={handleOpenBooking}
      />

      <main className="flex-1">
        {activeView === 'inbox' ? (
          <PrivateInboxPage
            onBackToPortfolio={() => setActiveView('portfolio')}
            refreshTrigger={inboxRefreshCount}
          />
        ) : activeView === 'previous-work' ? (
          <PreviousWorkPage
            initialSubPage={demoSubPage}
            onBackToPortfolio={() => setActiveView('portfolio')}
            onBookCommissionFromDemo={handleBookFromDemo}
          />
        ) : (
          <>
            <HeroSection
              onOpenBooking={handleOpenBooking}
              onOpenPreviousWork={() => handleOpenDemoView('all')}
            />

            <ExperienceSection
              onSelectDisciplineForEstimate={(id) => setSelectedDiscipline(id)}
              onOpenDemoSection={(sub) => handleOpenDemoView(sub)}
            />

            <CommissionSection
              selectedDiscipline={selectedDiscipline}
              onChangeDiscipline={setSelectedDiscipline}
              onOpenBookingWithSummary={handleOpenBookingWithSummary}
            />
          </>
        )}
      </main>

      <footer className="border-t border-white/10 py-10 px-6 lg:px-12 bg-[#070908]">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            <span className="text-white font-semibold">balo_xio portfolio</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Scripter (3+ Yrs) · UI Designer (2+ Yrs) · Modeler (2+ Yrs) · Animator (1+ Yr)</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleOpenDemoView('all')}
              className="text-zinc-400 hover:text-emerald-400 underline underline-offset-4 cursor-pointer"
            >
              Previous Work (Demo)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveView('inbox')}
              className="text-zinc-400 hover:text-emerald-400 underline underline-offset-4 cursor-pointer"
            >
              Private Owner Inbox
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsGoogleSitesModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-mono font-semibold underline underline-offset-4 cursor-pointer"
            >
              Export to Google Sites
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="/api/download-zip"
              download="balo_xio-portfolio.zip"
              className="text-zinc-300 hover:text-emerald-400 font-mono underline underline-offset-4"
            >
              Download Website (.zip)
            </a>
          </div>
        </div>
      </footer>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialDiscipline={selectedDiscipline}
        prefilledSummary={prefilledSummary}
        onCommissionSubmitted={() => setInboxRefreshCount((c) => c + 1)}
      />

      <GoogleSitesExportModal
        isOpen={isGoogleSitesModalOpen}
        onClose={() => setIsGoogleSitesModalOpen(false)}
      />
    </div>
  );
}


