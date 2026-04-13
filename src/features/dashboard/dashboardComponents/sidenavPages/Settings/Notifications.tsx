import { useWallet } from '@solana/wallet-adapter-react'

import { useState } from 'react'
import { IoNotificationsOutline } from 'react-icons/io5'

type NotificationSetting = {
  title: string
  description: string
  enabled: boolean
}

export default function Notifications () {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      title: 'Trade Execution Alerts',
      description: 'Get notified when trades are executed',
      enabled: true
    },
    {
      title: 'Vault Activity Notifications',
      description: 'Alerts for vault deposits, withdrawals, and updates',
      enabled: true
    },
    {
      title: 'Copy Trading Updates',
      description: 'Notifications when masters you copy make trades',
      enabled: true
    }
  ])

  const toggleSetting = (index: number) => {
    const updated = [...settings]
    updated[index].enabled = !updated[index].enabled
    setSettings(updated)
  }
  const { connected } = useWallet()
  return (
    <div>
      {!connected ? (
        <>
          <div className='w-full max-w-3xl'>
            <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
              PROFILE & IDENTITY
            </h1>
            <p className='text-xs sm:text-sm text-textMuted mt-1 mb-6'>
              Connect your wallet to manage your profile
            </p>
            <div className='rounded-xl border border-borderSubtle p-5 sm:p-6 bg-gradient-to-b from-cardTop to-cardBottom'>
              <p className='text-textMuted text-sm text-center py-8'>
                Please connect your wallet to view and edit your profile
                settings.
              </p>
            </div>
          </div>
        </>
      ) : (
        <section className='bg-[#040B0B] text-white font-inter px-6 py-10 min-h-screen'>
          {/* Page Title */}
          <div className='mb-8'>
            <h1 className='text-[18px] font-semibold tracking-wide'>
              PUSH NOTIFICATIONS
            </h1>

            <p className='text-[13px] text-[#7C9190] mt-1'>
              Manage your real-time notification preferences
            </p>
          </div>

          {/* Card */}
          <div className='max-w-[760px] rounded-xl border border-[#1A3A39] bg-gradient-to-br from-[#0F2E2D] to-[#0A1F1E] p-6'>
            {/* Card Title */}
            <div className='flex items-center gap-2 mb-6 text-[13px] font-semibold text-[#CFE6E5]'>
              <IoNotificationsOutline size={16} className='text-[#2DD4BF]' />
              NOTIFICATION PREFERENCES
            </div>

            {/* Notification Rows */}
            <div className='space-y-4'>
              {settings.map((item, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded-lg bg-[#0C2322] px-5 py-4'
                >
                  <div>
                    <p className='text-[14px] font-medium'>{item.title}</p>

                    <p className='text-[12px] text-[#7C9190]'>
                      {item.description}
                    </p>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleSetting(index)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                      item.enabled ? 'bg-[#14B8A6]' : 'bg-[#233B3A]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                        item.enabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
