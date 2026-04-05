import { useState, useEffect } from "react";

/* ─── FONTS ─────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');`;

/* ─── CSS ────────────────────────────────────────────────────── */
const CSS = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:           #F5F0E8;
  --bg2:          #EDE8DC;
  --surface:      #FDFAF4;
  --surface2:     #F0EBE0;
  --green:        #1A3C2E;
  --green-mid:    #2D5C45;
  --green-light:  #4A8C6A;
  --green-pale:   #D4E8DC;
  --accent:       #E8A030;
  --accent-light: #FDF0D8;
  --text:         #1A1A18;
  --text-mid:     #5A5A50;
  --text-muted:   #9A9A8A;
  --red:          #C94040;
  --red-light:    #FDEAEA;
  --border:       rgba(26,60,46,0.10);
  --shadow:       0 4px 24px rgba(26,60,46,0.09);
  --shadow-lg:    0 8px 40px rgba(26,60,46,0.14);
  --font-d: 'Syne', sans-serif;
  --font-b: 'DM Sans', sans-serif;
  --r: 20px; --r-sm: 12px; --r-xs: 8px;
  --nav-h: 76px;
  --header-h: 62px;
  --sidebar-w: 240px;
  transition: background 0.25s;
}
[data-dark="true"] {
  --bg:           #111714;
  --bg2:          #181f1b;
  --surface:      #1E2820;
  --surface2:     #242E26;
  --green:        #3DB87A;
  --green-mid:    #2D9060;
  --green-light:  #5FD48E;
  --green-pale:   #1A3028;
  --accent:       #F0B040;
  --accent-light: #2A2010;
  --text:         #EEF4EE;
  --text-mid:     #A8C4A8;
  --text-muted:   #607060;
  --red:          #E06060;
  --red-light:    #2A1818;
  --border:       rgba(100,200,120,0.10);
  --shadow:       0 4px 24px rgba(0,0,0,0.30);
  --shadow-lg:    0 8px 40px rgba(0,0,0,0.40);
}

html, body { background: var(--bg); font-family: var(--font-b); color: var(--text); min-height: 100vh; }

/* ──── MOBILE ──────────────────────────────────── */
.app-mobile { display:flex; flex-direction:column; min-height:100vh; max-width:430px; margin:0 auto; background:var(--bg); }
.mobile-scroll { flex:1; overflow-y:auto; padding-bottom:calc(var(--nav-h) + 12px); -webkit-overflow-scrolling:touch; }
.mobile-scroll::-webkit-scrollbar { display:none; }

.mobile-header {
  position:sticky; top:0; z-index:50; height:var(--header-h);
  background:var(--surface); border-bottom:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between;
  padding:0 18px; backdrop-filter:blur(12px);
}

.bottom-nav {
  position:fixed; bottom:0; left:50%; transform:translateX(-50%);
  width:100%; max-width:430px; height:var(--nav-h);
  background:var(--surface); border-top:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-around;
  padding:0 6px 8px; z-index:100; box-shadow:0 -4px 24px rgba(0,0,0,0.07);
}
.nav-item { display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:6px 10px; border-radius:var(--r-sm); flex:1; border:none; background:none; }
.nav-icon { width:36px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:17px; background:transparent; transition:background 0.2s; }
.nav-item.active .nav-icon { background:var(--green); }
.nav-label { font-size:10px; font-weight:500; color:var(--text-muted); transition:color 0.2s; font-family:var(--font-b); }
.nav-item.active .nav-label { color:var(--green); font-weight:700; }

/* ──── DESKTOP ─────────────────────────────────── */
.app-desktop { display:flex; flex-direction:column; min-height:100vh; background:var(--bg); }

.desktop-header {
  position:fixed; top:0; left:0; right:0; z-index:200; height:var(--header-h);
  background:var(--surface); border-bottom:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between;
  padding:0 28px 0 24px; box-shadow:var(--shadow);
}
.header-nav-btn {
  display:flex; align-items:center; gap:6px;
  padding:7px 14px; border-radius:var(--r-xs); border:none; cursor:pointer;
  font-family:var(--font-b); font-size:13px; transition:all 0.15s;
}

.desktop-body { display:flex; padding-top:var(--header-h); min-height:100vh; }

.sidebar {
  width:var(--sidebar-w); position:fixed; left:0; top:var(--header-h); bottom:0;
  background:var(--surface); border-right:1px solid var(--border);
  display:flex; flex-direction:column; padding:20px 12px; overflow-y:auto; z-index:100;
}
.sidebar::-webkit-scrollbar { display:none; }
.sidebar-item {
  display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:var(--r-sm);
  cursor:pointer; border:none; background:none; width:100%; text-align:left;
  transition:background 0.15s; margin-bottom:2px;
}
.sidebar-item:hover { background:var(--bg2); }
.sidebar-item.active { background:var(--green-pale); }
.sidebar-item.active .si-label { color:var(--green); font-weight:700; }
.si-icon { font-size:18px; width:32px; text-align:center; flex-shrink:0; }
.si-label { font-size:14px; font-weight:500; color:var(--text-mid); font-family:var(--font-b); }
.sidebar-section-label { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--text-muted); padding:16px 14px 6px; }
.sidebar-add-btn { margin-top:auto; padding-top:16px; border-top:1px solid var(--border); }

.desktop-main { margin-left:var(--sidebar-w); flex:1; padding:32px 36px; max-width:1160px; }

/* ──── SHARED ──────────────────────────────────── */
.page { animation:fadeUp 0.28s ease forwards; }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

