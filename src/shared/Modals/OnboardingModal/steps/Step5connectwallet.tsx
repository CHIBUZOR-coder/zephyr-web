
import { RiShieldCheckLine } from 'react-icons/ri'
import type { StepProps } from '../Types'

const wallets = [
  {
    id: 'phantom',
    badge: 'Popular',
    name: 'Phantom',
    desc: 'The most trusted wallet for Solana and Ethereum assets.',
    icon: "/images/phantom.jpg",
    iconBg: 'bg-[rgba(171,159,242,0.12)] border-[rgba(171,159,242,0.28)]'
  },
  {
    id: 'walletconnect',
    badge: 'Universal',
    name: 'WalletConnect',
    desc: 'Connect to hundreds of wallets via secure QR code scanning.',
     icon: "/images/wallfive.jpg",
    iconBg: 'bg-[rgba(59,153,252,0.12)] border-[rgba(59,153,252,0.28)]'
  }
]

export default function Step5ConnectWallet ({ onNext, onBack }: StepProps) {
  return (
    <div className='flex flex-col items-center justify-center text-center gap-5 animate-fade-up w-full'>
      {/* Wallet cards */}
      <div className='flex  w-full lg:w-[60%] flex-col gap-4 justify-center items-center pt-8 lg:pt-0'>
        <span className='text-[9px] font-bold tracking-[0.14em] uppercase text-[#2de8c8] bg-[rgba(45,232,200,0.08)] border border-[rgba(45,232,200,0.2)] rounded-full px-3 py-1 w-40'>
          ● Step 5: Security
        </span>

        <h1 className='font-display text-3xl sm:text-4xl font-extrabold text-[#e8edf2] tracking-tight'>
          Connect Your Wallet
        </h1>

        <p className='text-xs text-[#7a8fa0]  leading-relaxed w-full lg:w-1/2'>
          Unlock the full potential of the Ethereal Exchange by linking your
          preferred digital asset vault. Secure, decentralized, and seamless.
        </p>
        <div className='w-full flex  flex-col lg:flex-row gap-8 mt-5'>
          {wallets.map(w => (
            <button
              key={w.id}
              className='flex-1 text-left bg-[#12171c] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 flex flex-col gap-2 cursor-pointer hover:border-[rgba(45,232,200,0.32)] hover:bg-[#0f1e2a] transition-all duration-200 w-full lg:w-1/2'
            >
              <span className='text-[8px] font-bold tracking-widest uppercase text-[#3d5060]'>
                {w.badge}
              </span>
              <span
              style={{backgroundImage:`url(${w.icon})`}}
                className={`w-11 h-11 rounded-xl border flex items-center justify-center ${w.iconBg} bg-center bg-cover`}
              >
       
              </span>
              <p className='font-display font-bold text-sm text-[#DEE3EA]'>
                {w.name}
              </p>
              <p className='text-[11px] text-[#BCC9C4] leading-relaxed'>
                {w.desc}
              </p>
            </button>
          ))}
        </div>
        {/* ── Actions ── */}
        <div className='flex items-center gap-3 w-full'>
          <button
            onClick={onBack}
            className='flex-1 py-3 bg-transparent border border-[rgba(255,255,255,0.07)] rounded-lg text-[#7a8fa0] text-sm font-bold hover:border-[rgba(255,255,255,0.15)] hover:text-[#e8edf2] transition-all duration-150 cursor-pointer'
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className='flex-[2] bg-[#66DAC2] text-[#041a15] font-bold text-sm px-10 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 cursor-pointer'
          >
            Connect Wallet
          </button>
        </div>
      </div>

      <div className='flex items-center gap-1.5 text-[#BCC9C499]'>
        <RiShieldCheckLine className='text-xs' />
        <span className='text-[9px] tracking-widest uppercase'>
          Safe &amp; Secure Encryption Guarantee
        </span>
      </div>
    </div>
  )
}
