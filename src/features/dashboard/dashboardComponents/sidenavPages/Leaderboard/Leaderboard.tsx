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
import { useLeaderboard } from './useLeaderboard'
import type {
  Trader,
  LeaderboardPeriod,
  LeaderboardSort
} from './leaderboar.types'
import { Link } from 'react-router-dom'
import { TierBadge } from '../../../../../Pages/Components/TierBadge'

// ─── Movement indicator ───────────────────────────────────────────────────────
type Movement = 'up' | 'down' | 'same'

const RankMovement = ({ movement }: { movement: Movement }) => {
  if (movement === 'same') {
    return <span className='text-[#3d6060] text-[9px] leading-none'>—</span>
  }

  if (movement === 'up') {
    return (
      <span
        style={{ backgroundImage: `url("/images/rank.svg")` }}
        className='bg-center inline-block bg-cover h-[12px] w-[12px] text-[#19d3c5] leading-none'
      ></span>
    )
  }

  return (
    <span
      style={{ backgroundImage: `url("/images/rank.svg")` }}
      className='bg-center rotate-180 inline-block bg-cover h-[12px] w-[12px] text-[#19d3c5] leading-none'
    ></span>
  )
}

const Leaderboard: React.FC = () => {
  const { openVaultFlow } = useGeneralContext()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  const [activePeriod, setPeriod] = useState<LeaderboardPeriod>('30d')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTier, setActiveTier] = useState<number | undefined>(undefined)
  const [activeSort, setSort] = useState<LeaderboardSort>('pnl')
  const [page, setPage] = useState(1)
  const [tierOpen, setTierOpen] = useState(false)
