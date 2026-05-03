import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthLogin } from '../../../features/auth/useAuthLogin'
import { useAuthStore } from '../../../features/auth/auth.store'
import type { WalletName } from '@solana/wallet-adapter-base'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { Link } from 'react-router-dom'

type Props = {
  open: boolean
  onClose: () => void
}

// ── FIX 1: Computed once at module level, not on every render
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export const CustomWalletModal = ({ open, onClose }: Props) => {
  const {
    wallets,
    select,
    disconnect,
    wallet,
    connected,
    connecting,
    publicKey,
    signMessage
  } = useWallet()

  const loginMutation = useAuthLogin()
  const { authenticated } = useAuthStore()

  // Stable ref so callbacks never go stale
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // ── FIX 2: Single ref guard that prevents login from firing more than once
  // per modal session. Resets when the modal closes.
  const hasTriggeredLoginRef = useRef(false)
  useEffect(() => {
    if (!open) {
      // Reset guard when modal closes so next open starts fresh
      hasTriggeredLoginRef.current = false
    }
  }, [open])

  const detectedWallets = wallets.filter(w => {
    if (w.adapter.name === 'Mobile Wallet Adapter') return isMobile
    return (
      w.readyState === WalletReadyState.Installed ||
      w.readyState === WalletReadyState.Loadable
    )
  })

  // ── FIX 3: Single unified close effect instead of 5 competing ones.
  // Reads auth state directly from the store (not React state) to avoid
  // stale closure issues on mobile after returning from the wallet app.
  useEffect(() => {
    if (!open) return

    const tryClose = () => {
      if (useAuthStore.getState().authenticated) {
        onCloseRef.current()
      }
    }

    // Desktop: standard reactive close via the `authenticated` value
    if (!isMobile && authenticated) {
      onCloseRef.current()
      return
    }

    // Mobile: visibilitychange is the primary trigger (fires when user
    // returns from Phantom/Solflare signing screen)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') tryClose()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Mobile: polling as a fallback for browsers that miss visibilitychange
    const interval = setInterval(tryClose, 300)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [open, authenticated]) // authenticated kept so desktop close is reactive

  // ── FIX 4: loginMutation split into stable primitives in the dep array.
  // Using the full `loginMutation` object caused this to re-fire on every
  // render because the object reference changes each time.
  const { mutate, isPending, isSuccess } = loginMutation

  useEffect(() => {
    if (
      connected &&
      publicKey &&
      signMessage &&
      !authenticated &&
      !isPending &&
      !connecting &&
      !hasTriggeredLoginRef.current // guard: fire only once per session
    ) {
      hasTriggeredLoginRef.current = true
      mutate(
        {
          publicKey: publicKey.toBase58(),
          signMessage,
          onSuccessCallback: () => onCloseRef.current()
        },
        {
          onError: error => {
            console.error('Authentication failed:', error)
            // Reset guard on error so the user can retry
            hasTriggeredLoginRef.current = false
          }
        }
      )
    }
  }, [
    connected,
    publicKey,
    signMessage,
    authenticated,
    isPending,
    connecting,
    mutate
  ])

  // Close immediately when mutation resolves (covers edge cases where
  // the unified effect above missed the state transition)
  useEffect(() => {
    if (isSuccess && open) {
      onCloseRef.current()
    }
  }, [isSuccess, open])

  // ── handleWalletSelect: properly disconnects before switching wallets.
  // Key rules:
  //   1. If already connected to THIS wallet — do nothing (no double-connect)
  //   2. If mid-connection — bail early, never interrupt a connect in flight
  //   3. If switching wallets — disconnect first, wait 100ms for the adapter
  //      internal state to fully settle, THEN select the new one
  const handleWalletSelect = async (adapterName: WalletName) => {
    // Already on this wallet — nothing to do
    if (wallet?.adapter.name === adapterName && (connected || connecting))
      return

    // Never interrupt a connection already in flight
    if (connecting) return

    // Switching from one wallet to another — clean disconnect first
    if (connected && wallet?.adapter.name !== adapterName) {
      try {
        await disconnect()
      } catch (err) {
        console.warn('Disconnect before wallet switch failed:', err)
        // Continue anyway — adapter may already be in a disconnected state
      }
      // Wait for adapter internal state to settle after disconnect.
      // Without this gap, select() fires before the adapter is truly clean
      // and causes a race condition on mobile (stuck "Connecting..." state).
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    select(adapterName)
  }

  // ── Mobile manual connect: fires after select() settles the adapter.
  // A 150ms delay gives the adapter time to update readyState before
  // we call connect(), preventing "wallet not ready" errors on Android.
  useEffect(() => {
    if (
      !isMobile ||
      !wallet ||
      connected ||
      connecting ||
      wallet.adapter.readyState === WalletReadyState.NotDetected
    ) {
      return
    }

    const timeout = setTimeout(() => {
      wallet.adapter.connect().catch(err => {
        console.warn('Manual connection attempt failed:', err)
        // Don't reset hasTriggeredLoginRef here — the user needs to
        // explicitly retry by picking a wallet again
      })
    }, 150) // slight delay so adapter state is fully settled

    return () => clearTimeout(timeout)
  }, [wallet, connected, connecting])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className='fixed inset-0 bg-black/70 backdrop-blur-[2px] z-[90]'
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className='fixed inset-0 z-[100] flex items-center justify-center'
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <div
              className='w-[340px] rounded-2xl bg-[#22403f] border border-[#2a6b63] px-4 py-5'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='w-full flex flex-col gap-4'>
                  <h3 className='text-[17px] font-[900] text-white'>
                    Connect Wallet
                  </h3>
                  <div>
                    <p className='text-[10px] font-[700] text-white'>
                      Select Wallet
                    </p>
                    <div className='relative mb-4 mt-2 w-full'>
                      <div className='h-px w-full bg-[#303c62]' />
                      <div className='absolute left-0 top-0 h-[2px] w-10 bg-white rounded-full' />
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className='text-[#9fd5cc] hover:text-white transition'
                >
                  ✕
                </button>
              </div>

              {loginMutation.isError && (
                <div className='mb-4 p-2 rounded bg-red-900/50 border border-red-700'>
                  <p className='text-[11px] text-red-300'>
                    Authentication failed. Check your connection or try again.
                  </p>
                  <button
                    onClick={() => {
                      loginMutation.reset()
                      hasTriggeredLoginRef.current = false // allow retry
                    }}
                    className='mt-2 text-[10px] text-[#00f5c4] hover:underline'
                  >
                    Retry
                  </button>
                </div>
              )}

              <p className='mb-4 text-[11px] leading-relaxed text-[#b7e9df] bg-[#03463d] p-2 rounded'>
                Choose your preferred wallet to start trading on Solana.
              </p>

              <div className='mb-4 bg-[#03463d] p-3 rounded-lg'>
                <p className='text-[11px] font-semibold text-[#7fffd4] mb-1'>
                  🔒 Non-Custodial Security
                </p>
                <p className='text-[10px] text-[#b7e9df] leading-relaxed'>
                  Zephyr never has access to your private keys. All transactions
                  are signed by you.
                </p>
              </div>

              {detectedWallets.length === 0 ? (
                <div className='flex flex-col items-center gap-3 py-4'>
                  <p className='text-[12px] text-[#b7e9df] text-center'>
                    No wallets detected.
                  </p>
                  <p className='text-[10px] text-[#6f9f97] text-center leading-relaxed'>
                    {isMobile
                      ? "Install Phantom or Solflare from the App Store, then open this site inside the wallet's browser."
                      : 'Install a Solana wallet extension from the Chrome Web Store to continue.'}
                  </p>
                  <div className='flex gap-2 mt-1'>
                    <Link
                      to='https://phantom.app/download'
                      target='_blank'
                      rel='noreferrer'
                      className='text-[10px] text-[#00f5c4] border border-[#00f5c4] rounded px-3 py-1 hover:bg-[#00f5c4]/10 transition'
                    >
                      Get Phantom
                    </Link>

                    <Link
                      to='https://solflare.com/download'
                      target='_blank'
                      rel='noreferrer'
                      className='text-[10px] text-[#00f5c4] border border-[#00f5c4] rounded px-3 py-1 hover:bg-[#00f5c4]/10 transition'
                    >
                      Get Solflare
                    </Link>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  {detectedWallets.map(w => (
                    <button
                      key={w.adapter.name}
                      onClick={() => handleWalletSelect(w.adapter.name)}
                      className='
                        flex items-center justify-between
                        rounded-lg px-3 py-2.5
                        bg-[#03463d] hover:bg-[#13443e]
                        transition
                      '
                    >
                      <div className='flex items-center gap-3'>
                        <img
                          src={w.adapter.icon}
                          alt={w.adapter.name}
                          className='h-5 w-5'
                        />
                        <div className='flex flex-col items-start'>
                          <span className='text-[11px] font-semibold text-white'>
                            {w.adapter.name === 'Mobile Wallet Adapter'
                              ? 'Connect Wallet App'
                              : w.adapter.name}
                          </span>
                          {w.adapter.name === 'Phantom' && (
                            <span className='text-[9px] text-[#00f5c4]'>
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>
                      {connecting && wallet?.adapter.name === w.adapter.name ? (
                        <span className='text-[10px] text-[#00f5c4] animate-pulse'>
                          Connecting...
                        </span>
                      ) : isPending &&
                        wallet?.adapter.name === w.adapter.name ? (
                        <span className='text-[10px] text-[#00f5c4] animate-pulse'>
                          Signing...
                        </span>
                      ) : (
                        <span className='text-[#6f9f97] text-sm'>→</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <p className='mt-4 text-center text-[10px] text-[#9fd5cc]'>
                New to Solana?
                <span className='ml-1 text-[#00f5c4] cursor-pointer hover:underline'>
                  Learn how to set up a wallet
                </span>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
