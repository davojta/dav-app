export interface Bbox {
  south: number
  west: number
  north: number
  east: number
}

export interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  timestamp?: string
  user?: string
  changeset?: number
  version?: number
  tags?: Record<string, string>
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
}

export interface OverpassResponse {
  elements: OsmElement[]
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export function parseBbox(input: string): Bbox {
  const parts = input.split(',').map((p) => Number(p.trim()))
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    throw new Error('bbox must be "south,west,north,east" decimal degrees')
  }
  const [south, west, north, east] = parts
  if (south >= north || west >= east) {
    throw new Error('bbox must have south < north and west < east')
  }
  if (south < -90 || north > 90 || west < -180 || east > 180) {
    throw new Error('bbox out of WGS84 range')
  }
  return { south, west, north, east }
}

export function buildQuery(bbox: Bbox, sinceIso: string): string {
  const b = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`
  return `[out:json][timeout:30];
(
  node(${b})(newer:"${sinceIso}");
  way(${b})(newer:"${sinceIso}");
  relation(${b})(newer:"${sinceIso}");
);
out meta center;`
}

export async function fetchChanges(
  bbox: Bbox,
  sinceIso: string,
  fetchImpl: typeof fetch = fetch,
): Promise<OsmElement[]> {
  const body = new URLSearchParams({ data: buildQuery(bbox, sinceIso) })
  const res = await fetchImpl(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    throw new Error(`Overpass error: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as OverpassResponse
  return json.elements ?? []
}

export function osmLink(el: OsmElement): string {
  return `https://www.openstreetmap.org/${el.type}/${el.id}`
}

export function changesetLink(el: OsmElement): string | null {
  return el.changeset
    ? `https://www.openstreetmap.org/changeset/${el.changeset}`
    : null
}
