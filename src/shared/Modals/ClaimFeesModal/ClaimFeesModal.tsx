import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { useGeneralContext } from '../../../Context/GeneralContext'
import { useVaultOperations } from '../../../features/master/useVaultOperations'
import { useUserVaults } from '../../../features/master/useUserVaults'
import { useWalletBalance } from '../../../features/wallet/useWalletQuery'

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

export const ClaimFeesModal = ({ open, onClose }: Props) => {
  const { selectedVaultPda } = useGeneralContext()
  const { claimPerformanceFees } = useVaultOperations()
  const { refetchAll } = useUserVaults()
  
  const [amount, setAmount] = useState('')
  const { data: balanceData } = useWalletBalance(selectedVaultPda ?? undefined)
  const vaultBalance = balanceData?.balance ?? 0
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const claimable = Math.max(0, vaultBalance - 0.003)

  const handleClaim = async () => {
    if (!selectedVaultPda) {
      setLocalError('No vault selected.')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setLocalError('Please enter a valid amount to claim.')
      return
    }

    setStatus('loading')
    setLocalError(null)
    setSuccessMessage(null)

    try {
      await claimPerformanceFees(parseFloat(amount))
      setStatus('success')
      refetchAll()
      setTimeout(() => {
        onClose()
        setStatus('idle')
        setAmount('')
      }, 2500)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed'
      
      if (
        errorMsg.includes('Transaction confirmed') ||
        errorMsg.includes('already processed') ||
        errorMsg.includes('already been processed')
      ) {
        setStatus('success')
        setLocalError(null)
        setSuccessMessage(errorMsg)
        refetchAll()
        setTimeout(() => {
          onClose()
          setStatus('idle')
          setAmount('')
          setSuccessMessage(null)
        }, 4000)
        return
      }

      console.error('Fee claim flow failed:', err)
      setStatus('error')
      setLocalError(errorMsg)
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
              className='w-full md:max-w-[420px] max-w-[380px] rounded-2xl border border-[#FE9A0033] bg-[#0d151f] shadow-[0_0_50px_rgba(254,154,0,0.15)] p-6 flex flex-col gap-5'
            >
              {/* HEADER */}
              <div className='flex items-center justify-between'>
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-[#FE9A0022] rounded-lg">
                      <span className="text-[14px]">💰</span>
                   </div>
                   <p className='text-white text-[14px] font-bold tracking-wide uppercase'>
                    Claim Performance Fees
                  </p>
                </div>

                <button onClick={onClose} className="bg-transparent border-none cursor-pointer hover:rotate-90 transition-transform">
                  <FiX className='text-[#6b8c8a]' size={20} />
                </button>
              </div>

              {/* INFO BOX */}
              <div className="bg-[#FE9A0011] border border-[#FE9A0022] p-4 rounded-xl">
                 <p className="text-[#FE9A00] text-[11px] font-bold uppercase tracking-wider mb-1">Fee Claiming</p>
                 <p className="text-[#B0E4DDCC] text-xs leading-relaxed">
                   Withdraw performance and volume fees accumulated in your Master Execution Vault. Note: A rent-exempt minimum must remain in the vault.
                 </p>
              </div>

              {/* ASSET SELECT (Read-only) */}
              <div className='flex flex-col gap-2'>
                <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] uppercase font-black'>
                  ASSET
                </p>
                <div className='bg-[#00000044] border border-[#1c3535] rounded-lg px-3 py-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-[32px] w-[32px] flex justify-center items-center rounded-full bg-[#102221] border border-[#FFFFFF0D]'>
                      <span className='h-[18px] w-[18px] bg-center bg-cover inline-block' style={{ backgroundImage: `url("/images/whitethunder.svg")` }} />
                    </div>
                    <span className='text-[18px] text-white font-bold'>Solana (SOL)</span>
                  </div>
                </div>
              </div>

              {/* AMOUNT INPUT */}
              <div className='flex flex-col gap-1'>
                <div className='flex justify-between'>
                  <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] uppercase font-black'>AMOUNT</p>
                  <div className='flex flex-col items-end'>
                    <div className='flex flex-col items-end'>
                    <p className='text-[10px] text-[#FE9A00] tracking-[1px] font-bold'>
                      Available to claim: {claimable.toFixed(4)} SOL
                    </p>
                    <p className='text-[9px] text-[#607572]'>
                      (Vault balance - rent exempt)
                    </p>
                  </div>
                  </div>
                </div>

                <div className='bg-[#081a1a] border border-[#1c3535] rounded-lg px-3 py-3 flex items-center justify-between group focus-within:border-[#FE9A0066] transition-colors'>
                  <input
                    type='number'
                    placeholder='0.00'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className='bg-transparent outline-none text-white text-[18px] font-bold w-full placeholder:text-[#FFFFFF0D]'
                  />
                  <button
                    onClick={() => {
                      if (claimable <= 0) {
                        setLocalError('Vault balance too low');
                      } else {
                        setAmount(claimable.toFixed(4));
                      }
                    }}
                    className='ml-3 text-[10px] font-bold px-3 py-1.5 rounded bg-[#FE9A0022] text-[#FE9A00] border border-[#FE9A0044] cursor-pointer hover:bg-[#FE9A0033] transition'
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* ERROR/SUCCESS MESSAGES */}
              {localError && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-start gap-2">
                  <FiAlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-[11px] text-red-200 leading-tight">{localError}</p>
                </div>
              )}

              {(status === 'success' || successMessage) && (
                <div className="bg-green-900/20 border border-green-500/50 p-3 rounded-lg flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-[11px] text-green-200 leading-tight font-bold uppercase tracking-wider">
                    {successMessage || 'Transaction successful! Your fees have been claimed.'}
                  </p>
                </div>
              )}

              {/* CLAIM BUTTON */}
              <button
                disabled={status === 'loading' || status === 'success'}
                onClick={handleClaim}
                className={`w-full py-4 rounded-xl font-black transition flex items-center justify-center gap-2 tracking-[2px] text-black text-[15px] uppercase
                  ${status === 'loading' ? 'bg-[#FE9A00] opacity-50 cursor-not-allowed' : 
                    status === 'success' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 
                    'bg-[#FE9A00] hover:scale-[1.02] shadow-[0_10px_20px_rgba(254,154,0,0.3)] cursor-pointer active:scale-95'}
                `}
              >
                {status === 'loading' ? 'Processing...' : status === 'success' ? 'Success!' : 'Claim Performance Fees →'}
              </button>

              <p className='text-[9px] uppercase text-center text-[#B0E4DD1A] font-bold'>
                Requires signature from Master Wallet
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
