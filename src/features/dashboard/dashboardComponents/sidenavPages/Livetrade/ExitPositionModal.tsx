import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { FiX } from 'react-icons/fi'
import { RiErrorWarningLine } from 'react-icons/ri'
import { useVaultOperations } from '../../../../master/useVaultOperations'

type Position = {
  pair: string
  allocation: string
  pnl: string
  pnlPercent: string
  masterVaultPda?: string
  tokenInAddress: string
  tokenOutAddress: string
  vaultPda: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  position: Position | null
}

export const ExitPositionModal = ({ isOpen, onClose, position }: Props) => {
  const [amount, setAmount] = useState('')
  const { withdrawFromCopierVault, loading, error: vaultError } = useVaultOperations()

  // Extract numeric allocation
  const maxAmount = useMemo(() => {
    if (!position) return 0
    return parseFloat(position.allocation.split(' ')[0]) || 0
  }, [position])

  const symbol = useMemo(() => {
    if (!position) return ''
    return position.allocation.split(' ')[1] || ''
  }, [position])

  // Close on ESC press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('')
    }
  }, [isOpen])

  const handleMax = () => {
    setAmount(maxAmount.toString())
  }

  const handleConfirmSell = async () => {
    if (!position || !amount || parseFloat(amount) <= 0) return

    try {
      console.log('Exiting position...', { pair: position.pair, amount, vault: position.vaultPda });
      
      const sig = await withdrawFromCopierVault(position.vaultPda, parseFloat(amount));
      
      if (sig) {
        console.log('Sell/Withdraw successful:', sig);
        onClose();
      }
    } catch (err) {
      console.error('Failed to exit position:', err);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && position && (
        <motion.div
          className='fixed  inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            className='w-full lg:w-[35%] bg-[#162D2A] border border-teal-900/40 rounded-2xl p-6 space-y-6 shadow-2xl'
          >
            {/* Header */}
            <div className='flex justify-between items-center'>
              <h2 className='font-[600] text-[16px] uppercase tracking-wider'>Exit Position</h2>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-white transition'
              >
                <FiX size={20} />
              </button>
            </div>
            {/* Body */}
            <div className='space-y-4 text-sm bg-[#102221] p-4 rounded-lg border border-teal-900/20'>
              <div className='flex justify-between'>
                <span className='text-[#99A1AF]'>Active Asset</span>
                <span className='font-[700] text-[14px] text-white'>{position.pair}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-[#99A1AF]'>Exit Amount ({symbol})</span>
                <span 
                  onClick={handleMax}
                  className='font-[900] text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-1 cursor-pointer hover:bg-teal-500/20 transition uppercase'
                >
                  Max: {maxAmount}
                </span>
              </div>
              <div className='w-full flex flex-col gap-4'>
                <input
                  placeholder='0.00'
                  type='number'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className='w-full mt-2 bg-transparent border-0 border-b border-[#23483b] 
             focus:outline-none focus:border-teal-500 
             text-white text-xl font-mono placeholder:text-[#405c59] pb-2'
                />
                <div className='flex justify-between'>
                  <span className='text-[#B0E4DD66] uppercase text-[10px] font-bold tracking-tighter'>Estimated Result</span>
                  <span
                    className={`font-mono text-sm ${
                      position.pnl.startsWith('+')
                        ? 'text-[#00C0A8]'
                        : 'text-red-400'
                    }`}
                  >
                    {position.pnl} ({position.pnlPercent})
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-[11px] text-red-400/80 flex items-start gap-3 leading-relaxed'>
              <RiErrorWarningLine className='h-5 w-5 shrink-0 mt-0.5' />
              <div className="space-y-1">
                <p>
                  Confirming this action will execute a market order to sell your position. 
                  Slippage protection is automatically applied based on your vault settings.
                </p>
                {vaultError && (
                  <p className="font-bold border-t border-red-500/20 pt-1 mt-1">
                    Error: {vaultError}
                  </p>
                )}
              </div>
            </div>
            {/* Footer */}
            <button 
              onClick={handleConfirmSell}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
                loading || !amount || parseFloat(amount) <= 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]'
              }`}
            >
              {loading ? 'Processing...' : 'Confirm Sell →'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
