import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect, useRef } from 'react'
import { FiLock, FiGlobe, FiExternalLink } from 'react-icons/fi'

type ToggleItemProps = {
  title: string
  description: string
  value: boolean
  onChange: () => void
}

function ToggleItem ({ title, description, value, onChange }: ToggleItemProps) {
  return (
    <div className='flex items-center justify-between bg-[#061B19] border border-[#1A3D39] rounded-lg px-4 py-3'>
      <div>
        <p className='text-sm font-medium text-white'>{title}</p>
        <p className='text-xs text-[#7A9E9A]'>{description}</p>
      </div>

      <button
        type='button'
        onClick={onChange}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
          value ? 'bg-[#11B89A]' : 'bg-[#2A2F2E]'
        }`}
      >
        <span
          className={`h-4 w-4 bg-white rounded-full transform transition ${
            value ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}

export default function Privacy () {
  const { connected, publicKey } = useWallet()
  const [publicProfile, setPublicProfile] = useState<boolean>(true)
  const [portfolioValue, setPortfolioValue] = useState<boolean>(false)
  const [tradingHistory, setTradingHistory] = useState<boolean>(true)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch saved settings when wallet connects
  useEffect(() => {
    if (!connected || !publicKey) return
    fetch(`/api/privacy/settings?wallet=${publicKey.toBase58()}`)
      .then(r => r.json())
      .then(data => {
        if (data.publicProfile !== undefined)
          setPublicProfile(data.publicProfile)
        if (data.portfolioValue !== undefined)
          setPortfolioValue(data.portfolioValue)
        if (data.tradingHistory !== undefined)
          setTradingHistory(data.tradingHistory)
      })
      .catch(console.error)
  }, [connected, publicKey])

  // Debounced save — fires 800ms after last toggle
  const savePrivacySettings = (updated: {
    publicProfile: boolean
    portfolioValue: boolean
    tradingHistory: boolean
  }) => {
    if (!publicKey) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch('/api/privacy/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toBase58(), ...updated })
      }).catch(console.error)
    }, 800)
  }

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
        <div className='min-h-screen bg-[#020A09] text-white flex justify-center px-4 py-10'>
          <div className='w-full max-w-3xl space-y-6'>
            {/* Header */}
            <div>
              <h1 className='text-xl font-semibold tracking-wide'>
                PRIVACY & VISIBILITY
              </h1>
              <p className='text-sm text-[#7A9E9A] mt-1'>
                Control your profile visibility and trading transparency
              </p>
            </div>

            {/* Visibility Controls */}
            <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-4'>
              <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
                <FiLock />
                VISIBILITY CONTROLS
              </div>

              <ToggleItem
                title='Public Profile Visibility'
                description='Allow others to view your profile page'
                value={publicProfile}
                onChange={() => {
                  const next = !publicProfile
                  setPublicProfile(next)
                  savePrivacySettings({
                    publicProfile: next,
                    portfolioValue,
                    tradingHistory
                  })
                }}
              />

              <ToggleItem
                title='Show Portfolio Value'
                description='Display total portfolio value publicly'
                value={portfolioValue}
                onChange={() => {
                  const next = !portfolioValue
                  setPortfolioValue(next)
                  savePrivacySettings({
                    publicProfile,
                    portfolioValue: next,
                    tradingHistory
                  })
                }}
              />

              <ToggleItem
                title='Show Trading History'
                description='Display past trades and positions publicly'
                value={tradingHistory}
                onChange={() => {
                  const next = !tradingHistory
                  setTradingHistory(next)
                  savePrivacySettings({
                    publicProfile,
                    portfolioValue,
                    tradingHistory: next
                  })
                }}
              />
            </div>

            {/* On-chain transparency */}
            <div className='rounded-xl border border-[#1A3D39] bg-[#061B19] p-5 space-y-3'>
              <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
                <FiGlobe />
                On-Chain Transparency
              </div>

              <p className='text-xs text-[#7A9E9A]'>
                All trading activity is publicly visible on the blockchain.
                Privacy settings control visibility within the platform UI only.
              </p>

              <div className='flex flex-wrap gap-4 text-sm text-[#11B89A]'>
                <a href='#' className='flex items-center gap-1 hover:underline'>
                  View Wallets on Explorer
                  <FiExternalLink size={14} />
                </a>

                <a href='#' className='flex items-center gap-1 hover:underline'>
                  View Vaults on Explorer
                  <FiExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
