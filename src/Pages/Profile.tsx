import BottomStats from './Components/BottomStats'
import PerformanceChart from './Components/PerformanceChart'
import ProfileHeader from './Components/ProfileHeader'
import RiskCard from './Components/RiskCard'
import StatCard from './Components/StatCard'
import TierProgression from './Components/TierProgression/TierProgression'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  useMasterRoiChart,
  useMasterTierState
} from '../features/master/useMasterTier'
import { useUserVaults } from '../features/master/useUserVaults'

export default function Profile () {
  const { publicKey } = useWallet()
  const { masterVault } = useUserVaults()
  const masterWalletAddress = publicKey?.toBase58()
  const { data: tierState } = useMasterTierState(masterWalletAddress)
  const { data: roiChartData } = useMasterRoiChart(masterWalletAddress)

  const tier_stats = [
    {
      time: 'All-Time PnL',
      value: parseFloat(masterVault?.totalRealizedProfit ?? '0') / 1_000_000,
      duration: 'Since Jan 2023',
      unit: '$'
    },
    {
      time: '30D PnL',
      value: parseFloat(tierState?.metrics.rollingVolumeUsd ?? '0'),
      duration: 'Last 30 days',
      unit: '$'
    },
    {
      time: 'Max Drawdown',
      value: parseFloat(tierState?.metrics.maxDrawdownPct ?? '0'),
      duration: 'Peak to trough',
      unit: '%'
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
            value='78 / 100'
            subtitle='Moderate risk profile'
          />

          <RiskCard
            title='Consistency'
            value='Stable'
            subtitle='Performance stability'
            color='text-emerald-400'
          />
        </div>

        {/* Drawdown + Trade Distribution */}
        <BottomStats />
      </div>
    </div>
  )
}
