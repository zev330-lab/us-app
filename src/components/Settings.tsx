import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Pencil,
  Check,
  LogOut,
  Trash2,
  Unlink,
  FileText,
  Shield,
  Bell,
  BellOff,
} from 'lucide-react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import { useAuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { deleteCurrentAccount, unlinkFromCouple } from '../services/account';
import { navigate } from '../lib/router';

type DeleteStep = 'idle' | 'confirm' | 'deleting';

export default function Settings() {
  const { user, userDoc, coupleId } = useAuthContext();
  const { logout } = useAuth();
  const { enabled, supported, denied, toggle } = useNotifications(userDoc?.displayName ?? '');

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userDoc?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);

  const [unlinking, setUnlinking] = useState(false);
  const [unlinkConfirm, setUnlinkConfirm] = useState(false);

  const [deleteStep, setDeleteStep] = useState<DeleteStep>('idle');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  if (!user || !userDoc) return null;

  const saveName = async () => {
    const cleaned = nameDraft.trim();
    if (cleaned.length === 0 || cleaned === userDoc.displayName) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await update(ref(db, `users/${user.uid}`), { displayName: cleaned });
      if (coupleId) {
        await update(ref(db, `couples/${coupleId}/partners/${user.uid}`), { name: cleaned });
      }
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  const handleUnlink = async () => {
    if (!coupleId) return;
    setUnlinking(true);
    await unlinkFromCouple(user.uid, coupleId);
    setUnlinking(false);
    navigate('/');
  };

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm.');
      return;
    }
    setDeleteStep('deleting');
    const result = await deleteCurrentAccount(user, coupleId, deletePassword);
    if (result.ok) {
      // deleteUser() signs the user out; AuthContext re-renders to Auth.
      return;
    }
    if (result.error === 'wrong_password') {
      setDeleteError('Wrong password. Try again.');
    } else if (result.error === 'too_many_requests') {
      setDeleteError('Too many attempts. Try again later.');
    } else if (result.error === 'network') {
      setDeleteError('Network problem. Try again in a moment.');
    } else {
      setDeleteError("We couldn't delete your account. Email hello@twoof.us if this persists.");
    }
    setDeleteStep('confirm');
  };

  return (
    <div className="min-h-screen"
         style={{ background: 'linear-gradient(165deg, #0F0F1E 0%, #1A1A2E 40%, #16213E 100%)' }}>
      <div className="max-w-md mx-auto px-6 py-6 min-h-screen flex flex-col">

        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-text-secondary/60 hover:text-text-primary text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <h1 className="text-2xl font-semibold italic text-text-primary"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Settings
          </h1>
          <div className="w-12" />
        </header>

        {/* ── Profile ── */}
        <section className="glass-card p-5 mb-4">
          <p className="section-label mb-3">Profile</p>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-secondary/60">Name</span>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]
                             text-text-primary text-sm w-32 text-right
                             focus:outline-none focus:border-accent/40"
                />
                <button
                  onClick={saveName}
                  disabled={savingName || nameDraft.trim().length === 0}
                  className="p-1.5 rounded-full bg-accent/20 text-accent hover:bg-accent/30
                             disabled:opacity-40 transition-colors"
                  aria-label="Save name"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNameDraft(userDoc.displayName); setEditingName(true); }}
                className="inline-flex items-center gap-2 text-text-primary text-sm hover:text-accent transition-colors group"
              >
                {userDoc.displayName}
                <Pencil size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary/60">Email</span>
            <span className="text-text-primary/70 text-sm">{userDoc.email}</span>
          </div>
        </section>

        {/* ── Notifications ── */}
        {supported && (
          <section className="glass-card p-5 mb-4">
            <button
              onClick={toggle}
              disabled={denied}
              className="w-full flex items-center justify-between hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <div className="text-left">
                <p className="text-text-primary text-sm font-medium">Notifications</p>
                <p className="text-text-secondary/60 text-xs mt-0.5">
                  {denied ? 'Blocked in browser settings' : enabled ? 'On' : 'Off'}
                </p>
              </div>
              {enabled ? <Bell size={18} className="text-accent" /> : <BellOff size={18} className="text-text-secondary/60" />}
            </button>
          </section>
        )}

        {/* ── Couple ── */}
        {coupleId && (
          <section className="glass-card p-5 mb-4">
            <p className="section-label mb-3">Your couple</p>
            {unlinkConfirm ? (
              <div className="space-y-3">
                <p className="text-text-primary/80 text-sm">
                  Unlink from your partner? You'll keep your account; your slider history won't be visible to them
                  anymore. You can re-link with a new code later.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUnlinkConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08]
                               text-text-primary hover:bg-white/[0.08] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnlink}
                    disabled={unlinking}
                    className="flex-1 py-2.5 rounded-xl text-sm bg-feeling/20 text-feeling border border-feeling/20
                               hover:bg-feeling/30 transition-colors disabled:opacity-50"
                  >
                    {unlinking ? 'Unlinking…' : 'Unlink'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setUnlinkConfirm(true)}
                className="w-full flex items-center justify-between text-feeling/80 hover:text-feeling transition-colors"
              >
                <span className="text-sm">Unlink partner</span>
                <Unlink size={16} />
              </button>
            )}
          </section>
        )}

        {/* ── Legal ── */}
        <section className="glass-card p-5 mb-4">
          <p className="section-label mb-3">Legal</p>
          <button
            onClick={() => navigate('/terms')}
            className="w-full flex items-center justify-between py-2 hover:text-accent transition-colors"
          >
            <span className="text-text-primary text-sm">Terms of Service</span>
            <FileText size={14} className="text-text-secondary/60" />
          </button>
          <button
            onClick={() => navigate('/privacy')}
            className="w-full flex items-center justify-between py-2 hover:text-accent transition-colors"
          >
            <span className="text-text-primary text-sm">Privacy Policy</span>
            <Shield size={14} className="text-text-secondary/60" />
          </button>
        </section>

        {/* ── Account ── */}
        <section className="glass-card p-5 mb-4">
          <p className="section-label mb-3">Account</p>
          <button
            onClick={logout}
            className="w-full flex items-center justify-between py-2 text-text-primary hover:text-accent transition-colors"
          >
            <span className="text-sm">Sign out</span>
            <LogOut size={14} />
          </button>

          {deleteStep === 'idle' && (
            <button
              onClick={() => setDeleteStep('confirm')}
              className="w-full flex items-center justify-between py-2 text-feeling/80 hover:text-feeling transition-colors"
            >
              <span className="text-sm">Delete account</span>
              <Trash2 size={14} />
            </button>
          )}

          {(deleteStep === 'confirm' || deleteStep === 'deleting') && (
            <form onSubmit={handleDelete} className="mt-4 p-4 rounded-xl bg-feeling/[0.05] border border-feeling/20 space-y-3">
              <p className="text-text-primary/90 text-sm leading-relaxed">
                Delete your account permanently? This removes your slider state and history.
                {coupleId && ' If you\'re the last member of your couple, your couple\'s shared history is also deleted.'}
                {' '}This can't be undone.
              </p>
              <p className="text-text-secondary/70 text-xs">
                Enter your password to confirm.
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
                disabled={deleteStep === 'deleting'}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]
                           text-text-primary placeholder-text-secondary/40 text-sm
                           focus:outline-none focus:border-accent/40 disabled:opacity-60"
              />
              {deleteError && <p className="text-feeling text-xs">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setDeleteStep('idle'); setDeletePassword(''); setDeleteError(''); }}
                  disabled={deleteStep === 'deleting'}
                  className="flex-1 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08]
                             text-text-primary hover:bg-white/[0.08] disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteStep === 'deleting' || !deletePassword}
                  className="flex-1 py-2.5 rounded-xl text-sm bg-feeling text-bg-deep
                             hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {deleteStep === 'deleting' ? 'Deleting…' : 'Delete forever'}
                </button>
              </div>
            </form>
          )}
        </section>

        <p className="text-text-secondary/40 text-xs text-center mt-6 mb-2">
          Us — a project by Steinmetz Labs.
        </p>
      </div>
    </div>
  );
}
