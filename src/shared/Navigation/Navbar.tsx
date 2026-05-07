import { useWallet } from '@solana/wallet-adapter-react'

// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Link } from 'react-router-dom'
import { useWalletStore } from '../../features/wallet/wallet.store'
// import { CgMenuGridO } from 'react-icons/cg'

// import { useAuthStore } from '../../features/auth/auth.store'
import { useEffect, useState, useMemo } from 'react'
import { WalletMenu } from '../../features/dashboard/WalletMenu'

import { useGeneralContext } from '../../Context/GeneralContext'
import { useTradingModeStore } from '../../features/dashboard/useTradingModeStore'
import { useWalletBalance } from '../../features/wallet/useWalletQuery'
import { useSolPrice } from '../../core/hooks/usePrice'
import { useAuthStore } from '../../features/auth/auth.store'
import useRiskStore from '../../core/store/RiskStoreState'
import { useUserVaults } from '../../features/master/useUserVaults'
import { useAllVaultActivities } from '../../features/dashboard/dashboardComponents/sidenavPages/Portfolio/useVaultActivities'
import SearchModeDropdown from '../SearchModeDropdown'
import { useTypewriter } from '../../features/dashboard/dashboardComponents/sidenavPages/DashboardView/hooks/useTypewriter'

// import { useNotificationStore } from '../Modals/Notification/useNotificationStore'

// ── Declared outside Navbar to prevent re-creation on every render

