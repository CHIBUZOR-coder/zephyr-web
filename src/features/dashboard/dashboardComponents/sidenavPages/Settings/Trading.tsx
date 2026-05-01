import React, { useState, useMemo } from 'react'
import { FiInfo, FiSave, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { AiOutlineThunderbolt } from 'react-icons/ai'
import { MdOutlineAutoGraph } from 'react-icons/md'
import { useWallet } from '@solana/wallet-adapter-react'
import { useVaultOperations } from '../../../../master/useVaultOperations'
import { useUserVaults } from '../../../../master/useUserVaults'
import { toast } from '../../../../../core/store/useToastStore'

type RiskLevel = 'safe' | 'warning' | 'blocked'

interface RiskAnalysis {
  level: RiskLevel
  reasons: string[]
}

const Trading: React.FC = () => {
  const [slippage, setSlippage] = useState('1.0%')
  const [execution, setExecution] = useState('standard')
  const [saving, setSaving] = useState(false)
  const [masterVaultForCheck, setMasterVaultForCheck] = useState('')

  const [riskParams, setRiskParams] = useState({
    maxTradeSizePct: '10',
    maxLossPct: '5',
    maxDrawdownPct: '15',
    takeProfitPct: '20'
  })

  const analyzeRisk = (params: typeof riskParams, masterVault?: string): RiskAnalysis => {
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

    if (masterVault) {
      reasons.push(`Watching master vault: ${masterVault.slice(0, 8)}...${masterVault.slice(-4)}`)
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

  const riskAnalysis = useMemo(() => 
    analyzeRisk(riskParams, masterVaultForCheck || undefined), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [riskParams, masterVaultForCheck]
  )

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

  const [toggles, setToggles] = useState({
    autoCopy: true,
    takeProfit: true,
    riskProtection: true,
    pauseAI: false
  })

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  const { connected } = useWallet()
  const { updateCopierRiskParams } = useVaultOperations()
  const { copierVaults } = useUserVaults()

  // Get the first active copier vault's master address as a default
  const activeMasterAddress = useMemo(() => {
    if (copierVaults && copierVaults.length > 0) {
      return copierVaults[0].masterExecutionVaultPda
    }
    return null
  }, [copierVaults])

  const handleParamChange = (key: keyof typeof riskParams, val: string) => {
    const numericVal = val.replace(/[^\d.]/g, '')
    setRiskParams(p => ({ ...p, [key]: numericVal }))
  }

  return (
    <div>
      {!connected ? (
        <>
          <div className='w-full max-w-3xl'>
            <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
              PROFILE & IDENTITY
            </h1>
            <p className='text-xs sm:text-sm text-textMuted mt-1 mb-6'>
              Connect your wallet to manage your profile
            </p>
            <div className='rounded-xl border border-borderSubtle p-5 sm:p-6 bg-gradient-to-b from-cardTop to-cardBottom'>
              <p className='text-textMuted text-sm text-center py-8'>
                Please connect your wallet to view and edit your profile
                settings.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className='min-h-screen bg-[#020A09] text-white px-4 py-10 flex justify-center'>
          <div className='w-full max-w-4xl space-y-6'>
            {/* HEADER */}
            <div>
              <h1 className='text-xl font-semibold tracking-wide'>
                TRADING CONFIGURATION
              </h1>
              <p className='text-sm text-[#7A9E9A] mt-1'>
                Configure default trading parameters and automation
              </p>
            </div>

            {/* RISK SETTINGS */}
            <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-5'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
                  <FiInfo />
                  DEFAULT VAULT RISK SETTINGS
                </div>
                <div className='text-sm font-semibold'>
                  {getRiskBadge(riskAnalysis.level)}
                </div>
              </div>

              {/* Master vault input for risk simulation */}
              <div className='flex flex-col gap-2 p-3 bg-[#061B19] rounded-lg'>
                <label className='text-xs text-[#7A9E9A]'>
                  MASTER VAULT TO COPY (for risk simulation)
                </label>
                <input
                  type='text'
                  placeholder='Enter master vault address...'
                  value={masterVaultForCheck || activeMasterAddress || ''}
                  onChange={(e) => setMasterVaultForCheck(e.target.value)}
                  className='w-full bg-transparent border border-[#1A3D39] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#11B89A]'
                />
              </div>

              {/* Risk analysis reasons */}
              {riskAnalysis.reasons.length > 0 && (
                <div className={`p-3 rounded-lg text-xs space-y-1 ${
                  riskAnalysis.level === 'safe' ? 'bg-green-900/20 text-green-400' :
                  riskAnalysis.level === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
                  'bg-red-900/20 text-red-400'
                }`}>
                  {riskAnalysis.reasons.map((reason, i) => (
                    <p key={i}>{reason}</p>
                  ))}
                </div>
              )}

              <div className='grid md:grid-cols-2 gap-4'>
                <Input 
                  label='MAX TRADE SIZE (SOL)' 
                  value={riskParams.maxTradeSizePct} 
                  onChange={(v) => handleParamChange('maxTradeSizePct', v)} 
                />
                <Input 
                  label='MAX LOSS (SOL)' 
                  value={riskParams.maxLossPct} 
                  onChange={(v) => handleParamChange('maxLossPct', v)} 
                />
                <Input 
                  label='MAX DRAWDOWN (SOL)' 
                  value={riskParams.maxDrawdownPct} 
                  onChange={(v) => handleParamChange('maxDrawdownPct', v)} 
                />
                <Input 
                  label='TAKE-PROFIT %' 
                  value={riskParams.takeProfitPct} 
                  onChange={(v) => handleParamChange('takeProfitPct', v)} 
                />
              </div>

              {updateCopierRiskParams && (
                <button
                  onClick={async () => {
                    const masterVaultAddress = masterVaultForCheck || activeMasterAddress
                    if (!masterVaultAddress) {
                      toast.error('Please enter or select a Master Vault to update risk parameters.')
                      return
                    }
                    setSaving(true)
                    try {
                      const maxTradeSizeSol = parseFloat(riskParams.maxTradeSizePct) || 0.5
                      const maxLossSol = parseFloat(riskParams.maxLossPct) || 1.0
                      const maxDrawdownSol = parseFloat(riskParams.maxDrawdownPct) || 2.0
                      
                      // Get copier vault balance to convert SOL to percentage
                      let maxTradeSizePct = 5 
                      let maxLossPct = 10
                      let maxDrawdownPct = 15

                      if (copierVaults && copierVaults.length > 0) {
                        const copierVault = copierVaults.find(v => v.masterExecutionVaultPda === masterVaultAddress)
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
                      }
                      
                      await updateCopierRiskParams(masterVaultAddress, {
                        maxLossPct,
                        maxTradeSizePct,
                        maxDrawdownPct,
                      })
                      toast.success('Risk parameters updated!')
                    } catch (e) {
                      console.error(e)
                      toast.error('Failed to update: ' + (e as Error).message)
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving || riskAnalysis.level === 'blocked'}
                  className={`w-full py-2 font-semibold rounded-lg flex items-center justify-center gap-2 ${
                    saving || riskAnalysis.level === 'blocked'
                      ? 'bg-gray-600 opacity-50 text-gray-400 cursor-not-allowed'
                      : 'bg-[#11B89A] hover:bg-[#0fa88f] text-black'
                  }`}
                >
                  <FiSave size={16} />
                  {saving ? 'SAVING...' : riskAnalysis.level === 'blocked' ? 'BLOCKED - FIX RISK SETTINGS' : 'UPDATE RISK PARAMS'}
                </button>
              )}
            </div>

            {/* SLIPPAGE */}
            <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-4'>
              <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
                <MdOutlineAutoGraph />
                SLIPPAGE TOLERANCE
              </div>

              <div className='flex gap-3 flex-wrap'>
                {['0.5%', '1.0%', '2.0%'].map(val => (
                  <button
                    key={val}
                    onClick={() => setSlippage(val)}
                    className={`flex-1 min-w-[90px] py-2 rounded-lg text-sm font-medium transition
                ${
                  slippage === val
                    ? 'bg-[#11B89A] text-black'
                    : 'bg-[#061B19] border border-[#1A3D39] text-[#7A9E9A]'
                }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              <Input label='' defaultValue='1.0' />
            </div>

            {/* AUTOMATION */}
            <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-5'>
              <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
                <AiOutlineThunderbolt />
                AUTOMATION CONTROLS
              </div>

              <Toggle
                title='Auto-Copy Trades'
                desc='Automatically execute trades from followed masters'
                active={toggles.autoCopy}
                onClick={() => toggle('autoCopy')}
              />

              <Toggle
                title='Take-Profit Automation'
                desc='Auto-execute at configured TP levels'
                active={toggles.takeProfit}
                onClick={() => toggle('takeProfit')}
              />

              <Toggle
                title='Risk Protection Automation'
                desc='Auto pause on drawdown limits'
                active={toggles.riskProtection}
                onClick={() => toggle('riskProtection')}
              />

              <Toggle
                title='Pause All Automation'
                desc='Emergency stop for all automated actions'
                active={toggles.pauseAI}
                danger
                onClick={() => toggle('pauseAI')}
              />
            </div>

            {/* EXECUTION */}
            <div className='rounded-xl border border-[#1A3D39] bg-gradient-to-r from-[#071F1D] to-[#0A2C28] p-6 space-y-4'>
              <div className='flex items-center gap-2 text-sm font-semibold text-[#9CE6D9]'>
                EXECUTION PRIORITY / GAS SETTINGS
              </div>

              <div className='flex gap-3 flex-wrap'>
                {['standard', 'fast', 'custom'].map(mode => {
                  if (mode === 'custom') {
                    return (
                      <input
                        key={mode}
                        type='number'
                        placeholder='Custom'
                        className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-semibold uppercase tracking-wide outline-none transition
            ${
              execution === 'custom'
                ? 'bg-black text-[#7A9E9A]'
                : 'bg-[#061B19] border border-[#1A3D39] text-[#7A9E9A]'
            }`}
                        onFocus={() => setExecution('custom')}
                      />
                    )
                  } else {
                    return (
                      <button
                        key={mode}
                        onClick={() => setExecution(mode)}
                        className={`flex-1 min-w-[120px] py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition
                ${
                  execution === mode
                    ? 'bg-[#11B89A] text-black'
                    : 'bg-[#061B19] border border-[#1A3D39] text-[#7A9E9A]'
                }`}
                      >
                        {mode}
                      </button>
                    )
                  }
                })}
              </div>

              <div className='text-xs text-[#6F8F8A] border border-[#1A3D39] rounded-lg p-2'>
                Standard: Lower fees, slower execution (2-5 blocks)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trading

// ✅ Explicit interface instead of `any`
interface InputProps {
  label: string
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
}

const Input = ({ label, defaultValue, value, onChange }: InputProps) => (
  <div className='flex flex-col gap-1'>
    {label && (
      <label className='text-xs text-[#7A9E9A] flex items-center gap-1'>
        {label}
        <FiInfo size={12} />
      </label>
    )}

    <div className='relative'>
      <input
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className='w-full bg-[#061B19] border border-[#1A3D39] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#11B89A]'
      />
      <span className='absolute right-3 top-2 text-xs text-[#7A9E9A]'>%</span>
    </div>
  </div>
)

// Store masterVault in window for the settings page to access
declare global {
  interface Window {
    masterVault?: string
  }
}

// ✅ Explicit interface instead of `any`
interface ToggleProps {
  title: string
  desc: string
  active: boolean
  danger?: boolean
  onClick: () => void
}

const Toggle = ({ title, desc, active, danger, onClick }: ToggleProps) => {
  return (
    <div
      className={`flex items-center justify-between rounded-lg p-4 border
      ${
        danger
          ? 'border-red-500/30 bg-[#1B0F10]'
          : 'border-[#1A3D39] bg-[#061B19]'
      }`}
    >
      <div>
        <p className='text-sm'>{title}</p>
        <p className='text-xs text-[#7A9E9A]'>{desc}</p>
      </div>

      <button
        onClick={onClick}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition
        ${active ? 'bg-[#11B89A]' : 'bg-[#2A2F2E]'}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full transition
          ${active ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  )
}