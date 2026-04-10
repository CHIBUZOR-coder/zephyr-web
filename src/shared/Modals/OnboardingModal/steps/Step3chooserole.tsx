import { useState } from 'react'
import { FiCopy } from 'react-icons/fi'
import { MdOutlineTrendingUp } from 'react-icons/md'
import { BsCheckCircleFill } from 'react-icons/bs'
import type { StepProps } from '../Types'


type Role = 'copy' | 'pro'

export default function Step3ChooseRole ({ onNext }: StepProps) {
  const [selected, setSelected] = useState<Role>('copy')

  return (
    <div className='flex flex-col items-center text-center gap-4 animate-fade-up w-full'>
      <h1 className='font-display text-3xl sm:text-4xl font-extrabold text-[#e8edf2] tracking-tight'>
        Choose Your Role
      </h1>
      <p className='text-xs text-[#7a8fa0] max-w-xs leading-relaxed'>
        Define your journey in the Ethereal Exchange. Select the path that
        aligns with your trading expertise.
      </p>

      {/* Role cards */}
      <div className='flex gap-3 w-full flex-col sm:flex-row'>
        {/* Copy Traders */}
        <button
          onClick={() => setSelected('copy')}
          className={`relative flex-1 text-left rounded-2xl border p-4 overflow-hidden transition-all duration-200 cursor-pointer ${
            selected === 'copy'
              ? 'border-[#2de8c8] bg-[#0f1e2a]'
              : 'border-[rgba(255,255,255,0.07)] bg-[#0c1720] hover:border-[rgba(45,232,200,0.32)]'
          }`}
        >
          <div className='absolute inset-0 bg-gradient-to-br from-[rgba(45,232,200,0.06)] to-transparent pointer-events-none' />

          <span className='inline-block text-[8px] font-bold tracking-widest uppercase text-[#2de8c8] bg-[rgba(45,232,200,0.12)] border border-[rgba(45,232,200,0.32)] rounded px-1.5 py-0.5 mb-2'>
            Recommended
          </span>

          <div className='w-8 h-8 rounded-lg bg-[rgba(45,232,200,0.12)] border border-[rgba(45,232,200,0.32)] flex items-center justify-center mb-2'>
            <FiCopy className='text-[#2de8c8] text-sm' />
          </div>

          <p className='font-display font-bold text-sm text-[#e8edf2] mb-1'>
            Copy Traders
          </p>
          <p className='text-[11px] text-[#7a8fa0] leading-relaxed mb-3'>
            Perfect for those starting out or looking to automate. Follow elite
            strategies and mirror their performance automatically.
          </p>

          <div className='flex items-center justify-between mt-auto'>
            <div className='flex items-center gap-1.5 bg-[#162433] rounded-full px-2 py-1'>
              <span className='w-2.5 h-2.5 rounded-full bg-[#2de8c8] block' />
              <span className='text-[9px] text-[#e8edf2] font-medium'>
                Elite
              </span>
            </div>
            {selected === 'copy' && (
              <BsCheckCircleFill className='text-[#2de8c8] text-base' />
            )}
          </div>
        </button>

        {/* Trade as a Pro */}
        <button
          onClick={() => setSelected('pro')}
          className={`relative flex-1 text-left rounded-2xl border p-4 overflow-hidden transition-all duration-200 cursor-pointer ${
            selected === 'pro'
              ? 'border-[#2de8c8] bg-[#0f1e2a]'
              : 'border-[rgba(255,255,255,0.07)] bg-[#0c1720] hover:border-[rgba(45,232,200,0.32)]'
          }`}
        >
          <div className='absolute inset-0 bg-gradient-to-br from-[rgba(100,160,255,0.06)] to-transparent pointer-events-none' />

          <div className='w-8 h-8 rounded-lg bg-[rgba(45,232,200,0.12)] border border-[rgba(45,232,200,0.32)] flex items-center justify-center mb-2'>
            <MdOutlineTrendingUp className='text-[#2de8c8] text-sm' />
          </div>

          <p className='font-display font-bold text-sm text-[#e8edf2] mb-1'>
            Trade as a Pro (Master)
          </p>
          <p className='text-[11px] text-[#7a8fa0] leading-relaxed mb-3'>
            For market builders. Create strategies and earn from followers.
          </p>

          <div className='flex items-center justify-between mt-auto'>
            <span className='text-[8px] font-bold tracking-widest uppercase text-[#2de8c8] flex items-center gap-1'>
              Fee Sharing Enabled <span>→</span>
            </span>
            {selected === 'pro' && (
              <BsCheckCircleFill className='text-[#2de8c8] text-base' />
            )}
          </div>
        </button>
      </div>

      <button
        onClick={onNext}
        className='bg-[#2de8c8] text-[#041a15] font-bold text-sm px-10 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 min-w-[180px] cursor-pointer'
      >
        Continue →
      </button>

      <p className='text-[9px] tracking-widest uppercase text-[#3d5060]'>
        You can change your decision in account settings.
      </p>
    </div>
  )
}
