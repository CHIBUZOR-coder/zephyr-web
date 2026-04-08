import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiInfo } from 'react-icons/fi'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Props {
  onNext: () => void
  onBack: () => void
}

type TradeSizeMode = 'fixed' | 'percent'

// ─── INNER COMPONENTS ─────────────────────────────────────────────────────────

const StepIndicator = () => (
  <div className='flex items-center gap-2 mb-5'>
    <div className='flex gap-1.5'>
      {[true, true, false, false, false].map((active, i) => (
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
      STEP 2 OF 5
    </span>
  </div>
)

const InfoIcon = () => (
  <FiInfo className='text-[#8ba8a2] text-[13px] ml-1 align-middle inline-block' />
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

interface ToggleRowProps {
  label: string
  active: boolean
  onToggle: () => void
  showTopBorder?: boolean
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  active,
  onToggle,
  showTopBorder
}) => (
  <div
    className={`flex  text-white justify-between items-center pb-[14px]  ${
      showTopBorder ? 'border-t border-[#1a3530] pt-[14px]' : 'pt-0'
    }`}
  >
    <div className='flex items-center'>
      <span
        className='text-[14px] text-white font-[600]
'
      >
        {label}
      </span>
      <InfoIcon />
    </div>

    <motion.div
      onClick={onToggle}
      animate={{ background: active ? '#00d4a8' : '#1e3530' }}
      transition={{ duration: 0.2 }}
      className='w-11 h-6 rounded-xl p-[3px] cursor-pointer flex items-center shrink-0 box-border'
    >
      <motion.div
        animate={{ x: active ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className='w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.4)]'
      />
    </motion.div>
  </div>
)

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const Step2ConfigureVault: React.FC<Props> = ({ onNext, onBack }) => {
  const [slippage, setSlippage] = useState('1')
  const [tradeSize, setTradeSize] = useState<TradeSizeMode>('percent')
  const [visibility, setVisibility] = useState({
    pnl: true,
    winRate: true,
    drawdown: true
  })

  const toggle = (key: keyof typeof visibility) =>
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <StepIndicator />

      <h1 className='font-[900] text-[16px] md:text-[20px] leading-[38px] text-white mb-2.5 '>
        Configure Master Vault Settings
      </h1>
      <p className='text-[15px] font-[500] text-[#89ada8] mb-6'>
        Set default execution parameters for your trading strategy
      </p>

      {/* Slippage Tolerance */}
      <div className='mb-5'>
        <label className='flex items-center text-[14px] leading-[21px] font-[700] text-white mb-2'>
          Slippage Tolerance <InfoIcon />
        </label>
        <div className='relative'>
          <input
            type='number'
            value={slippage}
            onChange={e => setSlippage(e.target.value)}
            className='w-full bg-[#0c1f1c] border border-[#1e3530] rounded-[10px] py-3 pl-3.5 pr-11 text-[#969696] text-[15px] outline-none box-border font-[700]'
          />
          <span
            className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8ba8a2] text-[13px] pointer-events-none'
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            %
          </span>
        </div>
      </div>

      {/* Trade Size Behavior */}
      <div className='mb-5'>
        <label className='flex items-center text-[14px] font-[700] leading-[21px] text-white mb-2'>
          Default Trade Size Behavior <InfoIcon />
        </label>
        <div className='grid grid-cols-2 bg-[#0c1f1c] border border-[#1e3530] rounded-[10px] overflow-hidden p-[3px] gap-[8px]'>
          {(['fixed', 'percent'] as const).map(mode => (
            <motion.button
              key={mode}
              onClick={() => setTradeSize(mode)}
              whileTap={{ scale: 0.98 }}
              className={`py-[11px] text-[13px] font-semibold cursor-pointer border-[1px]  rounded-lg transition-all duration-200 ${
                tradeSize === mode
                  ? 'bg-trade_size text-white  border-[#009883]'
                  : 'bg-trade_sized text-[#7c9b97] border-[#283a34]'
              }`}
            >
              {mode === 'fixed' ? 'Fixed Trade Size' : '% of Vault Balance'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Visibility Settings */}
      <div className='mb-6'>
        <p className='text-[14px] font-[700] leading-[21px] text-white mb-3'>
          Visibility Settings
        </p>
        <div className='bg-[#0c1f1c] border border-[#1e3530] rounded-[10px] px-4'>
          <ToggleRow
            label='Show PnL publicly'
            active={visibility.pnl}
            onToggle={() => toggle('pnl')}
          />
          <ToggleRow
            label='Show win rate'
            active={visibility.winRate}
            onToggle={() => toggle('winRate')}
            showTopBorder
          />
          <ToggleRow
            label='Show drawdown metrics'
            active={visibility.drawdown}
            onToggle={() => toggle('drawdown')}
            showTopBorder
          />
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-3'>
        <BackButton onClick={onBack} />
        <PrimaryButton onClick={onNext} label='CREATE MASTER VAULT' />
      </div>
    </motion.div>
  )
}

export default Step2ConfigureVault
