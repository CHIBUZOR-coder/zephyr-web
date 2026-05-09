import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { ProfileSkeleton } from './components/Skeletons'
import ProfileHeader from './components/ProfileHeader'
import StatsGrid from './components/StatsGrid'
import PerformanceSection from './components/PerformanceSection'
import RiskSection from './components/RiskSection'
import { useTraderProfile } from '../../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/useLeaderboard'
import { authFetch } from '../../core/query/authClient'

type Params = {
  address?: string
}

function isPublicKey(input: string): boolean {
  return /^[A-HJ-NP-Za-km-z1-9]{32,44}$/.test(input)
}

export default function VisitorProfile () {
  const { address } = useParams<Params>()
  const [vaultAddress, setVaultAddress] = useState<string | undefined>(undefined)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    if (!address) {
      setVaultAddress(undefined)
      return
    }

    if (isPublicKey(address)) {
      setVaultAddress(address)
      return
    }

    setResolving(true)
    authFetch<{ success: boolean; user: { walletAddress: string } }>(`/api/users/by-username/${address}`)
      .then(res => {
        if (res.success && res.user) {
          setVaultAddress(res.user.walletAddress)
        } else {
          setVaultAddress(address)
        }
      })
      .catch(() => {
        setVaultAddress(address)
      })
      .finally(() => setResolving(false))
  }, [address])

  const { trader, loading, error } = useTraderProfile(vaultAddress)
  const isLoading = resolving || loading

  if (isLoading) return <ProfileSkeleton />
  if (error) return <div className='text-white'>{error}</div>
  if (!trader) return <div className='text-white'>Trader not found</div>

  return (
    <div className='min-h-screen bg-[#061414] text-white p-4 md:p-6 pb-40 lg:pb-0'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <ProfileHeader trader={trader} />
        <StatsGrid trader={trader} />
        <PerformanceSection trader={trader} />
        <RiskSection trader={trader} />
      </div>
    </div>
  )
}
