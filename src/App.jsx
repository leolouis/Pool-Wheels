import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import CarArt from './CarArt.jsx'
import { Users, Gavel, Scale, Shield, Pin, Clock, Home, Car } from './icons.jsx'

const CITIES = ['All cities', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai']
const TYPES = ['All types', 'SUV', 'Hatchback']
const inr = (n) => '₹' + n.toLocaleString('en-IN')
const total = (q) => q.exShowroom + q.insurance + q.registration + q.accessories

export default function App() {
  const [tab, setTab] = useState('pools')
  const [pools, setPools] = useState([])
  const [city, setCity] = useState('All cities')
  const [type, setType] = useState('All types')
  const [mine, setMine] = useState(() => localStorage.getItem('pw-mine'))
  const [quotes, setQuotes] = useState([])
  const [decision, setDecision] = useState({})

  useEffect(() => { api.listPools().then(setPools) }, [])
  useEffect(() => { if (mine) api.getQuotes(mine).then(setQuotes) }, [mine, pools])

  const shown = useMemo(
    () => pools.filter((p) => (city === 'All cities' || p.city === city) && (type === 'All types' || p.type === type)),
    [pools, city, type]
  )
  const myPool = pools.find((p) => p.id === mine)

  async function join(id) {
    const updated = await api.joinPool(id)
    setPools((ps) => ps.map((p) => (p.id === id ? updated : p)))
    setMine(id)
    localStorage.setItem('pw-mine', id)
    setTab('mine')
  }

  return (
    <div className="shell">
      <header className="top">
        <span className="logo">PoolWheels<i>.</i></span>
        <nav aria-label="Main">
          <button className={tab === 'pools' ? 'tab on' : 'tab'} onClick={() => setTab('pools')}><Home /> Pools</button>
          <button className={tab === 'mine' ? 'tab on' : 'tab'} onClick={() => setTab('mine')}><Car /> My pool</button>
        </nav>
      </header>

      {tab === 'pools' && (
        <main>
          <section className="hero">
            <div>
              <h1>Buy your car with {api.POOL_SIZE - 1} others. Make dealers compete.</h1>
              <p className="lead">Join a pool for the car you want. Dealers bid for the whole group. You compare every rupee and decide on your own.</p>
              <ul className="how">
                <li><Users /> Pool buyers on the same car</li>
                <li><Gavel /> Dealers bid for the group</li>
                <li><Scale /> Compare itemised on-road prices</li>
                <li><Shield /> Accept or walk away. Free for you.</li>
              </ul>
            </div>
            <CarArt color="#FF7A1A" label="Orange SUV" />
          </section>
          <h2 className="sec">Open pools</h2>
          <div className="chips" role="group" aria-label="City">
            {CITIES.map((c) => <button key={c} className={c === city ? 'chip on' : 'chip'} onClick={() => setCity(c)}>{c}</button>)}
          </div>
          <div className="chips" role="group" aria-label="Car type">
            {TYPES.map((t) => <button key={t} className={t === type ? 'chip on' : 'chip'} onClick={() => setType(t)}>{t}</button>)}
          </div>
          {shown.length === 0 && <p className="empty">No pools match yet. Try another city or type.</p>}
          <div className="grid">
            {shown.map((p) => (
              <article className="card" key={p.id}>
                <CarArt color={p.hex} body={p.body} label={`${p.color} ${p.model}`} />
                <div className="row mut"><span className="ic"><Pin /> {p.city}</span><span className="ic"><Clock /> {p.window}</span></div>
                <h3>{p.model}</h3>
                <div className="mut">{p.variant} · {p.color}</div>
                <progress max={api.POOL_SIZE} value={p.joined} aria-label="Buyers joined" />
                <b>{p.joined} of {api.POOL_SIZE} joined</b>
                <button className="btn" disabled={mine === p.id} onClick={() => join(p.id)}>
                  {mine === p.id ? 'You’re in this pool' : 'Join this pool'}
                </button>
              </article>
            ))}
          </div>
        </main>
      )}

      {tab === 'mine' && (
        <main>
          {!myPool ? (
            <p className="empty">You haven’t joined a pool yet. Browse open pools and join one.</p>
          ) : (
            <>
              <p className="mut">Your pool · {myPool.city}</p>
              <h1>{myPool.model} {myPool.variant}</h1>
              <ol className="steps">
                {['Pooled', 'Dealers bidding', 'Compare', 'Decide'].map((s, i) => {
                  const at = quotes.length ? 2 : myPool.joined >= api.POOL_SIZE ? 1 : 0
                  return <li key={s} className={i < at ? 'done' : i === at ? 'now' : ''}>{s}</li>
                })}
              </ol>
              <div className="stats">
                <div className="card"><span className="mut">Buyers in pool</span><b className="big">{myPool.joined}</b></div>
                <div className="card"><span className="mut">Dealers bid</span><b className="big">{quotes.length}</b></div>
                <div className="card"><span className="mut">Needed to open bids</span><b className="big">{Math.max(0, api.POOL_SIZE - myPool.joined)} more</b></div>
              </div>
              <h2 className="sec">Dealer quotes</h2>
              {quotes.length === 0 ? (
                <p className="empty">No bids yet. Dealers are invited once {api.POOL_SIZE} buyers have joined. You’ll see every itemised on-road price here.</p>
              ) : (
                <div className="grid">
                  {quotes.map((q) => {
                    const lowest = Math.min(...quotes.map(total)) === total(q)
                    return (
                      <article className={lowest ? 'card best' : 'card'} key={q.dealer}>
                        <div className="row"><h3>{q.dealer}</h3>{lowest && <span className="tag">Lowest</span>}</div>
                        <b className="big">{inr(total(q))}</b>
                        <div className="row mut"><span>Ex-showroom</span><span>{inr(q.exShowroom)}</span></div>
                        <div className="row mut"><span>Insurance</span><span>{inr(q.insurance)}</span></div>
                        <div className="row mut"><span>Registration + RTO</span><span>{inr(q.registration)}</span></div>
                        <div className="row mut"><span>Accessories</span><span>{inr(q.accessories)}</span></div>
                        {decision[q.dealer] ? <p className="mut">You {decision[q.dealer]} this deal.</p> : (
                          <>
                            <button className="btn" onClick={() => setDecision({ ...decision, [q.dealer]: 'accepted' })}>Accept this deal</button>
                            <button className="btn ghost" onClick={() => setDecision({ ...decision, [q.dealer]: 'passed on' })}>Pass</button>
                          </>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
              <p className="mut note">Your loan and paperwork stay yours. We’ll share a checklist once you accept a deal.</p>
            </>
          )}
        </main>
      )}
    </div>
  )
}
