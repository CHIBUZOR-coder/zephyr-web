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

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

const currentUrl = encodeURIComponent(window.location.href)
const phantomDeepLink = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`
const solflareDeepLink = `https://solflare.com/ul/v1/browse/${currentUrl}?ref=${currentUrl}`

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

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const hasTriggeredLoginRef = useRef(false)
  useEffect(() => {
    if (!open) {
      hasTriggeredLoginRef.current = false
    }
  }, [open])

  const detectedWallets = wallets.filter(w => {
    if (w.adapter.name === 'Mobile Wallet Adapter') return false
    return (
      w.readyState === WalletReadyState.Installed ||
      w.readyState === WalletReadyState.Loadable
    )
  })

  useEffect(() => {
    if (!open) return

    const tryClose = () => {
      if (useAuthStore.getState().authenticated) {
        onCloseRef.current()
      }
    }

    if (!isMobile && authenticated) {
      onCloseRef.current()
      return
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') tryClose()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const interval = setInterval(tryClose, 300)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [open, authenticated])

  const { mutate, isPending, isSuccess } = loginMutation

  useEffect(() => {
    if (
      connected &&
      publicKey &&
      signMessage &&
      !authenticated &&
      !isPending &&
      !connecting &&
      !hasTriggeredLoginRef.current
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

  useEffect(() => {
    if (isSuccess && open) {
      onCloseRef.current()
    }
  }, [isSuccess, open])

  const handleWalletSelect = async (adapterName: WalletName) => {
    if (wallet?.adapter.name === adapterName && (connected || connecting))
      return
    if (connecting) return

    if (connected && wallet?.adapter.name !== adapterName) {
      try {
        await disconnect()
      } catch (err) {
        console.warn('Disconnect before wallet switch failed:', err)
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    select(adapterName)
  }

  useEffect(() => {
    if (
      !isMobile ||
      !wallet ||
      connected ||
      connecting ||
      wallet.adapter.name === 'Mobile Wallet Adapter' ||
      wallet.adapter.readyState === WalletReadyState.NotDetected
    ) {
      return
    }

    const timeout = setTimeout(() => {
      wallet.adapter.connect().catch(err => {
        console.warn('Manual connection attempt failed:', err)
      })
    }, 150)

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
                      hasTriggeredLoginRef.current = false
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
                  {isMobile ? (
                    <>
                      <p className='text-[12px] text-[#b7e9df] text-center font-semibold'>
                        Open in your wallet's browser
                      </p>
                      <p className='text-[10px] text-[#6f9f97] text-center leading-relaxed'>
                        For the best experience, open Zephyr directly inside
                        your Phantom or Solflare app browser.
                      </p>
                      <div className='flex flex-col gap-2 w-full mt-1'>
                        <Link
                          to={phantomDeepLink}
                          target='_blank'
                          rel='noreferrer'
                          className='w-full text-center text-[11px] font-[700] text-black bg-[#ab9ff2] rounded-lg px-3 py-2.5 hover:opacity-90 transition'
                        >
                          Open in Phantom
                        </Link>
                        <Link
                          to={solflareDeepLink}
                          target='_blank'
                          rel='noreferrer'
                          className='w-full text-center text-[11px] font-[700] text-black bg-[#FFC849] rounded-lg px-3 py-2.5 hover:opacity-90 transition'
                        >
                          Open in Solflare
                        </Link>
                      </div>
                      <p className='text-[9px] text-[#6f9f97] text-center leading-relaxed mt-1'>
                        Don't have a wallet yet? Install{' '}
                        <Link
                          to='https://phantom.app/download'
                          target='_blank'
                          rel='noreferrer'
                          className='text-[#00f5c4] underline'
                        >
                          Phantom
                        </Link>{' '}
                        or{' '}
                        <Link
                          to='https://solflare.com/download'
                          target='_blank'
                          rel='noreferrer'
                          className='text-[#00f5c4] underline'
                        >
                          Solflare
                        </Link>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className='text-[12px] text-[#b7e9df] text-center'>
                        No wallets detected.
                      </p>
                      <p className='text-[10px] text-[#6f9f97] text-center leading-relaxed'>
                        Install a Solana wallet extension from the Chrome Web
                        Store to continue.
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
                    </>
                  )}
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
                            {w.adapter.name}
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
                New to Solana?{' '}
                <Link
                  to='https://solana.com/learn/wallets'
                  target='_blank'
                  rel='noreferrer'
                  className='text-[#00f5c4] hover:underline'
                >
                  Learn how to set up a wallet
                </Link>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
