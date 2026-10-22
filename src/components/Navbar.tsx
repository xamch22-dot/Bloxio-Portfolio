import React from 'react';

export type AppView = 'portfolio' | 'previous-work' | 'inbox';

interface NavbarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onChangeView,
  onOpenBooking,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-[#070908]/80 backdrop-blur-md border-b border-white/10">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#overview"
        onClick={() => onChangeView('portfolio')}
        className="font-display text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
      >
        balo_xio
      </a>

      {/* Zone 2: 5 concise single-line text navigation links */}
      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400"
      >
        <a
          href="#overview"
          onClick={() => onChangeView('portfolio')}
          className={`hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'portfolio' ? 'text-white' : ''
          }`}
        >
          Overview
        </a>
        <button
          type="button"
          onClick={() => onChangeView('previous-work')}
          className={`hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'previous-work' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Previous Work (Demo)
        </button>
        <a
          href="#experience"
          onClick={() => onChangeView('portfolio')}
          className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Experience
        </a>
        <a
          href="#estimator"
          onClick={() => onChangeView('portfolio')}
          className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Estimator
        </a>
        <button
          type="button"
          onClick={() => onChangeView('inbox')}
          className={`hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'inbox' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Owner Inbox
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenBooking}
          className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Commission Me
        </button>
      </div>
    </header>
  );
};

