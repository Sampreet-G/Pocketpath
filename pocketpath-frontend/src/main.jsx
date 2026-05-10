import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthScreen from './pages/AuthScreen.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

// ── Handle Google OAuth redirect ─────────────────────────────
// After Google login, backend redirects to /?token=xxx
// We grab it here before React even mounts, store it, clean the URL
const _oauthParams = new URLSearchParams(window.location.search);
const _oauthToken  = _oauthParams.get('token');
const _oauthError  = _oauthParams.get('error');
if (_oauthToken) {
  localStorage.setItem('pp_token', _oauthToken);
  window.history.replaceState({}, '', '/');
}
if (_oauthError) {
  console.warn('OAuth error:', _oauthError);
  window.history.replaceState({}, '', '/');
}

// ── Root component ────────────────────────────────────────────
function Root() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
      gap: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-b)', fontSize: 14,
    }}>
      <div className="spinner"/>
      Loading PocketPath…
    </div>
  )

  if (!user) return <AuthScreen/>
  return <App/>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Root/>
    </AuthProvider>
  </StrictMode>,
)