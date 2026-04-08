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



export default function Sidebar () {
  const activeTab = useSettingsStore(state => state.activeTab)
  const setActiveTab = useSettingsStore(state => state.setActiveTab)

  return (
    <aside className='w-64 bg-panel border-r border-borderSubtle p-6'>
      <nav className='space-y-2'>
        <NavItem
          icon={<HiUser />}
          text='Account'
          active={activeTab === 'Account'}
          onClick={() => setActiveTab('Account')}
        />

        <NavItem
          icon={<HiOutlineWallet />}
          text='Wallets'
          active={activeTab === 'Wallets'}
          onClick={() => setActiveTab('Wallets')}
        />

        <NavItem
          icon={<HiChartBar />}
          text='Trading'
          active={activeTab === 'Trading'}
          onClick={() => setActiveTab('Trading')}
        />

        <NavItem
          icon={<HiLockClosed />}
          text='Privacy'
          active={activeTab === 'Privacy'}
          onClick={() => setActiveTab('Privacy')}
        />

        <NavItem
          icon={<HiBell />}
          text='Notifications'
          active={activeTab === 'Notifications'}
          onClick={() => setActiveTab('Notifications')}
        />

        <NavItem
          icon={<HiBolt />}
          text='Integrations'
          active={activeTab === 'Integrations'}
          onClick={() => setActiveTab('Integrations')}
        />
      </nav>

      <button className='mt-10 w-full bg-accent text-black font-medium py-2 rounded-lg'>
        Save Changes
      </button>
    </aside>
  )
}
