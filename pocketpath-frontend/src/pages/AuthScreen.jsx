import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { login, register, setError } = useAuth();
  const [mode,   setMode]  = useState('login'); // 'login' | 'register'
  const [form,   setForm]  = useState({ name: '', email: '', password: '', monthlyIncome: '', currency: 'INR' });
  const [err,    setErr]   = useState('');
  const [busy,   setBusy]  = useState(false);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        if (!form.name) { setErr('Name is required'); setBusy(false); return; }
        await register({
          name:          form.name,
          email:         form.email,
          password:      form.password,
          monthlyIncome: Number(form.monthlyIncome) || 0,
          currency:      form.currency,
        });
      }
    } catch (ex) {
      setErr(ex.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  const inp = {
    className: 'input-field',
    style: { marginBottom: 10 },
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--r)',
        padding: '32px 28px', width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
          <div style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>
            PocketPath
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-d)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          {mode === 'login' ? 'Welcome back 👋' : 'Create account 🎯'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          {mode === 'login' ? 'Sign in to your PocketPath account' : 'Start tracking your finances today'}
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <input {...inp} placeholder="Full name" value={form.name} onChange={set('name')} required />
          )}
          <input {...inp} type="email"    placeholder="Email address"   value={form.email}    onChange={set('email')}    required />
          <input {...inp} type="password" placeholder="Password (min 6)" value={form.password} onChange={set('password')} required minLength={6} />
          {mode === 'register' && (
            <>
              <input {...inp} type="number" placeholder="Monthly income (₹) — optional" value={form.monthlyIncome} onChange={set('monthlyIncome')} />
              <select {...inp} value={form.currency} onChange={set('currency')}
                style={{ ...inp.style, width: '100%', background: 'var(--bg)', color: 'var(--text)', borderRadius: 'var(--r-xs)', border: '1.5px solid var(--border)', padding: '12px 14px', fontFamily: 'var(--font-b)', fontSize: 13 }}>
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
                <option value="EUR">€ EUR — Euro</option>
                <option value="GBP">£ GBP — British Pound</option>
              </select>
            </>
          )}

          {err && (
            <div style={{ background: 'var(--red-light)', color: 'var(--red)', borderRadius: 'var(--r-xs)', padding: '10px 14px', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
              ⚠️ {err}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={busy} style={{ opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={{ color: 'var(--green)', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
}