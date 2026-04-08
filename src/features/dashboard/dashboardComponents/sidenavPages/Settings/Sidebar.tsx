import {
  HiUser,
  HiChartBar,
  HiLockClosed,
  HiBell,
  HiBolt,
  HiOutlineWallet
} from 'react-icons/hi2'

import { useSettingsStore } from './stores/settingsStore'
import NavItem from './NavItem'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
}

const navItems = [
  { name: 'Account', icon: HiUser },
  { name: 'Wallets', icon: HiOutlineWallet },
  { name: 'Trading', icon: HiChartBar },
  { name: 'Privacy', icon: HiLockClosed },
  { name: 'Notifications', icon: HiBell },
  { name: 'Integrations', icon: HiBolt }
] as const

export default function Sidebar ({ open, setOpen }: Props) {
  const activeTab = useSettingsStore(s => s.activeTab)
  const setActiveTab = useSettingsStore(s => s.setActiveTab)

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
        />
      )}

      <aside
        className={`
        fixed lg:static
        z-[100]
        top-0 left-0
        h-full w-64
        bg-panel
        border-r border-borderSubtle
        p-6
        transform
        transition-transform
        duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        `}
      >
        <div className='flex flex-col justify-between h-full'>
          <div>
            <h2 className='text-sm font-semibold mb-6 tracking-wider'>
              SETTINGS
            </h2>

            <nav className='space-y-2'>
              {navItems.map(item => (
                <NavItem
                  key={item.name}
                  icon={<item.icon />}
                  text={item.name}
                  active={activeTab === item.name}
                  onClick={() => {
                    setActiveTab(item.name)
                    setOpen(false) // close drawer on mobile
                  }}
                />
              ))}
            </nav>
          </div>

          <button className='bg-accent text-black font-medium py-2 rounded-lg'>
            Save Changes
          </button>
        </div>
      </aside>
    </>
  )
}
