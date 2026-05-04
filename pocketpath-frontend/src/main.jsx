import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthScreen from './pages/AuthScreen.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

function Root() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', gap:10, color:'var(--text-muted)', fontFamily:'sans-serif', fontSize:14 }}>
      <div className="spinner"/>Loading PocketPath…
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
const params = new URLSearchParams(window.location.search);
const oauthToken = params.get('token');
if (oauthToken) {
  localStorage.setItem('pp_token', oauthToken);
  window.history.replaceState({}, '', '/');
}