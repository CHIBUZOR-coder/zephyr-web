import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuthLogin } from '../../../features/auth/useAuthLogin'
import { useAuthStore } from '../../../features/auth/auth.store'
import type { WalletName } from '@solana/wallet-adapter-base'

type Props = {
  open: boolean
  onClose: () => void
}

export const CustomWalletModal = ({ open, onClose }: Props) => {
  // touch
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

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const visibleWallets = isMobile
    ? wallets.filter(w => w.adapter.name === 'Mobile Wallet Adapter')
    : wallets.filter(w => w.adapter.name !== 'Mobile Wallet Adapter')

  // 🔹 AUTO-CLOSE modal when user is authenticated
  useEffect(() => {
    if (authenticated && open) {
      onClose()
    }
  }, [authenticated, open, onClose])

  // Track if we've attempted auth this session to prevent infinite loops
  const hasAttemptedAuth = loginMutation.isError || authenticated

  // EFFECT: Trigger login when wallet connects and signs
  useEffect(() => {
    if (
      connected &&
      publicKey &&
      signMessage &&
      !authenticated &&
      !loginMutation.isPending &&
      !connecting &&
      !hasAttemptedAuth
    ) {
      console.log('Wallet connected, triggering authentication flow...')
      loginMutation.mutate(
        {
          publicKey: publicKey.toBase58(),
          signMessage: signMessage
        },
        {
          onSuccess: () => {
            onClose()
          },
          onError: error => {
            console.error('Authentication failed:', error)
          }
        }
      )
    }
  }, [
    connected,
    publicKey,
    signMessage,
    authenticated,
    loginMutation,
    onClose,
    connecting,
    hasAttemptedAuth
  ])

  const handleWalletSelect = async (adapterName: WalletName) => {
    if (connecting) return

    try {
      if (connected && wallet?.adapter.name !== adapterName) {
        await disconnect()
      }
      select(adapterName)
    } catch (error) {
      console.error('Error selecting wallet:', error)
    }
  }

  // Force connection if selection didn't trigger auto-connect
  useEffect(() => {
    if (
      wallet &&
      !connected &&
      !connecting &&
      wallet.adapter.readyState !== 'NotDetected'
    ) {
      const timeout = setTimeout(() => {
        wallet.adapter.connect().catch(err => {
          console.warn('Manual connection attempt failed:', err)
        })
      }, 100)
      return () => clearTimeout(timeout)
    }
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
                    onClick={() => loginMutation.reset()}
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

              <div className='flex flex-col gap-2'>
                {visibleWallets.map(w => (
                  <button
                    key={w.adapter.name}
                    onClick={() => handleWalletSelect(w.adapter.name)}
                    disabled={
                      w.readyState !== 'Installed' &&
                      w.readyState !== 'Loadable'
                    }
                    className='
                      flex items-center justify-between
                      rounded-lg px-3 py-2.5
                      bg-[#03463d] hover:bg-[#13443e]
                      transition
                      disabled:opacity-40 disabled:cursor-not-allowed
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
                    ) : loginMutation.isPending &&
                      wallet?.adapter.name === w.adapter.name ? (
                      <span className='text-[10px] text-[#00f5c4] animate-pulse'>
                        Signing....
                      </span>
                    ) : (
                      <span className='text-[#6f9f97] text-sm'>→</span>
                    )}
                  </button>
                ))}
              </div>

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