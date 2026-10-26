import React, { useState } from 'react';
import {
  calculateCommissionBreakdown,
  getPricingTiersForDiscipline,
  DISCIPLINE_PRICING_TABLE,
  CommissionInput,
  ContractType,
  CurrencyMode,
} from '../utils/portfolioLogic';
import { Check, Copy } from 'lucide-react';

interface CommissionSectionProps {
  selectedDiscipline: CommissionInput['disciplineId'];
  onChangeDiscipline: (id: CommissionInput['disciplineId']) => void;
}

const ROLE_OPTIONS: Array<{
  id: CommissionInput['disciplineId'];
  index: string;
  label: string;
  sub: string;
  tenure: string;
}> = [
  {
    id: 'all-rounder',
    index: '01',
    label: 'Full Pack (All-Rounder)',
    sub: 'Scripting + UI + 3D + Animation',
    tenure: 'Complete Studio Pipeline',
  },
  {
    id: 'scripting',
    index: '02',
    label: 'Scripting Systems',
    sub: 'Luau Frameworks, Combat & DataStores',
    tenure: '3+ Years Experience',
  },
  {
    id: 'ui-design',
    index: '03',
    label: 'UI Design & HUDs',
    sub: 'Responsive Scale Layouts & Motion',
    tenure: '2+ Years Experience',
  },
  {
    id: 'modeling',
    index: '04',
    label: '3D Modeling',
    sub: 'Hard-Surface Weapons & Environment Assets',
    tenure: '2+ Years Experience',
  },
  {
    id: 'animating',
    index: '05',
    label: 'Keyframe Animation',
    sub: 'Moon Animator 2 R6 & R15 Combat Rigs',
    tenure: '1+ Year Experience',
  },
];

