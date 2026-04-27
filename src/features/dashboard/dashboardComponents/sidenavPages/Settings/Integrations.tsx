import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { FaTelegramPlane } from 'react-icons/fa'
import { FaDiscord, FaXTwitter } from 'react-icons/fa6'
import { authFetch } from '../../../../../core/query/authClient'

// ─── Types ────────────────────────────────────────────────────────────────────
type IntegrationName = 'Telegram' | 'Discord' | 'X (Twitter)'

type Integration = {
  name: IntegrationName
  description: string
  icon: React.ReactNode
}

// ─── Static config (UI only — no `connected` here anymore) ───────────────────
const integrations: Integration[] = [
  {
    name: 'Telegram',
    description: 'Instant notifications',
    icon: <FaTelegramPlane size={18} />
  },
  {
    name: 'Discord',
    description: 'Community alerts',
    icon: <FaDiscord size={18} />
  },
  {
    name: 'X (Twitter)',
    description: 'Share trades',
    icon: <FaXTwitter size={18} />
  }
]

// ─── OAuth URLs ───────────────────────────────────────────────────────────────
const REDIRECT_BASE = window.location.origin

function getConnectURL (name: IntegrationName): string {
  switch (name) {
    case 'Discord':
      return (
        `https://discord.com/oauth2/authorize` +
        `?client_id=YOUR_DISCORD_CLIENT_ID` +
        `&scope=identify` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(
          REDIRECT_BASE + '/callback/discord'
        )}`
      )
    case 'X (Twitter)':
      // In production: generate code_verifier/challenge dynamically (PKCE)
      return (
        `https://twitter.com/i/oauth2/authorize` +
        `?client_id=YOUR_TWITTER_CLIENT_ID` +
        `&scope=tweet.read%20users.read` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(
          REDIRECT_BASE + '/callback/twitter'
        )}` +
        `&code_challenge=YOUR_PKCE_CHALLENGE` +
        `&code_challenge_method=S256`
      )
    case 'Telegram':
      // Telegram uses a bot deep-link — no OAuth redirect
      return `https://t.me/YOUR_BOT_USERNAME?start=link_YOUR_WALLET`
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Integrations () {
  const { connected, publicKey } = useWallet()

  // Tracks which platforms are connected — fetched from your backend
  const [status, setStatus] = useState<Record<IntegrationName, boolean>>({
    Telegram: false,
    Discord: false,
    'X (Twitter)': false
  })

  const [loading, setLoading] = useState<IntegrationName | null>(null)

  // 1️⃣ On wallet connect, fetch the user's real integration status
  useEffect(() => {
    if (!connected || !publicKey) return

    authFetch<Record<IntegrationName, boolean>>(`/api/integrations/status?wallet=${publicKey.toBase58()}`)
      .then(data => setStatus(data)) // e.g. { Telegram: true, Discord: false, ... }
      .catch(console.error)
  }, [connected, publicKey])

  // 2️⃣ Connect: redirect to OAuth page (or open Telegram bot link)
  const handleConnect = (name: IntegrationName) => {
    const url = getConnectURL(name)

    if (name === 'Telegram') {
      window.open(url, '_blank') // Opens Telegram app / web
      return
    }

    // Save wallet so your /callback route knows who to link the token to
    sessionStorage.setItem('pendingIntegration', name)
    sessionStorage.setItem('walletAddress', publicKey!.toBase58())
    window.location.href = url // Redirect to Discord/Twitter OAuth
  }

  // 3️⃣ Disconnect: call your backend to revoke the stored token
  const handleDisconnect = async (name: IntegrationName) => {
    setLoading(name)
    try {
      await authFetch(`/api/integrations/${name.toLowerCase()}/disconnect`, {
        method: 'DELETE',
        body: JSON.stringify({ wallet: publicKey!.toBase58() })
      })
      setStatus(prev => ({ ...prev, [name]: false }))
    } catch (err) {
      console.error('Disconnect failed', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {!connected ? (
        <div className='w-full max-w-3xl'>
          <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
            PROFILE & IDENTITY
          </h1>
          <p className='text-xs sm:text-sm text-textMuted mt-1 mb-6'>
            Connect your wallet to manage your profile
          </p>
          <div className='rounded-xl border border-borderSubtle p-5 sm:p-6 bg-gradient-to-b from-cardTop to-cardBottom'>
            <p className='text-textMuted text-sm text-center py-8'>
              Please connect your wallet to view and edit your profile settings.
            </p>
          </div>
        </div>
      ) : (
        <section className='w-full bg-[#050A0A] text-white font-inter px-6 py-10'>
          {/* Header — unchanged */}
          <div className='mb-8'>
            <h2 className='text-[18px] font-semibold tracking-wide'>
              EXTERNAL INTEGRATIONS
            </h2>
            <p className='text-[13px] text-[#7A8F8E] mt-1'>
              Connect third-party platforms for enhanced notifications
            </p>
          </div>

          {/* Cards — unchanged layout, dynamic data */}
          <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 max-w-[760px]'>
            {integrations.map(item => {
              const isConnected = status[item.name]
              const isLoading = loading === item.name

              return (
                <div
                  key={item.name}
                  className='bg-[#102221] border border-[#1C3A39] rounded-xl p-5 flex flex-col justify-between'
                >
                  {/* Top */}
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 bg-[#0C1E1D] rounded-md flex items-center justify-center'>
                        {item.icon}
                      </div>
                      <div>
                        <p className='text-[14px] font-medium'>{item.name}</p>
                        <p className='text-[12px] text-[#7A8F8E]'>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    {isConnected ? (
                      <span className='text-[10px] px-2 py-[3px] rounded-md bg-[#0F3D2E] text-[#22C55E]'>
                        CONNECTED
                      </span>
                    ) : (
                      <span className='text-[10px] px-2 py-[3px] rounded-md bg-[#1B2C2B] text-[#7A8F8E]'>
                        NOT CONNECTED
                      </span>
                    )}
                  </div>

                  {/* Button — now wired up */}
                  <button
                    disabled={isLoading}
                    onClick={() =>
                      isConnected
                        ? handleDisconnect(item.name)
                        : handleConnect(item.name)
                    }
                    className={`mt-5 w-full text-[12px] font-semibold tracking-wider rounded-lg py-2 border transition disabled:opacity-50
                      ${
                        isConnected
                          ? 'bg-[#3A1F1F] border-[#7F1D1D] text-red-400 hover:bg-[#472525]'
                          : 'bg-[#123F63] border-[#1E5C8A] text-[#60A5FA] hover:bg-[#174e7a]'
                      }`}
                  >
                    {isLoading
                      ? 'DISCONNECTING…'
                      : isConnected
                      ? 'DISCONNECT'
                      : `CONNECT ${item.name
                          .toUpperCase()
                          .replace(' (TWITTER)', ' TWITTER')}`}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
