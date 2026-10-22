import React, { useState } from 'react';
import {
  calculateCommissionBreakdown,
  getPricingTiersForDiscipline,
  DISCIPLINE_PRICING_TABLE,
  CommissionInput,
  ContractType,
  CurrencyMode,
} from '../utils/portfolioLogic';
import { Check, Copy, ArrowUpRight } from 'lucide-react';

interface CommissionSectionProps {
  selectedDiscipline: CommissionInput['disciplineId'];
  onChangeDiscipline: (id: CommissionInput['disciplineId']) => void;
  onOpenBookingWithSummary: (summary: string) => void;
}

const ROLE_OPTIONS: Array<{ id: CommissionInput['disciplineId']; label: string }> = [
  { id: 'all-rounder', label: 'All-Rounder (Full Pack)' },
  { id: 'scripting', label: 'Scripting (3+ Yrs)' },
  { id: 'ui-design', label: 'UI Design (2+ Yrs)' },
  { id: 'modeling', label: '3D Modeling (2+ Yrs)' },
  { id: 'animating', label: 'Animating (1+ Yr)' },
];

export const CommissionSection: React.FC<CommissionSectionProps> = ({
  selectedDiscipline,
  onChangeDiscipline,
  onOpenBookingWithSummary,
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
            <p className="text-xs font-mono text-emerald-400 mb-3">02. Commission Policy & Rates</p>
            <h2
              id="terms-heading"
              className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance"
            >
              Fixed Rates. 40% Upfront. Zero Revenue Share.
            </h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed">
              Every project with <strong className="text-white">balo_xio</strong> uses transparent
              upfront pricing in USD or Robux—with a mandatory 40% upfront payment and strictly no
              revenue share.
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
                      {row.index}. {row.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-mono text-zinc-400">
                      Commission:{' '}
                      <span className="text-zinc-200">
                        ${p.commission.usdTotal} / {p.commission.robuxTotal.toLocaleString('en-US')} R$
                      </span>
                      {' · '}Short-Term:{' '}
                      <span className="text-zinc-200">
                        ${p['short-term'].usdTotal} /{' '}
                        {p['short-term'].robuxTotal.toLocaleString('en-US')} R$
                      </span>
                      {' · '}Long-Term:{' '}
                      <span className="text-emerald-400">
                        ${p['long-term'].usdTotal} /{' '}
                        {p['long-term'].robuxTotal.toLocaleString('en-US')} R$
                      </span>
                    </p>
                  </div>
                  <span className="font-mono text-xs text-emerald-400 whitespace-nowrap shrink-0">
                    40% Upfront
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 03: Interactive 40% Upfront Rate Calculator */}
      <section
        id="estimator"
        aria-labelledby="estimator-heading"
        className="pt-16 border-t border-white/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left 7 Columns: Clean Selectors */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="text-xs font-mono text-emerald-400 mb-3">03. Rate & Upfront Estimator</p>
              <h2
                id="estimator-heading"
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white"
              >
                Calculate Your 40% Upfront Payment
              </h2>
              <p className="mt-2 text-sm sm:text-base text-zinc-400">
                Choose your specialization, engagement term, and preferred currency (USD or Robux)
                to view your exact 40% upfront deposit.
              </p>
            </div>

            {/* Specialization Selector */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-zinc-400">1. Select Role / Specialization</div>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => onChangeDiscipline(role.id)}
                    className={`px-4 py-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                      selectedDiscipline === role.id
                        ? 'bg-emerald-400 text-zinc-950 border-emerald-400 font-semibold'
                        : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:border-white/25'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Engagement Type Selector with Dynamic Discipline Rates */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-zinc-400">2. Select Engagement Type</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.values(activeTiers) as (typeof activeTiers)[ContractType][]).map(
                  (tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setContractType(tier.id)}
                      className={`p-4 rounded-md border text-left transition-colors cursor-pointer ${
                        contractType === tier.id
                          ? 'bg-emerald-500/10 border-emerald-400 text-white'
                          : 'bg-white/[0.02] border-white/10 text-zinc-300 hover:border-white/25'
                      }`}
                    >
                      <div className="text-xs font-semibold whitespace-nowrap">{tier.label}</div>
                      <div className="mt-2 font-mono text-sm font-bold text-emerald-400 tabular-nums">
                        ${tier.usdTotal} USD / {tier.robuxTotal.toLocaleString('en-US')} R$
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">{tier.subtitle}</div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="space-y-3 max-w-xs">
              <div className="text-xs font-mono text-zinc-400">3. Payment Currency</div>
              <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-md">
                {(['USD', 'ROBUX'] as CurrencyMode[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`flex-1 px-4 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      currency === curr
                        ? 'bg-emerald-400 text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {curr === 'USD' ? 'USD ($)' : 'Robux (R$)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Exact Breakdown Ledger */}
          <div className="lg:col-span-5 rounded-xl bg-[#0c110e] border border-white/10 p-6 sm:p-8 space-y-6">
            <div className="flex items-baseline justify-between pb-6 border-b border-white/10">
              <div>
                <div className="text-xs font-mono text-emerald-400">
                  {estimate.contractLabel.toUpperCase()}
                </div>
                <div
                  data-testid="estimate-total"
                  className="font-display text-4xl sm:text-5xl font-bold text-white mt-1 tabular-nums"
                >
                  {estimate.currencySymbol}
                  {estimate.totalAmount.toLocaleString('en-US')}
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1.5 tabular-nums">
                  (${estimate.usdEquivalent} USD / {estimate.robuxEquivalent.toLocaleString('en-US')} Robux)
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-zinc-400">Turnaround</div>
                <div className="text-sm font-medium text-zinc-200 mt-1 tabular-nums">
                  {estimate.estimatedDelivery}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-sm font-semibold text-emerald-400">
                    40% Upfront Payment (Mandatory)
                  </div>
                  <div className="text-xs text-zinc-400">Paid before starting work</div>
                </div>
                <div
                  data-testid="estimate-upfront"
                  className="font-mono text-2xl font-bold text-emerald-400 tabular-nums"
                >
                  {estimate.currencySymbol}
                  {estimate.upfrontAmount.toLocaleString('en-US')}
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-3 border-t border-white/10">
                <div>
                  <div className="text-sm font-medium text-zinc-200">
                    60% Completion Balance
                  </div>
                  <div className="text-xs text-zinc-400">Paid upon final completion</div>
                </div>
                <div
                  data-testid="estimate-completion"
                  className="font-mono text-xl font-semibold text-zinc-200 tabular-nums"
                >
                  {estimate.currencySymbol}
                  {estimate.completionAmount.toLocaleString('en-US')}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Revenue Share Accepted</span>
              <span className="text-zinc-200">No (0% Rev-Share)</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => onOpenBookingWithSummary(estimate.summaryText)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Book With This Rate</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopyBrief}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-mono text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedBrief ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Rate</span>
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
