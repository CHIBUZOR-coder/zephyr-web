import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FiX, FiAlertTriangle } from 'react-icons/fi'
import { useGeneralContext } from '../../../Context/GeneralContext'
import { useVaultOperations } from '../../../features/master/useVaultOperations'
import { useUserVaults } from '../../../features/master/useUserVaults'
import { useWalletBalance } from '../../../features/wallet/useWalletQuery'
import { useSolPrice } from '../../../core/hooks/usePrice'

type Props = {
  open: boolean
  onClose: () => void
}

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const modal = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 20 }
}

const NETWORK_FEE_SOL = 0.000005;

export const WithdrawModal = ({ open, onClose }: Props) => {
  const { selectedVaultPda } = useGeneralContext()
  const { withdrawFromCopierVault, withdrawFromMasterVault, error: opError } = useVaultOperations()
  const { refetchAll, copierVaults, masterVault } = useUserVaults()
  const { data: solPrice } = useSolPrice()
  
  const [amount, setAmount] = useState('')
  const { data: balanceData } = useWalletBalance(selectedVaultPda ?? undefined)
  const vaultBalance = balanceData?.balance ?? 0
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [localError, setLocalError] = useState<string | null>(null)

  const isCopier = copierVaults?.some(v => v.vaultPda === selectedVaultPda)
  const isMaster = masterVault?.vaultPda === selectedVaultPda

  const feeUsd = solPrice ? (NETWORK_FEE_SOL * (solPrice.price ?? 79)).toFixed(4) : "0.00";
  const impactPct = amount ? ((parseFloat(amount) / (vaultBalance + parseFloat(amount))) * 100).toFixed(2) : "0.00";

  const handleWithdraw = async () => {
    if (!selectedVaultPda) {
      setLocalError('No vault selected.')
      return
    }

    const withdrawAmount = parseFloat(amount);
    if (!amount || withdrawAmount <= 0) {
      setLocalError('Please enter a valid amount to withdraw.')
      return
    }

    if (withdrawAmount > vaultBalance) {
        setLocalError('Insufficient vault balance.')
        return
    }

    if (!isCopier && !isMaster) {
      setLocalError('Vault not found in your portfolio.')
      return
    }
    
    setStatus('loading')
    setLocalError(null)

    try {
      if (isCopier) {
        await withdrawFromCopierVault(selectedVaultPda, withdrawAmount)
      } else {
        await withdrawFromMasterVault(withdrawAmount)
      }
      setStatus('success')
      refetchAll()
      setTimeout(() => {
        onClose()
        setStatus('idle')
        setAmount('')
      }, 2000)
    } catch (err: unknown) {
      console.error('Withdraw flow failed:', err)
      setStatus('error')
      setLocalError(err instanceof Error ? err.message : 'Transaction failed')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={backdrop}
            initial='hidden'
            animate='visible'
            exit='hidden'
            onClick={onClose}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]'
          />

          <motion.div
            className='fixed inset-0 z-[100] flex items-center justify-center px-4'
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            <motion.div
              variants={modal}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              className='w-full md:max-w-[400px] max-w-[360px] rounded-2xl border border-[#1f3c3c] bg-[#0d1f1f] shadow-[0_0_40px_rgba(0,0,0,0.6)] p-6 flex flex-col gap-5'
            >
              <div className='flex items-center justify-between'>
                <p className='text-white text-[14px] font-semibold tracking-wide uppercase'>
                  WITHDRAW FUNDS {isCopier ? '(COPIER)' : '(MASTER)'}
                </p>

                <button onClick={onClose} className="bg-transparent border-none cursor-pointer">
                  <FiX className='text-[#6b8c8a]' size={16} />
                </button>
              </div>

              {/* ASSET SELECT */}
              <div className='flex flex-col gap-2'>
                <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] leading-[15px] uppercase font-[900]'>
                  SELECT ASSET
                </p>
                <div className='bg-[#00000066] border border-[#1c3535] rounded-lg px-3 py-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-[32px] w-[32px] flex justify-center items-center rounded-full bg-[#102221] border border-[#FFFFFF0D]'>
                      <span className='h-[18px] w-[18px] bg-center bg-cover inline-block' style={{ backgroundImage: `url("/images/whitethunder.svg")` }} />
                    </div>
                    <span className='text-[20px] text-white font-[700]'>Solana (SOL)</span>
                  </div>
                </div>
              </div>

              {/* AMOUNT */}
              <div className='flex flex-col gap-1'>
                <div className='flex justify-between'>
                  <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] leading-[15px] uppercase font-[900]'>AMOUNT</p>
                  <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] leading-[15px] uppercase font-[700]'>
                    Available: {vaultBalance.toFixed(4)} SOL
                  </p>
                </div>

                <div className='bg-[#081a1a] border border-[#1c3535] rounded-lg px-3 py-3 flex items-center justify-between'>
                  <input
                    type='number'
                    placeholder='0.00'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className='bg-transparent outline-none text-white text-[14px] w-full placeholder:font-[900] placeholder:text-[20px] placeholder:text-[#FFFFFF0D]'
                  />
                  <button
                    onClick={() => setAmount(vaultBalance.toString())}
                    className='ml-3 text-[10px] px-2 py-1 rounded bg-[#09211f] text-[#6ef3d6] border-[1px] border-[#1f4d47] cursor-pointer'
                  >
                    MAX
                  </button>
                </div>
              </div>

              {(localError || opError) && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-start gap-2">
                  <FiAlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-[11px] text-red-200 leading-tight">{localError || opError}</p>
                </div>
              )}

              {/* FEE BOX */}
              <div className='bg-[#081a1a] border border-[#1c3535] rounded-lg px-3 py-3 text-[11px] text-[#8fb3ae] flex flex-col gap-2'>
                <div className='flex justify-between text-[10px] font-[900] leading-[15px] tracking-[1px] text-[#B0E4DD33]'>
                  <span className=''>Estimated Impact</span>
                  <span className='text-white'>{impactPct}%</span>
                </div>

                <div className='flex justify-between text-[10px] font-[900] leading-[15px] tracking-[1px] text-[#B0E4DD33]'>
                  <span className=''>Network Fee</span>
                  <span className='text-white'>~{NETWORK_FEE_SOL} SOL (${feeUsd})</span>
                </div>
              </div>

              {/* CONFIRM BUTTON */}
              <button
                disabled={status === 'loading'}
                onClick={handleWithdraw}
                className={`mt-1 w-full py-3 rounded-xl font-[900] transition flex items-center justify-center gap-2 leading-[24px] tracking-[3.2px] text-white text-[16px] uppercase
                ${status === 'loading' ? 'bg-[#14b8a6]/50 cursor-not-allowed' : 'bg-[#14b8a6] hover:bg-[#0ea593] shadow-[0px_7px_10px_1px_rgb(14,165,147,0.3)] cursor-pointer'}
                `}
              >
                {status === 'loading' ? 'Processing...' : status === 'success' ? 'Success!' : 'Confirm Withdraw →'}
              </button>

              <p className='text-[9px] leading-[3.5px] uppercase text-center text-[#B0E4DD1A]'>
                Secure transaction via Solana wallet signature
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
