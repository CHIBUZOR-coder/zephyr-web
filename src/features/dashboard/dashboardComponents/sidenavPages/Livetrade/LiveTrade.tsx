import { useState } from 'react'
import { useLiveTradeStore } from './useLiveTradeStore'
import { ExitPositionModal } from './ExitPositionModal'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
// import { useAuthStore } from '../../../../auth/auth.store'
// import { p } from 'framer-motion/client'
// import { useTradingModeStore } from './useTradingModeStore'

type Stat = {
  label: string
  value: string
  sub: string
  green?: boolean
}

type Trader = {
  name: string
  tyter: string
  trade: string
  amout: string
  wallet: string
  action: 'BUY' | 'SELL'
  time: string
}

type CallTradeMeta = {
  active: boolean
  openedAt: string
  masterTrader?: string
  protectionActive: boolean
}

type Position = {
  pair: string
  type: 'BUY' | 'SELL'
  mirror: string
  entry: string
  current: string
  allocation: string
  pnl: string
  pnlPercent: string
  drawdown: string
  tp: string
  sl: string
  opened: string
  mode: 'copier' | 'master'
  callTrade: CallTradeMeta
}

// const totalAllocation = positions.length

// const totalPNL = positions.reduce((acc, pos) => {
//   const number = parseFloat(pos.pnl.replace('$', ''))
//   return acc + number
// }, 0)

// const totalDrawdown = Math.max(
//   ...positions.map(pos => parseFloat(pos.drawdown))
// )

