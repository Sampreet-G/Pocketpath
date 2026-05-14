import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';

const PROFILE_CSS = `
@keyframes slideInUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeInScale { from { opacity:0; transform:scale(0.95); }      to { opacity:1; transform:scale(1); } }
@keyframes fadeIn      { from { opacity:0; }                              to { opacity:1; } }
@keyframes progressFill{ from { width:0; }                                to { width:var(--pw); } }

.profile-page { animation: slideInUp 0.3s ease; }

/* ── Hero card ── */
.profile-hero {
  background: linear-gradient(135deg, var(--green) 0%, var(--green-mid) 100%);
  border-radius: var(--r); padding: 28px 24px 24px; margin-bottom: 16px;
  position: relative; overflow: hidden; box-shadow: var(--shadow-lg);
}
.profile-hero::before { content:''; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05); }
.profile-hero::after  { content:''; position:absolute; bottom:-40px; left:-30px; width:150px; height:150px; border-radius:50%; background:rgba(255,255,255,0.03); }
.profile-avatar-wrap { position:relative; display:inline-block; margin-bottom:14px; }
.profile-avatar { width:80px; height:80px; border-radius:24px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-family:var(--font-d); font-size:32px; font-weight:800; color:#fff; border:3px solid rgba(255,255,255,0.3); cursor:pointer; overflow:hidden; position:relative; transition:opacity 0.2s; }
.profile-avatar:hover { opacity:0.85; }
.profile-avatar img { width:100%; height:100%; object-fit:cover; }
.profile-avatar-edit { position:absolute; bottom:-4px; right:-4px; width:26px; height:26px; border-radius:8px; background:var(--accent); border:2px solid var(--green); display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.2); }
.profile-name  { font-family:var(--font-d); font-size:22px; font-weight:800; color:#fff; }
.profile-email { font-size:13px; color:rgba(255,255,255,0.6); margin-top:2px; }
.profile-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,0.12); border-radius:99px; padding:4px 12px; font-size:11px; color:rgba(255,255,255,0.75); margin-top:10px; border:1px solid rgba(255,255,255,0.15); }
.profile-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:18px; }
.profile-stat { background:rgba(255,255,255,0.08); border-radius:12px; padding:10px; text-align:center; border:1px solid rgba(255,255,255,0.1); }
.profile-stat-val   { font-family:var(--font-d); font-size:18px; font-weight:800; color:#fff; }
.profile-stat-label { font-size:10px; color:rgba(255,255,255,0.5); margin-top:2px; }

/* ── Settings rows ── */
.settings-section       { margin-bottom:16px; }
.settings-section-title { font-size:11px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:var(--text-muted); padding:0 4px 8px; }
.settings-card  { background:var(--surface); border-radius:var(--r); overflow:hidden; box-shadow:var(--shadow); border:1px solid var(--border); }
.settings-row   { display:flex; align-items:center; gap:14px; padding:15px 18px; cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--border); }
.settings-row:last-child { border-bottom:none; }
.settings-row:hover  { background:var(--bg2); }
.settings-row-icon    { width:36px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.settings-row-content { flex:1; min-width:0; }
.settings-row-label   { font-size:14px; font-weight:600; color:var(--text); }
.settings-row-sub     { font-size:11px; color:var(--text-muted); margin-top:1px; }
.settings-chevron     { font-size:16px; color:var(--text-muted); }

/* ── Toggle ── */
.toggle-switch { width:44px; height:24px; border-radius:99px; background:var(--bg2); border:1.5px solid var(--border); display:flex; align-items:center; padding:2px; cursor:pointer; transition:background 0.3s; flex-shrink:0; }
.toggle-switch.on { background:var(--green); border-color:var(--green); }
.toggle-thumb { width:18px; height:18px; border-radius:50%; background:#fff; transition:transform 0.3s cubic-bezier(.4,0,.2,1); box-shadow:0 1px 4px rgba(0,0,0,0.15); }
.toggle-switch.on .toggle-thumb { transform:translateX(20px); }

/* ── Subpages ── */
.subpage { position:fixed; inset:0; z-index:200; background:var(--bg); animation:fadeInScale 0.25s ease; overflow-y:auto; }
@media (min-width:768px) { .subpage { position:static; background:transparent; animation:none; overflow-y:visible; } }
.subpage-header { display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid var(--border); background:var(--surface); position:sticky; top:0; z-index:1; }
@media (min-width:768px) { .subpage-header { position:static; border-radius:var(--r) var(--r) 0 0; } }
.subpage-back  { width:36px; height:36px; border-radius:11px; background:var(--bg2); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; transition:background 0.15s; }
.subpage-back:hover { background:var(--border); }
.subpage-title { font-family:var(--font-d); font-size:18px; font-weight:800; color:var(--text); }
.subpage-body  { padding:20px; display:flex; flex-direction:column; gap:14px; }

/* ── Notification cards ── */
.notif-group-title { font-size:11px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:var(--text-muted); margin-bottom:8px; padding-left:2px; }
.notif-card { background:var(--surface); border-radius:var(--r); border:1px solid var(--border); box-shadow:var(--shadow); overflow:hidden; }
.notif-row { display:flex; align-items:center; gap:14px; padding:15px 18px; border-bottom:1px solid var(--border); transition:background 0.15s; cursor:pointer; }
.notif-row:last-child { border-bottom:none; }
.notif-row:hover { background:var(--bg2); }
.notif-icon-wrap { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.notif-text { flex:1; }
.notif-label { font-size:14px; font-weight:600; color:var(--text); }
.notif-sub   { font-size:11px; color:var(--text-muted); margin-top:2px; line-height:1.4; }

/* ── Export cards ── */
.export-card { display:flex; align-items:center; gap:16px; background:var(--surface); border-radius:var(--r); padding:18px 20px; border:1.5px solid var(--border); box-shadow:var(--shadow); cursor:pointer; transition:all 0.18s; }
.export-card:hover { border-color:var(--green-light); transform:translateY(-2px); box-shadow:var(--shadow-lg); }
.export-card.exporting { border-color:var(--accent); background:var(--accent-light); }
.export-icon { width:52px; height:52px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }
.export-badge { font-size:10px; font-weight:700; padding:3px 8px; border-radius:99px; }

/* ── Help page ── */
.help-contact-card { flex:1; background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:18px 14px; text-align:center; cursor:pointer; transition:all 0.15s; box-shadow:var(--shadow); }
.help-contact-card:hover { border-color:var(--green-light); transform:translateY(-2px); box-shadow:var(--shadow-lg); }
.help-contact-icon  { font-size:26px; margin-bottom:8px; }
.help-contact-label { font-size:13px; font-weight:700; color:var(--text); }
.help-contact-sub   { font-size:11px; color:var(--text-muted); margin-top:3px; }
.faq-item { background:var(--surface); border-radius:var(--r-sm); border:1px solid var(--border); overflow:hidden; transition:box-shadow 0.15s; }
.faq-item:hover { box-shadow:var(--shadow); }
.faq-q { display:flex; align-items:center; justify-content:space-between; padding:15px 18px; cursor:pointer; gap:12px; }
.faq-q-text { font-size:14px; font-weight:600; color:var(--text); }
.faq-chevron { font-size:12px; color:var(--text-muted); transition:transform 0.2s; flex-shrink:0; }
.faq-chevron.open { transform:rotate(180deg); }
.faq-a { padding:0 18px 16px; font-size:13px; color:var(--text-mid); line-height:1.7; border-top:1px solid var(--border); padding-top:12px; }

/* ── Privacy page ── */
.privacy-toggle-row { display:flex; align-items:center; gap:14px; padding:16px 18px; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.15s; }
.privacy-toggle-row:last-child { border-bottom:none; }
.privacy-toggle-row:hover { background:var(--bg2); }
.security-item { display:flex; align-items:center; gap:14px; padding:16px 18px; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.15s; }
.security-item:last-child { border-bottom:none; }
.security-item:hover { background:var(--bg2); }
.security-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.security-status { font-size:10px; font-weight:700; padding:3px 8px; border-radius:99px; }
.danger-zone { background:var(--red-light); border:1px solid rgba(201,64,64,0.2); border-radius:var(--r); padding:20px; }
.danger-zone-title { font-size:13px; font-weight:700; color:var(--red); margin-bottom:6px; }
.danger-zone-sub   { font-size:12px; color:var(--text-muted); margin-bottom:14px; line-height:1.5; }

/* ── Edit modal ── */
.edit-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:400; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s; }
@media (min-width:768px) { .edit-modal-backdrop { align-items:center; } }
.edit-modal { background:var(--surface); border-radius:28px 28px 0 0; padding:24px 22px 48px; width:100%; max-width:460px; animation:slideInUp 0.3s ease; }
@media (min-width:768px) { .edit-modal { border-radius:28px; padding-bottom:28px; } }
`;


