import { useEffect, useState, useCallback } from 'react'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import { fmt, fmtSol } from '../../../../../utils/currencyHelpers'
import type { PinnedVault, Strategy } from './portfolio.types'
import { PositionState } from '../../../../master/useUserVaults'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import EditRiskModal from '../../../../../shared/Modals/EditRiskModal/EditRiskModal'
import { useAuthStore } from '../../../../auth/auth.store'

interface MasterModeProps {
  pinnedVaults: PinnedVault[]
  activeTab: string
  strategies: Strategy[]
  removeStrategy: (id: string) => void
  setShowModal: (show: boolean) => void
  solPrice: number
  onViewVault?: (vaultPda: string) => void
}

const MasterMode = ({
  pinnedVaults,
  removeStrategy,
  strategies,
  // solPrice,
  onViewVault
}: MasterModeProps) => {
  const {
    setDepositOpen,
    setWithdrawOpen,
    stopCopyConfirm,
    setSelectedVaultPda,
    // openVaultFlow,
    setOpenStopModal,
    setClaimFeesOpen,
    setEditRiskvisible
  } = useGeneralContext()

  const [id] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user } = useAuthStore()
  useEffect(() => {
    if (stopCopyConfirm) {
      removeStrategy(id)
    }
  }, [stopCopyConfirm, id, removeStrategy])

  const handleOpenDeposit = (vaultPda: string) => {
    setSelectedVaultPda(vaultPda)
    setDepositOpen(true)
  }

  const handleOpenWithdraw = (vaultPda: string) => {
    setSelectedVaultPda(vaultPda)
    setWithdrawOpen(true)
  }

  const handleOpenClaimFees = (vaultPda: string) => {
    setSelectedVaultPda(vaultPda)
    setClaimFeesOpen(true)
  }

  const parameters = [
    {
      title: 'Total Volume',
      val: 0
    },
    {
      title: 'Realized Profit',
      val: 0
    },
    {
      title: 'AUM',
      val: 0
    },
    {
      title: 'Copiers Retention',
      val: 0
    }
  ]

  // const handleViewVault = (vault: PinnedVault) => {
  //   const formatCompact = (num: number): string => {
  //     if (Math.abs(num) >= 1_000_000_000)
  //       return `${(num / 1_000_000_000).toFixed(1)}B`
  //     if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  //     if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  //     return num.toFixed(0)
  //   }
  //   const traderData = {
  //     id: parseInt(vault.id) || 0,
  //     rank: 0,
  //     name: vault.name,
  //     // Pass the actual avatar URL from the vault or a fallback
  //     image:
  //       vault.tier === 'TIER 3'
  //         ? '/images/master_avatar_v3.png'
  //         : '/images/badgechek.svg',
  //     tag: vault.tier,
  //     tiers: vault.tier,
  //     type: vault.tier,
  //     pnl: 'N/A',
  //     aum: fmt(vault.totalBalanceUsd),
  //     winRate: 'N/A',
  //     drawdown: 'N/A',
  //     trades: 0,
  //     copiers: vault.connectedCopiers,
  //     rio: 0,
  //     follows: vault.connectedCopiers,
  //     followsDisplay: formatCompact(vault.connectedCopiers),
  //     sol: vault.totalBalanceSol.toString(),
  //     vaultAddress: vault.fullAddress
  //   }
  //   openVaultFlow(1, traderData)
  // }

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  if (pinnedVaults.length === 0) {
    return (
      <div className='mt-10 p-10 bg-[#102221] rounded-2xl border border-teal-900/40 text-center'>
        <p className='text-[#7c9b97] font-bold uppercase tracking-wider'>
          No Master Vault Found
        </p>
        <p className='text-sm text-[#B0E4DD80] mt-2'>
          Create a Master Vault to start trading and earning fees.
        </p>
      </div>
    )
  }

  return (
    <div className=''>
      <div className='flex items-center justify-between gap-3 mt-8 mb-3'>
        <div className='flex items-center gap-3'>
          <span
            className='bg-center bg-cover w-[20px] h-[20px] inline-block '
            style={{ backgroundImage: `url("/images/badgechek.svg")` }}
          ></span>
          <span className='text-[14px] text-white font-[900] leading-[20px] tracking-[4.2px] uppercase'>
            Master Vault
          </span>
        </div>
        <span className='text-[9px] font-[900] text-[#009883] uppercase'>
          Locked Index
        </span>
      </div>
      {pinnedVaults.map((vault, i) => (
        <div
          key={i}
          className='flex flex-col gap-8 overflow-x-auto mb-6 cursor-pointer hover:opacity-95 transition-opacity '
          onClick={() => onViewVault?.(vault?.fullAddress)}
        >
          <div
            className='bg-[#102221] border-2 border-[#009883] rounded-2xl p-6
'
          >
            <div className='flex gap-6 lg:gap-10 flex-col lg:flex-row mb-6 '>
              {/* Left */}
              <div className='flex gap-3 '>
                <div className='flex justify-center '>
                  <div className=' bg-[#0a1414] rounded-2xl flex justify-center items-center p-2 h-[50px] w-[50px] '>
                    {/* Dynamic Avatar */}
                    {/* <img
                      src={
                        vault.tier === 'TIER 3'
                          ? '/images/master_avatar_v3.png'
                          : '/images/badgechek.svg'
                      }
                      alt='Master Vault'
                      className='w-[32px] h-[32px] rounded-full object-cover'
                    /> */}

                    <span
                      style={{ backgroundImage: `url("${user?.avatar}")` }}
                      className='h-[32px] w-[32px] bg-center bg-cover inline-block'
                    ></span>
                  </div>
                </div>

                <div className='flex flex-col   gap-2 flex-1 '>
                  <div className='bg-[#0a1414] justify-center rounded-md flex items-center gap-2 w-fit px-2 py-[1px]'>
                    <span className='text-[#3c5250] text-[10px] font-mono font-bold'>
                      {vault.walletSnippet}
                    </span>
                    <div className='relative flex items-center'>
                      <span
                        className='h-[12px] w-[12px] bg-center bg-cover cursor-pointer hover:opacity-80 transition-opacity'
                        style={{
                          backgroundImage: `url("${
                            copiedId === vault.fullAddress
                              ? '/images/copycheck.svg'
                              : '/images/copy.svg'
                          }")`
                        }}
                        onClick={e => {
                          e.stopPropagation()
                          handleCopy(vault.fullAddress)
                        }}
                      ></span>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <span
                      className='h-[12px] w-[12px] bg-center bg-cover'
                      style={{ backgroundImage: `url("/images/totalAum.svg")` }}
                    ></span>
                    <p className='text-[10px] font-[900] text-[#009883] uppercase '>
                      {vault.connectedCopiers} <span>Connected Copiers</span>
                    </p>
                  </div>

                  <div className='flex gap-1'>
                    <span
                      className='h-[12px] w-[12px] bg-center bg-cover'
                      style={{ backgroundImage: `url("/images/time.svg")` }}
                    ></span>
                    <div className='flex items-center gap-2'>
                      <span className='text-[10px] text-[#2c4041] font-[900] uppercase'>
                        Last Execution
                      </span>
                      <span className='text-[10px] text-[#B0E4DD] font-[900] uppercase'>
                        {vault.lastExecution}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle */}
              <div className=''>
                <div className=' flex gap-3   border-[#1a3530] '>
                  <div>
                    <p className='text-[9px] text-[#2c4041] font-[900] uppercase tracking-widest mb-1.5'>
                      Vault Balance
                    </p>
                    <p className='text-[16px] text-white font-bold tracking-tight'>
                      {fmtSol(vault.totalBalanceSol)}
                    </p>
                    <p className='text-[10px] text-[#3c5250] font-bold'>
                      {fmt(vault.totalBalanceUsd)}
                    </p>
                  </div>

                  <div>
                    <p className='text-[9px] text-[#2c4041] font-[900] uppercase tracking-widest mb-1.5'>
                      Active Positions
                    </p>
                    {vault.currentPosition &&
                    typeof vault.currentPosition.state === 'string' &&
                    vault.currentPosition.state !== PositionState.Closed ? (
                      <>
                        <p className='text-[16px] text-white font-bold tracking-tight'>
                          {(
                            vault.currentPosition.size / LAMPORTS_PER_SOL
                          ).toFixed(4)}{' '}
                          SOL
                        </p>
                        <p className='text-[10px] text-[#00ffa3] font-bold uppercase'>
                          Entry:{' '}
                          {(vault.currentPosition.entryPrice / 1e6).toFixed(2)}{' '}
                          USD
                        </p>
                      </>
                    ) : (
                      <p className='text-[16px] text-white font-bold tracking-tight'>
                        0
                      </p>
                    )}
                  </div>

                  {/* <div className='flex gap3'>
                    <p className='text-[9px] text-[#2c4041] font-[900] uppercase tracking-widest mb-1.5'>
                      Available Fees
                    </p>
                    <p className='text-[16px] text-[#FE9A00] font-bold tracking-tight'>
                      {fmtSol(vault.availableFeesSol)}
                    </p>
                    <p className='text-[10px] text-[#3c5250] font-bold'>
                      Claimable Now
                    </p>
                  </div> */}

                  {/* <div className='hidden md:block'>
    <p className='text-[9px] text-[#2c4041] font-[900] uppercase tracking-widest mb-1.5'>
      Historical Claimed
    </p>
    <p className='text-[16px] text-white font-bold tracking-tight'>
      {fmtSol(vault.historicalClaimedSol)}
    </p>
  </div> */}

                  {/* <div className='col-span-2 md:col-span-1 flex items-center justify-end md:justify-start lg:justify-end'>
    <div className='bg-[#0a1414] border border-[#1e3530] rounded-xl px-4 py-2 flex flex-col items-center gap-1 min-w-[120px]'>
      <span className='text-[8px] text-[#009883] font-[900] uppercase tracking-widest'>
        Current Rank
      </span>
      <span className='text-[10px] text-white font-[900] uppercase text-center'>
        {vault.tier}
      </span>
    </div>
  </div> */}
                </div>
              </div>
              {/* Right */}
              <div className='flex-1 flex flex-col lg:flex-row justify-between gap-6'>
                <div className='flex items-center gap-3 w-full lg:w-auto'>
                  {/* <button
                    onClick={e => {
                      e.stopPropagation()
                      handleViewVault(vault)
                    }}
                    className='flex-1 lg:flex-none px-6 py-2.5 bg-[#0a1414] border border-[#1e3530] rounded-xl text-[#009883] text-[11px] font-[900] uppercase tracking-wider hover:border-[#009883]/40 transition flex items-center gap-2'
                  >
                    <span className='text-[14px]'>📊</span> Explore Performance
                  </button> */}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleOpenWithdraw(vault.fullAddress)
                    }}
                    className='border border-[#1f4d47] rounded-lg px-2 py-[5px] cursor-pointer hover:bg-[#1f4d47]/10 hover:border-[#1f4d47]/70 transition-colors bg-transparent flex items-center gap-1.5 text-[#009883] text-[10px] font-bold tracking-[0.1em]'
                  >
                    - Withdraw SOL
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleOpenDeposit(vault.fullAddress)
                    }}
                    className='border border-[#1f4d47] rounded-lg px-2 py-[5px] cursor-pointer hover:bg-[#1f4d47]/10 hover:border-[#1f4d47]/70 transition-colors bg-transparent flex items-center gap-1.5 text-[#009883] text-[10px] font-bold tracking-[0.1em]'
                  >
                    + Deposit SOL
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {parameters.map((item, i) => (
              <div
                key={i}
                className='rounded-lg p-4 flex flex-col gap-2 text-white bg-[#102221]'
              >
                <p className='text-[#345253] font-semibold text-sm'>{item?.title}</p>
                <p>{item?.val}</p>
              </div>
            ))}
          </div>
          <div className='flex justify-between items-center border rounded-xl p-5 bg-[#102221]'>
            <div>
              <p className='text-[#FE9A00] font-bold'>
                Earning Performance Fees
              </p>
              <p className='text-white text-[24px] font-[900]'>
                {fmtSol(vault.availableFeesSol)} SOL Available
              </p>
            </div>

            <button
              onClick={e => {
                e.stopPropagation()
                handleOpenClaimFees(vault.fullAddress)
              }}
              className='bg-[#FE9A00] shadow-[0_6px_12px_rgba(254,154,0,0.6)] lg:px-8 md:px-5 py-3 px-3 rounded-xl hover:brightness-110 transition flex items-center gap-2'
            >
              <span className='text-black font-[900] tracking-[0.15em]'>
                CLAIM PERFORMANCE FEES
              </span>
              <span
                className='bg-cover bg-center w-[20px] h-[20px]'
                style={{ backgroundImage: `url("/images/claim.svg")` }}
              />
            </button>
          </div>
        </div>
      ))}
      <div className='mt-10'>
        <div className='flex items-center gap-4'>
          <span
            className='h-[20px] w-[20px] bg-center bg-cover'
            style={{ backgroundImage: `url("/images/thunder.svg")` }}
          ></span>
          <p className='text-white text-[10px] md:text-[14px] font-[900] uppercase leading-5 tracking-[4.2px]'>
            Mirroring Vaults
          </p>
        </div>
      </div>

      <div className='flex flex-col gap-4 mt-5'>
        {strategies.length === 0 ? (
          <div className='p-10 bg-[#102221] rounded-xl border border-[#162030] text-center'>
            <p className='text-[#546462] font-bold uppercase tracking-widest text-[10px]'>
              No Active Copying Strategies
            </p>
            <p className='text-[#B0E4DD4D] text-xs mt-2'>
              Browse the leaderboard to find top traders to copy.
            </p>
          </div>
        ) : (
          strategies.map(strategy => {
            const pnlPos = strategy.unrealizedPnlUsd >= 0

            return (
              <div
                key={strategy.id}
                className='bg-[#102221] border border-[#162030] rounded-xl flex items-center justify-between overflow-hidden hover:border-[#1e3040] transition-colors p-4 cursor-pointer relative'
                onClick={() => onViewVault?.(strategy.fullAddress)}
              >
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setEditRiskvisible(true)
                  }}
                  className='  absolute top-2 right-3 border border-[#1f4d47] rounded-lg px-2 py-[5px] cursor-pointer hover:bg-[#1f4d47]/10 hover:border-[#1f4d47]/70 transition-colors bg-transparent flex items-center gap-1.5 text-[#009883] text-[10px] font-bold tracking-[0.1em]'
                >
                  <span className='text-[8px] font-[900] tracking-[0.1em] text-[#009883]'>
                    Edit Risk Parameters
                  </span>
                </button>
                <div className='flex gap-6 lg:gap-0 items-center justify-between py-5 w-full flex-col md:flex-row flex-wrap lg:flex-nowrap'>
                  <div className='flex items-center gap-2 min-w-[230px] md:min-w-[300px]'>
                    <div className='rounded-lg bg-[#0a1414] p-2 flex justify-center items-center'>
                      <img
                        src={'/images/thunder.svg'}
                        alt='Copy Vault'
                        className='w-[32px] h-[32px] rounded-full object-cover'
                      />
                    </div>
                    <div className='flex flex-col gap-4 '>
                      <p className='text-[14px] md:text-[18px]  font-[900] leading-[28px] tracking-[-0.45px] text-white  m-0 whitespace-pre-line'>
                        {strategy.name}
                      </p>

                      <div className='flex items-center gap-1 text-[10px] text-[#2e4050] tracking-[0.1em]'>
                        <svg
                          width='11'
                          height='11'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <circle cx='12' cy='12' r='10' />
                          <polyline points='12 6 12 12 16 14' />
                        </svg>
                        <span>LAST ACTIVITY: {strategy.lastActivityLabel}</span>
                      </div>

                      {strategy.masterVaultAddress && (
                        <div className='flex items-center gap-1 text-[10px] text-[#2e4050] tracking-[0.1em]'>
                          <span className='text-[#546462] font-bold'>
                            MIRRORING MASTER:
                          </span>
                          <div className='flex items-center gap-1.5 ml-1'>
                            <span className='text-[10px] text-[#7a9ab0]'>
                              {strategy.masterVaultAddress.slice(0, 4)}...
                              {strategy.masterVaultAddress.slice(-4)}
                            </span>
                            <span
                              onClick={e => {
                                e.stopPropagation()
                                handleCopy(strategy.masterVaultAddress!)
                              }}
                              className='h-[10px] w-[10px] inline-block bg-center bg-cover cursor-pointer hover:opacity-80'
                              style={{
                                backgroundImage: `url("${
                                  copiedId === strategy.masterVaultAddress
                                    ? '/images/copycheck.svg'
                                    : '/images/copy.svg'
                                }")`
                              }}
                            ></span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className='flex items-center gap-1.5 text-[#4a6070]'>
                      <div className=' bg-[#0a1414] border border-[#162030] px-2 py-0.5 rounded flex items-center gap-2 '>
                        <span className='text-[10px] text-[#7a9ab0] tracking-wide'>
                          {strategy.walletSnippet}
                        </span>
                        <span
                          onClick={e => {
                            e.stopPropagation()
                            handleCopy(strategy.fullAddress)
                          }}
                          className='h-[10px] w-[10px] inline-block bg-center bg-cover cursor-pointer hover:opacity-80'
                          style={{
                            backgroundImage: `url("${
                              copiedId === strategy.fullAddress
                                ? '/images/copycheck.svg'
                                : '/images/copy.svg'
                            }")`
                          }}
                        ></span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-start gap-10 '>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[9px] text-[#546462] tracking-[0.18em] uppercase font-[900] mb-0.5'>
                        BALANCE
                      </span>
                      <span className='md:text-[16px] text-[10px] font-[900] text-white tracking-wide'>
                        {fmtSol(strategy.balanceSol)} SOL
                      </span>
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[9px] text-[#546462] tracking-[0.18em] uppercase font-[900] mb-0.5'>
                        UNREALIZED PNL
                      </span>
                      <span
                        className={`md:text-[16px] text-[10px] font-[900] tracking-wide ${
                          pnlPos ? 'text-[#00c0a8]' : 'text-[#FA6938]'
                        }`}
                      >
                        {pnlPos ? '+' : ''}
                        {fmtSol(strategy.unrealizedPnlUsd)}
                      </span>
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-[9px] text-[#546462] tracking-[0.18em] uppercase font-[900] mb-0.5'>
                        RISK RULES
                      </span>
                      <span className='text-[16px] font-[900] text-white tracking-wide'>
                        TP: {strategy.riskRules.tp}%
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 '>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleOpenDeposit(strategy.fullAddress)
                      }}
                      className='border border-[#1f4d47] rounded-lg px-2 py-[5px] cursor-pointer hover:bg-[#1f4d47]/10 hover:border-[#1f4d47]/70 transition-colors bg-transparent flex items-center gap-1.5 text-[#009883] text-[10px] font-bold tracking-[0.1em]'
                    >
                      <span className='text-[8px] font-[900] tracking-[0.1em] text-[#009883]'>
                        DEPOSIT
                      </span>
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleOpenWithdraw(strategy.fullAddress)
                      }}
                      className='border border-[#1f4d47] rounded-lg px-2 py-[5px] cursor-pointer hover:bg-[#1f4d47]/10 hover:border-[#1f4d47]/70 transition-colors bg-transparent flex items-center gap-1.5 text-[#009883] text-[10px] font-bold tracking-[0.1em]'
                    >
                      <span className='text-[8px] font-[900] tracking-[0.1em] text-[#009883]'>
                        WITHDRAW
                      </span>
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setCopiedId(strategy.id)
                        setOpenStopModal(true)
                      }}
                      className='border bg-pad border-padborder rounded-lg px-2 py-[5px] cursor-pointer hover:bg-pad2 hover:border-padborde2 transition-colors flex items-center gap-1.5 tracking-[0.1em]'
                    >
                      <span className='text-[8px] font-[900] tracking-[0.1em] text-[#FA6938]'>
                        STOP COPY
                      </span>
                    </button>
                  </div>
                </div>
                <EditRiskModal />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MasterMode
