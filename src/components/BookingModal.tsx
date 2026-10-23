import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Upload,
  Trash2,
  Loader2,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import {
  getPricingTiersForDiscipline,
  calculateCommissionBreakdown,
  FORMSPREE_ENDPOINT,
  COMMISSION_RECIPIENT_EMAIL,
  COMMISSION_COOLDOWN_STORAGE_KEY,
  getCommissionCooldownStatus,
  formatCommissionEmailPayload,
  CommissionInput,
  ContractType,
  CurrencyMode,
} from '../utils/portfolioLogic';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDiscipline?: CommissionInput['disciplineId'];
  prefilledSummary?: string;
  onCommissionSubmitted?: () => void;
}

interface RobloxLookupResult {
  found: boolean;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
}

const WORK_OPTIONS: Array<{
  id: CommissionInput['disciplineId'];
  label: string;
  exp: string;
}> = [
  { id: 'scripting', label: 'Scripting Work', exp: '3+ Yrs Exp' },
  { id: 'ui-design', label: 'UI Design Work', exp: '2+ Yrs Exp' },
  { id: 'modeling', label: '3D Modeling Work', exp: '2+ Yrs Exp' },
  { id: 'animating', label: 'Animation Work', exp: '1+ Yr Exp' },
  { id: 'all-rounder', label: 'All-Rounder (Full Pack)', exp: 'All 4 Skills' },
];

