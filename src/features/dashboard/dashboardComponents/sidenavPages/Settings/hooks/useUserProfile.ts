import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authFetch } from '../../../../../../core/query/authClient'
import { useWallet } from '@solana/wallet-adapter-react'

export interface UserProfile {
  id: string
  walletAddress: string
  displayName: string | null
  bio: string | null
  avatar: string | null
  twitter: string | null
  discord: string | null
  telegram: string | null
  lastSocialsUpdate: string | null
  createdAt: string
  updatedAt?: string
}

interface GetUserResponse {
  success: boolean
  user: UserProfile
}

interface UpdateUserResponse {
  success: boolean
  user: UserProfile
}

interface UpdateUserInput {
  displayName?: string
  bio?: string
  avatar?: string
  twitter?: string
  discord?: string
  telegram?: string
}

export function useUserProfile() {
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()
  const walletAddress = publicKey?.toBase58()

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile', walletAddress],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!walletAddress) return null
      try {
        const res = await authFetch<GetUserResponse>(`/api/users/${walletAddress}`)
        if (res.success) return res.user
        return null
      } catch {
        return null
      }
    },
    enabled: !!walletAddress,
  })

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      if (!walletAddress) throw new Error('No wallet connected')
      const res = await authFetch<UpdateUserResponse>(`/api/users/${walletAddress}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })
      if (!res.success) throw new Error('Failed to update profile')
      return res.user
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile', walletAddress], data)
    },
  })

  const updateProfile = useCallback(
    async (input: UpdateUserInput) => {
      return updateMutation.mutateAsync(input)
    },
    [updateMutation]
  )

  return {
    profile,
    isLoading: isLoadingProfile,
    isSaving: updateMutation.isPending,
    error: updateMutation.error instanceof Error ? updateMutation.error.message : null,
    updateProfile,
  }
}
