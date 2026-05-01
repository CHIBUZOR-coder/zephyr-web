
import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletStore } from '../../../../../wallet/wallet.store'
import WalletCard from './WalletCard'
import ConnectWallet from './ConnectWallet'
import HardwareSupport from './HardwareSupport'
import { useWalletDetector } from './useWalletDetector'

const WalletSettings: React.FC = () => {
  const { connected } = useWallet()

  useWalletDetector()

  const wallets = useWalletStore(s => s.wallets)
  const primaryAddress = useWalletStore(s => s.primaryAddress)
  const setPrimary = useWalletStore(s => s.setPrimary)
  const removeWallet = useWalletStore(s => s.removeWallet)

  return (
    <div>
      {!connected ? (
        <>
          <div className='w-full max-w-3xl'>
            <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
              PROFILE & IDENTITY
            </h1>
            <p className='text-xs sm:text-sm text-textMuted mt-1 mb-6'>
              Connect your wallet to manage your profile
            </p>
            <div className='rounded-xl border border-borderSubtle p-5 sm:p-6 bg-gradient-to-b from-cardTop to-cardBottom'>
              <p className='text-textMuted text-sm text-center py-8'>
                Please connect your wallet to view and edit your profile
                settings.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className='
            w-full
            min-h-screen
            bg-[#020A09]
            text-white
            flex
            justify-center
            px-4
            py-10
            '
          >
            <div className='w-full max-w-4xl flex flex-col gap-6'>
              <div>
                <h1 className='text-xl font-semibold tracking-wide'>
                  CONNECTED WALLETS
                </h1>

                <p className='text-sm text-[#7A9E9A] mt-1'>
                  Manage your wallet connections and primary wallet
                </p>
              </div>

              {wallets.map(wallet => (
                <WalletCard
                  key={wallet.address}
                  name={wallet.name}
                  address={wallet.address}
                  type={wallet.type}
                  primary={wallet.address === primaryAddress}
                  onSetPrimary={() => setPrimary(wallet.address)}
                  onRemove={() => removeWallet(wallet.address)}
                />
              ))}

              <ConnectWallet />
              <HardwareSupport />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WalletSettings