async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const maxWidth = 640;
        const maxHeight = 400;
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialDiscipline = 'scripting',
  prefilledSummary = '',
  onCommissionSubmitted,
}) => {
  const [clientEmail, setClientEmail] = useState('');
  const [robloxUsername, setRobloxUsername] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [workType, setWorkType] = useState<CommissionInput['disciplineId']>(initialDiscipline);
  const [contractType, setContractType] = useState<ContractType>('commission');
  const [currency, setCurrency] = useState<CurrencyMode>('USD');
  const [projectDetails, setProjectDetails] = useState('');
  const [gameImages, setGameImages] = useState<string[]>([]);
  const [agreedUpfront, setAgreedUpfront] = useState(false);
  const [agreedNoRevShare, setAgreedNoRevShare] = useState(false);

  // Roblox Avatar Bot State
  const [robloxProfile, setRobloxProfile] = useState<RobloxLookupResult | null>(null);
  const [isLookingUpRoblox, setIsLookingUpRoblox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    clientEmail: string;
    robloxProfile: RobloxLookupResult;
    workLabel: string;
    contractLabel: string;
    totalFormatted: string;
    upfrontFormatted: string;
    imageCount: number;
  } | null>(null);

  const [nowMs, setNowMs] = useState(() => Date.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNowMs(Date.now());
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (initialDiscipline) {
      setWorkType(initialDiscipline);
    }
  }, [initialDiscipline]);

  useEffect(() => {
    if (prefilledSummary && !projectDetails) {
      setProjectDetails(prefilledSummary);
    }
  }, [prefilledSummary]);

  // Automatically trigger the Roblox Avatar Bot after the user stops typing their Roblox username
  useEffect(() => {
    const clean = robloxUsername.trim();
    if (clean.length < 2) {
      setRobloxProfile(null);
      return;
    }
    const timer = setTimeout(() => {
      handleLookupRobloxUser(clean);
    }, 550);
    return () => clearTimeout(timer);
  }, [robloxUsername]);

  if (!isOpen) return null;

  let storedLastTs: number | null = null;
  try {
    const raw = localStorage.getItem(COMMISSION_COOLDOWN_STORAGE_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 0) storedLastTs = parsed;
    }
  } catch {}
  const cooldownStatus = getCommissionCooldownStatus(storedLastTs, nowMs);

  const estimate = calculateCommissionBreakdown({
    disciplineId: workType,
    contractType,
    currency,
  });

  const handleLookupRobloxUser = async (usernameToSearch?: string): Promise<RobloxLookupResult | null> => {
    const target = (usernameToSearch ?? robloxUsername).trim();
    if (target.length < 2) return null;

    setIsLookingUpRoblox(true);
    try {
      const res = await fetch(`/api/roblox-user?username=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = (await res.json()) as RobloxLookupResult;
        setRobloxProfile(data);
        return data;
      }
    } catch {
      // Fallback handled below
    } finally {
      setIsLookingUpRoblox(false);
    }
    return null;
  };

  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = Math.max(0, 4 - gameImages.length);
    const filesToProcess = files.slice(0, remainingSlots);

    try {
      const compressed = await Promise.all(filesToProcess.map((f) => compressImageFile(f)));
      setGameImages((prev) => [...prev, ...compressed].slice(0, 4));
    } catch {
      setErrorMessage('Could not process one of the selected images. Please try another screenshot.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setGameImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cooldownStatus.isOnCooldown) {
      setErrorMessage(
        `1-Hour Anti-Spam Cooldown Active: Please wait ${cooldownStatus.formattedRemaining} before sending another application.`
      );
      return;
    }

    const trimmedEmail = clientEmail.trim();
    const trimmedRoblox = robloxUsername.trim();
    const trimmedDetails = projectDetails.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail or contact email address.');
      return;
    }
    if (trimmedRoblox.length < 2) {
      setErrorMessage('Please enter your Roblox username so the bot can attach your profile.');
      return;
    }
    if (trimmedDetails.length < 5) {
      setErrorMessage('Please describe what you need help with in your game (at least 5 characters).');
      return;
    }
    if (!agreedUpfront || !agreedNoRevShare) {
      setErrorMessage(
        'Please confirm both the mandatory 40% upfront deposit and the no-revenue-share policy.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure Roblox Avatar Bot has fetched the latest profile photo
      let resolvedProfile = robloxProfile;
      if (!resolvedProfile || resolvedProfile.username.toLowerCase() !== trimmedRoblox.toLowerCase()) {
        resolvedProfile = await handleLookupRobloxUser(trimmedRoblox);
      }

      const finalProfile: RobloxLookupResult = resolvedProfile || {
        found: false,
        userId: '156',
        username: trimmedRoblox,
        displayName: trimmedRoblox,
        avatarUrl: '',
        profileUrl: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(trimmedRoblox)}`,
      };

      const commissionId = `comm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const submittedAtIso = new Date().toISOString();

      const formspreePayload = formatCommissionEmailPayload({
        commissionId,
        clientEmail: trimmedEmail,
        robloxUsername: finalProfile.username,
        robloxDisplayName: finalProfile.displayName,
        robloxUserId: finalProfile.userId,
        robloxProfileUrl: finalProfile.profileUrl,
        discordTag: discordTag.trim() || 'Not provided',
        disciplineId: workType,
        contractType,
        currency,
        projectDetails: trimmedDetails,
        screenshotCount: gameImages.length,
        submittedAtIso,
      });

      const [, apiSettled] = await Promise.allSettled([
        fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(formspreePayload),
        }),
        fetch('/api/commissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: commissionId,
            recipientEmail: COMMISSION_RECIPIENT_EMAIL,
            submitterUid: auth.currentUser?.uid || 'guest_client',
            clientEmail: trimmedEmail,
            robloxUsername: finalProfile.username,
            robloxDisplayName: finalProfile.displayName,
            robloxUserId: finalProfile.userId,
            robloxAvatarUrl: finalProfile.avatarUrl,
            discordTag: discordTag.trim() || 'Not provided',
            workType,
            contractType,
            currency,
            totalPrice: estimate.totalAmount,
            upfrontPrice: estimate.upfrontAmount,
            projectDetails: trimmedDetails,
            gameImages,
            formspreePayload,
          }),
        }),
      ]);

      let savedAvatarUrl = finalProfile.avatarUrl;
      if (apiSettled.status === 'fulfilled' && apiSettled.value.ok) {
        const apiJson = await apiSettled.value.json();
        if (apiJson?.commission?.robloxAvatarUrl) {
          savedAvatarUrl = apiJson.commission.robloxAvatarUrl;
        }
      }

      if (auth.currentUser && auth.currentUser.emailVerified) {
        const docPath = `commissions/${commissionId}`;
        try {
          await setDoc(doc(db, 'commissions', commissionId), {
            recipientEmail: COMMISSION_RECIPIENT_EMAIL,
            submitterUid: auth.currentUser.uid,
            clientEmail: trimmedEmail.slice(0, 120),
            robloxUsername: finalProfile.username.slice(0, 60),
            robloxDisplayName: finalProfile.displayName.slice(0, 60),
            robloxUserId: finalProfile.userId.slice(0, 40),
            robloxAvatarUrl: savedAvatarUrl.slice(0, 600),
            discordTag: (discordTag.trim() || 'Not provided').slice(0, 80),
            workType,
            contractType,
            currency,
            totalPrice: estimate.totalAmount,
            upfrontPrice: estimate.upfrontAmount,
            projectDetails: trimmedDetails.slice(0, 3000),
            gameImages: gameImages.slice(0, 4),
            status: 'unread',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.CREATE, docPath);
        }
      }

      try {
        localStorage.setItem(COMMISSION_COOLDOWN_STORAGE_KEY, String(Date.now()));
        setNowMs(Date.now());
      } catch {}

      const workObj = WORK_OPTIONS.find((w) => w.id === workType) ?? WORK_OPTIONS[0];
      setSubmittedData({
        clientEmail: trimmedEmail,
        robloxProfile: { ...finalProfile, avatarUrl: savedAvatarUrl },
        workLabel: workObj.label,
        contractLabel: estimate.contractLabel,
        totalFormatted: `${estimate.currencySymbol}${estimate.totalAmount.toLocaleString('en-US')} ${estimate.currencyLabel}`,
        upfrontFormatted: `${estimate.currencySymbol}${estimate.upfrontAmount.toLocaleString('en-US')} ${estimate.currencyLabel}`,
        imageCount: gameImages.length,
      });

      onCommissionSubmitted?.();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to submit commission request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-xl bg-[#0b100d] border border-zinc-800 p-6 sm:p-7 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <p className="text-xs font-mono text-emerald-400">DIRECT COMMISSION APPLICATION</p>
            <h2
              id="booking-modal-title"
              className="font-display text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5"
            >
              Book a Roblox Commission with balo_xio
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close commission booking modal"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedData ? (
          <div className="py-6 space-y-5">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <h3 className="font-display text-xl font-bold text-zinc-100">
                Application Sent to balo_xio’s Private Inbox!
              </h3>
            </div>

            {/* Verified Roblox Bot Card */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center gap-4">
              {submittedData.robloxProfile.avatarUrl && (
                <img
                  src={submittedData.robloxProfile.avatarUrl}
                  alt={submittedData.robloxProfile.username}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-emerald-400/50 bg-zinc-900 shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono text-emerald-400">
                  ROBLOX BOT ATTACHED PROFILE
                </div>
                <div className="font-display text-base font-bold text-white truncate">
                  @{submittedData.robloxProfile.username} ({submittedData.robloxProfile.displayName})
                </div>
                <div className="text-xs text-zinc-400 truncate">
                  Gmail: {submittedData.clientEmail}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-400">WORK TYPE</div>
                <div className="text-zinc-100 font-semibold mt-1">{submittedData.workLabel}</div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-400">TERM</div>
                <div className="text-zinc-100 font-semibold mt-1">{submittedData.contractLabel}</div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-400">TOTAL RATE</div>
                <div className="text-white font-semibold mt-1 tabular-nums">
                  {submittedData.totalFormatted}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                <div className="text-emerald-300">40% UPFRONT</div>
                <div className="text-emerald-400 font-bold mt-1 tabular-nums">
                  {submittedData.upfrontFormatted}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  onClose();
                }}
                className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 flex items-center gap-2.5 text-xs text-rose-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Player Gmail & Roblox Username with Bot Avatar Lookup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="client-email"
                  className="block text-xs font-mono text-zinc-300 mb-1.5"
                >
                  1. YOUR GMAIL ADDRESS
                </label>
                <input
                  id="client-email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="roblox-username"
                  className="block text-xs font-mono text-zinc-300 mb-1.5"
                >
                  2. YOUR ROBLOX USERNAME (BOT FETCHES AVATAR)
                </label>
                <div className="flex gap-2">
                  <input
                    id="roblox-username"
                    type="text"
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    placeholder="e.g. Builderman"
                    className="flex-1 min-w-0 px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupRobloxUser()}
                    disabled={isLookingUpRoblox || robloxUsername.trim().length < 2}
                    className="px-3 py-2 text-xs font-mono text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 disabled:opacity-40 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isLookingUpRoblox ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Find Face</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Roblox Avatar Bot Preview Box */}
            {robloxProfile && (
              <div
                data-testid="roblox-bot-preview"
                className="p-3.5 rounded-xl bg-zinc-950/90 border border-emerald-500/35 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={robloxProfile.avatarUrl}
                    alt={robloxProfile.username}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-emerald-400/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        {robloxProfile.found
                          ? 'ROBLOX BOT VERIFIED HEADSHOT'
                          : 'ROBLOX AVATAR READY'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      @{robloxProfile.username}{' '}
                      <span className="text-zinc-400 font-normal">
                        ({robloxProfile.displayName})
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-zinc-400 whitespace-nowrap shrink-0 tabular-nums">
                  ID: {robloxProfile.userId}
                </span>
              </div>
            )}

            {/* 3. Select What Work You Need Help In */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-zinc-300">
                3. WHAT DO YOU NEED HELP IN? (SELECT WORK TYPE)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WORK_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setWorkType(opt.id)}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      workType === opt.id
                        ? 'bg-emerald-400 text-zinc-950 border-emerald-400 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold whitespace-nowrap truncate">
                      {opt.label}
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        workType === opt.id ? 'text-zinc-800' : 'text-zinc-400'
                      }`}
                    >
                      {opt.exp}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Select Commission / Short-Term / Long-Term + Currency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-mono text-zinc-300">
                  4. COMMISSION TYPE & RATE
                </label>
                <div className="flex items-center gap-1 p-0.5 bg-zinc-950 border border-zinc-800 rounded-md">
                  {(['USD', 'ROBUX'] as CurrencyMode[]).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(
                  Object.values(
                    getPricingTiersForDiscipline(workType)
                  ) as ReturnType<typeof getPricingTiersForDiscipline>[ContractType][]
                ).map((tier) => {
                  const isSelected = contractType === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setContractType(tier.id)}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-400 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-semibold whitespace-nowrap">{tier.label}</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-1 tabular-nums">
                        ${tier.usdTotal} USD / {tier.robuxTotal.toLocaleString('en-US')} R$
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{tier.delivery}</div>
                    </button>
                  );
                })}
              </div>

              {/* Automatic 40% Upfront Summary Bar */}
              <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-zinc-300">
                  Selected Rate:{' '}
                  <strong className="text-white tabular-nums">
                    {estimate.currencySymbol}
                    {estimate.totalAmount.toLocaleString('en-US')} {estimate.currencyLabel}
                  </strong>
                </span>
                <span className="text-emerald-400 font-semibold tabular-nums">
                  40% Upfront Required: {estimate.currencySymbol}
                  {estimate.upfrontAmount.toLocaleString('en-US')} {estimate.currencyLabel}
                </span>
              </div>
            </div>

            {/* 5. Upload Images of Your Game */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-mono text-zinc-300">
                  5. UPLOAD IMAGES OF YOUR GAME (UP TO 4 SCREENSHOTS)
                </label>
                <span className="text-xs font-mono text-zinc-400 tabular-nums">
                  {gameImages.length} / 4 Images
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={gameImages.length >= 4}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-950 hover:bg-zinc-900 disabled:opacity-40 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload Game Screenshots</span>
                </button>
              </div>

              {gameImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {gameImages.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video"
                    >
                      <img
                        src={imgSrc}
                        alt={`Uploaded game reference ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        aria-label={`Remove game screenshot ${idx + 1}`}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-black/80 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Discord (Optional) & Project Description */}
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="discord-tag"
                  className="block text-xs font-mono text-zinc-300 mb-1.5"
                >
                  6. DISCORD USERNAME (OPTIONAL)
                </label>
                <input
                  id="discord-tag"
                  type="text"
                  value={discordTag}
                  onChange={(e) => setDiscordTag(e.target.value)}
                  placeholder="e.g. @studiofounder"
                  className="w-full px-3.5 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label
                  htmlFor="project-scope"
                  className="block text-xs font-mono text-zinc-300 mb-1.5"
                >
                  7. WHAT DO YOU WANT HELP WITH IN YOUR GAME?
                </label>
                <textarea
                  id="project-scope"
                  rows={3}
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder="Explain the scripts, UI menus, 3D models, or animations you need built for your Roblox game..."
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Mandatory Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedUpfront}
                  onChange={(e) => setAgreedUpfront(e.target.checked)}
                  className="mt-0.5 accent-emerald-400"
                />
                <span>
                  I agree to pay the mandatory{' '}
                  <strong className="text-emerald-400">
                    40% upfront deposit ({estimate.currencySymbol}
                    {estimate.upfrontAmount.toLocaleString('en-US')} {estimate.currencyLabel})
                  </strong>{' '}
                  before work starts.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedNoRevShare}
                  onChange={(e) => setAgreedNoRevShare(e.target.checked)}
                  className="mt-0.5 accent-emerald-400"
                />
                <span>
                  I confirm this is a direct paid commission/contract and{' '}
                  <strong className="text-white">not a revenue-share (%) offer</strong>.
                </span>
              </label>
            </div>

            {cooldownStatus.isOnCooldown && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3 text-xs font-mono text-amber-200">
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>1-Hour Anti-Spam Cooldown Active</span>
                </span>
                <strong className="text-amber-300 tabular-nums">
                  {cooldownStatus.formattedRemaining} remaining
                </strong>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || cooldownStatus.isOnCooldown}
                className="px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {cooldownStatus.isOnCooldown
                    ? `Cooldown Active (${cooldownStatus.formattedRemaining})`
                    : 'Send Commission to balo_xio'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
