import { useState } from 'react'

import { BsCheckCircleFill } from 'react-icons/bs'
import type { StepProps } from '../Types'

type Role = 'copy' | 'pro'

export default function Step3ChooseRole ({ onNext, onBack }: StepProps) {
  const [selected, setSelected] = useState<Role>('copy')

  return (
    <div className='relative flex flex-col items-center text-center gap-8 animate-fade-up w-full'>
      <div className='flex gap-1 flex-col text-center'>
        <h1 className='font-display  text-[18px] lg:text-[22px] grok font-extrabold text-[#e8edf2] '>
          Choose Your Role
        </h1>
        <div className='flex justify-center items-center'>
          <p className='text-xs text-[#BCC9C4] w-[80%] leading-relaxed'>
            Define your journey in the Ethereal Exchange. Select the path that
            aligns with your trading expertise.
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className='flex gap-8 lg:gap-8 w-full  lg:w-1/2  flex-col lg:flex-row mt-2 '>
        {/* Copy Traders */}
        <button
          onClick={() => setSelected('copy')}
          className={` w-full lg:w-1/2 relative flex flex-col text-left rounded-2xl border p-4  transition-all duration-200 cursor-pointer bg-[#151a1f] ${
            selected === 'copy'
              ? 'border-[#2de8c8] bg-[rgba(21, 26, 31, 0.94)]'
              : 'border-[rgba(255,255,255,0.07)]  hover:border-[rgba(45,232,200,0.32)]'
          }`}
        >
          <span className='bg-[#66DAC2] text-[10px] rounded-md font-[700] p-[2px] absolute -top-[8px] left-6 manrope'>
            Recommended
          </span>
          <div className='absolute inset-0 bg-gradient-to-br from-[rgba(45,232,200,0.06)] to-transparent pointer-events-none' />
          <div
            style={{ backgroundImage: `url("/images/copy_chart.png")` }}
            className='bg-center bg-cover h-[150px] lg:h-[90px] w-full'
          ></div>
          <div className='flex items-center gap-2 mt-4'>
            <div className=' rounded-lg bg-[rgba(45,232,200,0.12)] border border-[rgba(45,232,200,0.32)] flex items-center justify-center mb-2 p-2'>
              <span
                className='bg-center bg-cover w-5 h-5'
                style={{ backgroundImage: `url("/images/copytrade.svg")` }}
              ></span>
            </div>
            <p className='font-display font-bold text-sm text-white mb-1'>
              Copy Traders
            </p>
          </div>
          <p className='text-[11px] text-[#BCC9C4] leading-relaxed mb-3'>
            Perfect for those starting out or looking to automate. Follow elite
            strategies and match their performance automatically.
          </p>
          <div className='flex justify-between items-center'>
            <div className='flex'>
              <div className='circle bg-[#334155]'></div>
              <div className='circle bg-[#475569] z-10 right-4'></div>
              <div className='circle bg-[#64748B] z-20 right-8'></div>
              <div className='circle bg-[#1B2025] z-30 right-12 text-white flex justify-center items-center text-xs'>
                +12k
              </div>
            </div>
            {selected === 'copy' && (
              <BsCheckCircleFill className='text-[#2de8c8] text-base' />
            )}
          </div>
        </button>

        {/* Trade as a Pro */}
        <button
          onClick={() => setSelected('pro')}
          className={` w-full lg:w-1/2 relative flex flex-col text-left rounded-2xl border p-4 overflow-hidden transition-all duration-200 cursor-pointer    bg-[#151a1f] ${
            selected === 'pro'
              ? 'border-[#2de8c8] bg-[rgba(21, 26, 31, 0.94)]'
              : 'border-[rgba(255,255,255,0.07)]  hover:border-[rgba(45,232,200,0.32)]'
          }`}
        >
          <div className='absolute inset-0 bg-gradient-to-br from-[rgba(100,160,255,0.06)] to-transparent pointer-events-none' />

          <div
            style={{ backgroundImage: `url("/images/master_chart.png")` }}
            className='bg-center bg-cover h-[150px] lg:h-[90px] w-full '
          ></div>
          <div className='flex items-center gap-2 mt-4'>
            <div className=' rounded-lg bg-[rgba(45,232,200,0.12)] border border-[rgba(45,232,200,0.32)] flex items-center justify-center mb-2 p-2'>
              <span
                className='bg-center bg-cover w-5 h-5'
                style={{ backgroundImage: `url("/images/mastertrade.svg")` }}
              ></span>
            </div>
            <p className='font-display font-bold text-sm text-white mb-1'>
              Trade as a Pro (Master)
            </p>
          </div>
          <p className='text-[11px] text-[#BCC9C4] leading-relaxed mb-3'>
            For market builders. Create strategies and earn from followers.
          </p>
          <div className='flex items-center justify-between mt-auto'>
            <span className='text-[8px] font-bold tracking-widest uppercase text-[#BCC9C4] flex items-center gap-1'>
              Fee Sharing Enabled <span>→</span>
            </span>
            {selected === 'pro' && (
              <BsCheckCircleFill className='text-[#2de8c8] text-base' />
            )}
          </div>
        </button>
      </div>

      {/* ── Actions ── */}
      <div className='flex items-center gap-3 w-full lg:w-1/2 '>
        <button
          onClick={onBack}
          className='flex-1 py-3 bg-transparent border border-[rgba(255,255,255,0.07)] rounded-lg text-[#BCC9C4] text-sm font-bold hover:border-[rgba(255,255,255,0.15)] hover:text-[#e8edf2] transition-all duration-150 cursor-pointer'
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className='flex-[2] bg-[#66DAC2] text-[#041a15] font-bold text-sm py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 cursor-pointer'
        >
          Continue →
        </button>
      </div>

      <p className='text-[9px] tracking-widest uppercase text-[#BCC9C4] pb-4'>
        You can change your decision in account settings.
      </p>
    </div>
  )
}
