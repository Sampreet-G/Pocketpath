import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import { dashboardApi, txApi, goalsApi, insightsApi, reflectApi, profileApi } from "./api";
import OnboardingDemo from "./pages/OnboardingDemo";
import ProfilePage from "./pages/ProfilePage";


/* ─── HELPERS ─────────────────────────────────────────────── */
const CAT_ICON = {
  Food:"🍜", Travel:"🚕", Shopping:"🛍️", Groceries:"🛒",
  Subscriptions:"🎬", Income:"💰", Transfer:"📲", Health:"💊",
  Education:"📚", Entertainment:"🎮", Other:"📌",
};
const CAT_COLOR = {
  Food:"#FDE8D8", Travel:"#E8E0F8", Shopping:"#E8F4FD", Groceries:"#E8F4E8",
  Subscriptions:"#FFE8E8", Income:"#D4E8DC", Transfer:"#E8F0FD",
  Health:"#F8E8F4", Education:"#FDF8E8", Entertainment:"#F0E8FD", Other:"#F0EDE8",
};
// Dark-mode variants
const CAT_COLOR_DARK = {
  Food:"#3D2010", Travel:"#201830", Shopping:"#101C28", Groceries:"#0D2018",
  Subscriptions:"#2A1010", Income:"#0A2018", Transfer:"#101828",
  Health:"#2A0C20", Education:"#2A2208", Entertainment:"#1A1030", Other:"#1C1A18",
};
function getCatColor(cat, dark) {
  return dark ? (CAT_COLOR_DARK[cat] || '#1C1A18') : (CAT_COLOR[cat] || '#F0EDE8');
}
const CATS = ["Food","Travel","Shopping","Groceries","Subscriptions","Health","Education","Entertainment","Transfer","Other"];
const CHART_COLORS = ["#E8945A","#5A7DE8","#A05AE8","#5AE89A","#E8C85A","#E85A5A","#5AE8E8"];

function fmtINR(n) {
  const a = Math.abs(n);
  const currency = '₹';
  if (a >= 100000) return `${currency}${(a/100000).toFixed(1)}L`;
  if (a >= 1000)   return `${currency}${(a/1000).toFixed(1)}K`;
  return `${currency}${a.toLocaleString("en-IN")}`;
}
const pct = (a, b) => b > 0 ? Math.min(100, Math.round((a/b)*100)) : 0;

function Spinner() {
  return <div className="loading-spinner"><div className="spinner"/><span>Loading…</span></div>;
}