const Navbar = () => {
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)

  const {
    setOpenNotifications,
    setOpenMenu,
    visible,
    setMasterTraderOpen,
    hasMaterVault,
    activePlaceholder,
    handleSearch
  } = useGeneralContext()
  const animatedPlaceholder = useTypewriter(activePlaceholder)

  const { setMarkedAsRead } = useRiskStore()

  const { masterMode, toggleMasterMode } = useTradingModeStore()
  const { publicKey, connected } = useWallet()
  const { setWallet } = useWalletStore()
  const { user } = useAuthStore()

  const [copied, setCopied] = useState(false)
  const [showUsdc, setShowUsdc] = useState(false)
  const { data: balanceData } = useWalletBalance(publicKey?.toBase58())
  const balance = balanceData?.balance ?? null
  const { data: solPriceData } = useSolPrice()
  const solPrice = solPriceData?.price ?? 0

  // ── handleSearch — directly uses active search mode

  useEffect(() => {
    if (!publicKey) return

    if (connected) {
      setWallet(publicKey.toBase58(), true)
    }
  }, [connected, publicKey, setWallet])

  // Notification Logic
  const { masterVault, copierVaults } = useUserVaults()
  const vaultPdas = useMemo(() => {
    if (!connected) return []
    const pdas = []
    if (masterVault) pdas.push(masterVault.vaultPda)
    if (copierVaults) pdas.push(...copierVaults.map(v => v.vaultPda))
    return pdas
  }, [masterVault, copierVaults, connected])

  const { activities } = useAllVaultActivities(vaultPdas, 20)

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('zephyr_read_activities')
    if (stored) {
      try {
        return new Set(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
    return new Set()
  })

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem('zephyr_read_activities')
      if (stored) {
        try {
          setReadIds(new Set(JSON.parse(stored)))
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('zephyr_read_activities_updated', handler)
    return () =>
      window.removeEventListener('zephyr_read_activities_updated', handler)
  }, [])

  const hasUnread = useMemo(() => {
    return activities.some(a => !readIds.has(a.id))
  }, [activities, readIds])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!publicKey) return

    await navigator.clipboard.writeText(publicKey.toBase58())

    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const { setWalletModal } = useGeneralContext()

  return (
    <div className='w-full sticky top-0 z-[80] bg-[#0c1414]  py-3'>
      <div className='w-full sticky z-[80] pb-0 lg:p-3'>
        {/* ─────────────────────────────────────────
            Top bar — Large Screen/////////
        ───────────────────────────────────────── */}
        <div className='w-full hidden lg:block'>
          <div
            className={`w-full flex items-center ${
              visible ? 'justify-between' : 'justify-end'
            } px-2`}
          >
            {/* SEARCH — Desktop (UPDATED: wrapped with SearchModeDropdown) */}
            <div
              className={`${
                visible ? '' : 'hidden'
              } flex items-center gap-2 w-1/2 lg:w-1/4`}
            >
              <SearchModeDropdown />
              
              <input
                placeholder={animatedPlaceholder} // ← was activePlaceholder
                onKeyDown={handleSearch}
                className='flex-1 bg-[#102221] px-4 py-2 rounded-lg outline-none placeholder:text-xs text-white caret-white transition-all duration-500'
                style={{ caretShape: 'block' } as React.CSSProperties}
              />
            </div>

            <div className='flex items-center gap-5'>
              <div className='flex items-center gap-5'>
                {connected && balance !== null && (
                  <button
                    onClick={() => setShowUsdc(!showUsdc)}
                    className='text-sm bg-[#0f1a18] px-3 py-1 rounded-lg border-[1px] border-[#0A3F46] flex items-center gap-2 text-white cursor-pointer hover:opacity-80 transition-opacity'
                  >
                    <span
                      style={{
                        backgroundImage: `url("/images/${
                          showUsdc ? 'usdc.svg' : 'solana.svg'
                        }")`
                      }}
                      className='inline-block bg-enter bg-cover h-[16px] w-[16px]'
                    ></span>
                    {showUsdc
                      ? `${(balance * solPrice).toFixed(2)} USDC`
                      : `${balance.toFixed(2)} SOL`}
                  </button>
                )}

                {connected && (
                  <>
                    {masterMode ? (
                      <div
                        onClick={toggleMasterMode}
                        className='rounded-md border-[1.5px] bg-master border-masterb shadow-[0_0_25px_0px_rgba(245,158,11,0.2)] p-2 flex justify-between items-center gap-2 cursor-pointer'
                      >
                        <p className='h-[5px] w-[5px] rounded-full bg-[#00A991] animate-pulse'></p>
                        <p className='text-[9px] font-[900] leading-[9.875px] tracking-[0.988px] text-[#FE9A00]'>
                          MASTER MODE
                        </p>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          if (!hasMaterVault) {
                            setMasterTraderOpen(true)
                          } else {
                            toggleMasterMode()
                          }
                        }}
                        className='rounded-md border-[1.5px] border-modeboreder shadow-[0_0_25px_0px_rgba(0,169,145,0.3)] p-2 flex justify-between items-center gap-2 cursor-pointer'
                      >
                        <p className='h-[5px] w-[5px] rounded-full bg-[#00A991] animate-pulse'></p>
                        <p className='text-[9px] font-[900] leading-[9.875px] tracking-[0.988px] text-[#00a991]'>
                          COPIER MODE
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!connected ? (
                  <button
                    onClick={() => setWalletModal(true)}
                    className='bg-teal-500 shadow-[0_0_25px_0px_rgba(20,184,166,0.3)] px-3 py-1 rounded-lg text-[10px] font-[700] text-white hover:bg-teal-600 transition flex justify-between gap-2'
                  >
                    <span>Connect Wallet</span>
                    <span
                      className='h-[12px] w-[12px]'
                      style={{ backgroundImage: `url("/images/connect.svg")` }}
                    ></span>
                  </button>
                ) : (
                  <div className='relative'>
                    <div className='relative'>
                      <button className='flex items-center cursor-pointer bg-[#0f1a18] border border-[#23483B] px-3 py-1 rounded-lg text-[10px] font-[700] text-[#00A991] gap-2'>
                        <div className='flex items-center gap-1'>
                          <span>
                            {publicKey?.toBase58().slice(0, 4)}…
                            {publicKey?.toBase58().slice(-4)}
                          </span>
                          {copied ? (
                            <span className='text-[9px] text-[#00A991] flex items-center gap-1'>
                              <span className='absolute top-[1px]'>Copied</span>
                              <span>✓</span>
                            </span>
                          ) : (
                            <span
                              onClick={handleCopy}
                              style={{
                                backgroundImage: 'url("/images/copy.svg")'
                              }}
                              className='inline-block h-[12px] w-[12px] bg-center bg-cover cursor-pointer opacity-80 hover:opacity-100'
                              title={copied ? 'Copied!' : 'Copy address'}
                            ></span>
                          )}
                        </div>

                        <span
                          onClick={e => {
                            e.stopPropagation()
                            setWalletMenuOpen(prev => !prev)
                          }}
                          className='cursor-pointer text-xl'
                        >
                          ▾
                        </span>
                      </button>

                      <WalletMenu
                        open={walletMenuOpen}
                        onClose={() => setWalletMenuOpen(false)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {connected && (
                <div className='flex justify-between items-center gap-3'>
                  <Link
                    to={'/profile'}
                    className='h-[36px] w-[36px] rounded-full p-[1px] border-[1.5px] border-[#f5e2d9] flex justify-center items-center'
                  >
                    {user?.avatar ? (
                      <span
                        style={{ backgroundImage: `url(${user.avatar})` }}
                        className='inline-block bg-center bg-cover h-[30px] w-[30px] rounded-full'
                      />
                    ) : (
                      <span className='flex items-center justify-center h-[30px] w-[30px] rounded-full bg-[#102221] text-white text-sm font-bold'>
                        {user?.displayName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </Link>
                  <span
                    onClick={() => setOpenNotifications(true)}
                    style={{ backgroundImage: `url("/images/bell.svg")` }}
                    className='inline-block relative bg-center bg-cover w-[20px] h-[20px] cursor-pointer'
                  >
                    {hasUnread && (
                      <span className='absolute right-[1.3px] top-1 bg-[#FB2C36] h-[6px] w-[6px] rounded-full'></span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ─────────────────────────────────────────
          Mobile
      ───────────────────────────────────────── */}

      <div className='lg:hidden block'>
        {/* ── Row 1: Hamburger | Logo | Balance | Connect/Mode | Bell ── */}
        <div className='flex justify-between items-center gap-2 px-1'>
          {/* Left: Hamburger + Logo */}
          <div className='flex items-center gap-4 shrink-0'>
            <div
              onClick={() => setOpenMenu(true)}
              className='w-[40px] h-[40px] flex justify-center items-center border-[2px] border-[#23483B] bg-[#102221] rounded-md'
            >
              <span
                className='bg-cover bg-center h-[32px] w-[32px]'
                style={{ backgroundImage: `url("/images/hamburger.svg")` }}
              />
            </div>
            <div>
              <span
                className='inline-block bg-center bg-cover w-[40px] h-[40px]'
                style={{ backgroundImage: `url("/images/zeflogo.png")` }}
              />
              <div className='text-[12px] font-[700] text-teal-400 -mt-4'>
                Zephyr
              </div>
            </div>
          </div>

          {/* Right: Balance + Connect/Icons */}
          <div className='flex items-center gap-2'>
            {/* Balance toggle */}
            {connected && balance !== null && (
              <button
                onClick={() => setShowUsdc(!showUsdc)}
                className=' text-[8px] bg-[#0f1a18] px-2 py-2 rounded-lg border border-[#0A3F46] items-center gap-1 flex text-white hover:opacity-80 transition-opacity'
              >
                <span
                  style={{
                    backgroundImage: `url("/images/${
                      showUsdc ? 'usdc.svg' : 'solana.svg'
                    }")`
                  }}
                  className='inline-block bg-center bg-cover h-[7px] w-[7px]'
                />
                {showUsdc
                  ? `${(balance * solPrice).toFixed(2)} USDC`
                  : `${balance.toFixed(2)} SOL`}
              </button>
            )}

            {/* Connect Wallet button (not connected) */}
            {!connected && (
              <button
                onClick={() => setWalletModal(true)}
                className='bg-teal-500 shadow-[0_0_25px_0px_rgba(20,184,166,0.3)] px-3 py-1 rounded-lg text-[10px] font-[700] text-white hover:bg-teal-600 transition flex items-center gap-2'
              >
                <span>Connect Wallet</span>
                <span
                  className='h-[12px] w-[12px]'
                  style={{ backgroundImage: `url("/images/connect.svg")` }}
                />
              </button>
            )}
            {/* Wallet */}
            {connected && (
              <div className=' px-1 flex justify-end'>
                <div className='relative'>
                  <button className='flex items-center justify-between cursor-pointer bg-[#0f1a18] border border-[#23483B] px-1 rounded-lg text-[11px] font-[700] text-[#00A991] gap-2'>
                  
                    <span
                      onClick={e => {
                        e.stopPropagation()
                        setWalletMenuOpen(prev => !prev)
                      }}
                      className='cursor-pointer text-xl'
                    >
                      ▾
                    </span>
                  </button>
                  <WalletMenu
                    open={walletMenuOpen}
                    onClose={() => setWalletMenuOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Profile avatar — Link to /profile (only when connected) */}
            {connected && (
              <Link
                to='/profile'
                className='h-[26px] w-[26px] rounded-full p-[1px] border-[1.5px] border-[#f5e2d9] flex justify-center items-center'
              >
                {user?.avatar ? (
                  <span
                    style={{ backgroundImage: `url(${user.avatar})` }}
                    className='inline-block bg-center bg-cover h-[19px] w-[19px] rounded-full'
                  />
                ) : (
                  <span className='flex items-center justify-center h-[19px] w-[19px] rounded-full bg-[#102221] text-white text-[9px] font-bold'>
                    {user?.displayName?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </Link>
            )}

            {/* Bell (only when connected) */}
            {connected && (
              <span
                onClick={() => {
                  setOpenNotifications(true)
                  setMarkedAsRead(true)
                }}
                style={{ backgroundImage: `url("/images/bell.svg")` }}
                className='inline-block cursor-pointer relative bg-center bg-cover w-[20px] h-[20px]'
              >
                {hasUnread && (
                  <span className='absolute right-[1.3px] top-1 bg-[#FB2C36] h-[6px] w-[6px] rounded-full' />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
