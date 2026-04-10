import { useMasterTierState, useProtocolTierConfig } from '../../../../features/master/useMasterTier'
import { useWallet } from '@solana/wallet-adapter-react'

export default function BenefitCard () {
  const { publicKey } = useWallet()
  const masterWalletAddress = publicKey?.toBase58()
  const { data: tierState } = useMasterTierState(masterWalletAddress)
  const { data: protocolTierConfig } = useProtocolTierConfig()

  const currentTier = tierState?.currentTier || 1
  const nextTierIndex = currentTier < 5 ? currentTier + 1 : currentTier
  const nextTierConfig = protocolTierConfig?.tiers.find(t => t.tierIndex === nextTierIndex)
  const nextTierLabel = nextTierConfig?.label || 'Next Tier'
  const traderFeePct = nextTierConfig?.traderFeePct || 'N/A'

  const isInstitutional = nextTierIndex === 5
  const isElite = nextTierIndex === 4
  const isVerified = nextTierIndex === 3

  return (
    <div className='bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20 rounded-xl p-4'>
      <h4 className='text-xs font-semibold text-purple-300 mb-3'>
        {nextTierLabel.toUpperCase()} BENEFITS
      </h4>

      <ul className='text-xs text-purple-200/80 space-y-1 list-disc ml-4'>
        <li>{traderFeePct}% trader performance fee share</li>
        {parseFloat(traderFeePct) > 85 && <li>Increased leaderboard visibility</li>}
        {isVerified && <li>Verified Alpha badge</li>}
        {isElite && <li>Elite Alpha badge</li>}
        {isInstitutional && (
          <>
            <li>Institutional Alpha badge</li>
            <li>Governance verification</li>
          </>
        )}
        {!isInstitutional && !isElite && !isVerified && <li>Trader badge</li>}
      </ul>
    </div>
  )
}
