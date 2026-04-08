// import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletStore } from './wallet.store'
import { useWalletBalance } from './useWalletQuery'
import Layout from '../../shared/Layout/Layout'

const WalletPage = () => {
  // const { connected } = useWallet()
  const { publicKey, connected } = useWalletStore()

  const { data, isLoading } = useWalletBalance(publicKey ?? undefined)

  if (!connected) {
    return (
      <Layout>
        <h1>Wallet</h1>
        <p>Please connect your wallet using the button in the navbar.</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1>Your Wallet</h1>

      <p>Address: {publicKey}</p>

      {isLoading && <p>Loading balance...</p>}
      {data && <p>Balance: {data.balance} SOL</p>}
    </Layout>
  )
}

export default WalletPage
