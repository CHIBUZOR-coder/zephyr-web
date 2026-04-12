import type { Trader } from '../../../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import { FiBarChart2 } from 'react-icons/fi'
import { RiShieldCheckLine } from 'react-icons/ri'
import { AiOutlineWarning } from 'react-icons/ai'

type RiskSectionProps = {
  trader: Trader
}

export default function RiskSection ({ trader }: RiskSectionProps) {
  const winRate = parseFloat(trader.winRate.replace('%', ''))
  const lossRate = 100 - winRate
  const winningTrades = Math.round((winRate / 100) * trader.trades)
  const losingTrades = trader.trades - winningTrades

  return (
    <div className='space-y-6'>
      {/* HEADER */}
      <div>
        <h2 className='text-white font-semibold text-lg'>
          RISK & CONSISTENCY METRICS
        </h2>
        <p className='text-sm text-gray-400 mt-1'>
          Deep dive into trading discipline and risk management
        </p>
      </div>

      {/* TOP CARDS */}
      <div className='grid md:grid-cols-2 gap-6'>
        <TopCard
          title='CONSISTENCY SCORE'
          value={`${winRate.toFixed(0)}%`}
          description={`Based on ${trader.trades} total trades with ${winRate.toFixed(1)}% win rate.`}
          icon={<FiBarChart2 />}
          iconBg='bg-emerald-500/10 text-emerald-400'
        />

        <TopCard
          title='RISK STABILITY'
          value={parseFloat(trader.drawdown) < 10 ? 'Low' : 'Moderate'}
          description={`Max drawdown of ${trader.drawdown} indicates ${parseFloat(trader.drawdown) < 10 ? 'conservative' : 'active'} risk management.`}
          icon={<RiShieldCheckLine />}
          iconBg='bg-yellow-500/10 text-yellow-400'
        />
      </div>

      {/* BOTTOM CARDS */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* DRAWDOWN */}
        <div className='bg-gradient-to-b from-[#0a2a2a] to-[#051919] p-6 rounded-2xl border border-white/5'>
          <div className='flex items-center gap-2 mb-4'>
            <AiOutlineWarning className='text-yellow-400' />
            <h3 className='text-sm text-white font-semibold'>
              DRAWDOWN ANALYSIS
            </h3>
          </div>

          <div className='space-y-3 text-sm'>
            <Row label='Maximum Drawdown' value={trader.drawdown} negative />
            <Row label='Win Rate' value={trader.winRate} positive />
            <Row label='Total Trades' value={trader.trades.toString()} />
            <Row label='Active Copiers' value={trader.copiers.toString()} />
          </div>
        </div>

        {/* TRADE DISTRIBUTION */}
        <div className='bg-gradient-to-b from-[#0a2a2a] to-[#051919] p-6 rounded-2xl border border-white/5'>
          <div className='flex items-center gap-2 mb-4'>
            <FiBarChart2 className='text-emerald-400' />
            <h3 className='text-sm text-white font-semibold'>
              TRADE DISTRIBUTION
            </h3>
          </div>

          <div className='space-y-3 text-sm'>
            <Row label='Winning Trades' value={`${winningTrades} (${winRate.toFixed(1)}%)`} positive />
            <Row label='Losing Trades' value={`${losingTrades} (${lossRate.toFixed(1)}%)`} negative />
            <Row label='PnL' value={trader.pnl} positive={parseFloat(trader.pnl) >= 0} />
            <Row label='Copiers' value={trader.copiers.toString()} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TopCard ({
  title,
  value,
  description,
  icon,
  iconBg
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  iconBg: string
}) {
  return (
    <div className='bg-gradient-to-b from-[#0a2a2a] to-[#051919] p-6 rounded-2xl border border-white/5'>
      <div className='flex items-start justify-between'>
        <p className='text-xs text-gray-400 tracking-wider'>{title}</p>
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </div>

      <h3 className='text-2xl font-bold text-white mt-4'>{value}</h3>

      <p className='text-xs text-gray-400 mt-2 leading-relaxed'>
        {description}
      </p>
    </div>
  )
}

function Row ({
  label,
  value,
  negative,
  positive
}: {
  label: string
  value: string | number
  negative?: boolean
  positive?: boolean
}) {
  return (
    <div className='flex justify-between items-center'>
      <span className='text-gray-400'>{label}</span>
      <span
        className={`font-medium ${
          negative
            ? 'text-red-400'
            : positive
            ? 'text-emerald-400'
            : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
