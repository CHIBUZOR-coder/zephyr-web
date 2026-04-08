import React from 'react'
import { motion } from 'framer-motion'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Props {
  onNext: () => void
  onBack: () => void
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '/images/master_play.svg',
    title: 'Execute Trades',
    desc: 'All trades are executed through your Master Execution Vault. Every transaction is recorded on-chain for full transparency.'
  },
  {
    icon: '/images/master_ppl.svg',
    title: 'Copiers Follow Automatically',
    desc: 'Copier vaults automatically replicate trades based on their risk parameters. They control their own position sizing and stop-loss settings.'
  },
  {
    icon: '/images/master_one.svg',
    title: 'Earn Performance Fees',
    desc: 'Traders earn a share of profits generated for copiers. Fees are automatically calculated and distributed through smart contracts.'
  }
]

// ─── INNER COMPONENTS ─────────────────────────────────────────────────────────

const StepIndicator = () => (
  <div className='flex items-center gap-2 mb-5'>
    <div className='flex gap-1.5'>
      {[true, false, false, false, false].map((active, i) => (
        <div
          key={i}
          className={`h-[3px] rounded-sm ${
            active ? 'w-7 bg-[#00d4a8]' : 'w-5 bg-[#1e3530]'
          }`}
        />
      ))}
    </div>
    <span
      className='text-[11px] text-[#8ba8a2] tracking-[0.08em] font-medium ml-1.5'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      STEP 1 OF 5
    </span>
  </div>
)

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className='flex-1 py-[13px] bg-transparent border border-[#1a3530] rounded-[10px] text-white  text-[14px] tracking-[0.5px] cursor-pointer font-[900] leading-[21px] uppercase'
  >
    BACK
  </motion.button>
)

const PrimaryButton = ({
  onClick,
  label
}: {
  onClick: () => void
  label: string
}) => (
  <motion.button
    whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className='flex-[1.8] py-[13px] bg-[#00a08a] rounded-[10px] text-white  text-[14px] tracking-[0.5px] font-[900] leading-[21px] cursor-pointer border-none'
  >
    {label}
  </motion.button>
)

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const Step1HowItWorks: React.FC<Props> = ({ onNext, onBack }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    <StepIndicator />

    <h1 className='font-[900] text-[16px] md:text-[20px] leading-[38px] text-white mb-2.5 '>
      How Master Trading Works
    </h1>

    {/* Feature list */}
    <div className='flex flex-col gap-5 mb-5'>
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.35 }}
          className='flex gap-3.5 items-start'
        >
          <div className='bg-[#00af99] h-[30px] md:h-[40px] w-[30p] md:w-[40px] flex justify-center items-center rounded-lg p-2'>
            <span
              className='bg-center bg-cover h-[10px] md:h-[20px] w-[10px] md:w-[20px] text-[#00C0A8] drop-shadow-[4px_2px_20px_20px_rgba(255,255,255)]'
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

    {/* Risk disclaimer */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45 }}
      className='bg-rdisclamerbg border border-[#5c3a08] rounded-[10px] px-3.5 py-3 flex gap-2.5 items-start mb-6'
    >
      <span
        style={{ backgroundImage: `url("/images/master_warn.svg")` }}
        className='bg-center bg-cover h[20px] h-[20px]'
      ></span>
      <p className='text-[13px]  text-[#e56337] m-0 font-[400] leading-[19px]'>
        <span className=' text-rdisclamer font-[700]'>Risk Disclaimer: </span>
        Trading involves risk. Performance is not guaranteed. Past results do
        not indicate future returns.
      </p>
    </motion.div>

    {/* Actions */}
    <div className='flex gap-3'>
      <BackButton onClick={onBack} />
      <PrimaryButton onClick={onNext} label='CONTINUE' />
    </div>
  </motion.div>
)

export default Step1HowItWorks
