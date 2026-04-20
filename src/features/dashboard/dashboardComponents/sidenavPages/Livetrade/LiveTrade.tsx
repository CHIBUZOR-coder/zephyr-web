import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLiveTradeStore } from './useLiveTradeStore'
import { ExitPositionModal } from './ExitPositionModal'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import { TierBadge } from '../../../../../Pages/Components/TierBadge'
import { useRecentTrades, useCopierTrades, type Trade, getTierLabel } from '../../../../trades/useTrades'
import { useSolPrice } from '../../../../../core/hooks/usePrice'

const SOLSCAN_BASE_URL = `https://solscan.io/tx`

type Stat = {
  label: string
  value: string
  sub: string
  green?: boolean
}

type CallTradeMeta = {
  active: boolean
  openedAt: string
  masterTrader?: string
  masterVaultPda?: string
  vaultPda?: string
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
  tokenInAddress: string
  tokenOutAddress: string
  masterVaultPda?: string
  vaultPda: string
}

const LiveTrade = () => {
  const { connected, publicKey } = useWallet()
  const { setWalletModal } = useGeneralContext()
  const { data: solPriceData } = useSolPrice()
  const solPrice = solPriceData?.price ?? 150

  const { activeTab, setActiveTab } = useLiveTradeStore()
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  )

  const { trades: recentTrades, refetch: refetchRecent } = useRecentTrades(20)
  const { trades: copierTrades, refetch: refetchCopier } = useCopierTrades(
    publicKey?.toBase58() || '',
    50
  )

  const refreshTrades = useCallback(() => {
    refetchRecent()
    if (publicKey) {
      refetchCopier()
    }
  }, [refetchRecent, refetchCopier, publicKey])

  useEffect(() => {
    const interval = setInterval(refreshTrades, 10000)
    return () => clearInterval(interval)
  }, [refreshTrades])

  const formatWallet = (wallet: string) => {
    if (!wallet || wallet.length < 10) return wallet
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getTokenSymbol = (tokenAddress: string) => {
    const symbols: Record<string, string> = {
      'So11111111111111111111111111111111111111112': 'SOL',
      '11111111111111111111111111111111': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1': 'USDC',
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr': 'USDC',
      '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU': 'JUP',
      'DezXAZ8z7Pnrn9vzct4XVkMHeJ3wi8SscLXvS9UfC5u' : 'BONK',
      'hB9S95635Fve9feyVdvyYqG9Fv6xK6Jd3Zf7UuHuzmY' : 'BONK',
      'HZ1JovZp2Vp87KqW2K7xS76KU2tV1PqH3MvM3Y7h6G7' : 'PYTH',
    }
    return symbols[tokenAddress] || tokenAddress.slice(0, 4) + '..' + tokenAddress.slice(-4)
  }

  const toNumber = (val: unknown): number => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') return parseFloat(val)
    return 0
  }

  const formatAmount = (val: unknown) => toNumber(val).toFixed(2)

  const liveTraders = useMemo(() => recentTrades.map((trade: Trade) => {
    const isMaster = trade.vaultType === 'MASTER'
    const trader = isMaster
      ? trade.masterExecutionVault?.user?.displayName || formatWallet(trade.masterExecutionVault?.masterWallet || '')
      : trade.copierVault?.copier?.displayName || formatWallet(trade.copierVault?.copier?.walletAddress || '')
    
    const tierLabel = getTierLabel(trade.masterExecutionVault?.currentTier)
    const pair = `${getTokenSymbol(trade.tokenIn)}/${getTokenSymbol(trade.tokenOut)}`
    
    const action = trade.status === 'CONFIRMED' 
      ? (getTokenSymbol(trade.tokenOut) === 'SOL' ? 'BUY' : 'SELL')
      : 'PENDING'
    
    const tokenInSymbol = getTokenSymbol(trade.tokenIn)
    const amountStr = `${formatAmount(trade.amountInDecimal)} ${tokenInSymbol}`
    
    return {
      name: trader,
      tier: tierLabel,
      pair,
      action: action as 'BUY' | 'SELL' | 'PENDING',
      amount: amountStr,
      status: trade.status === 'CONFIRMED' ? 'EXECUTED' : trade.status === 'PENDING' ? 'PENDING' : 'FAILED',
      time: formatTimeAgo(trade.executedAt),
      signature: trade.signature,
    }
  }), [recentTrades])

  const positions: Position[] = useMemo(() => copierTrades.map((trade: Trade) => {
    const tokenInSymbol = getTokenSymbol(trade.tokenIn)
    const tokenOutSymbol = getTokenSymbol(trade.tokenOut)
    
    const amountIn = toNumber(trade.amountInDecimal)
    const amountOut = toNumber(trade.amountOutDecimal)
    
    // Simple PnL calculation if both are present and we are comparing tokens
    // For now, if amountOut > 0, we can show realized PnL of that trade
    // let pnl = 0
    // let pnlPct = 0
    if (amountOut > 0 && amountIn > 0) {
      // This is simplified; assumes tokenIn/tokenOut value parity for calculation if symbols match? 
      // Usually, it's tokenIn value vs tokenOut value.
      // If trade was SOL -> USDC, amountIn is SOL, amountOut is USDC.
      // If we assume SOL was $150, then pnl = amountOut - (amountIn * 150).
      // But we don't know the price at execution time easily here.
    }

    return {
      pair: `${tokenInSymbol}/${tokenOutSymbol}`,
      type: tokenOutSymbol === 'SOL' ? 'BUY' as const : 'SELL' as const,
      mirror: trade.masterExecutionVault?.user?.displayName || 
             formatWallet(trade.masterExecutionVault?.masterWallet || ''),
      entry: trade.tokenIn.includes('EPjFWdd5') ? `$${amountIn.toFixed(2)}` : `${amountIn.toFixed(2)} ${tokenInSymbol}`,
      current: trade.tokenOut.includes('EPjFWdd5') ? `$${amountOut.toFixed(2)}` : `${amountOut.toFixed(2)} ${tokenOutSymbol}`,
      allocation: `${formatAmount(trade.amountInDecimal)} ${tokenInSymbol}`,
      pnl: '+$0.00', // Still simplified until we have historic price context
      pnlPercent: '0.0%',
      drawdown: '0.0%',
      tp: 'N/A',
      sl: 'N/A',
      opened: formatTimeAgo(trade.executedAt),
      mode: 'copier' as const,
      callTrade: {
        active: false,
        openedAt: formatTimeAgo(trade.executedAt),
        masterTrader: trade.masterTradeId || '',
        protectionActive: false
      },
      tokenInAddress: trade.tokenIn,
      tokenOutAddress: trade.tokenOut,
      masterVaultPda: trade.masterExecutionVault?.vaultPda,
      vaultPda: trade.vaultPda
    }
  }), [copierTrades])

  const activeAllocation = useMemo(() => copierTrades.reduce((acc, t) => {
    // Sum up SOL allocation specifically for the stat
    if (getTokenSymbol(t.tokenIn) === 'SOL') return acc + Number(t.amountInDecimal)
    return acc
  }, 0), [copierTrades])

  const totalPnl = 0
  
  const stats: Stat[] = useMemo(() => [
    {
      label: 'ACTIVE ALLOCATION',
      value: `${activeAllocation.toFixed(2)} SOL`,
      sub: `~$${(activeAllocation * solPrice).toFixed(2)} USD`
    },
    {
      label: 'UNREALIZED PNL',
      value: totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`,
      sub: '0.0% Total',
      green: totalPnl >= 0
    },
    {
      label: 'MAX DRAWDOWN',
      value: '0.0%',
      sub: 'Current Session'
    },
    {
      label: 'ACTIVE POSITIONS',
      value: String(copierTrades.length),
      sub: '0 Pending Exits'
    }
  ], [activeAllocation, solPrice, totalPnl, copierTrades.length])

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

                      <div className='flex flex-col gap-1'>
                        <p className='font-semibold text-sm md:text-base'>
                          {trader.name}
                        </p>
                        <TierBadge tierLabel={trader.tier} size='sm' />
                      </div>
                    </div>

                    {/* Trade Details */}
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-sm'>
                          {trader.pair}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-1 rounded ${
                            trader.action === 'BUY'
                              ? 'bg-green-600/20 text-green-400'
                              : trader.action === 'SELL'
                              ? 'bg-red-600/20 text-red-400'
                              : 'bg-yellow-600/20 text-yellow-400'
                          }`}
                        >
                          {trader.action}
                        </span>
                      </div>
                      <p className='text-sm text-gray-400'>{trader.amount}</p>
                    </div>

                    {/* Execution */}
                    <div>
                      <div className={`font-semibold text-sm flex items-center gap-2 ${
                        trader.status === 'EXECUTED' 
                          ? 'text-green-400' 
                          : trader.status === 'FAILED'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}>
                        <span
                          className='bg-center bg-cover h-[16px] w-[16px]'
                          style={{
                            backgroundImage: trader.status === 'EXECUTED' 
                              ? `url("/images/greencheck.svg")` 
                              : trader.status === 'FAILED'
                              ? `url("/images/redx.svg")`
                              : `url("/images/pending.svg")`
                          }}
                        ></span>
                        <span className='italic capitalize'>{trader.status}</span>
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

                    {/* Verification */}
                    <div className='flex justify-end'>
                      <a
                        href={`${SOLSCAN_BASE_URL}/${trader.signature}?cluster=devnet`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 px-3 py-1 
              bg-[#00000066] rounded-lg text-xs text-gray-300 
              border border-teal-800 whitespace-nowrap hover:text-teal-400 transition'
                      >
                        <p>{formatWallet(trader.signature)}</p>
                        <span
                          className='bg-center bg-cover h-[12px] w-[12px] cursor-pointer'
                          style={{
                            backgroundImage: `url("/images/redirectlive.svg")`
                          }}
                        ></span>
                      </a>
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
                      {stat.value}
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
                            {pos.callTrade.active ? `Called ` : 'Mirroring: '}

                            {pos.masterVaultPda ? (
                              <Link 
                                to={`/profile/${pos.masterVaultPda}`}
                                className="text-[#B0E4DD] hover:text-teal-400 transition-colors"
                              >
                                {pos.mirror}
                              </Link>
                            ) : (
                              <span className='text-[#B0E4DD]'>{pos.mirror}</span>
                            )}
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

                    <h3 className='text-lg font-bold text-white'>{stat.value}</h3>

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
