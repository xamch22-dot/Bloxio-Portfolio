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
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 lg:px-12 h-16 bg-[#09090B]/90 backdrop-blur-md border-b border-white/10">
      <a
        href="#overview"
        data-sfx="page-change"
        onClick={() => handleNavClick('portfolio')}
        className="font-display text-lg font-bold tracking-tight text-white hover:text-[#DFC08A] transition-colors whitespace-nowrap shrink-0 flex items-baseline gap-2.5"
      >
        <span>balo_xio</span>
        <span className="hidden sm:inline-block font-mono text-[11px] font-normal uppercase tracking-widest text-zinc-500">
          / Studio
        </span>
      </a>

      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400"
      >
        <a
          href="#overview"
          data-sfx="page-change"
          onClick={() => handleNavClick('portfolio')}
          className={`hover:text-[#DFC08A] transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'portfolio'
              ? 'text-white font-semibold underline underline-offset-8 decoration-[#DFC08A]'
              : ''
          }`}
        >
          Overview
        </a>
        <button
          type="button"
          data-sfx="page-change"
          onClick={() => handleNavClick('previous-work')}
          className={`hover:text-[#DFC08A] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'previous-work'
              ? 'text-[#DFC08A] font-semibold underline underline-offset-8 decoration-[#DFC08A]'
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
          Estimator
        </a>
      </nav>

      <div className="hidden md:flex items-center shrink-0">
        <a
          href="#estimator"
          onClick={() => handleNavClick('portfolio')}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold studio-btn-gradient rounded-sm transition-all whitespace-nowrap"
        >
          Configure Quote
        </a>
      </div>
    </header>
  );
};
