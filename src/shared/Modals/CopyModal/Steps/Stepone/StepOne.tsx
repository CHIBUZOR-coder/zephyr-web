import type { Dispatch, SetStateAction } from 'react'
import { useMemo } from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi'

import FooterButtons from '../../Components/FooterButtons'
import Input from '../../Components/Input'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGeneralContext } from '../../../../../Context/GeneralContext'
import OptionalProfitParameters from './Component/OptionalProfitParameters'

// 1. Define the specific shape of your Vault form
export interface VaultFormData {
  maxVaultDrawdown: string;
  maxTradeSize: string;
  maxEntrySlippage: string;
  // This index signature allows OptionalProfitParameters to add dynamic keys
  [key: string]: string; 
}

type RiskLevel = 'safe' | 'warning' | 'blocked'

interface RiskAnalysisResult {
  level: RiskLevel
  reasons: string[]
}

// Enhanced Risk Analysis Logic (from Trading.tsx/Settings)
const analyzeRisk = (form: VaultFormData, masterVaultAddress?: string): RiskAnalysisResult => {
  let maxTradeSize = parseInt(form.maxTradeSize || '0') || 0
  let maxDrawdown = parseInt(form.maxVaultDrawdown || '0') || 0
  let maxEntrySlippage = parseFloat(form.maxEntrySlippage || '0') || 0

  const reasons: string[] = []
  
  // Validate inputs
  const isInvalid = maxTradeSize === 0 && maxDrawdown === 0
  
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
  if (maxDrawdown > 100) {
    reasons.push(`Max drawdown capped at 100% (you entered ${maxDrawdown}%)`)
    maxDrawdown = 100
  }
  if (maxEntrySlippage > 10) {
    reasons.push(`Slippage capped at 10% (you entered ${maxEntrySlippage}%)`)
    maxEntrySlippage = 10
  }

  // Check for restrictive values
  if (maxTradeSize < 10) {
    reasons.push(`Max trade size (${maxTradeSize}%) is too low - likely to block trades`)
  } else if (maxTradeSize >= 10 && maxTradeSize < 50) {
    reasons.push(`Max trade size (${maxTradeSize}%) may block larger trades`)
  }

  if (maxDrawdown < 10) {
    reasons.push(`Max drawdown (${maxDrawdown}%) is tight - may pause during volatility`)
  }

  // Add master vault simulation if provided
  if (masterVaultAddress) {
    reasons.push(`Simulating with master: ${masterVaultAddress.slice(0, 6)}...${masterVaultAddress.slice(-4)}`)
    if (maxTradeSize < 50) {
      reasons.push(`If master executes large trades, you may be blocked with current ${maxTradeSize}% limit`)
    }
  }

  // Determine risk level
  if (maxTradeSize >= 50 && maxDrawdown >= 20) {
    return { level: 'safe', reasons: reasons.length ? reasons : ['All limits are permissive'] }
  }

  if (maxTradeSize >= 20 && maxDrawdown >= 10) {
    return { level: 'warning', reasons: reasons.length ? reasons : ['Some limits are restrictive'] }
  }

  return { level: 'blocked', reasons: reasons.length ? reasons : ['Risk params too restrictive'] }
}

// 2. Define the Props with proper React types
type StepOneProps = {
  onNext: () => void
  form: VaultFormData
  setForm: Dispatch<SetStateAction<VaultFormData>>
}