.brand { font-family:var(--font-d); font-size:20px; font-weight:800; color:var(--green); letter-spacing:-0.5px; display:flex; align-items:center; gap:6px; }
.brand-dot { width:8px; height:8px; border-radius:50%; background:var(--accent); flex-shrink:0; }

.page-header { padding:20px 18px 10px; display:flex; align-items:flex-end; justify-content:space-between; }
.page-title { font-family:var(--font-d); font-size:26px; font-weight:800; color:var(--text); line-height:1.1; }
.desktop-page-title { font-family:var(--font-d); font-size:30px; font-weight:800; color:var(--text); margin-bottom:4px; }
.page-subtitle { font-size:13px; color:var(--text-muted); margin-top:2px; }

.balance-card {
  background:var(--green); border-radius:28px; padding:28px 24px;
  position:relative; overflow:hidden; box-shadow:var(--shadow-lg);
}
.balance-card::before { content:''; position:absolute; top:-40px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.04); }
.balance-card::after  { content:''; position:absolute; bottom:-60px; left:-20px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.03); }
.balance-label { font-size:11px; color:rgba(255,255,255,0.55); font-weight:600; letter-spacing:0.8px; text-transform:uppercase; }
.balance-amount { font-family:var(--font-d); font-size:42px; font-weight:800; color:#fff; margin:6px 0 22px; letter-spacing:-1.5px; }
.balance-row { display:flex; gap:28px; flex-wrap:wrap; }
.stat-label { font-size:10px; color:rgba(255,255,255,0.5); margin-bottom:2px; }
.stat-val { font-size:15px; font-weight:600; color:#fff; }
.stat-val.income { color:#7DE8A8; }
.stat-val.spent  { color:#FFB3B3; }

.spend-chips { display:flex; gap:10px; overflow-x:auto; }
.spend-chips::-webkit-scrollbar { display:none; }
.chip { flex-shrink:0; background:var(--surface); border-radius:var(--r-sm); padding:12px 14px; min-width:88px; box-shadow:var(--shadow); cursor:pointer; transition:transform 0.15s; border:1px solid var(--border); }
.chip:hover { transform:translateY(-2px); }
.chip-icon { font-size:18px; margin-bottom:6px; }
.chip-label { font-size:10px; color:var(--text-muted); font-weight:500; }
.chip-amount { font-size:14px; font-weight:700; color:var(--text); margin-top:1px; font-family:var(--font-d); }

.insight-banner { background:var(--accent-light); border:1.5px solid var(--accent); border-radius:var(--r-sm); padding:13px 15px; display:flex; gap:12px; align-items:flex-start; }
[data-dark="true"] .insight-banner { border-color:rgba(240,176,64,0.3); }
.ins-icon { font-size:20px; flex-shrink:0; margin-top:1px; }
.ins-title { font-size:13px; font-weight:600; color:var(--accent); }
.ins-body { font-size:12px; color:var(--text-mid); margin-top:2px; line-height:1.55; }

.card { background:var(--surface); border-radius:var(--r); padding:20px; box-shadow:var(--shadow); border:1px solid var(--border); }
.section-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.section-title { font-family:var(--font-d); font-size:16px; font-weight:700; color:var(--text); }

.tx-row { display:flex; align-items:center; gap:12px; background:var(--surface); border-radius:var(--r-sm); padding:13px 14px; margin-bottom:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); cursor:pointer; transition:transform 0.15s; border:1px solid var(--border); }
.tx-row:hover { transform:translateX(3px); }
.tx-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.tx-info { flex:1; min-width:0; }
.tx-name { font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tx-cat { font-size:11px; color:var(--text-muted); margin-top:1px; }
.tx-amount { font-size:14px; font-weight:700; font-family:var(--font-d); white-space:nowrap; }
.tx-amount.credit { color:var(--green-light); }
.tx-amount.debit  { color:var(--text); }

.goal-card { background:var(--surface); border-radius:var(--r); padding:18px 20px; box-shadow:var(--shadow); border:1px solid var(--border); cursor:pointer; transition:transform 0.15s; }
.goal-card:hover { transform:translateY(-2px); }
.progress-track { height:6px; background:var(--bg2); border-radius:99px; overflow:hidden; }
.progress-fill  { height:100%; border-radius:99px; background:linear-gradient(90deg, var(--green-light), var(--green)); transition:width 1s cubic-bezier(.4,0,.2,1); }

.wellness-card { background:linear-gradient(135deg, var(--green) 0%, var(--green-mid) 100%); border-radius:var(--r); padding:22px; color:#fff; box-shadow:var(--shadow-lg); }
[data-dark="true"] .wellness-card { background:linear-gradient(135deg,#1A3028 0%,#1D4030 100%); }
.wellness-title { font-family:var(--font-d); font-size:14px; font-weight:700; opacity:0.75; margin-bottom:14px; }
.wellness-score-row { display:flex; align-items:center; gap:18px; }
.wellness-circle { width:76px; height:76px; border-radius:50%; background:rgba(255,255,255,0.10); display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
.wellness-num { font-family:var(--font-d); font-size:28px; font-weight:800; line-height:1; }
.wellness-denom { font-size:10px; opacity:0.6; }
.wellness-pills { flex:1; display:flex; flex-direction:column; gap:7px; }
.wellness-pill { display:flex; align-items:center; gap:8px; font-size:11px; color:rgba(255,255,255,0.85); }
.wellness-pill-bar { flex:1; height:4px; background:rgba(255,255,255,0.15); border-radius:99px; overflow:hidden; }
.wellness-pill-fill { height:100%; border-radius:99px; }

.insight-card { background:var(--surface); border-radius:var(--r); padding:18px 20px; box-shadow:var(--shadow); border:1px solid var(--border); }
.insight-card-title { font-family:var(--font-d); font-size:14px; font-weight:700; margin-bottom:12px; }
.donut-wrap { display:flex; align-items:center; gap:18px; }
.donut-legend { flex:1; display:flex; flex-direction:column; gap:7px; }
.legend-row { display:flex; align-items:center; gap:7px; }
.legend-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.legend-label { font-size:12px; color:var(--text-mid); flex:1; }
.legend-pct { font-size:12px; font-weight:700; font-family:var(--font-d); }

.bar-chart { display:flex; align-items:flex-end; gap:6px; height:80px; }
.bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end; }
.bar { width:100%; border-radius:5px 5px 0 0; transition:height 0.8s cubic-bezier(.4,0,.2,1); min-height:4px; }
.bar-label { font-size:9px; color:var(--text-muted); }

.streak-card { background:var(--accent-light); border:1.5px solid var(--accent); border-radius:var(--r); padding:14px 18px; display:flex; align-items:center; gap:12px; }
[data-dark="true"] .streak-card { border-color:rgba(240,176,64,0.3); }
.streak-num { font-family:var(--font-d); font-size:30px; font-weight:800; color:var(--accent); }
.streak-label { font-size:13px; font-weight:600; color:var(--accent); }
.streak-sub { font-size:11px; color:var(--text-muted); margin-top:1px; }

.reflection-q { font-size:13px; font-weight:600; color:var(--text); margin-bottom:10px; }
.reflection-input { width:100%; background:var(--bg); border:1.5px solid var(--border); border-radius:var(--r-xs); padding:11px 13px; font-family:var(--font-b); font-size:13px; color:var(--text); outline:none; resize:none; transition:border-color 0.2s; }
.reflection-input:focus { border-color:var(--green-light); }
.reflection-input::placeholder { color:var(--text-muted); }

.btn-primary { display:block; width:100%; background:var(--green); color:#fff; font-family:var(--font-b); font-size:14px; font-weight:600; border:none; border-radius:var(--r-sm); padding:15px; cursor:pointer; transition:opacity 0.2s, transform 0.15s; }
.btn-primary:hover { opacity:0.88; }
.btn-primary:active { transform:scale(0.98); }

.add-goal-btn { display:flex; align-items:center; justify-content:center; gap:8px; border:2px dashed var(--green-pale); border-radius:var(--r); padding:16px; cursor:pointer; background:none; color:var(--green-light); font-family:var(--font-b); font-size:13px; font-weight:600; transition:background 0.2s; width:100%; }
.add-goal-btn:hover { background:var(--green-pale); }

.avatar { width:56px; height:56px; border-radius:18px; background:linear-gradient(135deg, var(--green-light), var(--green)); display:flex; align-items:center; justify-content:center; font-size:22px; color:#fff; flex-shrink:0; }
.setting-row { display:flex; align-items:center; gap:13px; padding:14px 18px; background:var(--surface); cursor:pointer; border-bottom:1px solid var(--border); transition:background 0.15s; }
.setting-row:hover { background:var(--bg2); }
.setting-row:first-child { border-radius:var(--r) var(--r) 0 0; }
.setting-row:last-child  { border-radius:0 0 var(--r) var(--r); border-bottom:none; }
.setting-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
.settings-group { border-radius:var(--r); box-shadow:var(--shadow); overflow:hidden; margin-bottom:14px; border:1px solid var(--border); }

/* dark toggle */
.dark-toggle { display:flex; align-items:center; width:48px; height:26px; background:var(--bg2); border-radius:99px; cursor:pointer; border:1.5px solid var(--border); padding:2px; transition:background 0.3s; position:relative; flex-shrink:0; }
[data-dark="true"] .dark-toggle { background:var(--green-pale); }
.dark-toggle-thumb { width:20px; height:20px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center; font-size:11px; transition:transform 0.3s cubic-bezier(.4,0,.2,1); flex-shrink:0; }
[data-dark="true"] .dark-toggle-thumb { transform:translateX(22px); }

/* modal */
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:300; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
.modal-sheet { background:var(--surface); border-radius:28px 28px 0 0; padding:22px 20px 48px; width:100%; max-width:460px; animation:slideUp 0.3s cubic-bezier(.4,0,.2,1); }
@media (min-width:768px) { .modal-backdrop { align-items:center; } .modal-sheet { border-radius:28px; max-height:90vh; overflow-y:auto; } }
@keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
.modal-handle { width:40px; height:4px; background:var(--border); border-radius:99px; margin:0 auto 18px; }
@media (min-width:768px) { .modal-handle { display:none; } }
.modal-title { font-family:var(--font-d); font-size:20px; font-weight:800; margin-bottom:18px; }
.input-field { width:100%; background:var(--bg); border:1.5px solid var(--border); border-radius:var(--r-xs); padding:12px 14px; font-family:var(--font-b); font-size:13px; color:var(--text); outline:none; margin-bottom:10px; transition:border-color 0.2s; }
.input-field:focus { border-color:var(--green-light); }
.input-field::placeholder { color:var(--text-muted); }
.cat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; margin-bottom:18px; }
.cat-btn { border-radius:var(--r-xs); padding:9px 4px; display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; border:1.5px solid var(--border); background:var(--bg); font-size:18px; transition:all 0.15s; }
.cat-btn.selected { border-color:var(--green); background:var(--green-pale); }
.cat-btn span { font-size:10px; color:var(--text-muted); font-weight:500; }

/* desktop stat chips */
.stat-chips-row { display:flex; gap:14px; margin-bottom:20px; flex-wrap:wrap; }
.stat-chip { flex:1; min-width:130px; background:var(--surface); border-radius:var(--r); padding:18px 20px; box-shadow:var(--shadow); border:1px solid var(--border); }
.stat-chip-val { font-family:var(--font-d); font-size:26px; font-weight:800; }
.stat-chip-label { font-size:12px; color:var(--text-muted); margin-top:4px; }

/* desktop grids */
.d-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
.d-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
.d-full   { grid-column:1 / -1; }

/* toast */
.toast { position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:var(--green); color:#fff; border-radius:99px; padding:10px 20px; font-size:13px; font-weight:600; z-index:400; white-space:nowrap; box-shadow:var(--shadow-lg); animation:toastIn 0.3s ease, toastOut 0.3s ease 1.7s forwards; }
@media (min-width:768px) { .toast { bottom:28px; } }
@keyframes toastIn  { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
@keyframes toastOut { to   { opacity:0; transform:translateX(-50%) translateY(8px); } }

/* util */
.px  { padding-left:16px; padding-right:16px; }
.mb  { margin-bottom:14px; }
.gap { display:flex; flex-direction:column; gap:12px; }
`;

/* ─── DATA ─────────────────────────────────────────────────── */
const initTx = [
  { id:1, name:"Salary",  cat:"Income",       amount: 42000, icon:"💰", color:"#D4E8DC" },
  { id:2, name:"Swiggy",  cat:"Food",          amount:  -420, icon:"🍜", color:"#FDE8D8" },
  { id:3, name:"Uber",    cat:"Travel",        amount:  -210, icon:"🚕", color:"#E8E0F8" },
  { id:4, name:"Netflix", cat:"Subscriptions", amount:  -649, icon:"🎬", color:"#FFE8E8" },
  { id:5, name:"Zomato",  cat:"Food",          amount:  -380, icon:"🍕", color:"#FDE8D8" },
  { id:6, name:"DMart",   cat:"Groceries",     amount: -1250, icon:"🛒", color:"#E8F4E8" },
  { id:7, name:"Spotify", cat:"Subscriptions", amount:  -119, icon:"🎵", color:"#FFE8E8" },
  { id:8, name:"PhonePe", cat:"Transfer",      amount: -2000, icon:"📲", color:"#E8F0FD" },
];
const initGoals = [
  { id:1, title:"Goa Trip ✈️",    saved:18000, target:50000, icon:"🏖️", color:"#E8F4FD" },
  { id:2, title:"Emergency Fund", saved:12000, target:20000, icon:"🛡️", color:"#D4E8DC" },
  { id:3, title:"New MacBook",    saved: 8000, target:90000, icon:"💻", color:"#EDE8F8" },
];
const CATS     = ["Food","Travel","Shopping","Groceries","Subscriptions","Income","Transfer","Other"];
const CAT_ICON = { Food:"🍜",Travel:"🚕",Shopping:"🛍️",Groceries:"🛒",Subscriptions:"🎬",Income:"💰",Transfer:"📲",Other:"📌" };
const TABS     = [
  { id:"home",     icon:"🏠", label:"Home"     },
  { id:"activity", icon:"📋", label:"Activity" },
  { id:"goals",    icon:"🎯", label:"Goals"    },
  { id:"insights", icon:"💡", label:"Insights" },
  { id:"reflect",  icon:"🧘", label:"Reflect"  },
  { id:"profile",  icon:"👤", label:"Profile"  },
];

/* ─── HELPERS ─────────────────────────────────────────────── */
function fmtINR(n){
  const a=Math.abs(n);
  if(a>=100000) return `₹${(a/100000).toFixed(1)}L`;
  if(a>=1000)   return `₹${(a/1000).toFixed(1)}K`;
  return `₹${a.toLocaleString("en-IN")}`;
}
const pct=(a,b)=>Math.min(100,Math.round((a/b)*100));

/* ─── DONUT ───────────────────────────────────────────────── */
function Donut({ data }) {
  const size=90,cx=45,cy=45,r=34,stroke=10,circ=2*Math.PI*r;
  let offset=0;
  const slices=data.map(d=>{ const dash=(d.pct/100)*circ,s={...d,dash,offset};offset+=dash;return s; });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
      {slices.map((s,i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${circ-s.dash}`} strokeDashoffset={-s.offset+circ*0.25}
          style={{transform:"rotate(-90deg)",transformOrigin:"center"}}/>
      ))}
      <text x={cx} y={cy+4} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Syne,sans-serif" fill="var(--green)">Apr</text>
    </svg>
  );
}

/* ─── DARK TOGGLE ─────────────────────────────────────────── */
function DarkToggle({ dark, toggle }) {
  return (
    <div className="dark-toggle" onClick={toggle} title="Toggle dark mode">
      <div className="dark-toggle-thumb">{dark?"🌙":"☀️"}</div>
    </div>
  );
}

/* ─── BRAND ───────────────────────────────────────────────── */
function Brand() {
  return <div className="brand"><div className="brand-dot"/>PocketPath</div>;
}

/* ══════════════ PAGE COMPONENTS ══════════════════════════════ */

function HomeContent({ transactions, onAdd, isDesktop }) {
  const spent  = transactions.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0);
  const income = transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
  const balance= income-spent;
  const foodSp = transactions.filter(t=>t.cat==="Food").reduce((s,t)=>s+Math.abs(t.amount),0);
  const travSp = transactions.filter(t=>t.cat==="Travel").reduce((s,t)=>s+Math.abs(t.amount),0);
  const subsSp = transactions.filter(t=>t.cat==="Subscriptions").reduce((s,t)=>s+Math.abs(t.amount),0);
  const grocSp = transactions.filter(t=>t.cat==="Groceries").reduce((s,t)=>s+Math.abs(t.amount),0);
  const recent = [...transactions].reverse().slice(0,5);
  const chips  = [{icon:"🍜",label:"Food",amount:foodSp},{icon:"🚕",label:"Travel",amount:travSp},{icon:"🎬",label:"Subscriptions",amount:subsSp},{icon:"🛒",label:"Groceries",amount:grocSp}];

  const BalCard = () => (
    <div className="balance-card">
      <div className="balance-label">Total Balance</div>
      <div className="balance-amount">{fmtINR(balance)}</div>
      <div className="balance-row">
        <div><div className="stat-label">Income</div><div className="stat-val income">+{fmtINR(income)}</div></div>
        <div><div className="stat-label">Spent</div><div className="stat-val spent">-{fmtINR(spent)}</div></div>
        <div><div className="stat-label">Saved</div><div className="stat-val">{Math.round((1-spent/income)*100)}%</div></div>
      </div>
    </div>
  );
  const InsightBanner = () => (
    <div className="insight-banner">
      <div className="ins-icon">💡</div>
      <div><div className="ins-title">Food spend up 18% this month</div><div className="ins-body">You've spent {fmtINR(foodSp)}. A ₹2,500/week limit could help save more.</div></div>
    </div>
  );
  const StreakCard = () => (
    <div className="streak-card">
      <div className="streak-num">7</div>
      <div><div className="streak-label">🔥 Day Streak</div><div className="streak-sub">Tracked every day this week!</div></div>
    </div>
  );

  if(isDesktop) return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div className="desktop-page-title">Good morning, Sampreet 👋</div>
        <div className="page-subtitle">Financial overview · April 2025</div>
      </div>
      <div className="stat-chips-row">
        {[{label:"Total Balance",val:fmtINR(balance),color:"var(--green)"},{label:"Monthly Income",val:fmtINR(income),color:"var(--green-light)"},{label:"Total Spent",val:fmtINR(spent),color:"var(--red)"},{label:"Savings Rate",val:`${Math.round((1-spent/income)*100)}%`,color:"var(--accent)"}].map((s,i)=>(
          <div key={i} className="stat-chip"><div className="stat-chip-val" style={{color:s.color}}>{s.val}</div><div className="stat-chip-label">{s.label}</div></div>
        ))}
      </div>
      <div className="d-grid-2" style={{marginBottom:18}}>
        <BalCard/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <StreakCard/>
          <InsightBanner/>
        </div>
        <div className="card">
          <div className="section-hdr"><div className="section-title">Spend by Category</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {chips.map((c,i)=><div key={i} className="chip" style={{minWidth:0}}><div className="chip-icon">{c.icon}</div><div className="chip-label">{c.label}</div><div className="chip-amount">{fmtINR(c.amount)}</div></div>)}
          </div>
        </div>
        <div className="card">
          <div className="section-hdr"><div className="section-title">Recent Transactions</div></div>
          {recent.map(t=>(
            <div key={t.id} className="tx-row" style={{marginBottom:6}}>
              <div className="tx-icon" style={{background:t.color}}>{t.icon}</div>
              <div className="tx-info"><div className="tx-name">{t.name}</div><div className="tx-cat">{t.cat}</div></div>
              <div className={`tx-amount ${t.amount>0?"credit":"debit"}`}>{t.amount>0?"+":"-"}{fmtINR(t.amount)}</div>
            </div>
          ))}
        </div>
      </div>
      <button className="btn-primary" style={{maxWidth:240}} onClick={onAdd}>+ Add Expense</button>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header" style={{paddingTop:16}}>
        <div><div style={{fontSize:11,color:"var(--text-muted)",marginBottom:2}}>Good morning ☀️</div><div className="page-title">Sampreet</div></div>
        <div style={{width:42,height:42,borderRadius:14,background:"var(--green-pale)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👋</div>
      </div>
      <div className="px mb"><BalCard/></div>
      <div className="px mb"><StreakCard/></div>
      <div style={{padding:"0 16px 14px"}} className="spend-chips">
        {chips.map((c,i)=><div key={i} className="chip"><div className="chip-icon">{c.icon}</div><div className="chip-label">{c.label}</div><div className="chip-amount">{fmtINR(c.amount)}</div></div>)}
      </div>
      <div className="px mb"><InsightBanner/></div>
      <div className="section-hdr px" style={{marginBottom:10}}><div className="section-title">Recent</div></div>
      <div className="px">
        {recent.map(t=>(
          <div key={t.id} className="tx-row">
            <div className="tx-icon" style={{background:t.color}}>{t.icon}</div>
            <div className="tx-info"><div className="tx-name">{t.name}</div><div className="tx-cat">{t.cat}</div></div>
            <div className={`tx-amount ${t.amount>0?"credit":"debit"}`}>{t.amount>0?"+":"-"}{fmtINR(t.amount)}</div>
          </div>
        ))}
      </div>
      <div className="px" style={{marginTop:8,marginBottom:4}}><button className="btn-primary" onClick={onAdd}>+ Add Expense</button></div>
    </div>
  );
}

function ActivityContent({ transactions, isDesktop }) {
  return (
    <div className="page">
      {isDesktop?(
        <div style={{marginBottom:22}}><div className="desktop-page-title">Activity</div><div className="page-subtitle">All transactions · April 2025 · {transactions.length} entries</div></div>
      ):(
        <div className="page-header" style={{paddingTop:16}}>
          <div><div className="page-title">Activity</div><div className="page-subtitle">April 2025</div></div>
          <div style={{fontSize:11,background:"var(--green-pale)",color:"var(--green)",padding:"5px 12px",borderRadius:99,fontWeight:600}}>{transactions.length} txns</div>
        </div>
      )}
      <div className={isDesktop?"":"px"} style={isDesktop?{maxWidth:700}:{}}>
        {[...transactions].reverse().map(t=>(
          <div key={t.id} className="tx-row">
            <div className="tx-icon" style={{background:t.color}}>{t.icon}</div>
            <div className="tx-info"><div className="tx-name">{t.name}</div><div className="tx-cat">{t.cat}</div></div>
            <div className={`tx-amount ${t.amount>0?"credit":"debit"}`}>{t.amount>0?"+":"-"}{fmtINR(t.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsContent({ isDesktop }) {
  const [goals,setGoals]=useState(initGoals);
  const [showNew,setShowNew]=useState(false);
  const [title,setTitle]=useState(""); const [target,setTarget]=useState("");
  function addGoal(){ if(!title||!target)return; setGoals(g=>[...g,{id:Date.now(),title,saved:0,target:Number(target),icon:"🎯",color:"#EDE8F8"}]); setTitle("");setTarget("");setShowNew(false); }
  const GCard=({g})=>(
    <div className="goal-card">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:13,background:g.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{g.icon}</div>
          <div><div style={{fontFamily:"var(--font-d)",fontSize:15,fontWeight:700}}>{g.title}</div><div style={{fontSize:11,color:"var(--text-muted)",marginTop:1}}>{fmtINR(g.saved)} saved</div></div>
        </div>
        <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:800,color:"var(--green)"}}>{pct(g.saved,g.target)}%</div>
      </div>
      <div className="progress-track"><div className="progress-fill" style={{width:`${pct(g.saved,g.target)}%`}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:"var(--text-muted)"}}>
        <span>₹0</span><span style={{fontWeight:600}}>Target: {fmtINR(g.target)}</span>
      </div>
    </div>
  );
  const AddForm=()=>(
    <div className="card">
      <div style={{fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,marginBottom:14}}>New Goal</div>
      <input className="input-field" placeholder="Goal name" value={title} onChange={e=>setTitle(e.target.value)}/>
      <input className="input-field" placeholder="Target amount (₹)" type="number" value={target} onChange={e=>setTarget(e.target.value)}/>
      <div style={{display:"flex",gap:8}}>
        <button className="btn-primary" style={{flex:1,padding:12}} onClick={addGoal}>Add Goal</button>
        <button className="btn-primary" style={{flex:1,padding:12,background:"var(--bg2)",color:"var(--text)"}} onClick={()=>setShowNew(false)}>Cancel</button>
      </div>
    </div>
  );
  return (
    <div className="page">
      {isDesktop?(
        <div style={{marginBottom:22}}><div className="desktop-page-title">Goals</div><div className="page-subtitle">{goals.length} active goals</div></div>
      ):(
        <div className="page-header" style={{paddingTop:16}}><div className="page-title">Goals</div></div>
      )}
      <div className={isDesktop?"d-grid-2":"px gap"}>
        {goals.map(g=><GCard key={g.id} g={g}/>)}
        {showNew?<AddForm/>:<button className="add-goal-btn" onClick={()=>setShowNew(true)}>＋ New Goal</button>}
      </div>
    </div>
  );
}

function InsightsContent({ transactions, isDesktop }) {
  const spent =transactions.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0);
  const income=transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
  const cats=[{label:"Food",color:"#E8945A",pct:30,weeks:[320,420,380,480]},{label:"Travel",color:"#5A7DE8",pct:18},{label:"Subs",color:"#A05AE8",pct:14},{label:"Groceries",color:"#5AE89A",pct:25},{label:"Other",color:"#E8C85A",pct:13}];
  const maxW=Math.max(...cats[0].weeks);
  const pills=[{label:"Savings Rate",fill:Math.round((1-spent/income)*100),color:"#7DE8A8"},{label:"Budget Control",fill:72,color:"#FFD580"},{label:"Goal Progress",fill:45,color:"#80C8FF"}];
  const score=Math.round(pills.reduce((s,p)=>s+p.fill,0)/3);
  const tips=[{icon:"📉",title:"Cut subscriptions to save ₹319/mo",body:"2 overlapping streaming services. Pausing one saves ₹3,828/year."},{icon:"🎯",title:"Boost Goa Trip goal by ₹3,000",body:"36% there! Weekly ₹750 transfers close the gap in 14 months."}];
  return (
    <div className="page">
      {isDesktop?(
        <div style={{marginBottom:22}}><div className="desktop-page-title">Insights</div><div className="page-subtitle">Your money story · April 2025</div></div>
      ):(
        <div className="page-header" style={{paddingTop:16}}><div><div className="page-title">Insights</div><div className="page-subtitle">Your money story</div></div></div>
      )}
      <div className={isDesktop?"d-grid-2 mb":"px gap"}>
        <div className="wellness-card">
          <div className="wellness-title">Financial Wellness Score</div>
          <div className="wellness-score-row">
            <div className="wellness-circle"><div className="wellness-num">{score}</div><div className="wellness-denom">/100</div></div>
            <div className="wellness-pills">
              {pills.map((p,i)=>(
                <div key={i} className="wellness-pill">
                  <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                  <div style={{flex:1}}><div style={{fontSize:10,opacity:.8,marginBottom:3}}>{p.label}</div><div className="wellness-pill-bar"><div className="wellness-pill-fill" style={{width:`${p.fill}%`,background:p.color}}/></div></div>
                  <div style={{fontSize:11,fontWeight:700}}>{p.fill}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-card-title">Spending by Category</div>
          <div className="donut-wrap">
            <Donut data={cats}/>
            <div className="donut-legend">{cats.map((c,i)=><div key={i} className="legend-row"><div className="legend-dot" style={{background:c.color}}/><div className="legend-label">{c.label}</div><div className="legend-pct" style={{color:c.color}}>{c.pct}%</div></div>)}</div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-card-title">Weekly Food Spend</div>
          <div className="bar-chart">
            {["W1","W2","W3","W4"].map((w,i)=><div key={i} className="bar-wrap"><div className="bar" style={{height:Math.round((cats[0].weeks[i]/maxW)*70),background:i===3?"var(--red)":"var(--green-pale)"}}/><div className="bar-label">{w}</div></div>)}
          </div>
          <div style={{fontSize:11,color:"var(--red)",marginTop:8,fontWeight:500}}>↑ Week 4 highest — consider meal prepping</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {tips.map((t,i)=><div key={i} className="insight-banner"><div className="ins-icon">{t.icon}</div><div><div className="ins-title">{t.title}</div><div className="ins-body">{t.body}</div></div></div>)}
        </div>
      </div>
    </div>
  );
}

function ReflectContent({ onComplete, isDesktop }) {
  const [ans,setAns]=useState(["","",""]);
  const [done,setDone]=useState(false);
  const qs=["What was your best spending decision this week?","Where do you think you overspent?","What is one money goal for next week?"];
  if(done) return (
    <div className="page" style={{padding:"60px 20px 20px",textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:16}}>🎉</div>
      <div className="page-title" style={{textAlign:"center"}}>Reflection Done!</div>
      <div style={{color:"var(--text-muted)",marginTop:10,fontSize:14,lineHeight:1.7}}>Great job! Your streak is now <strong>8 days</strong> 🔥</div>
      <div style={{marginTop:28}}><button className="btn-primary" style={{maxWidth:240,margin:"0 auto"}} onClick={()=>{setDone(false);setAns(["","",""]);onComplete();}}>Back to Home</button></div>
    </div>
  );
  return (
    <div className="page">
      {isDesktop?(
        <div style={{marginBottom:22}}><div className="desktop-page-title">Weekly Reflection 🧘</div><div className="page-subtitle">Sunday check-in · 3 questions</div></div>
      ):(
        <div className="page-header" style={{paddingTop:16}}>
          <div><div className="page-title">Weekly<br/>Reflection</div><div className="page-subtitle">Sunday check-in</div></div>
          <div style={{fontSize:26}}>🧘</div>
        </div>
      )}
      <div className={isDesktop?"":"px"} style={isDesktop?{maxWidth:600,display:"flex",flexDirection:"column",gap:12}:{display:"flex",flexDirection:"column",gap:12}}>
        <div className="streak-card"><div className="streak-num">7</div><div><div className="streak-label">🔥 Day Streak</div><div className="streak-sub">Don't break the chain!</div></div></div>
        {qs.map((q,i)=>(
          <div key={i} className="card">
            <div className="reflection-q">{i+1}. {q}</div>
            <textarea className="reflection-input" placeholder="Type your answer…" value={ans[i]} onChange={e=>setAns(a=>{const n=[...a];n[i]=e.target.value;return n;})} rows={2}/>
          </div>
        ))}
        <button className="btn-primary" onClick={()=>setDone(true)} style={isDesktop?{maxWidth:260}:{}}>Complete Reflection ✓</button>
      </div>
    </div>
  );
}

function ProfileContent({ isDesktop }) {
  const groups=[
    [{icon:"💳",bg:"#D4E8DC",label:"Linked Accounts"},{icon:"🔔",bg:"#FDE8D8",label:"Notifications"},{icon:"🎨",bg:"#EDE8F8",label:"Appearance"}],
    [{icon:"🔒",bg:"#E8F0FD",label:"Privacy & Security"},{icon:"📤",bg:"#FDF8E8",label:"Export Data"},{icon:"❓",bg:"#E8F4E8",label:"Help & Support"}],
  ];
  return (
    <div className="page">
      <div className={isDesktop?"":"px"} style={isDesktop?{maxWidth:560}:{}}>
        <div style={{display:"flex",alignItems:"center",gap:16,padding:isDesktop?"0 0 24px":"24px 0"}}>
          <div className="avatar">S</div>
          <div><div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:800}}>Sampreet</div><div style={{fontSize:13,color:"var(--text-muted)",marginTop:2}}>Member since Jan 2025</div></div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          {[{label:"This Month",val:"₹42K"},{label:"Saved",val:"32%"},{label:"Goals",val:"3"}].map((s,i)=>(
            <div key={i} style={{flex:1,background:"var(--surface)",borderRadius:"var(--r-sm)",padding:"14px 12px",textAlign:"center",boxShadow:"var(--shadow)",border:"1px solid var(--border)"}}>
              <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:800,color:"var(--green)"}}>{s.val}</div>
              <div style={{fontSize:10,color:"var(--text-muted)",marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        {groups.map((g,gi)=>(
          <div key={gi} className="settings-group">
            {g.map((s,si)=>(
              <div key={si} className="setting-row">
                <div className="setting-icon" style={{background:s.bg}}>{s.icon}</div>
                <div style={{flex:1,fontSize:14,fontWeight:500}}>{s.label}</div>
                <div style={{fontSize:14,color:"var(--text-muted)"}}>›</div>
              </div>
            ))}
          </div>
        ))}
        <button className="btn-primary" style={{background:"var(--red-light)",color:"var(--red)",marginTop:4}}>Sign Out</button>
      </div>
    </div>
  );
}

/* ─── ADD MODAL ───────────────────────────────────────────── */
function AddModal({ onClose, onAdd }) {
  const [amount,setAmount]=useState(""); const [name,setName]=useState(""); const [cat,setCat]=useState("Food");
  function submit(){ if(!amount||!name)return; onAdd({name,cat,amount:-Number(amount),icon:CAT_ICON[cat]||"📌",color:"#FDE8D8"}); onClose(); }
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">Add Expense</div>
        <input className="input-field" placeholder="Amount (₹)" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/>
        <input className="input-field" placeholder="Description (e.g. Swiggy)" value={name} onChange={e=>setName(e.target.value)}/>
        <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:8,fontWeight:500}}>Category</div>
        <div className="cat-grid">
          {CATS.filter(c=>c!=="Income"&&c!=="Transfer").map(c=>(
            <div key={c} className={`cat-btn${cat===c?" selected":""}`} onClick={()=>setCat(c)}>
              <span style={{fontSize:19}}>{CAT_ICON[c]}</span><span>{c}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={submit}>Add Expense</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════ */
export default function PocketPath() {
  const [tab,setTab]         = useState("home");
  const [dark,setDark]       = useState(false);
  const [transactions,setTx] = useState(initTx);
  const [showModal,setModal] = useState(false);
  const [toast,setToast]     = useState(null);
  const [isDesktop,setDesk]  = useState(window.innerWidth>=768);

  useEffect(()=>{
    const h=()=>setDesk(window.innerWidth>=768);
    window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h);
  },[]);

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(null),2100); }
  function addTx(t){ setTx(p=>[...p,{...t,id:Date.now()}]); showToast("✓ Expense added"); }

  const pp = { transactions, isDesktop, onAdd:()=>setModal(true), onComplete:()=>setTab("home") };
  function renderPage(){
    if(tab==="home")     return <HomeContent     {...pp}/>;
    if(tab==="activity") return <ActivityContent {...pp}/>;
    if(tab==="goals")    return <GoalsContent    {...pp}/>;
    if(tab==="insights") return <InsightsContent {...pp}/>;
    if(tab==="reflect")  return <ReflectContent  {...pp}/>;
    if(tab==="profile")  return <ProfileContent  {...pp}/>;
  }

  const Overlays = () => <>
    {showModal && <AddModal onClose={()=>setModal(false)} onAdd={addTx}/>}
    {toast     && <div className="toast">{toast}</div>}
  </>;

  /* ── MOBILE ── */
  if(!isDesktop) return (
    <>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      <div data-dark={dark} style={{minHeight:"100vh",background:"var(--bg)"}}>
        <div className="app-mobile">
          {/* sticky header */}
          <div className="mobile-header">
            <Brand/>
            <DarkToggle dark={dark} toggle={()=>setDark(d=>!d)}/>
          </div>
          {/* scrollable content */}
          <div className="mobile-scroll">{renderPage()}</div>
          {/* bottom nav */}
          <nav className="bottom-nav">
            {TABS.map(t=>(
              <button key={t.id} className={`nav-item${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
                <div className="nav-icon">{t.icon}</div>
                <span className="nav-label">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <Overlays/>
      </div>
    </>
  );

  /* ── DESKTOP ── */
  return (
    <>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      <div data-dark={dark} style={{minHeight:"100vh",background:"var(--bg)"}}>
        <div className="app-desktop">

          {/* ── top header ── */}
          <header className="desktop-header">
            <div style={{display:"flex",alignItems:"center",gap:28}}>
              <Brand/>
              {/* inline tab nav */}
              <nav style={{display:"flex",gap:2}}>
                {TABS.slice(0,5).map(t=>(
                  <button key={t.id} className="header-nav-btn"
                    onClick={()=>setTab(t.id)}
                    style={{
                      background: tab===t.id ? "var(--green-pale)" : "transparent",
                      color:      tab===t.id ? "var(--green)"      : "var(--text-muted)",
                      fontWeight: tab===t.id ? 700 : 500,
                    }}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </nav>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <DarkToggle dark={dark} toggle={()=>setDark(d=>!d)}/>
              {/* user chip */}
              <button
                onClick={()=>setTab("profile")}
                style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"5px 12px 5px 5px",borderRadius:"var(--r-xs)",background:tab==="profile"?"var(--green-pale)":"transparent",border:"none",transition:"background 0.15s"}}>
                <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,var(--green-light),var(--green))",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14}}>S</div>
                <span style={{fontSize:13,fontWeight:600,color:"var(--text)",fontFamily:"var(--font-b)"}}>Sampreet</span>
              </button>
            </div>
          </header>

          <div className="desktop-body">
            {/* ── sidebar ── */}
            <aside className="sidebar">
              <div className="sidebar-section-label">Navigation</div>
              {TABS.map(t=>(
                <button key={t.id} className={`sidebar-item${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
                  <span className="si-icon">{t.icon}</span>
                  <span className="si-label">{t.label}</span>
                </button>
              ))}
              <div className="sidebar-add-btn">
                <button className="btn-primary" style={{fontSize:13,padding:12}} onClick={()=>setModal(true)}>
                  + Add Expense
                </button>
              </div>
            </aside>

            {/* ── main ── */}
            <main className="desktop-main">{renderPage()}</main>
          </div>
        </div>
        <Overlays/>
      </div>
    </>
  );
}