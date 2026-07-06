import { useMemo, useState } from 'react'
import encrypted from './encrypted-data.json'
import { decryptData } from './crypto.js'

const uid = () => 'c' + Math.abs((Math.random() * 1e9) | 0).toString(36)

// Gate: the planner only mounts once the encrypted budget data is decrypted.
function App() {
  const [seed, setSeed] = useState(null)
  if (!seed) return <PasswordGate onUnlock={setSeed} />
  return <Planner seed={seed} />
}

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!pw || busy) return
    setBusy(true)
    setErr('')
    try {
      const data = await decryptData(pw, encrypted)
      onUnlock(data)
    } catch {
      setErr('Incorrect password — try again.')
      setBusy(false)
    }
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={submit}>
        <span className="gate-flame">🔥🔒</span>
        <h1>Madrid FIRE Planner</h1>
        <p className="gate-sub">This planner holds private financial data. Enter the password to decrypt and view it.</p>
        <input
          type="password"
          value={pw}
          autoFocus
          placeholder="Password"
          onChange={(e) => { setPw(e.target.value); setErr('') }}
          className={err ? 'gate-input err' : 'gate-input'}
        />
        {err && <div className="gate-err">{err}</div>}
        <button type="submit" className="gate-btn" disabled={busy || !pw}>
          {busy ? 'Decrypting…' : 'Unlock'}
        </button>
        <p className="gate-foot">Data is AES-256 encrypted; decryption happens entirely in your browser.</p>
      </form>
    </div>
  )
}

