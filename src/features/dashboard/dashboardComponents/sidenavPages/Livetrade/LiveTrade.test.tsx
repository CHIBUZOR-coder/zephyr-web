import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LiveTrade from './LiveTrade'

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: vi.fn(() => ({
    connected: false,
    publicKey: null
  }))
}))

vi.mock('../../../../trades/useTrades', () => ({
  useRecentTrades: vi.fn(() => ({
    trades: [],
    refetch: vi.fn()
  })),
  useCopierTrades: vi.fn(() => ({
    trades: [],
    refetch: vi.fn()
  }))
}))

vi.mock('./useLiveTradeStore', () => ({
  useLiveTradeStore: vi.fn(() => ({
    activeTab: 'allTrades',
    setActiveTab: vi.fn()
  }))
}))

vi.mock('../../../../../Context/GeneralContext', () => ({
  useGeneralContext: vi.fn(() => ({
    setWalletModal: vi.fn()
  }))
}))

describe('LiveTrade', () => {
  it('renders Live Trade header', () => {
    render(
      <BrowserRouter>
        <LiveTrade />
      </BrowserRouter>
    )
    expect(screen.getByText('LIVE TRADES')).toBeDefined()
  })

  it('renders both tabs', () => {
    render(
      <BrowserRouter>
        <LiveTrade />
      </BrowserRouter>
    )
    expect(screen.getByText('All Zephyr Trades')).toBeDefined()
    expect(screen.getByText('My Positions')).toBeDefined()
  })
})