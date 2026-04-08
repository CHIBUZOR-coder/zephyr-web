import BenefitCard from './components/BenefitCard'
import RemainingCard from './components/RemainingCard'
import RequirementBar from './components/RequirementBar'
import TierStep from './components/TierStep'
import { useMasterTierState, useProtocolTierConfig } from '../../../features/master/useMasterTier'
import { useWallet } from '@solana/wallet-adapter-react'

const TIER_LABELS: Record<number, string> = {
  0: 'Unranked',
  1: 'Community Trader',
  2: 'Rising Trader',
  3: 'Verified Alpha',
  4: 'Elite Alpha',
  5: 'Institutional Alpha'
}

export default function TierProgression () {
  const { publicKey } = useWallet()
  const masterWalletAddress = publicKey?.toBase58()
  const { data: tierState } = useMasterTierState(masterWalletAddress)
  const { data: protocolTierConfig } = useProtocolTierConfig()

  const currentTier = tierState?.currentTier || 0

  const progression = Object.entries(TIER_LABELS)
    .filter(([key]) => parseInt(key) > 0) // Exclude 'Unranked'
    .map(([key, label]) => {
      const tierIndex = parseInt(key)
      const tierConfig = protocolTierConfig?.tiers.find(
        t => t.tierIndex === tierIndex
      )
      const traderFeePct = tierConfig?.traderFeePct || 'N/A'
      const platformFeePct = tierConfig
        ? (100 - parseFloat(tierConfig.traderFeePct)).toFixed(1)
        : 'N/A'
      const value = tierConfig ? `${traderFeePct} / ${platformFeePct}` : ''
      return {
        label,
        value,
        completed: tierIndex < currentTier,
        active: tierIndex === currentTier
      }
    })

  const nextTierIndex = currentTier < 5 ? currentTier + 1 : currentTier
  const nextTierLabel = TIER_LABELS[nextTierIndex]
  const nextTierConfig = protocolTierConfig?.tiers.find(
    t => t.tierIndex === nextTierIndex
  )
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

  return (
    <div className='bg-gradient-to-br from-[#071b1b] to-[#041010] border border-teal-900/30 rounded-2xl p-6 space-y-6'>
      {/* HEADER */}

      <div className='flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0'>
        <div>
          <h3 className='text-sm font-semibold text-teal-100 tracking-wide'>
            TIER PROGRESSION
          </h3>

          <p className='text-xs text-teal-200/50 mt-1'>
            Track your progress toward the next trader tier.
          </p>
        </div>

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
      </div>

      {/* CURRENT TIER CARD */}

      <div className='border border-yellow-500/30 bg-yellow-500/5 rounded-xl p-4 flex items-center gap-4'>
        <div className='md:w-10 md:h-10 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold'>
          ★
        </div>

        <div>
          <p className='text-xs text-teal-200/60'>CURRENT TIER</p>

          <h4 className='font-semibold text-[1rem] md:text-lg text-yellow-400'>
            {tierState?.currentTierLabel || 'Unranked'}
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

      {/* REQUIREMENTS */}

      <div className='space-y-3'>
        <h4 className='text-[12px] md:text-[18px] text-white font-[900] uppercase '>
          REQUIREMENTS FOR {nextTierLabel?.toUpperCase() || 'THE NEXT TIER'}
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          ;
          <RequirementBar
            title='Trade Count'
            progress={tierState?.totalTrades && nextTierConfig?.minTrackRecordDays ? (tierState.totalTrades / nextTierConfig.minTrackRecordDays) * 100 : 0}
            value={`${tierState?.totalTrades || 0} / ${nextTierConfig?.minTrackRecordDays || 0}`}
            info={`${(nextTierConfig?.minTrackRecordDays || 0) - (tierState?.totalTrades || 0)} trades remaining`}
          />
          <RequirementBar
            title='Assets Under Management'
            progress={
              tierState?.metrics.rollingAumUsd && nextTierConfig?.minAumUsd
                ? (parseFloat(tierState.metrics.rollingAumUsd) /
                    parseFloat(nextTierConfig.minAumUsd)) *
                  100
                : 0
            }
            value={`$${parseFloat(
              tierState?.metrics.rollingAumUsd || '0'
            ).toFixed(1)}M / $${parseFloat(
              nextTierConfig?.minAumUsd || '0'
            ).toFixed(1)}M`}
            info={`$${(
              parseFloat(nextTierConfig?.minAumUsd || '0') -
              parseFloat(tierState?.metrics.rollingAumUsd || '0')
            ).toFixed(1)}M to go`}
          />
          <RequirementBar
            title='Risk Consistency Score'
            progress={
              tierState?.metrics.maxDrawdownBps &&
              nextTierConfig?.maxDrawdownBps
                ? (tierState.metrics.maxDrawdownBps /
                    nextTierConfig.maxDrawdownBps) *
                  100
                : 0
            }
            value={`${tierState?.metrics.maxDrawdownPct || '0'}% / ${
              nextTierConfig?.maxDrawdownPct || '0'
            }%`}
            info={`${(
              parseFloat(nextTierConfig?.maxDrawdownPct || '0') -
              parseFloat(tierState?.metrics.maxDrawdownPct || '0')
            ).toFixed(1)}% buffer`}
          />
          <RequirementBar
            title='Maximum Drawdown'
            progress={
              tierState?.metrics.maxDrawdownBps &&
              nextTierConfig?.maxDrawdownBps
                ? (tierState.metrics.maxDrawdownBps /
                    nextTierConfig.maxDrawdownBps) *
                  100
                : 0
            }
            value={`${tierState?.metrics.maxDrawdownPct || '0'}% / ${
              nextTierConfig?.maxDrawdownPct || '0'
            }%`}
            info={`${(
              parseFloat(nextTierConfig?.maxDrawdownPct || '0') -
              parseFloat(tierState?.metrics.maxDrawdownPct || '0')
            ).toFixed(1)}% buffer`}
          />
          <RequirementBar
            title='Track Record Duration'
            progress={
              tierState?.metrics.daysActive &&
              nextTierConfig?.minTrackRecordDays
                ? (tierState.metrics.daysActive /
                    nextTierConfig.minTrackRecordDays) *
                  100
                : 0
            }
            value={`${tierState?.metrics.daysActive || 0} days / ${
              nextTierConfig?.minTrackRecordDays || 0
            } days`}
            info={`${
              (nextTierConfig?.minTrackRecordDays || 0) -
              (tierState?.metrics.daysActive || 0)
            } days required`}
          />
          <RequirementBar
            title='Copier Count'
            progress={
              tierState?.metrics.activeCopiers && nextTierConfig?.minCopiers
                ? (tierState.metrics.activeCopiers /
                    nextTierConfig.minCopiers) *
                  100
                : 0
            }
            value={`${tierState?.metrics.activeCopiers || 0} / ${
              nextTierConfig?.minCopiers || 0
            }`}
            info={`${
              (nextTierConfig?.minCopiers || 0) -
              (tierState?.metrics.activeCopiers || 0)
            } more copiers`}
          />
        </div>
      </div>

      {/* BOTTOM GRID */}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <RemainingCard />

        <BenefitCard />
      </div>
    </div>
  )
}
