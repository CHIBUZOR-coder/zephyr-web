// zephyr-web/src/App.tsx

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
// import { useAuthLogin } from './features/auth/useAuthLogin'
import { useAuthStore } from './features/auth/auth.store'
import { useWalletAuthSync } from './core/hooks/useWalletAuthSync'
import { useAuthRefresh } from './features/auth/useAuthRefresh' // ← NEW
import ErrorBoundary from './shared/components/ErrorBoundary'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useWalletPersistSync } from './features/wallet/useWalletPersistSync'
import { useTradingModeStore } from './features/dashboard/useTradingModeStore'

import Layout from './shared/Layout/Layout'
import { useGeneralContext } from './Context/GeneralContext'

import { useAuthReady } from './features/auth/useAuthReady'
import { API_BASE } from './core/query/authClient'
import { useWalletMismatch } from './core/hooks/useWalletMismatch'
import { useRealtimeUpdates } from './core/hooks/useRealtimeUpdates'
import StateScreen from './shared/components/StateScreen'

import ScrollToTop from './utils/ScrollToTop'
import VaultFlowModal from './shared/Modals/CopyModal/VaultFlowModal'
import type { UserProfile } from './features/users/user.types'
import { CustomWalletModal } from './shared/Modals/walletModal/CustomWalletModal'
import { DepositModal } from './shared/Modals/DepositModal/DepositModal'
import { WithdrawModal } from './shared/Modals/WithdrawModal/WithdrawModal'
import NotificationPanel from './shared/Modals/Notification/NotificationPanel'
import MobileBottomNav from './shared/Navigation/MobileBottomNav'
import { ToastContainer } from './core/store/useToastStore'
import MobileSideNav from './shared/Navigation/MobileSideNav'
import RiskAlertModal from './shared/Modals/AlertModal/RiskAlertModal'
import StopCopyModal from './shared/Modals/StopCopyModal/StopCopyModal'
import CallTradeModal from './shared/Modals/CallTradeModal/CallTradeModal'
import BecomeMasterTraderModal from './shared/Modals/MasterVaultModal/Becomemastertradermodal'
import MasterTradingFlow from './shared/Modals/MasterVaultModal/Mastertradingflow'
import { TierConfigInitModal } from './shared/Modals/TierConfigInitModal'
import { ClaimFeesModal } from './shared/Modals/ClaimFeesModal/ClaimFeesModal'
import { useUserVaults } from './features/master/useUserVaults'
import Onboarding from './shared/Modals/OnboardingModal/Onboarding'
import { FaInstagram, FaTelegram } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { Toastify } from './shared/Toast/Toastify'

