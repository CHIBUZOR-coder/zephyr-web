import type { Trader } from '../../../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import StatCard from './StatCard'

type StatsGridProps = {
  trader: Trader
}

export default function StatsGrid ({ trader }: StatsGridProps) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
      <StatCard label='PnL' value={trader.pnl} highlight />
      <StatCard label='AUM' value={trader.aum} />
      <StatCard label='Volume' value={trader.volume} />
      <StatCard label='Win Rate' value={trader.winRate} />
      <StatCard label='Max DD' value={trader.drawdown} negative />
    </div>
  )
}
