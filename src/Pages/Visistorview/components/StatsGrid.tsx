import type { Trader } from '../../../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import StatCard from './StatCard'

type StatsGridProps = {
  trader: Trader
}

export default function StatsGrid ({ trader }: StatsGridProps) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <StatCard label='PnL' value={trader.pnl} highlight />
      <StatCard label='Win Rate' value={trader.winRate} />
      <StatCard label='Max DD' value={trader.drawdown} negative />
      <StatCard label='Copiers' value={trader.follows.toString()} />
    </div>
  )
}
