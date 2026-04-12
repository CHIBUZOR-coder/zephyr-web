import { BsCheckLg } from 'react-icons/bs'
import type { StepProps } from '../Types'

const flowNodes = [
  {
    icon: '/images/protrader.svg',
    label: 'Pro Trader',
    desc: 'Executes Strategy',
    center: false
  },
  {
    icon: '/images/protocol.svg',
    label: 'Zephyr Protocol',
    desc: 'On-Chain Matching',
    center: true
  },
  {
    icon: '/images/copier.svg',
    label: 'You (The Copier)',
    desc: 'Automatic Mirroring',
    center: false
  }
]

const checks = [
  'Traders execute trades',
  'You can copy them automatically',
  'Everything runs on-chain'
]

export default function Step2HowItWorks ({ onNext, onBack }: StepProps) {
  return (
    <div className='flex flex-col items-center text-center gap-4 animate-fade-up w-full'>
      <div className='flex gap-1 flex-col'>
        <h1 className='font-display text-[18px] lg:text-[22px] font-extrabold text-[#e8edf2] tracking-tight'>
          How Zephyr Works
        </h1>
        <p className='text-xs text-[#7a8fa0]'>
          Demystifying the future of social trading
        </p>
      </div>

      {/* Flow diagram */}
      <div className='flex items-center justify-center gap-3 flex-wrap mt-1'>
        {flowNodes.map((node, i) => (
          <div key={node.label} className='flex items-center gap-3'>
            <div className='flex flex-col items-center gap-1.5 min-w-[76px]'>
              <div
                className={`p-4 rounded-md ${
                  node.center
                    ? ' bg-[#0a0f14] border-[#66DAC2]'
                    : ' bg-[#111d27] border-gray-600'
                } border-[1px] `}
              >
                <span
                  style={{ backgroundImage: `url(${node.icon})` }}
                  className={`flex items-center justify-center  bg-center bg-cover h-8 w-8`}
                ></span>
              </div>
              <span className='text-[11px] font-semibold text-[#e8edf2] leading-tight text-center'>
                {node.label}
              </span>
              <span className='text-[8px] uppercase tracking-widest text-[#3d5060] text-center'>
                {node.desc}
              </span>
            </div>
            {i < flowNodes.length - 1 && (
              <span className='text-[#3d5060] text-sm hidden sm:block'>→</span>
            )}
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className='flex flex-col gap-2 w-full max-w-sm'>
        {checks.map(item => (
          <div
            key={item}
            className='flex items-center gap-3 bg-[#111d27] border border-[rgba(255,255,255,0.07)] rounded-lg px-3.5 py-2.5 text-left'
          >
            <div className='w-5 h-5 rounded-full bg-[rgba(45,232,200,0.12)] border border-[rgba(45,232,200,0.32)] flex items-center justify-center flex-shrink-0'>
              <BsCheckLg className='text-[#2de8c8] text-[10px]' />
            </div>
            <span className='text-xs text-[#DEE3EA]'>{item}</span>
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className='flex items-center gap-3 w-full max-w-sm'>
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
          Continue
        </button>
      </div>
    </div>
  )
}
