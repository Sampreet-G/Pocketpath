import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { dashboardApi, txApi, goalsApi, insightsApi, reflectApi, profileApi } from "./api";
import OnboardingDemo from "./pages/OnboardingDemo";
import ProfilePage from "./pages/ProfilePage";

/* ─── CONSTANTS ──────────────────────────────────────────── */
const CAT_ICON = {
  Food:"🍜", Travel:"🚕", Shopping:"🛍️", Groceries:"🛒",
  Subscriptions:"🎬", Income:"💰", Transfer:"📲", Health:"💊",
  Education:"📚", Entertainment:"🎮", Other:"📌",
};
const CAT_COLOR      = { Food:"#FDE8D8",Travel:"#E8E0F8",Shopping:"#E8F4FD",Groceries:"#E8F4E8",Subscriptions:"#FFE8E8",Income:"#D4E8DC",Transfer:"#E8F0FD",Health:"#F8E8F4",Education:"#FDF8E8",Entertainment:"#F0E8FD",Other:"#F0EDE8" };
const CAT_COLOR_DARK = { Food:"#3D2010",Travel:"#201830",Shopping:"#101C28",Groceries:"#0D2018",Subscriptions:"#2A1010",Income:"#0A2018",Transfer:"#101828",Health:"#2A0C20",Education:"#2A2208",Entertainment:"#1A1030",Other:"#1C1A18" };
const CHART_COLORS   = ["#38B27B","#5A7DE8","#E8945A","#F4C430","#E85A5A","#A05AE8","#5AE8E8"];
const CATS = ["Food","Travel","Shopping","Groceries","Subscriptions","Health","Education","Entertainment","Transfer","Other"];
const TABS = [
  { id:"home",     icon:"🏠", label:"Home"     },
  { id:"activity", icon:"📋", label:"Activity" },
  { id:"goals",    icon:"🎯", label:"Goals"    },
  { id:"insights", icon:"💡", label:"Insights" },
  { id:"reflect",  icon:"🧘", label:"Reflect"  },
  { id:"profile",  icon:"👤", label:"Profile"  },
];

/* ─── HELPERS ─────────────────────────────────────────────── */
function fmtINR(n) {
  const a = Math.abs(n);
  if (a >= 100000) return `₹${(a/100000).toFixed(1)}L`;
  if (a >= 1000)   return `₹${(a/1000).toFixed(1)}K`;
  return `₹${a.toLocaleString("en-IN")}`;
}
const pct = (a,b) => b>0 ? Math.min(100,Math.round((a/b)*100)) : 0;
const getCatColor = (cat,dark) => dark ? (CAT_COLOR_DARK[cat]||'#1C1A18') : (CAT_COLOR[cat]||'#F0EDE8');

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning ☀️";
  if (h < 17) return "Good afternoon 🌤️";
  return "Good evening 🌙";
}

/* ─── STREAK LEVEL ────────────────────────────────────────── */
function getStreakLevel(s) {
  if (s >= 30) return { level:"Legend",    color:"#E8A030", bg:"rgba(232,160,48,0.12)", icon:"🏆" };
  if (s >= 14) return { level:"Pro",       color:"#9B59B6", bg:"rgba(155,89,182,0.12)", icon:"💜" };
  if (s >= 7)  return { level:"Consistent",color:"#38B27B", bg:"rgba(56,178,123,0.12)", icon:"🔥" };
  if (s >= 3)  return { level:"Building",  color:"#3498DB", bg:"rgba(52,152,219,0.12)", icon:"⚡" };
  return           { level:"Beginner",  color:"#95A5A6", bg:"rgba(149,165,166,0.12)", icon:"🌱" };
}

/* ─── ACHIEVEMENTS ────────────────────────────────────────── */
const ACHIEVEMENTS = [
  { icon:"🥇", name:"First Log",    desc:"Log your first transaction",       condition: (s,tx,g) => tx >= 1 },
  { icon:"🔥", name:"Week Streak",  desc:"7-day tracking streak",            condition: (s,tx,g) => s >= 7 },
  { icon:"💰", name:"Saver",        desc:"Save over 20% in a month",         condition: (s,tx,g) => false },
  { icon:"🎯", name:"Goal Setter",  desc:"Create your first savings goal",   condition: (s,tx,g) => g >= 1 },
  { icon:"📊", name:"Power User",   desc:"Log 50+ transactions",             condition: (s,tx,g) => tx >= 50 },
  { icon:"🏆", name:"Month Master", desc:"30-day tracking streak",           condition: (s,tx,g) => s >= 30 },
];

