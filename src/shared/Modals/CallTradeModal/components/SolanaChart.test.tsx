import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import SolanaChart from './SolanaChart'

// Mock lightweight-charts
vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => ({
    addSeries: vi.fn(() => ({
      setData: vi.fn(),
      update: vi.fn(),
    })),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn(),
    })),
    applyOptions: vi.fn(),
    remove: vi.fn(),
  })),
  ColorType: { Solid: 'solid' },
  CandlestickSeries: 'CandlestickSeries',
  LineSeries: 'LineSeries',
}))

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any

describe('SolanaChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<SolanaChart interval="1M" pair="SOL/USDC" />)
    expect(container.querySelector('.relative.w-full')).toBeDefined()
  })

  it('initializes with loading state', () => {
    const { getByText } = render(<SolanaChart interval="1M" pair="SOL/USDC" />)
    expect(getByText('Initializing Data Stream...')).toBeDefined()
  })
})
