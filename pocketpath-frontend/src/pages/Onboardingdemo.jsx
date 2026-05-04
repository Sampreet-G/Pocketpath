import { useState, useEffect } from 'react';

const SLIDES = [
  {
    emoji: '📊',
    color: 'linear-gradient(135deg, #1A3C2E 0%, #2D5C45 100%)',
    accent: '#7DE8A8',
    title: 'Your finances,\nat a glance',
    body: 'See your balance, income, spending, and savings rate — all on one beautiful dashboard updated in real time.',
    visual: 'dashboard',
  },
  {
    emoji: '💸',
    color: 'linear-gradient(135deg, #1a2a4a 0%, #2d3f6e 100%)',
    accent: '#80C8FF',
    title: 'Track every\ntransaction',
    body: 'Log expenses and income in seconds. Categorise automatically and get a clear picture of where your money goes.',
    visual: 'transactions',
  },
  {
    emoji: '🎯',
    color: 'linear-gradient(135deg, #3a1a2e 0%, #6e2d5c 100%)',
    accent: '#FFB3E8',
    title: 'Reach your\ngoals faster',
    body: 'Set savings targets for anything — travel, gadgets, emergency fund. Watch your progress bars fill up week by week.',
    visual: 'goals',
  },
  {
    emoji: '💡',
    color: 'linear-gradient(135deg, #2a2200 0%, #5c4a00 100%)',
    accent: '#FFD580',
    title: 'Smart insights\nthat matter',
    body: 'Get personalised tips when you overspend, budget alerts by category, and a financial wellness score.',
    visual: 'insights',
  },
  {
    emoji: '🧘',
    color: 'linear-gradient(135deg, #0d2318 0%, #1a4a30 100%)',
    accent: '#A8F0C8',
    title: 'Reflect &\ngrow',
    body: "Journal your money feelings, track your streak, and build habits that actually stick. It's not just an app — it's a practice.",
    visual: 'reflect',
  },
];

