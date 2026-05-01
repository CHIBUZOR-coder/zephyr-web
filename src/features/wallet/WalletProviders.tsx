import type { FC, ReactNode } from 'react'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
import { endpoint, wallets } from '../../core/config/solanaWallet'
import { ProgramProvider } from '../../core/solana/ProgramProvider'

interface Props {
  children: ReactNode
}

export const WalletProviders: FC<Props> = ({ children }) => {
  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* autoConnect={false} — stops Phantom showing its native approval
          popup on every page load on mobile */}
      <WalletProvider wallets={wallets} autoConnect={false}>
        <ProgramProvider>{children}</ProgramProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
