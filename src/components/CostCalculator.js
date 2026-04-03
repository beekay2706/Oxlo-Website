import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────
// DATA — 100% sourced from live pages (March 2026)
// Oxlo:    https://www.oxlo.ai/pricing
// Groq:    https://groq.com/pricing
// Competitors: https://www.tldl.io/resources/llm-api-pricing-2026
// ─────────────────────────────────────────────

const OXLO_PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    reqPerDay: 60,
    burstPerMin: 5,
    latency: '≤ 7s',
    inputTokensPerReq: 2000,
    outputTokensPerReq: 512,
    queuedBehindPaid: true,
    trialDays: 0,
    tagline: 'No credit card required',
    features: ['Access to smaller OSS models', 'Clear usage limits', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 14.9,
    originalPrice: 35,
    reqPerDay: 300,
    burstPerMin: 30,
    latency: '≤ 1s',
    inputTokensPerReq: 4000,
    outputTokensPerReq: 1000,
    queuedBehindPaid: true,
    trialDays: 7,
    tagline: 'Early bull discount',
    badge: 'HOT',
    features: [
      'Everything in Free',
      'Faster request handling',
      'Optimized inference models (<8B)',
      'Higher throughput for dev workloads',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 49.9,
    originalPrice: 80,
    reqPerDay: 2000,
    burstPerMin: 120,
    latency: '≤ 100ms',
    inputTokensPerReq: 16000,
    outputTokensPerReq: 4000,
    queuedBehindPaid: false,
    trialDays: 7,
    tagline: 'Recommended for production',
    badge: 'RECOMMENDED',
    features: [
      'Everything in Pro',
      'Priority execution',
      'Optimized models over 8B',
      'Production-grade inference',
      'Higher & consistent throughput',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    reqPerDay: null,
    burstPerMin: 'Custom',
    latency: 'Tunable',
    inputTokensPerReq: null,
    outputTokensPerReq: null,
    queuedBehindPaid: false,
    trialDays: 0,
    tagline: 'Custom volume & dedicated GPUs',
    features: [
      'Everything in Premium',
      'Custom usage limits',
      'Dedicated GPU capacity',
      'Dedicated support',
      'Tailored deployment options',
    ],
  },
];

// Competitor token-based pricing — sourced from live pricing pages, March 2026
const COMPETITORS = [
  {
    name: 'Groq — Llama 3.1 8B Instant',
    inputPer1M: 0.05,
    outputPer1M: 0.08,
    url: 'https://groq.com/pricing',
    note: 'Fastest OSS inference (~840 TPS)',
    color: '#F97316',
  },
  {
    name: 'Groq — GPT-OSS 20B',
    inputPer1M: 0.075,
    outputPer1M: 0.30,
    url: 'https://groq.com/pricing',
    note: 'Good mid-tier OSS option',
    color: '#F97316',
  },
  {
    name: 'Groq — Llama 3.3 70B',
    inputPer1M: 0.59,
    outputPer1M: 0.79,
    url: 'https://groq.com/pricing',
    note: 'Larger OSS reasoning model',
    color: '#F97316',
  },
  {
    name: 'Together / Fireworks — OSS blended',
    inputPer1M: 0.18,
    outputPer1M: 0.18,
    url: 'https://www.together.ai/',
    note: '$0.05–$0.90/1M range; blended ~$0.18',
    color: '#8B5CF6',
  },
  {
    name: 'Anthropic — Claude Haiku 4.5',
    inputPer1M: 1.00,
    outputPer1M: 5.00,
    url: 'https://www.anthropic.com/pricing',
    note: 'Budget proprietary model',
    color: '#E879A8',
  },
  {
    name: 'Anthropic — Claude Sonnet 4.6',
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    url: 'https://www.anthropic.com/pricing',
    note: 'Mid-tier proprietary model',
    color: '#E879A8',
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getPlanForUsage(reqPerDay) {
  if (reqPerDay <= 60) return OXLO_PLANS[0];
  if (reqPerDay <= 300) return OXLO_PLANS[1];
  if (reqPerDay <= 2000) return OXLO_PLANS[2];
  return OXLO_PLANS[3];
}

function calcMonthlyCost(reqPerDay, inputTokens, outputTokens, inputPer1M, outputPer1M) {
  const monthly = reqPerDay * 30;
  const inCost = (monthly * inputTokens / 1_000_000) * inputPer1M;
  const outCost = (monthly * outputTokens / 1_000_000) * outputPer1M;
  return inCost + outCost;
}

function fmtUSD(n) {
  if (n === null || n === undefined) return 'Custom';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return String(n);
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function Slider({ label, value, min, max, step, onChange, display }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{
          fontSize: '13px', fontWeight: 700, color: '#03F7B5',
          background: 'rgba(3,247,181,0.08)', border: '1px solid rgba(3,247,181,0.25)',
          borderRadius: '6px', padding: '3px 10px', fontFamily: 'monospace',
        }}>
          {display}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#03F7B5', cursor: 'pointer', height: '4px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#4B5563' }}>
        <span>{fmtNum(min)}</span>
        <span>{fmtNum(max)}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent, planBadge }) {
  return (
    <div style={{
      padding: '22px 20px',
      borderRadius: '14px',
      background: accent ? 'rgba(3,247,181,0.05)' : 'rgba(255,255,255,0.02)',
      border: accent ? '1px solid rgba(3,247,181,0.3)' : '1px solid rgba(255,255,255,0.06)',
      textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    }}>
      {planBadge && (
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
          color: '#03F7B5', background: 'rgba(3,247,181,0.1)',
          border: '1px solid rgba(3,247,181,0.3)',
          borderRadius: '20px', padding: '2px 10px', textTransform: 'uppercase',
        }}>{planBadge}</span>
      )}
      <div style={{ fontSize: '11px', fontWeight: 600, color: accent ? '#03F7B5' : '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: accent ? '#03F7B5' : '#E5E7EB', lineHeight: 1, fontFamily: 'monospace' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: accent ? 'rgba(3,247,181,0.6)' : '#4B5563', lineHeight: 1.4 }}>
        {sub}
      </div>
    </div>
  );
}

function CompetitorRow({ comp, inputTokens, outputTokens, reqPerDay, oxloCost }) {
  const cost = calcMonthlyCost(reqPerDay, inputTokens, outputTokens, comp.inputPer1M, comp.outputPer1M);
  const saved = oxloCost !== null ? cost - oxloCost : null;
  const savePct = oxloCost !== null && cost > 0 ? ((cost - oxloCost) / cost * 100) : 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#D1D5DB', marginBottom: '2px' }}>
          {comp.name}
        </div>
        <div style={{ fontSize: '11px', color: '#4B5563' }}>
          Input ${comp.inputPer1M}/1M · Output ${comp.outputPer1M}/1M · {comp.note}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#E5E7EB', fontFamily: 'monospace' }}>
          {fmtUSD(cost)}
        </div>
        <div style={{ fontSize: '10px', color: '#4B5563' }}>per month</div>
      </div>
      {saved !== null && saved > 0 && (
        <div style={{
          textAlign: 'right', background: 'rgba(3,247,181,0.08)',
          border: '1px solid rgba(3,247,181,0.2)', borderRadius: '6px',
          padding: '4px 8px', minWidth: '72px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#03F7B5', fontFamily: 'monospace' }}>
            -{Math.round(savePct)}%
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(3,247,181,0.6)' }}>vs Oxlo</div>
        </div>
      )}
      {(saved === null || saved <= 0) && (
        <div style={{ minWidth: '72px' }} />
      )}
    </div>
  );
}

function PlanCard({ plan, isActive }) {
  return (
    <div style={{
      padding: '18px 16px',
      borderRadius: '12px',
      background: isActive ? 'rgba(3,247,181,0.06)' : 'rgba(255,255,255,0.015)',
      border: isActive ? '1px solid rgba(3,247,181,0.4)' : '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.2s ease',
      position: 'relative',
    }}>
      {plan.badge && (
        <div style={{
          position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
          color: plan.badge === 'HOT' ? '#F97316' : '#03F7B5',
          background: plan.badge === 'HOT' ? 'rgba(249,115,22,0.15)' : 'rgba(3,247,181,0.1)',
          border: plan.badge === 'HOT' ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(3,247,181,0.3)',
          borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap',
        }}>{plan.badge}</div>
      )}
      <div style={{ fontSize: '12px', fontWeight: 600, color: isActive ? '#03F7B5' : '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {plan.name}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: isActive ? '#03F7B5' : '#E5E7EB', fontFamily: 'monospace', marginBottom: '2px' }}>
        {plan.monthlyPrice === null ? 'Custom' : plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice}/mo`}
      </div>
      {plan.originalPrice && (
        <div style={{ fontSize: '11px', color: '#4B5563', textDecoration: 'line-through', marginBottom: '4px' }}>
          was ${plan.originalPrice}/mo
        </div>
      )}
      <div style={{ fontSize: '11px', color: isActive ? 'rgba(3,247,181,0.7)' : '#4B5563', lineHeight: 1.5 }}>
        {plan.reqPerDay ? `${fmtNum(plan.reqPerDay)} req/day` : 'Custom volume'}<br />
        {plan.latency} latency · {typeof plan.burstPerMin === 'number' ? `${plan.burstPerMin}/min burst` : plan.burstPerMin}<br />
        {plan.trialDays > 0 && `${plan.trialDays}-day free trial`}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INSIGHT ENGINE
// ─────────────────────────────────────────────

function getInsight(plan, reqPerDay, inputTokens, outputTokens) {
  const monthly = reqPerDay * 30;
  const lowestOSS = calcMonthlyCost(reqPerDay, inputTokens, outputTokens, 0.05, 0.08); // Groq Llama 3.1 8B
  const midOSS = calcMonthlyCost(reqPerDay, inputTokens, outputTokens, 0.18, 0.18);
  const oxloCost = plan.monthlyPrice;

  if (plan.id === 'free') {
    return {
      title: '100% free — even versus the cheapest OSS providers',
      body: `At ${fmtNum(monthly)} requests/month with ${fmtNum(inputTokens)} input tokens each, the cheapest token-based provider (Groq Llama 3.1 8B at $0.05/1M input) would still charge you ${fmtUSD(lowestOSS)}. On Oxlo Free you pay $0.00 — no credit card, no surprises. The only constraint is 60 requests/day and community-tier queue priority.`,
    };
  }
  if (plan.id === 'pro') {
    const breakEvenTokens = Math.round((14.9 / (0.05 * monthly / 1_000_000)));
    return {
      title: `Pro plan — locks your bill at $14.90/mo regardless of prompt length`,
      body: `Token-based costs at this request volume range from ${fmtUSD(lowestOSS)} (Groq Llama 3.1 8B, $0.05/1M input) to ${fmtUSD(midOSS)} (blended OSS providers). Oxlo Pro caps everything at $14.90/mo with 7-day free trial. Break-even point: if your monthly input exceeds ~${fmtNum(breakEvenTokens)} tokens, Oxlo Pro is already cheaper than Groq's lowest rate. Your 30-day burst limit: 30 req/min (vs Free's 5/min), ≤1s latency, and access to optimized models under 8B.`,
    };
  }
  if (plan.id === 'premium') {
    const totalInputMtok = (monthly * inputTokens / 1_000_000).toFixed(1);
    const totalOutputMtok = (monthly * outputTokens / 1_000_000).toFixed(1);
    return {
      title: `Premium — production throughput with cost variance eliminated`,
      body: `At this scale you're moving ~${totalInputMtok}M input tokens and ~${totalOutputMtok}M output tokens/month. Token bills on OSS providers swing with every prompt length change. Premium at $49.90/mo (was $80) locks you in with ≤100ms latency, 120 req/min burst (tunable), priority GPU execution, no daily cap on burst, and input token windows up to 16k per request — the widest Oxlo offers.`,
    };
  }
  return {
    title: 'Enterprise — dedicated GPU capacity, custom limits',
    body: `Your daily usage exceeds 2,000 requests — Premium plan's standard ceiling. Oxlo Enterprise provides dedicated GPU capacity, custom rate limits, no traffic queuing, and SLA-backed throughput. Contact hello@oxlo.ai for a custom quote.`,
  };
}

// ─────────────────────────────────────────────
// FEATURE COMPARISON TABLE DATA
// ─────────────────────────────────────────────

const FEATURE_TABLE = [
  { feature: 'Monthly price', free: '$0', pro: '$14.90', premium: '$49.90', source: 'oxlo.ai/pricing' },
  { feature: 'Requests / day', free: '60', pro: '300', premium: '2,000', source: 'oxlo.ai/pricing' },
  { feature: 'Burst rate limit', free: '5/min', pro: '30/min', premium: '120/min (tunable)', source: 'oxlo.ai/pricing' },
  { feature: 'Avg response latency', free: '≤ 7s', pro: '≤ 1s', premium: '≤ 100ms', source: 'oxlo.ai/pricing' },
  { feature: 'Input tokens / request', free: 'Up to 2k', pro: 'Up to 4k', premium: '8k–16k', source: 'oxlo.ai/pricing' },
  { feature: 'Output tokens / request', free: 'Up to 512', pro: 'Up to 1k', premium: 'Up to 4k', source: 'oxlo.ai/pricing' },
  { feature: 'Token-based billing', free: 'No', pro: 'No', premium: 'No', source: 'oxlo.ai/pricing' },
  { feature: 'Queued behind paid plans', free: 'Yes', pro: 'Yes (behind Premium)', premium: 'No', source: 'oxlo.ai/pricing' },
  { feature: 'Models > 8B params', free: 'No', pro: 'Limited', premium: 'Yes', source: 'oxlo.ai/pricing' },
  { feature: 'Priority execution', free: 'Lowest', pro: 'Medium', premium: 'Highest', source: 'oxlo.ai/pricing' },
  { feature: 'Production-grade inference', free: 'No', pro: 'No', premium: 'Yes', source: 'oxlo.ai/pricing' },
  { feature: 'Support level', free: 'Community', pro: 'Community', premium: 'Priority', source: 'oxlo.ai/pricing' },
  { feature: 'Free trial', free: '—', pro: '7 days', premium: '7 days', source: 'oxlo.ai/pricing' },
  { feature: 'Credit card required', free: 'No', pro: 'Yes', premium: 'Yes', source: 'oxlo.ai/pricing' },
  { feature: 'Gateway-level request metering', free: 'Yes', pro: 'Yes', premium: 'Yes', source: 'oxlo.ai/pricing' },
  { feature: 'Pricing independent of prompt length', free: 'Yes', pro: 'Yes', premium: 'Yes', source: 'oxlo.ai/pricing' },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function CostCalculator() {
  const [reqPerDay, setReqPerDay] = useState(300);
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'plans' | 'sources'

  const plan = getPlanForUsage(reqPerDay);
  const oxloCost = plan.monthlyPrice;

  // Best OSS comparison (Groq Llama 3.1 8B — cheapest on market)
  const bestOSSCost = calcMonthlyCost(reqPerDay, inputTokens, outputTokens, 0.05, 0.08);
  // Mid OSS blended
  const midOSSCost = calcMonthlyCost(reqPerDay, inputTokens, outputTokens, 0.18, 0.18);

  const savings = oxloCost !== null && bestOSSCost > oxloCost ? bestOSSCost - oxloCost : 0;
  const savingsPct = bestOSSCost > 0 && oxloCost !== null ? ((bestOSSCost - oxloCost) / bestOSSCost * 100) : 0;
  const insight = getInsight(plan, reqPerDay, inputTokens, outputTokens);

  const monthly = reqPerDay * 30;

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: '#080B12',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      overflow: 'hidden',
      maxWidth: '920px',
      margin: '0 auto',
      color: '#fff',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        padding: '36px 40px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(160deg, rgba(3,247,181,0.04) 0%, transparent 60%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#03F7B5', textTransform: 'uppercase', marginBottom: '6px' }}>
              OXLO.AI · REQUEST-BASED PRICING
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#fff', lineHeight: 1.2 }}>
              Savings Calculator
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '6px 0 0', lineHeight: 1.5 }}>
              Compare request-based billing vs token-based costs at your usage level.
              All data sourced from live pricing pages.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['calculator', 'plans', 'sources'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  border: activeTab === tab ? '1px solid rgba(3,247,181,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  background: activeTab === tab ? 'rgba(3,247,181,0.1)' : 'rgba(255,255,255,0.02)',
                  color: activeTab === tab ? '#03F7B5' : '#6B7280',
                  cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.03em',
                  transition: 'all 0.15s',
                }}
              >{tab}</button>
            ))}
          </div>
        </div>

        {/* SLIDERS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
          <Slider
            label="Daily API requests"
            value={reqPerDay} min={60} max={2000} step={10}
            onChange={setReqPerDay}
            display={`${fmtNum(reqPerDay)}/day · ${fmtNum(monthly)}/mo`}
          />
          <Slider
            label="Input tokens per request"
            value={inputTokens} min={500} max={16000} step={500}
            onChange={setInputTokens}
            display={fmtNum(inputTokens) + ' tokens'}
          />
          <Slider
            label="Output tokens per request"
            value={outputTokens} min={100} max={4000} step={100}
            onChange={setOutputTokens}
            display={fmtNum(outputTokens) + ' tokens'}
          />
        </div>
      </div>

      {/* ── TAB: CALCULATOR ── */}
      {activeTab === 'calculator' && (
        <div style={{ padding: '32px 40px' }}>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            <StatCard
              label="Cheapest OSS (Groq Llama 3.1 8B)"
              value={fmtUSD(bestOSSCost)}
              sub={`$0.05 input + $0.08 output / 1M tokens`}
            />
            <StatCard
              label="Mid OSS blended (Together / Fireworks)"
              value={fmtUSD(midOSSCost)}
              sub="~$0.18/1M blended rate"
            />
            <StatCard
              label={`Oxlo ${plan.name}`}
              value={oxloCost !== null ? fmtUSD(oxloCost) : 'Custom'}
              sub={plan.reqPerDay ? `${fmtNum(plan.reqPerDay)} req/day · no token meter` : 'Custom limits · dedicated GPUs'}
              accent
              planBadge={plan.name + ' plan'}
            />
            <StatCard
              label="Monthly savings vs best OSS"
              value={savings > 0 ? fmtUSD(savings) : oxloCost === null ? 'Custom' : '—'}
              sub={savings > 0 ? `${Math.round(savingsPct)}% cheaper than Groq Llama 3.1 8B` : 'Token cost lower at this scale'}
              accent={savings > 0}
            />
          </div>

          {/* INSIGHT BOX */}
          <div style={{
            padding: '18px 20px', marginBottom: '24px',
            borderLeft: '2px solid #03F7B5',
            background: 'rgba(3,247,181,0.04)',
            borderRadius: '0 8px 8px 0',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              {insight.title}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: 1.7 }}>
              {insight.body}
            </div>
          </div>

          {/* COMPETITOR BREAKDOWN */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#4B5563', textTransform: 'uppercase', marginBottom: '12px' }}>
              Token-based competitors at your exact usage
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {COMPETITORS.map(comp => (
                <CompetitorRow
                  key={comp.name}
                  comp={comp}
                  inputTokens={inputTokens}
                  outputTokens={outputTokens}
                  reqPerDay={reqPerDay}
                  oxloCost={oxloCost}
                />
              ))}
            </div>
          </div>

          <p style={{ fontSize: '11px', color: '#2D3748', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
            Competitor rates from live pricing pages (groq.com/pricing, anthropic.com/pricing, together.ai) as of March 2026.
            Oxlo costs are flat monthly fees regardless of tokens consumed.{' '}
            <a href="https://www.oxlo.ai/pricing" target="_blank" rel="noreferrer" style={{ color: '#03F7B5', textDecoration: 'none' }}>
              View Oxlo pricing →
            </a>
          </p>
        </div>
      )}

      {/* ── TAB: PLANS ── */}
      {activeTab === 'plans' && (
        <div style={{ padding: '32px 40px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            {OXLO_PLANS.map(p => (
              <PlanCard key={p.id} plan={p} isActive={p.id === plan.id} />
            ))}
          </div>

          {/* FEATURE TABLE */}
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#4B5563', textTransform: 'uppercase', marginBottom: '12px' }}>
            Full feature comparison — sourced from oxlo.ai/pricing
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Feature', 'Free', 'Pro $14.90/mo', 'Premium $49.90/mo'].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px', textAlign: h === 'Feature' ? 'left' : 'center',
                      color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_TABLE.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '9px 12px', color: '#9CA3AF' }}>{row.feature}</td>
                    {[row.free, row.pro, row.premium].map((val, j) => (
                      <td key={j} style={{
                        padding: '9px 12px', textAlign: 'center', fontFamily: 'monospace', fontSize: '12px',
                        color: val === 'No' ? '#374151' : val === 'Yes' || val === 'Highest' ? '#03F7B5' : '#D1D5DB',
                        fontWeight: val === 'Yes' || val === 'Highest' ? 700 : 400,
                      }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '11px', color: '#2D3748', textAlign: 'center', marginTop: '16px' }}>
            All data sourced directly from{' '}
            <a href="https://www.oxlo.ai/pricing" target="_blank" rel="noreferrer" style={{ color: '#03F7B5', textDecoration: 'none' }}>
              oxlo.ai/pricing
            </a>. Features may evolve. Enterprise plan available for custom volume — contact{' '}
            <a href="mailto:hello@oxlo.ai" style={{ color: '#03F7B5', textDecoration: 'none' }}>hello@oxlo.ai</a>.
          </p>
        </div>
      )}

      {/* ── TAB: SOURCES ── */}
      {activeTab === 'sources' && (
        <div style={{ padding: '32px 40px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#4B5563', textTransform: 'uppercase', marginBottom: '16px' }}>
            All pricing data & sources — verified March 2026
          </div>

          {[
            {
              provider: 'Oxlo.ai',
              url: 'https://www.oxlo.ai/pricing',
              items: [
                'Free: $0/mo · 60 req/day · 5 req/min burst · ≤7s latency · up to 2k input / 512 output tokens',
                'Pro: $14.90/mo (was $35) · 300 req/day · 30 req/min burst · ≤1s latency · up to 4k input / 1k output tokens · 7-day trial',
                'Premium: $49.90/mo (was $80) · 2,000 req/day · 120 req/min burst (tunable) · ≤100ms latency · up to 16k input / 4k output · 7-day trial',
                'Enterprise: Custom pricing · Dedicated GPUs · Custom limits · Dedicated support',
                'All plans: Request-based billing · No token meter · OpenAI-compatible endpoints · OSS models only',
              ],
            },
            {
              provider: 'Groq (groq.com/pricing)',
              url: 'https://groq.com/pricing',
              items: [
                'Llama 3.1 8B Instant: $0.05 input / $0.08 output per 1M tokens · ~840 TPS',
                'GPT-OSS 20B: $0.075 input / $0.30 output per 1M tokens · ~1,000 TPS',
                'GPT-OSS 120B: $0.15 input / $0.60 output per 1M tokens · ~500 TPS',
                'Llama 3.3 70B Versatile: $0.59 input / $0.79 output per 1M tokens · ~394 TPS',
                'Qwen3 32B: $0.29 input / $0.59 output per 1M tokens · ~662 TPS',
                'Kimi K2-0905 1T: $1.00 input / $3.00 output per 1M tokens',
                'Billing model: Pay-as-you-go per token consumed. Batch API: 50% discount.',
              ],
            },
            {
              provider: 'Together AI / Fireworks AI',
              url: 'https://www.together.ai/',
              items: [
                'OSS LLMs (Llama, Mistral, Qwen family): $0.05–$0.90/1M tokens depending on model size',
                'Blended rate used in this calculator: ~$0.18/1M (mid-market OSS)',
                'Billing model: Token-based pay-as-you-go. Input and output billed separately.',
              ],
            },
            {
              provider: 'Anthropic (anthropic.com/pricing)',
              url: 'https://www.anthropic.com/pricing',
              items: [
                'Claude Haiku 4.5: $1.00 input / $5.00 output per 1M tokens',
                'Claude Sonnet 4.6: $3.00 input / $15.00 output per 1M tokens',
                'Claude Opus 4.6: $5.00 input / $25.00 output per 1M tokens (dropped 67% from Opus 4.1)',
                'Batch API: 50% discount. Prompt caching: 90% savings on repeated context.',
                'Billing model: Token-based. Input and output billed separately per model.',
              ],
            },
          ].map(src => (
            <div key={src.provider} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#D1D5DB' }}>{src.provider}</div>
                <a href={src.url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#03F7B5', textDecoration: 'none', fontFamily: 'monospace' }}>
                  {src.url} ↗
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {src.items.map((item, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '8px', lineHeight: 1.5 }}>
                    <span style={{ color: '#03F7B5', flexShrink: 0 }}>·</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{
            marginTop: '8px', padding: '14px 18px',
            background: 'rgba(3,247,181,0.04)', border: '1px solid rgba(3,247,181,0.15)',
            borderRadius: '10px', fontSize: '12px', color: '#6B7280', lineHeight: 1.7,
          }}>
            <strong style={{ color: '#03F7B5' }}>Methodology:</strong> Competitor costs are calculated as
            (daily_requests × 30 × input_tokens / 1,000,000 × input_rate) + (daily_requests × 30 × output_tokens / 1,000,000 × output_rate).
            Oxlo costs are flat monthly subscription fees. Token limits per request on each Oxlo plan are caps for safety and performance, not billing — they do not change the monthly price.
            All competitor rates verified from live pricing pages. Prices may change — always verify at source.
          </div>
        </div>
      )}
    </div>
  );
}