function Planner({ seed }) {
  const { CATEGORIES, RECURRING, ONETIME, DEFAULT_PARAMS } = seed
  const [items, setItems] = useState(() =>
    RECURRING.map((r) => ({ ...r, enabled: true, custom: false })),
  )
  const [oneTime, setOneTime] = useState(() =>
    ONETIME.map((o) => ({ ...o, enabled: true, custom: false })),
  )
  const [p, setP] = useState(DEFAULT_PARAMS)
  const [preset, setPreset] = useState('corrected')
  const [ccy, setCcy] = useState('EUR')
  const [showChanged, setShowChanged] = useState(false)
  const [secondChild, setSecondChild] = useState(true)

  const setParam = (k, v) => setP((prev) => ({ ...prev, [k]: v }))

  // ---- preset switch: swap every editable value between corrected & original ----
  function applyPreset(which) {
    setPreset(which)
    setItems((prev) =>
      prev.map((it) =>
        it.custom ? it : { ...it, monthly: which === 'orig' ? it.orig : baseCorrected(it) },
      ),
    )
    setOneTime((prev) =>
      prev.map((it) =>
        it.custom ? it : { ...it, amount: which === 'orig' ? it.orig : baseCorrectedO(it) },
      ),
    )
    setP((prev) => ({
      ...prev,
      swr: which === 'orig' ? prev.swrOrig : 0.04,
      eurusd: which === 'orig' ? prev.eurusdOrig : 1.16,
    }))
  }
  const baseCorrected = (it) => RECURRING.find((r) => r.id === it.id)?.monthly ?? it.monthly
  const baseCorrectedO = (it) => ONETIME.find((r) => r.id === it.id)?.amount ?? it.amount

  // ---------------------------- calculation engine ----------------------------
  const calc = useMemo(() => {
    const on = (it) => it.enabled
    const perpMonthly = items
      .filter((it) => on(it) && it.horizon === 'perpetual')
      .reduce((s, it) => s + num(it.monthly), 0)
    const kidMonthly = items
      .filter((it) => on(it) && it.horizon === 'kid' && (secondChild || it.cat !== 'baby'))
      .reduce((s, it) => s + num(it.monthly), 0)
    const fullMonthly = perpMonthly + kidMonthly
    const fullAnnual = fullMonthly * 12
    const perpAnnual = perpMonthly * 12

    // investable pot to cover perpetual spend forever
    const investPre = perpAnnual / p.swr
    const grossWithdrawal = perpAnnual / (1 - p.tax)
    const investTax = grossWithdrawal / p.swr

    // finite child fund (through age 18), derived live from the kid line items.
    // A child is funded as a finite lump (years × annual), NOT capitalised at the
    // SWR — they cost money for a fixed span, not forever.
    const claraAnnual = sumCat(items, 'clara') * 12
    const babyAnnual = (secondChild ? sumCat(items, 'baby') : 0) * 12
    const claraFund = claraAnnual * p.claraYearsLeft
    // second child: baby-rate for ages 0–3, then Clara's per-child rate for 3–18
    const sc0to3 = secondChild ? babyAnnual * p.babyYears0to3 : 0
    const sc3to18 = secondChild ? claraAnnual * p.babyYears3to18 : 0
    const secondChildFund = sc0to3 + sc3to18
    const childFund = claraFund + secondChildFund

    const oneTimeTotal = oneTime
      .filter(on)
      .reduce((s, it) => s + num(it.amount), 0)

    const emergency = fullMonthly * p.emergencyMonths

    const totalPre = oneTimeTotal + investPre + childFund
    const totalTax = oneTimeTotal + investTax + childFund

    const gap = totalTax - num(p.initialCapital)
    const pct = totalTax > 0 ? Math.min(100, (num(p.initialCapital) / totalTax) * 100) : 100

    return {
      perpMonthly, kidMonthly, fullMonthly, fullAnnual, perpAnnual,
      investPre, investTax, childFund, oneTimeTotal, emergency,
      totalPre, totalTax, gap, pct, claraAnnual, babyAnnual,
      claraFund, sc0to3, sc3to18, secondChildFund,
    }
  }, [items, oneTime, p, secondChild])

  // capitalised cost of a perpetual monthly line (what it adds to the nest-egg)
  const capOf = (monthly) => (num(monthly) * 12) / (1 - p.tax) / p.swr

  // biggest levers = enabled perpetual items ranked by capitalised cost
  const levers = useMemo(
    () =>
      items
        .filter((it) => it.enabled && it.horizon === 'perpetual')
        .map((it) => ({ ...it, cap: capOf(it.monthly) }))
        .sort((a, b) => b.cap - a.cap)
        .slice(0, 8),
    [items, p.swr, p.tax],
  )

  const fx = ccy === 'EUR' ? 1 : p.eurusd
  const sym = ccy === 'EUR' ? '€' : '$'
  const money = (v) => sym + fmt(v * fx)
  const money0 = (v) => sym + fmt(v * fx, 0)

  // ------------------------------- mutations -------------------------------
  const patchItem = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const patchOne = (id, patch) =>
    setOneTime((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const addItem = (cat) =>
    setItems((prev) => [
      ...prev,
      { id: uid(), cat, label: 'New expense', monthly: 0, orig: 0, horizon: CATEGORIES.find((c) => c.id === cat)?.kids ? 'kid' : 'perpetual', enabled: true, custom: true },
    ])
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id))

  const goalMet = calc.gap <= 0

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div className="brand">
            <span className="flame">🔥</span>
            <div>
              <h1>Madrid FIRE Planner</h1>
              <p className="sub">Family of 4 · eastern Madrid commuter belt · living off investments, no earned income</p>
            </div>
          </div>
          <div className="preset">
            <span className="preset-label">Values</span>
            <div className="seg">
              <button className={preset === 'corrected' ? 'on' : ''} onClick={() => applyPreset('corrected')}>Researched</button>
              <button className={preset === 'orig' ? 'on' : ''} onClick={() => applyPreset('orig')}>Original xlsx</button>
            </div>
          </div>
        </div>

        {/* GOAL PANEL */}
        <div className={'goal ' + (goalMet ? 'ok' : 'short')}>
          <div className="goal-grid">
            <div className="goal-cell">
              <label className="goal-cap">Your starting capital</label>
              <div className="cap-input">
                <span>{sym}</span>
                <input
                  type="text"
                  value={fmt(num(p.initialCapital) * fx, 0)}
                  onChange={(e) => setParam('initialCapital', parse(e.target.value) / fx)}
                />
              </div>
            </div>
            <div className="goal-cell">
              <label className="goal-cap">Capital target (tax-adjusted)</label>
              <div className="goal-big">{money0(calc.totalTax)}</div>
              <div className="goal-note">pre-tax: {money0(calc.totalPre)}</div>
            </div>
            <div className="goal-cell">
              <label className="goal-cap">{goalMet ? 'Surplus' : 'Still short by'}</label>
              <div className="goal-big gap">{money0(Math.abs(calc.gap))}</div>
              <div className="goal-note">{goalMet ? '🎉 You can fund this life indefinitely' : 'trim expenses or add capital to close it'}</div>
            </div>
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: calc.pct + '%' }} />
            <span className="bar-txt">{Math.round(calc.pct)}% of goal funded</span>
          </div>
        </div>
      </header>

      {/* SUMMARY STRIP */}
      <section className="cards">
        <Card label="Monthly running cost" value={money(calc.fullMonthly)} tone="a" />
        <Card label="Annual running cost" value={money0(calc.fullAnnual)} tone="a" />
        <Card label="One-time set-up" value={money0(calc.oneTimeTotal)} tone="b" />
        <Card label="Child fund (through 18)" value={money0(calc.childFund)} tone="b" />
        <Card label="Emergency fund" value={money0(calc.emergency)} tone="b" />
        <Card label="Invested pot needed" value={money0(calc.investTax)} tone="c" />
      </section>

      <div className="layout">
        {/* LEFT: line items */}
        <main className="main">
          <div className="toolbar">
            <label className="chk">
              <input type="checkbox" checked={showChanged} onChange={(e) => setShowChanged(e.target.checked)} />
              Only show lines changed from the xlsx
            </label>
            <div className="ccy seg">
              <button className={ccy === 'EUR' ? 'on' : ''} onClick={() => setCcy('EUR')}>€ EUR</button>
              <button className={ccy === 'USD' ? 'on' : ''} onClick={() => setCcy('USD')}>$ USD</button>
            </div>
          </div>

          <h2 className="sec-title">Recurring costs <span className="muted">— toggle off what you'd give up; edit any amount</span></h2>
          {CATEGORIES.map((cat) => {
            const rows = items.filter(
              (it) => it.cat === cat.id && (!showChanged || changed(it)),
            )
            if (!rows.length) return null
            const subtotal = rows.filter((r) => r.enabled).reduce((s, r) => s + num(r.monthly), 0)
            const babyOff = cat.id === 'baby' && !secondChild
            return (
              <div className={'cat' + (babyOff ? ' cat-off' : '')} key={cat.id}>
                <div className="cat-head">
                  <h3>{cat.label} {cat.kids && <span className="tag-kid">finite</span>}</h3>
                  {cat.id === 'baby' ? (
                    <div className="cat-head-right">
                      {secondChild && <span className="cat-sub">{money(subtotal)}/mo</span>}
                      <label className="mini-switch">
                        <input type="checkbox" checked={secondChild} onChange={(e) => setSecondChild(e.target.checked)} />
                        <span>{secondChild ? '2nd child: on' : '2nd child: off'}</span>
                      </label>
                    </div>
                  ) : (
                    <span className="cat-sub">{money(subtotal)}/mo</span>
                  )}
                </div>
                {rows.map((it) => (
                  <Row
                    key={it.id}
                    it={it}
                    ccy={ccy} sym={sym} fx={fx}
                    cap={it.horizon === 'perpetual' ? capOf(it.monthly) : null}
                    money0={money0}
                    onToggle={() => patchItem(it.id, { enabled: !it.enabled })}
                    onEdit={(v) => patchItem(it.id, { monthly: v / fx, custom: it.custom })}
                    onLabel={(v) => patchItem(it.id, { label: v })}
                    onRemove={it.custom ? () => removeItem(it.id) : null}
                  />
                ))}
                <button className="add" onClick={() => addItem(cat.id)}>+ add line</button>
              </div>
            )
          })}

          <h2 className="sec-title">One-time set-up <span className="muted">— buy outright: home, taxes, EV, furniture, move</span></h2>
          <div className="cat">
            {oneTime.map((it) => (
              <Row
                key={it.id}
                it={{ ...it, monthly: it.amount }}
                ccy={ccy} sym={sym} fx={fx}
                cap={null}
                oneTime
                money0={money0}
                onToggle={() => patchOne(it.id, { enabled: !it.enabled })}
                onEdit={(v) => patchOne(it.id, { amount: v / fx })}
                onLabel={(v) => patchOne(it.id, { label: v })}
                onRemove={null}
              />
            ))}
          </div>
        </main>

        {/* RIGHT: controls + levers */}
        <aside className="side">
          <div className="panel">
            <h3>Assumptions</h3>
            <Slider label="Safe withdrawal rate (SWR)" value={p.swr} min={0.025} max={0.05} step={0.0005}
              fmt={(v) => (v * 100).toFixed(2) + '%'} onChange={(v) => setParam('swr', v)}
              hint="4% suits a 30-yr retirement; for two 37-yr-olds (50+ yrs) 3.25–3.5% is safer." />
            <Slider label="Effective investment-tax rate" value={p.tax} min={0} max={0.25} step={0.005}
              fmt={(v) => (v * 100).toFixed(1) + '%'} onChange={(v) => setParam('tax', v)}
              hint="Spain taxes only the gain portion of each sale (~19–21% band), ≈12% blended. As US citizens/green-card holders you ALSO file US taxes — but at this income US long-term-gains tax is ~0% and the foreign-tax credit nets it out, so ≈12% holds ONLY if you keep US-domiciled funds (avoid the PFIC trap) and low dividends. Higher-income years, big dividends, or Roth conversions push it up." />
            <Slider label="EUR → USD rate" value={p.eurusd} min={1.0} max={1.3} step={0.005}
              fmt={(v) => v.toFixed(3)} onChange={(v) => setParam('eurusd', v)}
              hint="2026 is running ~1.16–1.17." />
            <Slider label="Emergency fund (months)" value={p.emergencyMonths} min={0} max={12} step={1}
              fmt={(v) => v + ' mo'} onChange={(v) => setParam('emergencyMonths', v)} />
          </div>

          <div className="panel breakdown">
            <h3>Child fund breakdown <span className="muted">finite · through age 18</span></h3>
            <BDRow label="Clara (age 5 → 18)" years={p.claraYearsLeft} onYears={(v) => setParam('claraYearsLeft', v)} annualStr={money0(calc.claraAnnual)} value={money0(calc.claraFund)} />
            {secondChild ? (
              <>
                <BDRow label="2nd child (0 → 3)" years={p.babyYears0to3} onYears={(v) => setParam('babyYears0to3', v)} annualStr={money0(calc.babyAnnual)} value={money0(calc.sc0to3)} />
                <BDRow label="2nd child (3 → 18)" note="at Clara's rate" years={p.babyYears3to18} onYears={(v) => setParam('babyYears3to18', v)} annualStr={money0(calc.claraAnnual)} value={money0(calc.sc3to18)} />
              </>
            ) : (
              <p className="bd-none">Second child excluded (~{money0(calc.claraAnnual * p.babyYears3to18)} + baby years saved). Toggle it back on in the “Child — second (baby)” section.</p>
            )}
            <div className="bd-total"><span>Total child fund</span><em>{money0(calc.childFund)}</em></div>
          </div>

          <div className="panel levers">
            <h3>Biggest levers</h3>
            <p className="lever-intro">What each recurring expense really costs your nest-egg (capitalised at your SWR). Toggle the big ones to close the gap fast.</p>
            {levers.map((l) => (
              <button key={l.id} className={'lever ' + (l.enabled ? '' : 'off')} onClick={() => patchItem(l.id, { enabled: !l.enabled })}>
                <span className="lever-name">{l.label}</span>
                <span className="lever-cap">{money0(l.cap)}</span>
              </button>
            ))}
            <p className="lever-foot">Cutting a {sym}100/mo line frees ≈ {money0(capOf(100))} of required capital.</p>
          </div>
        </aside>
      </div>

      <footer className="foot">
        <p><strong>How it works:</strong> perpetual expenses are capitalised (annual ÷ SWR, grossed up for tax) into an invested pot; children are a finite fund through age 18; the home, car & furnishings are bought outright. Target = one-time set-up + invested pot + child fund. Not financial advice.</p>
        <p className="caveat"><strong>⚠ Cross-border tax:</strong> the effective rate assumes US-domiciled funds (Spanish/EU funds trigger punitive US PFIC tax), a low-income drawdown (US long-term-gains ~0% here, credited against Spanish tax), and low dividends. US persons file in both countries for life — confirm the real blended rate, PFIC exposure, and FBAR/FATCA reporting with a cross-border US–Spain advisor.</p>
        <p className="src">Defaults fact-checked Jul 2026 against idealista, Numbeo, INE, Adeslas/Sanitas/DKV, CRTM, Agencia Tributaria, Comunidad de Madrid & FIRE literature. Switch to “Original xlsx” to see the pre-correction plan.</p>
      </footer>
    </div>
  )
}

