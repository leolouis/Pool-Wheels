import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CITIES, TYPES, POOL_TARGET as T,
  listPools, joinPool, leavePool, getQuotes, getDecisions, setDecision,
} from './api.js';
import './styles.css';

const inr = (n) => '₹' + n.toLocaleString('en-IN');

function Dots({ count, label }) {
  return (
    <div className="dots" role="img" aria-label={label || `${count} of ${T} buyers joined`}>
      {Array.from({ length: T }, (_, i) => (
        <i key={i} className={'dot' + (i < count ? ' on' : '')} style={{ '--i': i }} />
      ))}
    </div>
  );
}

function PoolCard({ pool, onJoin, onLeave, onViewBids }) {
  const { count, joined, hasBids } = pool;
  const left = T - count;
  let action;
  if (hasBids) action = <button className="primary" onClick={onViewBids}>View bids</button>;
  else if (joined && count >= T) action = <span className="tag">Dealers invited</span>;
  else if (joined) action = <button onClick={() => onLeave(pool.id)}>Leave pool</button>;
  else action = <button className="primary" onClick={() => onJoin(pool.id)}>Join pool</button>;

  return (
    <article className="card">
      <div>
        <h3>{pool.car}</h3>
        <p className="sub">{pool.variant} · {pool.type} · {pool.city}</p>
      </div>
      <Dots count={count} />
      <div className="meta">
        <span><b>{count}</b> of {T} joined</span>
        {hasBids ? <span className="tag">Bids in</span> : <span><b>{left}</b> seat{left === 1 ? '' : 's'} left</span>}
      </div>
      <div className="row">
        {action}
        {!hasBids && <span className="sub">Closes in {pool.daysLeft} days</span>}
      </div>
    </article>
  );
}