/* ─── SVG SPARKLINE ───────────────────────────────────────── */
function Sparkline({ data, color = "var(--green-light)", width=80, height=32 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*width;
    const y = height - ((v-min)/range)*(height-4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── LINE CHART (income vs expense trend) ────────────────── */
function LineChart({ data, width=420, height=140 }) {
  if (!data || data.length === 0) return (
    <div style={{height,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:13}}>No trend data yet</div>
  );
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  // Build month buckets
  const buckets = {};
  data.forEach(d => {
    const key = `${d._id.year}-${String(d._id.month).padStart(2,'0')}`;
    if (!buckets[key]) buckets[key] = { income:0, expense:0, label: MONTHS[d._id.month-1] };
    buckets[key][d._id.type === 'income' ? 'income' : 'expense'] += d.total;
  });
  const months = Object.values(buckets).slice(-6);
  if (months.length === 0) return null;
  const maxVal = Math.max(...months.map(m => Math.max(m.income, m.expense)), 1);
  const W = width, H = height - 30, pad = 20;
  const xStep = (W - pad*2) / Math.max(months.length-1, 1);
  function points(key) {
    return months.map((m,i) => `${pad + i*xStep},${H - (m[key]/maxVal)*(H-10) - 4}`).join(" ");
  }
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${height}`} style={{overflow:'visible'}}>
      {/* Grid lines */}
      {[0,0.25,0.5,0.75,1].map((t,i) => (
        <line key={i} x1={pad} x2={W-pad} y1={H-(t*(H-10))-4} y2={H-(t*(H-10))-4}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="4,4"/>
      ))}
      {/* Income line */}
      <polyline points={points('income')} fill="none" stroke="#38B27B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Expense line */}
      <polyline points={points('expense')} fill="none" stroke="#D94040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Dots */}
      {months.map((m,i) => (
        <g key={i}>
          <circle cx={pad+i*xStep} cy={H-(m.income/maxVal)*(H-10)-4} r="4" fill="#38B27B"/>
          <circle cx={pad+i*xStep} cy={H-(m.expense/maxVal)*(H-10)-4} r="4" fill="#D94040"/>
          <text x={pad+i*xStep} y={height-6} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="Inter,sans-serif">{m.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── DONUT CHART ─────────────────────────────────────────── */
function Donut({ data }) {
  const size=100,cx=50,cy=50,r=38,stroke=11,circ=2*Math.PI*r;
  let offset=0;
  const slices = data.map(d => { const dash=(d.pct/100)*circ,s={...d,dash,offset}; offset+=dash; return s; });
  const now = new Date();
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg2)" strokeWidth={stroke}/>
      {slices.map((s,i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${circ-s.dash}`} strokeDashoffset={-s.offset+circ*0.25}
          style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)"}}>
          <title>{s.label}: {s.pct}%</title>
        </circle>
      ))}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Poppins,sans-serif" fill="var(--text-muted)">
        {now.toLocaleString('default',{month:'short'})}
      </text>
      <text x={cx} y={cy+8} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Poppins,sans-serif" fill="var(--green)">
        {data.length} cats
      </text>
    </svg>
  );
}
/* ─── AI INSIGHTS ENGINE ──────────────────────────────────── */
function generateInsights(data) {
  if (!data) return [];
  const { totalSpent, monthlyIncome, spendByCategory, savingsRate, streak } = data;
  const insights = [];
  const food = spendByCategory.find(c=>c.category==='Food');
  const subs  = spendByCategory.find(c=>c.category==='Subscriptions');
  if (food && monthlyIncome > 0 && (food.amount/monthlyIncome) > 0.15)
    insights.push({ icon:'🍜', title:`Food spending is ${Math.round((food.amount/monthlyIncome)*100)}% of income`, body:`You've spent ${fmtINR(food.amount)} on food. Consider meal prepping to cut this by 20-30%.` });
  if (subs)
    insights.push({ icon:'🎬', title:`Subscriptions cost ${fmtINR(subs.amount)}/month`, body:`That's ${fmtINR(subs.amount*12)}/year. Review unused services — could save ${fmtINR(Math.round(subs.amount*0.4))}/month.` });
  if (savingsRate >= 30)
    insights.push({ icon:'🌟', title:`Excellent! You saved ${savingsRate}% this month`, body:`You're well above the recommended 20% savings rate. Consider moving surplus to a goal.` });
  else if (savingsRate < 10 && monthlyIncome > 0)
    insights.push({ icon:'⚠️', title:`Savings rate is only ${savingsRate}%`, body:`Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Automate transfers on payday.` });
  if (streak >= 7)
    insights.push({ icon:'🔥', title:`${streak}-day tracking streak!`, body:`Consistent tracking users save 23% more on average. Keep the momentum going!` });
  if (insights.length === 0)
    insights.push({ icon:'💡', title:'Start tracking to unlock insights', body:'Log your first transactions and AI-powered money tips will appear here based on your patterns.' });
  return insights.slice(0,3);
}

/* ─── SHARED UI ───────────────────────────────────────────── */
function Spinner() { return <div className="loading-spinner"><div className="spinner"/><span>Loading…</span></div>; }
function DarkToggle({ dark, toggle }) {
  return <div className="dark-toggle" onClick={toggle} title="Toggle dark mode"><div className="dark-toggle-thumb">{dark?"🌙":"☀️"}</div></div>;
}
function Brand() {
  return (
    <div className="brand">
        <img
          src="/piggybank.png"
          alt="logo"
          style={{ width: "28px", height: "28px" }}
      />

      <span className="brand-text">
        PocketPath
      </span>
    </div>
  );
}