const getAvatarUrl = (url: string) =>
  url.replace('/svg?', '/png?').replace('seed=', 'size=128&seed=')


  const { data, isLoading, error } = useLeaderboard({
    period: activePeriod,
    sort: activeSort,
    tier: activeTier,
    page,
    limit: 10
  })

  const leaders = data?.traders ?? []
  const totalTraders = data?.total ?? 0
  const totalPages = Math.ceil(totalTraders / 20)

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

  const tiers = [
    { label: 'ALL TIERS', value: undefined },
    { label: 'Community', value: 1 },
    { label: 'Rising', value: 2 },
    { label: 'Verified Alpha', value: 3 },
    { label: 'Elite', value: 4 },
    { label: 'Institutional', value: 5 }
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

  // Local filtering for the search term since it's fast
  const filteredTraders = leaders.filter(trader =>
    trader.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='min-h-screen bg-[#031b1f] text-white p-6 lg:p-10 mb-60 lg:mb-0 '>
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
        <div className='flex flex-col md:flex-row gap-5 md:gap-6 '>
          {/* PERIOD BUTTONS */}
          <div className='flex items-center gap-2 bg-[#0a1d20] p-1 rounded-xl border border-[#123c42] w-fit'>
            {(['7d', '30d', '90d', 'all'] as LeaderboardPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p)
                  setPage(1)
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition uppercase ${
                  activePeriod === p
                    ? 'bg-[#19d3c5] text-black'
                    : 'text-[#5f7d84] hover:text-white'
                }`}
              >
                {p === 'all' ? 'ALL-TIME' : p}
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
              <span className='uppercase text-[#5f7d84]'>
                {tiers.find(t => t.value === activeTier)?.label || 'ALL TIERS'}
              </span>
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
                {tiers?.map(tier => (
                  <button
                    key={tier.label}
                    onClick={() => {
                      setActiveTier(tier.value)
                      setPage(1)
                      setTierOpen(false)
                    }}
                    className='w-full text-left px-4 py-2 text-xs text-[#5f7d84] hover:bg-[#102221] hover:text-white transition'
                  >
                    {tier.label}
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
      <div className='rounded-lg border border-[#0f3a40] overflow-hidden'>
        <div className='overflow-x-auto scrollbar-hide'>
          <table className='w-full min-w-[900px] lg:min-w-0 border-collapse'>
            {/* TABLE HEAD */}
            <thead className='bg-[#0a1414] h-[50px]'>
              <tr className='text-[8px] text-[#5f7d84] uppercase'>
                <th className='thh'>Rank</th>
                <th className='thh'>Trader</th>
                <th className='thh'>Tiers</th>
                <th
                  className='thh cursor-pointer hover:text-white transition'
                  onClick={() => {
                    setSort('pnl')
                    setPage(1)
                  }}
                >
                  PnL {activeSort === 'pnl' && '▼'}
                </th>
                <th
                  className='thh cursor-pointer hover:text-white transition'
                  onClick={() => {
                    setSort('aum')
                    setPage(1)
                  }}
                >
                  AUM {activeSort === 'aum' && '▼'}
                </th>
                <th
                  className='thh cursor-pointer hover:text-white transition'
                  onClick={() => {
                    setSort('winRate')
                    setPage(1)
                  }}
                >
                  Win Rate {activeSort === 'winRate' && '▼'}
                </th>
                <th
                  className='thh cursor-pointer hover:text-white transition'
                  onClick={() => {
                    setSort('maxDrawdown')
                    setPage(1)
                  }}
                >
                  Drawdown {activeSort === 'maxDrawdown' && '▲'}
                </th>
                <th
                  className='thh cursor-pointer hover:text-white transition'
                  onClick={() => {
                    setSort('volume')
                    setPage(1)
                  }}
                >
                  Trades {activeSort === 'volume' && '▼'}
                </th>
                <th
                  className='thh cursor-pointer hover:text-white transition'
                  onClick={() => {
                    setSort('copiers')
                    setPage(1)
                  }}
                >
                  Copiers {activeSort === 'copiers' && '▼'}
                </th>
                <th className='thh'>Action</th>
              </tr>
            </thead>
            {/* TABLE BODY */}
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className='p-10 text-center text-gray-400'>
                    <div className='animate-pulse'>
                      Fetching Real-time Leaderboard...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className='p-10 text-center text-red-400'>
                    Error:{' '}
                    {error instanceof Error
                      ? error.message
                      : 'Failed to load leaderboard'}
                  </td>
                </tr>
              ) : filteredTraders?.length === 0 ? (
                <tr>
                  <td colSpan={10} className='p-10 text-center text-gray-500'>
                    No active master traders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTraders?.map(trader => {
                  const displayRank = trader.rank

                  return (
                    <tr
                      key={trader.id}
                      className='border-t bg-[#102221] border-[#0f3a40] hover:bg-[#0f2a2a] transition'
                    >
                      {/* ── RANK ── */}
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
                              } h-[26px] w-[26px] rounded-full min-w-[24px] text-center flex justify-center items-center`}
                            >
                              {displayRank}
                            </span>
                          ) : (
                            <span className='text-[11px] font-bold text-white h-[26px] w-[26px] flex justify-center items-center'>
                              {displayRank}
                            </span>
                          )}
                          <RankMovement movement='same' />
                        </div>
                      </td>

                      <td className='pdd trader'>
                        <Link
                          to={`/profile/${trader.vaultAddress}`}
                          className='bg-center bg-cover h-[32px] w-[32px] rounded-full relative'
                          style={{
                            backgroundImage: `url(${getAvatarUrl(
                              trader.image
                            )})`
                          }}
                        >
                          <span className='absolute bottom-[1px] right-[1px] flex justify-center items-center h-[9.5px] w-[9.5px] border-[1.3px] rounded-full border-[#6A7282] bg-primary'>
                            <span className='animate-pulse h-[4px] w-[4px] bg-[#6A7282] rounded-full inline-block'></span>
                          </span>
                        </Link>
                        <div className='flex flex-col gap-1'>
                          <Link
                            to={`/profile/${trader.vaultAddress}`}
                            className='font-[900] text-[14px]'
                          >
                            {trader.name}
                          </Link>
                          <TierBadge tierLabel={trader.tag} size='sm' />
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
                          className='bg-[#19d3c5] text-white hover:opacity-90 transition text-[10px] font-[900] px-3 py-1 rounded-lg cursor-pointer'
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className='flex justify-center mt-8 gap-2'>
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className='px-4 py-2 rounded-lg bg-[#0a1d20] border border-[#123c42] disabled:opacity-30'
          >
            PREV
          </button>
          <div className='flex items-center px-4 text-xs font-bold text-[#5f7d84] uppercase tracking-widest'>
            Page {page} of {totalPages}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
            className='px-4 py-2 rounded-lg bg-[#0a1d20] border border-[#123c42] disabled:opacity-30'
          >
            NEXT
          </button>
        </div>
      )}

      {/* TRADER SPOTLIGHT */}
      <div className='mt-14'>
        <h2 className='text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2'>
          🏆 TRADER SPOTLIGHT
        </h2>

        {isLoading ? (
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
                <div className='mt-3 flex items-center gap-2'>
                  <h3 className='text-xl font-bold'>@{traderOfWeek.name}</h3>
                  <TierBadge tierLabel={traderOfWeek.tag} size='sm' />
                </div>
                <p className='text-xs text-[#7a9398] mt-3 max-w-xs'>
                  {traderOfWeek.tag} ranked #{traderOfWeek.rank} with{' '}
                  {traderOfWeek.trades} trades and {traderOfWeek.winRate} win
                  rate.
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
                  className='mt-8 bg-[#19d3c5] hover:opacity-90 transition text-black font-bold text-sm px-6 py-3 rounded-xl cursor-pointer'
                >
                  COPY MASTER STRATEGY ⚡
                </button>
              </div>

              <div className='flex-1 bg-[#0a1d20] rounded-xl p-6 flex flex-col justify-between'>
                <div className='flex justify-between text-[10px] text-[#5f7d84] uppercase'>
                  <span>Performance History</span>
                  <span className='text-[#19d3c5]'>● Cumulative ROI</span>
                </div>
                <div
                  className='h-44 mt-6 min-h-[100px]'
                  ref={chartContainerRef}
                >
                  {/* Check container has valid dimensions before rendering */}
                  {performanceData && performanceData.length > 0 ? (
                    <ResponsiveContainer
                      width='100%'
                      height='100%'
                      minWidth={0}
                    >
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
                  ) : (
                    <div className='h-full flex items-center justify-center text-[#50706c] text-xs'>
                      No performance data
                    </div>
                  )}
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
                      Win Rate
                    </p>
                    <p className='font-bold text-lg'>{traderOfWeek.winRate}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      parseFloat(traderOfWeek.winRate) >= 50
                        ? 'bg-[#0d3b40] text-[#19d3c5]'
                        : 'bg-[#3b0d0d] text-red-400'
                    }`}
                  >
                    {parseFloat(traderOfWeek.winRate) >= 50
                      ? 'PROFITABLE'
                      : 'UNPROFITABLE'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-[10px] text-[#5f7d84] uppercase'>
                      Max Drawdown
                    </p>
                    <p className='font-bold text-lg text-red-400'>
                      -{traderOfWeek.drawdown}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      parseFloat(traderOfWeek.drawdown) <= 20
                        ? 'bg-[#0d3b40] text-[#19d3c5]'
                        : 'bg-[#3b0d0d] text-red-400'
                    }`}
                  >
                    {parseFloat(traderOfWeek.drawdown) <= 20
                      ? 'LOW RISK'
                      : 'HIGH RISK'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-[10px] text-[#5f7d84] uppercase'>
                      Total Copiers
                    </p>
                    <p className='font-bold text-lg'>{traderOfWeek.copiers}</p>
                  </div>
                  <span className='text-xs bg-[#0d3b40] text-[#19d3c5] px-3 py-1 rounded-full'>
                    ACTIVE
                  </span>
                </div>
              </div>
              <div className='mt-8 text-[10px] text-[#5f7d84] bg-[#0a1d20] p-4 rounded-xl'>
                <p className='text-[#7a9398]'>
                  "Ranked #{traderOfWeek.rank} on the leaderboard with{' '}
                  {traderOfWeek.trades} total trades and {traderOfWeek.copiers}{' '}
                  active copiers."
                </p>
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
