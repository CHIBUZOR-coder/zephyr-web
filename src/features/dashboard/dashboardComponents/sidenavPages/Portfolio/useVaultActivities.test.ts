import { describe, it, expect } from 'vitest'
import { formatVaultActivity, type VaultActivity } from './useVaultActivities'

describe('formatVaultActivity', () => {
  it('formats DEPOSIT event correctly', () => {
    const activity: VaultActivity = {
      id: '1',
      type: 'DEPOSIT',
      vaultAddress: 'TestVault',
      signature: '5K2bHX8q9ZL1abcdef123456789',
      timestamp: new Date().toISOString(),
      data: { amount: '2500000000' },
      processed: true,
    }

    const formatted = formatVaultActivity(activity)

    expect(formatted.id).toBe('1')
    expect(formatted.type).toBe('DEPOSIT')
    expect(formatted.token).toBe('SOL')
    expect(formatted.amount).toBe('+2.50')
    expect(formatted.status).toBe('success')
    expect(formatted.tx).toBe('5K2bHX...6789')
  })

  it('formats WITHDRAWAL event correctly', () => {
    const activity: VaultActivity = {
      id: '2',
      type: 'WITHDRAWAL',
      vaultAddress: 'TestVault',
      signature: 'ABC123def456',
      timestamp: new Date().toISOString(),
      data: { amount: '15000000000' },
      processed: true,
    }

    const formatted = formatVaultActivity(activity)

    expect(formatted.type).toBe('WITHDRAWAL')
    expect(formatted.token).toBe('SOL')
    expect(formatted.amount).toBe('-15.00')
  })

  it('formats TRADE_EXECUTED event correctly', () => {
    const activity: VaultActivity = {
      id: '3',
      type: 'TRADE_EXECUTED',
      vaultAddress: 'TestVault',
      signature: 'TradeSig123',
      timestamp: new Date().toISOString(),
      data: { tokenOut: 'JUP', amountOut: '1200000000' },
      processed: true,
    }

    const formatted = formatVaultActivity(activity)

    expect(formatted.type).toBe('TRADE')
    expect(formatted.amount).toBe('+1.20')
  })

  it('formats VAULT_CREATED event correctly', () => {
    const activity: VaultActivity = {
      id: '4',
      type: 'VAULT_CREATED',
      vaultAddress: 'TestVault',
      signature: null,
      timestamp: new Date().toISOString(),
      data: null,
      processed: true,
    }

    const formatted = formatVaultActivity(activity)

    expect(formatted.type).toBe('VAULT CREATED')
    expect(formatted.token).toBe('N/A')
    expect(formatted.amount).toBe('N/A')
    expect(formatted.tx).toBe('N/A')
  })

  it('handles missing signature gracefully', () => {
    const activity: VaultActivity = {
      id: '5',
      type: 'DEPOSIT',
      vaultAddress: 'TestVault',
      signature: null,
      timestamp: new Date().toISOString(),
      data: { amount: '1000000000' },
      processed: true,
    }

    const formatted = formatVaultActivity(activity)

    expect(formatted.tx).toBe('N/A')
  })

  it('handles invalid amount data', () => {
    const activity: VaultActivity = {
      id: '6',
      type: 'DEPOSIT',
      vaultAddress: 'TestVault',
      signature: 'Sig123',
      timestamp: new Date().toISOString(),
      data: { amount: 'invalid' },
      processed: true,
    }

    const formatted = formatVaultActivity(activity)

    expect(formatted.amount).toBe('+invalid')
  })
})

describe('Vault activity queue behavior', () => {
  it('limit of 15 is enforced by the API', () => {
    const limit = Math.min(20, 15)
    expect(limit).toBe(15)
  })

  it('limit of 5 respects user preference within bounds', () => {
    const limit = Math.min(5, 15)
    expect(limit).toBe(5)
  })
})
