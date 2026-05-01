import { useState } from 'react'
import { HiBars3 } from 'react-icons/hi2'

import Sidebar from './Sidebar'
import { useSettingsStore } from './stores/settingsStore'
import AccountSettings from './Account'
import WalletSettings from './WalletSettings/WalletSettings'
import Trading from './Trading'
import Privacy from './Privacy'
import Integrations from './Integrations'
import Notifications from './Notifications'

export default function SettingsPage () {
  const activeTab = useSettingsStore(state => state.activeTab)

  const [open, setOpen] = useState(false)

  function renderContent () {
    switch (activeTab) {
      case 'Account':
        return <AccountSettings />

      case 'Wallets':
        return <WalletSettings />

      case 'Trading':
        return <Trading />

      case 'Privacy':
        return <Privacy />

      case 'Notifications':
        return <Notifications />

      case 'Integrations':
        return <Integrations />

      default:
        return <AccountSettings />
    }
  }

  return (
    <div className=' bg-bgMain text-textMain pb-32 lg:pb-0 '>
      <Sidebar open={open} setOpen={setOpen} />

      <div className=''>
        {/* MOBILE HEADER */}
        <div className='lg:hidden flex items-center gap-3 p-4 border-b border-borderSubtle'>
          <button onClick={() => setOpen(true)}>
            <HiBars3 size={22} />
          </button>

          <h1 className='font-semibold'>Settings</h1>
        </div>

        <main className='px-2 lg:px-6 lg:p-12'>{renderContent()}</main>
      </div>
    </div>
  )
}