function DashboardVisual({ accent }) {
  return (
    <div style={{ width: '100%', maxWidth: 280, margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Total Balance</div>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 16 }}>₹38,420</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['Income', '+₹42K', '#7DE8A8'], ['Spent', '-₹3.6K', '#FFB3B3'], ['Saved', '91%', '#FFD580']].map(([l,v,c],i) => (
            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
              <div style={{ fontSize: 9, opacity: 0.5, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {['Food', 'Travel', 'Subs', 'Other'].map((c,i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{['🍜','🚕','🎬','📌'][i]}</div>
            <div style={{ fontSize: 9, opacity: 0.5 }}>{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsVisual() {
  const txs = [
    { icon: '🍜', name: 'Swiggy', cat: 'Food', amt: '-₹420', col: '#FDE8D8' },
    { icon: '🚕', name: 'Uber', cat: 'Travel', amt: '-₹210', col: '#E8E0F8' },
    { icon: '💰', name: 'Salary', cat: 'Income', amt: '+₹42K', col: '#D4E8DC', credit: true },
    { icon: '🎬', name: 'Netflix', cat: 'Subs', amt: '-₹649', col: '#FFE8E8' },
  ];
  return (
    <div style={{ width: '100%', maxWidth: 280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {txs.map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)', animation: `slideInRow 0.4s ${i*0.1}s both` }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: t.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{t.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{t.name}</div>
            <div style={{ fontSize: 10, opacity: 0.5 }}>{t.cat}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.credit ? '#7DE8A8' : '#fff' }}>{t.amt}</div>
        </div>
      ))}
    </div>
  );
}

function GoalsVisual({ accent }) {
  const goals = [
    { icon: '🏖️', name: 'Goa Trip', pct: 36, saved: '₹18K', target: '₹50K' },
    { icon: '🛡️', name: 'Emergency Fund', pct: 60, saved: '₹12K', target: '₹20K' },
    { icon: '💻', name: 'MacBook', pct: 9, saved: '₹8K', target: '₹90K' },
  ];
  return (
    <div style={{ width: '100%', maxWidth: 280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {goals.map((g, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{g.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{g.name}</div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>{g.saved} / {g.target}</div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 800, color: accent }}>{g.pct}%</div>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${g.pct}%`, background: `linear-gradient(90deg, ${accent}88, ${accent})`, borderRadius: 99, transition: 'width 1s ease' }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsVisual({ accent }) {
  const cats = [
    { label: 'Food', pct: 30, color: '#E8945A' },
    { label: 'Travel', pct: 18, color: '#5A7DE8' },
    { label: 'Subs', pct: 14, color: '#A05AE8' },
    { label: 'Groceries', pct: 25, color: '#5AE89A' },
    { label: 'Other', pct: 13, color: '#E8C85A' },
  ];
  return (
    <div style={{ width: '100%', maxWidth: 280, margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 10 }}>
        <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 10, fontWeight: 600 }}>Spending by Category</div>
        {cats.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }}/>
            <div style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{c.label}</div>
            <div style={{ width: `${c.pct * 1.5}px`, height: 4, background: c.color, borderRadius: 99 }}/>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.color, width: 28, textAlign: 'right' }}>{c.pct}%</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,200,90,0.2)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: accent }}>💡 Food up 18% this month</div>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>₹2,500/week limit could save more</div>
      </div>
    </div>
  );
}

function ReflectVisual({ accent }) {
  return (
    <div style={{ width: '100%', maxWidth: 280, margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 18, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 10 }}>
        <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Weekly Reflection</div>
        <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6, marginBottom: 14 }}>
          "Best decision: cooked at home 4 days. Regret: impulse bought shoes online."
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['😄','🙂','😐','😕','😰'].map((m, i) => (
            <div key={i} style={{ flex: 1, padding: 6, borderRadius: 8, background: i===1 ? `${accent}30` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${i===1 ? accent : 'transparent'}`, textAlign: 'center', fontSize: 16 }}>{m}</div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: 28, fontWeight: 800, color: '#FFD580' }}>7</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FFD580' }}>🔥 Day Streak</div>
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>Keep it going!</div>
        </div>
      </div>
    </div>
  );
}

const ONBOARDING_CSS = `
@keyframes slideInRow { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
@keyframes onboardIn { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes dotPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }

.onboard-wrap {
  position: fixed; inset: 0; z-index: 500;
  display: flex; align-items: flex-end; justify-content: center;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}
@media (min-width: 768px) {
  .onboard-wrap { align-items: center; }
}
.onboard-sheet {
  width: 100%; max-width: 520px;
  border-radius: 32px 32px 0 0;
  display: flex; flex-direction: column;
  animation: onboardIn 0.4s cubic-bezier(.4,0,.2,1);
  max-height: 96vh; overflow: hidden;
}
@media (min-width: 768px) {
  .onboard-sheet { border-radius: 32px; max-height: 88vh; }
}
.onboard-scrollable {
  flex: 1; overflow-y: auto; min-height: 0;
}
.onboard-scrollable::-webkit-scrollbar { display: none; }
.onboard-hero {
  padding: 32px 28px 20px; display: flex; flex-direction: column;
  align-items: center; text-align: center;
}
.onboard-emoji { font-size: 52px; margin-bottom: 16px; display: block; }
.onboard-title { font-family: var(--font-d); font-size: 26px; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 10px; white-space: pre-line; }
.onboard-body  { font-size: 14px; opacity: 0.65; line-height: 1.7; max-width: 320px; }
.onboard-visual { padding: 0 20px 16px; }
.onboard-footer {
  flex-shrink: 0;
  background: rgba(0,0,0,0.25);
  padding: 16px 24px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.onboard-dots { display: flex; gap: 6px; }
.onboard-dot { width: 6px; height: 6px; border-radius: 99px; background: rgba(255,255,255,0.25); transition: all 0.3s; cursor: pointer; }
.onboard-dot.active { background: #fff; width: 20px; }
.onboard-skip { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); cursor: pointer; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.07); transition: all 0.2s; white-space: nowrap; }
.onboard-skip:hover { color: #fff; background: rgba(255,255,255,0.12); }
.onboard-next { padding: 12px 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.15); color: #fff; font-family: var(--font-b); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.onboard-next:hover { background: rgba(255,255,255,0.22); transform: translateY(-1px); }
.onboard-next.final { background: #fff; color: #1a3c2e; border-color: #fff; }
.onboard-next.final:hover { background: #f0f8f0; }
`;

export default function OnboardingDemo({ onDone }) {
  const [slide, setSlide] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const s = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  function next() {
    if (isLast) { onDone(); return; }
    setSlide(i => i + 1);
  }

  function renderVisual() {
    if (s.visual === 'dashboard')    return <DashboardVisual accent={s.accent}/>;
    if (s.visual === 'transactions') return <TransactionsVisual/>;
    if (s.visual === 'goals')        return <GoalsVisual accent={s.accent}/>;
    if (s.visual === 'insights')     return <InsightsVisual accent={s.accent}/>;
    if (s.visual === 'reflect')      return <ReflectVisual accent={s.accent}/>;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ONBOARDING_CSS }}/>
      <div className="onboard-wrap">
        <div className="onboard-sheet" style={{ background: s.color }}>
          <div className="onboard-scrollable">
            <div className="onboard-hero">
              <span className="onboard-emoji" key={slide}>{s.emoji}</span>
              <div className="onboard-title">{s.title}</div>
              <div className="onboard-body">{s.body}</div>
            </div>
            <div className="onboard-visual">{renderVisual()}</div>
          </div>
          <div className="onboard-footer">
            <button className="onboard-skip" onClick={onDone}>Skip</button>
            <div className="onboard-dots">
              {SLIDES.map((_, i) => (
                <div key={i} className={`onboard-dot${slide===i?' active':''}`} onClick={() => setSlide(i)}/>
              ))}
            </div>
            <button className={`onboard-next${isLast?' final':''}`} onClick={next}>
              {isLast ? "Let's go! 🚀" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}