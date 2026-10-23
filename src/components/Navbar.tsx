import React from 'react';
import { playPageChangeSfx } from '../utils/sfxEngine';

export type AppView = 'portfolio' | 'previous-work';

interface NavbarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onChangeView,
}) => {
  const handleNavClick = (view: AppView) => {
    playPageChangeSfx();
    onChangeView(view);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-[#070908]/80 backdrop-blur-md border-b border-white/10">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#overview"
        data-sfx="page-change"
        onClick={() => handleNavClick('portfolio')}
        className="font-display text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
      >
        balo_xio
      </a>

      {/* Zone 2: 4 concise single-line text navigation links */}
      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400"
      >
        <a
          href="#overview"
          data-sfx="page-change"
          onClick={() => handleNavClick('portfolio')}
          className={`hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'portfolio' ? 'text-white' : ''
          }`}
        >
          Overview
        </a>
        <button
          type="button"
          data-sfx="page-change"
          onClick={() => handleNavClick('previous-work')}
          className={`hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'previous-work' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Previous Work (Demo)
        </button>
        <a
          href="#experience"
          data-sfx="page-change"
          onClick={() => handleNavClick('portfolio')}
          className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Experience
        </a>
        <a
          href="#estimator"
          data-sfx="page-change"
          onClick={() => handleNavClick('portfolio')}
          className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Estimator
        </a>
      </nav>
    </header>
  );
};