/* ══════════════ HOME ══════════════════════════════════════ */
function HomeContent({ isDesktop, onAdd, showToast, refreshKey, dark, setTab }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRef=false) => {
    if (isRef) setRefreshing(true);
    try { const r = await dashboardApi.get(); setData(r.data); }
    catch (e) { showToast('⚠️ ' + e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { refreshKey > 0 ? load(true) : load(false); }, [refreshKey]);

  if (loading) return <Spinner/>;
  if (!data)   return null;

  const { totalBalance, monthlyIncome, totalSpent, savingsRate, streak, spendByCategory, recentTransactions, tip, month } = data;
  const chips = spendByCategory.slice(0,4).map(s => ({ icon:CAT_ICON[s.category]||'📌', label:s.category, amount:s.amount }));
  const aiInsights = generateInsights(data);
  const streakLvl  = getStreakLevel(streak);

  const BalCard = () => (
    <div className="balance-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
        <div className="balance-label">Total Balance · {month}</div>
        {refreshing && <span style={{fontSize:9,background:'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.8)',padding:'3px 8px',borderRadius:99,fontWeight:600,letterSpacing:0.3}}>Updating…</span>}
      </div>
      <div className="balance-amount">{fmtINR(totalBalance)}</div>
      <div className="balance-row">
        <div className="balance-stat"><div className="stat-label">Income</div><div className="stat-val income">+{fmtINR(monthlyIncome)}</div></div>
        <div className="balance-stat"><div className="stat-label">Spent</div><div className="stat-val spent">-{fmtINR(totalSpent)}</div></div>
        <div className="balance-stat"><div className="stat-label">Saved</div><div className="stat-val">{savingsRate}%</div></div>
      </div>
    </div>
  );

  const StreakCard = () => (
    <div className="streak-card">
      <div style={{fontSize:40,lineHeight:1}}>{streakLvl.icon}</div>
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
          <span className="streak-num" style={{fontSize:28}}>{streak}</span>
          <span className="badge-chip" style={{background:streakLvl.bg,color:streakLvl.color}}>{streakLvl.level}</span>
        </div>
        <div className="streak-label">Day Streak</div>
        <div className="streak-sub">Log daily to level up!</div>
      </div>
    </div>
  );

  if (isDesktop) return (
    <div className="page">
      <div style={{marginBottom:24}}>
        <div className="desktop-page-title">{getGreeting()}</div>
        <div className="page-subtitle">Financial overview · {month}</div>
      </div>

      {/* Stat chips with sparklines */}
      <div className="stat-chips-row">
        {[
          { label:"Total Balance",  val:fmtINR(totalBalance), color:"var(--green)",       cls:"balance-chip",  icon:"💰", spark:[35,38,36,40,42,41,totalBalance/1000].map(Math.round) },
          { label:"Monthly Income", val:fmtINR(monthlyIncome),color:"var(--green-light)", cls:"income-chip",   icon:"📈", spark:[40,42,38,44,43,45,monthlyIncome/1000].map(Math.round) },
          { label:"Total Spent",    val:fmtINR(totalSpent),   color:"var(--red)",         cls:"expense-chip",  icon:"📉", spark:[8,12,10,15,11,14,totalSpent/1000].map(Math.round) },
          { label:"Savings Rate",   val:`${savingsRate}%`,    color:"var(--accent)",      cls:"savings-chip",  icon:"🏦", spark:[18,22,20,25,28,30,savingsRate].map(Math.round) },
        ].map((s,i) => (
          <div key={i} className={`stat-chip ${s.cls}`}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div className="stat-chip-val" style={{color:s.color}}>{s.val}</div>
                <div className="stat-chip-label">{s.label}</div>
              </div>
              <Sparkline data={s.spark} color={s.color}/>
            </div>
          </div>
        ))}
      </div>

      <div className="d-grid-2" style={{marginBottom:20}}>
        <BalCard/>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <StreakCard/>
          {tip && (
            <div className="insight-banner">
              <div className="ins-icon">💡</div>
              <div><div className="ins-title">{tip.message}</div><div className="ins-body">{tip.detail}</div></div>
            </div>
          )}
          {/* Quick Actions */}
          <div className="card" style={{padding:16}}>
            <div className="section-title" style={{marginBottom:10,fontSize:14}}>Quick Actions</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {icon:'➕',label:'Add Expense',  action:onAdd,           bg:'var(--green-pale)', color:'var(--green)'},
                {icon:'💰',label:'Add Income',   action:onAdd,           bg:'#E8F4DC',           color:'#2D6A2D'},
                {icon:'💡',label:'Insights',     action:()=>setTab?.('insights'), bg:'var(--accent-light)', color:'var(--accent)'},
                {icon:'🎯',label:'Goals',        action:()=>setTab?.('goals'),    bg:'#EDE8F8',     color:'#6A2D8A'},
              ].map((a,i) => (
                <button key={i} onClick={a.action} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',borderRadius:12,background:a.bg,border:`1px solid ${a.bg}`,cursor:'pointer',fontFamily:'var(--font-b)',fontSize:13,fontWeight:600,color:a.color,transition:'all 0.2s'}}>
                  <span style={{fontSize:16}}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spend by category */}
        <div className="card">
          <div className="section-hdr"><div className="section-title">Spend by Category</div></div>
          {chips.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text-muted)',fontSize:13}}>No expenses this month</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {chips.map((c,i) => (
                <div key={i} className="chip" style={{minWidth:0}}>
                  <div className="chip-icon">{c.icon}</div>
                  <div className="chip-label">{c.label}</div>
                  <div className="chip-amount">{fmtINR(c.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card">
          <div className="section-hdr"><div className="section-title">Recent Transactions</div><span style={{fontSize:12,color:'var(--green)',cursor:'pointer',fontWeight:600}} onClick={()=>setTab?.('activity')}>See all →</span></div>
          {recentTransactions.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-title">No transactions yet</div></div>
          ) : recentTransactions.map((t,i) => (
            <div key={t._id} className="tx-row" style={{marginBottom:6,animationDelay:`${i*0.05}s`}}>
              <div className="tx-icon" style={{background:getCatColor(t.category,dark)}}>{CAT_ICON[t.category]||'📌'}</div>
              <div className="tx-info"><div className="tx-name">{t.title}</div><div className="tx-cat">{t.category}{t.merchant?' · '+t.merchant:''}</div></div>
              <div className={`tx-amount ${t.type==='income'?"credit":"debit"}`}>{t.type==='income'?'+':'-'}{fmtINR(t.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights row */}
      <div style={{marginBottom:4}}>
        <div className="section-title" style={{marginBottom:12}}>🤖 AI Insights</div>
        <div className="d-grid-3">
          {aiInsights.map((ins,i) => (
            <div key={i} className="ai-card">
              <div className="ai-card-icon">{ins.icon}</div>
              <div><div className="ai-card-title">{ins.title}</div><div className="ai-card-body">{ins.body}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Mobile
  return (
    <div className="page">
      <div className="page-header" style={{paddingTop:16}}>
        <div><div style={{fontSize:11,color:'var(--text-muted)',marginBottom:2}}>{getGreeting()}</div><div className="page-title">Dashboard</div></div>
        <div style={{width:44,height:44,borderRadius:14,background:'var(--green-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>👋</div>
      </div>
      <div className="px mb"><BalCard/></div>
      <div className="px mb"><StreakCard/></div>
      {chips.length > 0 && <div style={{padding:'0 16px 14px'}} className="spend-chips">{chips.map((c,i)=><div key={i} className="chip"><div className="chip-icon">{c.icon}</div><div className="chip-label">{c.label}</div><div className="chip-amount">{fmtINR(c.amount)}</div></div>)}</div>}
      {tip && <div className="px mb"><div className="insight-banner"><div className="ins-icon">💡</div><div><div className="ins-title">{tip.message}</div><div className="ins-body">{tip.detail}</div></div></div></div>}
      {/* AI insights mobile */}
      <div className="px mb">
        <div className="section-title" style={{marginBottom:10}}>🤖 AI Insights</div>
        <div className="gap">
          {aiInsights.slice(0,2).map((ins,i)=><div key={i} className="ai-card"><div className="ai-card-icon">{ins.icon}</div><div><div className="ai-card-title">{ins.title}</div><div className="ai-card-body">{ins.body}</div></div></div>)}
        </div>
      </div>
      <div className="section-hdr px" style={{marginBottom:10}}><div className="section-title">Recent</div></div>
      <div className="px">
        {recentTransactions.length===0 ? <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-title">No transactions yet</div><div className="empty-sub">Add your first expense</div></div>
          : recentTransactions.map((t,i)=>(
            <div key={t._id} className="tx-row" style={{animationDelay:`${i*0.05}s`}}>
              <div className="tx-icon" style={{background:getCatColor(t.category,dark)}}>{CAT_ICON[t.category]||'📌'}</div>
              <div className="tx-info"><div className="tx-name">{t.title}</div><div className="tx-cat">{t.category}</div></div>
              <div className={`tx-amount ${t.type==='income'?"credit":"debit"}`}>{t.type==='income'?'+':'-'}{fmtINR(t.amount)}</div>
            </div>
          ))}
      </div>
      <div className="px" style={{marginTop:10,marginBottom:4}}><button className="btn-primary" onClick={onAdd}>+ Add Transaction</button></div>
    </div>
  );
}

/* ══════════════ ACTIVITY ══════════════════════════════════ */
function ActivityContent({ isDesktop, refreshKey, dark }) {
  const [transactions,setTx]      = useState([]);
  const [loading,     setLoading] = useState(true);
  const [total,       setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    txApi.list({ limit:30, page:1 })
      .then(r => { setTx(r.transactions); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <Spinner/>;

  const income  = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const catMap  = [...transactions.filter(t=>t.type==='expense').reduce((m,t)=>{m.set(t.category,(m.get(t.category)||0)+t.amount);return m;},new Map()).entries()].sort((a,b)=>b[1]-a[1]);
  const maxCat  = catMap[0]?.[1] || 1;

  return (
    <div className="page">
      {isDesktop ? (
        <div style={{marginBottom:22}}><div className="desktop-page-title">Activity</div><div className="page-subtitle">{total} transactions total</div></div>
      ) : (
        <div className="page-header" style={{paddingTop:16}}>
          <div><div className="page-title">Activity</div><div className="page-subtitle">All transactions</div></div>
          <span style={{fontSize:11,background:'var(--green-pale)',color:'var(--green)',padding:'5px 12px',borderRadius:99,fontWeight:600}}>{total}</span>
        </div>
      )}
      {isDesktop && (
        <div className="page-stats-row">
          {[
            {label:'Transactions', val:total,           color:'var(--text)'},
            {label:'Total Income', val:fmtINR(income),  color:'var(--green-light)'},
            {label:'Total Spent',  val:fmtINR(expense), color:'var(--red)'},
            {label:'Categories',   val:[...new Set(transactions.map(t=>t.category))].length, color:'var(--accent)'},
          ].map((s,i)=><div key={i} className="page-stat-card"><div className="page-stat-card-val" style={{color:s.color}}>{s.val}</div><div className="page-stat-card-label">{s.label}</div></div>)}
        </div>
      )}
      <div className={isDesktop?"d-grid-2":"px"}>
        <div>
          {transactions.length===0 ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No transactions yet</div></div>
            : transactions.map((t,i)=>(
              <div key={t._id} className="tx-row" style={{animationDelay:`${i*0.03}s`}}>
                <div className="tx-icon" style={{background:getCatColor(t.category,dark)}}>{CAT_ICON[t.category]||'📌'}</div>
                <div className="tx-info">
                  <div className="tx-name">{t.title}</div>
                  <div className="tx-cat">{t.category}{t.merchant?` · ${t.merchant}`:''}</div>
                </div>
                <div className={`tx-amount ${t.type==='income'?"credit":"debit"}`}>{t.type==='income'?'+':'-'}{fmtINR(t.amount)}</div>
              </div>
            ))}
        </div>
        {isDesktop && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="card">
              <div className="section-title" style={{marginBottom:14}}>Spending by Category</div>
              {catMap.slice(0,6).map(([cat,amt],i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:36,height:36,borderRadius:11,background:getCatColor(cat,dark),display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{CAT_ICON[cat]||'📌'}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{cat}</span>
                      <span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:'var(--font-d)'}}>{fmtINR(amt)}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{width:`${Math.round((amt/maxCat)*100)}%`,background:CHART_COLORS[i%CHART_COLORS.length]}}/></div>
                  </div>
                </div>
              ))}
              {catMap.length===0 && <div style={{fontSize:13,color:'var(--text-muted)',textAlign:'center',padding:'16px 0'}}>No expenses yet</div>}
            </div>
            <div className="card">
              <div className="section-title" style={{marginBottom:12}}>Income vs Expense</div>
              <div style={{display:'flex',gap:10}}>
                {[{l:'Income',v:income,c:'var(--green-light)',g:'var(--grad-income)'},{l:'Expense',v:expense,c:'var(--red)',g:'var(--grad-expense)'}].map((s,i)=>(
                  <div key={i} style={{flex:1,background:`linear-gradient(135deg,${i===0?'rgba(56,178,123,0.08)':'rgba(217,64,64,0.08)'},var(--surface))`,borderRadius:14,padding:'14px',border:'1px solid var(--border-light)'}}>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,fontWeight:500}}>{s.l}</div>
                    <div style={{fontFamily:'var(--font-d)',fontSize:20,fontWeight:800,color:s.c}}>{fmtINR(s.v)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════ GOALS ═════════════════════════════════════ */
function GoalsContent({ isDesktop, showToast }) {
  const [goals,   setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title,   setTitle]   = useState('');
  const [target,  setTarget]  = useState('');
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    try { const r = await goalsApi.list(); setGoals(r.goals); }
    catch (e) { showToast('⚠️ '+e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function addGoal() {
    if (!title||!target) return;
    setSaving(true);
    try { const r = await goalsApi.create({title,targetAmount:Number(target),savedAmount:0,emoji:'🎯'}); setGoals(g=>[...g,r.goal]); setTitle('');setTarget('');setShowNew(false); showToast('✓ Goal created!'); }
    catch (e) { showToast('⚠️ '+e.message); }
    finally { setSaving(false); }
  }
  async function deleteGoal(id) {
    try { await goalsApi.delete(id); setGoals(g=>g.filter(x=>x._id!==id)); showToast('Goal deleted'); }
    catch (e) { showToast('⚠️ '+e.message); }
  }

  if (loading) return <Spinner/>;

  const completed = goals.filter(g=>g.isCompleted).length;
  const totalSaved = goals.reduce((s,g)=>s+g.savedAmount,0);
  const totalTarget = goals.reduce((s,g)=>s+g.targetAmount,0);

  const GCard = ({g}) => {
    const p = g.progress ?? pct(g.savedAmount,g.targetAmount);
    const col = p>=100?'var(--green-light)':p>=50?'var(--accent)':'var(--green-light)';
    return (
      <div className="goal-card">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:46,height:46,borderRadius:14,background:'var(--green-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{g.emoji}</div>
            <div>
              <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,color:'var(--text)'}}>{g.title}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:1}}>{fmtINR(g.savedAmount)} saved of {fmtINR(g.targetAmount)}</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontFamily:'var(--font-d)',fontSize:22,fontWeight:800,color:col}}>{p}%</div>
            <button onClick={()=>deleteGoal(g._id)} style={{background:'var(--red-light)',border:'none',borderRadius:8,padding:'4px 8px',cursor:'pointer',color:'var(--red)',fontSize:12,transition:'all 0.15s'}}>✕</button>
          </div>
        </div>
        <div className="progress-track" style={{height:8}}>
          <div className="progress-fill" style={{width:`${p}%`,background:`linear-gradient(90deg,${CHART_COLORS[0]},${CHART_COLORS[1]})`}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:11,color:'var(--text-muted)'}}>
          <span>₹0</span>
          {g.deadline && <span>🗓 {new Date(g.deadline).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>}
          <span style={{fontWeight:600}}>Target: {fmtINR(g.targetAmount)}</span>
        </div>
        {p>=100 && <div style={{marginTop:10,background:'var(--green-pale)',borderRadius:8,padding:'6px 10px',fontSize:12,fontWeight:700,color:'var(--green)',textAlign:'center'}}>🎉 Goal Achieved!</div>}
      </div>
    );
  };

  const AddForm = () => (
    <div className="card">
      <div style={{fontFamily:'var(--font-d)',fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:14}}>New Goal</div>
      <input className="input-field" placeholder="Goal name (e.g. Goa Trip ✈️)" value={title} onChange={e=>setTitle(e.target.value)}/>
      <input className="input-field" placeholder="Target amount (₹)" type="number" value={target} onChange={e=>setTarget(e.target.value)}/>
      <div style={{display:'flex',gap:8}}>
        <button className="btn-primary" style={{flex:1,padding:12}} onClick={addGoal} disabled={saving}>{saving?'Saving…':'Add Goal'}</button>
        <button className="btn-primary" style={{flex:1,padding:12,background:'var(--bg2)',color:'var(--text)'}} onClick={()=>setShowNew(false)}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      {isDesktop ? (
        <div style={{marginBottom:22}}><div className="desktop-page-title">Goals</div><div className="page-subtitle">{goals.length} active goals</div></div>
      ) : (
        <div className="page-header" style={{paddingTop:16}}><div className="page-title">Goals</div></div>
      )}
      {isDesktop && (
        <div className="page-stats-row">
          {[
            {label:'Active goals',   val:goals.filter(g=>!g.isCompleted).length, color:'var(--text)'},
            {label:'Completed',      val:completed,                               color:'var(--green-light)'},
            {label:'Total saved',    val:fmtINR(totalSaved),                     color:'var(--accent)'},
            {label:'Total target',   val:fmtINR(totalTarget),                    color:'var(--text-mid)'},
          ].map((s,i)=><div key={i} className="page-stat-card"><div className="page-stat-card-val" style={{color:s.color}}>{s.val}</div><div className="page-stat-card-label">{s.label}</div></div>)}
        </div>
      )}
      <div className={isDesktop?"d-grid-2":"px gap"}>
        <div className="gap">
          {goals.map(g=><GCard key={g._id} g={g}/>)}
          {showNew?<AddForm/>:<button className="add-goal-btn" onClick={()=>setShowNew(true)}>＋ New Goal</button>}
        </div>
        {isDesktop && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="card">
              <div className="section-title" style={{marginBottom:16}}>Overall Progress</div>
              {goals.length===0 ? <div style={{textAlign:'center',padding:'20px 0',color:'var(--text-muted)',fontSize:13}}>No goals yet</div>
                : goals.map((g,i)=>{
                  const p = g.progress??pct(g.savedAmount,g.targetAmount);
                  return (
                    <div key={g._id} style={{marginBottom:16}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                        <span style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{g.emoji} {g.title}</span>
                        <span style={{fontSize:13,fontWeight:700,color:'var(--green)',fontFamily:'var(--font-d)'}}>{p}%</span>
                      </div>
                      <div className="progress-track" style={{height:8}}>
                        <div className="progress-fill" style={{width:`${p}%`,background:CHART_COLORS[i%CHART_COLORS.length]}}/>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:11,color:'var(--text-muted)'}}>
                        <span>{fmtINR(g.savedAmount)}</span><span>{fmtINR(g.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="card">
              <div className="section-title" style={{marginBottom:12}}>💡 Savings Tips</div>
              {[
                {t:'Automate transfers',  b:'Move money to savings on payday before you can spend it.'},
                {t:'50/30/20 rule',       b:'50% needs · 30% wants · 20% savings — simple and effective.'},
                {t:'Celebrate milestones',b:'Reward yourself at 25%, 50%, 75% to stay motivated.'},
              ].map((tip,i)=>(
                <div key={i} style={{marginBottom:i<2?12:0,paddingBottom:i<2?12:0,borderBottom:i<2?'1px solid var(--border-light)':'none'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:3}}>{tip.t}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.55}}>{tip.b}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════ INSIGHTS ══════════════════════════════════ */
function InsightsContent({ isDesktop, showToast, refreshKey, dark }) {
  const [breakdown, setBreakdown] = useState([]);
  const [trend,     setTrend]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([insightsApi.categories(), insightsApi.trend()])
      .then(([catRes, trendRes]) => { setBreakdown(catRes.breakdown); setTrend(trendRes.trend); })
      .catch(e => showToast('⚠️ '+e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <Spinner/>;

  const total = breakdown.reduce((s,b)=>s+b.total,0);
  const cats  = breakdown.slice(0,6).map((b,i)=>({ label:b.category, color:CHART_COLORS[i%CHART_COLORS.length], pct:total>0?Math.round((b.total/total)*100):0, total:b.total, overLimit:b.overLimit }));
  const overBudget = breakdown.filter(b=>b.overLimit).length;
  const pills = [
    {label:"Savings Rate",  fill:Math.max(0,100-Math.round((total/Math.max(total,1))*50)), color:"#7DE8A8"},
    {label:"Budget Control",fill:Math.max(0,100-overBudget*25),                            color:"#FFD580"},
    {label:"Categories",    fill:Math.min(100,breakdown.length*20),                        color:"#80C8FF"},
  ];
  const score = Math.round(pills.reduce((s,p)=>s+p.fill,0)/3);

  return (
    <div className="page">
      {isDesktop ? (
        <div style={{marginBottom:22}}><div className="desktop-page-title">Insights</div><div className="page-subtitle">Spending breakdown · this month</div></div>
      ) : (
        <div className="page-header" style={{paddingTop:16}}>
          <div><div className="page-title">Insights</div><div className="page-subtitle">Spending breakdown</div></div>
        </div>
      )}
      {isDesktop && (
        <div className="page-stats-row">
          {[
            {label:'Total spent',   val:fmtINR(total),        color:'var(--red)'},
            {label:'Categories',    val:breakdown.length,      color:'var(--text)'},
            {label:'Over budget',   val:overBudget,            color:overBudget>0?'var(--red)':'var(--green-light)'},
            {label:'Wellness score',val:`${score}/100`,        color:'var(--accent)'},
          ].map((s,i)=><div key={i} className="page-stat-card"><div className="page-stat-card-val" style={{color:s.color}}>{s.val}</div><div className="page-stat-card-label">{s.label}</div></div>)}
        </div>
      )}

      {breakdown.length===0 ? (
        <div className={isDesktop?"":"px"}>
          <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No data yet</div><div className="empty-sub">Add transactions to see insights</div></div>
        </div>
      ) : (
        <div className={isDesktop?"d-grid-2":"px gap"}>
          {/* Wellness score */}
          <div className="wellness-card">
            <div className="wellness-title">Financial Wellness Score</div>
            <div className="wellness-score-row">
              <div className="wellness-circle"><div className="wellness-num">{score}</div><div className="wellness-denom">/100</div></div>
              <div className="wellness-pills">
                {pills.map((p,i)=>(
                  <div key={i} className="wellness-pill">
                    <div style={{width:8,height:8,borderRadius:'50%',background:p.color,flexShrink:0}}/>
                    <div style={{flex:1}}><div style={{fontSize:10,opacity:.75,marginBottom:3}}>{p.label}</div><div className="wellness-pill-bar"><div className="wellness-pill-fill" style={{width:`${p.fill}%`,background:p.color}}/></div></div>
                    <div style={{fontSize:11,fontWeight:700}}>{p.fill}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Donut + legend */}
          <div className="insight-card">
            <div className="insight-card-title">Spending by Category</div>
            <div className="donut-wrap">
              <Donut data={cats}/>
              <div className="donut-legend">
                {cats.map((c,i)=>(
                  <div key={i} className="legend-row">
                    <div className="legend-dot" style={{background:c.color}}/>
                    <div className="legend-label">{c.label}</div>
                    <div className="legend-pct" style={{color:c.color}}>{c.pct}%</div>
                    {c.overLimit && <span style={{fontSize:9,background:'var(--red-light)',color:'var(--red)',padding:'1px 5px',borderRadius:99,fontWeight:700}}>Over</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Income vs Expense trend chart */}
          <div className="card d-full">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div className="section-title">Income vs Expense Trend</div>
              <div style={{display:'flex',gap:14,fontSize:11,fontWeight:600}}>
                <span style={{color:'#38B27B',display:'flex',alignItems:'center',gap:4}}><span style={{width:12,height:3,background:'#38B27B',borderRadius:99,display:'inline-block'}}/>Income</span>
                <span style={{color:'#D94040',display:'flex',alignItems:'center',gap:4}}><span style={{width:12,height:3,background:'#D94040',borderRadius:99,display:'inline-block'}}/>Expense</span>
              </div>
            </div>
            <LineChart data={trend}/>
          </div>

          {/* Over budget alerts */}
          {breakdown.filter(b=>b.overLimit).map((b,i)=>(
            <div key={i} className="insight-banner">
              <div className="ins-icon">⚠️</div>
              <div><div className="ins-title">{b.category} over budget!</div><div className="ins-body">Spent {fmtINR(b.total)} · Limit {fmtINR(b.limit)}</div></div>
            </div>
          ))}

          {/* Top spending detail */}
          {isDesktop && (
            <div className="card">
              <div className="insight-card-title">Top Spending Detail</div>
              {breakdown.slice(0,5).map((b,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:CHART_COLORS[i%CHART_COLORS.length],flexShrink:0}}/>
                  <span style={{flex:1,fontSize:13,fontWeight:500,color:'var(--text)'}}>{b.category}</span>
                  <span style={{fontSize:13,fontWeight:700,color:b.overLimit?'var(--red)':'var(--text)',fontFamily:'var(--font-d)'}}>{fmtINR(b.total)}</span>
                  {b.overLimit && <span style={{fontSize:9,background:'var(--red-light)',color:'var(--red)',padding:'2px 6px',borderRadius:99,fontWeight:700}}>Over</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════ REFLECT ═══════════════════════════════════ */
function ReflectContent({ onComplete, isDesktop, showToast }) {
  const [reflections,setReflections] = useState([]);
  const [loading,    setLoading]     = useState(true);
  const [text,       setText]        = useState('');
  const [mood,       setMood]        = useState('okay');
  const [saving,     setSaving]      = useState(false);
  const MOODS = ['great','good','okay','bad','stressed'];
  const MOOD_EMOJI = {great:'😄',good:'🙂',okay:'😐',bad:'😕',stressed:'😰'};

  useEffect(() => {
    reflectApi.list({limit:8}).then(r=>setReflections(r.reflections)).catch(console.error).finally(()=>setLoading(false));
  }, []);

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try { const r = await reflectApi.create({content:text,mood}); setReflections(rs=>[r.reflection,...rs]); setText(''); showToast('✓ Reflection saved!'); }
    catch (e) { showToast('⚠️ '+e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <Spinner/>;

  const PROMPTS = [
    {icon:'✅',q:"What was your best money decision this week?"},
    {icon:'💸',q:"Where do you think you overspent?"},
    {icon:'🎯',q:"One money habit you want to build?"},
    {icon:'🤔',q:"Did any purchase make you feel guilty?"},
    {icon:'📬',q:"What would you tell your future self about money?"},
  ];

  const NewEntry = () => (
    <div className="card">
      <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:12}}>✍️ New Entry</div>
      <textarea className="reflection-input" placeholder="How did your spending make you feel today?" value={text} onChange={e=>setText(e.target.value)} rows={isDesktop?4:3}/>
      <div style={{display:'flex',gap:6,margin:'10px 0'}}>
        {MOODS.map(m=>(
          <button key={m} onClick={()=>setMood(m)} style={{flex:1,padding:'9px 4px',borderRadius:10,border:`1.5px solid ${mood===m?'var(--green-light)':'var(--border-light)'}`,background:mood===m?'var(--green-pale)':'var(--surface)',cursor:'pointer',fontSize:18,transition:'all 0.15s'}}>
            {MOOD_EMOJI[m]}
          </button>
        ))}
      </div>
      <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:12}}>Mood: <strong style={{color:'var(--text)'}}>{mood.charAt(0).toUpperCase()+mood.slice(1)}</strong></div>
      <button className="btn-primary" onClick={submit} disabled={saving||!text.trim()}>{saving?'Saving…':'Save Entry ✓'}</button>
    </div>
  );

  if (isDesktop) return (
    <div className="page">
      <div style={{marginBottom:22}}><div className="desktop-page-title">Reflect 🧘</div><div className="page-subtitle">Journal your money thoughts</div></div>
      <div className="d-grid-2">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <NewEntry/>
          {reflections.map((r,i)=>(
            <div key={r._id} className="card" style={{animationDelay:`${i*0.04}s`}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>{new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                <span style={{fontSize:18}}>{MOOD_EMOJI[r.mood]}</span>
              </div>
              <div style={{fontSize:13,lineHeight:1.7,color:'var(--text)'}}>{r.content}</div>
            </div>
          ))}
          {reflections.length===0 && <div className="empty-state"><div className="empty-icon">📓</div><div className="empty-title">No entries yet</div></div>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="card">
            <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:14}}>💭 Reflection Prompts</div>
            {PROMPTS.map((p,i)=>(
              <div key={i} onClick={()=>setText(t=>t?t+' '+p.q:p.q)} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',borderRadius:10,background:'var(--bg)',marginBottom:6,cursor:'pointer',border:'1px solid var(--border-light)',transition:'all 0.15s'}} onMouseEnter={e=>e.currentTarget.style.background='var(--green-pale)'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg)'}>
                <span style={{fontSize:16,flexShrink:0}}>{p.icon}</span>
                <span style={{fontSize:12,color:'var(--text-mid)',lineHeight:1.5}}>{p.q}</span>
              </div>
            ))}
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>Click any prompt to add it</div>
          </div>
          <div className="card">
            <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:14}}>📈 Mood History</div>
            {reflections.length===0 ? <div style={{fontSize:13,color:'var(--text-muted)',textAlign:'center',padding:'12px 0'}}>No entries yet</div> : (
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {reflections.slice(0,12).map((r,i)=>(
                  <div key={i} title={new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} style={{width:38,height:38,borderRadius:11,background:'var(--bg)',border:'1px solid var(--border-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,cursor:'default',transition:'transform 0.2s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.15)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                    {MOOD_EMOJI[r.mood]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header" style={{paddingTop:16}}><div><div className="page-title">Reflect</div><div className="page-subtitle">Money journal</div></div><div style={{fontSize:26}}>🧘</div></div>
      <div className="px gap">
        <NewEntry/>
        {reflections.map((r,i)=>(
          <div key={r._id} className="card"><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><div style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>{new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div><span style={{fontSize:18}}>{MOOD_EMOJI[r.mood]}</span></div><div style={{fontSize:13,lineHeight:1.6,color:'var(--text)'}}>{r.content}</div></div>
        ))}
        {reflections.length===0 && <div className="empty-state"><div className="empty-icon">📓</div><div className="empty-title">No entries yet</div></div>}
      </div>
    </div>
  );
}

/* ══════════════ ADD MODAL ═════════════════════════════════ */
function AddModal({ onClose, onAdd }) {
  const [amount,   setAmount]   = useState('');
  const [name,     setName]     = useState('');
  const [cat,      setCat]      = useState('Food');
  const [merchant, setMerchant] = useState('');
  const [type,     setType]     = useState('expense');
  const [saving,   setSaving]   = useState(false);

  async function submit() {
    if (!amount||!name) return;
    setSaving(true);
    try { await onAdd({title:name,amount:Number(amount),type,category:type==='income'?'Income':cat,merchant}); onClose(); }
    catch(e) {}
    finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">Add Transaction</div>
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {['expense','income'].map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:11,borderRadius:10,border:`1.5px solid ${type===t?'var(--green-light)':'var(--border-light)'}`,background:type===t?'var(--green-pale)':'var(--surface)',cursor:'pointer',fontFamily:'var(--font-b)',fontSize:13,fontWeight:600,color:type===t?'var(--green)':'var(--text-muted)',transition:'all 0.15s'}}>
              {t==='expense'?'💸 Expense':'💰 Income'}
            </button>
          ))}
        </div>
        <input className="input-field" placeholder="Amount (₹)" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/>
        <input className="input-field" placeholder="Description (e.g. Lunch at Swiggy)" value={name} onChange={e=>setName(e.target.value)}/>
        <input className="input-field" placeholder="Merchant (optional)" value={merchant} onChange={e=>setMerchant(e.target.value)}/>
        {type==='income' ? (
          <div style={{background:'var(--green-pale)',border:'1px solid var(--green-light)',borderRadius:10,padding:'11px 14px',marginBottom:16,fontSize:13,color:'var(--green)',fontWeight:600}}>💰 Will be recorded as Income</div>
        ) : (
          <>
            <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:8,fontWeight:500}}>Category</div>
            <div className="cat-grid">
              {CATS.map(c=>(
                <div key={c} className={`cat-btn${cat===c?" selected":""}`} onClick={()=>setCat(c)}>
                  <span style={{fontSize:19}}>{CAT_ICON[c]}</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <button className="btn-primary" onClick={submit} disabled={saving||!amount||!name}>
          {saving?'Saving…':`Add ${type==='expense'?'Expense':'Income'}`}
        </button>
      </div>
    </div>
  );
}

/* ══════════════ ROOT ══════════════════════════════════════ */
export default function PocketPath() {
  const [tab,       setTab]   = useState('home');
  const [dark,      setDark]  = useState(false);
  const [showModal, setModal] = useState(false);
  const [toast,     setToast] = useState(null);
  const [isDesktop, setDesk]  = useState(window.innerWidth >= 768);
  const [txRefresh, setTxRef] = useState(0);
  const { user } = useAuth();

  const [showOnboarding, setOnboarding] = useState(() => {
    const key = user?._id ? `pp_onboarded_${user._id}` : 'pp_onboarded';
    return !localStorage.getItem(key);
  });
  function doneOnboarding() {
    const key = user?._id ? `pp_onboarded_${user._id}` : 'pp_onboarded';
    localStorage.setItem(key,'1'); setOnboarding(false);
  }

  useEffect(() => {
    const h = () => setDesk(window.innerWidth>=768);
    window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h);
  },[]);

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(null),2100); }

  async function addTx(body) {
    try { const r = await txApi.create(body); setTxRef(n=>n+1); showToast(`✓ ${body.type==='income'?'Income':'Expense'} added`); return r; }
    catch(e) { showToast('⚠️ '+e.message); throw e; }
  }

  const pp = { isDesktop, showToast, onAdd:()=>setModal(true), onComplete:()=>setTab('home'), refreshKey:txRefresh, dark, setTab };

  function renderPage() {
    if (tab==='home')     return <HomeContent     {...pp}/>;
    if (tab==='activity') return <ActivityContent {...pp}/>;
    if (tab==='goals')    return <GoalsContent    {...pp}/>;
    if (tab==='insights') return <InsightsContent {...pp}/>;
    if (tab==='reflect')  return <ReflectContent  {...pp}/>;
    if (tab==='profile')  return <ProfilePage     {...pp}/>;
  }

  const Overlays = () => <>
    {showOnboarding && <OnboardingDemo onDone={doneOnboarding}/>}
    {showModal && <AddModal onClose={()=>setModal(false)} onAdd={addTx}/>}
    {toast && <div className="toast">{toast}</div>}
  </>;

  const headerNavBtn = (t) => (
    <button key={t.id} className={`header-nav-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
      <span>{t.icon}</span>{t.label}
    </button>
  );

  if (!isDesktop) return (
    <div data-dark={dark} style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div className="app-mobile">
        <div className="mobile-header">
          <Brand/>
          <DarkToggle dark={dark} toggle={()=>setDark(d=>!d)}/>
        </div>
        <div className="mobile-scroll">{renderPage()}</div>
        <nav className="bottom-nav">
          {TABS.map(t=>(
            <button key={t.id} className={`nav-item${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
              <div className="nav-icon">{t.icon}</div>
              <span className="nav-label">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <Overlays/>
    </div>
  );

  return (
    <div data-dark={dark} style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div className="app-desktop">
        <header className="desktop-header">
          <div style={{display:'flex',alignItems:'center',gap:24}}>
            <Brand/>
            <nav style={{display:'flex',gap:2}}>
              {TABS.slice(0,5).map(headerNavBtn)}
            </nav>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <DarkToggle dark={dark} toggle={()=>setDark(d=>!d)}/>
            <button onClick={()=>setTab('profile')} style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',padding:'5px 14px 5px 5px',borderRadius:12,background:tab==='profile'?'var(--green-pale)':'transparent',border:'none',transition:'background 0.15s'}}>
              <div style={{width:34,height:34,borderRadius:11,background:'var(--grad-primary)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:14,overflow:'hidden',flexShrink:0,boxShadow:'0 2px 8px var(--green-glow)'}}>
                {user?.avatar?<img src={user.avatar} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:(user?.name?.[0]?.toUpperCase()||'U')}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:'var(--font-b)'}}>{user?.name?.split(' ')[0]||'Profile'}</span>
            </button>
          </div>
        </header>
        <div className="desktop-body">
          <aside className="sidebar">
            <div className="sidebar-section-label">Navigation</div>
            {TABS.map(t=>(
              <button key={t.id} className={`sidebar-item${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
                <span className="si-icon">{t.icon}</span>
                <span className="si-label">{t.label}</span>
              </button>
            ))}
            <div className="sidebar-divider"/>
            <div className="sidebar-add-btn">
              <button className="btn-primary" style={{fontSize:13,padding:13}} onClick={()=>setModal(true)}>
                + Add Transaction
              </button>
            </div>
          </aside>
          <main className="desktop-main">{renderPage()}</main>
        </div>
      </div>
      <Overlays/>
    </div>
  );
}