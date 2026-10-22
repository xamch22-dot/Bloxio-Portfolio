import React, { useEffect, useState } from 'react';
import {
  Lock,
  Mail,
  Star,
  CheckCircle2,
  Trash2,
  Search,
  ExternalLink,
  Copy,
  Check,
  Image as ImageIcon,
  ArrowLeft,
  ShieldAlert,
  LogOut,
  Inbox,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  OWNER_EMAIL,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

export interface CommissionEmailItem {
  id: string;
  recipientEmail: string;
  submitterUid: string;
  clientEmail: string;
  robloxUsername: string;
  robloxDisplayName: string;
  robloxUserId: string;
  robloxAvatarUrl: string;
  discordTag: string;
  workType: 'scripting' | 'ui-design' | 'modeling' | 'animating' | 'all-rounder';
  contractType: 'commission' | 'short-term' | 'long-term';
  currency: 'USD' | 'ROBUX';
  totalPrice: number;
  upfrontPrice: number;
  projectDetails: string;
  gameImages: string[];
  status: 'unread' | 'read' | 'starred' | 'accepted' | 'completed';
  createdAtIso: string;
}

interface PrivateInboxPageProps {
  onBackToPortfolio: () => void;
  refreshTrigger?: number;
}

const WORK_LABELS: Record<CommissionEmailItem['workType'], string> = {
  scripting: 'Scripting (3+ Yrs)',
  'ui-design': 'UI Design (2+ Yrs)',
  modeling: '3D Modeling (2+ Yrs)',
  animating: 'Animating (1+ Yr)',
  'all-rounder': 'All-Rounder (Full Pack)',
};

const CONTRACT_LABELS: Record<CommissionEmailItem['contractType'], string> = {
  commission: 'Single Commission',
  'short-term': 'Short-Term Project',
  'long-term': 'Long-Term Contract',
};

export const PrivateInboxPage: React.FC<PrivateInboxPageProps> = ({
  onBackToPortfolio,
  refreshTrigger = 0,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [firestoreItems, setFirestoreItems] = useState<CommissionEmailItem[]>([]);
  const [serverItems, setServerItems] = useState<CommissionEmailItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState<
    'all' | 'unread' | 'starred' | 'accepted' | 'completed'
  >('all');
  const [workFilter, setWorkFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthorizedOwner =
    Boolean(currentUser) &&
    currentUser?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() &&
    currentUser?.emailVerified === true;

  // Fetch server relay items AND sync/subscribe to Firestore ONLY when verified owner is signed in
  useEffect(() => {
    if (!authReady || !isAuthorizedOwner || !currentUser) return;

    let isMounted = true;

    // 1. Pull any guest submissions from /api/commissions and sync to Firestore
    fetch('/api/commissions')
      .then((r) => (r.ok ? r.json() : { commissions: [] }))
      .then(async (data) => {
        if (!isMounted) return;
        const list: CommissionEmailItem[] = Array.isArray(data?.commissions)
          ? data.commissions
          : [];
        setServerItems(list);

        // Sync guest items into Firestore under owner's verified UID so they persist permanently
        for (const item of list) {
          const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
          try {
            await setDoc(
              doc(db, 'commissions', safeId),
              {
                recipientEmail: OWNER_EMAIL,
                submitterUid: currentUser.uid,
                clientEmail: item.clientEmail.slice(0, 120),
                robloxUsername: item.robloxUsername.slice(0, 60),
                robloxDisplayName: (item.robloxDisplayName || item.robloxUsername).slice(0, 60),
                robloxUserId: (item.robloxUserId || '156').slice(0, 40),
                robloxAvatarUrl: (item.robloxAvatarUrl || '').slice(0, 600),
                discordTag: (item.discordTag || 'Not provided').slice(0, 80),
                workType: item.workType,
                contractType: item.contractType,
                currency: item.currency,
                totalPrice: item.totalPrice,
                upfrontPrice: item.upfrontPrice,
                projectDetails: item.projectDetails.slice(0, 3000),
                gameImages: (item.gameImages || []).slice(0, 4),
                status: 'unread',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: false }
            );
          } catch {
            // Document may already exist in Firestore with an updated status; ignore overwrite error
          }
        }
      })
      .catch(() => {});

    // 2. Real-time Firestore listener on /commissions where recipientEmail == xamch22@gmail.com
    const q = query(
      collection(db, 'commissions'),
      where('recipientEmail', '==', OWNER_EMAIL)
    );

    const unsubSnapshot = onSnapshot(
      q,
      (snap) => {
        const docs: CommissionEmailItem[] = snap.docs.map((d) => {
          const data = d.data();
          const createdTs = data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString();
          return {
            id: d.id,
            recipientEmail: data.recipientEmail || OWNER_EMAIL,
            submitterUid: data.submitterUid || '',
            clientEmail: data.clientEmail || '',
            robloxUsername: data.robloxUsername || 'Unknown',
            robloxDisplayName: data.robloxDisplayName || data.robloxUsername || 'Unknown',
            robloxUserId: data.robloxUserId || '0',
            robloxAvatarUrl: data.robloxAvatarUrl || '',
            discordTag: data.discordTag || 'Not provided',
            workType: data.workType || 'scripting',
            contractType: data.contractType || 'commission',
            currency: data.currency || 'USD',
            totalPrice: Number(data.totalPrice) || 10,
            upfrontPrice: Number(data.upfrontPrice) || 4,
            projectDetails: data.projectDetails || '',
            gameImages: Array.isArray(data.gameImages) ? data.gameImages : [],
            status: data.status || 'unread',
            createdAtIso: createdTs,
          };
        });
        setFirestoreItems(docs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'commissions');
      }
    );

    return () => {
      isMounted = false;
      unsubSnapshot();
    };
  }, [authReady, isAuthorizedOwner, currentUser, refreshTrigger]);

  // Merge Firestore items and server items by ID
  const mergedItems = React.useMemo(() => {
    const map = new Map<string, CommissionEmailItem>();
    for (const s of serverItems) {
      map.set(s.id, s);
    }
    for (const f of firestoreItems) {
      map.set(f.id, f);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
    );
  }, [firestoreItems, serverItems]);

  const filteredItems = React.useMemo(() => {
    return mergedItems.filter((item) => {
      if (folderFilter !== 'all' && item.status !== folderFilter) return false;
      if (workFilter !== 'all' && item.workType !== workFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${item.clientEmail} ${item.robloxUsername} ${item.robloxDisplayName} ${item.projectDetails} ${item.discordTag}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [mergedItems, folderFilter, workFilter, searchQuery]);

  const activeEmail =
    filteredItems.find((i) => i.id === selectedId) ?? filteredItems[0] ?? null;

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Google Sign-In was canceled or blocked.'
      );
    }
  };

  const handleUpdateStatus = async (
    item: CommissionEmailItem,
    nextStatus: CommissionEmailItem['status']
  ) => {
    // Update server copy
    fetch(`/api/commissions/${encodeURIComponent(item.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => {});

    setServerItems((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, status: nextStatus } : c))
    );

    if (isAuthorizedOwner) {
      const path = `commissions/${item.id}`;
      try {
        await updateDoc(doc(db, 'commissions', item.id), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Ignore if only in memory
      }
    }
  };

  const handleDeleteItem = async (item: CommissionEmailItem) => {
    fetch(`/api/commissions/${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    }).catch(() => {});

    setServerItems((prev) => prev.filter((c) => c.id !== item.id));

    if (isAuthorizedOwner) {
      const path = `commissions/${item.id}`;
      try {
        await deleteDoc(doc(db, 'commissions', item.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const handleCopyGmail = (email: string, id: string) => {
    navigator.clipboard?.writeText(email).catch(() => {});
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 1800);
  };

  // Strict Owner Privacy Gate: No one except xamch22@gmail.com can access the inbox
  if (!authReady || !isAuthorizedOwner) {
    return (
      <section
        aria-label="Private Owner Authentication Gate"
        className="min-h-[calc(100vh-65px)] flex items-center justify-center px-6 py-16 bg-[#070908]"
      >
        <div className="w-full max-w-md rounded-xl bg-[#0b100d] border border-white/10 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400">PRIVATE OWNER VAULT</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              balo_xio Private Commission Inbox
            </h1>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              This Gmail-style commission dashboard is strictly private and locked to{' '}
              <strong className="text-zinc-200">balo_xio</strong>. Public visitors cannot view
              player emails, Roblox profiles, or game screenshots.
            </p>
          </div>

          {currentUser && !isAuthorizedOwner && (
            <div
              role="alert"
              className="p-4 rounded-lg bg-rose-950/50 border border-rose-500/40 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-rose-300 font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>ACCESS DENIED — UNAUTHORIZED ACCOUNT</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                Signed in as <strong>{currentUser.email}</strong>. Only the portfolio owner can
                unlock this inbox.
              </p>
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-300 underline underline-offset-4 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out and switch account</span>
              </button>
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
              {authError}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              Sign in with Google (Owner Only)
            </button>

            <button
              type="button"
              onClick={onBackToPortfolio}
              className="w-full py-2.5 px-4 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portfolio</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  const unreadCount = mergedItems.filter((i) => i.status === 'unread').length;

  return (
    <section
      aria-label="balo_xio Private Commission Gmail Inbox"
      className="min-h-[calc(100vh-61px)] bg-[#070908] flex flex-col"
    >
      {/* Top Inbox Workspace Header */}
      <div className="px-6 lg:px-10 py-4 bg-[#0a0f0c] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToPortfolio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] border border-white/10 rounded-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <h1 className="font-display text-lg font-bold text-white">
                balo_xio Commission Mail
              </h1>
              <span className="text-xs font-mono text-emerald-400 tabular-nums">
                ({unreadCount} unread)
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Private Owner Session: {currentUser?.email} · Automatic Roblox Avatar Headshot Bot Active
            </p>
          </div>
        </div>

        {/* Search Input & Sign Out */}
        <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player Gmail, @Roblox user, or work..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-950 border border-white/10 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="button"
            onClick={() => signOut(auth)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white border border-white/10 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Inbox</span>
          </button>
        </div>
      </div>

      {/* Main 3-Pane Gmail Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* Pane 1: Left Mail Folders & Work Filters */}
        <aside className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-white/10 p-4 space-y-6 bg-[#080c0a]">
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[11px] font-mono text-zinc-400">MAILBOXES</div>
            {(
              [
                { id: 'all', label: 'All Mail', count: mergedItems.length, icon: Inbox },
                { id: 'unread', label: 'Unread', count: unreadCount, icon: Mail },
                {
                  id: 'starred',
                  label: 'Starred',
                  count: mergedItems.filter((i) => i.status === 'starred').length,
                  icon: Star,
                },
                {
                  id: 'accepted',
                  label: 'Accepted (40% Paid)',
                  count: mergedItems.filter((i) => i.status === 'accepted').length,
                  icon: Sparkles,
                },
                {
                  id: 'completed',
                  label: 'Completed',
                  count: mergedItems.filter((i) => i.status === 'completed').length,
                  icon: CheckCircle2,
                },
              ] as const
            ).map((folder) => {
              const Icon = folder.icon;
              const active = folderFilter === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setFolderFilter(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-400/15 text-emerald-300 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{folder.label}</span>
                  </span>
                  <span className="font-mono text-[11px] tabular-nums">{folder.count}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-4 border-t border-white/10">
            <div className="px-2 pb-1 text-[11px] font-mono text-zinc-400">FILTER BY WORK</div>
            {(
              [
                { id: 'all', label: 'All Disciplines' },
                { id: 'scripting', label: 'Scripting' },
                { id: 'ui-design', label: 'UI Design' },
                { id: 'modeling', label: '3D Modeling' },
                { id: 'animating', label: 'Animation' },
                { id: 'all-rounder', label: 'All-Rounder' },
              ] as const
            ).map((wf) => (
              <button
                key={wf.id}
                type="button"
                onClick={() => setWorkFilter(wf.id)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  workFilter === wf.id
                    ? 'bg-white/[0.08] text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {wf.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Pane 2: Middle Gmail Thread List */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 divide-y divide-white/10 overflow-y-auto max-h-[78vh]">
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-400">
              No commission emails match this filter.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = activeEmail?.id === item.id;
              const isUnread = item.status === 'unread';
              const currencySymbol = item.currency === 'USD' ? '$' : 'R$ ';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    if (item.status === 'unread') {
                      handleUpdateStatus(item, 'read');
                    }
                  }}
                  className={`p-4 transition-colors cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-emerald-500/10'
                      : isUnread
                      ? 'bg-white/[0.03] hover:bg-white/[0.05]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Bot-Fetched Roblox Avatar Headshot */}
                  <img
                    src={item.robloxAvatarUrl}
                    alt={item.robloxUsername}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover bg-zinc-900 border border-white/15 shrink-0 mt-0.5"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm truncate ${
                          isUnread ? 'font-bold text-white' : 'font-medium text-zinc-200'
                        }`}
                      >
                        @{item.robloxUsername}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 whitespace-nowrap shrink-0 tabular-nums">
                        {currencySymbol}
                        {item.totalPrice.toLocaleString('en-US')}
                      </span>
                    </div>

                    {/* Player's Gmail */}
                    <div className="text-xs font-mono text-zinc-400 truncate">
                      {item.clientEmail}
                    </div>

                    {/* Work Type + Contract Term */}
                    <div className="text-xs text-emerald-300/90 truncate">
                      {WORK_LABELS[item.workType]} · {item.contractType.toUpperCase()}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.projectDetails}
                    </p>

                    {item.gameImages.length > 0 && (
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
                        <ImageIcon className="w-3 h-3 text-emerald-400" />
                        <span>
                          {item.gameImages.length} Game Screenshot
                          {item.gameImages.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pane 3: Right Full Gmail Reading View */}
        <div className="lg:col-span-6 p-6 lg:p-8 overflow-y-auto max-h-[78vh]">
          {!activeEmail ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-500">
              Select a commission email on the left to inspect player details and game screenshots.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(
                        activeEmail,
                        activeEmail.status === 'starred' ? 'read' : 'starred'
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                      activeEmail.status === 'starred'
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                        : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>{activeEmail.status === 'starred' ? 'Starred' : 'Star'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeEmail, 'accepted')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                      activeEmail.status === 'accepted'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Accept (40% Upfront)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeEmail, 'completed')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                      activeEmail.status === 'completed'
                        ? 'bg-emerald-400 text-zinc-950 border-emerald-400 font-semibold'
                        : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(activeEmail)}
                  aria-label="Delete commission email"
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-md hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sender Profile Header (Roblox Bot Face + Gmail + Roblox Profile Link) */}
              <div className="p-5 rounded-xl bg-[#0c120f] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={activeEmail.robloxAvatarUrl}
                    alt={activeEmail.robloxUsername}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-900 border border-emerald-400/50 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-mono text-emerald-400">
                      ROBLOX PLAYER & GMAIL SENDER
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">
                      @{activeEmail.robloxUsername}{' '}
                      <span className="text-sm font-normal text-zinc-400">
                        ({activeEmail.robloxDisplayName})
                      </span>
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-300">
                      <span>Gmail: {activeEmail.clientEmail}</span>
                      <span aria-hidden="true">·</span>
                      <span>Discord: {activeEmail.discordTag}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyGmail(activeEmail.clientEmail, activeEmail.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-md transition-colors cursor-pointer"
                  >
                    {copiedEmailId === activeEmail.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Gmail Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Gmail</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://www.roblox.com/users/${activeEmail.robloxUserId}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline underline-offset-4"
                  >
                    <span>Roblox Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Commission Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10">
                  <div className="text-zinc-400">NEEDS HELP IN</div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {WORK_LABELS[activeEmail.workType]}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10">
                  <div className="text-zinc-400">ENGAGEMENT TERM</div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {CONTRACT_LABELS[activeEmail.contractType]}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-950/25 border border-emerald-500/35">
                  <div className="text-emerald-300">TOTAL & 40% UPFRONT</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1 tabular-nums">
                    {activeEmail.currency === 'USD' ? '$' : 'R$ '}
                    {activeEmail.totalPrice.toLocaleString('en-US')} (Upfront:{' '}
                    {activeEmail.currency === 'USD' ? '$' : 'R$ '}
                    {activeEmail.upfrontPrice.toLocaleString('en-US')})
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>PLAYER PROJECT DETAILS & REQUEST</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(activeEmail.createdAtIso).toLocaleString()}
                  </span>
                </div>
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {activeEmail.projectDetails}
                </div>
              </div>

              {/* Uploaded Game Screenshots Section */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-zinc-400">
                  ATTACHED GAME IMAGES ({activeEmail.gameImages.length})
                </div>

                {activeEmail.gameImages.length === 0 ? (
                  <div className="p-4 rounded-lg bg-white/[0.01] border border-white/5 text-xs text-zinc-500">
                    No game screenshots attached to this request.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeEmail.gameImages.map((imgSrc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxImage(imgSrc)}
                        className="group relative rounded-xl overflow-hidden border border-white/15 bg-zinc-950 aspect-video text-left cursor-pointer"
                      >
                        <img
                          src={imgSrc}
                          alt={`Player game screenshot ${i + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                        />
                        <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 text-[11px] font-mono text-emerald-300">
                          Click to Enlarge
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox for Game Screenshots */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <div className="relative max-w-4xl w-full">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              aria-label="Close screenshot preview"
              className="absolute -top-10 right-0 p-2 text-zinc-300 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged player game screenshot"
              referrerPolicy="no-referrer"
              className="w-full max-h-[82vh] object-contain rounded-xl border border-white/15"
            />
          </div>
        </div>
      )}
    </section>
  );
};
