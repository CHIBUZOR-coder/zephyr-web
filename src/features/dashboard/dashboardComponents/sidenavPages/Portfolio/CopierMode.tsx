import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import { fmtSol } from '../../../../../utils/currencyHelpers'
import type { Strategy } from './portfolio.types'
import EditRiskModal from '../../../../../shared/Modals/EditRiskModal/EditRiskModal'

interface MirroringVaultsProps {
  strategies: Strategy[]
  removeStrategy: (id: string) => void
  onViewVault?: (vaultPda: string) => void
}

export const MirroringVaults = ({
  strategies,
  removeStrategy,
  onViewVault
}: MirroringVaultsProps) => {
  const navigate = useNavigate()
  const {
    setDepositOpen,
    setWithdrawOpen,
    setOpenStopModal,
    stopCopyConfirm,
    setSelectedVaultPda,
    setEditRiskvisible
  } = useGeneralContext()
  const [id, setId] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

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

  return (
    <div className='mt-10'>
      <div className='flex items-center gap-4'>
        <span
          className='h-[20px] w-[20px] bg-center bg-cover'
          style={{ backgroundImage: `url("/images/thunder.svg")` }}
        ></span>
        <p className='text-white text-[14px] font-[900] uppercase leading-5 tracking-[4.2px]'>
          Mirroring Vaults
        </p>
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
                <div className='flex gap-6 lg:gap-0 items-center justify-between py-5 w-full flex-col md:flex-row flex-wrap lg:flex-nowrap'>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setSelectedVaultPda(strategy.masterVaultAddress || strategy.fullAddress)
                      setEditRiskvisible(true)
                    }}
                    className='absolute top-2 right-3 border border-[#1f4d47] rounded-lg px-2 py-[5px] cursor-pointer hover:bg-[#1f4d47]/10 hover:border-[#1f4d47]/70 transition-colors bg-transparent flex items-center gap-1.5 text-[#009883] text-[10px] font-bold tracking-[0.1em]'
                  >
                    <span className='text-[8px] font-[900] tracking-[0.1em] text-[#009883]'>
                      Edit Risk Parameters
                    </span>
                  </button>
                  <div className='flex items-center gap-2 min-w-[230px] md:min-w-[300px]'>
                    <div className='rounded-lg bg-[#0a1414] p-2 flex justify-center items-center'>
                      <img
                        src={
                          strategy.masterVaultAvatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                            strategy.masterWalletAddress ||
                            strategy.masterVaultAddress
                          }`
                        }
                        alt='Master Vault'
                        className='w-[32px] h-[32px] rounded-full object-cover'
                      />
                    </div>
                    <div className='flex flex-col gap-4 '>
                      <p className='text-[14px] md:text-[18px] font-[900] leading-[28px] tracking-[-0.45px] text-white m-0 whitespace-pre-line'>
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
                            <span
                              onClick={e => {
                                e.stopPropagation()
                                navigate(
                                  `/profile/${strategy.masterVaultAddress}`
                                )
                              }}
                              className='text-[10px] text-[#7a9ab0] hover:text-[#00c0a8] cursor-pointer transition-colors'
                            >
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
                      <div className='flex flex-col '>
                        <span className='text-[16px] font-[900] text-white tracking-wide'>
                          TP: {strategy.riskRules.tp}%
                        </span>
                        <span className='text-[10px] font-[900] text-[#546462] tracking-wide'>
                          SL: {strategy.riskRules.tp}%
                        </span>
                      </div>
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
                        setId(strategy.id)
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
              </div>
            )
          })
        )}
      </div>
      <EditRiskModal />
    </div>
  )
}

interface CopierModeProps {
  activeTab: string
  strategies: Strategy[]
  removeStrategy: (id: string) => void
  setShowModal: (show: boolean) => void
  onViewVault?: (vaultPda: string) => void
}

const CopierMode = ({
  strategies,
  removeStrategy,
  onViewVault
}: CopierModeProps) => {
  return (
    <div>
      <MirroringVaults
        strategies={strategies}
        removeStrategy={removeStrategy}
        onViewVault={onViewVault}
      />
    </div>
  )
}

export default CopierMode
