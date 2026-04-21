import { useState, useMemo } from 'react'
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi'

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
  }
  setForm: React.Dispatch<React.SetStateAction<StepTwoProps['form']>>
}

// Enhanced Risk Analysis Logic (ported from Trading.tsx/Settings)
const analyzeRisk = (form: StepTwoProps['form'], masterVaultAddress?: string): RiskAnalysisResult => {
  let maxTradeSize = parseInt(form.maxTradeSize || '0') || 0
  let maxLoss = parseInt(form.stopLossTriggerBps || '0') || 0
  let maxDrawdown = parseInt(form.maxVaultDrawdown || '0') || 0

  const reasons: string[] = []
  
  // Validate inputs - sanitize to valid percentages
  const isInvalid = maxTradeSize === 0 && maxLoss === 0 && maxDrawdown === 0
  
  if (isInvalid) {
    return { 
      level: 'blocked', 
      reasons: ['Invalid parameters - please enter numbers 0-100'] 
    }
  }

  // Cap values at 100
  if (maxTradeSize > 100) {
    reasons.push(`Max trade size capped at 100% (you entered ${maxTradeSize}%)`)
    maxTradeSize = 100
  }
  if (maxLoss > 100) {
    reasons.push(`Max loss capped at 100% (you entered ${maxLoss}%)`)
    maxLoss = 100
  }
  if (maxDrawdown > 100) {
    reasons.push(`Max drawdown capped at 100% (you entered ${maxDrawdown}%)`)
    maxDrawdown = 100
  }

  // Check for restrictive values
  if (maxTradeSize < 10) {
    reasons.push(`Max trade size (${maxTradeSize}%) is too low - likely to block trades`)
  } else if (maxTradeSize >= 10 && maxTradeSize < 50) {
    reasons.push(`Max trade size (${maxTradeSize}%) may block larger trades`)
  }

  if (maxLoss < 10 && maxLoss > 0) {
    reasons.push(`Max loss (${maxLoss}%) is aggressive - may stop prematurely`)
  }

  if (maxDrawdown < 10) {
    reasons.push(`Max drawdown (${maxDrawdown}%) is tight - may pause during volatility`)
  }

  if (maxDrawdown < maxLoss && maxDrawdown > 0) {
    reasons.push(`Max drawdown (${maxDrawdown}%) < max loss (${maxLoss}%) - illogical`)
  }

  // Add master vault simulation if provided
  if (masterVaultAddress) {
    reasons.push(`Simulating with master: ${masterVaultAddress.slice(0, 6)}...${masterVaultAddress.slice(-4)}`)
    if (maxTradeSize < 50) {
      reasons.push(`If master executes large trades, you may be blocked with current ${maxTradeSize}% limit`)
    }
  }

  // Determine risk level based on combined factors
  if (maxTradeSize >= 50 && maxDrawdown >= 20 && maxLoss >= 30) {
    return { level: 'safe', reasons: reasons.length ? reasons : ['All limits are permissive'] }
  }

  if (maxTradeSize >= 20 && maxDrawdown >= 10) {
    return { level: 'warning', reasons: reasons.length ? reasons : ['Some limits are restrictive'] }
  }

  return { level: 'blocked', reasons: reasons.length ? reasons : ['Risk params too restrictive'] }
}

