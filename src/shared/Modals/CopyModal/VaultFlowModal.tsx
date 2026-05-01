import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { useGeneralContext } from '../../../Context/GeneralContext'

import { FiX } from 'react-icons/fi'

import { Link, useNavigate } from 'react-router-dom'
import { StepOne } from './Steps/Stepone/StepOne'
import { StepTwo } from './Steps/StepTwo'
import { StepThree } from './Steps/StepThree'
import { StepFour } from './Steps/StepFour'

const stepVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 }
}

const VaultFlowModal = () => {
  const { vaultFlowOpen, closeVaultFlow, vaultStep, setVaultStep } =
    useGeneralContext()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    maxVaultDrawdown: '20',
    maxTradeSize: '0.5',
    maxEntrySlippage: '0.5',
    takeProfitTriggerBps: '',
    stopLossTriggerBps: '',
    depositAmount: '',
    vaultPda: ''
  })

  return (
    <AnimatePresence>
      {vaultFlowOpen && (
        <>
          {/* ================= BACKDROP ================= */}
          <motion.div
            key='backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeVaultFlow}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]'
          />

          {/* ================= MODAL WRAPPER ================= */}
          <motion.div
            key='modal-wrapper'
            className='fixed inset-0 z-[85] flex items-center justify-center p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* ================= INNER MODAL ================= */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className='w-full max-w-[650px] max-h-[90vh] rounded-2xl bg-[#0d1f1f] border border-[#1f3c3c] shadow-2xl flex flex-col
'
              onClick={e => e.stopPropagation()}
            >
              {/* ================= HEADER ================= */}
              <div className='flex items-center justify-between px-6 py-5 '>
                <h2 className='text-white text-lg font-semibold'>
                  {vaultStep === 1 && 'Copy Trading Setup'}
                  {vaultStep === 2 && 'Create Copier Vault'}
                  {vaultStep === 3 && 'Set Up Copy Trading'}

                  {vaultStep === 4 && 'Active Copy Enabled'}
                </h2>

                <div className='flex items-center gap-2  justify-center'>
                  <Link
                    to={'https://t.me/ZephyrAssist'}
                    target='_blank'
                    style={{ backgroundImage: `url("/images/support.svg")` }}
                    className='bg-center bg-cover h-3 w-3 block'
                  ></Link>

                  <button onClick={closeVaultFlow}>
                    <FiX className='text-gray-400' size={18} />
                  </button>
                </div>
              </div>
              {/* ================= PROGRESS BAR ================= */}

              <div className='px-6  '>
                {/* LABELS */}
                <div className='flex justify-between text-[10px] tracking-wider text-gray-400 mb-3'>
                  <span>CONFIG RISK</span>
                  <span>CREATE VAULT</span>
                  <span>DEPOSIT</span>
                  <span>ACTIVE</span>
                </div>

                {/* SEGMENTED BAR */}
                <div className='flex justify-between items-center'>
                  {[1, 2, 3, 4].map(step => (
                    <div
                      key={step}
                      className={`
          w-[22%] h-[4px] rounded-full transition-all duration-300
          ${vaultStep >= step ? 'bg-teal-400' : 'bg-[#1f3c3c]'}
        `}
                    />
                  ))}
                </div>
              </div>
              {/* ================= STEP CONTENT ================= */}
              <div className='side relative flex-1 overflow-y-auto border-t border-[#1c3535]  mt-4'>
                <p className='border-t border-[#1c3535] absolute top-[124%] md:top-[74%] lg:top-[120%] left-0 w-full h-[1px] z-30 '></p>
                <AnimatePresence mode='wait'>
                  {vaultStep === 1 && (
                    <motion.div
                      key='step1'
                      variants={stepVariants}
                      initial='initial'
                      animate='animate'
                      exit='exit'
                      transition={{ duration: 0.3 }}
                    >
                      <StepOne
                        onNext={() => setVaultStep(2)}
                        form={form}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setForm={setForm as any}
                      />
                    </motion.div>
                  )}

                  {vaultStep === 2 && (
                    <motion.div
                      key='step2'
                      variants={stepVariants}
                      initial='initial'
                      animate='animate'
                      exit='exit'
                      transition={{ duration: 0.3 }}
                    >
                      <StepTwo
                        onBack={() => setVaultStep(1)}
                        onNext={() => setVaultStep(3)}
                        form={form}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setForm={setForm as any}
                      />
                    </motion.div>
                  )}

                  {vaultStep === 3 && (
                    <motion.div
                      key='step3'
                      variants={stepVariants}
                      initial='initial'
                      animate='animate'
                      exit='exit'
                      transition={{ duration: 0.3 }}
                    >
                      <StepThree
                        onBack={() => setVaultStep(2)}
                        onNext={() => setVaultStep(4)}
                        form={form}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setForm={setForm as any}
                      />
                    </motion.div>
                  )}

                  {vaultStep === 4 && (
                    <motion.div
                      key='step4'
                      variants={stepVariants}
                      initial='initial'
                      animate='animate'
                      exit='exit'
                      transition={{ duration: 0.3 }}
                    >
                      <StepFour
                        onClose={closeVaultFlow}
                        onGoPortfolio={() => {
                          navigate('/portfolio')

                          setTimeout(() => {
                            closeVaultFlow()
                          }, 50)
                        }}
                        form={form}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default VaultFlowModal