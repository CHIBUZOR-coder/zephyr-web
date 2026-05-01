import { useWallet } from '@solana/wallet-adapter-react'
import type { FC } from 'react'
import { FiHeadphones, FiSettings, FiFileText, FiX } from 'react-icons/fi'
import { Link, NavLink } from 'react-router-dom'
import { useTradingModeStore } from '../../features/dashboard/useTradingModeStore'
import { useGeneralContext } from '../../Context/GeneralContext'
import { FaInstagram, FaTelegram } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const MobileSideNav: FC<Props> = ({ isOpen, onClose }) => {
  const { connected } = useWallet()
  const { masterMode, toggleMasterMode } = useTradingModeStore()
  const { hasMaterVault, setMasterTraderOpen, setTierConfigInitOpen } =
    useGeneralContext()
  const navs = [
    {
      title: 'Support',
      icon: <FiHeadphones size={16} />,
      path: '/support'
    },
    {
      title: 'Settings',
      icon: <FiSettings size={16} />,
      path: '/settings'
    },
    {
      title: 'Docs',

      icon: <FiFileText size={16} />,
      path: '/docs'
    }
  ]
  return (
    <div className='relative '>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      />
      {/* SIDENAV */}
      <div
        className={`fixed top-0 left-0 h-full w-[260px] bg-[#071d1a] border-r border-[#0f3b35]
        transform transition-transform duration-300 z-[100]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        {/* Social icons */}
        <div className='flex items-start gap-2 self-center sm:self-start absolute bottom-[5rem]   left-4'>
          {[
            { Icon: FaInstagram, label: 'Instagram', path: '' },
            { Icon: FaXTwitter, label: 'X / Twitter', path: '' },
            {
              Icon: FaTelegram,
              label: 'Telegram',
              path: 'https://t.me/zephyrlabscommunity'
            }
          ].map(({ Icon, label, path }) => (
            <Link
              target='_blank'
              key={label}
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
        {/* HEADER */}
        <div className='flex items-center justify-between px-5 py-6'>
          <div className='flex items-center'>
            <span
              style={{ backgroundImage: `url("/images/zeflogo.png")` }}
              className='bg-center bg-cover h-[40px] w-[60px] inline-block'
            ></span>
            <span className='text-white text-[15px] font-semibold'>Zephyr</span>
          </div>

          <button onClick={onClose} className='text-[#7FAAA2] hover:text-white'>
            <FiX size={18} />
          </button>
        </div>
        {/* MENU */}
        <div className='flex flex-col gap-6 px-5 mt-6 text-[#7FAAA2] text-[13px]'>
          {navs.map((item, i) => (
            <div className='flex items-center gap-2' key={i}>
              <span className=''>{item.icon}</span>
              <NavLink
                onClick={onClose}
                to={item.path}
                className={({ isActive }) =>
                  `${
                    isActive ? 'bg-[#009883]' : ''
                  }  text-left text-white p-2 rounded-lg flex justify-start items-center gap-4  hover:bg-[#009883]/30 transition ease-in-out duration-300 w-full 
          `
                }
              >
                {item.title}
              </NavLink>
            </div>
          ))}

          {connected && (
            <>
              {masterMode ? (
                <div
                  onClick={toggleMasterMode}
                  className='rounded-md border-[1.5px] w-[60%] bg-master border-masterb shadow-[0_0_25px_0px_rgba(245,158,11,0.2)] p-2 flex justify-between items-center gap-2 cursor-pointer '
                >
                  <p className='h-[10px] w-[10px] rounded-full bg-[#00A991] animate-pulse'></p>
                  <p className='text-[12px] font-[600]   leading-[9.875px] tracking-[0.988px] text-[#FE9A00]'>
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
                  className='rounded-md w-[60%] border-[1.5px] border-modeboreder shadow-[0_0_25px_0px_rgba(0,169,145,0.3)] px-1 py-2 flex justify-center items-center gap-2 cursor-pointer '
                >
                  <p className='h-[10px] w-[10px] rounded-full bg-[#00A991] animate-pulse'></p>
                  <p className='call_trade text-[12px] font-[600] leading-[9.875px] tracking-[0.988px] text-[#00a991]'>
                    COPIER MODE
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        {/* FOOTER */}
        <div className='absolute bottom-5 left-0 w-full px-5 flex flex-col gap-2'>
          <button
            onClick={() => {
              onClose()
              setTierConfigInitOpen(true)
            }}
            className='w-full py-2 bg-[#009883]/20 border border-[#009883]/40 text-[#009883] rounded-lg text-[11px] font-semibold hover:bg-[#009883]/30 transition-colors'
          >
            Initialize Tiers (Admin)
          </button>
{/* 
          <div className='bg-[#0f2a27] border border-[#16423d] rounded-lg px-3 py-2 text-[11px] text-[#7FAAA2]'>
            <p className='flex items-center gap-2'>
              <span className='h-[6px] w-[6px] bg-[#00A991] rounded-full'></span>
              Mainnet Beta
            </p>

            <p className='text-[10px] text-[#557A74] mt-1'>TPS: 2,451</p>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default MobileSideNav
