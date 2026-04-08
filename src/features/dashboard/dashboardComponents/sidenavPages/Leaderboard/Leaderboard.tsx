import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts'
import React, { useEffect, useRef, useState } from 'react'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import { getTier } from '../../../../../utils/Gettiter'
import { useDashboardLeaderboard } from './useLeaderboard'
import type { Trader } from './leaderboar.types'
import { Link } from 'react-router-dom'

// ─── Movement indicator ───────────────────────────────────────────────────────
// Renders a small teal arrow (up) or red arrow (down) + the number of positions
// moved, or a dash for no change. Sits inline next to the rank number.

type Movement = 'up' | 'down' | 'same'

const RankMovement = ({ movement }: { movement: Movement }) => {
  if (movement === 'same') {
    return <span className='text-[#3d6060] text-[9px] leading-none'>—</span>
  }

  if (movement === 'up') {
    return (
      <span
        style={{ backgroundImage: `url("/images/rank.svg")` }}
        className='bg-center  inline-block bg-cover h-[12px] w-[12px] text-[#19d3c5] leading-none'
      ></span>
    )
  }

  return (
    <span
      style={{ backgroundImage: `url("/images/rank.svg")` }}
      className='bg-center rotate-180  inline-block bg-cover h-[12px] w-[12px] text-[#19d3c5] leading-none'
    ></span>
  )
}

