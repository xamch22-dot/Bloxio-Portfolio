import React from 'react';
import {
  DISCIPLINE_EXPERIENCES,
  DISCIPLINE_PRICING_TABLE,
  DisciplineExperience,
} from '../utils/portfolioLogic';
import { ArrowUpRight } from 'lucide-react';

interface ExperienceSectionProps {
  onSelectDisciplineForEstimate: (id: DisciplineExperience['id']) => void;
  onOpenDemoSection?: (subPage: 'scripting' | 'ui-design') => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  onSelectDisciplineForEstimate,
  onOpenDemoSection,
}) => {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="py-20 lg:py-28 px-6 lg:px-12 max-w-[1280px] mx-auto border-b border-white/10"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-orange-300 mb-2">
            01. Core Disciplines &amp; Verified Tenure
          </p>
          <h2
            id="experience-heading"
            className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance"
          >
            Two Core Specializations. <span className="pro-gradient-text">Built for Production.</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed">
            With 3+ years in Luau scripting and 2+ years in custom Roblox UI design, you can book a
            single isolated task on a <strong className="text-white">Per Task</strong> basis or
            scale up to a Short-Term or Long-Term package.
          </p>
        </div>

        <a
          href="#estimator"
          onClick={() => onSelectDisciplineForEstimate('scripting')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-orange-300 hover:text-white underline underline-offset-8 whitespace-nowrap shrink-0"
        >
          <span>Configure Per-Task Quote</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DISCIPLINE_EXPERIENCES.map((disc) => {
          const perTaskPrice = DISCIPLINE_PRICING_TABLE[
            disc.id as keyof typeof DISCIPLINE_PRICING_TABLE
          ]?.commission ?? { usdTotal: 15, robuxTotal: 5000 };

          return (
            <article
              key={disc.id}
              className="p-7 sm:p-8 rounded-2xl border border-white/15 studio-card-surface flex flex-col justify-between"
            >
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    <span className="text-orange-300 font-mono text-base mr-2">{disc.index}.</span>
                    {disc.title}
                  </h3>

                  <span className="font-display text-xl sm:text-2xl font-bold pro-gradient-text tabular-nums">
                    {disc.yearsDisplay}
                  </span>
                </div>

                <p className="mt-3 text-base font-semibold text-zinc-100">{disc.headline}</p>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{disc.description}</p>

                <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-medium text-zinc-300">
                  {disc.deliverables.map((item, i) => (
                    <React.Fragment key={item}>
                      <span>{item}</span>
                      {i < disc.deliverables.length - 1 && (
                        <span aria-hidden="true" className="text-orange-400">
                          ·
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{disc.tools}</span>
                  <span className="font-mono font-semibold text-orange-300 tabular-nums">
                    Per Task: ${perTaskPrice.usdTotal} /{' '}
                    {perTaskPrice.robuxTotal.toLocaleString('en-US')} R$
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 text-xs font-semibold">
                  {onOpenDemoSection && (
                    <button
                      type="button"
                      onClick={() => onOpenDemoSection(disc.id as 'scripting' | 'ui-design')}
                      className="inline-flex items-center gap-1 text-zinc-200 hover:text-orange-300 underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>
                        {disc.id === 'scripting' ? 'Scripting Work Demo' : 'UI Design Demo'}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a
                    href="#estimator"
                    onClick={() =>
                      onSelectDisciplineForEstimate(disc.id as DisciplineExperience['id'])
                    }
                    className="inline-flex items-center gap-1 text-orange-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Calculate Per-Task Quote</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
