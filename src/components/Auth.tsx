import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

export default function Auth() {
  const { configured, loading, user, session, signIn, signUp, resendConfirmation, refreshUser, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [checkingConfirmation, setCheckingConfirmation] = useState(false);
  const emailNotConfirmed = /email not confirmed|email_not_confirmed/i.test(error);

  useEffect(() => {
    if (!awaitingConfirmation) return;
    const check = async () => {
      if (session) {
        const result = await refreshUser();
        if (result.user?.email_confirmed_at) {
          setAwaitingConfirmation(false);
          navigate('/');
        }
        return;
      }
      // Avant confirmation, Supabase ne crée pas de session. Une tentative de
      // connexion serveur est donc le seul moyen sûr de vérifier l’état réel.
      const result = await signIn(email, password);
      if (!result.error) {
        setAwaitingConfirmation(false);
        navigate('/');
      }
    };
    const timer = window.setInterval(() => void check(), 60000);
    window.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('visibilitychange', check);
    };
  }, [awaitingConfirmation, email, password, session, refreshUser, signIn, navigate]);

  const checkConfirmation = async () => {
    setError('');
    setCheckingConfirmation(true);
    const result = await signIn(email, password);
    setCheckingConfirmation(false);
    if (result.error) setError(result.error.message);
    else { setAwaitingConfirmation(false); navigate('/'); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    if (mode === 'signIn') {
      const result = await signIn(email, password);
      if (result.error) setError(result.error.message);
      else navigate('/');
    } else {
      const result = await signUp(email, password, fullName);
      if (result.error) setError(result.error.message);
      else if (result.needsConfirmation) {
        setAwaitingConfirmation(true);
        setMessage(t('authConfirmEmail'));
      }
      else navigate('/');
    }
    setSubmitting(false);
  };

  if (loading) return <AuthShell><p className="text-sm text-ink/60">{t('loading')}</p></AuthShell>;

  if (!configured) {
    return <AuthShell><p className="text-sm text-alert">{t('authNotConfigured')}</p></AuthShell>;
  }

  if (user) {
    return (
      <AuthShell>
        <p className="text-sm text-ink/70 mb-5">{t('signedInAs')} <strong>{user.email}</strong></p>
        <button onClick={() => void signOut()} className="w-full bg-forest-900 hover:bg-forest-700 text-white font-medium px-4 py-2.5 rounded-md transition-colors">{t('signOut')}</button>
        <Link to="/" className="block text-center mt-4 text-sm text-forest-800 hover:underline">{t('backHome')}</Link>
      </AuthShell>
    );
  }

  if (awaitingConfirmation) {
    return (
      <AuthShell>
        <p className="text-sm text-forest-800 mb-4">{t('authConfirmEmail')}</p>
        <p className="text-sm text-ink/70 mb-5">{t('authConfirmationExplanation')}</p>
        <button
          type="button"
          onClick={() => void checkConfirmation()}
          disabled={checkingConfirmation}
          className="w-full bg-forest-900 hover:bg-forest-700 disabled:opacity-60 text-white font-medium px-4 py-2.5 rounded-md transition-colors"
        >
          {checkingConfirmation ? t('authCheckingConfirmation') : t('authCheckConfirmation')}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            const result = await resendConfirmation(email);
            setSubmitting(false);
            if (result.error) setError(result.error.message);
            else setMessage(t('authResendSuccess'));
          }}
          className="w-full mt-3 text-sm text-forest-800 underline hover:no-underline disabled:opacity-50"
        >
          {t('authResendConfirmation')}
        </button>
        {error && <p className="text-sm text-alert mt-4" role="alert">{error}</p>}
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="flex border-b border-forest-200 mb-6">
        <button type="button" onClick={() => setMode('signIn')} className={`flex-1 pb-3 text-sm font-medium ${mode === 'signIn' ? 'text-forest-900 border-b-2 border-sun' : 'text-ink/50'}`}>{t('signIn')}</button>
        <button type="button" onClick={() => setMode('signUp')} className={`flex-1 pb-3 text-sm font-medium ${mode === 'signUp' ? 'text-forest-900 border-b-2 border-sun' : 'text-ink/50'}`}>{t('signUp')}</button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'signUp' && <label className="block text-sm"><span className="block mb-1 font-medium">{t('fullName')}</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full border border-forest-200 rounded-md px-3 py-2.5" autoComplete="name" /></label>}
        <label className="block text-sm"><span className="block mb-1 font-medium">{t('email')}</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-forest-200 rounded-md px-3 py-2.5" autoComplete="email" /></label>
        <label className="block text-sm"><span className="block mb-1 font-medium">{t('password')}</span><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-forest-200 rounded-md px-3 py-2.5" autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} /></label>
        {error && <p className="text-sm text-alert" role="alert">{error}</p>}
        {emailNotConfirmed && (
          <button
            type="button"
            disabled={submitting || !email}
            onClick={async () => {
              setSubmitting(true);
              const result = await resendConfirmation(email);
              setSubmitting(false);
              if (result.error) setError(result.error.message);
              else { setError(''); setMessage(t('authResendSuccess')); }
            }}
            className="text-sm text-forest-800 underline hover:no-underline disabled:opacity-50"
          >
            {t('authResendConfirmation')}
          </button>
        )}
        {message && (
          <div className="space-y-2" role="status">
            <p className="text-sm text-forest-800">{message}</p>
            <button
              type="button"
              onClick={() => { setMode('signIn'); setMessage(''); }}
              className="text-sm text-forest-800 underline hover:no-underline"
            >
              {t('authConfirmedSignIn')}
            </button>
          </div>
        )}
        <button disabled={submitting} className="w-full bg-forest-900 hover:bg-forest-700 disabled:opacity-60 text-white font-medium px-4 py-2.5 rounded-md transition-colors">{submitting ? t('loading') : mode === 'signIn' ? t('signIn') : t('createAccount')}</button>
      </form>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="border border-forest-200 rounded-lg bg-white p-6 sm:p-8 shadow-sm">
        <p className="font-mono-num text-xs tracking-widest text-forest-700 mb-2">{t('account')}</p>
        <h1 className="font-display text-2xl font-semibold text-forest-950 mb-6">{t('authTitle')}</h1>
        {children}
      </div>
    </div>
  );
}
