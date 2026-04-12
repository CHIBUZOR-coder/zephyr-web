import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import type { PinnedVault, Strategy } from './portfolio.types'
import { fmt, fmtCompactCurrency } from '../../../../../utils/currencyHelpers'
import MasterMode from './MasterMode'
import { useTradingModeStore } from '../../../useTradingModeStore'
import { useWallet } from '@solana/wallet-adapter-react'
import CopierMode from './CopierMode'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import { useUserVaults } from '../../../../master/useUserVaults'
import { useSolPrice } from '../../../../../core/hooks/usePrice'
import { AllVaultsActivity } from './VaultActivity'

// ─── Helpers

function formatAddress (address: string) {
  if (!address) return 'N/A'
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

function formatRelativeDate (dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'JUST NOW'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M AGO`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H AGO`
  return `${Math.floor(diffInSeconds / 86400)}D AGO`
}

// ─── Add Strategy Modal

interface AddModalProps {
  onClose: () => void
  onAdd: (s: Strategy) => void
}
export interface VaultActivityItem {
  id: string
  type: string
  time: string
  token: string
  amount: string
  status: 'success'
  tx: string
  signature: string
}

function AddStrategyModal ({ onClose, onAdd }: AddModalProps) {
  const [form, setForm] = useState({
    name: '',
    walletSnippet: '',
    fullAddress: '',
    balanceSol: '',
    balanceUsd: '',
    unrealizedPnlUsd: '',
    unrealizedPnlPct: '',
    tp: '',
    sl: '',
    lastActivityLabel: 'JUST NOW'
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const s: Strategy = {
      id: Date.now().toString(),
      name: form.name || 'NEW VAULT',
      walletSnippet: form.walletSnippet || 'xxx...xxx',
      fullAddress: form.fullAddress || '',
      balanceSol: parseFloat(form.balanceSol) || 0,
      balanceUsd: parseFloat(form.balanceUsd) || 0,
      unrealizedPnlUsd: parseFloat(form.unrealizedPnlUsd) || 0,
      unrealizedPnlPct: parseFloat(form.unrealizedPnlPct) || 0,
      riskRules: { tp: parseFloat(form.tp) || 0, sl: parseFloat(form.sl) || 0 },
      lastActivityLabel: form.lastActivityLabel || 'JUST NOW'
    }
    onAdd(s)
    onClose()
  }

  const fields = [
    { label: 'Vault Name', key: 'name', placeholder: 'e.g. MOONSEEKER VAULT' },
    {
      label: 'Wallet Snippet',
      key: 'walletSnippet',
      placeholder: 'e.g. 4Xb...9qR'
    },
    { label: 'Balance (SOL)', key: 'balanceSol', placeholder: 'e.g. 25.50' },
    { label: 'Balance (USD)', key: 'balanceUsd', placeholder: 'e.g. 3620.00' },
    {
      label: 'Unrealized PnL (USD)',
      key: 'unrealizedPnlUsd',
      placeholder: 'e.g. -45.00'
    },
    {
      label: 'Unrealized PnL (%)',
      key: 'unrealizedPnlPct',
      placeholder: 'e.g. -1.2'
    },
    { label: 'Take-Profit (%)', key: 'tp', placeholder: 'e.g. 20' },
    { label: 'Stop-Loss (%)', key: 'sl', placeholder: 'e.g. 5' },
    {
      label: 'Last Activity',
      key: 'lastActivityLabel',
      placeholder: 'e.g. 3H AGO'
    }
  ]

  return (
    <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 '>
      <div className='bg-[#0e1821] border border-[#1e2d3d] rounded-2xl p-8 w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl'>
        <div className='flex justify-between items-center mb-7'>
          <span className='text-[13px] font-extrabold tracking-[0.15em] text-white'>
            DEPLOY NEW STRATEGY VAULT
          </span>
          <button
            onClick={onClose}
            className='text-[#4a5a6a] hover:text-white transition-colors bg-transparent border-none text-xl leading-none cursor-pointer'
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-2 gap-x-5 gap-y-5 mb-7'>
            {fields.map(({ label, key, placeholder }) => (
              <label key={key} className='flex flex-col gap-2'>
                <span className='text-[10px] text-[#4a5a6a] tracking-[0.15em] uppercase font-bold'>
                  {label}
                </span>
                <input
                  className='bg-[#080f16] border border-[#1a2a3a] rounded-lg text-[#c8d8e8] font-mono text-xs px-3 py-2.5 outline-none focus:border-[#00ffa3]/60 transition-colors placeholder:text-[#2a3a4a]'
                  value={(form as Record<string, string>)[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                />
              </label>
            ))}
          </div>

          <div className='flex justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='border border-[#1e2d3d] text-[#6b7a8d] rounded-lg px-6 py-2.5 text-[11px] font-bold tracking-[0.12em] cursor-pointer hover:border-[#2e3d4d] hover:text-[#9aabbc] transition-colors bg-transparent font-mono'
            >
              CANCEL
            </button>
            <button
              type='submit'
              className='bg-[#00ffa3] text-[#050e15] rounded-lg px-6 py-2.5 text-[11px] font-extrabold tracking-[0.12em] cursor-pointer hover:bg-[#00e692] transition-colors font-mono'
            >
              DEPLOY VAULT
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Portfolio

export default function Portfolio () {
  const { connected, publicKey } = useWallet()
  const { setWalletModal } = useGeneralContext()
  const { masterMode } = useTradingModeStore()

  const { masterVault, copierVaults, isLoading, refetchAll } = useUserVaults()
  const { data: solPrice } = useSolPrice()
  const [activeTab, setActiveTab] = useState<'vaults' | 'activity'>('vaults')
  const [showModal, setShowModal] = useState(false)
  const lastWalletState = useRef<string | null>(null)

  const currentPrice = solPrice?.price ?? 79

  // ─── Handle viewing a vault (same as "View Vault" button) ───
  const handleViewVault = useCallback(async () => {
    try {
      // Trigger the same refetch as the "View Vault" button does
      await refetchAll()
      // The data will populate in pinnedVaults/strategies automatically
    } catch (error) {
      console.error('Failed to load vault details:', error)
    }
  }, [refetchAll])

  // Force refetch when wallet connects/disconnects
  useEffect(() => {
    const currentWalletState = publicKey?.toBase58() || 'disconnected'

    if (lastWalletState.current !== currentWalletState) {
      lastWalletState.current = currentWalletState
      if (connected && publicKey) {
        refetchAll()
      }
    }
  }, [connected, publicKey, refetchAll])

  // Periodic refetch every 30 seconds to ensure data stays fresh
  useEffect(() => {
    if (!connected) return

    const interval = setInterval(() => {
      refetchAll()
    }, 30000)

    return () => clearInterval(interval)
  }, [connected, refetchAll])
  // Map MasterVault to PinnedVault format
  const pinnedVaults: PinnedVault[] = useMemo(() => {
    if (!masterVault) return []
    return [
      {
        id: masterVault.id,
        name: 'MY MASTER VAULT',
        walletSnippet: formatAddress(masterVault.vaultPda),
        fullAddress: masterVault.vaultPda,
        connectedCopiers: masterVault._count?.copierVaults || 0,
        lastExecution: formatRelativeDate(masterVault.updatedAt),
        totalBalanceSol: masterVault.balance || 0,
        totalBalanceUsd: (masterVault.balance || 0) * currentPrice,
        activePositions: 0,
        stopLoss: null,
        takeProfit: null,
        availableFeesSol: parseFloat(masterVault.totalFeesEarned) / 1e9,
        historicalClaimedSol: 0,
        currentPosition: undefined,
        tier: `TIER ${masterVault.currentTier}`
      }
    ]
  }, [masterVault, currentPrice])

  // Map CopierVaults to Strategy format
  const strategies: Strategy[] = useMemo(() => {
    if (!copierVaults) return []
    return copierVaults.map(v => ({
      id: v.id,
      name: 'COPY VAULT',
      walletSnippet: formatAddress(v.vaultPda),
      fullAddress: v.vaultPda,
      masterVaultAddress: v.masterExecutionVaultPda,
      balanceSol: v.actualBalance || 0,
      balanceUsd: (v.actualBalance || 0) * currentPrice,
      unrealizedPnlUsd: 0,
      unrealizedPnlPct: 0,
      riskRules: { tp: 0, sl: 0 },
      lastActivityLabel: formatRelativeDate(v.updatedAt)
    }))
  }, [copierVaults, currentPrice])

  const totalBalance =
    strategies.reduce((s, v) => s + v.balanceUsd, 0) +
    (pinnedVaults[0]?.totalBalanceUsd || 0)
  const total24hChange = 0
  const changePositive = total24hChange >= 0

  const stats = [
    {
      tittle: 'Total Balance',
      icon: '/images/balance.svg',
      value: totalBalance,
      type: 'currency'
    },
    {
      tittle: '24h Change',
      icon: '/images/change.svg',
      value: total24hChange,
      type: 'currency',
      positive: changePositive
    },
    {
      tittle: 'Total Vaults',
      icon: '/images/total.svg',
      value: strategies.length + pinnedVaults.length,
      type: 'number'
    },
    {
      tittle: 'Claimable Fees',
      value: pinnedVaults[0]?.availableFeesSol || 0,
      type: 'currency'
    },
    {
      tittle: 'Total AUM',
      icon: '/images/totalAum.svg',
      value: 0,
      type: 'compactCurrency'
    }
  ]

  // const activities = []

  if (isLoading && connected) {
    return (
      <div className='flex items-center justify-center h-full min-h-[400px] text-[#00ffa3] font-mono uppercase tracking-[0.2em]'>
        <div className='animate-pulse'>Fetching Real-time Vault Data...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen   '>
      {/* ── Header ── */}
      <header className='flex  flex-col lg:flex-row bg-[#091114] justify-between items-center px-2 lg:px-10 py-7 border-b border-[#111d27] gap-4 lg:gap-0'>
        {/* Left: title */}
        <div className='w-full lg:w-auto'>
          <p className='text-[30px] font-[900]  text-white  m-0'>PORTFOLIO</p>
          <p className='text-[13px] font-[500] text-[#5c7a78] tracking-wide mt-1 m-0'>
            Financial control center for non-custodial assets.
          </p>
        </div>

        {/* Right: stats */}
        <div className='flex items-center gap-10 flex-wrap lg:flex-nowrap  justify-between px-2'>
          {stats &&
            stats.map((item, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${
                  (!masterMode && item.tittle === 'Total AUM') ||
                  (!masterMode && item.tittle === 'Claimable Fees')
                    ? 'hidden'
                    : ''
                }`}
              >
                <div className='flex items-center gap-1'>
                  <span
                    className='bg-center bg-cover h-[12px] w-[12px]'
                    style={{ backgroundImage: `url(${item.icon})` }}
                  ></span>
                  <span className='text-[10px] text-[#2e4041] font-[900] uppercase flex items-center gap-1'>
                    {item.tittle}
                  </span>
                </div>

                {!connected ? (
                  <span
                    className={`text-[22px] font-bold ${
                      item.tittle === '24h Change'
                        ? 'text-[#00C0A8]'
                        : item.tittle === 'Claimable Fees'
                        ? 'text-[#FE9A00]'
                        : 'text-white'
                    } tracking-tight`}
                  >
                    $0
                  </span>
                ) : (
                  <span
                    className={`text-[22px] font-bold ${
                      item.tittle === '24h Change'
                        ? 'text-[#00C0A8]'
                        : item.tittle === 'Claimable Fees'
                        ? 'text-[#FE9A00]'
                        : 'text-white'
                    } tracking-tight`}
                  >
                    {item.type === 'compactCurrency'
                      ? fmtCompactCurrency(item.value)
                      : item.type === 'currency'
                      ? item.tittle === 'Claimable Fees'
                        ? `◎ ${item.value.toFixed(4)}`
                        : fmt(item.value)
                      : item.value}
                  </span>
                )}
              </div>
            ))}
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div className='flex justify-between items-center lg:px-10 md:px-5 px-3 border-b border-[#111d27] '>
        <div className='flex w-[75%] lg:w-1/2 gap-6'>
          {(['vaults', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 lg:px-5 pt-4 pb-3 text-[7px] md:text-[11px] font-[700] md:font-[900] tracking-[0.14em] border-b-2 transition-all cursor-pointer w-full    ${
                activeTab === tab
                  ? 'text-white border-[#00ffa3]'
                  : 'text-[#273634] border-transparent hover:text-[#7a9ab0]'
              }`}
            >
              {tab === 'vaults' ? 'MY STRATEGY VAULTS' : 'VAULT ACTIVITY'}
            </button>
          ))}
        </div>
        <span className='text-[5px] text-center lg:text-start md:text-[11px] text-[#273634] uppercase font-[700] md:font-[900]'>
          SYNC STATUS:
          <span className='text-[#00ffa3] font-[900]  '>LIVE INDEXER</span>
        </span>
      </div>

      {/* ── Content ── */}
      <main className='lg:px-10 px-2 md:px-4 py-5 flex flex-col gap-3  '>
        {/* PINNED VAULTS */}
        {activeTab === 'vaults' ? (
          <>
            {connected ? (
              <>
                {masterMode ? (
                  <MasterMode
                    activeTab={activeTab}
                    pinnedVaults={pinnedVaults}
                    strategies={strategies}
                    removeStrategy={() => {}}
                    setShowModal={setShowModal}
                    solPrice={currentPrice}
                    onViewVault={handleViewVault}
                  />
                ) : (
                  <CopierMode
                    activeTab={activeTab}
                    strategies={strategies}
                    removeStrategy={() => {}}
                    setShowModal={setShowModal}
                    onViewVault={handleViewVault}
                  />
                )}
              </>
            ) : (
              <>
                <div className='w-full rounded-2xl p-10 md:p-16 bg-[#102221]  border border-teal-900/40 flex flex-col items-center justify-center text-center space-y-6'>
                  <div className='h-[72px] w-[72px] rounded-full bg-teal-500/10 flex items-center justify-center'>
                    <span
                      className='h-[32px] w-[32px] bg-center bg-cover'
                      style={{
                        backgroundImage: `url("/images/wallet.svg")`
                      }}
                    ></span>
                  </div>
                  <h2 className='text-lg md:text-xl font-bold text-white tracking-wide uppercase '>
                    Wallet not Connected
                  </h2>
                  <p className='text-sm text-[#B0E4DD80] max-w-md leading-relaxed'>
                    Connect your wallet to unlock your vaults, track your
                    trades, and manage your copy positions. Non-custodial.
                    Always yours.
                  </p>
                  <button
                    onClick={() => setWalletModal(true)}
                    className='px-8 py-3 bg-teal-500 hover:bg-teal-600 rounded-xl font-semibold text-sm transition shadow-[0_0_25px_rgba(20,184,166,0.35)]'
                  >
                    CONNECT WALLET
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <AllVaultsActivity
            masterVaultPda={masterVault?.vaultPda}
            copierVaultsPdas={copierVaults?.map(v => v.vaultPda) ?? []}
          />
        )}

        <div className='flex justify-center gap-3 items-center flex-col md:flex-row mt-10'>
          <div
            className='h-[14px] w-[14px] bg-center bg-cover shrink-0'
            style={{
              backgroundImage: `url("/images/badgechek.svg")`
            }}
          />
          <p className='text-[#46514f] font-[900] text-[8px] leading-[15px] tracking-[3px] uppercase lg:mb-0'>
            All assets remain in your control via Vault PDAs • No counterparty
            risk • Verify on Solscan
          </p>
        </div>
      </main>

      {/* ── Add Strategy Modal ── */}
      {showModal && (
        <AddStrategyModal
          onClose={() => setShowModal(false)}
          onAdd={() => {}}
        />
      )}
    </div>
  )
}
