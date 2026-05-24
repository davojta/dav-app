export type Bucket = 'roads' | 'buildings' | 'pois' | 'addresses' | 'other'

export const BUCKETS: Bucket[] = ['roads', 'buildings', 'pois', 'addresses', 'other']

export const BUCKET_LABEL: Record<Bucket, string> = {
  roads: 'Roads',
  buildings: 'Buildings',
  pois: 'POIs & amenities',
  addresses: 'Addresses',
  other: 'Other',
}

const POI_KEYS = new Set([
  'amenity',
  'shop',
  'tourism',
  'leisure',
  'office',
  'craft',
  'historic',
])

export function classify(tags: Record<string, string> | undefined): Bucket {
  if (!tags) return 'other'
  if (tags.highway) return 'roads'
  if (tags.building) return 'buildings'
  for (const k of Object.keys(tags)) {
    if (POI_KEYS.has(k)) return 'pois'
  }
  if (tags['addr:housenumber'] || tags['addr:street']) return 'addresses'
  return 'other'
}

export function describe(tags: Record<string, string> | undefined): string {
  if (!tags) return '(no tags)'
  return (
    tags.name ||
    tags['name:en'] ||
    tags.ref ||
    tags.amenity ||
    tags.shop ||
    tags.highway ||
    tags.building ||
    tags['addr:street'] ||
    '(unnamed)'
  )
}
