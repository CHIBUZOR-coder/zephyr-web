import React, { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useInitializeTierConfig } from '../../../features/admin/useInitializeTierConfig'
import { AnimatePresence, motion } from 'framer-motion'
import { FiSettings, FiCheckCircle, FiAlertTriangle, FiExternalLink } from 'react-icons/fi'

interface TierConfigInitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Modal to initialize TierConfig on-chain
 * Matches project styling: dark theme, teal accents, orange highlights
 */
export const TierConfigInitModal: React.FC<TierConfigInitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { initializeTierConfig, isLoading, error, txSignature, success } = useInitializeTierConfig()
  const [adminWalletInput, setAdminWalletInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleInitialize = async () => {
    setValidationError(null)

    try {
      let adminWallet: PublicKey | undefined

      if (adminWalletInput.trim()) {
        try {
          adminWallet = new PublicKey(adminWalletInput)
        } catch {
          setValidationError('Invalid admin wallet address')
          return
        }
      }

      await initializeTierConfig(adminWallet)
      onSuccess?.()
    } catch (err: unknown) {
      console.error('Error:', err)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[110] flex items-center justify-center p-4'>
          {/* BACKDROP */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className='relative z-[120] w-full max-w-[440px] bg-[#071E1B] text-[#E8F6F3] rounded-2xl p-6 shadow-2xl border border-[#0D3B37] side'
          >
            {/* HEADER */}
            <div className='flex justify-between items-center mb-1'>
              <h2 className='text-[16px] font-[900] tracking-wide flex items-center gap-2'>
                <FiSettings className='text-[#FE9A00]' size={18} />
                INITIALIZE TIERS
              </h2>

              {!isLoading && (
                <button
                  onClick={onClose}
                  className='text-[#7DAAA4] hover:text-white'
                >
                  ✕
                </button>
              )}
            </div>

            <p className='text-[13px] font-[500] text-[#7DAAA4] mb-6'>
              One-time on-chain setup to establish trader performance tiers and fee splits.
            </p>

            {!success ? (
              <>
                <div className='mb-6 space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-[10px] leading-[15px] text-[#607572] font-[900] uppercase tracking-[1px]'>
                      Admin Wallet Address (Optional)
                    </label>
                    <input
                      type='text'
                      value={adminWalletInput}
                      onChange={(e) => {
                        setAdminWalletInput(e.target.value)
                        setValidationError(null)
                      }}
                      placeholder='Leave blank to use your current wallet'
                      className='w-full bg-[#0a1414] border border-[#123F3A] px-4 py-3 rounded-xl text-[13px] outline-none text-[#E8F6F3] placeholder:text-[#3b4343]'
                      disabled={isLoading}
                    />
                    <p className='text-[10px] text-[#50706c] font-[500] italic'>
                      The admin can verify trader flags (Identity, Risk, etc.)
                    </p>
                  </div>

                  {(validationError || error) && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-start gap-2'
                    >
                      <FiAlertTriangle className='text-red-500 shrink-0 mt-0.5' size={14} />
                      <p className='text-[11px] text-red-200 leading-tight'>
                        {validationError || error}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className='flex-1 px-4 py-3 bg-[#102221] border border-[#123F3A] text-[#7DAAA4] rounded-xl hover:bg-[#16302d] transition-colors text-[13px] font-bold uppercase tracking-wider disabled:opacity-50'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInitialize}
                    disabled={isLoading}
                    className='flex-1 px-4 py-3 bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-black rounded-xl hover:brightness-110 transition-all text-[13px] font-[900] uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isLoading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin' />
                        Initializing...
                      </>
                    ) : (
                      'Initialize'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='space-y-6'
              >
                <div className='p-4 bg-teal-900/20 border border-[#009883]/30 rounded-xl text-center space-y-3'>
                  <div className='flex justify-center'>
                    <FiCheckCircle className='text-[#00C896]' size={48} />
                  </div>
                  <h3 className='text-[16px] font-[900] text-white'>INITIALIZATION SUCCESSFUL</h3>
                  <p className='text-[12px] text-[#7DAAA4]'>
                    On-chain TierConfig is now active. Backend services will resume normal operation.
                  </p>
                  
                  {txSignature && (
                    <a
                      href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-2 text-[11px] text-[#FE9A00] hover:underline mt-2 font-[700]'
                    >
                      View Transaction <FiExternalLink size={12} />
                    </a>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className='w-full py-3 bg-[#009883] text-white rounded-xl hover:bg-[#00b098] transition-colors font-[900] text-[13px] uppercase tracking-wider shadow-[0_0_20px_rgba(0,152,131,0.25)]'
                >
                  Continue to Dashboard
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
