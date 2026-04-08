import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { RiErrorWarningLine } from 'react-icons/ri'

type Position = {
  pair: string
  allocation: string
  pnl: string
  pnlPercent: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  position: Position | null
}

export const ExitPositionModal = ({ isOpen, onClose, position }: Props) => {
  // Close on ESC press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

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
              <h2 className='font-[600] text-[16px]'>Exit Position</h2>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-white transition'
              >
                <FiX size={20} />
              </button>
            </div>
            {/* Body */}
            <div className='space-y-4 text-sm bg-[#102221] p-4 rounded-lg'>
              <div className='flex justify-between'>
                <span className='text-[#99A1AF]'>Position</span>
                <span className='font-[700] text-[14px]'>{position.pair}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#99A1AF]'>Exit Amount</span>
                <span className='font-[900] text-[12px] text-[#405c59] border border-[#23483B] rounded-lg px-3 py-1 cursor-pointer hover:bg-[#B0E4DD]/20 transition'>
                  Max
                </span>
              </div>
              <div className='w-full flex flex-col gap-4'>
                <input
                  placeholder='0.00'
                  type='text'
                  className='w-full mt-4 bg-transparent border-0 border-b border-[#23483b] 
             focus:outline-none focus:border-[#B0E4DD] 
             text-white placeholder:text-[#405c59] pb-2'
                />
                <div className='flex justify-between'>
                  <span className='text-[#B0E4DD66]'>Estimated Profit</span>
                  <span
                    className={`font-semibold ${
                      position.pnl.startsWith('+')
                        ? 'text-[#00C0A8]'
                        : 'text-red-400'
                    }`}
                  >
                    {position.pnl} ({position.pnlPercent})
                  </span>
                </div>
              </div>
              {/* Warning */}
            </div>

            <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-xs text-red-400 flex items-center gap-2'>
              <RiErrorWarningLine className='h-[20px] w-[20px]' />
              <p>
                Exiting now will close your position at market price. Slippage
                protection is set to 1.5%.
              </p>
            </div>
            {/* Footer */}
            <button className='w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition'>
              Confirm Sell →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