const Leaderboard: React.FC = () => {
  const { openVaultFlow } = useGeneralContext()
  const { leaders, loading, error } = useDashboardLeaderboard()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const performanceData = [
    { date: 'Day 1', roi: 0 },
    { date: 'Day 3', roi: 8 },
    { date: 'Day 5', roi: 6 },
    { date: 'Day 7', roi: 15 },
    { date: 'Day 10', roi: 12 },
    { date: 'Day 14', roi: 25 },
    { date: 'Day 18', roi: 22 },
    { date: 'Day 22', roi: 35 },
    { date: 'Day 26', roi: 42 },
    { date: 'Day 30', roi: 60 }
  ]

  const traderOfWeek: Trader | null = leaders.length > 0 ? leaders[0] : null

  // Map leaders to include movement
  const traders: (Trader & { movement: Movement })[] = leaders.map(leader => ({
    ...leader,
    movement: 'same' as Movement
  }))

  const [activePeriod, setPeriod] = useState<'7D' | '30D' | '90D' | 'ALLTIME'>(
    '30D'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTier, setActiveTier] = useState('ALL TIERS')
  const [tierOpen, setTierOpen] = useState(false)

  const tiers = [
    'ALL TIERS',
    'Community Trader',
    'Rising Trader',
    'Verified Alpha',
    'Elite Alpha',
    'Institutional Alpha'
  ]

  useEffect(() => {
    function handleClickOutside (event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setTierOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredTraders = traders.filter(trader => {
    const matchesSearch =
      trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.tag.toLowerCase().includes(searchTerm.toLowerCase())

    // Simple filter for demo - in production backend should handle these
    const matchesTier =
      activeTier === 'ALL TIERS'
        ? true
        : trader.tag === activeTier || trader.tiers === activeTier

    return matchesSearch && matchesTier
  })

  return (
    <div className='min-h-screen bg-[#031b1f] text-white p-6 lg:p-10 mb-32 lg:mb-0 '>
      {/* TITLE */}
      <div className='mb-8'>
        <h1 className='text-xl font-bold flex items-center gap-2'>
          🏆 LEADERBOARD
        </h1>
        <p className='text-xs text-[#5f7d84] mt-1'>
          Ranked by verified on-chain performance and risk-adjusted consistency.
        </p>
      </div>
      {/* FILTER / SEARCH */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8'>
        <div className='flex flex-col md:flex-row  gap-5 md:gap-6 '>
          {/* PERIOD BUTTONS */}
          <div className='flex items-center gap-2 bg-[#0a1d20] p-1 rounded-xl border border-[#123c42] w-fit'>
            {(['7D', '30D', '90D', 'ALLTIME'] as const).map(period => (
              <button
                key={period}
                onClick={() => setPeriod(period)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activePeriod === period
                    ? 'bg-[#19d3c5] text-black'
                    : 'text-[#5f7d84] hover:text-white'
                }`}
              >
                {period === 'ALLTIME' ? 'ALL-TIME' : period}
              </button>
            ))}
          </div>
          {/* TIER DROPDOWN */}
          <div
            ref={dropdownRef}
            className='relative flex items-center gap-[5px]'
          >
            <span
              style={{ backgroundImage: `url("images/funnel.svg")` }}
              className='h-[16px] w-[16px] bg-center bg-cover inline-block'
            ></span>
            <button
              onClick={() => setTierOpen(!tierOpen)}
              className='flex items-center justify-between gap-3 bg-[#0a1d20] border border-[#123c42] rounded-xl px-4 py-2 text-xs text-white min-w-[140px] hover:border-[#19d3c5] transition'
            >
              <span className='uppercase text-[#5f7d84]'>{activeTier}</span>
              <svg
                className={`w-3 h-3 transition-transform ${
                  tierOpen ? 'rotate-180' : ''
                }`}
                fill='none'
                stroke='#5f7d84'
                strokeWidth='2'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </button>

            {tierOpen && (
              <div className='absolute mt-2 w-full bg-[#0f2a2f] border border-[#123c42] rounded-xl shadow-xl z-50 overflow-hidden'>
                {tiers.map(tier => (
                  <button
                    key={tier}
                    onClick={() => {
                      setActiveTier(tier)
                      setTierOpen(false)
                    }}
                    className='w-full text-left px-4 py-2 text-xs text-[#5f7d84] hover:bg-[#102221] hover:text-white transition'
                  >
                    {tier}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* SEARCH INPUT */}
        <input
          type='text'
          placeholder='Search trader...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='bg-[#0a1d20] border border-[#123c42] rounded-xl px-4 py-2 text-xs text-white placeholder-[#5f7d84] focus:outline-none focus:border-[#19d3c5] transition w-48'
        />
      </div>
      {/* Table */}
      <div className='rounded-lg border border-[#0f3a40] overflow-hidden bg-slate-700'>
        <div className='overflow-x-auto scrollbar-hide'>
          <table className='w-full min-w-[900px] lg:min-w-0 border-collapse'>
            {/* TABLE HEAD */}
            <thead className='bg-[#0a1414] h-[50px]'>
              <tr className='text-[8px] text-[#5f7d84] uppercase'>
                <th className='thh'>Rank</th>
                <th className='thh'>Trader</th>
                <th className='thh'>Tiers</th>
                <th className='thh'>PnL</th>
                <th className='thh'>AUM</th>
                <th className='thh'>Win Rate</th>
                <th className='thh'>Drawdown</th>
                <th className='thh'>Trades</th>
                <th className='thh'>Copiers</th>
                <th className='thh'>Action</th>
              </tr>
            </thead>
            {/* TABLE BODY */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className='p-10 text-center text-gray-400'>
                    Loading traders...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className='p-10 text-center text-red-400'>
                    Error: {error}
                  </td>
                </tr>
              ) : filteredTraders.length === 0 ? (
                <tr>
                  <td colSpan={10} className='p-10 text-center text-gray-500'>
                    No active master traders found.
                  </td>
                </tr>
              ) : (
                filteredTraders.map(trader => {
                  const displayRank = trader.rank
                  const tag = getTier(trader.tag)

                  return (
                    <tr
                      key={trader.id}
                      className='border-t bg-[#102221] border-[#0f3a40] hover:bg-[#0f2a2a] transition'
                    >
                      {/* ── RANK: number + movement indicator side by side ── */}
                      <td className='pdd'>
                        <div className='flex items-center gap-1.5'>
                          {displayRank <= 3 ? (
                            <span
                              className={`text-[11px] font-bold ${
                                displayRank === 1
                                  ? 'bg-rank_1 border-[1.5px] border-rank_border_1 text-[#FE9A00]'
                                  : displayRank === 2
                                  ? 'bg-rank_2 border-[1.5px] border-rank_border_2'
                                  : displayRank === 3
                                  ? 'bg-rank_3 border-[1.5px] border-rank_border_3 text-[#BB4D00]'
                                  : ''
                              } h-[26px] w-[26px] text-[#19d3c5] rounded-full  min-w-[24px] text-center  flex justify-center items-center`}
                            >
                              {displayRank}
                            </span>
                          ) : (
                            <span className='text-[11px] font-bold text-white h-[26px] w-[26px] flex justify-center items-center'>
                              {displayRank}
                            </span>
                          )}
                          <RankMovement movement={trader.movement} />
                        </div>
                      </td>

                      <td className='pdd trader'>
                        <Link
                          to={`/profile/${trader.address}`}
                          className='bg-center bg-cover h-[32px] w-[32px] rounded-full relative'
                          style={{ backgroundImage: `url(${trader.image})` }}
                        >
                          <span className='absolute bottom-[1px] right-[1px] flex justify-center items-center h-[9.5px] w-[9.5px] border-[1.3px] rounded-full border-[#6A7282] bg-primary'>
                            <span className='animate-pulse h-[4px] w-[4px] bg-[#6A7282] rounded-full inline-block'></span>
                          </span>
                        </Link>
                        <div>
                          <p className='font-[900] text-[14px]'>
                            {trader.name}
                          </p>
                          <span
                            className={`text-[8px] uppercase rounded-md font-medium ${tag?.text} ${tag?.bg} border-[1.1px] ${tag?.border} p-[4px]`}
                          >
                            {trader.tag}
                          </span>
                        </div>
                      </td>
                      <td className='pdd text-[10px] text-[#709692] uppercase font-[700]'>
                        {trader.tiers}
                      </td>
                      <td className='dd text-[#19d3c5] font-bold'>
                        {trader.pnl}
                      </td>
                      <td className='pdd'>{trader.aum}</td>
                      <td className='pdd'>{trader.winRate}</td>
                      <td className='pdd text-red-400 font-semibold'>
                        {trader.drawdown}
                      </td>
                      <td className='pdd'>{trader.trades}</td>
                      <td className='pdd'>{trader.copiers}</td>
                      <td className='pdd'>
                        <button
                          onClick={() => openVaultFlow(1, trader)}
                          className='bg-[#19d3c5] text-white hover:opacity-90 transition text-[10px] font-[900] px-3 py-1 rounded-lg'
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* TRADER SPOTLIGHT */}
      <div className='mt-14'>
        <h2 className='text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2'>
          🏆 TRADER SPOTLIGHT
        </h2>

        {loading ? (
          <div className='text-gray-500 text-center p-10'>
            Loading spotlight...
          </div>
        ) : traderOfWeek ? (
          <div className='grid lg:grid-cols-3 gap-6'>
            {/* MAIN SPOTLIGHT CARD */}
            <div className='lg:col-span-2 bg-gradient-to-br from-[#0f2a2f] to-[#0b1f23] border border-[#123c42] rounded-2xl p-6 flex flex-col lg:flex-row gap-8'>
              <div className='flex-1'>
                <span className='text-[10px] bg-[#2a2a00] text-yellow-400 px-3 py-1 rounded-full uppercase tracking-wider'>
                  Trader of the Week
                </span>
                <h3 className='mt-4 text-xl font-bold bg-[#0d3b40] inline-block px-2 py-1 rounded'>
                  @{traderOfWeek.name}
                </h3>
                <p className='text-xs text-[#7a9398] mt-3 max-w-xs'>
                  Specializing in {traderOfWeek.tiers} strategies and
                  professional-grade risk management.
                </p>
                <div className='flex gap-4 mt-6'>
                  <div className='bg-[#0a1d20] px-4 py-3 rounded-xl text-center'>
                    <p className='text-[9px] text-[#5f7d84] uppercase'>
                      PNL (30D)
                    </p>
                    <p className='text-[#19d3c5] font-bold text-sm'>
                      {traderOfWeek.pnl}
                    </p>
                  </div>
                  <div className='bg-[#0a1d20] px-4 py-3 rounded-xl text-center'>
                    <p className='text-[9px] text-[#5f7d84] uppercase'>
                      Win Rate
                    </p>
                    <p className='font-bold text-sm'>{traderOfWeek.winRate}</p>
                  </div>
                  <div className='bg-[#0a1d20] px-4 py-3 rounded-xl text-center'>
                    <p className='text-[9px] text-[#5f7d84] uppercase'>
                      Max DD
                    </p>
                    <p className='text-red-400 font-bold text-sm'>
                      -{traderOfWeek.drawdown}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openVaultFlow(1, traderOfWeek)}
                  className='mt-8 bg-[#19d3c5] hover:opacity-90 transition text-black font-bold text-sm px-6 py-3 rounded-xl'
                >
                  COPY MASTER STRATEGY ⚡
                </button>
              </div>

              <div className='flex-1 bg-[#0a1d20] rounded-xl p-6 flex flex-col justify-between'>
                <div className='flex justify-between text-[10px] text-[#5f7d84] uppercase'>
                  <span>Performance History</span>
                  <span className='text-[#19d3c5]'>● Cumulative ROI</span>
                </div>
                <div className='h-44 mt-6'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart
                      data={performanceData}
                      margin={{ top: 10, right: 20, left: 5, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id='colorRoi'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='0%'
                            stopColor='#19d3c5'
                            stopOpacity={0.4}
                          />
                          <stop
                            offset='100%'
                            stopColor='#19d3c5'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke='#123c42'
                        strokeDasharray='3 3'
                        vertical={false}
                      />
                      <XAxis
                        dataKey='date'
                        tick={{ fill: '#5f7d84', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#5f7d84', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={10}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a1d20',
                          border: '1px solid #123c42',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Area
                        type='monotone'
                        dataKey='roi'
                        stroke='#19d3c5'
                        strokeWidth={3}
                        fillOpacity={1}
                        fill='url(#colorRoi)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ALPHA SIGNALS */}
            <div className='bg-gradient-to-br from-[#0f2a2f] to-[#0b1f23] border border-[#123c42] rounded-2xl p-6'>
              <h4 className='text-sm font-bold mb-6'>ALPHA SIGNALS</h4>
              <div className='space-y-6 text-sm'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-[10px] text-[#5f7d84] uppercase'>
                      Risk-Adjusted Ratio
                    </p>
                    <p className='font-bold text-lg'>4.8</p>
                  </div>
                  <span className='text-xs bg-[#0d3b40] text-[#19d3c5] px-3 py-1 rounded-full'>
                    OPTIMAL
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-[10px] text-[#5f7d84] uppercase'>
                      Avg Trade Hold
                    </p>
                    <p className='font-bold text-lg'>4.2h</p>
                  </div>
                  <span className='text-xs bg-[#0d3b40] text-[#19d3c5] px-3 py-1 rounded-full'>
                    STABLE
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-[10px] text-[#5f7d84] uppercase'>
                      Total Copier Equity
                    </p>
                    <p className='font-bold text-lg'>$2.4M</p>
                  </div>
                  <span className='text-xs bg-[#0d3b40] text-[#19d3c5] px-3 py-1 rounded-full'>
                    GROWING
                  </span>
                </div>
              </div>
              <div className='mt-8 text-[10px] text-[#5f7d84] bg-[#0a1d20] p-4 rounded-xl'>
                "Consistent sizing and disciplined exit strategy are the bedrock
                of my trading. Risk management is the only holy grail."
              </div>
            </div>
          </div>
        ) : (
          <div className='text-gray-500 text-center p-10'>
            No spotlight data available.
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