export const CommissionSection: React.FC<CommissionSectionProps> = ({
  selectedDiscipline,
  onChangeDiscipline,
}) => {
  const [contractType, setContractType] = useState<ContractType>('commission');
  const [currency, setCurrency] = useState<CurrencyMode>('USD');
  const [copiedBrief, setCopiedBrief] = useState(false);

  const activeTiers = getPricingTiersForDiscipline(selectedDiscipline);
  const estimate = calculateCommissionBreakdown({
    disciplineId: selectedDiscipline,
    contractType,
    currency,
  });

  const handleCopyBrief = () => {
    navigator.clipboard?.writeText(estimate.summaryText).catch(() => {});
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-20 lg:py-28 space-y-24">
      {/* Section 02: Editorial Commission Terms & Discipline Pricing */}
      <section id="commission-terms" aria-labelledby="terms-heading">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[#DFC08A] mb-3">
              02 / Commission Policy &amp; Rate Schedule
            </p>
            <h2
              id="terms-heading"
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance"
            >
              Fixed Studio Rates. <span className="pro-gradient-text">40% Upfront.</span> Zero
              Revenue Share.
            </h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed">
              Every engagement with <strong className="text-white">balo_xio</strong> operates on
              fixed, transparent rates in USD or Robux—with a mandatory 40% upfront commencement
              deposit and strictly 0% revenue share.
            </p>
          </div>

          <div className="lg:col-span-7 divide-y divide-white/10 border-y border-white/10">
            {(
              [
                { id: 'all-rounder', index: '01', name: 'Full Pack (All-Rounder)' },
                { id: 'scripting', index: '02', name: 'Scripting' },
                { id: 'modeling', index: '03', name: '3D Modeling' },
                { id: 'animating', index: '04', name: 'Animation' },
                { id: 'ui-design', index: '05', name: 'UI Design' },
              ] as const
            ).map((row) => {
              const p = DISCIPLINE_PRICING_TABLE[row.id];
              return (
                <div
                  key={row.id}
                  className="py-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3"
                >
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                      {row.index} / {row.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-zinc-400">
                      Single:{' '}
                      <span className="text-white">
                        ${p.commission.usdTotal} / {p.commission.robuxTotal.toLocaleString('en-US')} R$
                      </span>
                      {' · '}Short-Term:{' '}
                      <span className="text-white">
                        ${p['short-term'].usdTotal} /{' '}
                        {p['short-term'].robuxTotal.toLocaleString('en-US')} R$
                      </span>
                      {' · '}Long-Term:{' '}
                      <span className="text-[#DFC08A] font-semibold">
                        ${p['long-term'].usdTotal} /{' '}
                        {p['long-term'].robuxTotal.toLocaleString('en-US')} R$
                      </span>
                    </p>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#DFC08A] whitespace-nowrap shrink-0">
                    40% Upfront
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 03: Architectural Specification & 40% Upfront Ledger */}
      <section id="estimator" aria-labelledby="estimator-heading">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#DFC08A] mb-3">
              03 / Interactive Specification &amp; Split-Payment Ledger
            </p>
            <h2
              id="estimator-heading"
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white"
            >
              Commission <span className="pro-gradient-text">Specification Studio.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl">
              Select a technical track, contract scope, and settlement currency to calculate your
              exact 40% commencement deposit and 60% delivery balance.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              Settlement Currency
            </span>
            <div className="inline-flex items-center border border-white/15 bg-[#0C0C0E]">
              {(['USD', 'ROBUX'] as CurrencyMode[]).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    currency === curr ? 'studio-btn-gradient' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {curr === 'USD' ? 'USD ($)' : 'Robux (R$)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-white/15 bg-[#0B0B0E] grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/15">
          {/* Left 7 Columns: Specification Matrix */}
          <div className="lg:col-span-7 flex flex-col justify-between divide-y divide-white/15">
            <div>
              <div className="px-6 py-3.5 bg-[#101014] border-b border-white/10 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                <span>Step 01 // Select Technical Discipline</span>
                <span className="text-[#DFC08A]">5 Studio Tracks</span>
              </div>
              <div className="divide-y divide-white/10">
                {ROLE_OPTIONS.map((role) => {
                  const isActive = selectedDiscipline === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => onChangeDiscipline(role.id)}
                      className={`w-full px-6 py-4 text-left transition-all cursor-pointer flex items-center justify-between gap-4 border-l-2 ${
                        isActive
                          ? 'border-[#DFC08A] studio-active-row text-white'
                          : 'border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-baseline gap-4 min-w-0">
                        <span
                          className={`font-mono text-xs tabular-nums ${
                            isActive ? 'text-[#DFC08A] font-semibold' : 'text-zinc-500'
                          }`}
                        >
                          {role.index}
                        </span>
                        <div className="min-w-0">
                          <div
                            className={`font-display text-base font-bold ${
                              isActive ? 'text-white' : 'text-zinc-200'
                            }`}
                          >
                            {role.label}
                          </div>
                          <div
                            className={`text-xs font-mono ${
                              isActive ? 'text-zinc-300' : 'text-zinc-500'
                            } mt-0.5 truncate`}
                          >
                            {role.sub}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-4">
                        <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500">
                          {role.tenure}
                        </span>
                        <span
                          className={`font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 border ${
                            isActive
                              ? 'border-[#DFC08A] text-[#DFC08A] bg-[#DFC08A]/10 font-semibold'
                              : 'border-white/10 text-zinc-500'
                          }`}
                        >
                          {isActive ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="px-6 py-3.5 bg-[#101014] border-b border-white/10 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                <span>Step 02 // Select Engagement Scope</span>
                <span>Fixed Rate · 0% Rev-Share</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                {(Object.values(activeTiers) as (typeof activeTiers)[ContractType][]).map(
                  (tier, idx) => {
                    const isActive = contractType === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setContractType(tier.id)}
                        className={`relative p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isActive
                            ? 'studio-active-cell text-white'
                            : 'bg-transparent text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute top-0 inset-x-0 h-[2px] studio-btn-gradient" />
                        )}
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`font-mono text-[11px] uppercase tracking-widest ${
                                isActive ? 'text-[#DFC08A]' : 'text-zinc-500'
                              }`}
                            >
                              Scope 0{idx + 1}
                            </span>
                            {isActive && (
                              <span className="font-mono text-[10px] uppercase tracking-widest text-[#DFC08A]">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="font-display text-base font-bold text-white mt-1.5">
                            {tier.label}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {tier.subtitle}
                          </div>
                        </div>
                        <div
                          className={`font-mono text-xs font-semibold ${
                            isActive ? 'text-[#DFC08A]' : 'text-zinc-300'
                          } mt-5 pt-3 border-t border-white/10 tabular-nums`}
                        >
                          ${tier.usdTotal} USD / {tier.robuxTotal.toLocaleString('en-US')} R$
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Official Statement of Work & 40% Upfront Ledger */}
          <div className="lg:col-span-5 flex flex-col justify-between studio-surface-gradient">
            <div>
              <div className="px-6 sm:px-8 py-3.5 bg-[#101014] border-b border-white/10 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                <span>Statement of Work</span>
                <span className="text-[#DFC08A]">Ref // BALO-40-60</span>
              </div>

              <div className="p-6 sm:p-8 border-b border-white/10 flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-[#DFC08A] font-semibold">
                    {estimate.contractLabel.toUpperCase()}
                  </div>
                  <div
                    data-testid="estimate-total"
                    className="font-display text-5xl sm:text-6xl font-bold text-white mt-2 tabular-nums tracking-tight"
                  >
                    {estimate.currencySymbol}
                    {estimate.totalAmount.toLocaleString('en-US')}
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-2 tabular-nums">
                    (${estimate.usdEquivalent} USD /{' '}
                    {estimate.robuxEquivalent.toLocaleString('en-US')} Robux)
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                    Est. Turnaround
                  </div>
                  <div className="font-mono text-sm font-semibold text-white mt-1 tabular-nums">
                    {estimate.estimatedDelivery}
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-5 border-b border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
                  <span className="text-[#DFC08A] font-semibold">40% Upfront Commencement</span>
                  <span className="text-zinc-400">60% Upon Delivery</span>
                </div>
                <div className="h-2 w-full bg-[#16161A] flex overflow-hidden">
                  <div className="w-[40%] h-full studio-btn-gradient" />
                  <div className="w-[60%] h-full bg-zinc-800 border-l border-[#09090B]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-b border-white/10">
                <div className="p-6 sm:p-7 studio-active-cell flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[#DFC08A] font-semibold">
                      Milestone 01 // 40%
                    </div>
                    <div className="text-xs text-zinc-300 mt-1">Upfront deposit to start</div>
                  </div>
                  <div
                    data-testid="estimate-upfront"
                    className="font-display text-3xl sm:text-4xl font-bold text-white mt-4 tabular-nums"
                  >
                    {estimate.currencySymbol}
                    {estimate.upfrontAmount.toLocaleString('en-US')}
                  </div>
                </div>

                <div className="p-6 sm:p-7 bg-[#0B0B0E]/60 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                      Milestone 02 // 60%
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Balance on final approval</div>
                  </div>
                  <div
                    data-testid="estimate-completion"
                    className="font-display text-3xl sm:text-4xl font-bold text-zinc-300 mt-4 tabular-nums"
                  >
                    {estimate.currencySymbol}
                    {estimate.completionAmount.toLocaleString('en-US')}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5 bg-[#0D0D10]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 uppercase tracking-wider">Revenue Share Policy</span>
                <span className="text-white font-semibold uppercase tracking-wider">
                  Strictly 0% Rev-Share
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyBrief}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 text-xs font-mono uppercase tracking-widest font-semibold studio-btn-gradient rounded-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedBrief ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Official Quote Summary Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Official Quote Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
