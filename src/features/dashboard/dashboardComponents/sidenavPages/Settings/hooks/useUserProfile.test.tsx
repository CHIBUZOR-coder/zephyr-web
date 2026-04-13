import { describe, it, expect } from 'vitest'
import type { UserProfile } from './useUserProfile'

describe('useUserProfile', () => {
  describe('UserProfile type', () => {
    it('should have correct structure', () => {
      const profile: UserProfile = {
        id: 'user-123',
        walletAddress: 'ABC123def456Ghi789jkl012Mno345Pqr678',
        displayName: 'Test Trader',
        bio: 'A test bio',
        avatar: 'https://example.com/avatar.png',

        twitter: null,
        discord: null,
        telegram: null,
        lastSocialsUpdate: null,

        createdAt: '2024-01-01T00:00:00.000Z'
      }

      expect(profile.id).toBe('user-123')
      expect(profile.walletAddress).toBe('ABC123def456Ghi789jkl012Mno345Pqr678')
      expect(profile.displayName).toBe('Test Trader')
      expect(profile.bio).toBe('A test bio')
      expect(profile.avatar).toBe('https://example.com/avatar.png')
    })

    it('should allow optional fields to be null', () => {
      const profile: UserProfile = {
        id: 'user-456',
        walletAddress: 'XYZ789abc012Def345ghi678Jkl901',
        displayName: null,
        bio: null,
        avatar: null,

        twitter: null,
        discord: null,
        telegram: null,
        lastSocialsUpdate: null,

        createdAt: '2024-01-01T00:00:00.000Z'
      }

      expect(profile.displayName).toBeNull()
      expect(profile.bio).toBeNull()
      expect(profile.avatar).toBeNull()
    })
  })
})
