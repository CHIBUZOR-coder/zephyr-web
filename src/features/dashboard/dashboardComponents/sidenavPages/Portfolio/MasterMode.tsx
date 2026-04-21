import { useCallback, useState } from 'react'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import { fmt, fmtSol } from '../../../../../utils/currencyHelpers'
import type { PinnedVault, Strategy } from './portfolio.types'
import { PositionState } from '../../../../master/useUserVaults'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useAuthStore } from '../../../../auth/auth.store'
import MirroringVaults from './CopierMode'

interface MasterModeProps {
  pinnedVaults: PinnedVault[]
  activeTab: string
  strategies: Strategy[]
  removeStrategy: (id: string) => void
  setShowModal: (show: boolean) => void
  onViewVault?: (vaultPda: string) => void
}

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
    setSelectedVaultPda,
    setClaimFeesOpen,
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
      {pinnedVaults.map((vault, i) => {
        const parameters = [
          {
            title: 'Total Volume',
            val: vault.totalBalanceUsd ? `${fmt(vault.totalBalanceUsd)}` : '0'
          },
          {
            title: 'Realized Profit',
            val: vault.historicalClaimedSol ? `${fmtSol(vault.historicalClaimedSol)} SOL` : '0 SOL'
          },
          {
            title: 'AUM',
            val: vault.totalBalanceUsd ? `${fmt(vault.totalBalanceUsd)}` : '0'
          },
          {
            title: 'Copiers Retention',
            val: vault.connectedCopiers ? `${vault.connectedCopiers}` : '0'
          }
        ]
        return (
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
                </div>
              </div>
              {/* Right */}
              <div className='flex-1 flex flex-col lg:flex-row justify-between gap-6'>
                <div className='flex items-center gap-3 w-full lg:w-auto'>
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
        )
      })}
      
      <MirroringVaults 
        activeTab=""
        setShowModal={() => {}}
        strategies={strategies}
        removeStrategy={removeStrategy}
        onViewVault={onViewVault}
      />
    </div>
  )
}

export default MasterMode