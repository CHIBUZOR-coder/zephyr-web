import { TbLock } from 'react-icons/tb'
import { BsPersonCheck } from 'react-icons/bs'
import { MdOutlineTune } from 'react-icons/md'
import { FiZap } from 'react-icons/fi'
import type { StepProps } from '../Types'

const features = [
  {
    icon: <BsPersonCheck className='text-[#2de8c8] text-sm' />,
    title: 'Select a trader',
    desc: 'Browse verified track records and choose strategies that align with your goals.'
  },
  {
    icon: <MdOutlineTune className='text-[#2de8c8] text-sm' />,
    title: 'Set your risk',
    desc: 'Customize your exposure limits and stop-loss parameters with precision controls.'
  },
  {
    icon: <FiZap className='text-[#2de8c8] text-sm' />,

    title: 'Trades execute automatically',
    desc: 'Sit back while our engine mirrors expert moves in real-time with zero latency.'
  }
]

export default function Step4CopyTradingExplanation ({ onNext }: StepProps) {
  return (
    <div className='flex flex-col sm:flex-row items-center gap-6 animate-fade-up w-full'>
      {/* Left visual panel */}
      <div className='relative flex-shrink-0 w-36 h-44 sm:w-40 sm:h-48 bg-[#0c1720] border border-[rgba(255,255,255,0.07)] rounded-2xl flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(45,232,200,0.07)_0%,transparent_70%)]' />

        {/* + button */}
        <div className='absolute top-2.5 left-2.5 w-6 h-6 rounded-md bg-[#162433] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-[#7a8fa0] text-base leading-none select-none'>
          +
        </div>

        {/* Orb */}
        <div className='relative w-24 h-24 rounded-full border border-[rgba(45,232,200,0.18)] bg-[radial-gradient(circle,rgba(45,232,200,0.12)_0%,transparent_70%)] flex items-center justify-center'>
          <div className='absolute w-[125%] h-[125%] rounded-full border border-[rgba(45,232,200,0.08)]' />
          <div className='w-14 h-14 rounded-full bg-[rgba(45,232,200,0.07)] border border-[rgba(45,232,200,0.28)] flex items-center justify-center'>
            <TbLock className='text-[#2de8c8] text-2xl' />
          </div>
        </div>
      </div>

      {/* Right content */}
      <div className='flex flex-col items-start gap-3.5 flex-1 text-left'>
        <span className='text-[9px] font-bold tracking-[0.14em] uppercase text-[#3d5060]'>
          — Precision Trading
        </span>

        <h1 className='font-display text-2xl sm:text-3xl font-extrabold text-[#e8edf2] tracking-tight leading-tight'>
          Copy Trading
          <br />
          Made Simple
        </h1>

        <div className='flex flex-col gap-3 w-full'>
          {features.map(f => (
            <div key={f.title} className='flex items-start gap-3'>
              <div className='w-7 h-7 rounded-lg bg-[rgba(45,232,200,0.12)] border border-[rgba(45,232,200,0.32)] flex items-center justify-center flex-shrink-0 mt-0.5'>
                {f.icon}
              </div>
              <div>
                <p className='text-[13px] font-semibold text-[#e8edf2] leading-tight mb-0.5'>
                  {f.title}
                </p>
                <p className='text-[11px] text-[#7a8fa0] leading-relaxed'>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          className='bg-[#2de8c8] text-[#041a15] font-bold text-sm px-8 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 min-w-[160px] cursor-pointer'
        >
          Continue
        </button>

        <p className='text-[9px] tracking-widest uppercase text-[#3d5060]'>
          Full tech of checkout FAQ
        </p>
      </div>
    </div>
  )
}
