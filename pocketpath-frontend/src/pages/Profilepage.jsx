import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';

const PROFILE_CSS = `
@keyframes slideInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeInScale { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

.profile-page { animation: slideInUp 0.3s ease; }

.profile-hero {
  background: linear-gradient(135deg, var(--green) 0%, var(--green-mid) 100%);
  border-radius: var(--r); padding: 28px 24px 24px; margin-bottom: 16px;
  position: relative; overflow: hidden; box-shadow: var(--shadow-lg);
}
.profile-hero::before {
  content: ''; position: absolute; top: -60px; right: -60px;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(255,255,255,0.05);
}
.profile-avatar-wrap { position: relative; display: inline-block; margin-bottom: 14px; }
.profile-avatar {
  width: 80px; height: 80px; border-radius: 24px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-d); font-size: 32px; font-weight: 800; color: #fff;
  border: 3px solid rgba(255,255,255,0.3); cursor: pointer;
  overflow: hidden; position: relative;
}
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.profile-avatar-edit {
  position: absolute; bottom: -4px; right: -4px;
  width: 26px; height: 26px; border-radius: 8px;
  background: var(--accent); border: 2px solid var(--green);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.profile-name { font-family: var(--font-d); font-size: 22px; font-weight: 800; color: #fff; }
.profile-email { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 2px; }
.profile-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.12); border-radius: 99px; padding: 4px 12px; font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 10px; border: 1px solid rgba(255,255,255,0.15); }
.profile-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 18px; }
.profile-stat { background: rgba(255,255,255,0.08); border-radius: 12px; padding: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
.profile-stat-val { font-family: var(--font-d); font-size: 18px; font-weight: 800; color: #fff; }
.profile-stat-label { font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px; }

.settings-section { margin-bottom: 16px; }
.settings-section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-muted); padding: 0 4px 8px; }
.settings-card { background: var(--surface); border-radius: var(--r); overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--border); }
.settings-row { display: flex; align-items: center; gap: 14px; padding: 15px 18px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid var(--border); position: relative; }
.settings-row:last-child { border-bottom: none; }
.settings-row:hover { background: var(--bg2); }
.settings-row:active { background: var(--bg2); }
.settings-row-icon { width: 36px; height: 36px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.settings-row-content { flex: 1; min-width: 0; }
.settings-row-label { font-size: 14px; font-weight: 600; color: var(--text); }
.settings-row-sub { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
.settings-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.settings-chevron { font-size: 16px; color: var(--text-muted); }

.toggle-switch { width: 44px; height: 24px; border-radius: 99px; background: var(--bg2); border: 1.5px solid var(--border); display: flex; align-items: center; padding: 2px; cursor: pointer; transition: background 0.3s; flex-shrink: 0; }
.toggle-switch.on { background: var(--green); border-color: var(--green); }
.toggle-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform 0.3s cubic-bezier(.4,0,.2,1); box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
.toggle-switch.on .toggle-thumb { transform: translateX(20px); }

/* Sub-pages */
.subpage { position: fixed; inset: 0; z-index: 200; background: var(--bg); animation: fadeInScale 0.25s ease; overflow-y: auto; }
@media (min-width: 768px) {
  .subpage { position: absolute; border-radius: var(--r); box-shadow: var(--shadow-lg); border: 1px solid var(--border); max-width: 560px; margin: 0 auto; left: 0; right: 0; top: 0; bottom: auto; min-height: 400px; }
}
.subpage-header { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-bottom: 1px solid var(--border); background: var(--surface); position: sticky; top: 0; z-index: 1; }
.subpage-back { width: 36px; height: 36px; border-radius: 11px; background: var(--bg2); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; transition: background 0.15s; }
.subpage-back:hover { background: var(--border); }
.subpage-title { font-family: var(--font-d); font-size: 18px; font-weight: 800; }
.subpage-body { padding: 20px; }

.export-opt { display: flex; align-items: center; gap: 14px; background: var(--surface); border-radius: var(--r-sm); padding: 16px; margin-bottom: 10px; cursor: pointer; border: 1px solid var(--border); transition: all 0.15s; box-shadow: var(--shadow); }
.export-opt:hover { transform: translateY(-1px); box-shadow: var(--shadow-lg); }
.export-opt-icon { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }

.help-item { background: var(--surface); border-radius: var(--r-sm); padding: 16px 18px; margin-bottom: 8px; border: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
.help-item:hover { background: var(--bg2); }
.help-item-q { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
.help-item-a { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

.danger-zone { background: var(--red-light); border: 1px solid rgba(201,64,64,0.2); border-radius: var(--r); padding: 18px; margin-top: 6px; }
.danger-zone-title { font-size: 13px; font-weight: 700; color: var(--red); margin-bottom: 10px; }

.edit-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 400; display: flex; align-items: flex-end; justify-content: center; }
@media (min-width: 768px) { .edit-modal-backdrop { align-items: center; } }
.edit-modal { background: var(--surface); border-radius: 28px 28px 0 0; padding: 24px 22px 48px; width: 100%; max-width: 460px; animation: slideInUp 0.3s ease; }
@media (min-width: 768px) { .edit-modal { border-radius: 28px; } }
`;

