import { useWallet } from '@solana/wallet-adapter-react'

// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Link, useNavigate } from 'react-router-dom'
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
import { API_BASE } from '../../core/query/authClient'
// import { useNotificationStore } from '../Modals/Notification/useNotificationStore'

const Navbar = () => {
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)
  const navigate = useNavigate()
  const {
    setOpenNotifications,
    setOpenMenu,
    visible,
    setMasterTraderOpen,
    hasMaterVault,
    setOpenCallTrade,
    setPrefilledTokenAddress
  } = useGeneralContext()

  const { setMarkedAsRead } = useRiskStore()

  const { masterMode, toggleMasterMode } = useTradingModeStore()
  const { publicKey, connected } = useWallet()
  const { setWallet } = useWalletStore()
  const { user } = useAuthStore() // get auth state

  const [copied, setCopied] = useState(false)
  const [showUsdc, setShowUsdc] = useState(false)
  const { data: balanceData } = useWalletBalance(publicKey?.toBase58())
  const balance = balanceData?.balance ?? null
  const { data: solPriceData } = useSolPrice()
  const solPrice = solPriceData?.price ?? 0
  // const unread = useNotificationStore(s => s.unreadCount())

  // ── Search Logic
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const placeholders = [
    'Search traders, tokens, or addresses',
    '@trader_name (e.g. @trader_PatricK_The_dev)',
    '@token_address (e.g. @token_So111...)',
    '@address_vault (e.g. @address_7tqB...)'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length)
    }, 4000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim()
      e.currentTarget.value = ''
      if (!query) return

      if (query.startsWith('@trader_')) {
        const traderName = query.replace('@trader_', '').toLowerCase()
        try {
          const res = await fetch(
            `${API_BASE}/api/search/trader?query=${traderName}`
          )
          const data = await res.json()
          if (data.success) {
            navigate(`/profile/${data.data.walletAddress}`)
          }
        } catch (err) {
          console.error('Trader search failed', err)
        }
      } else if (query.startsWith('@token_')) {
        const tokenAddress = query.replace('@token_', '')
        setPrefilledTokenAddress(tokenAddress)
        requestAnimationFrame(() => setOpenCallTrade(true))
      } else if (query.startsWith('@address_')) {
        const address = query.replace('@address_', '')
        navigate(`/profile/${address}`)
      }
    }
  }

  useEffect(() => {
    if (!publicKey) return

    if (connected) {
      setWallet(publicKey.toBase58(), true)
    }

    // if (user) {
    //   console.log('user:', user)
    // }
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

  // bg-[#101B22]
  return (
    <div className='w-full sticky top-0 z-[80] bg-[#0c1414] '>
      <div className='w-full sticky  z-[80]   pb-0 lg:p-3  '>
        {/* Top bar  LargeScreen*/}
        <div className='w-full hidden lg:block'>
          <div
            className={`  w-full flex items-center ${
              visible ? 'justify-between' : 'justify-end'
            }   px-5 py-3  `}
          >
            <input
              placeholder={placeholders[placeholderIndex]}
              onKeyDown={handleSearch}
              className={` ${
                visible ? '' : 'hidden'
              }  w-1/2 lg:w-1/4 bg-[#102221] px-4 py-2 rounded-lg outline-none placeholder:text-xs text-white caret-white transition-all duration-500`}
              style={{ caretShape: 'block' } as React.CSSProperties}
            />

            <div className='flex items-center gap-5'>
              <div className={` flex items-center gap-5`}>
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
                        className='rounded-md border-[1.5px] bg-master border-masterb shadow-[0_0_25px_0px_rgba(245,158,11,0.2)] p-2 flex justify-between items-center gap-2 cursor-pointer '
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
                        className='rounded-md border-[1.5px] border-modeboreder shadow-[0_0_25px_0px_rgba(0,169,145,0.3)] p-2 flex justify-between items-center gap-2 cursor-pointer '
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
                  // NOT CONNECTED
                  <button
                    onClick={() => setWalletModal(true)}
                    className='bg-teal-500  shadow-[0_0_25px_0px_rgba(20,184,166,0.3)]  px-3 py-1 rounded-lg text-[10px] font-[700] text-white hover:bg-teal-600 transition flex justify-between gap-2'
                  >
                    <span> Connect Wallet</span>
                    <span
                      className='h-[12px] w-[12px]'
                      style={{ backgroundImage: `url("/images/connect.svg")` }}
                    ></span>
                  </button>
                ) : (
                  // CONNECTED
                  <div className='relative'>
                    <div className='relative'>
                      <button className='flex items-center cursor-pointer  bg-[#0f1a18] border border-[#23483B] px-3 py-1 rounded-lg text-[10px] font-[700] text-[#00A991] gap-2'>
                        {/* ADDRESS */}
                        <div className='flex items-center gap-1'>
                          <span>
                            {publicKey?.toBase58().slice(0, 4)}…
                            {publicKey?.toBase58().slice(-4)}
                          </span>
                          {/* COPY ICON */}
                          {copied ? (
                            <>
                              <span className=' text-[9px] text-[#00A991] flex items-center gap-1 '>
                                <span className='absolute top-[1px]'>
                                  Copied
                                </span>{' '}
                                <span>✓</span>
                              </span>
                            </>
                          ) : (
                            <>
                              <span
                                onClick={handleCopy}
                                style={{
                                  backgroundImage: 'url("/images/copy.svg")'
                                }}
                                className='inline-block  h-[12px] w-[12px] bg-center bg-cover cursor-pointer opacity-80 hover:opacity-100'
                                title={copied ? 'Copied!' : 'Copy address'}
                              ></span>
                            </>
                          )}
                        </div>

                        {/* DROPDOWN ARROW */}
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
                <div className='flex justify-between items-center gap-3 '>
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
                    style={{
                      backgroundImage: `url("/images/bell.svg")`
                    }}
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
      {/* Mobile */}
      <div className='lg:hidden  block '>
        <div className='flex justify-between gap-4  px-1'>
          <div className='flex items-center gap-4'>
            <div
              onClick={() => setOpenMenu(true)}
              className='w-[40px] h-[40px] flex justify-center items-center border-[2px] border-[#23483B] bg-[#102221] rounded-md'
            >
              <span
                className='bg-cover bg-center h-[32px] w-[32px]'
                style={{ backgroundImage: `url("/images/hamburger.svg")` }}
              ></span>
            </div>
            <div className=' '>
              <span
                className='inline-block bg-center bg-cover w-[40px] h-[40px]'
                style={{
                  backgroundImage: `url("/images/zeflogo.png")`
                }}
              ></span>

              <div className='text-[12px] font-[700] text-teal-400 -mt-4'>
                Zephyr
              </div>
            </div>
          </div>

          <div
            className={` flex ${
              !connected ? 'justify-end' : 'justify-between'
            }  items-center gap-2  w-[90%] `}
          >
            <div className='w-[50%]  hidden md:flex lg:hidden justify-between items-center px-5 py-2   '>
              {/* <input
                  placeholder={`Search traders, tokens, org addresses'
                  className='${
                    visible ? '' : 'hidden'
                  } w-full bg-[#102221] px-4 py-2 rounded-lg outline-none placeholder:text-xs`}
                /> */}
            </div>
            {connected && balance !== null && (
              <button
                onClick={() => setShowUsdc(!showUsdc)}
                className='inline-flex text-[8px] bg-[#0f1a18] px-2 py-2 rounded-lg border-[1px] border-[#0A3F46] items-center gap-1 text-white cursor-pointer hover:opacity-80 transition-opacity'
              >
                <span
                  style={{
                    backgroundImage: `url("/images/${
                      showUsdc ? 'usdc.svg' : 'solana.svg'
                    }")`
                  }}
                  className='inline-block bg-enter bg-cover h-[14px] w-[14px] md:h-[16px] md:w-[16px]'
                ></span>
                {showUsdc
                  ? `${(balance * solPrice).toFixed(2)} USDC`
                  : `${balance.toFixed(2)} SOL`}
              </button>
            )}

            {!connected ? (
              // NOT CONNECTED
              <button
                onClick={() => setWalletModal(true)}
                className='bg-teal-500  shadow-[0_0_25px_0px_rgba(20,184,166,0.3)]  px-3 py-1 rounded-lg text-[10px] font-[700] text-white hover:bg-teal-600 transition flex justify-between gap-4'
              >
                <span> Connect Wallet</span>
                <span
                  className='h-[12px] w-[12px]'
                  style={{ backgroundImage: `url("/images/connect.svg")` }}
                ></span>
              </button>
            ) : (
              // CONNECTED
              <div className='relative'>
                <div className='relative'>
                  <button className='flex items-center cursor-pointer  bg-[#0f1a18] border border-[#23483B] px-1 md:px-4 py-1 rounded-lg text-[10px] font-[700] text-[#00A991] gap-2 '>
                    {/* ADDRESS */}
                    <div className='flex items-center gap-1'>
                      <span>
                        {publicKey?.toBase58().slice(0, 2)}…
                        {publicKey?.toBase58().slice(-2)}
                      </span>
                      {/* COPY ICON */}
                      {copied ? (
                        <>
                          <span className=' text-[9px] md:text-[12px] text-[#00A991] flex items-center gap-1 '>
                            <span className='absolute top-[1px]'>Copied</span>{' '}
                            <span>✓</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            onClick={handleCopy}
                            style={{
                              backgroundImage: 'url("/images/copy.svg")'
                            }}
                            className='inline-block  h-[12px] w-[12px] md:h-[16px] md:w-[16px] bg-center bg-cover cursor-pointer opacity-80 hover:opacity-100'
                            title={copied ? 'Copied!' : 'Copy address'}
                          ></span>
                        </>
                      )}
                    </div>

                    {/* DROPDOWN ARROW */}
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
            {connected && (
              <>
                <div className='h-[26px] w-[26px] rounded-full p-[1px]  border-[1.5px] border-[#f5e2d9] flex justify-center items-center'>
                  <span
                    style={{
                      backgroundImage: `url("/images/mode.png")`
                    }}
                    className='inline-block bg-center bg-cover h-[19px] w-[19px] rounded-full '
                  ></span>
                </div>
              </>
            )}
            {connected && (
              <>
                <span
                  onClick={() => {
                    setOpenNotifications(true)
                    setMarkedAsRead(true)
                  }}
                  style={{
                    backgroundImage: `url("/images/bell.svg")`
                  }}
                  className='inline-block cursor-pointer relative bg-center bg-cover w-[20px] h-[20px]'
                >
                  {hasUnread && (
                    <span className='absolute right-[1.3px] top-1 bg-[#FB2C36] h-[6px] w-[6px] rounded-full'></span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className='w-full   flex lg:hidden justify-between items-center px-5 py-2 mt-2 md:mt-4 bg-[#000000] '>
        <input
          placeholder={placeholders[placeholderIndex]}
          onKeyDown={handleSearch}
          className={` ${
            visible ? '' : 'hidden'
          } w-[85%] md:w-1/3 bg-[#102221] px-4 py-2 rounded-lg outline-none placeholder:text-xs transition-all duration-500`}
        />
      </div>
    </div>
  )
}

export default Navbar
