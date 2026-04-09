import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { FiX, FiAlertTriangle, FiInfo, FiRefreshCw } from 'react-icons/fi'
import { useGeneralContext } from '../../../Context/GeneralContext'
import { useVaultOperations } from '../../../features/master/useVaultOperations'
import { useUserVaults } from '../../../features/master/useUserVaults'
import { useWalletBalance } from '../../../features/wallet/useWalletQuery'
import { useSolPrice } from '../../../core/hooks/usePrice'
import { useAuthStore } from '../../../features/auth/auth.store'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { endpoint } from '../../../core/config/solanaWallet'

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
  const { withdrawFromCopierVault, withdrawFromMasterVault } = useVaultOperations()
  const { refetchAll, copierVaults, masterVault } = useUserVaults()
  const { data: solPrice } = useSolPrice()
  const { accessToken } = useAuthStore()
  const [connection] = useState(() => new Connection(endpoint, 'confirmed'))
  
  const [amount, setAmount] = useState('')
  const { data: balanceData, refetch: refetchBalance } = useWalletBalance(selectedVaultPda ?? undefined)
  const vaultBalance = balanceData?.balance ?? 0
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [localError, setLocalError] = useState<string | null>(null)
  const [onChainBalance, setOnChainBalance] = useState<number | null>(null)
  const [balanceMismatch, setBalanceMismatch] = useState(false)

  const isCopier = copierVaults?.some(v => v.vaultPda === selectedVaultPda)
  const isMaster = masterVault?.vaultPda === selectedVaultPda
  const isNotAuthenticated = !accessToken

  const feeUsd = solPrice ? (NETWORK_FEE_SOL * (solPrice.price ?? 79)).toFixed(4) : "0.00";
  const impactPct = amount ? ((parseFloat(amount) / (vaultBalance + parseFloat(amount))) * 100).toFixed(2) : "0.00";

  const checkOnChainBalance = useCallback(async () => {
    if (!selectedVaultPda) return 0
    try {
      const pubkey = new PublicKey(selectedVaultPda)
      const lamports = await connection.getBalance(pubkey)
      return lamports / LAMPORTS_PER_SOL
    } catch {
      return 0
    }
  }, [selectedVaultPda, connection])

  useEffect(() => {
    if (open && selectedVaultPda) {
      checkOnChainBalance().then(balance => {
        setOnChainBalance(balance)
        setBalanceMismatch(Math.abs(balance - vaultBalance) > 0.001)
      })
    }
  }, [open, selectedVaultPda, vaultBalance, checkOnChainBalance])

  const handleSyncVault = async () => {
    setStatus('loading')
    setLocalError(null)
    try {
      await refetchBalance()
      const freshBalance = await checkOnChainBalance()
      setOnChainBalance(freshBalance)
      setBalanceMismatch(Math.abs(freshBalance - vaultBalance) > 0.001)
      setStatus('idle')
    } catch (err) {
      setLocalError('Failed to sync vault. Please try again.')
      setStatus('error')
    }
  }

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

    const freshOnChain = await checkOnChainBalance()
    setOnChainBalance(freshOnChain)

    if (withdrawAmount > freshOnChain) {
      setBalanceMismatch(true)
      setLocalError(
        `Insufficient on-chain balance. On-chain: ${freshOnChain.toFixed(4)} SOL, Requested: ${withdrawAmount.toFixed(4)} SOL. ` +
        `This may happen if the vault was manually funded or if there\'s a sync issue. ` +
        `Try syncing your vault or contact support.`
      )
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
      
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed'
      const errorCode = extractErrorCode(errorMsg)
      
      switch (errorCode) {
        case 'InsufficientBalance':
        case '6017':
          setLocalError(
            'Insufficient on-chain balance for withdrawal.\n\n' +
            'Possible causes:\n' +
            '• Vault was manually funded outside the program\n' +
            '• Balance sync issue between frontend and blockchain\n' +
            '• Rent exemption requirement not met\n\n' +
            'Action: Click "Sync Vault" below to refresh balance, or contact support if issue persists.'
          )
          break
        case 'UnauthorizedMaster':
          setLocalError('You are not the owner of this master vault.')
          break
        case 'Unauthorized':
          setLocalError('Transaction unauthorized. Please reconnect your wallet and try again.')
          break
        case 'UserRejected':
          setLocalError('Transaction was rejected in your wallet. No funds were withdrawn.')
          break
        case 'TokenInvalid':
          setLocalError('Session expired. Please sign in again to continue.')
          break
        default:
          if (errorMsg.includes('insufficient') || errorMsg.includes('balance')) {
            setLocalError(
              'Insufficient balance for this withdrawal.\n\n' +
              'Your actual on-chain balance: ' + freshOnChain.toFixed(4) + ' SOL\n' +
              'Requested amount: ' + withdrawAmount.toFixed(4) + ' SOL\n\n' +
              'Tip: Click "Sync Vault" to verify your current balance.'
            )
          } else {
            setLocalError('Transaction failed: ' + errorMsg)
          }
      }
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

              {isNotAuthenticated && (
                <div className="bg-amber-900/20 border border-amber-500/50 p-3 rounded-lg flex items-start gap-2">
                  <FiAlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={14} />
                  <div>
                    <p className="text-[11px] text-amber-200 font-semibold">Session Expired</p>
                    <p className="text-[10px] text-amber-300 mt-0.5">Please sign in again to sync your dashboard after the transaction.</p>
                  </div>
                </div>
              )}

              {balanceMismatch && onChainBalance !== null && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-start gap-2">
                  <FiAlertTriangle className="text-red-400 shrink-0 mt-0.5" size={14} />
                  <div className="flex-1">
                    <p className="text-[11px] text-red-200 font-semibold">Balance Mismatch Detected</p>
                    <p className="text-[10px] text-red-300 mt-0.5">
                      On-chain: {onChainBalance.toFixed(4)} SOL | Dashboard: {vaultBalance.toFixed(4)} SOL
                    </p>
                    <button
                      onClick={handleSyncVault}
                      className="mt-2 text-[10px] text-red-200 underline flex items-center gap-1"
                    >
                      <FiRefreshCw size={10} /> Sync Vault
                    </button>
                  </div>
                </div>
              )}

              {!isNotAuthenticated && !balanceMismatch && onChainBalance !== null && (
                <div className="bg-green-900/20 border border-green-500/30 p-2 rounded-lg flex items-center gap-2">
                  <FiInfo className="text-green-400 shrink-0" size={14} />
                  <p className="text-[10px] text-green-300">
                    On-chain balance verified: {onChainBalance.toFixed(4)} SOL
                  </p>
                </div>
              )}

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
                <div className='flex justify-between items-center'>
                  <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] leading-[15px] uppercase font-[900]'>AMOUNT</p>
                  <div className='flex items-center gap-2'>
                    <p className='text-[10px] text-[#B0E4DD4D] tracking-[1px] leading-[15px] uppercase font-[700]'>
                      On-chain: {onChainBalance?.toFixed(4) ?? '...'} SOL
                    </p>
                    <button
                      onClick={handleSyncVault}
                      disabled={status === 'loading'}
                      className="text-[#6ef3d6] hover:text-[#8ff4e3] disabled:opacity-50"
                      title="Sync vault balance"
                    >
                      <FiRefreshCw size={12} className={status === 'loading' ? 'animate-spin' : ''} />
                    </button>
                  </div>
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
                    onClick={() => onChainBalance && setAmount(onChainBalance.toString())}
                    disabled={onChainBalance === null}
                    className='ml-3 text-[10px] px-2 py-1 rounded bg-[#09221f] text-[#6ef3d6] border-[1px] border-[#1f4d47] cursor-pointer disabled:opacity-50'
                  >
                    MAX
                  </button>
                </div>
              </div>

              {localError && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-start gap-2">
                  <FiAlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-[11px] text-red-200 leading-tight whitespace-pre-line">{localError}</p>
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

function extractErrorCode(errorMsg: string): string {
  const match = errorMsg.match(/Error Code:\s*(\w+)/i) || errorMsg.match(/code:\s*['"]?(\w+)['"]?/i)
  return match ? match[1] : errorMsg
}

