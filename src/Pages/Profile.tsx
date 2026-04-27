import BottomStats from './Components/BottomStats'
import PerformanceChart from './Components/PerformanceChart'
import ProfileHeader from './Components/ProfileHeader'
import RiskCard from './Components/RiskCard'
import StatCard from './Components/StatCard'
import TierProgression from './Components/TierProgression/TierProgression'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMasterRoiChart, useMasterTierState } from '../features/master/useMasterTier'
import { useUserVaults } from '../features/master/useUserVaults'
import { useUserProfile } from '../features/users/useUserProfile'
import { useTradingModeStore } from '../features/dashboard/useTradingModeStore'

export default function Profile () {
  const { publicKey } = useWallet()
  const { masterMode } = useTradingModeStore()
  const { masterVault, copierVaults, metrics } = useUserVaults()
  const masterWalletAddress = publicKey?.toBase58()
  const { data: userProfile } = useUserProfile(masterWalletAddress)
  const { data: tierState } = useMasterTierState(masterWalletAddress)
  const { data: roiChartData } = useMasterRoiChart(masterWalletAddress)

  const copierTotalPnL = (copierVaults?.reduce((acc, vault) => acc + parseFloat(vault.totalRealizedProfit?.toString() ?? '0'), 0) ?? 0) / 1_000_000

  const allTimePnlValue = masterMode 
    ? parseFloat(masterVault?.totalRealizedProfit?.toString() ?? '0') / 1_000_000 
    : copierTotalPnL;

  const joinedDateCalculated = userProfile?.createdAt 
    ? `Since ${new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` 
    : 'Since ...';

  const tier_stats = [
    {
      time: 'All-Time PnL',
      value: allTimePnlValue,
      duration: joinedDateCalculated,
      unit: '$'
    },
    {
      time: 'AUM',
      value: metrics?.totalAumUsd ?? 0,
      duration: 'Master + Copiers',
      unit: '$'
    },
    {
      time: 'Total Volume',
      value: metrics?.totalVolumeUsd ?? 0,
      duration: 'Lifetime Trading',
      unit: '$'
    },
    {
      time: 'Win Rate',
      value: parseFloat(tierState?.metrics.winRatePct ?? '0'),
      duration: `${tierState?.totalTrades ?? 0} total trades`,
      unit: '%'
    }
  ]

  const indicator = {
    alert: '/images/alert_triangle.svg',
    progress: '/images/activity.svg',
    win: '/images/bar_chart3.svg'
  }

  const maxDrawdownBps = tierState?.metrics?.maxDrawdownBps || 0
  
  const riskScore = Math.max(0, Math.min(100, Math.round(100 - maxDrawdownBps / 50)))
  const riskProfile = riskScore >= 80 ? 'Low risk profile' : riskScore >= 60 ? 'Moderate risk profile' : riskScore >= 40 ? 'Higher risk profile' : 'High risk profile'
  
  const copierRetentionPct = tierState?.metrics?.copierRetentionPct || '0'
  const consistencyScore = parseFloat(copierRetentionPct)
  const consistencyLabel = consistencyScore >= 80 ? 'Stable' : consistencyScore >= 60 ? 'Moderate' : consistencyScore >= 40 ? 'Volatile' : 'Highly Volatile'
  const consistencyColor = consistencyScore >= 60 ? 'text-emerald-400' : consistencyScore >= 40 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className='min-h-screen bg-[#020c0c] text-white p-3 md:p-6 '>
      <div className='max-w-6xl mx-auto space-y-6'>
        <ProfileHeader />
        {/* STATS */}
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {tier_stats.map((item, i) => (
            <div key={i}>
              <StatCard
                value={item.value}
                label={`${item.time}`}
                color={`${item.value < 0 ? 'text-[red]' : 'text-emerald-400'}`}
                duration={item.duration}
                unit={item.unit}
                indicator={indicator}
              />
            </div>
          ))}
        </div>
        {/* Tier Progression */}
        <TierProgression />
        {/* CHART */}
        <PerformanceChart roiChartData={roiChartData} />
        {/* RISK */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <RiskCard
            title='Risk Score'
            value={`${riskScore} / 100`}
            subtitle={riskProfile}
          />

          <RiskCard
            title='Consistency'
            value={consistencyLabel}
            subtitle={`${copierRetentionPct}% copier retention`}
            color={consistencyColor}
          />
        </div>

        {/* Drawdown + Trade Distribution */}
        <BottomStats />
      </div>
    </div>
  )
}
