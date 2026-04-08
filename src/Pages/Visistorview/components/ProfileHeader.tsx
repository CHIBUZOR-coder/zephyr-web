import { FaCopy, FaUserPlus, FaShareAlt } from 'react-icons/fa'
import type { ReactNode } from 'react'
import type { Trader } from '../../../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import { useGeneralContext } from '../../../Context/GeneralContext'

import { getTier } from '../../../utils/Gettiter'

type ProfileHeaderProps = {
  trader: Trader
}

type ActionBtnProps = {
  icon: ReactNode
  label: string
  primary?: boolean
  trader: Trader
}

export default function ProfileHeader ({ trader }: ProfileHeaderProps) {
  const tier = getTier(trader.tag)
  const initials = trader.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className='bg-gradient-to-r from-[#0b2c2c] to-[#051a1a] rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 border border-white/5'>
      {/* ================= LEFT SIDE ================= */}
      <div className='flex gap-4'>
        {/* Avatar */}
        {trader.image ? (
          <img
            src={trader.image}
            className='w-16 h-16 rounded-xl object-cover'
          />
        ) : (
          <div className='w-16 h-16 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-lg'>
            {initials}
          </div>
        )}

        {/* Info */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold'>{trader.name}</h2>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-medium border-[1.1px] ${
                tier
                  ? `${tier.text} ${tier.bg} ${tier.border}`
                  : 'text-gray-400 bg-gray-200/20 border-gray-300'
              }`}
            >
              {trader.tag || 'Unranked'}
            </span>
          </div>

          <p className='text-xs text-gray-400'>{trader.tag}</p>

          {/* Description (static for now to match UI) */}
          <p className='text-xs text-gray-400 max-w-md leading-relaxed'>
            Institutional DeFi trader specializing in high-conviction altcoin
            momentum plays. 3+ years on-chain. Risk-first approach with strict
            drawdown controls.
          </p>

          {/* Bottom meta */}
          <div className='flex items-center gap-6 text-xs mt-2'>
            <div>
              <p className='text-gray-500'>JOINED</p>
              <p className='text-white font-medium'>Jan 2023</p>
            </div>

            <div>
              <p className='text-gray-500'>LAST ACTIVE</p>
              <p className='text-green-400 font-medium'>2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className='flex flex-col gap-3 w-full md:w-[220px]'>
        <ActionBtn
          icon={<FaCopy />}
          label='Copy Trader'
          trader={trader}
          primary
        />

        <ActionBtn icon={<FaUserPlus />} label='Follow' trader={trader} />

        <ActionBtn
          icon={<FaShareAlt />}
          label='Share Profile'
          trader={trader}
        />

        {/* Footer note */}
        <div className='text-[10px] text-gray-500 bg-[#0d2b2b] rounded-lg p-2 text-center border border-white/5'>
          Fees apply only on profitable trades.
          <br />
          High-water mark enforced
        </div>
      </div>
    </div>
  )
}

function ActionBtn ({ icon, label, primary, trader }: ActionBtnProps) {
  const { openVaultFlow } = useGeneralContext()
  return (
    <button
      onClick={() => {
        if (label === 'Copy Trader') {
          openVaultFlow(1, trader)
        }
      }}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition active:scale-95 ${
        primary
          ? 'bg-teal-600 hover:bg-teal-500 text-white'
          : 'bg-[#0d2b2b] hover:bg-[#133c3c] text-gray-200 border border-white/5'
      }`}
    >
      <span className='text-xs'>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
