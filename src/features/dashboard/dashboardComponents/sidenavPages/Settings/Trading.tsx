import React, { useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import { AiOutlineThunderbolt } from 'react-icons/ai'
import { MdOutlineAutoGraph } from 'react-icons/md'

const Trading: React.FC = () => {
  const [slippage, setSlippage] = useState('1.0%')
  const [execution, setExecution] = useState('standard')

  const [toggles, setToggles] = useState({
    autoCopy: true,
    takeProfit: true,
    riskProtection: true,
    pauseAI: false
  })

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className='min-h-screen bg-[#020A09] text-white px-4 py-10 flex justify-center'>
      <div className='w-full max-w-4xl space-y-6'>
        {/* HEADER */}
        <div>
          <h1 className='text-xl font-semibold tracking-wide'>
            TRADING CONFIGURATION
          </h1>
          <p className='text-sm text-[#7A9E9A] mt-1'>
            Configure default trading parameters and automation
          </p>
        </div>

        {/* RISK SETTINGS */}
        <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-5'>
          <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
            <FiInfo />
            DEFAULT VAULT RISK SETTINGS
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <Input label='MAX TRADE SIZE %' defaultValue='10' />
            <Input label='MAX LOSS %' defaultValue='5' />
            <Input label='MAX DRAWDOWN %' defaultValue='15' />
            <Input label='TAKE-PROFIT %' defaultValue='20' />
          </div>
        </div>

        {/* SLIPPAGE */}
        <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-4'>
          <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
            <MdOutlineAutoGraph />
            SLIPPAGE TOLERANCE
          </div>

          <div className='flex gap-3 flex-wrap'>
            {['0.5%', '1.0%', '2.0%'].map(val => (
              <button
                key={val}
                onClick={() => setSlippage(val)}
                className={`flex-1 min-w-[90px] py-2 rounded-lg text-sm font-medium transition
                ${
                  slippage === val
                    ? 'bg-[#11B89A] text-black'
                    : 'bg-[#061B19] border border-[#1A3D39] text-[#7A9E9A]'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <Input label='' defaultValue='1.0' />
        </div>

        {/* AUTOMATION */}
        <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-5'>
          <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
            <AiOutlineThunderbolt />
            AUTOMATION CONTROLS
          </div>

          <Toggle
            title='Auto-Copy Trades'
            desc='Automatically execute trades from followed masters'
            active={toggles.autoCopy}
            onClick={() => toggle('autoCopy')}
          />

          <Toggle
            title='Take-Profit Automation'
            desc='Auto-execute at configured TP levels'
            active={toggles.takeProfit}
            onClick={() => toggle('takeProfit')}
          />

          <Toggle
            title='Risk Protection Automation'
            desc='Auto pause on drawdown limits'
            active={toggles.riskProtection}
            onClick={() => toggle('riskProtection')}
          />

          <Toggle
            title='Pause All Automation'
            desc='Emergency stop for all automated actions'
            active={toggles.pauseAI}
            danger
            onClick={() => toggle('pauseAI')}
          />
        </div>

        {/* EXECUTION */}
        <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-4'>
          <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
            EXECUTION PRIORITY / GAS SETTINGS
          </div>

          <div className='flex gap-3 flex-wrap'>
            {['standard', 'fast', 'custom'].map(mode => {
              if (mode === 'custom') {
                return (
                  <input
                    key={mode}
                    type='number'
                    placeholder='Custom'
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-semibold uppercase tracking-wide outline-none transition
            ${
              execution === 'custom'
                ? 'bg-black text-[#7A9E9A]'
                : 'bg-[#061B19] border border-[#1A3D39] text-[#7A9E9A]'
            }`}
                    onFocus={() => setExecution('custom')}
                  />
                )
              } else {
                return (
                  <button
                    key={mode}
                    onClick={() => setExecution(mode)}
                    className={`flex-1 min-w-[120px] py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition
                ${
                  execution === mode
                    ? 'bg-[#11B89A] text-black'
                    : 'bg-[#061B19] border border-[#1A3D39] text-[#7A9E9A]'
                }`}
                  >
                    {mode}
                  </button>
                )
              }
            })}
          </div>

          <div className='text-xs text-[#6F8F8A] border border-[#1A3D39] rounded-lg p-2'>
            Standard: Lower fees, slower execution (2-5 blocks)
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trading

// ✅ Explicit interface instead of `any`
interface InputProps {
  label: string
  defaultValue: string
}

const Input = ({ label, defaultValue }: InputProps) => (
  <div className='flex flex-col gap-1'>
    {label && (
      <label className='text-xs text-[#7A9E9A] flex items-center gap-1'>
        {label}
        <FiInfo size={12} />
      </label>
    )}

    <div className='relative'>
      <input
        defaultValue={defaultValue}
        className='w-full bg-[#061B19] border border-[#1A3D39] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#11B89A]'
      />
      <span className='absolute right-3 top-2 text-xs text-[#7A9E9A]'>%</span>
    </div>
  </div>
)

// ✅ Explicit interface instead of `any`
interface ToggleProps {
  title: string
  desc: string
  active: boolean
  danger?: boolean
  onClick: () => void
}

const Toggle = ({ title, desc, active, danger, onClick }: ToggleProps) => {
  return (
    <div
      className={`flex items-center justify-between rounded-lg p-4 border
      ${
        danger
          ? 'border-red-500/30 bg-[#1B0F10]'
          : 'border-[#1A3D39] bg-[#061B19]'
      }`}
    >
      <div>
        <p className='text-sm'>{title}</p>
        <p className='text-xs text-[#7A9E9A]'>{desc}</p>
      </div>

      <button
        onClick={onClick}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition
        ${active ? 'bg-[#11B89A]' : 'bg-[#2A2F2E]'}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full transition
          ${active ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  )
}