function Pools({ pools, type, setType, onReset, ...handlers }) {
  return (
    <>
      <div className="chips" role="group" aria-label="Car type">
        {TYPES.map((t) => (
          <button key={t} aria-pressed={type === t} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>
      {pools.length ? (
        <div className="grid">{pools.map((p) => <PoolCard key={p.id} pool={p} {...handlers} />)}</div>
      ) : (
        <div className="empty">
          <h3>No open pools here yet</h3>
          <p>Try another city or car type, or check back soon.</p>
          <button onClick={onReset}>Show all pools</button>
        </div>
      )}
    </>
  );
}

const STEPS = ['Pooling', 'Bidding', 'Compare', 'Decide'];

function MyPools({ pools, onLeave, goTo }) {
  if (!pools.length) {
    return (
      <div className="empty">
        <h3>You haven’t joined a pool</h3>
        <p>Pick a car and join. You only commit when you accept a dealer’s quote.</p>
        <button className="primary" onClick={() => goTo('pools')}>Browse pools</button>
      </div>
    );
  }
  return (
    <div className="grid">
      {pools.map((p) => {
        const cur = p.hasBids ? 2 : p.count >= T ? 1 : 0;
        return (
          <article className="card" key={p.id}>
            <div><h3>{p.car}</h3><p className="sub">{p.variant} · {p.city}</p></div>
            <Dots count={p.count} />
            <ol className="steps" aria-label="Progress">
              {STEPS.map((s, i) => (
                <li key={s} className={i < cur ? 'done' : i === cur ? 'now' : ''} aria-current={i === cur ? 'step' : undefined}>{s}</li>
              ))}
            </ol>
            <div className="row"><button onClick={() => onLeave(p.id)}>Leave pool</button></div>
          </article>
        );
      })}
    </div>
  );
}

function Quotes({ data, decisions, onDecide }) {
  if (!data) return null;
  const { listOnRoad, quotes } = data;
  if (!quotes.length) {
    return (
      <div className="empty">
        <h3>No bids yet</h3>
        <p>Quotes appear here once dealers bid on your pool.</p>
      </div>
    );
  }
  const accepted = Object.values(decisions).includes('accepted');
  return (
    <>
      <div className="note">
        Sample bids for Tata Nexon Creative 1.2 Turbo. Real quotes appear here once dealers submit them. List on-road price: {inr(listOnRoad)}.
      </div>
      <div className="grid">
        {quotes.map((q, i) => {
          const d = decisions[q.id];
          return (
            <article key={q.id} className={'card' + (i === 0 ? ' best' : '')}>
              <div>
                <h3>{q.dealer}</h3>
                <p className="sub">{i === 0 ? <span className="tag">Lowest total</span> : '\u00A0'}</p>
              </div>
              <div>
                <div className="total">{inr(q.total)}</div>
                <p className="sub">{inr(listOnRoad - q.total)} below list on-road</p>
              </div>
              <dl>
                <div><dt>Ex-showroom</dt><dd>{inr(q.exShowroom)}</dd></div>
                <div><dt>Insurance</dt><dd>{inr(q.insurance)}</dd></div>
                <div><dt>Registration and road tax</dt><dd>{inr(q.registration)}</dd></div>
                <div><dt>Accessories</dt><dd>{q.accessories ? inr(q.accessories) : 'None'}</dd></div>
              </dl>
              {q.note && <p className="sub">{q.note}</p>}
              <hr />
              <div className="row">
                {d === 'accepted' && <><span className="state" style={{ color: 'var(--good)' }}>You accepted this quote</span><button onClick={() => onDecide(q.id, null)}>Undo</button></>}
                {d === 'passed' && <><span className="state" style={{ color: 'var(--muted)' }}>You passed</span><button onClick={() => onDecide(q.id, null)}>Undo</button></>}
                {!d && <>
                  <button className="primary" disabled={accepted} onClick={() => onDecide(q.id, 'accepted')}>Accept</button>
                  <button onClick={() => onDecide(q.id, 'passed')}>Pass</button>
                </>}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState('pools');
  const [city, setCity] = useState('All cities');
  const [type, setType] = useState('All');
  const [pools, setPools] = useState([]);
  const [mine, setMine] = useState([]);
  const [hero, setHero] = useState(null);
  const [quotes, setQuotes] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [toast, setToast] = useState('');
  const toastTimer = useRef();

  const say = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  const refresh = useCallback(async () => {
    const [list, joined, all] = await Promise.all([
      listPools({ city, type }), listPools({ joinedOnly: true }), listPools(),
    ]);
    setPools(list); setMine(joined); setHero(all.find((p) => p.id === 'p1'));
  }, [city, type]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { getQuotes('p0').then(setQuotes); getDecisions().then(setDecisions); }, []);

  const onJoin = async (id) => {
    const p = await joinPool(id);
    say(p.count >= T ? 'Pool is full. Dealers are being invited to bid.' : `You’re in. ${T - p.count} more buyers needed.`);
    refresh();
  };
  const onLeave = async (id) => { await leavePool(id); say('You left the pool.'); refresh(); };
  const onDecide = async (id, decision) => {
    setDecisions(await setDecision(id, decision));
    if (decision === 'accepted') say('Accepted. You can undo this anytime.');
  };
  const onReset = () => { setType('All'); setCity('All cities'); };

  const tabs = [['pools', 'Open pools'], ['mine', `My pools${mine.length ? ` (${mine.length})` : ''}`], ['quotes', 'Dealer bids']];

  return (
    <>
      <header>
        <div className="wrap">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle cx="14" cy="14" r="3.5" fill="#FF7A1A" />
              <path d="M14 3v7M14 18v7M3 14h7M18 14h7" stroke="currentColor" strokeWidth="2" />
            </svg>
            Pool Wheels
          </div>
          <select aria-label="City" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <h1>Twenty buyers. One car. Dealers bid.</h1>
          <p className="lede">Join a pool for the car you want. At 20 buyers, dealerships compete with itemised on-road prices, and you decide on your own. Dealers pay us. You pay nothing.</p>
          {hero && (
            <>
              <Dots count={hero.count} label={`${hero.car} pool in ${hero.city}: ${hero.count} of ${T} buyers`} />
              <p className="cap">{hero.car} {hero.variant.split(' ')[0]} in {hero.city}: {hero.count} of {T} buyers are in.</p>
            </>
          )}
        </section>

        <nav className="tabs" role="tablist" aria-label="Sections">
          {tabs.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>
          ))}
        </nav>

        <div role="tabpanel">
          {tab === 'pools' && <Pools pools={pools} type={type} setType={setType} onReset={onReset} onJoin={onJoin} onLeave={onLeave} onViewBids={() => setTab('quotes')} />}
          {tab === 'mine' && <MyPools pools={mine} onLeave={onLeave} goTo={setTab} />}
          {tab === 'quotes' && <Quotes data={quotes} decisions={decisions} onDecide={onDecide} />}
        </div>

        <footer>Pool Wheels is a prototype. Pools and bids shown here are sample data, not real dealer offers.</footer>
      </main>
      <div className={'toast' + (toast ? ' show' : '')} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