// ------------------------------- components -------------------------------
function Card({ label, value, tone }) {
  return (
    <div className={'card tone-' + tone}>
      <div className="card-val">{value}</div>
      <div className="card-lab">{label}</div>
    </div>
  )
}

function Row({ it, sym, fx, cap, money0, oneTime, onToggle, onEdit, onLabel, onRemove }) {
  const [open, setOpen] = useState(false)
  const displayVal = fmt(num(it.monthly) * fx, oneTime ? 0 : 2)
  return (
    <div className={'row ' + (it.enabled ? '' : 'disabled') + (changed(it) ? ' changed' : '')}>
      <button className={'toggle ' + (it.enabled ? 'on' : '')} onClick={onToggle} title={it.enabled ? 'Included — click to give up' : 'Excluded — click to add back'}>
        {it.enabled ? '✓' : ''}
      </button>
      <div className="row-main">
        {it.custom ? (
          <input className="label-edit" value={it.label} onChange={(e) => onLabel(e.target.value)} />
        ) : (
          <span className="row-label">
            {it.label}
            {it.note && (
              <button className="info" onClick={() => setOpen((o) => !o)} title="Why / source">ⓘ</button>
            )}
          </span>
        )}
        {open && it.note && <div className="note">{it.note}</div>}
      </div>
      {cap != null && it.enabled && (
        <span className="cap-badge" title="Capital this line ties up in your nest-egg">{money0(cap)}</span>
      )}
      <div className="amt">
        <span>{sym}</span>
        <input type="text" value={displayVal} onChange={(e) => onEdit(parse(e.target.value))} />
        {!oneTime && <em>/mo</em>}
      </div>
      {onRemove && <button className="del" onClick={onRemove} title="Remove">✕</button>}
    </div>
  )
}