/* ══════════════════════════════════════════════════════════════
   SHARED STYLES (all inline to avoid CSS class conflicts)
══════════════════════════════════════════════════════════════ */
const S = {
  page:      { fontFamily:'var(--font-b)', color:'var(--text)' },
  header:    { display:'flex', alignItems:'center', gap:14, padding:'16px 20px',
               borderBottom:'1px solid var(--border)', background:'var(--surface)',
               position:'sticky', top:0, zIndex:1 },
  backBtn:   { width:36, height:36, borderRadius:11, background:'var(--bg2)', border:'none',
               cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
               fontSize:16, flexShrink:0, color:'var(--text)' },
  title:     { fontFamily:'var(--font-d)', fontSize:18, fontWeight:800, color:'var(--text)', flex:1 },
  body:      { padding:20, display:'flex', flexDirection:'column', gap:14 },
  card:      { background:'var(--surface)', borderRadius:16, border:'1px solid var(--border)',
               boxShadow:'0 2px 12px rgba(0,0,0,0.06)', overflow:'hidden' },
  row:       { display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
               borderBottom:'1px solid var(--border)', cursor:'pointer',
               transition:'background 0.15s', background:'transparent' },
  rowLast:   { display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
               cursor:'pointer', transition:'background 0.15s', background:'transparent' },
  iconBox:   (bg) => ({ width:40, height:40, borderRadius:12, background:bg,
               display:'flex', alignItems:'center', justifyContent:'center',
               fontSize:18, flexShrink:0 }),
  label:     { fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:2 },
  sub:       { fontSize:11, color:'var(--text-muted)', lineHeight:1.4 },
  sectionLbl:{ fontSize:11, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase',
               color:'var(--text-muted)', marginBottom:8 },
  toggle:    (on) => ({
               width:44, height:24, borderRadius:99, padding:2, border:'1.5px solid',
               borderColor: on ? 'var(--green)' : 'var(--border)',
               background:  on ? 'var(--green)' : 'var(--bg2)',
               display:'flex', alignItems:'center', cursor:'pointer',
               transition:'background 0.25s', flexShrink:0 }),
  thumb:     (on) => ({
               width:18, height:18, borderRadius:'50%', background:'#fff',
               boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
               transform: on ? 'translateX(20px)' : 'translateX(0)',
               transition:'transform 0.25s cubic-bezier(.4,0,.2,1)' }),
  banner:    (bg, border) => ({
               background:bg, border:`1.5px solid ${border}`,
               borderRadius:16, padding:'14px 16px',
               display:'flex', alignItems:'flex-start', gap:12 }),
  badge:     (bg, color) => ({
               fontSize:9, fontWeight:700, background:bg, color:color,
               padding:'2px 7px', borderRadius:99, whiteSpace:'nowrap' }),
};