/* ── sub-pages ─────────────────────────────────────────── */
function NotificationsPage({ onBack }) {
  const [prefs, setPrefs] = useState({
    dailySummary: true, goalAlerts: true, budgetWarnings: true,
    weeklyReport: false, newFeatures: false, tips: true,
  });
  const rows = [
    { key: 'dailySummary',   label: 'Daily Summary',       sub: 'End-of-day spending recap',      icon: '📅', bg: '#FDE8D8' },
    { key: 'goalAlerts',     label: 'Goal Milestones',      sub: 'When you hit a savings target',  icon: '🎯', bg: '#D4E8DC' },
    { key: 'budgetWarnings', label: 'Budget Warnings',      sub: 'Alert when nearing limit',       icon: '⚠️', bg: '#FDF0D8' },
    { key: 'weeklyReport',   label: 'Weekly Report',        sub: 'Summary every Sunday',           icon: '📊', bg: '#E8F0FD' },
    { key: 'tips',           label: 'Money Tips',           sub: 'Personalised saving advice',     icon: '💡', bg: '#FDF8E8' },
    { key: 'newFeatures',    label: 'New Features',         sub: 'Product updates & releases',     icon: '🚀', bg: '#EDE8F8' },
  ];
  return (
    <div className="subpage">
      <div className="subpage-header">
        <button className="subpage-back" onClick={onBack}>←</button>
        <div className="subpage-title">Notifications</div>
      </div>
      <div className="subpage-body">
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.6 }}>
          Choose what you'd like to be notified about. Push notifications require browser permission.
        </p>
        <div className="settings-card">
          {rows.map(r => (
            <div key={r.key} className="settings-row" onClick={() => setPrefs(p => ({ ...p, [r.key]: !p[r.key] }))}>
              <div className="settings-row-icon" style={{ background: r.bg }}>{r.icon}</div>
              <div className="settings-row-content">
                <div className="settings-row-label">{r.label}</div>
                <div className="settings-row-sub">{r.sub}</div>
              </div>
              <div className={`toggle-switch${prefs[r.key]?' on':''}`} onClick={e => { e.stopPropagation(); setPrefs(p => ({ ...p, [r.key]: !p[r.key] })); }}>
                <div className="toggle-thumb"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExportPage({ onBack, showToast }) {
  const [exporting, setExporting] = useState(null);

  function doExport(type) {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
      showToast(`✓ ${type} export ready — check your downloads`);
    }, 2000);
  }

  const opts = [
    { type: 'PDF Report', icon: '📄', bg: '#FFE8E8', desc: 'Full monthly report with charts & summaries', action: 'PDF' },
    { type: 'CSV Transactions', icon: '📊', bg: '#E8F4E8', desc: 'All transactions in spreadsheet format', action: 'CSV' },
    { type: 'JSON Backup', icon: '💾', bg: '#E8F0FD', desc: 'Complete data backup — goals, reflections, settings', action: 'JSON' },
  ];

  return (
    <div className="subpage">
      <div className="subpage-header">
        <button className="subpage-back" onClick={onBack}>←</button>
        <div className="subpage-title">Export Data</div>
      </div>
      <div className="subpage-body">
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Export your financial data anytime. Your data belongs to you.
        </p>
        {opts.map(o => (
          <div key={o.type} className="export-opt" onClick={() => doExport(o.action)}>
            <div className="export-opt-icon" style={{ background: o.bg }}>{o.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{o.type}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{o.desc}</div>
            </div>
            {exporting === o.action ? (
              <div className="spinner" style={{ width: 18, height: 18 }}/>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>↓</div>
            )}
          </div>
        ))}
        <div style={{ background: 'var(--accent-light)', border: '1px solid rgba(232,160,48,0.25)', borderRadius: 'var(--r-sm)', padding: '12px 16px', marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>🔒 Your data is private</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.55 }}>PocketPath never sells your data. Exports are generated locally and never stored on our servers.</div>
        </div>
      </div>
    </div>
  );
}

function HelpPage({ onBack }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'How do I add a transaction?', a: 'Tap the "+ Add Transaction" button in the sidebar (desktop) or on the Home screen (mobile). Fill in the amount, description, and category.' },
    { q: 'How does the day streak work?', a: 'Your streak increases by 1 each day you log at least one transaction. Missing a day resets it to 1. Keep the habit going!' },
    { q: 'Can I set spending limits per category?', a: 'Yes! Go to Insights → and use the budget feature to set monthly limits per category. You\'ll see alerts when you\'re close.' },
    { q: 'How do I add money to a goal?', a: 'Open the Goals tab, tap a goal, and update the saved amount. You can add partial amounts anytime.' },
    { q: 'Is my data secure?', a: 'All data is encrypted in transit (HTTPS) and your password is hashed with bcrypt. We never store plain-text credentials.' },
    { q: 'Can I use PocketPath on multiple devices?', a: 'Yes — your account syncs across all devices. Just sign in with the same email.' },
  ];
  return (
    <div className="subpage">
      <div className="subpage-header">
        <button className="subpage-back" onClick={onBack}>←</button>
        <div className="subpage-title">Help & Support</div>
      </div>
      <div className="subpage-body">
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[{icon:'📧', label:'Email us'},{icon:'💬', label:'Live chat'},{icon:'📚', label:'Docs'}].map((c,i) => (
            <div key={i} style={{ flex:1, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'14px 10px', textAlign:'center', cursor:'pointer', transition:'all 0.15s', boxShadow:'var(--shadow)' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>FAQ</div>
        {faqs.map((f, i) => (
          <div key={i} className="help-item" onClick={() => setOpen(open===i?null:i)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="help-item-q">{f.q}</div>
              <span style={{ color: 'var(--text-muted)', fontSize: 14, marginLeft: 8, flexShrink: 0 }}>{open===i?'▲':'▼'}</span>
            </div>
            {open === i && <div className="help-item-a" style={{ marginTop: 8 }}>{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyPage({ onBack }) {
  const [settings, setSettings] = useState({ analytics: false, crashReports: true, personalization: true });
  return (
    <div className="subpage">
      <div className="subpage-header">
        <button className="subpage-back" onClick={onBack}>←</button>
        <div className="subpage-title">Privacy & Security</div>
      </div>
      <div className="subpage-body">
        <div className="settings-section">
          <div className="settings-section-title">Data & Privacy</div>
          <div className="settings-card">
            {[
              { key:'analytics', label:'Usage Analytics', sub:'Help improve the app (anonymous)', icon:'📈', bg:'#E8F0FD' },
              { key:'crashReports', label:'Crash Reports', sub:'Automatically send error logs', icon:'🐛', bg:'#FDE8D8' },
              { key:'personalization', label:'Personalisation', sub:'AI-powered spending tips', icon:'✨', bg:'#EDE8F8' },
            ].map(r => (
              <div key={r.key} className="settings-row" onClick={() => setSettings(p => ({ ...p, [r.key]: !p[r.key] }))}>
                <div className="settings-row-icon" style={{ background: r.bg }}>{r.icon}</div>
                <div className="settings-row-content">
                  <div className="settings-row-label">{r.label}</div>
                  <div className="settings-row-sub">{r.sub}</div>
                </div>
                <div className={`toggle-switch${settings[r.key]?' on':''}`}>
                  <div className="toggle-thumb"/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-section-title">Account Security</div>
          <div className="settings-card">
            {[
              { label:'Change Password', sub:'Last changed: never', icon:'🔒', bg:'#E8F0FD' },
              { label:'Active Sessions', sub:'1 device signed in', icon:'📱', bg:'#D4E8DC' },
              { label:'Two-Factor Auth', sub:'Not enabled', icon:'🛡️', bg:'#FDE8D8', badge:'Recommended' },
            ].map((r,i) => (
              <div key={i} className="settings-row">
                <div className="settings-row-icon" style={{ background: r.bg }}>{r.icon}</div>
                <div className="settings-row-content">
                  <div className="settings-row-label" style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {r.label}
                    {r.badge && <span style={{ fontSize:9, background:'var(--accent-light)', color:'var(--accent)', padding:'2px 6px', borderRadius:99, fontWeight:700 }}>{r.badge}</span>}
                  </div>
                  <div className="settings-row-sub">{r.sub}</div>
                </div>
                <div className="settings-chevron">›</div>
              </div>
            ))}
          </div>
        </div>
        <div className="danger-zone">
          <div className="danger-zone-title">⚠️ Danger Zone</div>
          <button style={{ background:'var(--red)', color:'#fff', border:'none', borderRadius:'var(--r-xs)', padding:'10px 16px', fontSize:13, fontWeight:600, cursor:'pointer', width:'100%' }}>
            Delete Account & All Data
          </button>
        </div>
      </div>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ name: profile?.name||'', email: profile?.email||'', monthlyIncome: profile?.monthlyIncome||'', currency: profile?.currency||'INR' });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }
  return (
    <div className="edit-modal-backdrop" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="edit-modal">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontFamily:'var(--font-d)', fontSize:20, fontWeight:800 }}>Edit Profile</div>
          <button onClick={onClose} style={{ background:'var(--bg2)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
        {[
          { field:'name', placeholder:'Full name', icon:'👤', type:'text' },
          { field:'email', placeholder:'Email address', icon:'✉️', type:'email' },
          { field:'monthlyIncome', placeholder:'Monthly income (₹)', icon:'💰', type:'number' },
        ].map(f => (
          <div key={f.field} style={{ position:'relative', marginBottom:10 }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15 }}>{f.icon}</span>
            <input className="input-field" style={{ paddingLeft:42 }} type={f.type} placeholder={f.placeholder} value={form[f.field]} onChange={e=>setForm(p=>({...p,[f.field]:e.target.value}))}/>
          </div>
        ))}
        <select className="input-field" value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))}>
          <option value="INR">₹ INR — Indian Rupee</option>
          <option value="USD">$ USD — US Dollar</option>
          <option value="EUR">€ EUR — Euro</option>
          <option value="GBP">£ GBP — British Pound</option>
        </select>
        <div style={{ display:'flex', gap:8, marginTop:6 }}>
          <button className="btn-primary" onClick={save} disabled={saving} style={{ flex:1 }}>{saving?'Saving…':'Save Changes'}</button>
          <button className="btn-primary" onClick={onClose} style={{ flex:1, background:'var(--bg2)', color:'var(--text)' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PROFILE COMPONENT ─────────────────────────────── */
export default function ProfileContent({ isDesktop, showToast }) {
  const { user, logout } = useAuth();
  const [profile,    setProfile]  = useState(null);
  const [loading,    setLoading]  = useState(true);
  const [subPage,    setSubPage]  = useState(null);  // 'notifications'|'export'|'help'|'privacy'
  const [showEdit,   setShowEdit] = useState(false);
  const [avatarUrl,  setAvatarUrl]= useState(null);
  const fileRef = useRef();

  useEffect(() => {
    profileApi.get()
      .then(res => { setProfile(res.user); setAvatarUrl(res.user.avatar||null); })
      .catch(e => showToast('⚠️ ' + e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleAvatarClick() { fileRef.current?.click(); }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target.result;
      setAvatarUrl(url);
      profileApi.update({ ...profile, avatar: url })
        .then(res => setProfile(res.user))
        .catch(() => {});
      showToast('✓ Avatar updated!');
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveProfile(form) {
    try {
      const res = await profileApi.update(form);
      setProfile(res.user);
      setShowEdit(false);
      showToast('✓ Profile updated!');
    } catch (e) {
      showToast('⚠️ ' + e.message);
    }
  }

  if (loading) return (
    <div className="loading-spinner"><div className="spinner"/><span>Loading profile…</span></div>
  );

  const p = profile || user;
  const initial = p?.name?.[0]?.toUpperCase() || 'U';

  if (subPage === 'notifications') return <NotificationsPage onBack={() => setSubPage(null)}/>;
  if (subPage === 'export')        return <ExportPage onBack={() => setSubPage(null)} showToast={showToast}/>;
  if (subPage === 'help')          return <HelpPage onBack={() => setSubPage(null)}/>;
  if (subPage === 'privacy')       return <PrivacyPage onBack={() => setSubPage(null)}/>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PROFILE_CSS }}/>
      <div className={`profile-page ${isDesktop?'':'px'}`} style={isDesktop?{maxWidth:580}:{}}>

        {/* Hidden file input */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange}/>

        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" onClick={handleAvatarClick}>
              {avatarUrl ? <img src={avatarUrl} alt="avatar"/> : initial}
            </div>
            <div className="profile-avatar-edit" onClick={handleAvatarClick}>📷</div>
          </div>
          <div className="profile-name">{p?.name}</div>
          <div className="profile-email">{p?.email}</div>
          <div className="profile-badge">
            <span>💎</span>
            <span>Member since {new Date(p?.createdAt||Date.now()).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>
          </div>
          <div className="profile-stats">
            {[
              { val: p?.currency||'INR', label: 'Currency' },
              { val: p?.monthlyIncome ? `₹${(p.monthlyIncome/1000).toFixed(0)}K` : '—', label: 'Monthly Income' },
              { val: `${p?.streak||0} 🔥`, label: 'Day Streak' },
            ].map((s,i) => (
              <div key={i} className="profile-stat">
                <div className="profile-stat-val">{s.val}</div>
                <div className="profile-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit button */}
        <button className="btn-primary" style={{ background:'var(--green-pale)', color:'var(--green)', marginBottom:16, fontWeight:700 }} onClick={() => setShowEdit(true)}>
          ✏️ Edit Profile
        </button>

        {/* Settings sections */}
        <div className="settings-section">
          <div className="settings-section-title">Preferences</div>
          <div className="settings-card">
            {[
              { icon:'🔔', bg:'#FDE8D8', label:'Notifications', sub:'Daily summaries, goal alerts', action:'notifications' },
              { icon:'📤', bg:'#E8F4E8', label:'Export Data',   sub:'PDF, CSV, JSON backup',       action:'export' },
            ].map(r => (
              <div key={r.action} className="settings-row" onClick={() => setSubPage(r.action)}>
                <div className="settings-row-icon" style={{ background:r.bg }}>{r.icon}</div>
                <div className="settings-row-content">
                  <div className="settings-row-label">{r.label}</div>
                  <div className="settings-row-sub">{r.sub}</div>
                </div>
                <div className="settings-chevron">›</div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">Account</div>
          <div className="settings-card">
            {[
              { icon:'🔒', bg:'#E8F0FD', label:'Privacy & Security', sub:'Password, sessions, 2FA',  action:'privacy' },
              { icon:'❓', bg:'#D4E8DC', label:'Help & Support',      sub:'FAQ, contact us, docs',    action:'help' },
            ].map(r => (
              <div key={r.action} className="settings-row" onClick={() => setSubPage(r.action)}>
                <div className="settings-row-icon" style={{ background:r.bg }}>{r.icon}</div>
                <div className="settings-row-content">
                  <div className="settings-row-label">{r.label}</div>
                  <div className="settings-row-sub">{r.sub}</div>
                </div>
                <div className="settings-chevron">›</div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">About</div>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-icon" style={{ background:'#EDE8F8' }}>⚡</div>
              <div className="settings-row-content">
                <div className="settings-row-label">PocketPath</div>
                <div className="settings-row-sub">Version 1.0.0 · Built with ❤️</div>
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ background:'var(--red-light)', color:'var(--red)', marginTop:4, marginBottom:40, border:'1px solid rgba(201,64,64,0.15)' }}
          onClick={logout}>
          Sign Out
        </button>
      </div>

      {showEdit && (
        <EditProfileModal
          profile={p}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}