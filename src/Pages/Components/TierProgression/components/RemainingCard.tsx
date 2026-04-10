import { useMasterTierState, useProtocolTierConfig } from '../../../../features/master/useMasterTier'
import { useWallet } from '@solana/wallet-adapter-react'

export default function RemainingCard () {
  const { publicKey } = useWallet()
  const masterWalletAddress = publicKey?.toBase58()
  const { data: tierState } = useMasterTierState(masterWalletAddress)
  const { data: protocolTierConfig } = useProtocolTierConfig()

  const currentTier = tierState?.currentTier || 1
  const nextTierIndex = currentTier < 5 ? currentTier + 1 : currentTier
  const nextTierConfig = protocolTierConfig?.tiers.find(t => t.tierIndex === nextTierIndex)
  const nextTierLabel = nextTierConfig?.label || 'Next Tier'

  const tradesRemaining = Math.max(0, (nextTierConfig?.minTrackRecordDays || 0) - (tierState?.totalTrades || 0))
  const aumRemaining = Math.max(0, parseFloat(nextTierConfig?.minAumUsd || '0') - parseFloat(tierState?.metrics?.rollingAumUsd || '0'))
  const aumRemainingFormatted = aumRemaining >= 1000000 
    ? `$${(aumRemaining / 1000000).toFixed(1)}M` 
    : aumRemaining >= 1000 
    ? `$${(aumRemaining / 1000).toFixed(0)}k` 
    : `$${aumRemaining.toFixed(0)}`
  const daysRemaining = Math.max(0, (nextTierConfig?.minTrackRecordDays || 0) - (tierState?.metrics?.daysActive || 0))

  return (
    <div className='bg-[#031414] border border-teal-900/30 rounded-xl p-4'>
      <h4 className='text-xs  font-semibold text-teal-200 mb-3'>
        REMAINING TO REACH {nextTierLabel.toUpperCase()}
      </h4>

      <ul className='text-xs text-teal-200/70 space-y-1 list-disc ml-4'>
        {tradesRemaining > 0 && <li>{tradesRemaining} more closed trades</li>}
        {aumRemaining > 0 && <li>{aumRemainingFormatted} additional AUM</li>}
        {daysRemaining > 0 && <li>{daysRemaining} more days of verified performance</li>}
        {tradesRemaining === 0 && aumRemaining === 0 && daysRemaining === 0 && (
          <li>All requirements met!</li>
        )}
      </ul>
    </div>
  )
}
