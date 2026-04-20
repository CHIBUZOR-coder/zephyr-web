import { useState, useEffect, type FC } from 'react'
import { BsChevronDown } from 'react-icons/bs'
import { HiLightningBolt, HiOutlineLightningBolt } from 'react-icons/hi'
import { HiOutlineUsers } from 'react-icons/hi2'
import { AnimatePresence, motion } from 'framer-motion'
import { CiSearch } from 'react-icons/ci'
import { FiAlertTriangle, FiLoader } from 'react-icons/fi'
import SolanaChart from './components/SolanaChart'
import { useVaultOperations } from '../../../features/master/useVaultOperations'
import { useUserVaults } from '../../../features/master/useUserVaults'
import { useSolPrice } from '../../../core/hooks/usePrice'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Link } from 'react-router-dom'

const JUPITER_TOKEN_API = 'https://api.jup.ag/tokens/v2'

type Props = {
  open: boolean
  onClose: () => void
}

const SOL_MINT = 'So11111111111111111111111111111111111111112'  // wSOL mint
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mainnet

const CallTradeModal: FC<Props> = ({ open, onClose }) => {
  const [timeframe, setTimeframe] = useState('15M')
  const [amountType, setAmountType] = useState('percent')
  const [slippage, setSlippage] = useState('0.5%')
  const [showImpact, setShowImpact] = useState(false)

  const [amount, setAmount] = useState('10')
  const [tradeType, setTradeType] = useState<'Buy' | 'Sell'>('Buy')



  const [manualBootstrap, setManualBootstrap] = useState(false)







  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null)
  const [tokenPrice, setTokenPrice] = useState<number | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [useCustomToken, setUseCustomToken] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [localError, setLocalError] = useState<string | null>(null)


  const { callTrade, initializeTierConfig, initializeRiskConfig, error: opError } = useVaultOperations()
  const { masterVault, copierVaults, refetchAll } = useUserVaults()
  const { data: solPrice } = useSolPrice()

  const copierCount = masterVault?._count?.copierVaults ?? 0
  
  const totalAumSol = copierVaults?.reduce((sum, v) => {
    // useUserVaults hook provides actualBalance in SOL
    const bal = v.actualBalance ?? 0
    return sum + bal
  }, 0) ?? 0
  const totalAumUsd = totalAumSol * (solPrice?.price ?? 150)

  const defaultChartPair = 'SOL/USDC'
  const parsePairInput = (input: string) => {
    const upper = input.toUpperCase().trim()
    const parts = upper.split('/')
    const symbol = parts[0].trim()
    const quote = parts[1]?.trim() || 'USDC'
    return { symbol, quote }
  }
  const { quote: inputQuote } = parsePairInput(tokenAddress)
  const chartPair = useCustomToken && tokenSymbol && !tokenError ? `${tokenSymbol}/${inputQuote}` : defaultChartPair
  const shouldShowChart = !useCustomToken || (useCustomToken && tokenSymbol && !tokenError)

  useEffect(() => {
    setTokenPrice(null)
    setTokenError(null)
    setTokenSymbol(null)
    if (tokenAddress && tokenAddress.length >= 1) {
      setTokenLoading(true)
      const fetchToken = async () => {
        const { symbol: querySymbol } = parsePairInput(tokenAddress)
        try {
          const res = await fetch(`${JUPITER_TOKEN_API}/search?query=${encodeURIComponent(querySymbol)}&limit=1`)
          const data = await res.json()
          if (data && data.length > 0) {
            const jupiterSymbol = data[0].symbol?.toUpperCase() || data[0].name?.toUpperCase()
            setTokenSymbol(jupiterSymbol || querySymbol.toUpperCase())
            setTokenPrice(data[0].usdPrice || null)
            setTokenError(null)
          } else {
            setTokenSymbol(null)
            setTokenPrice(null)
            setTokenError(`Token "${querySymbol}" not found on Jupiter`)
          }
        } catch {
          setTokenSymbol(null)
          setTokenPrice(null)
          setTokenError('Search failed')
        }
        setTokenLoading(false)
      }
      const debounce = setTimeout(fetchToken, 500)
      return () => clearTimeout(debounce)
    } else {
      setTokenSymbol(null)
      setTokenPrice(null)
    }
  }, [tokenAddress])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStatus('idle')
      setLocalError(null)
      setManualBootstrap(false)
      setAmount('10')
      setTradeType('Buy')
    }
  }, [open])

  const isTierConfigError = manualBootstrap || (opError?.includes('tier_config') && opError?.includes('3012')) || opError?.includes('initialize_tier_config');
  const isRiskConfigError = opError?.includes('risk_config') && opError?.includes('3012');


  const currentPrice = tokenPrice ?? solPrice?.price ?? 150

  const timeframes = ['1M', '5M', '15M', '1H', '4H']
  const slippageOptions = ['0.3%', '0.5%', '1%']

  const handleBootstrap = async () => {
    setStatus('loading')
    setLocalError(null)
    try {
      if (isTierConfigError) {
        await initializeTierConfig()
      } else if (isRiskConfigError) {
        await initializeRiskConfig()
      }
      setStatus('idle')
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bootstrap failed'
      setLocalError(errorMessage)
      setStatus('error')
    }
  }

  const handleExecuteTrade = async () => {
    if (!masterVault) return

    setStatus('loading')
    setLocalError(null)

    try {
      // Calculate amount in lamports
      let amountIn = 0
      if (amountType === 'percent') {
        const vaultBalanceLamports = masterVault.balance
          ? masterVault.balance * LAMPORTS_PER_SOL
          : 0
        amountIn = Math.floor((parseFloat(amount) / 100) * vaultBalanceLamports)
      } else {
        amountIn = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL)
      }

      if (amountIn <= 0) throw new Error('Invalid trade amount')

      const tokenIn = useCustomToken && tokenAddress ? tokenAddress : (tradeType === 'Buy' ? USDC_MINT : SOL_MINT)
      const tokenOut = useCustomToken && tokenAddress ? tokenAddress : (tradeType === 'Buy' ? SOL_MINT : USDC_MINT)

      if (!tokenIn || !tokenOut) {
        throw new Error('Please select a token to trade')
      }

      const params = {
        tokenIn,
        tokenOut,
        amountIn,
        minAmountOut: Math.floor(amountIn * 0.99), // 1% slippage hardcoded for simplicity in params
        oraclePrice: Math.floor(currentPrice * 1e6),
        tradeType: tradeType as 'Buy' | 'Sell'
      }

      await callTrade(params)

      setStatus('success')

      // Immediate refresh for on-chain state
      refetchAll()

      // Start polling for backend indexing (trade record, position state)
      const interval = setInterval(() => {
        refetchAll()
      }, 3000)

      // Clear interval after 15 seconds
      setTimeout(() => clearInterval(interval), 15000)

      setTimeout(() => {
        onClose()
        setStatus('idle')
      }, 2000)
    } catch (err: unknown) {
      console.error('Trade flow failed:', err)
      setStatus('error')
      const errorMessage =
        err instanceof Error ? err.message : 'Trade execution failed'
      setLocalError(errorMessage)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
          {/* BACKDROP */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className='relative z-[100] w-full max-w-[540px] max-h-[90vh] overflow-y-auto bg-[#071E1B] text-[#E8F6F3] rounded-2xl p-6 shadow-2xl border border-[#0D3B37] side'
          >
            {/* HEADER */}
            <div className='flex justify-between items-center mb-1'>
              <h2 className='text-[16px] font-[900] tracking-wide flex items-center gap-2'>
                <HiLightningBolt className='text-[#FE9A00]' size={18} />
                Call Trade{' '}
                {masterVault ? `(◎ ${masterVault.balance?.toFixed(2)})` : ''}
              </h2>

              <div className='flex items-center gap-3'>
                <Link
                  to={'https://t.me/ZephyrAssist'}
                  style={{ backgroundImage: `url("/images/support.svg")` }}
                  className='bg-center bg-cover h-3 w-3 block'
                ></Link>
                <button
                  onClick={onClose}
                  className='text-[#7DAAA4] hover:text-white'
                >
                  ✕
                </button>
              </div>
            </div>

            <div className='flex flex-col gap-2 mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl'>
              <p className='text-[11px] font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2'>
                <FiAlertTriangle /> Protocol Admin Controls
              </p>
              <p className='text-[10px] text-yellow-200/60'>
                If you see "TierConfig" errors, the protocol needs to be
                initialized.
              </p>
              <button
                onClick={() => setManualBootstrap(prev => !prev)}
                className='text-[10px] bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 py-1 px-2 rounded border border-yellow-500/30 transition-colors w-fit'
              >
                {manualBootstrap
                  ? 'Hide Initialization'
                  : 'Show Initialization Buttons'}
              </button>
            </div>

            {/* CHART + TOGGLER */}
            <div className='bg-[#0A2B27] rounded-xl p-4 mb-4'>
              <div className='flex justify-between items-center mb-3'>
                <span className='text-[12px] text-white font-[900]'>
                  {chartPair}{' '}
                  <span className='text-[#22C55E] font-[700]'>
                    ${currentPrice.toFixed(2)}
                  </span>
                </span>

                <div className='flex bg-[#062421] rounded-lg p-1'>
                  {timeframes.map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-2 py-1 text-[11px] rounded-md transition ${
                        timeframe === t
                          ? 'bg-[#11C5A3] text-black font-semibold'
                          : 'text-[#607572]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ BIGGER CHART */}
              {shouldShowChart ? (
                <SolanaChart pair={chartPair} interval={timeframe} />
              ) : (
                <div className='w-full h-40 flex items-center justify-center bg-[#0A2B27] rounded-lg'>
                  <span className='text-[#607572] text-[12px]'>Enter a valid token to view chart</span>
                </div>
              )}
            </div>

            <div className='flex justify-between items-center gap-5'>
              {/* TARGET TOKEN */}
              <div className='relative w-full '>
                <CiSearch className='absolute top-[40%] left-3 -translate-y-1/2 text-[#6B8F88] text-sm' />

                {useCustomToken ? (
                  <>
                    <input
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      placeholder='BONK, BONK/USDC, WIF/SOL...'
                      className='w-full bg-[#0a1414] border border-[#123F3A] pl-10 pr-3 py-3 rounded-xl mb-3 text-[13px] outline-none text-[#E8F6F3] font-mono text-[10px]'
                    />
                    {tokenLoading && (
                      <span className='text-[10px] text-[#11C5A3] flex items-center gap-1'>
                        <FiLoader className='animate-spin' size={10} />
                        Searching...
                      </span>
                    )}
                    {tokenError && (
                      <span className='text-[10px] text-red-400'>{tokenError}</span>
                    )}
                    {tokenSymbol && !tokenLoading && !tokenError && (
                      <span className='text-[10px] text-[#11C5A3]'>Chart: {chartPair}</span>
                    )}
                    <button
                      onClick={() => {
                        setUseCustomToken(false)
                        setTokenAddress('')
                        setTokenSymbol(null)
                      }}
                      className='text-[10px] text-[#607572] hover:text-white'
                    >
                      ← Back to SOL
                    </button>
                  </>
                ) : (
                  <input
                    readOnly
                    value='Solana (SOL)'
                    className='w-full bg-[#0a1414] border border-[#123F3A] pl-10 pr-3 py-3 rounded-2xl mb-3 text-[13px] outline-none text-[#E8F6F3]'
                  />
                )}
                {!useCustomToken && (
                  <button
                    onClick={() => setUseCustomToken(true)}
                    className='text-[10px] text-[#11C5A3] hover:text-white'
                  >
                    + Search token
                  </button>
                )}
              </div>
              {/* DIRECTION */}
              <button
                onClick={() =>
                  setTradeType(t => (t === 'Buy' ? 'Sell' : 'Buy'))
                }
                className={`w-full ${
                  tradeType === 'Buy'
                    ? 'bg-dir text-[#00C896] border-dirborder'
                    : 'bg-red-900/20 text-red-500 border-red-500/30'
                } border py-3 rounded-2xl mb-4 font-medium transition-colors`}
              >
                <span className='text-[13px] font-[900] flex items-center justify-center gap-2'>
                  <HiLightningBolt size={16} />
                  {tradeType.toUpperCase()}
                </span>
              </button>
            </div>

            {/* TRADE SIZE */}
            <div className='mb-4 flex flex-col gap-1'>
              <div className='w-full flex justify-between items-center'>
                <span className='font-[900] text-[10px] text-[#50706c]'>
                  Trade Size
                </span>

                <div className='flex bg-[#062421] p-1 rounded-lg w-fit mb-2'>
                  <button
                    onClick={() => setAmountType('percent')}
                    className={`px-3 py-1 text-[9px] font-[900] rounded-md ${
                      amountType === 'percent'
                        ? 'bg-[#11C5A3] text-white'
                        : 'text-[#50706c]'
                    }`}
                  >
                    % OF VAULT
                  </button>
                  <button
                    onClick={() => setAmountType('fixed')}
                    className={`px-3 py-1 text-[9px] font-[900]  rounded-md ${
                      amountType === 'fixed'
                        ? 'bg-[#11C5A3] text-white'
                        : 'text-[#50706c]'
                    }`}
                  >
                    FIXED AMOUNT
                  </button>
                </div>
              </div>

              <div className='w-full relative'>
                <span className='absolute top-[38%] right-2 text-[14px] font-[900] text-[#3b4343]'>
                  {amountType.toUpperCase()}
                </span>
                <input
                  type='number'
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className='w-full bg-[#062421] font-[900] border border-[#123F3A] p-3 rounded-lg text-[20px] outline-none'
                />
              </div>
            </div>

            {/* SLIPPAGE */}
            <div className='mb-4'>
              <p className='text-[10px] leading-[15px] text-[#607572] mb-2 font-[900] uppercase tracking-[1px]'>
                Slippage Tolerance
              </p>

              <div className='flex gap-2 '>
                {slippageOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={`px-3 py-4 rounded-2xl text-[11px] w-[23%] border border-sliborder ${
                      slippage === s
                        ? 'bg-sli text-white '
                        : 'bg-[#102221] text-[#6B8F88]'
                    }`}
                  >
                    {s}
                  </button>
                ))}

                <input
                  placeholder='Custom'
                  className='bg-[#0a1414] border border-[#123F3A] px-3 py-4 rounded-2xl text-[11px] w-[40%] outline-none'
                />
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {(localError || opError) && (
              <div className='bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-start gap-2 mb-4'>
                <FiAlertTriangle
                  className='text-red-500 shrink-0 mt-0.5'
                  size={14}
                />
                <p className='text-[11px] text-red-200 leading-tight'>
                  {localError || opError}
                </p>
              </div>
            )}

            {/* COPIER IMPACT */}
            <div className='mt-4'>
              <button
                onClick={() => setShowImpact(!showImpact)}
                className='w-full flex justify-between items-center p-3 rounded-lg text-[13px]'
              >
                <span className='flex items-center gap-2 text-[12px] font-[900] text-white leading-[18px] uppercase tracking-[1.2px]'>
                  <HiOutlineUsers className='text-[#00C896] ' />
                  Copier Impact
                </span>

                <div className='flex items-center gap-4'>
                  <span className='text-[#607572] text-[10px] font-[700] leading-[15px]'>
                    {copierCount} COPIERS
                  </span>
                  <span className='text-[#607572] text-[10px] font-[700]'>
                    ${totalAumUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} AUM
                  </span>
                  <BsChevronDown
                    className={`transition ${showImpact ? 'rotate-180' : ''}`}
                    size={16}
                  />
                </div>
              </button>

              <AnimatePresence>
                {showImpact && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className='overflow-hidden'
                  >
                    <div className='bg-[#062421] p-3 mt-2 rounded-lg text-[11px] space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-[#546462] text-[11px] font-[700]'>
                          Liquidity Depth
                        </span>
                        <span className='text-[#22C55E] text-[11px] font-[900]'>
                          EXCELLENT
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-[#546462] text-[11px] font-[700]'>
                          Estimated Impact
                        </span>
                        <span className='text-white text-[11px] font-[900]'>
                          &lt;0.01%
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-[#546462] text-[11px] font-[700]'>
                          Execution Priority
                        </span>
                        <span className='text-white text-[11px] font-[900]'>
                          HIGH
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BOOTSTRAP BUTTON */}
            {(isTierConfigError || isRiskConfigError) && (
              <button
                onClick={handleBootstrap}
                className='mb-4 w-full bg-[#d4a800] text-black font-[900] py-3 rounded-xl shadow-[0_0_20px_rgba(212,168,0,0.35)] hover:brightness-110 transition-all text-[12px] tracking-[1px]'
              >
                BOOTSTRAP PROGRAM {isTierConfigError ? 'TIERS' : 'RISK'}{' '}
                (ONE-TIME)
              </button>
            )}

            {/* BUTTON */}
            <button
              disabled={status === 'loading' || !masterVault}
              onClick={handleExecuteTrade}
              className={`mt-4 w-full py-3 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all font-semibold
                ${
                  status === 'loading'
                    ? 'bg-orange-900/50 cursor-not-allowed text-orange-200'
                    : status === 'success'
                    ? 'bg-green-500 text-black'
                    : 'bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-black hover:brightness-110'
                }`}
            >
              <span className='flex items-center justify-center gap-2'>
                {status === 'loading' ? (
                  'EXECUTING TRADE...'
                ) : status === 'success' ? (
                  'TRADE SUCCESSFUL!'
                ) : (
                  <>
                    <HiOutlineLightningBolt size={16} />
                    EXECUTE {tradeType.toUpperCase()} CALL
                  </>
                )}
              </span>
            </button>

            <div className='text-[10px] text-[#6B8F88] mt-3 text-center font-[900] flex justify-center items-center'>
              <div className='w-[60%] flex justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-[#2f4441] '>Estimated Gas: </span>
                  <span className='text-[#808080]'>0.0004 SOL</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-[#2f4441]'>Execution:</span>
                  <span className='text-[#808080]'>Immediate</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CallTradeModal
