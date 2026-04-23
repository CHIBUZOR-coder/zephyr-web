import { FaCopy, FaUserPlus, FaShareAlt, FaTelegramPlane } from 'react-icons/fa'
import { FaCheck } from 'react-icons/fa'
import type { ReactNode } from 'react'
import type { Trader } from '../../../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import { useGeneralContext } from '../../../Context/GeneralContext'

import { getTier, isCommunityTier } from '../../../utils/Gettiter'

import { Link } from 'react-router-dom'
import {  RiTwitterXFill } from 'react-icons/ri'

type ProfileHeaderProps = {
  trader: Trader
}

type ActionBtnProps = {
  icon: ReactNode
  label: string
  primary?: boolean
  trader: Trader
}

function formatDate (dateStr: string | undefined): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatRelativeTime (dateStr: string | undefined): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(dateStr)
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
            {isCommunityTier(trader.tag) ? (
              <span className='flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium border-[1.1px] bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]'>
                <FaCheck className='text-[8px]' />
                {trader.tag}
              </span>
            ) : (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium border-[1.1px] ${
                  tier
                    ? `${tier.text} ${tier.bg} ${tier.border}`
                    : 'text-gray-400 bg-gray-200/20 border-gray-300'
                }`}
              >
                {trader.tag || 'Unranked'}
              </span>
            )}
          </div>

          <p className='text-xs text-gray-400'>{trader.tag}</p>

          <p className='text-xs text-gray-400 max-w-md leading-relaxed'>
            Master trader on Zephyr Protocol.
          </p>

          <div className='flex items-center gap-6 text-xs mt-2'>
            <div>
              <p className='text-gray-500'>JOINED</p>
              <p className='text-white font-medium'>
                {formatDate(trader.createdAt)}
              </p>
            </div>

            <div>
              <p className='text-gray-500'>LAST ACTIVE</p>
              <p className='text-green-400 font-medium'>
                {formatRelativeTime(trader.updatedAt)}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link
              to={'#'}
              className='flex items-center justify-center bg-[#0c1414] h-[27px] w-[27px] rounded-full
'
            >
              <FaTelegramPlane className='w-4 h-4  text-white' />
            </Link>

            <Link
              to={'#'}
              className=' flex items-center justify-center bg-[#0c1414] h-[27px] w-[27px] rounded-full'
            >
              <RiTwitterXFill className='w-3 h-3 text-white' />
            </Link>
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
