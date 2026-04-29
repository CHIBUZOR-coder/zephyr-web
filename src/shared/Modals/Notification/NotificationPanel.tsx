import { useState, type FC } from 'react'
import { FiBell, FiX, FiSettings } from 'react-icons/fi'
import { AiOutlineWarning } from 'react-icons/ai'
import { RiLineChartLine } from 'react-icons/ri'
import { HiOutlineWallet } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { useGeneralContext } from '../../../Context/GeneralContext'

import { useSettingsStore } from '../../../features/dashboard/dashboardComponents/sidenavPages/Settings/stores/settingsStore'

import {
  useNotificationStore,
  type NotificationItem,
  type NotifyCategory
} from './useNotificationStore'
import { CiVault } from 'react-icons/ci'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type Filter = 'ALL' | 'UNREAD' | 'READ'

const categoryIcon: Record<NotifyCategory, React.ReactNode> = {
  deposit: <HiOutlineWallet />,
  withdrawal: <HiOutlineWallet />,
  risk: <AiOutlineWarning className='text-[#FA6938]' />,
  general: <RiLineChartLine />,
  vault:     <CiVault />
,   
}

const timeAgo = (timestamp: number) => {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const NotificationPanel: FC<Props> = ({ isOpen, onClose }) => {
  const { setShowRiskModal } = useGeneralContext()
  const setActiveTab = useSettingsStore(s => s.setActiveTab)
  const navigate = useNavigate()

  const { notifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationStore()
  const [activeFilter, setActiveFilter] = useState<Filter>('ALL')

  const visibleNotifications = notifications.filter((n: NotificationItem) => {
    if (activeFilter === 'UNREAD') return !n.read
    if (activeFilter === 'READ') return n.read
    return true
  })

  const unread = unreadCount()

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
              <p className='text-[12px] text-[#6B8F88]'>{unread} unread</p>
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
              {unread > 0 && (
                <span className='bg-[#F24E4E] text-white text-[9px] px-1.5 rounded ml-1'>
                  {unread}
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
            className='text-[#11C5A3] text-[11px] mt-3'
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        </div>

        {/* LIST */}
        <div className='flex-1 overflow-y-auto mt-4 side'>
          {visibleNotifications.length === 0 ? (
            <p className='text-center text-[#557A74] text-[13px] mt-10'>
              No notifications here.
            </p>
          ) : (
            visibleNotifications.map((n: NotificationItem) => (
              <div
                key={n.id}
                onClick={() => {
                  markAsRead(n.id)
                  if (n.category === 'risk') setShowRiskModal(true)
                }}
                className='flex gap-4 px-6 py-5 border-t border-[#0D3B37] hover:bg-[#0A2B27] transition cursor-pointer'
              >
                <div className='flex items-center justify-center w-[36px] h-[36px] rounded-full bg-[#0B2A27] text-[#1ED2AF] text-[16px]'>
                  {categoryIcon[n.category]}
                </div>
                <div className='flex-1'>
                  <p className='text-white text-[13px] font-semibold'>
                    {n.title}
                  </p>
                  <p className='text-[#7FAAA2] text-[12px] mt-1 leading-relaxed'>
                    {n.message}
                  </p>
                  <div className='flex items-center justify-between mt-2'>
                    <span className='text-[11px] text-[#557A74]'>
                      {timeAgo(n.timestamp)}
                    </span>
                  </div>
                </div>
                {!n.read && (
                  <span className='w-[6px] h-[6px] rounded-full bg-[#11C5A3] mt-2'></span>
                )}
              </div>
            ))
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
