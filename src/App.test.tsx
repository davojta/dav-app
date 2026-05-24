import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'
import { classify, describe as describeFeature } from './lib/classify'
import { buildQuery, parseBbox } from './lib/overpass'

describe('App', () => {
  it('renders title and scan button', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /osm area watcher/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /scan/i })).toBeInTheDocument()
  })
})

describe('classify', () => {
  it('buckets by primary tag', () => {
    expect(classify({ highway: 'residential' })).toBe('roads')
    expect(classify({ building: 'yes' })).toBe('buildings')
    expect(classify({ amenity: 'cafe' })).toBe('pois')
    expect(classify({ shop: 'bakery' })).toBe('pois')
    expect(classify({ 'addr:housenumber': '12' })).toBe('addresses')
    expect(classify({ note: 'x' })).toBe('other')
    expect(classify(undefined)).toBe('other')
  })

  it('describe prefers name', () => {
    expect(describeFeature({ name: 'Foo', amenity: 'cafe' })).toBe('Foo')
    expect(describeFeature({ amenity: 'cafe' })).toBe('cafe')
    expect(describeFeature(undefined)).toBe('(no tags)')
  })
})

describe('parseBbox', () => {
  it('parses valid bbox', () => {
    expect(parseBbox('1,2,3,4')).toEqual({
      south: 1,
      west: 2,
      north: 3,
      east: 4,
    })
  })

  it('rejects malformed input', () => {
    expect(() => parseBbox('a,b,c,d')).toThrow()
    expect(() => parseBbox('1,2,3')).toThrow()
    expect(() => parseBbox('3,2,1,4')).toThrow()
    expect(() => parseBbox('1,2,3,200')).toThrow()
  })
})

describe('buildQuery', () => {
  it('includes bbox and since', () => {
    const q = buildQuery(
      { south: 1, west: 2, north: 3, east: 4 },
      '2026-05-24T00:00:00.000Z',
    )
    expect(q).toContain('1,2,3,4')
    expect(q).toContain('newer:"2026-05-24T00:00:00.000Z"')
    expect(q).toContain('node(')
    expect(q).toContain('way(')
    expect(q).toContain('relation(')
  })
})