function App () {
  const { connected } = useWallet()
  useWalletAuthSync()
  useAuthRefresh() // ← Replaces useRestoreAuth + useAuthSession
  useWalletPersistSync()
  useRealtimeUpdates() // ← Listen for real-time vault updates
  useUserVaults() // ← Sync hasMaterVault state globally

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authReady = useAuthReady()
  const mismatch = useWalletMismatch()
  const { accessToken, logout, user: authUser } = useAuthStore()

  if (authUser && profile && authUser.id !== profile.id) {
    console.warn(`⚠️ Wallet mismatch detected: Auth user ID does not match profile user ID. 
      This may indicate a session issue. {
        Auth User ID: ${authUser.id},
        Profile User ID: ${profile.id}}`)
  }

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboarding_done')
  })

  const {
    openNotifications,
    setOpenNotifications,
    openMenu,
    setOpenMenu,
    showRiskModal,
    setShowRiskModal,
    openStopModal,
    setOpenStopModal,
    walletModal,
    setWalletModal,
    depositOpen,
    setDepositOpen,
    withdrawOpen,
    setWithdrawOpen,
    setVisible,
    openCallTrade,
    setOpenCallTrade,
    tierConfigInitOpen,
    setTierConfigInitOpen,
    claimFeesOpen,
    setClaimFeesOpen,
    toasts,
    dismissToast
  } = useGeneralContext()

  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [location.pathname, setVisible])

  const fetchMe = useCallback(async () => {
    if (!accessToken) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        }
      })

      if (!res.ok) {
        const text = await res.text()

        // Handling session expiration/invalid tokens
        if (
          res.status === 401 ||
          res.status === 403 ||
          text.toLowerCase().includes('expired') ||
          text.toLowerCase().includes('invalid')
        ) {
          console.warn(
            '⚠️ Authentication check failed: Session expired or invalid token. Redirecting to login state.'
          )
          logout()
          return
        }

        throw new Error(`Auth check failed: ${text || res.statusText}`)
      }

      const contentType = res.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const text = await res.text()
        throw new Error(
          `Expected JSON response, but received: ${text.slice(0, 100)}`
        )
      }

      const data = await res.json()
      setProfile(data.user)
    } catch (err) {
      console.error('❌ Profile fetch failed:', err)
      // Only set UI error if it's NOT a token problem (handled above)
      if (accessToken) {
        setError('Connection failed. Please refresh or try again later.')
      }
    } finally {
      setLoading(false)
    }
  }, [accessToken, logout])

  useEffect(() => {
    if (authReady && accessToken && !profile) {
      fetchMe()
    }
  }, [authReady, accessToken, profile, fetchMe])

  // Clear profile if accessToken is lost
  useEffect(() => {
    if (!accessToken) {
      setProfile(null)
      setError(null)
    }
  }, [accessToken])

  const navLinks = [
    { title: 'Dashboard', icon: '/images/dashh.svg', path: '/' },
    { title: 'Live Trade', icon: '/images/livetrade.svg', path: '/livetrade' },
    { title: 'Portfolio', icon: '/images/portfolio.svg', path: '/portfolio' },
    {
      title: 'leaderboard',
      icon: '/images/leaderboard.svg',
      path: '/leaderboard'
    },
    {
      title: 'Support',
      icon: '/images/support.svg',
      mt: true,
      path: '/support'
    },
    { title: 'settings', icon: '/images/settings.svg', path: '/settings' },
    { title: 'Docs', icon: '/images/docs.svg', path: '/docs' }
  ]

  const { masterMode } = useTradingModeStore()

  // Note: We removed the "Loading Zephyr…" StateScreen here
  // because the app now handles loading states via other UI components
  // (e.g., "Synchronizing..." spinner, profile loading, etc.)

  if (mismatch) {
    return (
      <StateScreen
        title='Wallet Mismatch'
        description='Please connect the wallet associated with your signed session.'
        tone='error'
      />
    )
  }

  if (loading && !profile) {
    return (
      <div className='h-screen '>
        <div
          className={`absolute top-0 left-0 bg-primary z-50 w-full h-full flex flex-col justify-center items-center gap-8`}
        >
          <div className='w-24 h-24 border-r-[4px] bg-primary border-white flex justify-center items-center rounded-full animate-spin'>
            <span className="bg-[url('/images/logo.png')] bg-cover bg-center h-16 w-16 animate-spin-slow animate-spin-reverse"></span>
          </div>
          <p className='text-white font-[900] text-xl text-center uppercase tracking-widest'>
            Synchronizing...
          </p>
        </div>
      </div>
    )
  }

  // If there's a fatal error (not auth-related), show it
  if (error && accessToken) {
    return <StateScreen title='System Error' description={error} tone='error' />
  }

  return (
    <div className='bg-primary relative'>
      <MobileBottomNav />
      {masterMode && connected && (
        <div
          onClick={() => {
            setOpenCallTrade(true)
          }}
          className='call border-b-[4px] border-t-[1.5px] border-l-[1.5px] border-r-[1.5px] shadow-2xl shadow-[#574516] border-[#574516] rounded-3xl fixed lg:bottom-[5.5rem] bottom-[8rem] z-50 left-[1.8rem] lg:left-4 flex justify-center items-center py-2 px-3 gap-2 cursor-pointer'
        >
          <div className='bg-[#fe9a00] h-[29px] w-[29px] rounded-full flex justify-center items-center shadow-[0_0_12px_rgba(254,154,0,0.8)]'>
            <span
              style={{ backgroundImage: `url('/images/mode2.svg')` }}
              className='inline-block bg-center bg-cover h-[20px] w-[20px]'
            ></span>
          </div>
          <p className='text-[12px] font-[900] uppercase text-white tracking-widest'>
            Call Trade
          </p>
        </div>
      )}

      <ErrorBoundary>
        <div className='flex w-full'>
          <aside className='h-screen w-[16%] bg-[#102221] sticky top-0 left-0 hidden lg:block '>
            {/* Social icons */};
            <div className='flex items-start gap-2 self-center sm:self-start absolute bottom-[1rem]   left-4'>
              {[
                { Icon: FaInstagram, label: 'Instagram', path: '' },
                {
                  Icon: FaXTwitter,
                  label: 'X / Twitter',
                  path: 'https://x.com/TryZephyr'
                },
                {
                  Icon: FaTelegram,
                  label: 'Telegram',
                  path: 'https://t.me/zephyrlabscommunity'
                }
              ].map(({ Icon, label, path }) => (
                <Link
                  key={label}
                  target='_blank'
                  to={path}
                  aria-label={label}
                  className='flex items-center justify-center w-[34px] h-[34px] rounded-lg
                                 bg-[#1a1a24] border border-[#2a2a38] text-[#c0c0d0]
                                 hover:bg-[#222232] hover:text-white transition-colors duration-150'
                >
                  <Icon size={15} />
                </Link>
              ))}
            </div>
            <div className='h-[70%] side p-3 lg:flex flex-col gap-6  w-full overflow-y-auto '>
              <div className='flex items-center gap-4'>
                <span
                  className='inline-block bg-center bg-cover w-[40px] h-[40px]'
                  style={{ backgroundImage: `url("/images/zeflogo.png")` }}
                ></span>
                <div>
                  <div className='text-[12px] font-[700] text-teal-400'>
                    Zephyr
                  </div>
                  <p className='text-[9px] font-[400] text-[#B0E4DD]'>
                    Social Copy Trading
                  </p>
                </div>
              </div>

              <nav className='flex flex-col gap-3 text-sm relative justify-center items-center'>
                <p className=' h-[0.5px] bg-[#23483b] absolute top-[56.5%] w-full'></p>

                {navLinks.map((item, i) => (
                  <NavLink
                    key={i}
                    to={item.path}
                    className={({ isActive }) =>
                      `${
                        isActive ? 'bg-[#009883]' : ''
                      }  text-left text-white p-2 rounded-lg flex justify-start items-center gap-4 w-full hover:bg-[#009883]/30 transition ease-in-out duration-300 ${
                        item.mt ? 'mt-8' : ''
                      }`
                    }
                  >
                    <img src={item.icon} alt={item.title} className='w-5 h-5' />
                    <span className='uppercase tracking-widest text-[10px] font-bold'>
                      {item.title}
                    </span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>
          <div className=' w-full lg:w-[84%] '>
            <Layout>
              <ScrollToTop />
              <Outlet />
            </Layout>
          </div>
        </div>
        <CustomWalletModal
          open={walletModal}
          onClose={() => setWalletModal(false)}
        />
        <DepositModal
          open={depositOpen}
          onClose={() => setDepositOpen(false)}
        />
        <WithdrawModal
          open={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
        />
        <NotificationPanel
          isOpen={openNotifications}
          onClose={() => setOpenNotifications(false)}
        />
        <MobileSideNav isOpen={openMenu} onClose={() => setOpenMenu(false)} />
        <VaultFlowModal />
        <RiskAlertModal
          showRiskModal={showRiskModal}
          setShowRiskModal={() => setShowRiskModal(false)}
        />
        <CallTradeModal
          open={openCallTrade}
          onClose={() => setOpenCallTrade(false)}
        />
        <StopCopyModal
          open={openStopModal}
          onClose={() => setOpenStopModal(false)}
          onConfirm={() => {
            setOpenStopModal(false)
          }}
        />
        <BecomeMasterTraderModal />
        <MasterTradingFlow />
        <TierConfigInitModal
          isOpen={tierConfigInitOpen}
          onClose={() => setTierConfigInitOpen(false)}
        />
        <ClaimFeesModal
          open={claimFeesOpen}
          onClose={() => setClaimFeesOpen(false)}
        />

        <Toastify toasts={toasts} onDismiss={dismissToast} />

        {showOnboarding && (
          <Onboarding
            onComplete={() => {
              setShowOnboarding(false)
              localStorage.setItem('onboarding_done', 'true')
            }}
          />
        )}
      </ErrorBoundary>
      <ToastContainer />
    </div>
  )
}

export default App
