import { RiUserStarLine } from 'react-icons/ri'
import { MdOutlineAutoGraph } from 'react-icons/md'
import { FiUsers } from 'react-icons/fi'
import { BsCheckLg } from 'react-icons/bs'
import type { StepProps } from '../Types'


const flowNodes = [
  {
    icon: <RiUserStarLine className='text-[#2de8c8] text-lg' />,
    label: 'Pro Trader',
    desc: 'Executes Strategy',
    center: false
  },
  {
    icon: <MdOutlineAutoGraph className='text-[#2de8c8] text-xl' />,
    label: 'Zephyr Protocol',
    desc: 'On-Chain Matching',
    center: true
  },
  {
    icon: <FiUsers className='text-[#2de8c8] text-lg' />,
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

export default function Step2HowItWorks ({ onNext }: StepProps) {
  return (
    <div className='flex flex-col items-center text-center gap-5 animate-fade-up w-full'>
      <h1 className='font-display text-3xl sm:text-4xl font-extrabold text-[#e8edf2] tracking-tight'>
        How Zephyr Works
      </h1>
      <p className='text-xs text-[#7a8fa0]'>
        Demystifying the future of social trading
      </p>

      {/* Flow diagram */}
      <div className='flex items-center justify-center gap-3 flex-wrap mt-1'>
        {flowNodes.map((node, i) => (
          <div key={node.label} className='flex items-center gap-3'>
            <div className='flex flex-col items-center gap-1.5 min-w-[76px]'>
              <div
                className={`flex items-center justify-center rounded-xl border ${
                  node.center
                    ? 'w-12 h-12 bg-[rgba(45,232,200,0.12)] border-[rgba(45,232,200,0.32)]'
                    : 'w-11 h-11 bg-[#111d27] border-[rgba(255,255,255,0.07)]'
                }`}
              >
                {node.icon}
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
            <span className='text-xs text-[#7a8fa0]'>{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className='bg-[#2de8c8] text-[#041a15] font-bold text-sm px-10 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 min-w-[180px] cursor-pointer'
      >
        Continue
      </button>
    </div>
  )
}
