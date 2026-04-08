import { useWallet } from '@solana/wallet-adapter-react'
import StateScreen from './StateScreen'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function RequireWallet ({
  children
}: {
  children: React.ReactNode
}) {
  const { connected } = useWallet()

  if (!connected) {
    return (
      <StateScreen
        title='Wallet not connected'
        description='Please connect your wallet to continue.'
        action={<WalletMultiButton />}
      />
    )
  }

  return <>{children}</>
}
