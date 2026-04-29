import { AnimatePresence, motion } from 'framer-motion'
import { FiX, FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi'
import Input from './Editcomponents/Input'
import OptionalProfitParameters from './Editcomponents/OptionalProfitParameters'
import { useGeneralContext } from '../../../Context/GeneralContext'
import { useEffect, useState, useMemo } from 'react'
import { useVaultOperations } from '../../../features/master/useVaultOperations'
import { useUserVaults } from '../../../features/master/useUserVaults'
import { toast } from '../../../core/store/useToastStore'

type RiskLevel = 'safe' | 'warning' | 'blocked'

interface RiskAnalysis {
  level: RiskLevel
  reasons: string[]
}

const PrimaryButton = ({
  onClick,
  label,
  disabled,
  loading
}: {
  onClick: () => void
  label: string
  disabled?: boolean
  loading?: boolean
}) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.02, filter: 'brightness(1.1)' } : {}}
    whileTap={!disabled ? { scale: 0.97 } : {}}
    onClick={onClick}
    disabled={disabled || loading}
    className={`flex-[1.8] py-[13px] rounded-[10px] text-white text-[14px] tracking-[0.5px] font-[900] leading-[21px] cursor-pointer border-none w-1/2 transition-all ${
      disabled || loading
        ? 'bg-gray-600 opacity-50 cursor-not-allowed'
        : 'bg-[#00a08a]'
    }`}
  >
    {loading ? 'Processing...' : label}
  </motion.button>
)

