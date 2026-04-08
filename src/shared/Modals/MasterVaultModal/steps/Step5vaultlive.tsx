import React from 'react'
import { motion } from 'framer-motion'
import { FiGrid } from 'react-icons/fi'
import { BsWallet2 } from 'react-icons/bs'
import { TbTrendingUp } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { useGeneralContext } from '../../../../Context/GeneralContext'
import { useTradingModeStore } from '../../../../features/dashboard/useTradingModeStore'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Props {
  onNext: () => void
  onBack: () => void
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const VAULT_ADDRESS = '7xWp...3aQ1'

// ─── INNER COMPONENTS ─────────────────────────────────────────────────────────

const StepIndicator = () => (
  <div className='flex items-center gap-2 mb-6'>
    <div className='flex gap-1.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='h-[3px] w-7 bg-[#00d4a8] rounded-sm' />
      ))}
    </div>
    <span
      className='text-[11px] text-[#8ba8a2] tracking-[0.08em] font-medium ml-1.5'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      STEP 5 OF 5
    </span>
  </div>
)

const SecondaryButton = ({
  onClick,
  label,
  icon
}: {
  onClick: () => void
  label: string
  icon: React.ReactNode
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className='flex-1 py-[13px]  border border-viewvaltb rounded-[10px] text-white font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-2 bg-viewvalt'
  >
    {icon}
    {label}
  </motion.button>
)

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const Step5VaultLive: React.FC<Props> = ({ onNext }) => {
  const navigate = useNavigate()
  const { setOpenCallTrade, setMasterTradingFlowOpen } = useGeneralContext()
  const { toggleMasterMode } = useTradingModeStore()
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className='text-center'
    >
      <StepIndicator />

      {/* Success icon */}
      <div className='flex justify-center items-center'>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 18,
            delay: 0.1
          }}
          className='h-[60px] w-[60px] flex justify-center items-center shadow-[0_4px_10px_0px_rgba(256,256,256,0.3)] rounded-full bg-[#00ab95]'
        >
          <span
            style={{ backgroundImage: `url("/images/white_ceck.svg")` }}
            className='bg-center bg-cover h-[30px] w-[30px]'
          ></span>
        </motion.div>
      </div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='font-[900] text-[16px] md:text-[20px] leading-[38px] text-white mt-6 '
      >
        Your Master Vault Is Live
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className='text-[14px] text-[#89ada8] leading-[1.6] mx-auto mb-6 max-w-[340px] font-[500]'
      >
        You are now registered as a{' '}
        <span className='text-[#00d4a8] font-bold'>Master Trader</span> on
        Zephyr. Your trades will now be tracked and can be copied by other
        users.
      </motion.p>

      {/* Vault card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='bg-[#0c1f1c] border border-[#1e3530] rounded-[14px] px-[18px] py-4 flex items-center gap-3.5 mb-6 text-left'
      >
        <div className='w-12 h-12 rounded-xl bg-[#00b79f] border-[1.5px] border-[#00d4a8]/25 flex items-center justify-center shrink-0'>
          <span
            style={{ backgroundImage: `url("/images/master_star.svg")` }}
            className='bg-center bg-cover h-[28px] w-[28px]'
          ></span>
        </div>
        <div>
          <span className='text-[12px] font-[700] tracking-[1px] uppercase text-[#6e8885] block mb-1'>
            MASTER EXECUTION VAULT
          </span>
          <p className='text-[18px] font-[900] text-white m-0 mb-[3px] leading-[27px]'>
            {VAULT_ADDRESS}
          </p>
          <p className='text-[13px] text-[#6e8885] m-0 font-[500]'>
            Deployed on Solana Mainnet
          </p>
        </div>
      </motion.div>

      {/* Quick actions label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className='text-[13px] font-[700] leading-[19.5px] tracking-[1px] text-[#6e8885] mb-3'
      >
        QUICK ACTIONS
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Primary CTA */}
        <motion.button
          whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onNext()
            toggleMasterMode()
            navigate('/')
          }}
          className='w-full py-[15px] bg-[#019f8a] border-none rounded-xl text-white font-[900] text-[14px] tracking-[0.1em] cursor-pointer flex items-center justify-center gap-2.5 mb-2.5'
        >
          <FiGrid className='text-[20px] text-white' />
          GO TO TRADER DASHBOARD
        </motion.button>

        {/* Secondary actions */}
        <div className='flex gap-2.5 mb-[18px] mt-4'>
          <SecondaryButton
            onClick={() => {
              setMasterTradingFlowOpen(false)
              toggleMasterMode()

              navigate('/portfolio')
            }}
            label='View Vault'
            icon={<BsWallet2 className='text-[14px]' />}
          />
          <SecondaryButton
            onClick={() => {
              setMasterTradingFlowOpen(false)
              setOpenCallTrade(true)
              toggleMasterMode()
            }}
            label='Start Trading'
            icon={<TbTrendingUp className='text-[15px]' />}
          />
        </div>
      </motion.div>

      {/* Congratulations banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className='bg-congrats border border-congratsb rounded-[10px] px-2 py-3 text-left'
      >
        <p className='text-[12.5px] leading-[1.55] text-[#a3d2cb] m-0'>
          <span className='text-[14px] mr-1.5'>🎉</span>
          <span className='font-bold text-[#00c0a8]'>Congratulations! </span>
          You're all set to start trading and building your reputation on
          Zephyr.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Step5VaultLive
