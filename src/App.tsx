import { useMemo, useState } from 'react'
import {
  BUCKETS,
  BUCKET_LABEL,
  classify,
  describe,
  type Bucket,
} from './lib/classify'
import {
  changesetLink,
  fetchChanges,
  osmLink,
  parseBbox,
  type OsmElement,
} from './lib/overpass'
import './App.css'

const DEFAULT_BBOX = '53.85,27.45,53.97,27.70'
const HOUR_OPTIONS = [6, 24, 72, 168]

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString()
}

interface State {
  status: 'idle' | 'loading' | 'ok' | 'error'
  elements: OsmElement[]
  since: string
  error: string | null
}

const INITIAL: State = { status: 'idle', elements: [], since: '', error: null }

function App() {
  const [bboxText, setBboxText] = useState(DEFAULT_BBOX)
  const [hours, setHours] = useState(24)
  const [state, setState] = useState<State>(INITIAL)

  const onScan = async () => {
    let bbox
    try {
      bbox = parseBbox(bboxText)
    } catch (e) {
      setState({ ...INITIAL, status: 'error', error: (e as Error).message })
      return
    }
    const since = isoHoursAgo(hours)
    setState({ status: 'loading', elements: [], since, error: null })
    try {
      const elements = await fetchChanges(bbox, since)
      setState({ status: 'ok', elements, since, error: null })
    } catch (e) {
      setState({
        status: 'error',
        elements: [],
        since,
        error: (e as Error).message,
      })
    }
  }

  const grouped = useMemo(() => {
    const out: Record<Bucket, OsmElement[]> = {
      roads: [],
      buildings: [],
      pois: [],
      addresses: [],
      other: [],
    }
    for (const el of state.elements) out[classify(el.tags)].push(el)
    return out
  }, [state.elements])

  return (
    <main className="app">
      <header>
        <h1>OSM Area Watcher</h1>
        <p className="sub">
          Show OpenStreetMap features in a bounding box that have been edited
          recently. Data via the public Overpass API.
        </p>
      </header>

      <section className="controls">
        <label>
          Bounding box (south,west,north,east)
          <input
            value={bboxText}
            onChange={(e) => setBboxText(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label>
          Window
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          >
            {HOUR_OPTIONS.map((h) => (
              <option key={h} value={h}>
                last {h}h
              </option>
            ))}
          </select>
        </label>
        <button onClick={onScan} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Scanning…' : 'Scan'}
        </button>
      </section>

      {state.status === 'error' && (
        <p className="error">Error: {state.error}</p>
      )}

      {state.status === 'ok' && (
        <section className="results">
          <p className="meta">
            {state.elements.length} edited feature
            {state.elements.length === 1 ? '' : 's'} since{' '}
            <code>{state.since}</code>
          </p>
          {BUCKETS.map((b) => {
            const items = grouped[b]
            if (items.length === 0) return null
            return (
              <details key={b} open className="bucket">
                <summary>
                  {BUCKET_LABEL[b]} <span className="count">({items.length})</span>
                </summary>
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Type</th>
                      <th>User</th>
                      <th>Changeset</th>
                      <th>OSM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((el) => {
                      const cs = changesetLink(el)
                      return (
                        <tr key={`${el.type}/${el.id}`}>
                          <td>{describe(el.tags)}</td>
                          <td>{el.type}</td>
                          <td>{el.user ?? '—'}</td>
                          <td>
                            {cs ? (
                              <a href={cs} target="_blank" rel="noreferrer">
                                {el.changeset}
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <a
                              href={osmLink(el)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              open
                            </a>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </details>
            )
          })}
          {state.elements.length === 0 && (
            <p className="empty">No edits in this window. Try a longer window.</p>
          )}
        </section>
      )}

      <footer>
        <p>
          Tip: get a bbox from{' '}
          <a
            href="https://www.openstreetmap.org/export"
            target="_blank"
            rel="noreferrer"
          >
            openstreetmap.org/export
          </a>{' '}
          and paste as <code>south,west,north,east</code>. Default covers
          Minsk.
        </p>
      </footer>
    </main>
  )
}

export default App
