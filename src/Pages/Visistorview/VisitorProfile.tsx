// ================= VisitorProfile.tsx =================
import { useParams } from 'react-router-dom'

import { ProfileSkeleton } from './components/Skeletons'
import ProfileHeader from './components/ProfileHeader'
import StatsGrid from './components/StatsGrid'
import PerformanceSection from './components/PerformanceSection'
import RiskSection from './components/RiskSection'
import { useDashboardLeaderboard } from '../../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/useLeaderboard'

type Params = {
  address?: string
}

export default function VisitorProfile () {
  const { address } = useParams<Params>()
  const { leaders, loading, error } = useDashboardLeaderboard()

  if (loading) return <ProfileSkeleton />
  if (error) return <div className='text-red-500'>Failed to load profile</div>

  // Find trader by vaultAddress (passed in URL)
  const trader = leaders.find(t => t.vaultAddress === address)

  if (!trader) return <div className='text-white'>Trader not found</div>

  return (
    <div className='min-h-screen bg-[#061414] text-white p-4 md:p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <ProfileHeader trader={trader} />
        <StatsGrid trader={trader} />
        <PerformanceSection trader={trader} />
        <RiskSection trader={trader} />
      </div>
    </div>
  )
}
