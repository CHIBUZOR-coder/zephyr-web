import { type FC, useMemo, useState, useEffect } from 'react'
import { FiBell, FiX, FiSettings, FiClock } from 'react-icons/fi'
import { FaChartLine, FaUserFriends } from 'react-icons/fa'
import { AiOutlineWarning } from 'react-icons/ai'
import { RiLineChartLine } from 'react-icons/ri'
import { HiOutlineWallet } from 'react-icons/hi2'
import { TbRefresh } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../../features/dashboard/dashboardComponents/sidenavPages/Settings/stores/settingsStore'
import { useAuthStore } from '../../../features/auth/auth.store'

import { useUserVaults } from '../../../features/master/useUserVaults'
import { useAllVaultActivities, formatVaultActivity, type VaultActivity } from '../../../features/dashboard/dashboardComponents/sidenavPages/Portfolio/useVaultActivities'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type Filter = 'ALL' | 'UNREAD' | 'READ'

const getIcon = (type: string) => {
  switch (type) {
    case 'TRADE_EXECUTED':
    case 'TRADE_MIRRORED':
      return <FaChartLine />
    case 'PROFIT_TAKE':
      return <RiLineChartLine />
    case 'STOP_LOSS':
      return <AiOutlineWarning className='text-[#FA6938]' />
    case 'DEPOSIT':
    case 'DEPOSIT_MASTER':
      return <HiOutlineWallet />
    case 'WITHDRAWAL':
      return <TbRefresh />
    case 'NEW_FOLLOWER':
      return <FaUserFriends />
    case 'VAULT_CREATED':
      return <FiBell />
    case 'FEE_COLLECTED':
      return <RiLineChartLine />
    case 'STATUS_CHANGED':
      return <FiBell />
    default:
      return <FiBell />
  }
}

const getNotificationContent = (activity: VaultActivity) => {
  const formatted = formatVaultActivity(activity);
  const title = formatted.type; 
  let message = "";

  const shortVault = activity.vaultAddress 
    ? `${activity.vaultAddress.slice(0, 4)}...${activity.vaultAddress.slice(-4)}` 
    : 'Unknown Vault';

  switch (activity.type) {
    case 'VAULT_CREATED':
      message = `Your vault (${shortVault}) has been successfully created.`;
      break;
    case 'DEPOSIT':
    case 'DEPOSIT_MASTER':
      message = `Deposited ${formatted.amount} ${formatted.token} into ${shortVault}.`;
      break;
    case 'WITHDRAWAL':
      message = `Withdrew ${formatted.amount} ${formatted.token} from ${shortVault}.`;
      break;
    case 'TRADE_EXECUTED':
      message = `Trade executed in ${shortVault}: ${formatted.amount} ${formatted.token}.`;
      break;
    case 'TRADE_MIRRORED':
      message = `Mirrored Trade from ${shortVault}. Copied: ${formatted.amount} ${formatted.token}. View transaction at solscan signature.`;
      break;
    case 'FEE_COLLECTED':
      message = `Collected ${formatted.amount} ${formatted.token} in fees from ${shortVault}.`;
      break;
    case 'STATUS_CHANGED':
      message = `Vault (${shortVault}) status has been updated.`;
      break;
    default:
      message = `New vault activity recorded in ${shortVault}.`;
  }

  return { title, message, time: formatted.time };
};