export const StepOne = ({ onNext, form, setForm }: StepOneProps) => {
  const { selectedTrader, closeVaultFlow, setWalletModal } = useGeneralContext()
  const { connected } = useWallet()

  // Get master vault address for risk simulation
  const masterVaultAddress = selectedTrader?.vaultAddress

  // Risk analysis
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

  // 3. Use the functional update pattern (prev => ...) to avoid stale state bugs
  const handleInputChange = (key: keyof VaultFormData | string, value: string) => {
    setForm((prev) => ({ 
      ...prev, 
      [key]: value 
    }))
  }

  return (
    <div className='pb-4 px-6'>
      <div className='flex flex-col gap-2 mt-5'>
        {/* Trader Profile Section */}
        <div className='w-full rounded-lg border-[1px] border-[#1c3535] p-3 flex justify-between items-center flex-col md:flex-row gap-5 md:gap-0'>
          <div className='flex justify-between gap-2 w-full md:w-auto'>
            <span
              className='h-[48px] w-[48px] rounded-full bg-cover bg-center'
              style={{ backgroundImage: `url(${selectedTrader?.image})` }}
            ></span>
            <div>
              <div className='flex items-center gap-2'>
                <p className='text-[18px] font-[700] text-white'>
                  {selectedTrader?.name}
                </p>
                <span className='text-[8px] font-[400] leading-[15px] tracking-[0.5px] uppercase bg-ins border border-[#482174] text-[#D8B4FE] px-1 rounded-sm'>
                  Institutional
                </span>
              </div>
              <p className='font-[400] text-[10px] leading-4 text-[#F3F3F3]'>
                Strategy: High-Freq Solana DEX
              </p>
            </div>
          </div>
          
          <div className='flex gap-5 md:gap-3 items-center w-full md:w-auto'>
            <div className='flex flex-col gap-2'>
              <p className='dd'>30D PnL</p>
              <p className='numm text-[#10B981]'>+142.5%</p>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='dd'>Win Rate</p>
              <p className='numm text-white'>78.4%</p>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='dd'>Max DD</p>
              <p className='numm text-[#EF4444]'>-12.2%</p>
            </div>
          </div>
        </div>

        <div className='flex gap-2 items-center mt-6'>
          <span
            className='h-[16px] w-[16px] bg-center bg-cover inline-block'
            style={{ backgroundImage: `url("/images/sheild.svg")` }}
          ></span>
          <p className='text-white font-[400] leading-[20px] text-[14px]'>
            Required Risk Parameters
          </p>
        </div>

        {/* Form Inputs Section */}
        <div className='grid grid-col-1 md:grid-cols-2 gap-6 mt-2'>
          <Input
            label='Max Vault Drawdown'
            placeholder='20'
            info='Hard stop if your vault equity drops by this amount.'
            value={form.maxVaultDrawdown}
            onChange={(e) => handleInputChange('maxVaultDrawdown', e.target.value)}
          />
          <Input
            label='Max Trade Size'
            placeholder='5'
            info='Recommended: 2-5% for conservative risk profile.'
            value={form.maxTradeSize}
            onChange={(e) => handleInputChange('maxTradeSize', e.target.value)}
          />
          <Input 
            label='Max Entry Slippage' 
            placeholder='0.5'
            info='Recommended: 0.5% for conservative risk profile.'
            value={form.maxEntrySlippage}
            onChange={(e) => handleInputChange('maxEntrySlippage', e.target.value)}
          />

          <div className='flex items-center gap-2 rounded-md border border-[#EAB308] md:h-[41px] mt-0 md:mt-[1.2rem] bg-mod px-3 py-2 h-auto'>
            <FiAlertTriangle className='text-[#EAB308] text-xs' />
            <p className='text-[10px] font-[400] text-[#EAB308]'>
              Setting slippage too low may cause missed trades on volatile pairs.
            </p>
          </div>
        </div>

        {/* Risk Analysis Display */}
        <div className='flex items-center justify-between p-3 bg-[#0d1f1f] border border-[#1c3535] rounded-lg'>
          <div className='flex items-center gap-2 text-sm font-bold'>
            <FiInfo className='text-[#7A9E9A]' />
            <span className='text-white'>Risk Analysis</span>
          </div>
          <div className='text-xs font-bold uppercase'>
            {getRiskBadge(riskAnalysis.level)}
          </div>
        </div>

        {/* Risk Analysis Reasons */}
        {riskAnalysis.reasons.length > 0 && (
          <div className={`p-3 rounded-lg text-[10px] space-y-1 ${
            riskAnalysis.level === 'safe' ? 'bg-green-900/20 border border-green-500/30 text-green-400' :
            riskAnalysis.level === 'warning' ? 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-400' :
            'bg-red-900/20 border border-red-500/30 text-red-400'
          }`}>
            {riskAnalysis.reasons.map((reason, i) => (
              <p key={i}>{reason}</p>
            ))}
          </div>
        )}

        {/* 4. Pass the type-safe props down */}
        <OptionalProfitParameters 
          form={form} 
          setForm={setForm} 
        />
      </div>

      {/* Footer Actions */}
      <div className='flex justify-between items-center mt-20 md:mt-24 lg:mt-20 flex-col md:flex-row gap-4 md:gap-0'>
        <p className='text-[12px] text-white font-[400] w-full md:w-auto'>
          Non-custodial smart contract.
        </p>
        <div className='flex items-center gap-6 w-full md:w-auto justify-between md:justify-start'>
          <span
            onClick={closeVaultFlow}
            className='text-[14px] font-[500] text-white cursor-pointer'
          >
            Cancel
          </span>
          <FooterButtons
            onNext={onNext}
            nextLabel='Create Vault'
            icon={<FaArrowRight />}
          />
        </div>
      </div>

      {/* Wallet Status */}
      <div className='flex justify-center items-center mt-4'>
        <div className='text-[12px] font-[400] text-[#F3F3F3] text-center p-2 border border-gray-500 rounded-md flex items-center gap-3'>
          <span
            className='h-[12px] w-[12px] bg-center bg-cover'
            style={{ backgroundImage: `url("/images/wallet.svg")` }}
          ></span>
          {connected ? (
            <span>Wallet Connected</span>
          ) : (
            <span
              className='cursor-pointer'
              onClick={() => setWalletModal(true)}
            >
              Connect Wallet
            </span>
          )}
        </div>
      </div>
    </div>
  )
}