import { AnimatePresence, motion } from 'framer-motion'
import { useState, useMemo, useEffect, useRef } from 'react'
import { FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { useGeneralContext } from '../../../Context/GeneralContext'
import { useVaultOperations } from '../../../features/master/useVaultOperations'
import { useUserVaults } from '../../../features/master/useUserVaults'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletBalance } from '../../../features/wallet/useWalletQuery'
import { useFeeEstimation } from '../../../features/wallet/useFeeEstimation'
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
  visible: { opacity: 1, scale: 1, y: 0 }
}

// Fixed fee buffer for SOL transfers (0.005 is safe)
const FEE_BUFFER = 0.005

export const DepositModal = ({ open, onClose }: Props) => {
  const { setDepositConfirm, selectedVaultPda } = useGeneralContext()
  const { depositToCopierVault, depositToMasterVault, error: opError } = useVaultOperations()
  const { refetchAll, copierVaults, masterVault } = useUserVaults()
  const { publicKey } = useWallet()
  
  const inputRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState('')
  const { data: balanceData } = useWalletBalance(publicKey?.toBase58())
  const userBalance = balanceData?.balance ?? 0
  
  const { data: networkFee = 0.000005 } = useFeeEstimation()
  const { data: solPrice = 150 } = useSolPrice()
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const isProcessing = useRef(false)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setAmount('')
        setStatus('idle')
        setLocalError(null)
        setSuccessMessage(null)
        inputRef.current?.focus()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleMaxAmount = () => {
    // Subtract buffer to leave enough SOL for transaction fees
    const maxSafe = Math.max(0, userBalance - FEE_BUFFER)
    setAmount(maxSafe.toFixed(4))
  }

  // Find the selected vault's balance to calculate impact
  const targetVault = useMemo(() => {
    if (masterVault?.vaultPda === selectedVaultPda) return masterVault
    return copierVaults?.find(v => v.vaultPda === selectedVaultPda)
  }, [selectedVaultPda, masterVault, copierVaults])

  const estimatedImpact = useMemo(() => {
    const inputVal = parseFloat(amount) || 0
    if (inputVal === 0) return '<0.01%'
    
    // For impact calculation: (new deposit / current total pool)
    // We'll use the target vault's on-chain balance
    let currentPool = 1;
    if (targetVault) {
      if ('balance' in targetVault && targetVault.balance !== undefined) {
        currentPool = targetVault.balance ? parseFloat(targetVault.balance as string) : 0;
      } else if ('actualBalance' in targetVault && targetVault.actualBalance !== undefined) {
        currentPool = targetVault.actualBalance;
      }
    }
    const impact = (inputVal / (currentPool + inputVal)) * 100
    
    return impact < 0.01 ? '<0.01%' : `${impact.toFixed(2)}%`
  }, [amount, targetVault])

  const handleDeposit = async () => {
    if (status === 'loading' || !selectedVaultPda || !amount || parseFloat(amount) <= 0) return
    if (isProcessing.current) return;
    isProcessing.current = true;
    
    setStatus('loading')
    setLocalError(null)
    setSuccessMessage(null)

    try {
      // Check if it's a copier vault
      const isCopier = copierVaults?.some(v => v.vaultPda === selectedVaultPda)
      
      if (isCopier) {
        await depositToCopierVault(selectedVaultPda, parseFloat(amount))
      } else {
        // Use the proper depositMaster instruction now
        await depositToMasterVault(parseFloat(amount))
      }

      setStatus('success')
      
      // Immediate refetch
      refetchAll()
      
      // Secondary refetch after a delay to catch RPC state update
      setTimeout(() => {
        refetchAll()
      }, 3000)

      setTimeout(() => {
        onClose()
        setDepositConfirm(true)
        setStatus('idle')
        setAmount('')
        setSuccessMessage(null)
        isProcessing.current = false
      }, 2000)
    } catch (err: unknown) {
      isProcessing.current = false
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed'

      // If the error indicates the transaction already landed, treat as success
      if (
        errorMsg.includes('Transaction confirmed') || 
        errorMsg.includes('already processed') || 
        errorMsg.includes('already been processed')
      ) {
        setStatus('success')
        setLocalError(null)
        setSuccessMessage(errorMsg) // Show the friendly confirmation message in green
        refetchAll()
        setTimeout(() => {
          onClose()
          setDepositConfirm(true)
          setStatus('idle')
          setAmount('')
          setSuccessMessage(null)
        }, 4000)
        return
      }

      console.error('Deposit flow failed:', err)
      setStatus('error')
      setLocalError(errorMsg)
    }
  }

  const isMaster = !copierVaults?.some(v => v.vaultPda === selectedVaultPda)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            variants={backdrop}
            initial='hidden'
            animate='visible'
            exit='hidden'
            onClick={onClose}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]'
          />

          {/* MODAL WRAPPER */}
          <motion.div
            className='fixed inset-0 z-[100] flex items-center justify-center px-4'
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            {/* MODAL */}
            <motion.div
              variants={modal}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              className='
              w-full
              md:max-w-[400px]
              max-w-[360px]
              rounded-2xl
              border
              border-[#1f3c3c]
              bg-[#0d1f1f]
              shadow-[0_0_40px_rgba(0,0,0,0.6)]
              p-6
              flex
              flex-col
              gap-5
              '
            >
              {/* HEADER */}
              <div className='flex items-center justify-between'>
                <p className='text-white text-[14px] font-semibold tracking-wide'>
                  DEPOSIT FUNDS {isMaster ? '(MASTER)' : '(COPIER)'}
                </p>

                <button onClick={onClose}>
                  <FiX className='text-[#6b8c8a]' size={16} />
                </button>
              </div>

              {/* SELECT ASSET */}
              <div className='flex flex-col gap-1'>
                <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] leading-[15px] uppercase font-[900]'>
                  SELECT ASSET
                </p>

                <div
                  className='
                  bg-[#00000066]
                  border
                  border-[#1c3535]
                  rounded-lg
                  px-3
                  py-3
                  flex
                  items-center
                  justify-between
                '
                >
                  <div className='flex items-center gap-2'>
                    <div className='h-[32px] w-[32px] flex justify-center items-center rounded-full bg-[#102221] border border-[#FFFFFF0D]'>
                      <span
                        className='h-[18px] w-[18px]  bg-center bg-cover  inline-block'
                        style={{
                          backgroundImage: `url("/images/whitethunder.svg")`
                        }}
                      ></span>
                    </div>
                    <span className='text-[20px] text-white font-[700]'>
                      Solana (SOL)
                    </span>
                  </div>

                  <span className='text-[#6b8c8a] text-xs'>▾</span>
                </div>
              </div>

              {/* AMOUNT */}
              <div className='flex flex-col gap-1'>
                <div className='flex justify-between'>
                  <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] leading-[15px] uppercase font-[900]'>
                    AMOUNT
                  </p>

                  <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] leading-[15px] uppercase font-[700]'>
                    Available: {userBalance.toFixed(4)} SOL
                  </p>
                </div>

                <div
                  className='
                  bg-[#081a1a]
                  border
                  border-[#1c3535]
                  rounded-lg
                  px-3
                  py-3
                  flex
                  items-center
                  justify-between
                '
                >
                  <input
                    ref={inputRef}
                    type='number'
                    placeholder='0.00'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className='
                    bg-transparent
                    outline-none
                    text-white
                    text-[14px]
                    w-full
                    placeholder:font-[900]
                    placeholder:text-[20px]
                    placeholder:text-[#FFFFFF0D]
                  '
                  />

                  <button
                    onClick={handleMaxAmount}
                    className='
                    ml-3
                    text-[10px]
                    px-2
                    py-1
                    rounded
                  bg-[#09211f]
                    text-[#6ef3d6]
                    border-[1px]
                    border-[#1f4d47]
                  '
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* ERROR MESSAGE */}
              {((localError || opError) && !successMessage) && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-start gap-2">
                  <FiAlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-[11px] text-red-200 leading-tight">
                    {localError || opError}
                  </p>
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {successMessage && (
                <div className="bg-green-900/20 border border-green-500/50 p-3 rounded-lg flex items-start gap-2">
                  <FiInfo className="text-green-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-[11px] text-green-200 leading-tight">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* FEE SECTION */}
              <div
                className='
                bg-[#081a1a]
                border
                border-[#1c3535]
                rounded-lg
                px-3
                py-3
                text-[11px]
                text-[#8fb3ae]
                flex
                flex-col
                gap-2
                '
              >
                <div className='flex justify-between text-[10px] font-[900] leading-[15px] tracking-[1px] text-[#B0E4DD33]'>
                  <span className=''>Estimated Impact</span>
                  <span className='text-white'>{estimatedImpact}</span>
                </div>

                <div className='flex justify-between text-[10px] font-[900] leading-[15px] tracking-[1px] text-[#B0E4DD33]'>
                  <span className='flex justify-between text-[10px] font-[900] leading-[15px] tracking-[1px] text-[#B0E4DD33]'>
                    Network Fee
                  </span>
                  <span className='text-white'>~{networkFee.toFixed(6)} SOL (~${(networkFee * (typeof solPrice === 'number' ? solPrice : 80)).toFixed(4)})</span>
                </div>
              </div>

              {/* CONFIRM BUTTON */}
              <button
                disabled={status === 'loading' || !amount}
                onClick={handleDeposit}
                className={`
                mt-1
                w-full
                py-3
                rounded-xl
                font-[900]
                transition
                flex
                items-center
                justify-center
                gap-2
                leading-[24px]
                tracking-[3.2px]
                text-white
                text-[16px]
                uppercase
                ${status === 'loading' ? 'bg-[#14b8a6]/50 cursor-not-allowed' : 'bg-[#14b8a6] hover:bg-[#0ea593] shadow-[0px_7px_10px_1px_rgb(14,165,147,0.3)]'}
                `}
              >
                {status === 'loading' ? 'Processing...' : status === 'success' ? 'Success!' : 'CONFIRM DEPOSIT →'}
              </button>

              {/* FOOTER TEXT */}
              <p className='text-[9px] leading-[3.5px]  uppercase text-center text-[#B0E4DD1A]'>
                Secure transaction via Solana wallet signature
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
