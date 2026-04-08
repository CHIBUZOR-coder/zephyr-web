import { useEffect, useState, useCallback } from 'react'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import { fmt, fmtSol } from '../../../../../utils/currencyHelpers'
import type { PinnedVault, Strategy } from './portfolio.types'
import { PositionState } from '../../../../master/useUserVaults'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

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
  // solPrice,
  onViewVault
}: MasterModeProps) => {
  const { setDepositOpen, setWithdrawOpen, stopCopyConfirm, setSelectedVaultPda, openVaultFlow, setClaimFeesOpen } =
    useGeneralContext()
  const [id] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const handleViewVault = (vault: PinnedVault) => {
    const traderData = {
      id: parseInt(vault.id) || 0,
      rank: 0,
      name: vault.name,
      // Pass the actual avatar URL from the vault or a fallback
      image: vault.tier === 'TIER 3' ? '/images/master_avatar_v3.png' : '/images/badgechek.svg',
      tag: vault.tier,
      tiers: vault.tier,
      type: vault.tier,
      pnl: 'N/A', 
      aum: fmt(vault.totalBalanceUsd),
      winRate: 'N/A',
      drawdown: 'N/A',
      trades: 0,
      copiers: vault.connectedCopiers,
      rio: 0,
      follows: vault.connectedCopiers,
      sol: vault.totalBalanceSol.toString(),
      vaultAddress: vault.fullAddress
    }
    openVaultFlow(1, traderData)
  }

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
          className='flex flex-col gap-8 overflow-x-auto mb-6 cursor-pointer hover:opacity-95 transition-opacity'
          onClick={() => onViewVault?.(vault.fullAddress)}
        >
          <div className='bg-[#102221] border-2 border-[#009883] rounded-2xl p-6'>
            <div className='flex gap-4 flex-col lg:flex-row mb-6'>
              <div className='flex justify-center items-center'>
                <div className='p-3 bg-[#0a1414] rounded-2xl flex justify-center items-center w-[60px] h-[60px]'>
                  {/* Dynamic Avatar */}
                  <img
                    src={vault.tier === 'TIER 3' ? '/images/master_avatar_v3.png' : '/images/badgechek.svg'}
                    alt="Master Vault"
                    className='w-[32px] h-[32px] rounded-full object-cover'
                  />
                </div>
              </div>

              <div className='flex-1 flex flex-col lg:flex-row justify-between gap-6'>
                <div className='flex flex-col md:flex-row lg:items-center gap-8 flex-1'>
                  <div className='bg-[#0a1414] justify-center rounded-lg flex items-center gap-2 w-fit px-3 py-1.5'>
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
                        onClick={(e) => { e.stopPropagation(); handleCopy(vault.fullAddress) }}
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

                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-[10px] text-[#2c4041] font-[900] uppercase'>
                        Last Execution
                      </span>
                      <span className='text-[10px] text-[#B0E4DD] font-[900] uppercase'>
                        {vault.lastExecution}
                      </span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span
                        className='h-[12px] w-[12px] bg-center bg-cover'
                        style={{ backgroundImage: `url("/images/time.svg")` }}
                      ></span>
                      <p className='text-[10px] font-[900] text-[#B0E4DD] uppercase '>
                        Real-time <span>Execution</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3 w-full lg:w-auto'>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewVault(vault)}}
                    className='flex-1 lg:flex-none px-6 py-2.5 bg-[#0a1414] border border-[#1e3530] rounded-xl text-[#009883] text-[11px] font-[900] uppercase tracking-wider hover:border-[#009883]/40 transition flex items-center gap-2'
                  >
                    <span className='text-[14px]'>📊</span> Explore Performance
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenWithdraw(vault.fullAddress)}}
                    className='flex-1 lg:flex-none px-6 py-2.5 bg-[#0a1414] border border-[#1e3530] rounded-xl text-[#6b8c8a] text-[11px] font-[900] uppercase tracking-wider hover:border-[#009883]/40 transition'
                  >
                    Withdraw SOL
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenDeposit(vault.fullAddress)}}
                    className='flex-1 lg:flex-none px-6 py-2.5 bg-[#009883] rounded-xl text-white text-[11px] font-[900] uppercase tracking-wider shadow-[0_0_20px_rgba(0,152,131,0.3)] hover:brightness-110 transition'
                  >
                    Deposit SOL
                  </button>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-6 border-t border-[#1a3530]'>
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
                      {(vault.currentPosition.size / LAMPORTS_PER_SOL).toFixed(
                        4
                      )}{' '}
                      SOL
                    </p>
                    <p className='text-[10px] text-[#00ffa3] font-bold uppercase'>
                      Entry:{' '}
                      {(vault.currentPosition.entryPrice / 1e6).toFixed(2)} USD
                    </p>
                  </>
                ) : (
                  <p className='text-[16px] text-white font-bold tracking-tight'>0</p>
                )}
              </div>

              <div>
                <p className='text-[9px] text-[#2c4041] font-[900] uppercase tracking-widest mb-1.5'>
                  Available Fees
                </p>
                <p className='text-[16px] text-[#FE9A00] font-bold tracking-tight'>
                  {fmtSol(vault.availableFeesSol)}
                </p>
                <p className='text-[10px] text-[#3c5250] font-bold'>
                  Claimable Now
                </p>
              </div>

              <div className='hidden md:block'>
                <p className='text-[9px] text-[#2c4041] font-[900] uppercase tracking-widest mb-1.5'>
                  Historical Claimed
                </p>
                <p className='text-[16px] text-white font-bold tracking-tight'>
                  {fmtSol(vault.historicalClaimedSol)}
                </p>
              </div>

              <div className='col-span-2 md:col-span-1 flex items-center justify-end md:justify-start lg:justify-end'>
                <div className='bg-[#0a1414] border border-[#1e3530] rounded-xl px-4 py-2 flex flex-col items-center gap-1 min-w-[120px]'>
                  <span className='text-[8px] text-[#009883] font-[900] uppercase tracking-widest'>
                    Current Rank
                  </span>
                  <span className='text-[10px] text-white font-[900] uppercase text-center'>
                    {vault.tier}
                  </span>
                </div>
              </div>
            </div>
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
              onClick={(e) => { e.stopPropagation(); handleOpenClaimFees(vault.fullAddress)}}
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
    </div>
  )
}

export default MasterMode
