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
    id: 'scripting',
    index: '01',
    label: 'Scripting Systems',
    sub: 'Luau Frameworks, Combat & DataStores',
    tenure: '3+ Years Exp',
  },
  {
    id: 'ui-design',
    index: '02',
    label: 'UI Design & HUDs',
    sub: 'Custom Studded Frames, Shops & Scale Layouts',
    tenure: '2+ Years Exp',
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
      {/* Section 02: Transparent Rate Schedule & Per-Task Policy */}
      <section id="commission-terms" aria-labelledby="terms-heading">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-sm font-semibold text-orange-300">
              02. Transparent Rate Schedule &amp; Per-Task Policy
            </p>
            <h2
              id="terms-heading"
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance"
            >
              Paid <span className="pro-gradient-text">Per Task</span> or Project. 40% Upfront.
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              Every engagement with <strong className="text-white">balo_xio</strong> operates on
              fixed rates in USD or Robux with a mandatory{' '}
              <strong className="text-white">40% upfront deposit</strong> and strictly{' '}
              <strong className="text-white">0% revenue share</strong>.
            </p>

            <div className="p-5 rounded-2xl border border-orange-400/25 studio-active-cell space-y-2">
              <div className="text-sm font-bold text-white">
                Per Task Payment Rule (Strictly 1 Task Only)
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Selecting <strong className="text-orange-300">Per Task</strong> means payment covers{' '}
                <strong className="text-white">strictly one single task</strong> (1 script or 1 UI
                frame/menu). Clients cannot bundle multiple tasks or extra ongoing benefits into a
                single Per Task payment. For multiple tasks, select a Short-Term or Long-Term
                package.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-white/15 bg-[#11131C] overflow-hidden divide-y divide-white/10">
            <div className="px-6 py-4 bg-[#161925] flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>Specialization Track</span>
              <span>Per Task (1 Task) · Short-Term · Long-Term</span>
            </div>

            {(
              [
                { id: 'scripting', index: '01', name: 'Scripting (3+ Years Exp)' },
                { id: 'ui-design', index: '02', name: 'UI Design (2+ Years Exp)' },
              ] as const
            ).map((row) => {
              const p = DISCIPLINE_PRICING_TABLE[row.id];
              return (
                <div
                  key={row.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {row.index}. {row.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-zinc-400 tabular-nums">
                      Per Task:{' '}
                      <span className="text-orange-300 font-semibold">
                        ${p.commission.usdTotal} /{' '}
                        {p.commission.robuxTotal.toLocaleString('en-US')} R$
                      </span>
                      {' · '}Short-Term:{' '}
                      <span className="text-white">
                        ${p['short-term'].usdTotal} /{' '}
                        {p['short-term'].robuxTotal.toLocaleString('en-US')} R$
                      </span>
                      {' · '}Long-Term:{' '}
                      <span className="text-white font-semibold">
                        ${p['long-term'].usdTotal} /{' '}
                        {p['long-term'].robuxTotal.toLocaleString('en-US')} R$
                      </span>
                    </p>
                  </div>
                  <span className="font-mono text-xs text-zinc-300 whitespace-nowrap shrink-0">
                    1 Task Only · 40% Upfront
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 03: Interactive Per-Task & Project Rate Calculator */}
      <section id="estimator" aria-labelledby="estimator-heading">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-sm font-semibold text-orange-300 mb-2">
              03. Interactive Rate Calculator &amp; Split-Payment Breakdown
            </p>
            <h2
              id="estimator-heading"
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white"
            >
              Configure Your <span className="pro-gradient-text">Per-Task or Project Quote.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl">
              Select Scripting or UI Design, choose between{' '}
              <strong className="text-white">Per Task (1 single task)</strong>, Short-Term, or
              Long-Term scope, and view your exact 40% upfront deposit.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className="text-xs font-medium text-zinc-400">Payment Currency</span>
            <div className="inline-flex items-center p-1 rounded-xl border border-white/15 bg-[#12141D]">
              {(['USD', 'ROBUX'] as CurrencyMode[]).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    currency === curr ? 'studio-btn-gradient' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {curr === 'USD' ? 'USD ($)' : 'Robux (R$)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 7 Columns: Specialization & Tier Selectors */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="rounded-2xl border border-white/15 bg-[#11131C] overflow-hidden">
              <div className="px-6 py-4 bg-[#161925] border-b border-white/10 flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span>1. Select Specialization Track</span>
                <span className="text-orange-300">2 Available Tracks</span>
              </div>
              <div className="divide-y divide-white/10">
                {ROLE_OPTIONS.map((role) => {
                  const isActive = selectedDiscipline === role.id;
                  const perTaskRate = DISCIPLINE_PRICING_TABLE[role.id]?.commission ?? {
                    usdTotal: 15,
                    robuxTotal: 5000,
                  };
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => onChangeDiscipline(role.id)}
                      className={`w-full px-6 py-4 text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isActive
                          ? 'studio-active-row text-white'
                          : 'bg-transparent text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-baseline gap-3.5 min-w-0">
                        <span
                          className={`font-mono text-xs tabular-nums ${
                            isActive ? 'text-orange-300 font-bold' : 'text-zinc-500'
                          }`}
                        >
                          {role.index}.
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
                            className={`text-xs ${
                              isActive ? 'text-zinc-300' : 'text-zinc-500'
                            } mt-0.5 truncate`}
                          >
                            {role.sub}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                          <div className="text-[11px] text-zinc-400">{role.tenure}</div>
                          <div
                            className={`text-xs font-mono ${
                              isActive ? 'text-orange-300 font-semibold' : 'text-zinc-400'
                            } tabular-nums`}
                          >
                            Per Task: ${perTaskRate.usdTotal}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-lg border ${
                            isActive
                              ? 'border-orange-400/60 text-orange-300 bg-orange-500/15'
                              : 'border-white/10 text-zinc-400'
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

            <div className="rounded-2xl border border-white/15 bg-[#11131C] overflow-hidden">
              <div className="px-6 py-4 bg-[#161925] border-b border-white/10 flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span>2. Select Payment Tier (Per Task vs. Project)</span>
                <span className="text-zinc-400">Per Task = Strictly 1 Task</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                {(Object.values(activeTiers) as (typeof activeTiers)[ContractType][]).map(
                  (tier, idx) => {
                    const isActive = contractType === tier.id;
                    const badgeText =
                      tier.id === 'commission'
                        ? '1 Task Only'
                        : tier.id === 'short-term'
                        ? 'Multi-Task Sprint'
                        : 'Full Production';
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setContractType(tier.id)}
                        className={`relative p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isActive
                            ? 'studio-active-cell text-white'
                            : 'bg-transparent text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                isActive ? 'text-orange-300' : 'text-zinc-500'
                              }`}
                            >
                              0{idx + 1}. {badgeText}
                            </span>
                            {isActive && (
                              <span className="text-[11px] font-semibold text-orange-300">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="font-display text-lg font-bold text-white mt-1.5">
                            {tier.label}
                          </div>
                          <div className="text-xs text-zinc-300 mt-1 leading-relaxed">
                            {tier.subtitle}
                          </div>
                        </div>
                        <div
                          className={`font-mono text-xs font-semibold ${
                            isActive ? 'text-orange-300' : 'text-zinc-300'
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

          {/* Right 5 Columns: Tactile Warm Alabaster Paper Quote Invoice */}
          <div className="lg:col-span-5 rounded-2xl studio-paper-invoice shadow-2xl border border-white/20 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="px-7 py-5 border-b border-zinc-300/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold tracking-tight text-zinc-900">
                    balo_xio Studio Quote
                  </div>
                  <div className="text-[11px] text-zinc-600 mt-0.5">
                    Fixed-Rate Split Payment Summary
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-rose-700">
                  40% / 60% Split
                </span>
              </div>

              <div className="p-7 border-b border-zinc-300/80 flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    {contractType === 'commission'
                      ? 'PER TASK (1 SINGLE TASK ONLY)'
                      : estimate.contractLabel.toUpperCase()}
                  </div>
                  <div
                    data-testid="estimate-total"
                    className="font-display text-5xl sm:text-6xl font-extrabold text-zinc-950 mt-2 tabular-nums tracking-tight"
                  >
                    {estimate.currencySymbol}
                    {estimate.totalAmount.toLocaleString('en-US')}
                  </div>
                  <div className="text-xs font-mono text-zinc-600 mt-2 tabular-nums">
                    (${estimate.usdEquivalent} USD /{' '}
                    {estimate.robuxEquivalent.toLocaleString('en-US')} Robux)
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-zinc-600">Est. Turnaround</div>
                  <div className="font-mono text-sm font-bold text-zinc-950 mt-1 tabular-nums">
                    {estimate.estimatedDelivery}
                  </div>
                </div>
              </div>

              <div className="px-7 py-4 bg-orange-500/10 border-b border-zinc-300/80">
                <div className="text-xs text-zinc-800 leading-relaxed font-medium">
                  {contractType === 'commission' ? (
                    <>
                      <strong className="text-zinc-950">Per Task Scope:</strong> Payment covers
                      strictly <strong className="text-rose-700">1 single task only</strong>.
                      Additional tasks or extra features are billed separately.
                    </>
                  ) : contractType === 'short-term' ? (
                    <>
                      <strong className="text-zinc-950">Short-Term Scope:</strong> Covers a focused
                      multi-task sprint or complete feature pack delivered in 1–2 weeks.
                    </>
                  ) : (
                    <>
                      <strong className="text-zinc-950">Long-Term Scope:</strong> Covers full
                      ongoing production and milestone-based studio commitment.
                    </>
                  )}
                </div>
              </div>

              <div className="px-7 py-5 border-b border-zinc-300/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-rose-700">40% Upfront to Begin</span>
                  <span className="text-zinc-600">60% on Final Delivery</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-300 flex overflow-hidden">
                  <div className="w-[40%] h-full studio-btn-gradient" />
                  <div className="w-[60%] h-full bg-zinc-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-300/80 border-b border-zinc-300/80">
                <div className="p-6 bg-white/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-rose-700">Upfront Deposit (40%)</div>
                    <div className="text-xs text-zinc-600 mt-0.5">Required before work starts</div>
                  </div>
                  <div
                    data-testid="estimate-upfront"
                    className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-950 mt-4 tabular-nums"
                  >
                    {estimate.currencySymbol}
                    {estimate.upfrontAmount.toLocaleString('en-US')}
                  </div>
                </div>

                <div className="p-6 bg-transparent flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-zinc-700">Completion Balance (60%)</div>
                    <div className="text-xs text-zinc-600 mt-0.5">Paid upon final approval</div>
                  </div>
                  <div
                    data-testid="estimate-completion"
                    className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-800 mt-4 tabular-nums"
                  >
                    {estimate.currencySymbol}
                    {estimate.completionAmount.toLocaleString('en-US')}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-7 space-y-4 bg-zinc-900/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-medium">Revenue Share Policy</span>
                <span className="text-zinc-950 font-bold">Strictly 0% Rev-Share</span>
              </div>

              <button
                type="button"
                onClick={handleCopyBrief}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold studio-btn-gradient rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedBrief ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Official Quote Summary Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
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
