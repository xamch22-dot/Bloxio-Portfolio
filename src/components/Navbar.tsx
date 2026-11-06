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
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 lg:px-12 h-16 bg-[#0B0C10]/85 backdrop-blur-xl border-b border-white/10">
      <a
        href="#overview"
        data-sfx="page-change"
        onClick={() => handleNavClick('portfolio')}
        className="font-display text-xl font-bold tracking-tight text-white hover:text-orange-300 transition-colors whitespace-nowrap shrink-0"
      >
        balo_xio
      </a>

      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400"
      >
        <a
          href="#overview"
          data-sfx="page-change"
          onClick={() => handleNavClick('portfolio')}
          className={`hover:text-orange-300 transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'portfolio'
              ? 'text-white font-semibold underline underline-offset-8 decoration-orange-400'
              : ''
          }`}
        >
          Overview
        </a>
        <button
          type="button"
          data-sfx="page-change"
          onClick={() => handleNavClick('previous-work')}
          className={`hover:text-orange-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'previous-work'
              ? 'text-orange-300 font-semibold underline underline-offset-8 decoration-orange-400'
              : ''
          }`}
        >
          Previous Work (Demo)
        </button>
        <a
          href="#experience"
          data-sfx="page-change"
          onClick={() => handleNavClick('portfolio')}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Experience
        </a>
        <a
          href="#estimator"
          data-sfx="page-change"
          onClick={() => handleNavClick('portfolio')}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Rate Calculator
        </a>
      </nav>

      <div className="hidden md:flex items-center shrink-0">
        <a
          href="#estimator"
          onClick={() => handleNavClick('portfolio')}
          className="px-4 py-2 text-xs font-semibold studio-btn-gradient rounded-lg transition-all whitespace-nowrap shrink-0"
        >
          Calculate Quote
        </a>
      </div>
    </header>
  );
};
