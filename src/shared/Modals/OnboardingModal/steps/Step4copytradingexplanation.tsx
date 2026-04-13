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

export default function Step4CopyTradingExplanation ({
  onNext,
  onBack
}: StepProps) {
  return (
    <div className='flex flex-col sm:flex-row items-center gap-12 animate-fade-up w-full lg:w-1/2'>
      {/* Left visual panel */}
      <div className='relative p-5 w-full lg:w-[40%] bg-[#171C2180] border-2 border-[#3D494626] rounded-md'>
        <div
          style={{ backgroundImage: `url("/images/copyimage.png")` }}
          className='  bg-center bg-cover  w-full h-[250px] bg-[#0c1720] border border-[rgba(255,255,255,0.07)] rounded-2xl flex items-center justify-center shadow-[0px_0px_20px_rgba(255,255,255,0.2)]'
        >
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(45,232,200,0.07)_0%,transparent_70%)]' />
          {/* + button */}
          <div className='absolute -top-4 -right-4 border-2 border-[#3D494626] bg-[#171C21] p-2 rounded-md'>
            <span
              style={{ backgroundImage: `url("/images/stars.svg")` }}
              className='bg-center bg-cover h-[22px] w-[22px] flex justify-center items-center '
            ></span>
          </div>

          <span
            style={{ backgroundImage: `url("/images/padl.svg")` }}
            className='bg-center bg-cover h-[32px] w-[32px] flex justify-center items-center '
          ></span>
        </div>
      </div>

      {/* Right content */}
      <div className='flex flex-col items-start gap-3.5 flex-1 text-left w-full lg:w-[60%] relative'>
        <span className='text-[9px] font-bold tracking-[0.14em] uppercase text-[#66DAC2]'>
          — Precision Trading
        </span>

        <h1 className='font-display text-2xl sm:text-3xl text-[#e8edf2] tracking-tight leading-tight grok font-[400]'>
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
                <p className='text-[13px] font-semibold text-[#DEE3EA] leading-tight mb-0.5'>
                  {f.title}
                </p>
                <p className='text-[11px] text-[#BCC9C4] leading-relaxed'>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Actions ── */}
        <div className='flex items-center gap-3 w-full'>
          <button
            onClick={onBack}
            className='flex-1 py-3 bg-transparent border border-[rgba(255,255,255,0.07)] rounded-lg text-[#BCC9C4] text-sm font-bold hover:border-[rgba(255,255,255,0.15)] hover:text-[#e8edf2] transition-all duration-150 cursor-pointer'
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className='flex-[2] bg-[#66DAC2] text-[#041a15] font-bold text-sm px-8 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 cursor-pointer'
          >
            Continue
          </button>
        </div>

        <p className='text-[9px] tracking-widest uppercase text-[#BCC9C499] pb-4 text-center mt-1 w-full'>
          FINAL STEP OF ONBOARDING
        </p>
      </div>
    </div>
  )
}
