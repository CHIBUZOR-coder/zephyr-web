// import type { FC, ReactNode } from 'react'

// import {
//   ConnectionProvider,
//   WalletProvider
// } from '@solana/wallet-adapter-react'
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
// import '@solana/wallet-adapter-react-ui/styles.css'
// import { endpoint, wallets } from '../../core/config/solanaWallet';

// interface Props {
//   children: ReactNode
// }


// import { ProgramProvider } from '../../core/solana/ProgramProvider';

// export const WalletProviders: FC<Props> = ({ children }) => {
//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} autoConnect>
//         <ProgramProvider>
//           <WalletModalProvider>{children}</WalletModalProvider>
//         </ProgramProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   )
// }

import type { FC, ReactNode } from 'react'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
// ── REMOVED: WalletModalProvider import — we use CustomWalletModal instead
// ── REMOVED: @solana/wallet-adapter-react-ui/styles.css — no longer needed
import { endpoint, wallets } from '../../core/config/solanaWallet'
import { ProgramProvider } from '../../core/solana/ProgramProvider'

interface Props {
  children: ReactNode
}

export const WalletProviders: FC<Props> = ({ children }) => {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <ProgramProvider>
          {/* ── REMOVED: WalletModalProvider was showing the default Solana 
              "can't find wallet" modal on mobile, conflicting with 
              CustomWalletModal. Since we have a fully custom modal we 
              don't need it. */}
          {children}
        </ProgramProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
