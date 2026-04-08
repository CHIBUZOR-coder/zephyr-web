import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import Step1HowItWorks from './steps/Step1HowItWorks'
import Step2ConfigureVault from './steps/Step2ConfigureVault'
import Step3CreateVault from './steps/Step3CreateVault'
import Step4FundVault from './steps/Step4fundvault'
import Step5VaultLive from './steps/Step5vaultlive'
import { useGeneralContext } from '../../../Context/GeneralContext'

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const MasterTradingFlow: React.FC = () => {
  const { masterTradingFlowOpen, setMasterTradingFlowOpen } =
    useGeneralContext()
  const [vaultAddress, setCreatedVaultAddress] = useState<string | null>(null)

  const [step, setStep] = useState(1)

  const onNext = () => {
    if (step < 5) setStep(s => s + 1)
    else handleClose()
  }

  const onBack = () => {
    if (step > 1) setStep(s => s - 1)
    else handleClose()
  }

  const handleClose = () => {
    setMasterTradingFlowOpen(false)
    setStep(1)
  }

  const stepProps = { onNext, onBack }

  return (
    <AnimatePresence onExitComplete={() => setStep(1)}>
      {masterTradingFlowOpen && (
        <motion.div
          key='master-flow-backdrop'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className='fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1000] p-4'
        >
          <motion.div
            key='master-flow-card'
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className='bg-[#0f2320] border border-[#1a3530] rounded-[18px] p-[clamp(20px,5vw,32px)] w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,212,168,0.06)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden side'
          >
            <AnimatePresence mode='wait'>
              {step === 1 && <Step1HowItWorks key='step-1' {...stepProps} />}
              {step === 2 && (
                <Step2ConfigureVault key='step-2' {...stepProps} />
              )}
              {step === 3 && (
                <Step3CreateVault
                  key='step-3'
                  setCreatedVaultAddress={setCreatedVaultAddress}
                  {...stepProps}
                />
              )}
              {step === 4 && vaultAddress && (
                <Step4FundVault
                  vaultAddress={vaultAddress}
                  key='step-4'
                  {...stepProps}
                />
              )}

              {step === 5 && <Step5VaultLive key='step-5' {...stepProps} />}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MasterTradingFlow
