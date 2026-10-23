import React from 'react';
import { DISCIPLINE_EXPERIENCES, DisciplineExperience } from '../utils/portfolioLogic';
import { ArrowUpRight } from 'lucide-react';

interface ExperienceSectionProps {
  onSelectDisciplineForEstimate: (id: DisciplineExperience['id'] | 'all-rounder') => void;
  onOpenDemoSection?: (
    subPage: 'scripting' | 'animating' | 'ui-design' | 'modeling'
  ) => void;
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
      {/* Editorial Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
        <div className="max-w-2xl">
          <p className="text-xs font-mono text-emerald-400 mb-3">01. Experience & Specializations</p>
          <h2
            id="experience-heading"
            className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance"
          >
            Four Core Disciplines. One All-Rounder Developer.
          </h2>
          <p className="mt-4 text-base text-zinc-400 leading-relaxed">
            With 3+ years in scripting, 2+ years in UI design, 2+ years in 3D modeling, and 1+ year in
            animation, I handle standalone tasks or complete multi-discipline Roblox commissions.
          </p>
        </div>

        <a
          href="#estimator"
          onClick={() => onSelectDisciplineForEstimate('all-rounder')}
          className="inline-flex items-center gap-2 text-sm font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-4 whitespace-nowrap shrink-0"
        >
          <span>Book as All-Rounder</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* 2x2 Architectural Hairline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/10">
        {DISCIPLINE_EXPERIENCES.map((disc, idx) => (
          <article
            key={disc.id}
            className={`py-10 border-b border-white/10 flex flex-col justify-between ${
              idx % 2 === 0 ? 'md:pr-10 md:border-r md:border-white/10' : 'md:pl-10'
            }`}
          >
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-emerald-400 tabular-nums">
                    {disc.index}.
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    {disc.title}
                  </h3>
                </div>

                <span className="font-display text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
                  {disc.yearsDisplay}
                </span>
              </div>

              <p className="mt-3 text-base font-medium text-zinc-200">{disc.headline}</p>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{disc.description}</p>

              {/* Unboxed deliverables separated by middle dots */}
              <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-mono text-zinc-300">
                {disc.deliverables.map((item, i) => (
                  <React.Fragment key={item}>
                    <span>{item}</span>
                    {i < disc.deliverables.length - 1 && (
                      <span aria-hidden="true" className="text-emerald-500">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="font-mono text-zinc-400">{disc.tools}</span>
              <div className="flex items-center gap-4">
                {onOpenDemoSection && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenDemoSection(
                        disc.id as 'scripting' | 'animating' | 'ui-design' | 'modeling'
                      )
                    }
                    className="inline-flex items-center gap-1 font-mono font-medium text-zinc-200 hover:text-emerald-400 underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>
                      {disc.id === 'scripting'
                        ? 'Scripting Work Demo'
                        : disc.id === 'animating'
                        ? 'Animation Work Demo'
                        : disc.id === 'ui-design'
                        ? 'UI Design Demo'
                        : '3D Modeling Demo'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href="#estimator"
                  onClick={() =>
                    onSelectDisciplineForEstimate(disc.id as DisciplineExperience['id'])
                  }
                  className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Select {disc.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};




