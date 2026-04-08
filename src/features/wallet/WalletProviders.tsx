import type { FC, ReactNode } from 'react'

import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { endpoint, wallets } from '../../core/config/solanaWallet';

interface Props {
  children: ReactNode
}


import { ProgramProvider } from '../../core/solana/ProgramProvider';

export const WalletProviders: FC<Props> = ({ children }) => {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <ProgramProvider>
          <WalletModalProvider>{children}</WalletModalProvider>
        </ProgramProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
