import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

import Card from '../Components/Card'
import FooterButtons from '../Components/FooterButtons'
import { IoFingerPrintSharp } from 'react-icons/io5'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGeneralContext } from '../../../../Context/GeneralContext'
import { useCopierVault } from '../../../../features/master/useCopierVault'
import { useVaultOperations } from '../../../../features/master/useVaultOperations'

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

export const StepTwo = ({ onBack, onNext, form, setForm }: StepTwoProps) => {
  const { connected } = useWallet()
  const { selectedTrader } = useGeneralContext()
  const { createCopierVault, loading, error } = useCopierVault()
  const { initializeRiskConfig, initializeTierConfig, updateRiskConfig } = useVaultOperations()
  const [localError, setLocalError] = useState<string | null>(null)
  const [manualBootstrap, setManualBootstrap] = useState(false)

  const isRiskConfigError = error?.includes('risk_config') && error?.includes('3012')
  const isTierConfigError = error?.includes('tier_config') && error?.includes('3012')
  const isRiskCapError = error?.includes('RiskParamExceedsCap') || error?.includes('6032')

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

      if (res && res.vault) {
        setForm((prev: StepTwoProps['form']) => ({ ...prev, vaultPda: res.vault.vaultPda }))
        onNext()
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
      <div className=' mt-2 w-full rounded-lg border-[1px] border-[#1c3535] p-3 flex justify-between items-center flex-col md:flex-row gap-5 md:gap-0 text-gray-300 '>
        {/* left side */}
        <div className='flex justify-between gap-2 w-full md:w-auto'>
          <span
            className='h-[48px] w-[48px]  rounded-full bg-cover bg-center'
            style={{ backgroundImage: `url(${selectedTrader?.image})` }}
          ></span>
          <div>
            <div className='flex items-center gap-2'>
              <p className='text-[18px] font-[700] leading-[28px] font-[Inter]'>
                {selectedTrader?.name}
              </p>
              <span className='text-[8px] font-[400] leading-[15px] tracking-[0.5px] uppercase bg-ins border border-[#482174] text-[#D8B4FE]  px-1 rounded-sm'>
                Institutional
              </span>
            </div>
            <p className='font-[400] text-[10px] leading-4 text-[#B0E4DD80]'>
              Strategy: High-Freq Solana DEX
            </p>
          </div>
        </div>
        {/* right side */}
        <div className='flex gap-5 md:gap-3 items-center w-full md:w-auto'>
          <div className='flex flex-col gap-2'>
            <p className='dd'>30D PnL</p>
            <p className='numm text-white'>{selectedTrader?.pnl || '+142.5%'}</p>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-2 mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl'>
        <p className='text-[11px] font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2'>
          <FiAlertTriangle /> Protocol Admin Controls
        </p>
        <p className='text-[10px] text-yellow-200/60'>
          If you see "AccountNotInitialized" errors for risk_config or tier_config, use these buttons.
        </p>
        <button 
          onClick={() => setManualBootstrap(prev => !prev)}
          className="text-[10px] bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 py-1 px-2 rounded border border-yellow-500/30 transition-colors w-fit"
        >
          {manualBootstrap ? 'Hide Initialization' : 'Show Initialization Buttons'}
        </button>
        
        {manualBootstrap && (
          <div className="flex flex-wrap gap-2 mt-1">
            <button 
              onClick={() => handleBootstrap('RISK')}
              className="text-[9px] bg-teal-500/20 hover:bg-teal-500/40 text-teal-400 py-1 px-3 rounded border border-teal-500/30"
            >
              INITIALIZE RISK CONFIG
            </button>
            <button 
              onClick={() => handleBootstrap('UPDATE_RISK')}
              className="text-[9px] bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 py-1 px-3 rounded border border-blue-500/30"
            >
              UPDATE RISK CAPS (50%)
            </button>
            <button 
              onClick={() => handleBootstrap('TIERS')}
              className="text-[9px] bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 py-1 px-3 rounded border border-purple-500/30"
            >
              INITIALIZE TIER CONFIG
            </button>
          </div>
        )}
      </div>

      <p className='text-[#6B7280] text-[12px] font-[600] mt-5 uppercase leading-[16px] tracking-[0.6px]'>
        Vault Configuration
      </p>
      <div className='space-y-6 mt-2 '>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card label='Allocation Limit' value='25.00 SOL' />
          <Card label='Max Drawdown Stop' value={`-${form.maxVaultDrawdown}%`} />
          <Card label='Profit Take' value={form.takeProfitTriggerBps ? `+${form.takeProfitTriggerBps}%` : 'N/A'} />
          <Card label='Slippage Tolerance' value={`${form.maxEntrySlippage}%`} />
        </div>

        {(error || localError) && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-[11px]">
              <FiAlertTriangle /> {isRiskConfigError || isTierConfigError ? 'ERROR: PROTOCOL NOT INITIALIZED' : isRiskCapError ? 'ERROR: RISK LIMIT EXCEEDED' : 'ERROR: VAULT OPERATION FAILED'}
            </div>
            
            {isRiskConfigError || isTierConfigError ? (
              <p className="text-red-200 text-[11px] leading-relaxed">
                The {isRiskConfigError ? 'RiskConfig' : 'TierConfig'} account is not initialized on this program. 
                Please use the "Protocol Admin Controls" above to initialize it.
              </p>
            ) : isRiskCapError ? (
              <p className="text-red-200 text-[11px] leading-relaxed">
                Your requested risk parameters (e.g. 20% stop loss) exceed the current protocol-level caps. 
                Click <strong>"UPDATE RISK CAPS (50%)"</strong> in the Admin Controls above to increase the limits.
              </p>
            ) : (
              <>
                <p className="text-red-200 text-[11px] leading-relaxed">
                  {error || localError}
                </p>
                {(error?.includes('not found on-chain') || localError?.includes('not found on-chain')) && (
                  <a 
                    href={`https://explorer.solana.com/address/${selectedTrader?.vaultAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 text-[10px] uppercase font-bold hover:underline mt-1"
                  >
                    Verify on Solana Explorer ↗
                  </a>
                )}
              </>
            )}
          </div>
        )}

        <div className='bg-yellow-500/10 border mt-5 border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-400 flex gap-3 flex-col md:flex-row items-center md:items-start'>
          <span
            className='h-[26px] w-[30px] bg-center bg-cover inline-block '
            style={{ backgroundImage: `url("/images/sheild.svg")` }}
          ></span>
          <div className='text-[#EAB308]'>
            <p className='text-[14px] font-[500]'>
              Non-Custodial Initialization
            </p>
            <p className='text-[12px] font-[500]'>
              This transaction initializes your CopierVault smart contract
              on-chain. You remain the sole owner of the vault keys. Zephyr
              protocol cannot withdraw your funds{' '}
              <Link to={'/'} className="underline">Learn more about our security model.</Link>
            </p>
          </div>
        </div>
      </div>
      <div className='mt-5 flex flex-col gap-8 md:gap-3'>
        <div className='flex justify-between flex-col md:flex-row gap-1 md:gap-0'>
          <p className='text-[12px] font-[400] text-[#F3F3F3]'>
            Network Fee Estimate:~0.00005 SOL
          </p>
          <div className='flex gap-2 items-center'>
            {connected ? (
              <div className='flex items-center gap-2'>
                <p className='h-[8px] w-[8px] rounded-full animate-pulse bg-[#22C55E]'></p>
                <p className='text-[12px] font-[400] text-[#F3F3F3]'>
                  Wallet Connected
                </p>
              </div>
            ) : (
              <p className='text-[12px] font-[400] text-[#F3F3F3]'>
                Wallet Not Connected
              </p>
            )}
          </div>
        </div>
        <FooterButtons
          onBack={onBack}
          onNext={handleConfirm}
          nextLabel={loading ? 'Processing...' : 'Confirm & Create Vault'}
        />
      </div>

      <div className='flex justify-center items-center gap-3 mt-4'>
        <span className=' inline-block '>
          <IoFingerPrintSharp className='h-[12px] w-[12px] text-[#F3F3F3]' />
        </span>
        <p className='text-[10px] font-[400] text-[#F3F3F3]'>
          Signature request will appear in your wallet
        </p>
      </div>
    </div>
  )
}
