import { useEffect, useState } from 'react'

import { FaCheckCircle, FaQrcode } from 'react-icons/fa'
import { MdOutlineContentCopy } from 'react-icons/md'
import { useGeneralContext } from '../../../../Context/GeneralContext'
import { useVaultOperations } from '../../../../features/master/useVaultOperations'
import { useUserVaults } from '../../../../features/master/useUserVaults'

type StepThreeProps = {
  onBack: () => void
  onNext: () => void
  form: {
    depositAmount?: string
    vaultPda?: string
  }
  setForm: React.Dispatch<React.SetStateAction<StepThreeProps['form']>>
}

export const StepThree = ({ onNext, form, setForm }: StepThreeProps) => {
  const { depositConfirmed, setDepositConfirm } = useGeneralContext()

  const { depositToCopierVault, loading, error } = useVaultOperations()
  const { refetchAll } = useUserVaults()

  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (depositConfirmed) {
      onNext()
    }

    setDepositConfirm(false)
  }, [depositConfirmed, onNext, setDepositConfirm])

  const assets = [{ symbol: 'SOL', name: 'Solana' }]

  const [selectedAsset, setSelectedAsset] = useState('SOL')

  const handleDeposit = async () => {
    if (!form.vaultPda) {
      setLocalError('Vault PDA not found')
      return
    }

    if (!form.depositAmount || parseFloat(form.depositAmount) <= 0) {
      setLocalError('Please enter a valid amount')
      return
    }

    try {
      setLocalError(null)
      await depositToCopierVault(form.vaultPda, parseFloat(form.depositAmount))

      // Refresh user's vaults to show the new balance
      await refetchAll()

      setDepositConfirm(true)
      onNext()
    } catch (err: unknown) {
      console.error('Deposit failed:', err)
      setLocalError(err instanceof Error ? err.message : 'Deposit failed')
    }
  }

  const handleCopy = () => {
    if (form.vaultPda) {
      navigator.clipboard.writeText(form.vaultPda)
      alert('Vault address copied to clipboard!')
    }
  }

  return (
    <>
      <div className='space-y-6 text-gray-300 mt-2 px-6'>
        {/* SUCCESS BANNER */}
        <div className='bg-[#0f2f28] border border-[#1f4d3f] px-4 py-2 rounded-md text-[13px] text-teal-400 flex gap-3 items-center'>
          <span>
            <FaCheckCircle className='text-[#22C55E]' />
          </span>
          <p className='text-[#22C55E] text-[8px] md:text-[14px] font-[500]'>
            Vault successfully initialized on-chain.
          </p>
        </div>
        {/* DEPOSIT HEADER */}
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-white  text-[12px] md:text-[10px] font-[700]'>
              Deposit Funds
            </h3>
            <p className='text-[7px] md:text-[14px] font-[400] text-[#F3F3F3]'>
              Fund your vault to start copying trades.
            </p>
          </div>

          <div className='bg-[#0F1216] border border-[#1f3c3c] px-3 py-1 rounded-md  text-gray-400 flex items-center gap-2'>
            <p className='w-[8px] h-[8px] bg-[#14F195] rounded-full animate-pulse'></p>
            <p className='text-[11px]'> vault initialized</p>
          </div>
        </div>
        {/* VAULT ADDRESS */}
        <div>
          <p className='text-[8px] md:text-[12px] uppercase font-[500] tracking-[2px] text-[#5f7d84] mb-2'>
            YOUR VAULT ADDRESS
          </p>

          <div
            className='
    bg-[#0b1818]
    border border-[#183a3a]
    px-4 py-3
    rounded-lg
    flex items-center justify-between
  '
          >
            <span className='truncate text-[8px] md:text-[13px]'>
              <span className='text-teal-400 mr-1'>vault:</span>
              <span className='text-gray-300'>
                {form.vaultPda || 'Initializing...'}
              </span>
            </span>

            {/* Copy Icon Button */}
            <div className='flex items-center gap-2'>
              <span onClick={handleCopy} className='cursor-pointer'>
                <MdOutlineContentCopy className='h-[20px] w-[14px]' />
              </span>
              <span>
                <FaQrcode className='h-[20px] w-[14px]' />
              </span>
            </div>
          </div>

          <p className='text-[12px] text-[#F3F3F3] mt-2'>
            <span className='text-[#e6b800]'>⚠️ Important:</span> Only deposit
            assets on the Solana network.
          </p>
        </div>
        {/* FORM SECTION */}
        <div className='space-y-5'>
          {/* ASSET + NETWORK */}
          <div className='grid grid-cols-2 gap-4'>
            {/* ASSET */}
            <div>
              <p className='text-[11px] uppercase tracking-wider text-gray-500 mb-2'>
                Asset
              </p>

              <div className='relative'>
                <select
                  value={selectedAsset}
                  onChange={e => setSelectedAsset(e.target.value)}
                  className='
          w-full
          appearance-none
          bg-[#0f1f1f]
          border border-[#1f3c3c]
          px-4 py-3
          rounded-lg
          text-white
          outline-none
          cursor-pointer
        '
                >
                  {assets.map(asset => (
                    <option
                      key={asset.symbol}
                      value={asset.symbol}
                      className='bg-[#0f1f1f] text-white'
                    >
                      {asset.symbol}
                    </option>
                  ))}
                </select>

                <div className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 text-xs'>
                  ▼
                </div>
              </div>
            </div>

            {/* NETWORK */}
            <div>
              <p className='text-[11px] uppercase tracking-wider text-gray-500 mb-2'>
                Network
              </p>

              <div
                className='
      bg-[#0f1f1f]
      border border-[#1f3c3c]
      px-4 py-3
      rounded-lg
      flex items-center
      text-white
      text-sm
   
      gap-2
    '
              >
                <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                <p className='text-[8px] md:text-[14px]'> Solana Devnet</p>
              </div>
            </div>
          </div>
          {/* AMOUNT */}
          <div>
            <p className='text-[11px] uppercase tracking-wider text-gray-500 mb-2'>
              Amount
            </p>

            <div className='bg-[#0f1f1f] border border-[#1f3c3c] px-4 py-3 rounded-lg flex items-center justify-between'>
              <input
                type='number'
                placeholder='0.00'
                value={form.depositAmount}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setForm((prev: { [key: string]: string }) => ({ ...prev, depositAmount: e.target.value }))}
                className='bg-transparent outline-none text-white w-full'
              />

              <button className='text-teal-400 text-xs font-medium ml-4'>
                MAX
              </button>
            </div>

            {(error || localError) && (
              <p className='text-red-400 text-[10px] mt-1'>
                {error || localError}
              </p>
            )}

            <div className='flex justify-between text-[11px] text-gray-500 mt-2'>
              <span>≈ $0.00 USD</span>
              <span>Est. Fee: 0.000005 SOL</span>
            </div>
          </div>
        </div>
        {/* BOTTOM NOTICE */}
        <div className='bg-[#2b2414] border border-[#4a3b16] px-4 py-3 rounded-lg text-[12px] text-yellow-400'>
          <span className='font-medium'>Non-Custodial Deposit</span>
          <p className='mt-1 text-yellow-300'>
            You are depositing into a smart contract vault you control. Funds
            can be withdrawn at any time.
          </p>
        </div>
      </div>
      <div className='px-6 mt-6 border-t border-[#1f3c3c] py-4 flex justify-between items-center'>
        <span
          onClick={onNext}
          className='text-[14px] font-[500] text-[#F3F3F3] cursor-pointer'
        >
          Skip for now
        </span>

        <div className='flex items-center  gap-2'>
          <button
            onClick={() => onNext()}
            className='px-5 py-2 rounded-lg border border-[#1c3535] text-gray-400 hover:bg-teal-400 hover:text-white transition ease-in-out duration-500'
          >
            Skip
          </button>
          <button
            onClick={handleDeposit}
            disabled={loading}
            className=' smm py-2 rounded-lg bg-teal-400 text-white  flex items-center gap-2 px-3 text-[12px] md:text-[14px] font-[700] disabled:opacity-50'
          >
            {loading ? 'Processing...' : 'Deposit Funds'}
          </button>
        </div>
      </div>
    </>
  )
}