const LiveTrade = () => {
  const { connected } = useWallet()
  const { setWalletModal } = useGeneralContext()
  // const authenticated = useAuthStore(state => state.authenticated)

  const { activeTab, setActiveTab } = useLiveTradeStore()
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  )

  const stats: Stat[] = [
    {
      label: 'ACTIVE ALLOCATION',
      value: '4.25 SOL',
      sub: '~$612.50 USD'
    },
    {
      label: 'UNREALIZED PNL',
      value: '+$32.40',
      sub: '+1.2% Total',
      green: true
    },
    {
      label: 'MAX DRAWDOWN',
      value: '3.2%',
      sub: 'Current Session'
    },

    {
      label: 'ACTIVE POSITIONS',
      value: '2',
      sub: '0 Pending Exits'
    }
  ]

  const positions: Position[] = [
    {
      pair: 'SOL / USDC',
      type: 'BUY',
      mirror: '@sol_whale',
      entry: '$142.20',
      current: '$148.50',
      allocation: '2.50 SOL',
      pnl: '+$15.75',
      pnlPercent: '+4.4%',
      drawdown: '0.0%',
      tp: '160.00',
      sl: '135.00',
      opened: '14m ago',
      mode: 'copier',
      callTrade: {
        active: false,
        openedAt: '14m ago',
        masterTrader: '@sol_whale',
        protectionActive: true
      }
    },
    {
      pair: 'JUP / USDC',
      type: 'BUY',
      mirror: ' @alpha_seeker',
      entry: '$1.12',
      current: '$1.09',
      allocation: '500.00 JUP',
      pnl: '-$15.00',
      pnlPercent: '-2.6%',
      drawdown: '3.2%',
      tp: '1.45',
      sl: '1.05',
      opened: '6m ago',
      mode: 'master',
      callTrade: {
        active: false,
        openedAt: '6m ago',
        masterTrader: '@you',
        protectionActive: false
      }
    },
    {
      pair: 'JUP / USDC',
      type: 'BUY',
      mirror: '@ 212k Market Cap',
      entry: '$1.12',
      current: '$1.09',
      allocation: '500.00 JUP',
      pnl: '-$15.00',
      pnlPercent: '-2.6%',
      drawdown: '3.2%',
      tp: '1.45',
      sl: '1.05',
      opened: '6m ago',
      mode: 'master',
      callTrade: {
        active: true,
        openedAt: '6m ago',
        masterTrader: '@you',
        protectionActive: false
      }
    }
  ]

  const liveTraders: Trader[] = [
    {
      name: '@sol_whale',
      tyter: 'Elite Alpha',
      trade: 'SOL/USDC',
      amout: '142.50 SOL',
      wallet: '5K2b...9zL1',
      action: 'BUY',
      time: '12s ago'
    },
    {
      name: '@alpha_seeker',
      tyter: 'Verified Alpha',
      trade: 'SOL/USDC',
      amout: '25,000 JUP',
      wallet: '2A7x...4mP9',
      action: 'BUY',
      time: '45s ago'
    },
    {
      name: '@zephyr_mod',
      tyter: 'Verified Alpha',
      trade: 'BONK/SOL',
      amout: '4.2B BONK',
      wallet: '9L1v...2qW8',
      action: 'SELL',
      time: '1m ago'
    },
    {
      name: '@degenslayer',
      tyter: 'Community',
      trade: 'BONK/SOL',
      amout: '1,200 PYTH',
      wallet: '3H5b...7fR4',
      action: 'SELL',
      time: '2m ago'
    },
    {
      name: '@macro_king',
      tyter: 'Elite Alpha',
      trade: 'SOL/USDC',
      amout: '85.00 SOL',
      wallet: '8M2k...1tY3',
      action: 'BUY',
      time: '3m ago'
    },
    {
      name: '@onchain_guru',
      tyter: 'Legendary',
      trade: 'WIF/SOL',
      amout: '450.20 WIF',
      wallet: '8M2k...1tY3',
      action: 'BUY',
      time: '5m ago'
    },
    {
      name: '@smart_money',
      tyter: 'Verified Alpha',
      trade: 'DRIFT/USDC',
      amout: '15,000 DRIFT',
      wallet: '1Z3m...5uI9',
      action: 'SELL',
      time: '8m ago'
    },
    {
      name: '@velocity_cap',
      tyter: 'Elite Alpha',
      trade: 'SOL/USDC',
      amout: '200.00 SOL',
      wallet: '1Z3m...5uI9',
      action: 'BUY',
      time: '8m ago'
    }
  ]

  const badgeColor = (type: string) => {
    switch (type) {
      case 'Elite Alpha':
        return 'bg-purple-600/20 text-purple-400'
      case 'Verified Alpha':
        return 'bg-green-600/20 text-green-400'
      case 'Legendary':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-600/20 text-gray-300'
    }
  }

  // 🔥 Filter based on active tab
  // const filteredTrades =
  //   activeTab === 'all'
  //     ? liveTraders
  //     : liveTraders.filter(trader => trader.name === '@sol_whale') // simulate "my positions"
  // const { masterMode, callTrade } = useTradingModeStore()
  return (
    <div className='min-h-screen text-white  mb-28 lg:mb-0'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8 bg-[#091114] p-8 flex-col lg:flex-row gap-5'>
        <div>
          <h1 className='text-[30px] font-bold'>LIVE TRADES</h1>
          <p className='text-sm text-[#B0E4DD80] text-[13px] font-[500]'>
            Real-time execution layer across the Zephyr protocol.
          </p>
        </div>

        {/* 🔥 Toggle Switch */}
        <div className='flex bg-[#0B2025] p-1 rounded-xl border border-teal-900/40'>
          <button
            onClick={() => setActiveTab('allTrades')}
            className={`flex justify-between items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'allTrades'
                ? 'bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span
              style={{ backgroundImage: `url("/images/all.svg")` }}
              className='bg-center bg-cover h-[12px] w-[12px]'
            ></span>
            <span> All Zephyr Trades</span>
          </button>

          <button
            onClick={() => setActiveTab('positions')}
            className={`flex justify-between items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'positions'
                ? 'bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span
              style={{ backgroundImage: `url("/images/trendd.svg")` }}
              className='bg-center bg-cover h-[12px] w-[12px]'
            ></span>
            <span className='text-white'> My Positions </span>
          </button>
        </div>
      </div>
      {activeTab === 'allTrades' && (
        <div className='w-full px-4 md:px-8 '>
          {/* Scroll Wrapper */}
          <div className='overflow-x-auto'>
            <div className='min-w-[900px]'>
              {/* Table Head */}
              <div className='grid grid-cols-4 text-xs text-[#B0E4DD4D] font-[900] px-4 mb-3'>
                <span>TRADER</span>
                <span>TRADE DETAILS</span>
                <span>EXECUTION</span>
                <span className='text-right'>VERIFICATION</span>
              </div>

              {/* Trades */}
              <div className='space-y-4'>
                {liveTraders.map((trader, index) => (
                  <div
                    key={index}
                    className='grid grid-cols-4 items-center px-4 py-4 rounded-xl 
            bg-[#102221] border border-teal-900/40 
            hover:border-teal-500/40 transition'
                  >
                    {/* Trader */}
                    <div className='flex items-center gap-2'>
                      <div className='rounded-lg bg-[#00000066] py-2 px-3'>
                        <span
                          className='bg-center bg-cover h-[20px] w-[20px] inline-block'
                          style={{
                            backgroundImage: `url("/images/liveperson.svg")`
                          }}
                        ></span>
                      </div>

                      <div>
                        <p className='font-semibold text-sm md:text-base'>
                          {trader.name}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full ${badgeColor(
                            trader.tyter
                          )}`}
                        >
                          {trader.tyter}
                        </span>
                      </div>
                    </div>

                    {/* Trade Details */}
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-sm'>
                          {trader.trade}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-1 rounded ${
                            trader.action === 'BUY'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-red-600/20 text-red-400'
                          }`}
                        >
                          {trader.action}
                        </span>
                      </div>
                      <p className='text-sm text-gray-400'>{trader.amout}</p>
                    </div>

                    {/* Execution */}
                    <div>
                      <div className='text-green-400 font-semibold text-sm flex items-center gap-2'>
                        <span
                          className='bg-center bg-cover h-[16px] w-[16px]'
                          style={{
                            backgroundImage: `url("/images/greencheck.svg")`
                          }}
                        ></span>
                        <span className='italic'>EXECUTED</span>
                      </div>

                      <div className='text-xs text-gray-400 flex items-center gap-2'>
                        <span
                          className='bg-center bg-cover h-[12px] w-[12px]'
                          style={{
                            backgroundImage: `url("/images/time.svg")`
                          }}
                        ></span>
                        <span>{trader.time}</span>
                      </div>
                    </div>

                    {/* Wallet */}
                    <div className='flex justify-end'>
                      <div
                        className='flex items-center gap-3 px-3 py-1 
              bg-[#00000066] rounded-lg text-xs text-gray-300 
              border border-teal-800 whitespace-nowrap'
                      >
                        <p>{trader.wallet}</p>
                        <span
                          className='bg-center bg-cover h-[12px] w-[12px] cursor-pointer'
                          style={{
                            backgroundImage: `url("/images/redirectlive.svg")`
                          }}
                        ></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'positions' && (
        <>
          {!connected ? (
            <div className='px-4 md:px-8 space-y-6'>
              {/* Top Stats (still show even if empty) */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className='bg-[#102221] border border-teal-900/40 rounded-xl p-4 flex flex-col gap-3'
                  >
                    <div className='text-[#B0E4DD66] font-semibold flex gap-2 items-center'>
                      <span
                        className='bg-center bg-cover h-[16px] w-[16px]'
                        style={{
                          backgroundImage: `url("/images/trend.svg")`
                        }}
                      ></span>
                      <p className='text-[10px] lg:text-xs'>{stat.label}</p>
                    </div>

                    <h3 className='text-lg font-bold text-white'>
                      {stat.label === 'ACTIVE ALLOCATION'
                        ? '0.00 SOL'
                        : stat.label === 'MAX DRAWDOWN'
                        ? '0.0%'
                        : stat.label === 'UNREALIZED PNL'
                        ? '$0.00'
                        : '0'}
                    </h3>

                    <p className='text-xs text-[#B0E4DD80]'>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Empty Wallet Card */}
              <div className='w-full rounded-2xl p-10 md:p-16 bg-[#102221]  border border-teal-900/40 flex flex-col items-center justify-center text-center space-y-6'>
                {/* Icon Circle */}
                <div className='h-[72px] w-[72px] rounded-full bg-teal-500/10 flex items-center justify-center'>
                  <span
                    className='h-[32px] w-[32px] bg-center bg-cover'
                    style={{
                      backgroundImage: `url("/images/wallet.svg")`
                    }}
                  ></span>
                </div>

                {/* Title */}
                <h2 className='text-lg md:text-xl font-bold text-white tracking-wide'>
                  WALLET NOT CONNECTED
                </h2>

                {/* Description */}
                <p className='text-sm text-[#B0E4DD80] max-w-md leading-relaxed'>
                  Connect your wallet to view your active copy trading positions
                  and real-time performance metrics.
                </p>

                {/* Button */}
                <button
                  onClick={() => setWalletModal(true)}
                  className='px-8 py-3 bg-teal-500 hover:bg-teal-600 rounded-xl font-semibold text-sm transition shadow-[0_0_25px_rgba(20,184,166,0.35)]'
                >
                  CONNECT WALLET
                </button>
              </div>
            </div>
          ) : positions.length > 0 ? (
            <div className='px-4 md:px-8 space-y-6'>
              {/* Top Stats */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className='bg-[#102221] border border-teal-900/40 rounded-xl p-4 flex flex-col  gap-3'
                  >
                    <div className=' text-[#B0E4DD66] font-semibold flex gap-2'>
                      <span
                        className='bg-center bg-cover h-[16px] w-[16px] '
                        style={{
                          backgroundImage: `url("/images/trend.svg")`
                        }}
                      ></span>
                      <p className='text-[10px] lg:text-xs'>{stat.label}</p>
                    </div>

                    <h3
                      className={`text-lg font-bold ${
                        stat.green ? 'text-green-400' : 'text-white'
                      }`}
                    >
                      {stat.value}
                    </h3>

                    <p className='text-xs text-[#B0E4DD80]'>{stat.sub}</p>
                  </div>
                ))}
              </div>
              {/* Position Cards */}
              <div className='space-y-6'>
                {positions.map((pos, index) => (
                  <div
                    key={index}
                    className=' bg-[#102221]
          border border-teal-900/40 rounded-2xl p-6 space-y-6'
                  >
                    {/* Header */}
                    <div className='flex flex-col md:flex-row md:justify-between gap-4'>
                      <div className='flex gap-3 bg-'>
                        <span className='bg-center bg-cover inline-block h-[56px] w-[56px] rounded-lg bg-[#0a1414]'></span>
                        <div className=''>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-bold text-lg'>{pos.pair} </h3>
                            <span className='text-[10px] px-2 py-1 rounded bg-green-600/20 text-green-400'>
                              {pos.type}
                            </span>
                          </div>
                          <p className='text-sm text-[#B0E4DD66]'>
                            {pos.callTrade.active ? `Called ` : 'Mirroring '}

                            <span className='text-[#B0E4DD]'>{pos.mirror}</span>
                          </p>
                        </div>
                      </div>

                      <div className='flex gap-10 text-sm'>
                        <div>
                          <p className='text-[#B0E4DD66] text-xs'>
                            ENTRY PRICE
                          </p>
                          <p className='font-semibold'>{pos.entry}</p>
                        </div>
                        <div>
                          <p className='text-[#B0E4DD66] text-xs'>
                            CURRENT PRICE
                          </p>
                          <p className='font-semibold'>{pos.current}</p>
                        </div>
                      </div>
                    </div>

                    <p className=' h-[0.5px] bg-[#23483b] w-full'></p>
                    {/* Stats Row */}
                    <div className='grid md:grid-cols-4 gap-4'>
                      <div className='row p-4 rounded-xl'>
                        <p className='text-xs text-[#B0E4DD66]'>ALLOCATION</p>
                        <p className='font-semibold'>{pos.allocation}</p>
                      </div>

                      <div className='row p-4 rounded-xl'>
                        <p className='text-xs text-[#B0E4DD66]'>
                          UNREALIZED PNL
                        </p>
                        <p
                          className={`font-semibold ${
                            pos.pnl.startsWith('+')
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {pos.pnl}
                        </p>
                        <p className='text-xs text-[#B0E4DD4D]'>
                          {pos.pnlPercent}
                        </p>
                      </div>

                      <div className=' row p-4 rounded-xl'>
                        <p className='text-xs text-[#B0E4DD66]'>DRAWDOWN</p>
                        <p className='font-semibold'>{pos.drawdown}</p>
                      </div>

                      <div className='row p-4 rounded-xl'>
                        <p className='text-xs text-[#B0E4DD66]'>SAFETY NET</p>
                        <p className='font-semibold'>TP: {pos.tp}</p>
                        <p className='text-xs text-[#B0E4DD4D]'>SL: {pos.sl}</p>
                      </div>
                    </div>
                    {/* Footer */}
                    <div className='flex flex-col md:flex-row justify-between items-center gap-6 lg:gap-0'>
                      <div className='flex gap-6 items-center'>
                        <div className='flex gap-2 items-center'>
                          <span
                            className='bg-center bg-cover h-[16px] w-[16px] inline-block '
                            style={{
                              backgroundImage: `url("/images/time.svg")`
                            }}
                          ></span>
                          <p className='text-[8px] lg:text-[11px] font-[700] leading-[16.5px] tracking-[1.1px] uppercase text-[#B0E4DD33]'>
                            {pos.opened}
                          </p>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <span
                            className='bg-center bg-cover h-[16px] w-[16px] inline-block '
                            style={{
                              backgroundImage: `url("/images/cheksheild.svg")`
                            }}
                          ></span>
                          <p className='text-[11px] font-[700] leading-[16.5px] tracking-[1.1px] uppercase text-[#B0E4DD33]'>
                            {pos.callTrade.protectionActive
                              ? 'PROTECTION ACTIVE'
                              : 'NO PROTECTION'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPosition(pos)}
                        className='w-full lg:w-auto px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition flex items-center gap-2 justify-center'
                      >
                        <p>SELL</p>
                        <span
                          className='h-[16px] w-[16px] bg-center bg-cover inline-block'
                          style={{
                            backgroundImage: `url("/images/sell.svg")`
                          }}
                        ></span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='px-4 md:px-8 space-y-6'>
              {/* Top Stats (still show even if empty) */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className='bg-[#102221] border border-teal-900/40 rounded-xl p-4 flex flex-col gap-3'
                  >
                    <div className='text-[#B0E4DD66] font-semibold flex gap-2 items-center'>
                      <span
                        className='bg-center bg-cover h-[16px] w-[16px]'
                        style={{
                          backgroundImage: `url("/images/trend.svg")`
                        }}
                      ></span>
                      <p className='text-[10px] lg:text-xs'>{stat.label}</p>
                    </div>

                    <h3 className='text-lg font-bold text-white'>0.00 SOL</h3>

                    <p className='text-xs text-[#B0E4DD80]'>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Empty Wallet Card */}
              <div className='w-full rounded-2xl p-10 md:p-16 bg-[#102221]  border border-teal-900/40 flex flex-col items-center justify-center text-center space-y-6'>
                {/* Icon Circle */}
                <div className='h-[72px] w-[72px] rounded-full bg-teal-500/10 flex items-center justify-center'>
                  <span
                    className='h-[32px] w-[32px] bg-center bg-cover'
                    style={{
                      backgroundImage: `url("/images/wallet.svg")`
                    }}
                  ></span>
                </div>

                {/* Title */}
                <h2 className='text-lg md:text-xl font-bold text-white tracking-wide'>
                  NO ACTIVE POSITIONS
                </h2>
                <p
                  className='text-[#B0E4DD
] text-[14px] font-[400]'
                >
                  You have no active copy trading positions.
                </p>
              </div>
            </div>
          )}
        </>
      )}
      <div className='px-8 py-4'>
        <div className='flex justify-center items-center gap-4 '>
          <span
            className='bg-center bg-cover h-[14px] w-[14px] '
            style={{
              backgroundImage: `url("/images/blackshild.svg")`
            }}
          ></span>
          <p className='text-[#B0E4DD4D] text-[8px] lg:text-[10px] text-center font-[700] leading-[15px] uppercase tracking-[2px]'>
            Verified Real-time Stream • Institutional Transparency •
            Non-Custodial Execution
          </p>
        </div>
      </div>

      <ExitPositionModal
        isOpen={!!selectedPosition}
        onClose={() => setSelectedPosition(null)}
        position={selectedPosition}
      />
    </div>
  )
}

export default LiveTrade