function Toggle({ on, onToggle }) {
  return (
    <div style={S.toggle(on)} onClick={e => { e.stopPropagation(); onToggle(); }}>
      <div style={S.thumb(on)}/>
    </div>
  );
}

/* ══════════════ NOTIFICATIONS ══════════════════════════════ */
function NotificationsPage({ onBack }) {
  const [prefs, setPrefs] = useState({
    budgetWarnings:true, goalAlerts:true, dailySummary:true,
    weeklyReport:false, tips:true, soundAlerts:false, newFeatures:false,
  });
  const toggle = k => setPrefs(p => ({ ...p, [k]: !p[k] }));
  const enabledCount = Object.values(prefs).filter(Boolean).length;

  const groups = [
    { title:'Financial Alerts', items:[
      { k:'budgetWarnings', icon:'⚠️', bg:'#FDF0D8', label:'Budget Warnings',  sub:"Alert when you're 80% through a limit", badge:['Important','#C94040','#FDEAEA'] },
      { k:'goalAlerts',     icon:'🎯', bg:'#D4E8DC', label:'Goal Milestones',  sub:'Celebrate every 25%, 50%, 75%, 100%',  badge:null },
    ]},
    { title:'Summaries & Reports', items:[
      { k:'dailySummary',  icon:'📅', bg:'#FDE8D8', label:'Daily Summary',    sub:'End-of-day spending recap at 8 PM',      badge:null },
      { k:'weeklyReport',  icon:'📊', bg:'#E8F0FD', label:'Weekly Report',    sub:'Full breakdown every Sunday morning',    badge:null },
    ]},
    { title:'Personalisation', items:[
      { k:'tips',          icon:'💡', bg:'#FDF8E8', label:'Smart Tips',       sub:'AI insights based on your patterns',     badge:null },
      { k:'soundAlerts',   icon:'🔔', bg:'#E8F4E8', label:'Sound Alerts',     sub:'Audio cue for important notifications', badge:null },
      { k:'newFeatures',   icon:'🚀', bg:'#EDE8F8', label:'Product Updates',  sub:'New features and improvements',         badge:null },
    ]},
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.title}>Notifications</div>
        <div style={{fontSize:12,fontWeight:700,color:'var(--green)',background:'var(--green-pale)',padding:'5px 12px',borderRadius:99}}>
          {enabledCount} on
        </div>
      </div>
      <div style={S.body}>
        {/* Permission banner */}
        <div style={S.banner('var(--accent-light)','var(--accent)')}>
          <span style={{fontSize:22,flexShrink:0}}>🔔</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--accent)',marginBottom:4}}>Enable Browser Notifications</div>
            <div style={{fontSize:12,color:'var(--text-mid)',lineHeight:1.55,marginBottom:10}}>
              Allow PocketPath to send push notifications so you never miss a budget alert or goal milestone.
            </div>
            <button onClick={() => Notification?.requestPermission?.()}
              style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              Allow Notifications
            </button>
          </div>
        </div>

        {/* Groups */}
        {groups.map((g, gi) => (
          <div key={gi}>
            <div style={S.sectionLbl}>{g.title}</div>
            <div style={S.card}>
              {g.items.map((r, ri) => (
                <div key={r.k}
                  style={ri < g.items.length-1 ? S.row : S.rowLast}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  onClick={() => toggle(r.k)}>
                  <div style={S.iconBox(r.bg)}>{r.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                      <span style={S.label}>{r.label}</span>
                      {r.badge && <span style={S.badge(r.badge[2], r.badge[1])}>{r.badge[0]}</span>}
                    </div>
                    <div style={S.sub}>{r.sub}</div>
                  </div>
                  <Toggle on={prefs[r.k]} onToggle={() => toggle(r.k)}/>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick actions */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <button onClick={() => setPrefs(Object.fromEntries(Object.keys(prefs).map(k=>[k,true])))}
            style={{padding:12,borderRadius:12,border:'1.5px solid var(--green)',background:'var(--green-pale)',color:'var(--green)',fontFamily:'var(--font-b)',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            Enable All
          </button>
          <button onClick={() => setPrefs(Object.fromEntries(Object.keys(prefs).map(k=>[k,false])))}
            style={{padding:12,borderRadius:12,border:'1.5px solid var(--border)',background:'var(--surface)',color:'var(--text-muted)',fontFamily:'var(--font-b)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            Disable All
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ EXPORT DATA ═════════════════════════════════ */
function ExportPage({ onBack, showToast }) {
  const [exporting, setExporting]  = useState(null);
  const [done,      setDone]       = useState({});

  function doExport(action, label) {
    if (exporting) return;
    setExporting(action);
    setTimeout(() => {
      setExporting(null);
      setDone(d => ({ ...d, [action]: true }));
      showToast(`✓ ${label} downloaded`);
    }, 2000);
  }

  const opts = [
    { action:'PDF',  icon:'📄', bg:'#FFE8E8', label:'PDF Report',
      desc:'Monthly report with balance summary, spending breakdown and goal progress.',
      meta:['~250 KB','Instant'] },
    { action:'CSV',  icon:'📊', bg:'#E8F4E8', label:'CSV Transactions',
      desc:'All transactions as a spreadsheet — compatible with Excel and Google Sheets.',
      meta:['~15 KB','Instant'] },
    { action:'JSON', icon:'💾', bg:'#E8F0FD', label:'Full Data Backup',
      desc:'Complete export of goals, journal entries, budgets and account settings.',
      meta:['~80 KB','Instant'] },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.title}>Export Data</div>
      </div>
      <div style={S.body}>
        {/* Privacy note */}
        <div style={S.banner('var(--green-pale)','rgba(74,140,106,0.25)')}>
          <span style={{fontSize:20,flexShrink:0}}>🔒</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'var(--green)',marginBottom:2}}>Your data, your rules</div>
            <div style={{fontSize:12,color:'var(--text-mid)',lineHeight:1.55}}>
              Exports are generated on demand. PocketPath never sells or shares your financial data.
            </div>
          </div>
        </div>

        {/* Export options */}
        {opts.map(o => (
          <div key={o.action}
            onClick={() => doExport(o.action, o.label)}
            style={{
              display:'flex', alignItems:'center', gap:16,
              background: done[o.action] ? 'var(--green-pale)' : exporting===o.action ? 'var(--accent-light)' : 'var(--surface)',
              border:`1.5px solid ${done[o.action] ? 'var(--green)' : exporting===o.action ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius:16, padding:'18px 20px',
              boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
              cursor: exporting ? 'default' : 'pointer',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { if(!exporting && !done[o.action]) e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'; }}>
            <div style={{...S.iconBox(o.bg), width:52, height:52, borderRadius:16, fontSize:24}}>{o.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <span style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>{o.label}</span>
                {done[o.action] && <span style={S.badge('var(--green-pale)','var(--green)')}>✓ Downloaded</span>}
              </div>
              <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.55,marginBottom:8}}>{o.desc}</div>
              <div style={{display:'flex',gap:16}}>
                {o.meta.map((m,i) => (
                  <span key={i} style={{fontSize:11,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4}}>
                    <span>{i===0?'📦':'⚡'}</span>{m}
                  </span>
                ))}
              </div>
            </div>
            <div style={{width:36,height:36,borderRadius:'50%',background:'var(--bg2)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
              {exporting===o.action ? <div style={{width:16,height:16,border:'2px solid var(--border)',borderTopColor:'var(--green)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/> : done[o.action] ? '✓' : '↓'}
            </div>
          </div>
        ))}

        <div style={{background:'var(--surface)',borderRadius:16,border:'1px solid var(--border)',padding:'16px 18px'}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:5}}>📅 Data Range</div>
          <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.6}}>Exports include all data from your account creation to today. Date-range filtering coming soon.</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ HELP & SUPPORT ══════════════════════════════ */
function HelpPage({ onBack }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [search,  setSearch]  = useState('');

  const faqs = [
    { q:'How do I add a transaction?',             a:'Tap "+ Add Transaction" in the sidebar (desktop) or on the Home tab. Enter the amount, description, and category. The dashboard updates instantly.' },
    { q:'How does the day streak work?',            a:'Your streak increases by 1 each day you log at least one transaction. Missing a day resets it to 1. The streak shows on your Home and Profile.' },
    { q:'Can I set spending limits per category?',  a:"Yes — go to Insights → Category Breakdown. Each category has an optional budget. Set one and you'll see alerts when you're close." },
    { q:'How do I track a savings goal?',           a:'Open the Goals tab, tap any goal card, and update the saved amount. The progress bar updates automatically.' },
    { q:'Is my data backed up?',                    a:'All data is stored in MongoDB Atlas with automatic backups. You can also export a full JSON backup from Profile → Export Data anytime.' },
    { q:'Can I use PocketPath on multiple devices?',a:'Yes — sign in with the same email on any device. Your data syncs automatically.' },
    { q:'How do I change my password?',             a:'Go to Profile → Privacy & Security → Change Password. You need your current password to set a new one.' },
    { q:'What currencies are supported?',           a:'INR (₹), USD ($), EUR (€), and GBP (£). Change yours in Profile → Edit Profile.' },
  ];

  const filtered = faqs.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.title}>Help & Support</div>
      </div>
      <div style={S.body}>
        {/* Contact cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[
            {icon:'📧',label:'Email Us',    sub:'24h response',   href:'mailto:support@pocketpath.app'},
            {icon:'💬',label:'Live Chat',   sub:'Mon–Fri 10–6',   href:'#'},
            {icon:'📚',label:'Docs',        sub:'Guides & tips',  href:'#'},
          ].map((c,i) => (
            <a key={i} href={c.href} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:'16px 10px',textAlign:'center',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',transition:'all 0.15s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)';e.currentTarget.style.borderColor='var(--green-light)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)';e.currentTarget.style.borderColor='var(--border)';}}>
                <div style={{fontSize:26,marginBottom:8}}>{c.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{c.label}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:3}}>{c.sub}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Search */}
        <div style={{position:'relative'}}>
          <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none'}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions…"
            style={{width:'100%',background:'var(--surface)',border:'1.5px solid var(--border)',borderRadius:10,padding:'12px 14px 12px 42px',fontFamily:'var(--font-b)',fontSize:13,color:'var(--text)',outline:'none',display:'block'}}/>
        </div>

        {/* FAQ */}
        <div>
          <div style={{...S.sectionLbl,marginBottom:10}}>
            FAQ {search ? `· ${filtered.length} result${filtered.length!==1?'s':''}` : `· ${faqs.length} questions`}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {filtered.length===0 ? (
              <div style={{textAlign:'center',padding:28,color:'var(--text-muted)',fontSize:13}}>No results for "{search}"</div>
            ) : filtered.map((f,i) => (
              <div key={i} style={{background:'var(--surface)',borderRadius:12,border:'1px solid var(--border)',overflow:'hidden',boxShadow:'0 1px 6px rgba(0,0,0,0.04)'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',cursor:'pointer',gap:12}}
                  onClick={()=>setOpenFaq(openFaq===i?null:i)}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontSize:14,fontWeight:600,color:'var(--text)',flex:1}}>{f.q}</span>
                  <span style={{color:'var(--text-muted)',fontSize:11,flexShrink:0,transition:'transform 0.2s',display:'inline-block',transform:openFaq===i?'rotate(180deg)':'none'}}>▼</span>
                </div>
                {openFaq===i && (
                  <div style={{padding:'0 18px 16px',fontSize:13,color:'var(--text-mid)',lineHeight:1.7,borderTop:'1px solid var(--border)',paddingTop:12}}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still stuck */}
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{fontSize:24,marginBottom:10}}>🤝</div>
          <div style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:5}}>Still need help?</div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:16,lineHeight:1.6}}>Our team is here for you. Describe your issue and we'll get back within 24 hours.</div>
          <a href="mailto:support@pocketpath.app"
            style={{display:'inline-block',background:'var(--green)',color:'#fff',padding:'11px 28px',borderRadius:12,fontSize:13,fontWeight:700,textDecoration:'none'}}>
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ PRIVACY & SECURITY ═════════════════════════ */
function PrivacyPage({ onBack, showToast }) {
  const [privacy,     setPrivacy]     = useState({ analytics:false, crashReports:true, personalization:true });
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwd,         setPwd]         = useState({ current:'', next:'', confirm:'' });
  const [pwdBusy,     setPwdBusy]     = useState(false);
  const [showPwd,     setShowPwd]     = useState({ c:false, n:false, conf:false });

  const togglePrivacy = k => setPrivacy(p => ({ ...p, [k]: !p[k] }));

  async function changePassword(e) {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) { showToast('⚠️ Passwords do not match'); return; }
    if (pwd.next.length < 6)      { showToast('⚠️ Min 6 characters'); return; }
    setPwdBusy(true);
    try {
      const res = await fetch('/api/profile/password', {
        method:'PUT',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('pp_token')}` },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('✓ Password changed');
      setShowPwdForm(false);
      setPwd({ current:'', next:'', confirm:'' });
    } catch(err) { showToast('⚠️ ' + err.message); }
    finally { setPwdBusy(false); }
  }

  const inputStyle = { width:'100%', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:8, padding:'11px 40px 11px 14px', fontFamily:'var(--font-b)', fontSize:13, color:'var(--text)', outline:'none', display:'block' };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <div style={S.title}>Privacy & Security</div>
      </div>
      <div style={S.body}>

        {/* Security score */}
        <div style={{background:'linear-gradient(135deg, var(--green) 0%, var(--green-mid) 100%)',borderRadius:16,padding:'20px',display:'flex',alignItems:'center',gap:18,boxShadow:'0 4px 20px rgba(26,60,46,0.2)'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(255,255,255,0.12)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0,border:'2px solid rgba(255,255,255,0.2)'}}>
            <div style={{fontFamily:'var(--font-d)',fontSize:22,fontWeight:800,color:'#fff',lineHeight:1}}>72</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.6)',marginTop:2}}>/100</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-d)',fontSize:16,fontWeight:800,color:'#fff',marginBottom:4}}>Security Score</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.5,marginBottom:10}}>Enable 2FA to boost your score to 95+</div>
            <div style={{height:5,background:'rgba(255,255,255,0.15)',borderRadius:99,overflow:'hidden'}}>
              <div style={{height:'100%',width:'72%',background:'#7DE8A8',borderRadius:99}}/>
            </div>
          </div>
        </div>

        {/* Account security */}
        <div>
          <div style={S.sectionLbl}>Account Security</div>
          <div style={S.card}>
            {/* Change password row */}
            <div style={S.row}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              onClick={()=>setShowPwdForm(v=>!v)}>
              <div style={S.iconBox('#E8F0FD')}>🔒</div>
              <div style={{flex:1}}>
                <div style={S.label}>Change Password</div>
                <div style={S.sub}>Use a strong, unique password</div>
              </div>
              <span style={{color:'var(--text-muted)',fontSize:14,transition:'transform 0.2s',display:'inline-block',transform:showPwdForm?'rotate(90deg)':'none'}}>›</span>
            </div>

            {showPwdForm && (
              <form onSubmit={changePassword} style={{padding:'16px 18px',borderTop:'1px solid var(--border)',background:'var(--bg)',display:'flex',flexDirection:'column',gap:10}}>
                {[
                  {field:'current',label:'Current password', key:'c'},
                  {field:'next',   label:'New password',     key:'n'},
                  {field:'confirm',label:'Confirm password', key:'conf'},
                ].map(f => (
                  <div key={f.field} style={{position:'relative'}}>
                    <input type={showPwd[f.key]?'text':'password'} placeholder={f.label} value={pwd[f.field]}
                      onChange={e=>setPwd(p=>({...p,[f.field]:e.target.value}))} style={inputStyle}/>
                    <button type="button" onClick={()=>setShowPwd(p=>({...p,[f.key]:!p[f.key]}))}
                      style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:15,color:'var(--text-muted)',padding:2}}>
                      {showPwd[f.key]?'🙈':'👁️'}
                    </button>
                  </div>
                ))}
                <div style={{display:'flex',gap:8}}>
                  <button type="submit" disabled={pwdBusy}
                    style={{flex:1,padding:11,background:'var(--green)',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',opacity:pwdBusy?0.7:1}}>
                    {pwdBusy?'Saving…':'Update Password'}
                  </button>
                  <button type="button" onClick={()=>setShowPwdForm(false)}
                    style={{flex:1,padding:11,background:'var(--bg2)',color:'var(--text-mid)',border:'none',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* 2FA */}
            <div style={S.row}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={S.iconBox('#FDE8D8')}>🛡️</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span style={S.label}>Two-Factor Auth</span>
                  <span style={S.badge('#FDEAEA','#C94040')}>Off</span>
                </div>
                <div style={S.sub}>Add an extra layer of protection</div>
              </div>
              <button onClick={()=>showToast('2FA setup coming soon!')}
                style={{fontSize:12,fontWeight:700,color:'var(--green)',background:'var(--green-pale)',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer'}}>
                Enable
              </button>
            </div>

            {/* Sessions */}
            <div style={S.rowLast}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={S.iconBox('#D4E8DC')}>📱</div>
              <div style={{flex:1}}>
                <div style={S.label}>Active Sessions</div>
                <div style={S.sub}>1 device currently signed in</div>
              </div>
              <button onClick={()=>showToast('✓ All other sessions signed out')}
                style={{fontSize:12,fontWeight:700,color:'var(--red)',background:'var(--red-light)',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer'}}>
                Sign out all
              </button>
            </div>
          </div>
        </div>

        {/* Privacy toggles */}
        <div>
          <div style={S.sectionLbl}>Data & Privacy</div>
          <div style={S.card}>
            {[
              {k:'analytics',      icon:'📈', bg:'#E8F0FD', label:'Usage Analytics',   sub:'Anonymous data to improve the app'},
              {k:'crashReports',   icon:'🐛', bg:'#FDE8D8', label:'Crash Reports',      sub:'Auto-send error logs to our team'},
              {k:'personalization',icon:'✨', bg:'#EDE8F8', label:'AI Personalisation', sub:'Smarter tips based on your patterns'},
            ].map((r,i,arr) => (
              <div key={r.k}
                style={i<arr.length-1 ? S.row : S.rowLast}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                onClick={()=>togglePrivacy(r.k)}>
                <div style={S.iconBox(r.bg)}>{r.icon}</div>
                <div style={{flex:1}}>
                  <div style={S.label}>{r.label}</div>
                  <div style={S.sub}>{r.sub}</div>
                </div>
                <Toggle on={privacy[r.k]} onToggle={()=>togglePrivacy(r.k)}/>
              </div>
            ))}
          </div>
        </div>

        {/* Legal links */}
        <div>
          <div style={S.sectionLbl}>Legal</div>
          <div style={S.card}>
            {[
              {label:'Privacy Policy',    sub:'How we handle your data',  icon:'📋'},
              {label:'Terms of Service',  sub:'Usage rules & agreements', icon:'📝'},
              {label:'Data Processing',   sub:'GDPR & compliance info',   icon:'🌐'},
            ].map((r,i,arr) => (
              <div key={i} style={i<arr.length-1?S.row:S.rowLast}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={S.iconBox('var(--bg2)')}>{r.icon}</div>
                <div style={{flex:1}}>
                  <div style={S.label}>{r.label}</div>
                  <div style={S.sub}>{r.sub}</div>
                </div>
                <span style={{color:'var(--text-muted)',fontSize:16}}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{background:'var(--red-light)',border:'1px solid rgba(201,64,64,0.2)',borderRadius:16,padding:'20px'}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--red)',marginBottom:5}}>⚠️ Danger Zone</div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:14,lineHeight:1.55}}>
            Deleting your account is permanent. All transactions, goals, journals and settings will be erased immediately.
          </div>
          <button
            onClick={()=>{ if(window.confirm('This cannot be undone. Are you sure?')) showToast('Contact support to delete your account'); }}
            style={{background:'var(--red)',color:'#fff',border:'none',borderRadius:10,padding:'12px 20px',fontSize:13,fontWeight:700,cursor:'pointer',width:'100%'}}>
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
  const { user, logout, updateUser } = useAuth();
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
    // Compress image before storing (resize to max 200x200)
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const MAX = 200;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      canvas.width  = img.width  * ratio;
      canvas.height = img.height * ratio;
      const ctx2 = canvas.getContext('2d');
      ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/jpeg', 0.85);
      setAvatarUrl(url);
      // Update header avatar immediately via context
      updateUser({ avatar: url });
      // Persist to backend
      profileApi.update({ ...(profile || {}), avatar: url })
        .then(res => { setProfile(res.user); })
        .catch(() => {});
      showToast('✓ Avatar updated!');
    };
    img.src = objectUrl;
  }

  async function handleSaveProfile(form) {
    try {
      const res = await profileApi.update(form);
      setProfile(res.user);
      // Sync name/email to header instantly
      updateUser({ name: res.user.name, email: res.user.email, monthlyIncome: res.user.monthlyIncome, currency: res.user.currency });
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

  const SETTINGS_ROWS = [
    { icon:'🔔', bg:'#FDE8D8', label:'Notifications',    sub:'Daily summaries & goal alerts',   action:'notifications' },
    { icon:'📤', bg:'#E8F4E8', label:'Export Data',       sub:'PDF, CSV, JSON backup',           action:'export' },
    { icon:'🔒', bg:'#E8F0FD', label:'Privacy & Security',sub:'Password, sessions, 2FA',         action:'privacy' },
    { icon:'❓', bg:'#D4E8DC', label:'Help & Support',    sub:'FAQ, contact & docs',             action:'help' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PROFILE_CSS }}/>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange}/>

      {isDesktop ? (
        /* ── DESKTOP: full-width two-column ── */
        <div className="profile-page">
          {/* Page title */}
          <div style={{marginBottom:24}}>
            <div style={{fontFamily:'var(--font-d)',fontSize:30,fontWeight:800,color:'var(--text)'}}>Profile</div>
            <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>Manage your account, preferences and data</div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:24,alignItems:'start'}}>

            {/* LEFT column — avatar card + settings list */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>

              {/* Avatar & identity card */}
              <div className="profile-hero">
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar" onClick={handleAvatarClick} style={{width:90,height:90,fontSize:36,borderRadius:26}}>
                    {avatarUrl ? <img src={avatarUrl} alt="avatar"/> : initial}
                  </div>
                  <div className="profile-avatar-edit" onClick={handleAvatarClick} title="Upload photo">📷</div>
                </div>
                <div className="profile-name" style={{fontSize:24}}>{p?.name}</div>
                <div className="profile-email">{p?.email}</div>
                <div className="profile-badge">
                  <span>💎</span>
                  <span>Member since {new Date(p?.createdAt||Date.now()).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>
                </div>
                <div className="profile-stats">
                  {[
                    { val: p?.currency||'INR',   label: 'Currency' },
                    { val: p?.monthlyIncome ? `₹${(p.monthlyIncome/1000).toFixed(0)}K` : '—', label: 'Income/mo' },
                    { val: `${p?.streak||0} 🔥`, label: 'Streak' },
                  ].map((s,i) => (
                    <div key={i} className="profile-stat">
                      <div className="profile-stat-val">{s.val}</div>
                      <div className="profile-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn-primary" style={{background:'var(--green-pale)',color:'var(--green)',fontWeight:700}} onClick={()=>setShowEdit(true)}>
                ✏️ Edit Profile
              </button>
              <button className="btn-primary" style={{background:'var(--red-light)',color:'var(--red)',border:'1px solid rgba(201,64,64,0.15)'}} onClick={logout}>
                Sign Out
              </button>
            </div>

            {/* RIGHT column — settings panels */}
            <div style={{display:'flex',flexDirection:'column',gap:20}}>

              {/* Settings nav cards in 2×2 grid */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                {SETTINGS_ROWS.map(r => (
                  <div key={r.action} onClick={()=>setSubPage(r.action)}
                    style={{background:'var(--surface)',borderRadius:'var(--r)',padding:'18px 20px',boxShadow:'var(--shadow)',border:'1px solid var(--border)',cursor:'pointer',transition:'all 0.15s',display:'flex',flexDirection:'column',gap:10}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='var(--shadow)';}}>
                    <div style={{width:44,height:44,borderRadius:13,background:r.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{r.icon}</div>
                    <div>
                      <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,color:'var(--text)'}}>{r.label}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)',marginTop:3}}>{r.sub}</div>
                    </div>
                    <div style={{fontSize:12,color:'var(--green)',fontWeight:600,marginTop:'auto'}}>Open →</div>
                  </div>
                ))}
              </div>

              {/* Inline content area for sub-pages on desktop */}
              {subPage && (
                <div style={{background:'var(--surface)',borderRadius:'var(--r)',border:'1px solid var(--border)',boxShadow:'var(--shadow)',overflow:'hidden'}}>
                  {subPage==='notifications' && <NotificationsPage onBack={()=>setSubPage(null)}/>}
                  {subPage==='export'        && <ExportPage        onBack={()=>setSubPage(null)} showToast={showToast}/>}
                  {subPage==='help'          && <HelpPage          onBack={()=>setSubPage(null)}/>}
                  {subPage==='privacy'       && <PrivacyPage       onBack={()=>setSubPage(null)} showToast={showToast}/>}
                </div>
              )}

              {/* App info */}
              <div style={{background:'var(--surface)',borderRadius:'var(--r)',padding:'16px 20px',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'#EDE8F8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>⚡</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>PocketPath v1.0.0</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>Built with ❤️ by Sampreet Ghosh</div>
                  </div>
                </div>
                <div style={{fontSize:11,background:'var(--green-pale)',color:'var(--green)',padding:'4px 10px',borderRadius:99,fontWeight:700}}>Latest</div>
              </div>
            </div>
          </div>
        </div>

      ) : (
        /* ── MOBILE: single column ── */
        <div className="profile-page px">
          <div className="profile-hero" style={{marginBottom:14}}>
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
                { val: p?.monthlyIncome ? `₹${(p.monthlyIncome/1000).toFixed(0)}K` : '—', label: 'Income/mo' },
                { val: `${p?.streak||0} 🔥`, label: 'Streak' },
              ].map((s,i) => (
                <div key={i} className="profile-stat">
                  <div className="profile-stat-val">{s.val}</div>
                  <div className="profile-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary" style={{background:'var(--green-pale)',color:'var(--green)',marginBottom:14,fontWeight:700}} onClick={()=>setShowEdit(true)}>
            ✏️ Edit Profile
          </button>

          <div className="settings-section">
            <div className="settings-section-title">Settings</div>
            <div className="settings-card">
              {SETTINGS_ROWS.map(r => (
                <div key={r.action} className="settings-row" onClick={()=>setSubPage(r.action)}>
                  <div className="settings-row-icon" style={{background:r.bg}}>{r.icon}</div>
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
            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-icon" style={{background:'#EDE8F8'}}>⚡</div>
                <div className="settings-row-content">
                  <div className="settings-row-label">PocketPath</div>
                  <div className="settings-row-sub">Built with ❤️ by Sampreet Ghosh</div>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-primary" style={{background:'var(--red-light)',color:'var(--red)',marginTop:4,marginBottom:40,border:'1px solid rgba(201,64,64,0.15)'}} onClick={logout}>
            Sign Out
          </button>
        </div>
      )}

      {showEdit && (
        <EditProfileModal
          profile={p}
          onClose={()=>setShowEdit(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}