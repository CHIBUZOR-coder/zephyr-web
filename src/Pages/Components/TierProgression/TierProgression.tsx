import BenefitCard from './components/BenefitCard'
import RemainingCard from './components/RemainingCard'
import RequirementBar from './components/RequirementBar'
import TierStep from './components/TierStep'
import { useMasterTierState, useProtocolTierConfig } from '../../../features/master/useMasterTier'
import { useWallet } from '@solana/wallet-adapter-react'
import { formatCurrency, formatPercentage } from '../../../utils/formatters'

export default function TierProgression () {
  const { publicKey } = useWallet()
  const masterWalletAddress = publicKey?.toBase58()
  const { data: tierState } = useMasterTierState(masterWalletAddress)
  const { data: protocolTierConfig } = useProtocolTierConfig()

  const currentTier = tierState?.currentTier || 1
  const isMaxTier = currentTier >= 5

  const progression = protocolTierConfig?.tiers.map((tier) => {
      const value = `${tier.traderFeePct} / ${(100 - parseFloat(tier.traderFeePct)).toFixed(1)}`
      return {
        label: tier.label,
        value,
        completed: tier.tierIndex < currentTier,
        active: tier.tierIndex === currentTier
      }
    }) || []

  const nextTierIndex = currentTier < 5 ? currentTier + 1 : currentTier
  const nextTierConfig = protocolTierConfig?.tiers.find(
    t => t.tierIndex === nextTierIndex
  )
  const nextTierLabel = nextTierConfig?.label || 'N/A'
  const nextTierTraderFeePct = nextTierConfig?.traderFeePct || 'N/A'
  const nextTierPlatformFeePct = nextTierConfig
    ? (100 - parseFloat(nextTierConfig.traderFeePct)).toFixed(1)
    : 'N/A'
  const nextTierRevenueSplit = nextTierConfig
    ? `${nextTierTraderFeePct} / ${nextTierPlatformFeePct}`
    : 'N/A'

  const currentTierConfig = protocolTierConfig?.tiers.find(
    t => t.tierIndex === currentTier
  )
  const currentTierTraderFeePct = currentTierConfig?.traderFeePct || 'N/A'
  const currentTierPlatformFeePct = currentTierConfig ? (100 - parseFloat(currentTierConfig.traderFeePct)).toFixed(1) : 'N/A'

  const currentAum = parseFloat(tierState?.metrics?.rollingAumUsd || '0')
  const requiredAum = parseFloat(nextTierConfig?.minAumUsd || '0')
  const currentCopiers = tierState?.metrics?.activeCopiers || 0
  const requiredCopiers = nextTierConfig?.minCopiers || 0

  const getProgress = (current: number, required: number) => {
    if (required === 0) return 100
    return Math.min(100, (current / required) * 100)
  }

  return (
    <div className='bg-gradient-to-br from-[#071b1b] to-[#041010] border border-teal-900/30 rounded-2xl p-6 space-y-6'>
      {/* HEADER */}

      <div className='flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0'>
        <div>
          <h3 className='text-sm font-semibold text-teal-100 tracking-wide'>
            TIER PROGRESSION
          </h3>

          <p className='text-xs text-teal-200/50 mt-1'>
            {isMaxTier 
              ? 'You have reached the highest tier!' 
              : 'Track your progress toward the next trader tier.'}
          </p>
        </div>

        {nextTierConfig && (
          <div className='bg-next text-[#C27AFF] text-xs px-3 py-1 rounded-lg border border-next2 flex items-center '>
            <span
              className='h-[16px] w-[16px]'
              style={{ backgroundImage: `url("/images/blue_award.svg")` }}
            ></span>
            <div className='text-center'>
              <span className='text-[12px] font-[900] text-[#C27AFF] leading-[16px]'>
                NEXT TIER
              </span>
              <p className='text-[12px] font-[400] text-[#C27AFF] leading-[16px]'>
                {nextTierLabel} ({nextTierRevenueSplit})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CURRENT TIER CARD */}

      <div className='border border-yellow-500/30 bg-yellow-500/5 rounded-xl p-4 flex items-center gap-4'>
        <div className='md:w-10 md:h-10 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold'>
          ★
        </div>

        <div>
          <p className='text-xs text-teal-200/60'>CURRENT TIER</p>

          <h4 className='font-semibold text-[1rem] md:text-lg text-yellow-400'>
            {tierState?.currentTierLabel || 'Community Trader'}
          </h4>

          <p className='text-xs text-teal-200/50'>
            Revenue Split:{' '}
            <span className='text-yellow-400 font-medium'>
              {currentTierTraderFeePct}% Trader
            </span>{' '}
            /
            <span className='text-teal-300'>
              {' '}
              {currentTierPlatformFeePct}% Protocol
            </span>
          </p>
        </div>
      </div>

      {/* STEP PROGRESSION */}

      <div className='grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-4'>
        {progression.map((item, i) => (
          <div key={i}>
            <TierStep
              label={`${item.label}`}
              value={`${item.value}`}
              completed={item.completed}
              active={item.active}
            />
          </div>
        ))}
      </div>

      {/* REQUIREMENTS - Only show if not at max tier */}
      {!isMaxTier && nextTierConfig && (
        <div className='space-y-3'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <RequirementBar
              title='Trade Count'
              progress={getProgress(tierState?.totalTrades || 0, nextTierConfig.minTrackRecordDays)}
              value={`${tierState?.totalTrades || 0} / ${nextTierConfig.minTrackRecordDays}`}
              info={`${Math.max(0, nextTierConfig.minTrackRecordDays - (tierState?.totalTrades || 0))} trades remaining`}
            />
            <RequirementBar
              title='Assets Under Management'
              progress={getProgress(currentAum, requiredAum)}
              value={`${formatCurrency(currentAum, { compact: true })} / ${formatCurrency(requiredAum, { compact: true })}`}
              info={`${formatCurrency(Math.max(0, requiredAum - currentAum), { compact: true })} to go`}
            />
            <RequirementBar
              title='Risk Consistency'
              progress={getProgress(parseFloat(tierState?.metrics?.maxDrawdownPct || '0'), parseFloat(nextTierConfig.maxDrawdownPct))}
              value={`${tierState?.metrics?.maxDrawdownPct || '0'}% / ${nextTierConfig.maxDrawdownPct}%`}
              info={`${formatPercentage(Math.max(0, parseFloat(nextTierConfig.maxDrawdownPct) - parseFloat(tierState?.metrics?.maxDrawdownPct || '0')))} buffer`}
            />
            <RequirementBar
              title='Maximum Drawdown'
              progress={getProgress(parseFloat(tierState?.metrics?.maxDrawdownPct || '0'), parseFloat(nextTierConfig.maxDrawdownPct))}
              value={`${tierState?.metrics?.maxDrawdownPct || '0'}% / ${nextTierConfig.maxDrawdownPct}%`}
              info={`${formatPercentage(Math.max(0, parseFloat(nextTierConfig.maxDrawdownPct) - parseFloat(tierState?.metrics?.maxDrawdownPct || '0')))} buffer`}
            />
            <RequirementBar
              title='Track Record'
              progress={getProgress(tierState?.metrics?.daysActive || 0, nextTierConfig.minTrackRecordDays)}
              value={`${tierState?.metrics?.daysActive || 0} / ${nextTierConfig.minTrackRecordDays} days`}
              info={`${Math.max(0, nextTierConfig.minTrackRecordDays - (tierState?.metrics?.daysActive || 0))} days required`}
            />
            {requiredCopiers > 0 && (
              <RequirementBar
                title='Copier Count'
                progress={getProgress(currentCopiers, requiredCopiers)}
                value={`${currentCopiers} / ${requiredCopiers}`}
                info={`${Math.max(0, requiredCopiers - currentCopiers)} more copiers needed`}
              />
            )}
          </div>
        </div>
      )}

      {/* BOTTOM GRID */}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <RemainingCard />

        <BenefitCard />
      </div>
    </div>
  )
}
