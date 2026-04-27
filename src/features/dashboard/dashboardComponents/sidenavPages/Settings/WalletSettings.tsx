// import { useWallet } from '@solana/wallet-adapter-react'

// import React from 'react'
// import { FiCopy, FiExternalLink, FiTrash2, FiCreditCard } from 'react-icons/fi'

// type WalletType = 'SOLANA' | 'ETHEREUM'

// interface WalletCardProps {
//   name?: string
//   address: string
//   type: WalletType
//   primary?: boolean
// }

// const WalletCard: React.FC<WalletCardProps> = ({
//   name,
//   address,
//   type,
//   primary
// }) => {
//   return (
//     <div
//       className='
//       w-full
//       rounded-xl
//       border border-[#184A45]
//       bg-gradient-to-r from-[#071F1D] to-[#0A2C28]
//       p-5
//       flex
//       items-center
//       justify-between
//       gap-4
//       flex-wrap
//       '
//     >
//       <div className='flex items-center gap-4 min-w-0'>
//         {/* wallet icon */}
//         <div
//           className='
//           w-10
//           h-10
//           rounded-lg
//           flex
//           items-center
//           justify-center
//           bg-[#0F3B36]
//           border border-[#1E5B54]
//           '
//         >
//           <FiCreditCard size={18} className='text-[#7FE8D6]' />
//         </div>

//         <div className='flex flex-col gap-1 min-w-0'>
//           {name && (
//             <p className='text-white font-medium text-sm truncate'>{name}</p>
//           )}

//           {/* address row */}
//           <div className='flex items-center gap-2 text-xs text-[#7A9E9A]'>
//             <span className='truncate'>{address}</span>

//             <FiCopy
//               size={14}
//               className='cursor-pointer opacity-70 hover:opacity-100'
//             />

//             <FiExternalLink
//               size={14}
//               className='cursor-pointer opacity-70 hover:opacity-100'
//             />
//           </div>

//           {/* tags */}
//           <div className='flex gap-2 mt-1'>
//             <span
//               className='
//               text-[10px]
//               px-2
//               py-[2px]
//               rounded
//               font-semibold
//               tracking-wider
//               bg-[#2D1B4E]
//               text-[#C6A8FF]
//               '
//             >
//               {type}
//             </span>

//             {primary && (
//               <span
//                 className='
//                 text-[10px]
//                 px-2
//                 py-[2px]
//                 rounded
//                 font-semibold
//                 tracking-wider
//                 bg-[#123C36]
//                 text-[#7FE8D6]
//                 '
//               >
//                 PRIMARY
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* right buttons */}
//       {!primary && (
//         <div className='flex items-center gap-3'>
//           <button
//             className='
//             text-xs
//             font-medium
//             px-4
//             py-2
//             rounded-md
//             border border-[#2A5E57]
//             bg-[#0F2D2A]
//             text-[#CFEFED]
//             hover:bg-[#143A36]
//             transition
//             '
//           >
//             SET PRIMARY
//           </button>

//           <button
//             className='
//             w-9
//             h-9
//             flex
//             items-center
//             justify-center
//             rounded-md
//             border border-[#2A2A2A]
//             text-red-400
//             hover:bg-[#2A1010]
//             '
//           >
//             <FiTrash2 size={16} />
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// const ConnectWallet = () => {
//   return (
//     <div
//       className='
//       w-full
//       border border-[#1A3D39]
//       rounded-xl
//       py-8
//       flex
//       flex-col
//       items-center
//       justify-center
//       gap-2
//       text-[#6C8F8B]
//       cursor-pointer
//       hover:bg-[#0B2422]
//       transition
//       '
//     >
//       <span className='text-2xl'>+</span>

//       <p className='text-sm tracking-widest'>CONNECT WALLET</p>
//     </div>
//   )
// }

// const HardwareSupport = () => {
//   return (
//     <div
//       className='
//       w-full
//       border border-[#1A3D39]
//       rounded-xl
//       p-4
//       bg-[#061B19]
//       '
//     >
//       <p className='text-sm text-[#CFEFED] font-medium'>
//         Hardware Wallet Support
//       </p>

//       <p className='text-xs text-[#7A9E9A] mt-1'>
//         Ledger and Trezor hardware wallets are supported for enhanced security.
//         Connect via your wallet provider.
//       </p>
//     </div>
//   )
// }

// const WalletSettings: React.FC = () => {
//   const { connected } = useWallet()

//   return (
//     <div>
//       {!connected ? (
//         <>
//           <div className='w-full max-w-3xl'>
//             <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
//               PROFILE & IDENTITY
//             </h1>
//             <p className='text-xs sm:text-sm text-textMuted mt-1 mb-6'>
//               Connect your wallet to manage your profile
//             </p>
//             <div className='rounded-xl border border-borderSubtle p-5 sm:p-6 bg-gradient-to-b from-cardTop to-cardBottom'>
//               <p className='text-textMuted text-sm text-center py-8'>
//                 Please connect your wallet to view and edit your profile
//                 settings.
//               </p>
//             </div>
//           </div>
//         </>
//       ) : (
//         <>
//           <div
//             className='
//       w-full
//       min-h-screen
//       bg-[#020A09]
//       text-white
//       flex
//       justify-center
//       px-4
//       py-10
//       '
//           >
//             <div className='w-full max-w-4xl flex flex-col gap-6'>
//               {/* title */}
//               <div>
//                 <h1 className='text-xl font-semibold tracking-wide'>
//                   CONNECTED WALLETS
//                 </h1>

//                 <p className='text-sm text-[#7A9E9A] mt-1'>
//                   Manage your wallet connections and primary wallet
//                 </p>
//               </div>

//               {/* cards */}
//               <WalletCard
//                 name='alphatrader.sol'
//                 address='8Kx7a9R...658tau'
//                 type='SOLANA'
//                 primary
//               />

//               <WalletCard address='0x7413f5...69b8cb' type='ETHEREUM' />

//               {/* connect */}
//               <ConnectWallet />

//               {/* hardware */}
//               <HardwareSupport />
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// export default WalletSettings
import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletStore } from '../../../../wallet/wallet.store'
import WalletCard from './WalletSettings/WalletCard'
import ConnectWallet from './WalletSettings/ConnectWallet'
import HardwareSupport from './WalletSettings/HardwareSupport'
import { useWalletDetector } from './WalletSettings/useWalletDetector'


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