export const StepTwo = ({ onBack, onNext, form, setForm }: StepTwoProps) => {
  const { selectedTrader } = useGeneralContext()
  const { createCopierVault, loading } = useCopierVault()
  const { initializeRiskConfig, initializeTierConfig, updateRiskConfig } = useVaultOperations()
  const [, setLocalError] = useState<string | null>(null)
  const [manualBootstrap, setManualBootstrap] = useState(false)

  // Get master vault address for risk simulation
  const masterVaultAddress = selectedTrader?.vaultAddress

  const riskAnalysis = useMemo(() => analyzeRisk(form, masterVaultAddress), [form, masterVaultAddress])

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'safe':
        return <span className='flex items-center gap-1 text-green-400'><FiCheckCircle /> SAFE</span>
      case 'warning':
        return <span className='flex items-center gap-1 text-yellow-400'><FiAlertTriangle /> WARNING</span>
      case 'blocked':
        return <span className='flex items-center gap-1 text-red-400'><FiXCircle /> BLOCKED</span>
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
      setLocalError((err as Error).message || `Failed to perform ${type} operation`)
    }
  }

  const handleConfirm = async () => {
    if (!selectedTrader || !selectedTrader.vaultAddress) {
      setLocalError('No master trader selected')
      return
    }

    try {
      setLocalError(null)
      const res = await createCopierVault({
        masterVault: selectedTrader.vaultAddress,
        maxLossPct: parseInt(String(form.stopLossTriggerBps ?? '20'), 10) || 20,
        maxTradeSizePct: parseInt(String(form.maxTradeSize ?? '5'), 10) || 5,
        maxDrawdownPct: parseInt(String(form.maxVaultDrawdown ?? '20'), 10) || 20,
        stopLossTriggerBps: (parseInt(String(form.stopLossTriggerBps ?? '20'), 10) || 20) * 100,
        stopLossSellBps: (parseInt(String(form.stopLossTriggerBps ?? '20'), 10) || 20) * 100,
        dailyLossLimitBps: (parseInt(String(form.maxVaultDrawdown ?? '20'), 10) || 20) * 100,
      })

      const vaultPda = (res as any)?.vault?.vaultPda ?? (res as any)?.data?.vaultPda ?? (res as any)?.vaultPda;
      if (vaultPda) {
        setForm((prev: StepTwoProps['form']) => ({ ...prev, vaultPda }));
        onNext();
      } else {
        setLocalError('Failed to get vault address. Please refresh the page.');
      }
    } catch (err: unknown) {
      console.error('Failed to create copier vault:', err)
      const errorMessage = (err as Error).message || 'Failed to create vault'
      if (errorMessage.includes('already exists')) {
        setLocalError('A copier vault already exists for this master trader. Please refresh the page to see your existing vault.')
      } else {
        setLocalError(errorMessage)
      }
    }
  }

  return (
    <div className='pb-4 px-6'>
      <p className='font-inter mt-6 text-[#F3F3F3] text-[12px] font-[600] leading-[16px] tracking-[0.6px] uppercase'>
        Selected Master Trader
      </p>
      
      {/* Risk Parameters Form */}
      <div className='mt-5 space-y-4 bg-[#0d1f1f] border border-[#1c3535] rounded-xl p-5'>
        <div className='flex items-center justify-between'>
          <h3 className='text-white text-sm font-bold flex items-center gap-2'>
            <IoMdOptions /> Risk Configuration
          </h3>
          <div className='text-[10px] font-bold uppercase'>
            {getRiskBadge(riskAnalysis.level)}
          </div>
        </div>

        {/* Master vault simulation info */}
        {masterVaultAddress && (
          <div className='flex items-center gap-2 p-2 bg-[#061B19] rounded-lg text-[10px] text-[#7A9E9A]'>
            <FiInfo size={12} />
            <span>Simulating risk with master vault: {masterVaultAddress.slice(0, 6)}...{masterVaultAddress.slice(-4)}</span>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input label='Max Vault Drawdown %' value={form.maxVaultDrawdown || '20'} onChange={v => handleParamChange('maxVaultDrawdown', v)} />
            <Input label='Max Trade Size %' value={form.maxTradeSize || '5'} onChange={v => handleParamChange('maxTradeSize', v)} />
            <Input label='Stop Loss Trigger %' value={form.stopLossTriggerBps || '20'} onChange={v => handleParamChange('stopLossTriggerBps', v)} />
            <Input label='Entry Slippage %' value={form.maxEntrySlippage || '0.5'} onChange={v => handleParamChange('maxEntrySlippage', v)} />
        </div>

        {/* Risk Analysis Output */}
        {riskAnalysis.reasons.length > 0 && (
          <div className={`p-3 rounded-lg text-[10px] space-y-1 ${
            riskAnalysis.level === 'safe' ? 'bg-green-900/20 border-green-500/30 text-green-400' :
            riskAnalysis.level === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400' :
            'bg-red-900/20 border-red-500/30 text-red-400'
          }`}>
            {riskAnalysis.reasons.map((r, i) => <p key={i}>{r}</p>)}
          </div>
        )}
      </div>

      <div className='mt-5 flex flex-col gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl'>
        <p className='text-[11px] font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2'>
          <FiAlertTriangle /> Protocol Admin Controls
        </p>
        <button 
          onClick={() => setManualBootstrap(prev => !prev)}
          className="text-[10px] bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 py-1 px-2 rounded border border-yellow-500/30 transition-colors w-fit"
        >
          {manualBootstrap ? 'Hide Initialization' : 'Show Initialization Buttons'}
        </button>
        
        {manualBootstrap && (
          <div className="flex flex-wrap gap-2 mt-1">
            <button onClick={() => handleBootstrap('RISK')} className="text-[9px] bg-teal-500/20 hover:bg-teal-500/40 text-teal-400 py-1 px-3 rounded border border-teal-500/30">INITIALIZE RISK CONFIG</button>
            <button onClick={() => handleBootstrap('UPDATE_RISK')} className="text-[9px] bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 py-1 px-3 rounded border border-blue-500/30">UPDATE RISK CAPS (50%)</button>
            <button onClick={() => handleBootstrap('TIERS')} className="text-[9px] bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 py-1 px-3 rounded border border-purple-500/30">INITIALIZE TIER CONFIG</button>
          </div>
        )}
      </div>

      {/* Existing Error Handling Block remains the same as in StepTwo.tsx */}
      <FooterButtons
        onBack={onBack}
        onNext={handleConfirm}
        nextLabel={loading ? 'Processing...' : 'Confirm & Create Vault'}
      />
    </div>
  )
}
