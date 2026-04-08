import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useGeneralContext } from '../../../Context/GeneralContext'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '/images/master_sheild.svg',
    title: 'Execute trades on-chain',
    desc: 'All your trades are transparently executed and recorded on Solana.'
  },
  {
    icon: '/images/master_trend.svg',
    title: 'Build a transparent performance track record',
    desc: 'Your trading history is publicly verifiable and immutable.'
  },
  {
    icon: '/images/master_dollar.svg',
    title: 'Earn performance fees from copiers',
    desc: 'Receive a percentage of profits generated for your copiers.'
  }
]

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const BecomeMasterTraderModal: React.FC = () => {
  const { masterTraderOpen, setMasterTraderOpen, setMasterTradingFlowOpen } =
    useGeneralContext()

  const handleContinue = () => {
    setMasterTraderOpen(false)
    setTimeout(() => setMasterTradingFlowOpen(true), 200)
  }

  return (
    <AnimatePresence>
      {masterTraderOpen && (
        <motion.div
          key='become-master-backdrop'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setMasterTraderOpen(false)}
          className='fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1000] p-4'
        >
          <motion.div
            key='become-master-card'
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className='bg-[#0f2320] border border-[#1a3530] rounded-[18px] p-6 w-full max-w-[460px] max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,212,168,0.06)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden side'
          >
            {/* Heading */}
            <h2 className='font-[900] text-[18px] md:text-[24px] leading-[38px] text-white mb-2.5 '>
              Become a Master Trader
            </h2>

            {/* Subtitle */}
            <p className='text-[16px] font-[500] leading-[24px] text-[#a8c4be]  mb-[22px]'>
              Execute trades from your personal vault and allow other users to
              copy your strategy. Earn performance fees when copiers profit from
              your trades.
            </p>

            {/* Feature list */}
            <div className='bg-[#0c1f1c] border border-[#1e3530] rounded-xl overflow-hidden mb-6'>
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className={`flex gap-3 items-start px-4 py-[14px] ${
                    i < FEATURES.length - 1 ? 'border-b border-[#1e3530]' : ''
                  }`}
                >
                  <div className='bg-[#253c39] h-[30px] md:h-[40px] w-[30p] md:w-[40px] flex justify-center items-center rounded-lg p-2'>
                    <span
                      className='bg-center bg-cover h-[10px] md:h-[20px] w-[10px] md:w-[20px] text-[#00C0A8]'
                      style={{ backgroundImage: `url(${f.icon})` }}
                    ></span>
                  </div>
                  <div>
                    <p className='font-[700] text-[14px] text-white mb-[3px]'>
                      {f.title}
                    </p>
                    <p className='text-[13px] text-[#7c9b97] leading-[19.5px] m-0'>
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className='flex gap-3'>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMasterTraderOpen(false)}
                className='flex-1 py-[13px] bg-transparent border border-[#1a3530] rounded-[10px] text-white  text-[14px] tracking-[0.5px] cursor-pointer font-[900] leading-[21px] uppercase'
              >
                CANCEL
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                className='flex-[1.8] py-[13px] bg-[#00a08a] rounded-[10px] text-white  text-[14px] tracking-[0.5px] font-[900] leading-[21px] cursor-pointer border-none'
              >
                CONTINUE
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BecomeMasterTraderModal
