import { RiSendPlaneFill } from 'react-icons/ri'
import type { StepProps } from '../Types'


export default function Step1Welcome ({ onNext }: StepProps) {
  return (
    <div className='flex flex-col items-center justify-center text-center gap-5 animate-fade-up w-[40%] h-[65%] bg-[#151a1f] p-4 border-[1px] border-step1 rounded-md'>
      {/* Logo icon */}
      <div className='w-14 h-14 rounded-2xl bg-[rgba(45,232,200,0.12)] border border-[rgba(45,232,200,0.32)] flex items-center justify-center '>
        <RiSendPlaneFill className='text-[#2de8c8] text-2xl' />
      </div>

      {/* Heading */}
      <h1 className='font-display text-4xl sm:text-5xl font-extrabold text-[#e8edf2] tracking-tight leading-none'>
        Welcome to Zephyr
      </h1>

      {/* Subtitle */}
      <p className='text-sm text-[#7a8fa0]'>Copy the best traders on-chain</p>

      {/* CTA */}
      <button
        onClick={onNext}
        className=' bg-[#2de8c8] text-[#041a15] font-bold text-sm px-10 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 min-w-[180px] cursor-pointer'
      >
        Get Started →
      </button>

      {/* Footnote */}
      <p className='text-[9px] tracking-widest uppercase text-[#3d5060]'>
        Press start &amp; browse while we sync it
      </p>
    </div>
  )
}
