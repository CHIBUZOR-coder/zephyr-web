import { useState, useMemo } from 'react'
import {
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi'

import FooterButtons from '../Components/FooterButtons'
import { IoMdOptions } from 'react-icons/io'
import { useGeneralContext } from '../../../../Context/GeneralContext'
import { useCopierVault } from '../../../../features/master/useCopierVault'
import { useVaultOperations } from '../../../../features/master/useVaultOperations'
import Input from '../../EditRiskModal/Editcomponents/Input'

type RiskLevel = 'safe' | 'warning' | 'blocked'

interface RiskAnalysisResult {
  level: RiskLevel
  reasons: string[]
}

type StepTwoProps = {
  onBack: () => void
  onNext: () => void
  form: {
    stopLossTriggerBps?: string
    maxTradeSize?: string
    maxVaultDrawdown?: string
    takeProfitTriggerBps?: string
    maxEntrySlippage?: string
    vaultPda?: string
    depositAmount?: string
    txSig?: string
  }
  setForm: React.Dispatch<React.SetStateAction<StepTwoProps['form']>>
}

// Enhanced Risk Analysis Logic (ported from Trading.tsx/Settings)
const analyzeRisk = (
  form: StepTwoProps['form'],
  masterVaultAddress?: string
): RiskAnalysisResult => {
  let maxTradeSize = parseFloat(form.maxTradeSize || '0') || 0
  const maxLoss = parseFloat(form.stopLossTriggerBps || '0') || 0
  const maxDrawdown = parseFloat(form.maxVaultDrawdown || '0') || 0

  const reasons: string[] = []

  // Validate inputs
  const isInvalid = maxTradeSize === 0 && maxLoss === 0 && maxDrawdown === 0

  if (isInvalid) {
    return {
      level: 'blocked',
      reasons: ['Invalid parameters - please enter values']
    }
  }

  // Validate maxTradeSize as SOL amount
  if (maxTradeSize < 0.01) {
    reasons.push(
      `Max trade size (${maxTradeSize} SOL) is too low - may block trades`
    )
  } else if (maxTradeSize > 50) {
    reasons.push(
      `Max trade size capped at 50 SOL (you entered ${maxTradeSize} SOL)`
    )
    maxTradeSize = 50
  }

  if (maxLoss < 1.0 && maxLoss > 0) {
    reasons.push(
      `Max loss (${maxLoss} SOL) is aggressive - may stop prematurely`
    )
  }

  if (maxDrawdown < 2.0 && maxDrawdown > 0) {
    reasons.push(
      `Max drawdown (${maxDrawdown} SOL) is tight - may pause during volatility`
    )
  }

  if (maxDrawdown < maxLoss && maxDrawdown > 0) {
    reasons.push(
      `Max drawdown (${maxDrawdown} SOL) < max loss (${maxLoss} SOL) - illogical`
    )
  }

  // Add master vault simulation if provided
  if (masterVaultAddress) {
    reasons.push(
      `Simulating with master: ${masterVaultAddress.slice(
        0,
        6
      )}...${masterVaultAddress.slice(-4)}`
    )
  }

  // Determine risk level based on absolute SOL amounts
  if (maxDrawdown >= 10 && maxLoss >= 5) {
    return {
      level: 'safe',
      reasons: reasons.length ? reasons : ['All limits are permissive']
    }
  }

  if (maxDrawdown >= 5) {
    return {
      level: 'warning',
      reasons: reasons.length ? reasons : ['Some limits are restrictive']
    }
  }

  return {
    level: 'blocked',
    reasons: reasons.length ? reasons : ['Risk params too restrictive']
  }
}

export const StepTwo = ({ onBack, onNext, form, setForm }: StepTwoProps) => {
  const { selectedTrader } = useGeneralContext()
  const { createCopierVault, loading } = useCopierVault()
  const { initializeRiskConfig, initializeTierConfig, updateRiskConfig } =
    useVaultOperations()
  const [, setLocalError] = useState<string | null>(null)
  const [manualBootstrap, setManualBootstrap] = useState(false)

  // Get master vault address for risk simulation
  const masterVaultAddress = selectedTrader?.vaultAddress

  const riskAnalysis = useMemo(
    () => analyzeRisk(form, masterVaultAddress),
    [form, masterVaultAddress]
  )

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'safe':
        return (
          <span className='flex items-center gap-1 text-green-400'>
            <FiCheckCircle /> SAFE
          </span>
        )
      case 'warning':
        return (
          <span className='flex items-center gap-1 text-yellow-400'>
            <FiAlertTriangle /> WARNING
          </span>
        )
      case 'blocked':
        return (
          <span className='flex items-center gap-1 text-red-400'>
            <FiXCircle /> BLOCKED
          </span>
        )
    }
  }

  const handleParamChange = (key: keyof StepTwoProps['form'], val: string) => {
    const numericVal = val.replace(/[^\d.]/g, '')
    setForm(prev => ({ ...prev, [key]: numericVal }))
  }

  const handleBootstrap = async (type: 'RISK' | 'TIERS' | 'UPDATE_RISK') => {
    try {
      setLocalError(null)
      if (type === 'RISK') await initializeRiskConfig()
      else if (type === 'TIERS') await initializeTierConfig()
      else if (type === 'UPDATE_RISK') await updateRiskConfig()
      alert(`${type} operation successful! Try creating your vault again.`)
    } catch (err: unknown) {
      setLocalError(
        (err as Error).message || `Failed to perform ${type} operation`
      )
    }
  }

  const handleConfirm = async () => {
    if (!selectedTrader || !selectedTrader.vaultAddress) {
      setLocalError('No master trader selected')
      return
    }

    const maxTradeSizeSol = parseFloat(form.maxTradeSize ?? '0.5') || 0.5
    const maxLossSol = parseFloat(form.stopLossTriggerBps ?? '1.0') || 1.0
    const maxDrawdownSol = parseFloat(form.maxVaultDrawdown ?? '2.0') || 2.0
    const depositAmount = parseFloat(form.depositAmount ?? '0') || 0

    // Convert SOL amount to percentage
    let maxTradeSizePct = 5
    let maxLossPct = 10
    let maxDrawdownPct = 15

    if (depositAmount > 0) {
      maxTradeSizePct = Math.max(
        1,
        Math.min(100, Math.round((maxTradeSizeSol / depositAmount) * 100))
      )
      maxLossPct = Math.max(
        1,
        Math.min(100, Math.round((maxLossSol / depositAmount) * 100))
      )
      maxDrawdownPct = Math.max(
        1,
        Math.min(100, Math.round((maxDrawdownSol / depositAmount) * 100))
      )
    }

    try {
      setLocalError(null)
      const res = await createCopierVault({
        masterVault: selectedTrader.vaultAddress,
        maxLossPct: maxLossPct,
        maxTradeSizePct: maxTradeSizePct,
        maxDrawdownPct: maxDrawdownPct,
        stopLossTriggerBps: maxLossPct * 100,
        stopLossSellBps: (maxLossPct + 2) * 100,
        dailyLossLimitBps: maxDrawdownPct * 100
      })

      // // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // const vaultPda = (res as any)?.vault?.vaultPda ?? (res as any)?.data?.vaultPda ?? (res as any)?.vaultPda;
      // const txSig = (res as any)?.tx;
      // Replace with:
      const result = res as {
        vault?: { vaultPda?: string }
        data?: { vaultPda?: string }
        vaultPda?: string
        tx?: string
      }
      const vaultPda =
        result?.vault?.vaultPda ?? result?.data?.vaultPda ?? result?.vaultPda
      const txSig = result?.tx

      if (vaultPda) {
        setForm((prev: StepTwoProps['form']) => ({ ...prev, vaultPda, txSig }))
        onNext()
      } else {
        setLocalError('Failed to get vault address. Please refresh the page.')
      }
    } catch (err: unknown) {
      console.error('Failed to create copier vault:', err)
      const errorMessage = (err as Error).message || 'Failed to create vault'
      if (errorMessage.includes('already exists')) {
        setLocalError(
          'A copier vault already exists for this master trader. Please refresh the page to see your existing vault.'
        )
      } else {
        setLocalError(errorMessage)
      }
    }
  }

  return (
    <div className='pb-4 px-6'>
      {loading ? (
        <div className='flex flex-col items-center justify-center py-20 space-y-6'>
          <div className='relative'>
            <div className='w-20 h-20 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin'></div>
            <div className='absolute inset-0 flex items-center justify-center text-teal-500'>
              <IoMdOptions size={32} className='animate-pulse' />
            </div>
          </div>
          <div className='text-center space-y-2'>
            <h3 className='text-xl font-bold text-white tracking-tight'>
              Initializing Vault
            </h3>
            <p className='text-sm text-[#7DAAA4] max-w-[280px] leading-relaxed'>
              Confirming your risk parameters and setting up your secure
              on-chain vault...
            </p>
          </div>

          <div className='flex gap-1.5'>
            {[0, 150, 300].map(delay => (
              <div
                key={delay}
                className='w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce'
                style={{ animationDelay: `${delay}ms` }}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className='font-inter mt-6 text-[#F3F3F3] text-[12px] font-[600] leading-[16px] tracking-[0.6px] uppercase'>
            Selected Master Trader
          </p>

          {/* Risk Parameters Form */}
          <div className='mt-5 space-y-4 bg-[#0d1f1f] border border-[#1c3535] rounded-xl p-5'>
            <div className='flex items-center justify-between'>
              <h3 className='text-white text-sm font-bold flex items-center gap-2'>
                <IoMdOptions /> Review Risk Configuration
              </h3>
              <div className='text-[10px] font-bold uppercase'>
                {getRiskBadge(riskAnalysis.level)}
              </div>
            </div>

            {/* Master vault simulation info */}
            {masterVaultAddress && (
              <div className='flex items-center gap-2 p-2 bg-[#061B19] rounded-lg text-[10px] text-[#7A9E9A]'>
                <FiInfo size={12} />
                <span>
                  Simulating risk with master vault:{' '}
                  {masterVaultAddress.slice(0, 6)}...
                  {masterVaultAddress.slice(-4)}
                </span>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Input
                label='Max Vault Drawdown (SOL)'
                value={form.maxVaultDrawdown || '2.0'}
                onChange={v => handleParamChange('maxVaultDrawdown', v)}
                suffix=''
              />
              <Input
                label='Max Trade Size (SOL)'
                value={form.maxTradeSize || '0.5'}
                onChange={v => handleParamChange('maxTradeSize', v)}
                suffix=''
              />
              <Input
                label='Stop Loss Trigger (SOL)'
                value={form.stopLossTriggerBps || '1.0'}
                onChange={v => handleParamChange('stopLossTriggerBps', v)}
                suffix=''
              />
              <Input
                label='Entry Slippage'
                value={form.maxEntrySlippage || '0.5'}
                onChange={v => handleParamChange('maxEntrySlippage', v)}
                suffix='%'
              />
            </div>

            {/* Risk Analysis Output */}
            {riskAnalysis.reasons.length > 0 && (
              <div
                className={`p-3 rounded-lg text-[10px] space-y-1 ${
                  riskAnalysis.level === 'safe'
                    ? 'bg-green-900/20 border border-green-500/30 text-green-400'
                    : riskAnalysis.level === 'warning'
                    ? 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-400'
                    : 'bg-red-900/20 border border-red-500/30 text-red-400'
                }`}
              >
                {riskAnalysis.reasons.map((r, i) => (
                  <p key={i}>{r}</p>
                ))}
              </div>
            )}
          </div>

          <div className='mt-5 flex flex-col gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl'>
            <p className='text-[11px] font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2'>
              <FiAlertTriangle /> Protocol Admin Controls
            </p>
            <button
              onClick={() => setManualBootstrap(prev => !prev)}
              className='text-[10px] bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 py-1 px-2 rounded border border-yellow-500/30 transition-colors w-fit'
            >
              {manualBootstrap
                ? 'Hide Initialization'
                : 'Show Initialization Buttons'}
            </button>

            {manualBootstrap && (
              <div className='flex flex-wrap gap-2 mt-1'>
                <button
                  onClick={() => handleBootstrap('RISK')}
                  className='text-[9px] bg-teal-500/20 hover:bg-teal-500/40 text-teal-400 py-1 px-3 rounded border border-teal-500/30'
                >
                  INITIALIZE RISK CONFIG
                </button>
                <button
                  onClick={() => handleBootstrap('UPDATE_RISK')}
                  className='text-[9px] bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 py-1 px-3 rounded border border-blue-500/30'
                >
                  UPDATE RISK CAPS (50%)
                </button>
                <button
                  onClick={() => handleBootstrap('TIERS')}
                  className='text-[9px] bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 py-1 px-3 rounded border border-purple-500/30'
                >
                  INITIALIZE TIER CONFIG
                </button>
              </div>
            )}
          </div>

          <FooterButtons
            onBack={onBack}
            onNext={handleConfirm}
            nextLabel='Confirm & Create Vault'
          />
        </>
      )}
    </div>
  )
}