const NotificationPanel: FC<Props> = ({ isOpen, onClose }) => {
  const setActiveTab = useSettingsStore(s => s.setActiveTab)
  const navigate = useNavigate()
  const { authenticated } = useAuthStore()

  const [activeFilter, setActiveFilter] = useState<Filter>('ALL')
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
    localStorage.setItem('zephyr_read_activities', JSON.stringify(Array.from(readIds)))
    window.dispatchEvent(new Event('zephyr_read_activities_updated'))
  }, [readIds])

  const { masterVault, copierVaults } = useUserVaults()

  const vaultPdas = useMemo(() => {
    if (!authenticated) return []
    const pdas = []
    if (masterVault) pdas.push(masterVault.vaultPda)
    if (copierVaults) pdas.push(...copierVaults.map(v => v.vaultPda))
    return pdas
  }, [masterVault, copierVaults, authenticated])

  // Fetch up to 20 recent activities across all user vaults
  const { activities, isLoading } = useAllVaultActivities(vaultPdas, 20)

  const unreadCount = useMemo(() => {
    return activities.filter(a => !readIds.has(a.id)).length
  }, [activities, readIds])

  const visibleActivities = useMemo(() => {
    return activities.filter(a => {
      const isRead = readIds.has(a.id)
      if (activeFilter === 'UNREAD') return !isRead
      if (activeFilter === 'READ') return isRead
      return true
    })
  }, [activities, activeFilter, readIds])

  const handleMarkAsRead = (id: string) => {
    if (readIds.has(id)) return
    setReadIds(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      return newSet
    })
  }

  const handleMarkAllAsRead = () => {
    setReadIds(prev => {
      const newSet = new Set(prev)
      activities.forEach(a => newSet.add(a.id))
      return newSet
    })
  }

  const tabClass = (filter: Filter) =>
    activeFilter === filter
      ? 'bg-[#11C5A3] text-black text-[11px] font-semibold px-4 py-1.5 rounded-md'
      : 'bg-[#0B2A27] text-[#8AA6A0] text-[11px] px-4 py-1.5 rounded-md flex items-center gap-1'

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* PANEL */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] md:w-[420px]
          bg-[#061F1C] border-l border-[#0D3B37] z-[100] transform transition-transform duration-300
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* HEADER */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-[#0D3B37]'>
          <div className='flex items-center gap-3'>
            <FiBell className='text-[#1ED2AF] text-lg' />
            <div>
              <h2 className='text-white text-[15px] font-semibold tracking-wide'>
                NOTIFICATIONS
              </h2>
              <p className='text-[12px] text-[#6B8F88]'>
                {unreadCount} unread
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-[#7FAAA2] hover:text-white transition'
          >
            <FiX size={18} />
          </button>
        </div>

        {/* FILTER TABS */}
        <div className='px-6 pt-4'>
          <div className='flex gap-2'>
            <button
              className={tabClass('ALL')}
              onClick={() => setActiveFilter('ALL')}
            >
              ALL
            </button>
            <button
              className={tabClass('UNREAD')}
              onClick={() => setActiveFilter('UNREAD')}
            >
              UNREAD
              {unreadCount > 0 && (
                <span className='bg-[#F24E4E] text-white text-[9px] px-1.5 rounded ml-1'>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              className={tabClass('READ')}
              onClick={() => setActiveFilter('READ')}
            >
              READ
            </button>
          </div>

          <button
            className='text-[#11C5A3] text-[11px] mt-3 hover:text-white transition-colors'
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        </div>

        {/* LIST */}
        <div className='flex-1 overflow-y-auto mt-4 side'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center mt-20 gap-3'>
              <p className='text-center text-[#11C5A3] text-[16px] font-semibold tracking-wide animate-pulse'>
                Loading activities...
              </p>
              <div className='text-[#557A74] text-[28px] animate-pulse'>
                <FiClock />
              </div>
            </div>
          ) : visibleActivities.length === 0 ? (
            <p className='text-center text-[#557A74] text-[13px] mt-10'>
              No notifications here.
            </p>
          ) : (
            visibleActivities.map(activity => {
              const { title, message, time } = getNotificationContent(activity)
              const isRead = readIds.has(activity.id)
              
              return (
                <div
                  key={activity.id}
                  onClick={() => handleMarkAsRead(activity.id)}
                  className='flex gap-4 px-6 py-5 border-t border-[#0D3B37] hover:bg-[#0A2B27] transition cursor-pointer'
                >
                  <div className='flex items-center justify-center w-[36px] h-[36px] shrink-0 rounded-full bg-[#0B2A27] text-[#1ED2AF] text-[16px]'>
                    {getIcon(activity.type)}
                  </div>
                  <div className='flex-1'>
                    <p className='text-white text-[13px] font-semibold'>
                      {title}
                    </p>
                    <p className='text-[#7FAAA2] text-[12px] mt-1 leading-relaxed'>
                      {message}
                    </p>
                    <div className='flex items-center justify-between mt-2'>
                      <span className='text-[11px] text-[#557A74]'>
                          {time}
                      </span>
                      {activity.signature && (
                        <a
                          href={`https://explorer.solana.com/tx/${activity.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-[#1ED2AF] hover:underline"
                        >
                          View Tx
                        </a>
                      )}
                    </div>
                  </div>
                  {!isRead && (
                    <span className='w-[6px] h-[6px] shrink-0 rounded-full bg-[#11C5A3] mt-2'></span>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* FOOTER */}
        <div className='p-4 border-t border-[#0D3B37] bg-[#061F1C]'>
          <button
            onClick={() => {
              setActiveTab('Notifications')
              navigate('/settings')
              onClose()
            }}
            className='w-full flex items-center justify-center gap-2 bg-[#0B2A27] hover:bg-[#103D38] transition text-[#9BC3BC] text-[13px] py-3 rounded-lg border border-[#123F3A]'
          >
            <FiSettings />
            Notification Settings
          </button>
        </div>
      </div>
    </>
  )
}

export default NotificationPanel