function BDRow({ label, note, years, onYears, annualStr, value }) {
  return (
    <div className="bd-row">
      <div className="bd-main">
        <span className="bd-label">{label}{note && <em> · {note}</em>}</span>
        <span className="bd-calc">
          <input className="yr" type="number" min="0" max="25" value={years}
            onChange={(e) => onYears(Math.max(0, Math.min(25, parseInt(e.target.value) || 0)))} />
          <span>yrs × {annualStr}/yr</span>
        </span>
      </div>
      <span className="bd-val">{value}</span>
    </div>
  )
}

function Slider({ label, value, min, max, step, fmt, onChange, hint }) {
  return (
    <div className="slider">
      <div className="slider-head">
        <label>{label}</label>
        <span className="slider-val">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      {hint && <p className="slider-hint">{hint}</p>}
    </div>
  )
}

// -------------------------------- helpers --------------------------------
function num(v) { const n = typeof v === 'number' ? v : parseFloat(v); return isFinite(n) ? n : 0 }
function parse(s) { const n = parseFloat(String(s).replace(/[^0-9.]/g, '')); return isFinite(n) ? n : 0 }
function fmt(v, dp = 0) {
  return num(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}
function sumCat(items, cat) {
  return items.filter((it) => it.enabled && it.cat === cat).reduce((s, it) => s + num(it.monthly), 0)
}
function changed(it) {
  if (it.custom) return true
  const base = it.orig
  const cur = it.monthly ?? it.amount
  return Math.round(num(base)) !== Math.round(num(cur))
}

export default App