function Donut({ data }) {
  const size=90,cx=45,cy=45,r=34,stroke=10,circ=2*Math.PI*r;
  let offset=0;
  const slices = data.map(d => {
    const dash = (d.pct/100)*circ;
    const s = {...d, dash, offset};
    offset += dash;
    return s;
  });
  const now = new Date();
  const monthLabel = now.toLocaleString('default', { month: 'short' });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
      {slices.map((s,i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${circ-s.dash}`} strokeDashoffset={-s.offset+circ*0.25}
          style={{transform:"rotate(-90deg)",transformOrigin:"center"}}/>
      ))}
      <text x={cx} y={cy+4} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Syne,sans-serif" fill="var(--green)">{monthLabel}</text>
    </svg>
  );
}

function DarkToggle({ dark, toggle }) {
  return (
    <div className="dark-toggle" onClick={toggle} title="Toggle dark mode">
      <div className="dark-toggle-thumb">{dark?"🌙":"☀️"}</div>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <img 
        src="/piggybank.png" 
        alt="PocketPath Logo" 
        className="brand-logo"
        style={{ width: "28px", height: "28px" }}
      />

      <span className="brand-text">
        PocketPath
      </span>
    </div>
  );
}
/* ══════════════════════════ PAGE COMPONENTS ══════════════════ */

function HomeContent({ isDesktop, onAdd, showToast, refreshKey, dark }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await dashboardApi.get();
      setData(res.data);
    } catch (e) {
      showToast('⚠️ ' + e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Re-fetch dashboard whenever a transaction is added (refreshKey changes)
  useEffect(() => {
    if (refreshKey > 0) {
      load(true);  // silent refresh with pulse indicator
    } else {
      load(false); // initial load with spinner
    }
  }, [refreshKey]);

  if (loading) return <Spinner/>;
  if (!data)   return null;

  const { totalBalance, monthlyIncome, totalSpent, savingsRate, streak, spendByCategory, recentTransactions, tip, month } = data;

  const chips = spendByCategory.slice(0,4).map(s => ({
    icon: CAT_ICON[s.category] || '📌',
    label: s.category,
    amount: s.amount,
  }));

  const BalCard = () => (
    <div className="balance-card">
      <div className="balance-label" style={{display:"flex",alignItems:"center",gap:6}}>Total Balance · {month}{refreshing && <span style={{fontSize:9,background:"rgba(255,255,255,0.2)",padding:"2px 7px",borderRadius:99,letterSpacing:0.3}}>Updating…</span>}</div>
      <div className="balance-amount">{fmtINR(totalBalance)}</div>
      <div className="balance-row">
        <div><div className="stat-label">Income</div><div className="stat-val income">+{fmtINR(monthlyIncome)}</div></div>
        <div><div className="stat-label">Spent</div><div className="stat-val spent">-{fmtINR(totalSpent)}</div></div>
        <div><div className="stat-label">Saved</div><div className="stat-val">{savingsRate}%</div></div>
      </div>
    </div>
  );

  const StreakCard = () => (
    <div className="streak-card">
      <div className="streak-num">{streak}</div>
      <div>
        <div className="streak-label">🔥 Day Streak</div>
        <div className="streak-sub">Keep tracking daily!</div>
      </div>
    </div>
  );

  const InsightBanner = () => tip ? (
    <div className="insight-banner">
      <div className="ins-icon">💡</div>
      <div>
        <div className="ins-title">{tip.message}</div>
        <div className="ins-body">{tip.detail}</div>
      </div>
    </div>
  ) : null;

  if (isDesktop) return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <div className="desktop-page-title">Dashboard</div>
        <div className="page-subtitle">Financial overview · {month}</div>
      </div>
      <div className="stat-chips-row">
        {[
          {label:"Total Balance",   val:fmtINR(totalBalance), color:"var(--green)"},
          {label:"Monthly Income",  val:fmtINR(monthlyIncome),color:"var(--green-light)"},
          {label:"Total Spent",     val:fmtINR(totalSpent),   color:"var(--red)"},
          {label:"Savings Rate",    val:`${savingsRate}%`,     color:"var(--accent)"},
        ].map((s,i) => (
          <div key={i} className="stat-chip">
            <div className="stat-chip-val" style={{color:s.color}}>{s.val}</div>
            <div className="stat-chip-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="d-grid-2" style={{marginBottom:18}}>
        <BalCard/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <StreakCard/>
          {tip && <InsightBanner/>}
          <div className="card">
            <div className="section-title" style={{marginBottom:12}}>Quick Actions</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {icon:'➕',label:'Add Expense',action:onAdd,color:'var(--green-pale)'},
                {icon:'🎯',label:'New Goal',action:onAdd,color:'#EDE8F8'},
                {icon:'📊',label:'View Insights',action:()=>{},color:'#FDF0D8'},
                {icon:'🧘',label:'Reflect',action:()=>{},color:'#D4E8DC'},
              ].map((a,i)=>(
                <button key={i} onClick={a.action} style={{display:'flex',alignItems:'center',gap:8,padding:'11px 12px',borderRadius:'var(--r-sm)',background:a.color,border:'none',cursor:'pointer',fontFamily:'var(--font-b)',fontSize:13,fontWeight:600,color:'var(--text)',transition:'all 0.15s',textAlign:'left'}}>
                  <span style={{fontSize:16}}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="section-hdr"><div className="section-title">Spend by Category</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {chips.map((c,i) => (
              <div key={i} className="chip" style={{minWidth:0}}>
                <div className="chip-icon">{c.icon}</div>
                <div className="chip-label">{c.label}</div>
                <div className="chip-amount">{fmtINR(c.amount)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-hdr"><div className="section-title">Recent Transactions</div></div>
          {recentTransactions.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-title">No transactions yet</div></div>
          ) : recentTransactions.map(t => (
            <div key={t._id} className="tx-row" style={{marginBottom:6}}>
              <div className="tx-icon" style={{background: getCatColor(t.category, dark)}}>{CAT_ICON[t.category]||'📌'}</div>
              <div className="tx-info"><div className="tx-name">{t.title}</div><div className="tx-cat">{t.category}{t.merchant ? ' · '+t.merchant : ''}</div></div>
              <div className={`tx-amount ${t.type==='income'?"credit":"debit"}`}>
                {t.type==='income'?'+':'-'}{fmtINR(t.amount)}
              </div>
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
        <div>
          <div style={{fontSize:11,color:"var(--text-muted)",marginBottom:2}}>Good morning ☀️</div>
          <div className="page-title">Dashboard</div>
        </div>
        <div style={{width:42,height:42,borderRadius:14,background:"var(--green-pale)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👋</div>
      </div>
      <div className="px mb"><BalCard/></div>
      <div className="px mb"><StreakCard/></div>
      {chips.length > 0 && (
        <div style={{padding:"0 16px 14px"}} className="spend-chips">
          {chips.map((c,i) => (
            <div key={i} className="chip">
              <div className="chip-icon">{c.icon}</div>
              <div className="chip-label">{c.label}</div>
              <div className="chip-amount">{fmtINR(c.amount)}</div>
            </div>
          ))}
        </div>
      )}
      {tip && <div className="px mb"><InsightBanner/></div>}
      <div className="section-hdr px" style={{marginBottom:10}}><div className="section-title">Recent</div></div>
      <div className="px">
        {recentTransactions.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-title">No transactions yet</div><div>Add your first expense to get started</div></div>
        ) : recentTransactions.map(t => (
          <div key={t._id} className="tx-row">
            <div className="tx-icon" style={{background: getCatColor(t.category, dark)}}>{CAT_ICON[t.category]||'📌'}</div>
            <div className="tx-info"><div className="tx-name">{t.title}</div><div className="tx-cat">{t.category}</div></div>
            <div className={`tx-amount ${t.type==='income'?"credit":"debit"}`}>
              {t.type==='income'?'+':'-'}{fmtINR(t.amount)}
            </div>
          </div>
        ))}
      </div>
      <div className="px" style={{marginTop:8,marginBottom:4}}>
        <button className="btn-primary" onClick={onAdd}>+ Add Expense</button>
      </div>
    </div>
  );
}

function ActivityContent({ isDesktop, refreshKey, dark }) {
  const [transactions, setTx]     = useState([]);
  const [loading,      setLoading] = useState(true);
  const [page,         setPage]    = useState(1);
  const [total,        setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    txApi.list({ limit: 30, page })
      .then(res => { setTx(res.transactions); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, refreshKey]);

  if (loading) return <Spinner/>;

  return (
    <div className="page">
      {isDesktop ? (
        <div style={{marginBottom:22}}>
          <div className="desktop-page-title">Activity</div>
          <div className="page-subtitle">{total} transactions total</div>
        </div>
      ) : (
        <div className="page-header" style={{paddingTop:16}}>
          <div><div className="page-title">Activity</div><div className="page-subtitle">All transactions</div></div>
          <div style={{fontSize:11,background:"var(--green-pale)",color:"var(--green)",padding:"5px 12px",borderRadius:99,fontWeight:600}}>{total} txns</div>
        </div>
      )}
      {/* Desktop: stats row + two-column list */}
      {isDesktop && (
        <div className="page-stats-row">
          {[
            {label:'Total transactions', val:total, color:'var(--text)'},
            {label:'Total income', val:fmtINR(transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)), color:'var(--green-light)'},
            {label:'Total spent', val:fmtINR(transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)), color:'var(--red)'},
            {label:'Categories', val:[...new Set(transactions.map(t=>t.category))].length, color:'var(--accent)'},
          ].map((s,i)=>(
            <div key={i} className="page-stat-card">
              <div className="page-stat-card-val" style={{color:s.color}}>{s.val}</div>
              <div className="page-stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className={isDesktop?"d-grid-2":"px"}>
        <div>
          {transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No transactions yet</div>
              <div>Start by adding your first expense</div>
            </div>
          ) : transactions.map(t => (
            <div key={t._id} className="tx-row">
              <div className="tx-icon" style={{background: getCatColor(t.category, dark)}}>{CAT_ICON[t.category]||'📌'}</div>
              <div className="tx-info">
                <div className="tx-name">{t.title}</div>
                <div className="tx-cat">{t.category}{t.merchant ? ` · ${t.merchant}` : ''}</div>
              </div>
              <div className={`tx-amount ${t.type==='income'?"credit":"debit"}`}>
                {t.type==='income'?'+':'-'}{fmtINR(t.amount)}
              </div>
            </div>
          ))}
        </div>
        {isDesktop && (
          <div>
            <div className="card" style={{marginBottom:14}}>
              <div className="section-title" style={{marginBottom:14}}>Spending by Category</div>
              {[...transactions.filter(t=>t.type==='expense').reduce((m,t)=>{m.set(t.category,(m.get(t.category)||0)+t.amount);return m;},new Map()).entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([cat,amt],i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:9,background:getCatColor(cat,dark),display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{CAT_ICON[cat]||'📌'}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{cat}</span>
                      <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{fmtINR(amt)}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{width:`${Math.min(100,Math.round((amt/Math.max(...[...transactions.filter(t=>t.type==='expense').reduce((m,t)=>{m.set(t.category,(m.get(t.category)||0)+t.amount);return m;},new Map()).values()]))*100))}%`}}/></div>
                  </div>
                </div>
              ))}
              {transactions.filter(t=>t.type==='expense').length===0 && <div style={{fontSize:13,color:'var(--text-muted)',textAlign:'center',padding:'20px 0'}}>No expenses yet</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GoalsContent({ isDesktop, showToast }) {
  const [goals,   setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title,   setTitle]   = useState('');
  const [target,  setTarget]  = useState('');
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await goalsApi.list();
      setGoals(res.goals);
    } catch (e) {
      showToast('⚠️ ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addGoal() {
    if (!title || !target) return;
    setSaving(true);
    try {
      const res = await goalsApi.create({ title, targetAmount: Number(target), savedAmount: 0, emoji: '🎯' });
      setGoals(g => [...g, res.goal]);
      setTitle(''); setTarget(''); setShowNew(false);
      showToast('✓ Goal created!');
    } catch (e) {
      showToast('⚠️ ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteGoal(id) {
    try {
      await goalsApi.delete(id);
      setGoals(g => g.filter(x => x._id !== id));
      showToast('Goal deleted');
    } catch (e) {
      showToast('⚠️ ' + e.message);
    }
  }

  if (loading) return <Spinner/>;

  const GCard = ({ g }) => (
    <div className="goal-card">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:13,background:"#EDE8F8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{g.emoji}</div>
          <div>
            <div style={{fontFamily:"var(--font-d)",fontSize:15,fontWeight:700}}>{g.title}</div>
            <div style={{fontSize:11,color:"var(--text-muted)",marginTop:1}}>{fmtINR(g.savedAmount)} saved</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:800,color:"var(--green)"}}>{g.progress ?? pct(g.savedAmount,g.targetAmount)}%</div>
          <button onClick={() => deleteGoal(g._id)} style={{background:"var(--red-light)",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",color:"var(--red)",fontSize:12}}>✕</button>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{width:`${g.progress ?? pct(g.savedAmount,g.targetAmount)}%`}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:"var(--text-muted)"}}>
        <span>₹0</span><span style={{fontWeight:600}}>Target: {fmtINR(g.targetAmount)}</span>
      </div>
    </div>
  );

  const AddForm = () => (
    <div className="card">
      <div style={{fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,marginBottom:14}}>New Goal</div>
      <input className="input-field" placeholder="Goal name" value={title} onChange={e=>setTitle(e.target.value)}/>
      <input className="input-field" placeholder="Target amount (₹)" type="number" value={target} onChange={e=>setTarget(e.target.value)}/>
      <div style={{display:"flex",gap:8}}>
        <button className="btn-primary" style={{flex:1,padding:12}} onClick={addGoal} disabled={saving}>{saving?'Saving…':'Add Goal'}</button>
        <button className="btn-primary" style={{flex:1,padding:12,background:"var(--bg2)",color:"var(--text)"}} onClick={()=>setShowNew(false)}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      {isDesktop ? (
        <div style={{marginBottom:22}}>
          <div className="desktop-page-title">Goals</div>
          <div className="page-subtitle">{goals.length} active goals</div>
        </div>
      ) : (
        <div className="page-header" style={{paddingTop:16}}><div className="page-title">Goals</div></div>
      )}
      {isDesktop && (
        <div className="page-stats-row">
          {[
            {label:'Active goals', val:goals.filter(g=>!g.isCompleted).length, color:'var(--text)'},
            {label:'Completed', val:goals.filter(g=>g.isCompleted).length, color:'var(--green-light)'},
            {label:'Total saved', val:fmtINR(goals.reduce((s,g)=>s+g.savedAmount,0)), color:'var(--accent)'},
            {label:'Total target', val:fmtINR(goals.reduce((s,g)=>s+g.targetAmount,0)), color:'var(--text-mid)'},
          ].map((s,i)=>(
            <div key={i} className="page-stat-card">
              <div className="page-stat-card-val" style={{color:s.color}}>{s.val}</div>
              <div className="page-stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className={isDesktop?"d-grid-2":"px gap"}>
        <div className={isDesktop?"gap":"gap"}>
          {goals.map(g => <GCard key={g._id} g={g}/>)}
          {showNew ? <AddForm/> : (
            <button className="add-goal-btn" onClick={()=>setShowNew(true)}>＋ New Goal</button>
          )}
        </div>
        {isDesktop && (
          <div>
            <div className="card" style={{marginBottom:14}}>
              <div className="section-title" style={{marginBottom:16}}>Overall Progress</div>
              {goals.length === 0 ? (
                <div style={{textAlign:'center',padding:'24px 0',color:'var(--text-muted)',fontSize:13}}>No goals yet — add one!</div>
              ) : goals.map((g,i)=>(
                <div key={g._id} style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontSize:14,fontWeight:600,color:'var(--text)'}}>{g.emoji} {g.title}</span>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>{g.progress ?? pct(g.savedAmount,g.targetAmount)}%</span>
                  </div>
                  <div className="progress-track" style={{height:8}}>
                    <div className="progress-fill" style={{width:`${g.progress ?? pct(g.savedAmount,g.targetAmount)}%`}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:11,color:'var(--text-muted)'}}>
                    <span>{fmtINR(g.savedAmount)} saved</span>
                    <span>{fmtINR(g.targetAmount)} target</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="section-title" style={{marginBottom:12}}>💡 Savings Tips</div>
              {[
                {t:'Automate transfers', b:'Set up auto-transfer on payday so you save before you spend.'},
                {t:'50/30/20 rule', b:'50% needs · 30% wants · 20% savings. A simple framework that works.'},
                {t:'Celebrate milestones', b:'Every 25% counts. Reward yourself (cheaply!) to stay motivated.'},
              ].map((tip,i)=>(
                <div key={i} style={{marginBottom:i<2?12:0,paddingBottom:i<2?12:0,borderBottom:i<2?'1px solid var(--border)':'none'}}>
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

function InsightsContent({ isDesktop, showToast, refreshKey, dark }) {
  const [breakdown, setBreakdown] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    insightsApi.categories()
      .then(res => setBreakdown(res.breakdown))
      .catch(e => showToast('⚠️ ' + e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <Spinner/>;

  const total = breakdown.reduce((s,b) => s + b.total, 0);
  const cats  = breakdown.slice(0,5).map((b,i) => ({
    label: b.category,
    color: CHART_COLORS[i % CHART_COLORS.length],
    pct:   total > 0 ? Math.round((b.total/total)*100) : 0,
    total: b.total,
    overLimit: b.overLimit,
  }));

  const pills = [
    { label: "Budget Control", fill: Math.max(0, 100 - cats.filter(c=>c.overLimit).length*20), color:"#FFD580" },
    { label: "Spend Tracked",  fill: cats.length > 0 ? 100 : 0, color:"#7DE8A8" },
    { label: "Categories",     fill: Math.min(100, cats.length * 20), color:"#80C8FF" },
  ];
  const score = Math.round(pills.reduce((s,p) => s+p.fill, 0)/3);

  return (
    <div className="page">
      {isDesktop ? (
        <div style={{marginBottom:22}}>
          <div className="desktop-page-title">Insights</div>
          <div className="page-subtitle">Spending breakdown · this month</div>
        </div>
      ) : (
        <div className="page-header" style={{paddingTop:16}}>
          <div><div className="page-title">Insights</div><div className="page-subtitle">Spending breakdown</div></div>
        </div>
      )}

      {breakdown.length === 0 ? (
        <div className={isDesktop?"":"px"}>
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No data yet</div>
            <div>Add some transactions to see insights</div>
          </div>
        </div>
      ) : (
        <>
        {isDesktop && (
          <div className="page-stats-row">
            {[
              {label:'Total spent this month', val:fmtINR(breakdown.reduce((s,b)=>s+b.total,0)), color:'var(--red)'},
              {label:'Categories tracked', val:breakdown.length, color:'var(--text)'},
              {label:'Over budget', val:breakdown.filter(b=>b.overLimit).length, color: breakdown.filter(b=>b.overLimit).length>0?'var(--red)':'var(--green-light)'},
              {label:'Wellness score', val:`${score}/100`, color:'var(--accent)'},
            ].map((s,i)=>(
              <div key={i} className="page-stat-card">
                <div className="page-stat-card-val" style={{color:s.color}}>{s.val}</div>
                <div className="page-stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <div className={isDesktop?"d-grid-2 mb":"px gap"}>
          <div className="wellness-card">
            <div className="wellness-title">Financial Wellness Score</div>
            <div className="wellness-score-row">
              <div className="wellness-circle">
                <div className="wellness-num">{score}</div>
                <div className="wellness-denom">/100</div>
              </div>
              <div className="wellness-pills">
                {pills.map((p,i) => (
                  <div key={i} className="wellness-pill">
                    <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,opacity:.8,marginBottom:3}}>{p.label}</div>
                      <div className="wellness-pill-bar"><div className="wellness-pill-fill" style={{width:`${p.fill}%`,background:p.color}}/></div>
                    </div>
                    <div style={{fontSize:11,fontWeight:700}}>{p.fill}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-card-title">Spending by Category</div>
            {cats.length > 0 ? (
              <div className="donut-wrap">
                <Donut data={cats}/>
                <div className="donut-legend">
                  {cats.map((c,i) => (
                    <div key={i} className="legend-row">
                      <div className="legend-dot" style={{background:c.color}}/>
                      <div className="legend-label">{c.label}</div>
                      <div className="legend-pct" style={{color:c.color}}>{c.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div style={{color:"var(--text-muted)",fontSize:13}}>No expenses this month</div>}
          </div>

          {breakdown.filter(b => b.overLimit).map((b,i) => (
            <div key={i} className="insight-banner">
              <div className="ins-icon">⚠️</div>
              <div>
                <div className="ins-title">{b.category} over budget!</div>
                <div className="ins-body">Spent {fmtINR(b.total)} · Limit was {fmtINR(b.limit)}</div>
              </div>
            </div>
          ))}
          {isDesktop && breakdown.length > 0 && (
            <div>
              <div className="card" style={{marginBottom:14}}>
                <div className="insight-card-title">Top Spending</div>
                {breakdown.slice(0,5).map((b,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:CHART_COLORS[i%CHART_COLORS.length],flexShrink:0}}/>
                    <span style={{flex:1,fontSize:13,fontWeight:500,color:'var(--text)'}}>{b.category}</span>
                    <span style={{fontSize:13,fontWeight:700,color:b.overLimit?'var(--red)':'var(--text)'}}>{fmtINR(b.total)}</span>
                    {b.overLimit && <span style={{fontSize:10,background:'var(--red-light)',color:'var(--red)',padding:'2px 6px',borderRadius:99,fontWeight:700}}>Over</span>}
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="insight-card-title">💡 Money Insights</div>
                <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.7}}>
                  {breakdown[0] && <p style={{marginBottom:8}}>Your biggest expense is <strong style={{color:'var(--text)'}}>{breakdown[0].category}</strong> at {fmtINR(breakdown[0].total)} this month.</p>}
                  <p style={{marginBottom:8}}>Set budget limits in the Insights settings to get alerts when you're close to your limit.</p>
                  <p>Track consistently for 3+ months to see spending trends and personalised recommendations.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}

function ReflectContent({ onComplete, isDesktop, showToast }) {
  const [reflections, setReflections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [text,        setText]        = useState('');
  const [mood,        setMood]        = useState('okay');
  const [saving,      setSaving]      = useState(false);

  const MOODS = ['great','good','okay','bad','stressed'];
  const MOOD_EMOJI = { great:'😄', good:'🙂', okay:'😐', bad:'😕', stressed:'😰' };

  useEffect(() => {
    reflectApi.list({ limit: 5 })
      .then(res => setReflections(res.reflections))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await reflectApi.create({ content: text, mood });
      setReflections(r => [res.reflection, ...r]);
      setText('');
      showToast('✓ Reflection saved!');
    } catch (e) {
      showToast('⚠️ ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner/>;

  return (
    <div className="page">
      {isDesktop ? (
        <div style={{marginBottom:22}}>
          <div className="desktop-page-title">Reflect 🧘</div>
          <div className="page-subtitle">Journal your money thoughts</div>
        </div>
      ) : (
        <div className="page-header" style={{paddingTop:16}}>
          <div><div className="page-title">Reflect</div><div className="page-subtitle">Money journal</div></div>
          <div style={{fontSize:26}}>🧘</div>
        </div>
      )}
      {/* Desktop: two-column layout */}
      {isDesktop ? (
        <div className="d-grid-2">
          {/* Left: new entry + past entries */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="card">
              <div style={{fontFamily:"var(--font-d)",fontSize:15,fontWeight:700,marginBottom:12}}>✍️ New Entry</div>
              <textarea className="reflection-input" placeholder="How did your spending make you feel today? Any wins or regrets?" value={text} onChange={e=>setText(e.target.value)} rows={4}/>
              <div style={{display:"flex",gap:6,marginBottom:14,marginTop:8}}>
                {MOODS.map(m => (
                  <button key={m} onClick={()=>setMood(m)}
                    style={{flex:1,padding:"10px 4px",borderRadius:"var(--r-xs)",border:`1.5px solid ${mood===m?"var(--green)":"var(--border)"}`,background:mood===m?"var(--green-pale)":"var(--surface)",cursor:"pointer",fontSize:18,transition:'all 0.15s'}}>
                    {MOOD_EMOJI[m]}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:10}}>Mood: {mood.charAt(0).toUpperCase()+mood.slice(1)}</div>
              <button className="btn-primary" onClick={submit} disabled={saving||!text.trim()}>
                {saving?'Saving…':'Save Entry ✓'}
              </button>
            </div>
            {reflections.map(r => (
              <div key={r._id} className="card">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--text-muted)"}}>
                    {new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </div>
                  <span style={{fontSize:18}}>{MOOD_EMOJI[r.mood]}</span>
                </div>
                <div style={{fontSize:13,lineHeight:1.7,color:"var(--text)"}}>{r.content}</div>
              </div>
            ))}
            {reflections.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📓</div>
                <div className="empty-title">No entries yet</div>
                <div>Write your first reflection above</div>
              </div>
            )}
          </div>
          {/* Right: prompts + mood stats */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="card">
              <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,marginBottom:14}}>💭 Reflection Prompts</div>
              {[
                {q:'What was your best money decision this week?', icon:'✅'},
                {q:'Where do you think you overspent?', icon:'💸'},
                {q:'What is one money habit you want to build?', icon:'🎯'},
                {q:'Did any purchase make you feel guilty? Why?', icon:'🤔'},
                {q:'What would you tell your future self about money?', icon:'📬'},
              ].map((p,i)=>(
                <div key={i} onClick={()=>setText(prev=>prev?prev+' '+p.q:p.q)}
                  style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',borderRadius:'var(--r-xs)',background:'var(--bg)',marginBottom:6,cursor:'pointer',border:'1px solid var(--border)',transition:'all 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--green-pale)'}
                  onMouseLeave={e=>e.currentTarget.style.background='var(--bg)'}>
                  <span style={{fontSize:16,flexShrink:0}}>{p.icon}</span>
                  <span style={{fontSize:12,color:'var(--text-mid)',lineHeight:1.5}}>{p.q}</span>
                </div>
              ))}
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>Click any prompt to add it to your entry</div>
            </div>
            <div className="card">
              <div style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,marginBottom:14}}>📈 Mood History</div>
              {reflections.length === 0 ? (
                <div style={{fontSize:13,color:'var(--text-muted)',textAlign:'center',padding:'16px 0'}}>No entries yet</div>
              ) : (
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {reflections.slice(0,12).map((r,i)=>(
                    <div key={i} title={new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      style={{width:36,height:36,borderRadius:10,background:'var(--bg)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,cursor:'default'}}>
                      {MOOD_EMOJI[r.mood]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mobile layout */
        <div className="px" style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="card">
            <div style={{fontFamily:"var(--font-d)",fontSize:15,fontWeight:700,marginBottom:12}}>New Entry</div>
            <textarea className="reflection-input" placeholder="How did your spending make you feel today? Any wins or regrets?" value={text} onChange={e=>setText(e.target.value)} rows={3}/>
            <div style={{display:"flex",gap:6,marginBottom:14,marginTop:8}}>
              {MOODS.map(m => (
                <button key={m} onClick={()=>setMood(m)}
                  style={{flex:1,padding:"8px 4px",borderRadius:"var(--r-xs)",border:`1.5px solid ${mood===m?"var(--green)":"var(--border)"}`,background:mood===m?"var(--green-pale)":"var(--bg)",cursor:"pointer",fontSize:16}}>
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={submit} disabled={saving||!text.trim()}>
              {saving?'Saving…':'Save Entry'}
            </button>
          </div>
          {reflections.map(r => (
            <div key={r._id} className="card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text-muted)"}}>
                  {new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </div>
                <span style={{fontSize:18}}>{MOOD_EMOJI[r.mood]}</span>
              </div>
              <div style={{fontSize:13,lineHeight:1.6,color:"var(--text)"}}>{r.content}</div>
            </div>
          ))}
          {reflections.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📓</div>
              <div className="empty-title">No entries yet</div>
              <div>Write your first reflection above</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── ADD MODAL ───────────────────────────────────────────── */
function AddModal({ onClose, onAdd }) {
  const [amount,  setAmount]  = useState('');
  const [name,    setName]    = useState('');
  const [cat,     setCat]     = useState('Food');
  const [merchant,setMerchant]= useState('');
  const [type,    setType]    = useState('expense');
  const [saving,  setSaving]  = useState(false);

  async function submit() {
    if (!amount || !name) return;
    setSaving(true);
    try {
      await onAdd({ title: name, amount: Number(amount), type, category: type==='income'?'Income':cat, merchant });
      onClose();
    } catch(e) {
      // error already toasted by addTx
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-title">Add Transaction</div>

        {/* Type toggle */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {['expense','income'].map(t => (
            <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:"10px",borderRadius:"var(--r-xs)",border:`1.5px solid ${type===t?"var(--green)":"var(--border)"}`,background:type===t?"var(--green-pale)":"var(--bg)",cursor:"pointer",fontFamily:"var(--font-b)",fontSize:13,fontWeight:600,color:type===t?"var(--green)":"var(--text-muted)",transition:"all 0.15s"}}>
              {t === 'expense' ? '💸 Expense' : '💰 Income'}
            </button>
          ))}
        </div>

        <input className="input-field" placeholder="Amount (₹)" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/>
        <input className="input-field" placeholder="Description (e.g. Lunch at Swiggy)" value={name} onChange={e=>setName(e.target.value)}/>
        <input className="input-field" placeholder="Merchant (optional)" value={merchant} onChange={e=>setMerchant(e.target.value)}/>

        {type === 'income' ? (
          <div style={{background:'var(--green-pale)',border:'1px solid var(--green-light)',borderRadius:'var(--r-xs)',padding:'10px 14px',marginBottom:10,fontSize:13,color:'var(--green)',fontWeight:600}}>
            💰 This will be recorded as Income
          </div>
        ) : (
          <>
            <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:8,fontWeight:500}}>Category</div>
            <div className="cat-grid">
              {CATS.filter(c=>c!=='Income').map(c => (
                <div key={c} className={`cat-btn${cat===c?" selected":""}`} onClick={()=>setCat(c)}>
                  <span style={{fontSize:19}}>{CAT_ICON[c]}</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="btn-primary" onClick={submit} disabled={saving||!amount||!name}>
          {saving ? 'Saving…' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
        </button>
      </div>
    </div>
  );
}

/* ─── TABS ────────────────────────────────────────────────── */
const TABS = [
  { id:"home",     icon:"🏠", label:"Home"     },
  { id:"activity", icon:"📋", label:"Activity" },
  { id:"goals",    icon:"🎯", label:"Goals"    },
  { id:"insights", icon:"💡", label:"Insights" },
  { id:"reflect",  icon:"🧘", label:"Reflect"  },
  { id:"profile",  icon:"👤", label:"Profile"  },
];

/* ══════════════════════════ ROOT ════════════════════════════ */
export default function PocketPath() {
  const [tab,        setTab]    = useState('home');
  const [dark,       setDark]   = useState(false);
  const [showModal,  setModal]  = useState(false);
  const [toast,      setToast]  = useState(null);
  const [isDesktop,  setDesk]   = useState(window.innerWidth >= 768);
  const [txRefresh,  setTxRef]  = useState(0);
  const { user } = useAuth();
  // Show onboarding once per account (keyed by user id)
  const [showOnboarding, setOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    const key = user?._id ? `pp_onboarded_${user._id}` : 'pp_onboarded';
    return !localStorage.getItem(key);
  });
  function doneOnboarding() {
    const key = user?._id ? `pp_onboarded_${user._id}` : 'pp_onboarded';
    localStorage.setItem(key, '1');
    setOnboarding(false);
  }

  useEffect(() => {
    const h = () => setDesk(window.innerWidth >= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2100);
  }

  async function addTx(body) {
    try {
      const res = await txApi.create(body);
      // Increment refresh key — causes HomeContent, ActivityContent, InsightsContent to re-fetch
      setTxRef(r => r + 1);
      showToast(`✓ ${body.type === 'income' ? 'Income' : 'Expense'} added`);
      // If we're not on home, switch to home so user sees the update
      // (don't force-switch — let the refreshKey do the work silently)
      return res;
    } catch (e) {
      showToast('⚠️ ' + e.message);
      throw e;
    }
  }

  const pp = { isDesktop, showToast, onAdd: () => setModal(true), onComplete: () => setTab('home'), refreshKey: txRefresh, dark };

  function renderPage() {
    if (tab === 'home')     return <HomeContent     {...pp}/>;
    if (tab === 'activity') return <ActivityContent {...pp}/>;
    if (tab === 'goals')    return <GoalsContent    {...pp}/>;
    if (tab === 'insights') return <InsightsContent {...pp}/>;
    if (tab === 'reflect')  return <ReflectContent  {...pp}/>;
    if (tab === 'profile')  return <ProfilePage     {...pp}/>;
  }

  const Overlays = () => <>
    {showOnboarding && <OnboardingDemo onDone={doneOnboarding}/>}
    {showModal && <AddModal onClose={() => setModal(false)} onAdd={addTx}/>}
    {toast     && <div className="toast">{toast}</div>}
  </>;

  /* ── MOBILE ── */
  if (!isDesktop) return (
    <>
      <div data-dark={dark} style={{minHeight:"100vh",background:"var(--bg)"}}>
        <div className="app-mobile">
          <div className="mobile-header">
            <Brand/>
            <DarkToggle dark={dark} toggle={() => setDark(d => !d)}/>
          </div>
          <div className="mobile-scroll">{renderPage()}</div>
          <nav className="bottom-nav">
            {TABS.map(t => (
              <button key={t.id} className={`nav-item${tab===t.id?" active":""}`} onClick={() => setTab(t.id)}>
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
      <div data-dark={dark} style={{minHeight:"100vh",background:"var(--bg)"}}>
        <div className="app-desktop">
          <header className="desktop-header">
            <div style={{display:"flex",alignItems:"center",gap:28}}>
              <Brand/>
              <nav style={{display:"flex",gap:2}}>
                {TABS.slice(0,5).map(t => (
                  <button key={t.id} className="header-nav-btn" onClick={() => setTab(t.id)}
                    style={{background:tab===t.id?"var(--green-pale)":"transparent",color:tab===t.id?"var(--green)":"var(--text-muted)",fontWeight:tab===t.id?700:500}}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </nav>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <DarkToggle dark={dark} toggle={() => setDark(d => !d)}/>
              <button onClick={() => setTab('profile')}
                style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"5px 12px 5px 5px",borderRadius:"var(--r-xs)",background:tab==="profile"?"var(--green-pale)":"transparent",border:"none",transition:"background 0.15s"}}>
                <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,var(--green-light),var(--green))",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,overflow:"hidden",flexShrink:0}}>
                  {user?.avatar ? <img src={user.avatar} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (user?.name?.[0]?.toUpperCase()||"U")}
                </div>
                <span style={{fontSize:13,fontWeight:600,color:"var(--text)",fontFamily:"var(--font-b)"}}>{user?.name?.split(" ")[0]||"Profile"}</span>
              </button>
            </div>
          </header>
          <div className="desktop-body">
            <aside className="sidebar">
              <div className="sidebar-section-label">Navigation</div>
              {TABS.map(t => (
                <button key={t.id} className={`sidebar-item${tab===t.id?" active":""}`} onClick={() => setTab(t.id)}>
                  <span className="si-icon">{t.icon}</span>
                  <span className="si-label">{t.label}</span>
                </button>
              ))}
              <div className="sidebar-add-btn">
                <button className="btn-primary" style={{fontSize:13,padding:12}} onClick={() => setModal(true)}>
                  + Add Transaction
                </button>
              </div>
            </aside>
            <main className="desktop-main">{renderPage()}</main>
          </div>
        </div>
        <Overlays/>
      </div>
    </>
  );
}