export default function EditRiskModal () {
  const { editRiskvisible, setEditRiskvisible, selectedVaultPda } = useGeneralContext()
  const { updateCopierRiskParams } = useVaultOperations()
  const { copierVaults } = useUserVaults()
  
  const [loading, setLoading] = useState(false)
  
  // Find current vault data to pre-populate inputs
  const currentVault = useMemo(() => 
    copierVaults?.find((v: { vaultPda: string }) => v.vaultPda === selectedVaultPda),
    [copierVaults, selectedVaultPda]
  )

  const [riskParams, setRiskParams] = useState({
    maxTradeSizePct: '10',
    maxLossPct: '5',
    maxDrawdownPct: '15',
    takeProfitPct: '20',
    maxEntrySlippage: '0.5'
  })

  // Update params when vault selection changes or data loads
  useEffect(() => {
    // Ideally, we'd fetch actual risk params here.
    // For now, we stick with current defaults or simple logic.
  }, [currentVault])

  // Same logic from Trading.tsx
  const analyzeRisk = (params: typeof riskParams): RiskAnalysis => {
    const reasons: string[] = []
    let maxTradeSize = parseFloat(params.maxTradeSizePct.replace(/[^\d.]/g, '')) || 0
    const maxLoss = parseFloat(params.maxLossPct.replace(/[^\d.]/g, '')) || 0
    const maxDrawdown = parseFloat(params.maxDrawdownPct.replace(/[^\d.]/g, '')) || 0

    const isInvalid = maxTradeSize === 0 && maxLoss === 0 && maxDrawdown === 0
    
    if (isInvalid) {
      return { 
        level: 'blocked', 
        reasons: ['Invalid parameters - please enter values'] 
      }
    }

    // Validate maxTradeSize as SOL amount
    if (maxTradeSize < 0.01) {
      reasons.push(`Max trade size (${maxTradeSize} SOL) is too low`)
    } else if (maxTradeSize > 50) {
      reasons.push(`Max trade size capped at 50 SOL`)
      maxTradeSize = 50
    }

    if (maxLoss < 1.0 && maxLoss > 0) {
      reasons.push(`Max loss (${maxLoss} SOL) is aggressive - may stop prematurely`)
    }

    if (maxDrawdown < 2.0 && maxDrawdown > 0) {
      reasons.push(`Max drawdown (${maxDrawdown} SOL) is tight - may pause during volatility`)
    }

    if (maxDrawdown < maxLoss && maxDrawdown > 0) {
      reasons.push(`Max drawdown (${maxDrawdown} SOL) < max loss (${maxLoss} SOL) - illogical`)
    }

    // Risk level based on absolute SOL amounts
    if (maxDrawdown >= 10 && maxLoss >= 5) {
      return { level: 'safe', reasons: ['All limits are permissive'] }
    }

    if (maxDrawdown >= 5) {
      return { level: 'warning', reasons: reasons.length ? reasons : ['Some limits are restrictive'] }
    }

    return { level: 'blocked', reasons: reasons.length ? reasons : ['Risk params too restrictive'] }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const riskAnalysis = useMemo(() => analyzeRisk(riskParams), [riskParams])

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'safe':
        return <span className='flex items-center gap-1 text-green-400'><FiCheckCircle /> SAFE</span>
      case 'warning':
        return <span className='flex items-center gap-1 text-yellow-400'><FiAlertTriangle /> AT RISK</span>
      case 'blocked':
        return <span className='flex items-center gap-1 text-red-400'><FiXCircle /> BLOCKED</span>
    }
  }

  const handleParamChange = (key: keyof typeof riskParams, val: string) => {
    const numericVal = val.replace(/[^\d.]/g, '')
    setRiskParams(p => ({ ...p, [key]: numericVal }))
  }

  const handleSave = async () => {
    if (!selectedVaultPda) {
      toast.error('No vault selected for editing.')
      return
    }

    setLoading(true)
    try {
      const maxTradeSizeSol = parseFloat(riskParams.maxTradeSizePct) || 0.5
      const maxLossSol = parseFloat(riskParams.maxLossPct) || 1.0
      const maxDrawdownSol = parseFloat(riskParams.maxDrawdownPct) || 2.0
      
      // Default percentages if we can't find balance
      let maxTradeSizePct = 10
      let maxLossPct = 5
      let maxDrawdownPct = 15

      // Get copier vault balance to convert SOL to percentage
      const copierVault = copierVaults?.find(v => v.masterExecutionVaultPda === selectedVaultPda) || currentVault
      
      if (copierVault) {
        const balance = parseFloat(copierVault.actualBalance?.toString() || copierVault.balance) / 1e9
        if (balance > 0) {
          maxTradeSizePct = Math.round((maxTradeSizeSol / balance) * 100)
          maxTradeSizePct = Math.max(1, Math.min(100, maxTradeSizePct))

          maxLossPct = Math.round((maxLossSol / balance) * 100)
          maxLossPct = Math.max(1, Math.min(100, maxLossPct))

          maxDrawdownPct = Math.round((maxDrawdownSol / balance) * 100)
          maxDrawdownPct = Math.max(1, Math.min(100, maxDrawdownPct))
        }
      }
      
      await updateCopierRiskParams(selectedVaultPda, {
        maxLossPct,
        maxTradeSizePct,
        maxDrawdownPct,
      })
      toast.success('Risk parameters updated successfully!')
      setEditRiskvisible(false)
    } catch (e) {
      console.error(e)
      toast.error('Failed to update risk parameters.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {editRiskvisible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditRiskvisible(false)}
              className='fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]'
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='fixed inset-0 flex justify-center items-center z-[100] p-4'
            >
              <motion.div
                onClick={e => e.stopPropagation()}
                className='w-full max-w-[600px] bg-[#0d1f1f] rounded-2xl border border-[#1c3535] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'
              >
                {/* Header */}
                <div className='flex justify-between items-center px-6 py-5 border-b border-[#1c3535]'>
                  <h2 className='text-white text-lg font-bold tracking-tight'>
                    Edit Risk Parameters
                  </h2>
                  <button 
                    onClick={() => setEditRiskvisible(false)}
                    className='text-gray-400 hover:text-white transition-colors'
                  >
                    <FiX size={20} />
                  </button>
                </div>
                
                {/* Content */}
                <div className='flex-1 overflow-y-auto p-6 space-y-6'>
                  {/* Risk Badge & Analysis */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2 text-xs font-bold text-[#B0E4DD80] uppercase tracking-wider'>
                        <FiInfo />
                        Risk Status Analysis
                      </div>
                      <div className='text-xs font-black'>
                        {getRiskBadge(riskAnalysis.level)}
                      </div>
                    </div>

                    {riskAnalysis.reasons.length > 0 && (
                      <div className={`p-3 rounded-lg text-[11px] space-y-1 border ${
                        riskAnalysis.level === 'safe' ? 'bg-green-900/10 border-green-900/30 text-green-400' :
                        riskAnalysis.level === 'warning' ? 'bg-yellow-900/10 border-yellow-900/30 text-yellow-400' :
                        'bg-red-900/10 border-red-900/30 text-red-400'
                      }`}>
                        {riskAnalysis.reasons.map((reason, i) => (
                          <p key={i} className='flex items-start gap-1'>
                            <span>•</span> {reason}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Primary Inputs */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Input 
                      label='Max Vault Drawdown (SOL)' 
                      value={riskParams.maxDrawdownPct}
                      onChange={(v) => handleParamChange('maxDrawdownPct', v)}
                      info='Hard stop if your vault equity drops by this amount of SOL.'
                    />
                    <Input 
                      label='Max Trade Size (SOL)' 
                      value={riskParams.maxTradeSizePct}
                      onChange={(v) => handleParamChange('maxTradeSizePct', v)}
                      info='Maximum SOL per single copied trade.'
                    />
                    <Input 
                      label='Max Entry Slippage' 
                      value={riskParams.maxEntrySlippage}
                      onChange={(v) => handleParamChange('maxEntrySlippage', v)}
                      info='Maximum price slippage allowed for trade entry.'
                    />
                    <Input 
                      label='Max Loss Per Trade (SOL)' 
                      value={riskParams.maxLossPct}
                      onChange={(v) => handleParamChange('maxLossPct', v)}
                      info='Auto-close single trade if it hits this loss amount in SOL.'
                    />
                  </div>

                  {/* Optional Parameters */}
                  <OptionalProfitParameters 
                    takeProfitPct={riskParams.takeProfitPct}
                    setTakeProfitPct={(v) => handleParamChange('takeProfitPct', v)}
                    stopLossOverridePct={riskParams.maxLossPct} // Using maxLossPct as stop loss override for now
                    setStopLossOverridePct={(v) => handleParamChange('maxLossPct', v)}
                  />
                </div>

                {/* Footer */}
                <div className='p-6 border-t border-[#1c3535] bg-[#0a1a1a] flex justify-between items-center gap-4'>
                  <button
                    onClick={() => setEditRiskvisible(false)}
                    className='text-white text-sm font-medium hover:text-gray-300 transition-colors px-4'
                  >
                    Cancel
                  </button>
                  <PrimaryButton
                    label={riskAnalysis.level === 'blocked' ? 'FIX RISK SETTINGS' : 'PROCEED'}
                    onClick={handleSave}
                    disabled={riskAnalysis.level === 'blocked'}
                    loading={loading}
                  />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}