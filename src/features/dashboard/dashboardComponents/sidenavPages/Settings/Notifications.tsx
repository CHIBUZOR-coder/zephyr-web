import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect, useRef } from 'react' // ← added useEffect, useRef
import { IoNotificationsOutline } from 'react-icons/io5'
import { authFetch } from '../../../../../core/query/authClient'

type NotificationSetting = {
  key: string // ← added: stable identifier for the backend
  title: string
  description: string
  enabled: boolean
}

const DEFAULT_SETTINGS: NotificationSetting[] = [
  {
    key: 'trade_execution',
    title: 'Trade Execution Alerts',
    description: 'Get notified when trades are executed',
    enabled: true
  },
  {
    key: 'vault_activity',
    title: 'Vault Activity Notifications',
    description: 'Alerts for vault deposits, withdrawals, and updates',
    enabled: true
  },
  {
    key: 'copy_trading',
    title: 'Copy Trading Updates',
    description: 'Notifications when masters you copy make trades',
    enabled: true
  }
]

export default function Notifications () {
  const { connected, publicKey } = useWallet() // ← added publicKey

  const [settings, setSettings] =
    useState<NotificationSetting[]>(DEFAULT_SETTINGS)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1️⃣ On wallet connect → fetch saved preferences from backend
  useEffect(() => {
    if (!connected || !publicKey) return

    authFetch<Record<string, boolean>>(`/api/notifications/preferences?wallet=${publicKey.toBase58()}`)
      .then((data: Record<string, boolean>) => {
        // data = { trade_execution: true, vault_activity: false, copy_trading: true }
        setSettings(prev =>
          prev.map(s => ({ ...s, enabled: data[s.key] ?? s.enabled }))
        )
      })
      .catch(console.error)
  }, [connected, publicKey])

  // 2️⃣ Debounced save — fires 800ms after the last toggle
  const savePreferences = (updated: NotificationSetting[]) => {
    if (!publicKey) return
    if (saveTimer.current) clearTimeout(saveTimer.current)

    saveTimer.current = setTimeout(() => {
      const payload = Object.fromEntries(updated.map(s => [s.key, s.enabled]))
      // payload = { trade_execution: true, vault_activity: false, copy_trading: true }

      authFetch('/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          preferences: payload
        })
      }).catch(console.error)
    }, 800)
  }

  // 3️⃣ Toggle + trigger save
  const toggleSetting = (index: number) => {
    const updated = [...settings]
    updated[index] = { ...updated[index], enabled: !updated[index].enabled }
    setSettings(updated)
    savePreferences(updated) // ← this is the only new thing here
  }

  // ─── UI below is 100% unchanged ──────────────────────────────────────────
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
          <div className='mb-8'>
            <h1 className='text-[18px] font-semibold tracking-wide'>
              PUSH NOTIFICATIONS
            </h1>
            <p className='text-[13px] text-[#7C9190] mt-1'>
              Manage your real-time notification preferences
            </p>
          </div>

          <div className='max-w-[760px] rounded-xl border border-[#1A3A39] bg-gradient-to-br from-[#0F2E2D] to-[#0A1F1E] p-6'>
            <div className='flex items-center gap-2 mb-6 text-[13px] font-semibold text-[#CFE6E5]'>
              <IoNotificationsOutline size={16} className='text-[#2DD4BF]' />
              NOTIFICATION PREFERENCES
            </div>

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
