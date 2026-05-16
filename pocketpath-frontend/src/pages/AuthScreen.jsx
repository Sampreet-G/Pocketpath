import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AUTH_CSS = `
@keyframes authFadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.auth-wrap {
  min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; background: var(--bg);
}
@media (max-width: 768px) {
  .auth-wrap { grid-template-columns: 1fr; }
  .auth-left  { display: none !important; }
}

.auth-left {
  background: linear-gradient(145deg, #0d2318 0%, #1a3c2e 40%, #2d5c45 100%);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 60px 48px; position: relative; overflow: hidden;
}
.auth-left::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 20%, rgba(74,140,106,0.25) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(232,160,48,0.15) 0%, transparent 50%);
}
.auth-blob { position:absolute; border-radius:50%; filter:blur(60px); opacity:0.15; }
.auth-left-content { position:relative; z-index:1; color:#fff; max-width:380px; width:100%; }
.auth-tagline { font-family:var(--font-d); font-size:40px; font-weight:800; line-height:1.15; margin:28px 0 16px; letter-spacing:-1px; }
.auth-tagline span { color:#7DE8A8; }
.auth-sub { font-size:15px; opacity:0.65; line-height:1.75; }

.auth-card-demo {
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
  border-radius:20px; padding:22px; margin-top:36px;
  backdrop-filter:blur(10px); animation: float 4s ease-in-out infinite;
}
.auth-demo-bal { font-family:var(--font-d); font-size:30px; font-weight:800; color:#fff; }
.auth-demo-label { font-size:10px; opacity:0.5; margin-bottom:6px; letter-spacing:0.8px; text-transform:uppercase; }
.auth-demo-row { display:flex; gap:20px; margin-top:14px; }
.auth-demo-stat-val { font-size:14px; font-weight:700; }
.auth-demo-stat-label { font-size:10px; opacity:0.5; margin-top:2px; }

.auth-features { margin-top:40px; display:flex; flex-direction:column; gap:16px; }
.auth-feat { display:flex; align-items:center; gap:14px; }
.auth-feat-icon { width:42px; height:42px; border-radius:13px; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; border:1px solid rgba(255,255,255,0.1); }
.auth-feat-text { font-size:13px; opacity:0.7; line-height:1.45; }
.auth-feat-text strong { opacity:1; color:#fff; display:block; font-size:13px; margin-bottom:1px; }

.auth-right {
  display:flex; flex-direction:column; justify-content:center; align-items:center;
  padding:40px 32px; overflow-y:auto;
}
.auth-form-wrap { width:100%; max-width:420px; animation:authFadeIn 0.4s ease forwards; }
.auth-brand { display:flex; align-items:center; gap:8px; margin-bottom:36px; }
.auth-brand-dot { width:10px; height:10px; border-radius:50%; background:var(--accent); }
.auth-brand-name { font-family:var(--font-d); font-size:22px; font-weight:800; color:var(--green); }
.auth-title { font-family:var(--font-d); font-size:28px; font-weight:800; color:var(--text); line-height:1.1; margin-bottom:6px; }
.auth-subtitle { font-size:13px; color:var(--text-muted); margin-bottom:26px; line-height:1.6; }

.social-btn {
  display:flex; align-items:center; justify-content:center; gap:10px;
  width:100%; padding:13px 16px; border-radius:var(--r-sm);
  border:1.5px solid var(--border); background:var(--surface);
  font-family:var(--font-b); font-size:14px; font-weight:500; color:var(--text);
  cursor:pointer; transition:all 0.2s; margin-bottom:10px;
}
.social-btn:hover { background:var(--bg2); border-color:var(--text-mid); transform:translateY(-1px); box-shadow:var(--shadow); }


.auth-divider { display:flex; align-items:center; gap:12px; margin:18px 0; }
.auth-divider-line { flex:1; height:1px; background:var(--border); }
.auth-divider-text { font-size:12px; color:var(--text-muted); font-weight:500; white-space:nowrap; }

.auth-input-wrap { position:relative; margin-bottom:12px; }
.auth-input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; z-index:1; }
.auth-input {
  width:100%; background:var(--surface); border:1.5px solid var(--border);
  border-radius:var(--r-xs); padding:13px 14px 13px 42px;
  font-family:var(--font-b); font-size:14px; color:var(--text);
  outline:none; transition:border-color 0.2s, box-shadow 0.2s; display:block;
}
.auth-input:focus { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(74,140,106,0.12); }
.auth-input::placeholder { color:var(--text-muted); }

.auth-submit {
  width:100%; padding:15px; border-radius:var(--r-sm); border:none;
  background:var(--green); color:#fff; font-family:var(--font-b);
  font-size:15px; font-weight:700; cursor:pointer; transition:all 0.2s;
  margin-top:6px; position:relative; overflow:hidden;
}
.auth-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(26,60,46,0.25); }
.auth-submit:disabled { opacity:0.65; cursor:not-allowed; }
.auth-submit-shimmer {
  position:absolute; inset:0;
  background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%);
  background-size:200% 100%; animation:shimmer 1.5s infinite;
}
.auth-err { background:var(--red-light); color:var(--red); border-radius:var(--r-xs); padding:11px 14px; font-size:13px; font-weight:500; margin-bottom:12px; border:1px solid rgba(201,64,64,0.15); }
.auth-toggle { text-align:center; margin-top:22px; font-size:13px; color:var(--text-muted); }
.auth-toggle-link { color:var(--green); font-weight:700; cursor:pointer; }
.auth-toggle-link:hover { text-decoration:underline; }
.auth-terms { text-align:center; margin-top:14px; font-size:11px; color:var(--text-muted); line-height:1.6; }
.auth-terms a { color:var(--green); text-decoration:none; }
.auth-income-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
`;

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode,    setMode]    = useState('login');
  const [form,    setForm]    = useState({ name:'', email:'', password:'', monthlyIncome:'', currency:'INR' });
  const [err,     setErr]     = useState('');
  const [info,    setInfo]    = useState('');
  const [busy,    setBusy]    = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function pwdStrength(pw) {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label:'Weak', color:'#E05555', width:'25%' };
    if (score <= 2) return { label:'Fair', color:'#E8A030', width:'50%' };
    if (score <= 3) return { label:'Good', color:'#4A8C6A', width:'75%' };
    return { label:'Strong', color:'#2D8A5A', width:'100%' };
  }
  const strength = mode === 'register' ? pwdStrength(form.password) : null;

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setErr(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) { setErr('Name is required'); setBusy(false); return; }
        await register({ name: form.name, email: form.email, password: form.password, monthlyIncome: Number(form.monthlyIncome)||0, currency: form.currency });
      }
    } catch (ex) {
      setErr(ex.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }



  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: AUTH_CSS }}/>
      <div className="auth-wrap">

        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-blob" style={{width:400,height:400,background:'#4A8C6A',top:-120,left:-100}}/>
          <div className="auth-blob" style={{width:280,height:280,background:'#E8A030',bottom:-80,right:-60}}/>
          <div className="auth-left-content">
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:'#E8A030'}}/>
              <span style={{fontFamily:'var(--font-d)',fontSize:18,fontWeight:800,color:'rgba(255,255,255,0.9)'}}>PocketPath</span>
            </div>
            <div className="auth-tagline">Your money,<br/><span>under control.</span></div>
            <div className="auth-sub">Track spending, hit savings goals, and build better money habits — designed for young professionals.</div>
            <div className="auth-card-demo">
              <div className="auth-demo-label">Total Balance</div>
              <div className="auth-demo-bal">₹38,420</div>
              <div className="auth-demo-row">
                <div><div className="auth-demo-stat-val" style={{color:'#7DE8A8'}}>+₹42K</div><div className="auth-demo-stat-label">Income</div></div>
                <div><div className="auth-demo-stat-val" style={{color:'#FFB3B3'}}>-₹3.6K</div><div className="auth-demo-stat-label">Spent</div></div>
                <div><div className="auth-demo-stat-val" style={{color:'#FFD580'}}>91%</div><div className="auth-demo-stat-label">Saved</div></div>
              </div>
            </div>
            <div className="auth-features">
              {[{icon:'📊',t:'Smart Dashboard',s:'Real-time balance, trends & insights'},{icon:'🎯',t:'Goal Tracking',s:'Set targets, watch savings grow'},{icon:'🧘',t:'Money Journal',s:'Weekly reflection for mindful habits'}].map((f,i)=>(
                <div key={i} className="auth-feat">
                  <div className="auth-feat-icon">{f.icon}</div>
                  <div className="auth-feat-text"><strong>{f.t}</strong>{f.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-brand">
              <div className="auth-brand-dot"/>
              <div className="auth-brand-name">PocketPath</div>
            </div>
            <div className="auth-title">{mode==='login'?'Welcome back 👋':'Create account 🎯'}</div>
            <div className="auth-subtitle">{mode==='login'?'Sign in to continue to your dashboard':'Start your financial journey today — free forever'}</div>

            {/* Google sign in */}
            <div style={{marginBottom:18}}>
              <button className="social-btn" style={{width:'100%',marginBottom:0}} onClick={()=> window.location.href = `${API_BASE}/auth/google`}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36.5 24 36.5c-5.2 0-9.5-3.1-11.2-7.5l-6.5 5C9.7 39.7 16.3 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C41.3 36.2 44 30.5 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="auth-divider">
              <div className="auth-divider-line"/>
              <div className="auth-divider-text">sign in with email</div>
              <div className="auth-divider-line"/>
            </div>

            <form onSubmit={submit}>
              {mode==='register' && (
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input className="auth-input" placeholder="Full name" value={form.name} onChange={set('name')} required/>
                </div>
              )}
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input className="auth-input" type="email" placeholder="Email address" value={form.email} onChange={set('email')} required/>
              </div>
              <div className="auth-input-wrap" style={{marginBottom: strength ? 6 : 12}}>
                <span className="auth-input-icon">🔒</span>
                <input className="auth-input" type={showPwd?'text':'password'} placeholder={mode==='login'?'Password':'Password (min. 6 chars)'} value={form.password} onChange={set('password')} required minLength={6} style={{paddingRight:44}}/>
                <button type="button" onClick={()=>setShowPwd(v=>!v)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--text-muted)',padding:4,lineHeight:1}}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {strength && (
                <div style={{marginBottom:12}}>
                  <div style={{height:3,borderRadius:99,background:'var(--border)',overflow:'hidden',marginBottom:4}}>
                    <div style={{height:'100%',width:strength.width,background:strength.color,borderRadius:99,transition:'all 0.3s'}}/>
                  </div>
                  <div style={{fontSize:11,fontWeight:600,color:strength.color}}>{strength.label} password</div>
                </div>
              )}
              {mode==='register' && (
                <div className="auth-income-row">
                  <div className="auth-input-wrap" style={{marginBottom:12}}>
                    <span className="auth-input-icon">💰</span>
                    <input className="auth-input" type="number" placeholder="Monthly income" value={form.monthlyIncome} onChange={set('monthlyIncome')}/>
                  </div>
                  <div className="auth-input-wrap" style={{marginBottom:12}}>
                    <span className="auth-input-icon">🌍</span>
                    <select className="auth-input" value={form.currency} onChange={set('currency')}>
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </select>
                  </div>
                </div>
              )}
              {err  && <div className="auth-err">⚠️ {err}</div>}
              <button className="auth-submit" type="submit" disabled={busy}>
                {busy && <div className="auth-submit-shimmer"/>}
                {busy ? 'Please wait…' : mode==='login' ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            {mode==='login' && (
              <div style={{textAlign:'right',marginTop:10}}>
                <span style={{fontSize:12,color:'var(--green)',cursor:'pointer',fontWeight:600}}>Forgot password?</span>
              </div>
            )}
            <div className="auth-toggle">
              {mode==='login'?"Don't have an account? ":"Already have an account? "}
              <span className="auth-toggle-link" onClick={()=>{setMode(m=>m==='login'?'register':'login');setErr('');setInfo('');}}>
                {mode==='login'?'Sign up free':'Sign in'}
              </span>
            </div>
            {mode==='register' && (
              <div className="auth-terms">
                By creating an account you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}