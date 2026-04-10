
import { BsWallet2 } from 'react-icons/bs'
import { MdQrCode2 } from 'react-icons/md'
import { RiShieldCheckLine } from 'react-icons/ri'
import type { StepProps } from '../Types'


const wallets = [
  {
    id: 'phantom',
    badge: 'Popular',
    name: 'Phantom',
    desc: 'The most trusted wallet for Solana and Ethereum assets.',
    icon:<BsWallet2 className='text-2xl text-[#ab9ff2]' />
,
    iconBg: 'bg-[rgba(171,159,242,0.12)] border-[rgba(171,159,242,0.28)]'
  },
  {
    id: 'walletconnect',
    badge: 'Universal',
    name: 'WalletConnect',
    desc: 'Connect to hundreds of wallets via secure QR code scanning.',
    icon: <MdQrCode2 className='text-2xl text-[#3b99fc]' />,
    iconBg: 'bg-[rgba(59,153,252,0.12)] border-[rgba(59,153,252,0.28)]'
  }
]

export default function Step5ConnectWallet ({ onNext }: StepProps) {
  return (
    <div className='flex flex-col items-center text-center gap-5 animate-fade-up w-full'>
      <span className='text-[9px] font-bold tracking-[0.14em] uppercase text-[#2de8c8] bg-[rgba(45,232,200,0.08)] border border-[rgba(45,232,200,0.2)] rounded-full px-3 py-1'>
        ● Step 5: Security
      </span>

      <h1 className='font-display text-3xl sm:text-4xl font-extrabold text-[#e8edf2] tracking-tight'>
        Connect Your Wallet
      </h1>

      <p className='text-xs text-[#7a8fa0] max-w-xs leading-relaxed'>
        Unlock the full potential of the Ethereal Exchange by linking your
        preferred digital asset vault. Secure, decentralized, and seamless.
      </p>

      {/* Wallet cards */}
      <div className='flex gap-3 w-full flex-col sm:flex-row'>
        {wallets.map(w => (
          <button
            key={w.id}
            className='flex-1 text-left bg-[#0c1720] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 flex flex-col gap-2 cursor-pointer hover:border-[rgba(45,232,200,0.32)] hover:bg-[#0f1e2a] transition-all duration-200'
          >
            <span className='text-[8px] font-bold tracking-widest uppercase text-[#3d5060]'>
              {w.badge}
            </span>
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center ${w.iconBg}`}
            >
              {w.icon}
            </div>
            <p className='font-display font-bold text-sm text-[#e8edf2]'>
              {w.name}
            </p>
            <p className='text-[11px] text-[#7a8fa0] leading-relaxed'>
              {w.desc}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        className='bg-[#2de8c8] text-[#041a15] font-bold text-sm px-10 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 min-w-[200px] cursor-pointer'
      >
        Connect Wallet
      </button>

      <div className='flex items-center gap-1.5 text-[#3d5060]'>
        <RiShieldCheckLine className='text-xs' />
        <span className='text-[9px] tracking-widest uppercase'>
          Safe &amp; Secure Encryption Guarantee
        </span>
      </div>
    </div>
  )
}
