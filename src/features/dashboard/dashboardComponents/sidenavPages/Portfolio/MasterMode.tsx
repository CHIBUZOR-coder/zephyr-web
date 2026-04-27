import { useCallback, useState } from 'react'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import {
  fmt,
  fmtSol,
  fmtCompactCurrency
} from '../../../../../utils/currencyHelpers'
import type { PinnedVault, Strategy } from './portfolio.types'
import { PositionState } from '../../../../master/useUserVaults'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useAuthStore } from '../../../../auth/auth.store'
import { MirroringVaults } from './CopierMode'

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
  onViewVault
}: MasterModeProps) => {
  const {
    setDepositOpen,
    setWithdrawOpen,
    setSelectedVaultPda,
    setClaimFeesOpen
  } = useGeneralContext()

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user } = useAuthStore()

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
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between gap-3 mt-8 mb-1'>
        <div className='flex items-center gap-3'>
          <span
            className='bg-center bg-cover w-[20px] h-[20px] inline-block '
            style={{ backgroundImage: `url("/images/badgechek.svg")` }}
          ></span>
          <span className='text-[14px] text-white font-[900] leading-[20px] tracking-[4.2px] uppercase'>
            Master Vault
          </span>
        </div>
        <div className='flex items-center gap-4'>
          <span className='text-[9px] font-[900] text-[#009883] uppercase tracking-widest'>
            Status: <span className='text-[#00ffa3]'>Active</span>
          </span>
          <span className='text-[9px] font-[900] text-[#009883] uppercase'>
            Locked Index
          </span>
        </div>
      </div>

      {pinnedVaults.map((vault, i) => {
        return (
          <div key={i} className='flex flex-col gap-4'>
            <div
              className='bg-[#102221] border border-[#1a3530] hover:border-[#009883]/50 rounded-2xl p-6 transition-all cursor-pointer group'
              onClick={() => onViewVault?.(vault?.fullAddress)}
            >
              <div className='flex flex-col lg:flex-row items-center justify-between gap-6'>
                {/* Info Section */}
                <div className='flex items-center gap-4 min-w-[280px] w-full lg:w-auto'>
                  <div className='bg-[#0a1414] rounded-xl flex justify-center items-center p-2 h-[56px] w-[56px] border border-[#1a3530]'>
                    <img
                      src={
                        user?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${vault.fullAddress}`
                      }
                      alt='Avatar'
                      className='h-[36px] w-[36px] rounded-full object-cover'
                    />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <p className='text-white text-[16px] font-[900] tracking-tight uppercase'>
                      {vault.name}
                    </p>
                    <div className='flex items-center gap-2'>
                      <div className='bg-[#0a1414] border border-[#1a3530] px-2 py-0.5 rounded flex items-center gap-2'>
                        <span className='text-[#3c5250] text-[10px] font-mono font-bold'>
                          {vault.walletSnippet}
                        </span>
                        <span
                          className='h-[10px] w-[10px] bg-center bg-cover cursor-pointer hover:opacity-80'
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
                      <div className='flex items-center gap-1.5'>
                        <span
                          className='h-[10px] w-[10px] bg-center bg-cover'
                          style={{ backgroundImage: `url("/images/time.svg")` }}
                        ></span>
                        <span className='text-[9px] text-[#546462] font-bold uppercase'>
                          {vault.lastExecution}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 mt-1'>
                      <p className='text-[10px] font-bold text-[#009883] uppercase tracking-wider flex items-center gap-1'>
                        <span
                          className='h-[10px] w-[10px] bg-center bg-cover opacity-70'
                          style={{
                            backgroundImage: `url("/images/totalAum.svg")`
                          }}
                        ></span>
                        {vault.connectedCopiers} Connected Copiers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics Section */}
                <div className='flex flex-1 items-center justify-between lg:justify-around w-full border-t lg:border-t-0 lg:border-x border-[#1a3530] py-4 lg:py-0 px-0 lg:px-4 gap-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[9px] text-[#546462] font-[900] uppercase tracking-[0.15em]'>
                      Vault Balance
                    </span>
                    <span className='text-[14px] text-white font-[900] tracking-tight'>
                      {fmtSol(vault.totalBalanceSol)} SOL
                    </span>
                    <span className='text-[10px] text-[#3c5250] font-bold'>
                      {fmt(vault.totalBalanceUsd)}
                    </span>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <span className='text-[9px] text-[#546462] font-[900] uppercase tracking-[0.15em]'>
                      AUM (Managed)
                    </span>
                    <span className='text-[14px] text-[#00ffa3] font-[900] tracking-tight'>
                      {fmtCompactCurrency(vault.totalAumUsd)}
                    </span>
                    <span className='text-[9px] text-[#3c5250] font-bold uppercase'>
                      Total Assets
                    </span>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <span className='text-[9px] text-[#546462] font-[900] uppercase tracking-[0.15em]'>
                      Total Volume
                    </span>
                    <span className='text-[14px] text-white font-[900] tracking-tight'>
                      {fmtCompactCurrency(vault.totalVolumeUsd)}
                    </span>
                    <span className='text-[9px] text-[#3c5250] font-bold uppercase'>
                      Lifetime
                    </span>
                  </div>

                  <div className='hidden md:flex flex-col gap-1'>
                    <span className='text-[9px] text-[#546462] font-[900] uppercase tracking-[0.15em]'>
                      Active Positions
                    </span>
                    {vault.currentPosition &&
                    typeof vault.currentPosition.state === 'string' &&
                    vault.currentPosition.state !== PositionState.Closed ? (
                      <div className='flex flex-col'>
                        <span className='text-[14px] text-white font-[900] tracking-tight'>
                          {(
                            vault.currentPosition.size / LAMPORTS_PER_SOL
                          ).toFixed(2)}{' '}
                          SOL
                        </span>
                        <span className='text-[9px] text-[#00ffa3] font-bold uppercase'>
                          Entry: $
                          {(vault.currentPosition.entryPrice / 1e6).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className='text-[14px] text-[#3c5250] font-[900] tracking-tight'>
                        NONE
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className='flex flex-row lg:flex-col gap-2 w-full lg:w-auto'>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleOpenDeposit(vault.fullAddress)
                    }}
                    className='flex-1 lg:w-32 bg-[#1a3530] hover:bg-[#234a43] text-[#00ffa3] text-[10px] font-[900] tracking-[0.1em] py-2 rounded-lg transition-colors border border-[#00ffa3]/10'
                  >
                    DEPOSIT
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleOpenWithdraw(vault.fullAddress)
                    }}
                    className='flex-1 lg:w-32 border border-[#1a3530] hover:border-[#3c5250] text-[#546462] hover:text-[#7c9b97] text-[10px] font-[900] tracking-[0.1em] py-2 rounded-lg transition-colors'
                  >
                    WITHDRAW
                  </button>
                </div>
              </div>
            </div>

            {/* Fees Section - Integrated better */}
            <div className='bg-[#102221] border border-[#1a3530] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4'>
              <div className='flex items-center gap-4'>
                <div className='bg-[#FE9A00]/10 p-3 rounded-xl border border-[#FE9A00]/20'>
                  <span
                    className='bg-cover bg-center w-[24px] h-[24px] inline-block'
                    style={{ backgroundImage: `url("/images/claim.svg")` }}
                  />
                </div>
                <div>
                  <p className='text-[#FE9A00] text-[10px] font-[900] tracking-[0.15em] uppercase mb-0.5'>
                    Pending Performance Fees
                  </p>
                  <p className='text-white text-[20px] font-[900] tracking-tight'>
                    {fmtSol(vault.availableFeesSol)} SOL{' '}
                    <span className='text-[#546462] text-[14px] font-bold'>
                      AVAILABLE
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={e => {
                  e.stopPropagation()
                  handleOpenClaimFees(vault.fullAddress)
                }}
                disabled={vault.availableFeesSol <= 0}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-[900] tracking-[0.15em] text-[11px] transition-all flex items-center justify-center gap-2 ${
                  vault.availableFeesSol > 0
                    ? 'bg-[#FE9A00] text-black shadow-[0_6px_20px_rgba(254,154,0,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-[#1a3530] text-[#3c5250] cursor-not-allowed border border-[#FE9A00]/10'
                }`}
              >
                CLAIM FEES
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='3'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M5 12h14M12 5l7 7-7 7' />
                </svg>
              </button>
            </div>
          </div>
        )
      })}

      <div className='mt-8 opacity-80'>
        <MirroringVaults
          strategies={strategies}
          removeStrategy={removeStrategy}
          onViewVault={onViewVault}
        />
      </div>
    </div>
  )
}

export default MasterMode
