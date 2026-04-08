import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { MdOutlineAccountBalanceWallet } from 'react-icons/md'
import { useUserVaults } from '../../../../features/master/useUserVaults'
import { useVaultOperations } from '../../../../features/master/useVaultOperations'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Props {
  onNext: () => void
  onBack: () => void
  vaultAddress: string
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const WALLET_BALANCE = 42.5
const SOL_USD_RATE = 148.32

// ─── INNER COMPONENTS ─────────────────────────────────────────────────────────

const StepIndicator = () => (
  <div className='flex items-center gap-2 mb-5'>
    <div className='flex gap-1.5'>
      {[true, true, true, true, false].map((active, i) => (
        <div
          key={i}
          className={`h-[3px] rounded-sm ${
            active ? 'w-7 bg-[#00d4a8]' : 'w-5 bg-[#1e3530]'
          }`}
        />
      ))}
    </div>
    <span
      className='text-[11px] text-[#8ba8a2] tracking-[0.08em] font-medium ml-1.5'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      STEP 4 OF 5
    </span>
  </div>
)

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className='flex-1 py-[13px] bg-transparent border border-[#1a3530] rounded-[10px] text-white  text-[14px] tracking-[0.5px] cursor-pointer font-[900] leading-[21px] uppercase'
  >
    Skip
  </motion.button>
)

const PrimaryButton = ({
  onClick,
  label
}: {
  onClick: () => void
  label: string
}) => (
  <motion.button
    whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className='flex-[1.8] py-[13px] bg-[#00a08a] rounded-[10px] text-white  text-[14px] tracking-[0.5px] font-[900] leading-[21px] cursor-pointer border-none'
  >
    {label}
  </motion.button>
)

const SolIcon = () => (
  <div className='w-9 h-9 rounded-full bg-[#0d3028] border-[1.5px] border-[#1a4a3a] flex items-center justify-center shrink-0'>
    <span className='text-[15px] text-[#00d4a8] font-[900]'>◎</span>
  </div>
)

const TransferDiagram = () => (
  <div className='flex items-center justify-center gap-3 py-4'>
    {/* Wallet node */}
    <div className='flex flex-col items-center gap-1.5'>
      <div className='bg-mwallet h-[40px]  w-[40px]  flex justify-center items-center  p-2 rounded-full'>
        <span
          className='bg-center bg-cover h-[20px] w-[20px] text-[#00C0A8] '
          style={{ backgroundImage: `url("/images/wallet.svg")` }}
        ></span>
      </div>

      <span className='text-[10px] font-[700] tracking-[0.08em] leading-[15px] text-[#607572]'>
        WALLET
      </span>
    </div>

    {/* Arrow */}
    <FiArrowRight className='text-[#8ba8a2] text-[16px] mb-[18px]' />

    {/* Vault node */}
    <div className='flex flex-col items-center gap-1.5'>
      <div className='bg-[#00C0A8] h-[40px] w-[40px] flex justify-center items-center  p-2 rounded-full shadow-[0_4px_10px_0px_rgba(256,256,256,0.3)]'>
        <span
          className='bg-center bg-cover h-[20px] w-[20px] '
          style={{ backgroundImage: `url("/images/wallet_white.svg")` }}
        ></span>
      </div>
      <span className='text-[10px] font-[700] tracking-[0.08em] leading-[15px] text-[#607572]'>
        VAULT
      </span>
    </div>
  </div>
)

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const Step4FundVault: React.FC<Props> = ({ onNext, vaultAddress }) => {
  const { refetchAll, copierVaults } = useUserVaults()

  const {
    depositToCopierVault,
    depositToMasterVault,
    error: opError
  } = useVaultOperations()
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const numericAmount = parseFloat(amount) || 0
  const usdValue = (numericAmount * SOL_USD_RATE).toFixed(2)

  const handleMax = () => setAmount(WALLET_BALANCE.toString())

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val)
  }

  const handleDeposit = async () => {
    if (!vaultAddress || !amount || parseFloat(amount) <= 0) return

    setLoading(true) // ✅ START loading

    try {
      const parsedAmount = parseFloat(amount)

      const isCopier = copierVaults?.some(v => v.vaultPda === vaultAddress)

      if (isCopier) {
        await depositToCopierVault(vaultAddress, parsedAmount)
      } else {
        await depositToMasterVault(parsedAmount)
      }

      setSuccess(true)

      refetchAll()

      setTimeout(() => {
        refetchAll()
      }, 3000)

      setTimeout(() => {
        setAmount('')
        setSuccess(false)
        setLoading(false) // ✅ STOP loading here
        onNext()
      }, 2000)
    } catch (err: unknown) {
      setLoading(false) // ✅ STOP loading on error

      console.error('Deposit flow failed:', err)

      if (err instanceof Error) {
        console.error(err.message)
      } else {
        console.error('Unknown error occurred')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <StepIndicator />

      <h1 className='font-[900] text-[16px] md:text-[20px] leading-[38px] text-white mb-2.5 '>
        Fund Your Trading Vault
      </h1>
      <p className='text-[13px] font-[500] text-[#a3d2cb] mb-6'>
        Deposit funds to start executing trades from your vault.
      </p>

      {/* Balance cards */}
      <div className='grid grid-cols-2 gap-2.5 mb-[22px]'>
        {/* Wallet Balance */}
        <div className='bg-[#0d2420] border border-[#1a3d34] rounded-xl px-4 py-3.5'>
          <div className='flex items-center gap-1.5 mb-2'>
            <span
              style={{ backgroundImage: `url("/images/wallet.svg")` }}
              className='bg-center bg-cover w-[16px] h-[16px]'
            ></span>
            <span className='text-[11px] font-[700] leading-[16.5px] uppercase tracking-[0.08em] text-[#6e8885]'>
              WALLET BALANCE
            </span>
          </div>
          <p className='text-[11px] font-[700] leading-[16.5px] uppercase tracking-[0.08em] text-[#6e8885]'>
            <span className='text-[20px] font-[900] leading-[30px] text-white'>
              {WALLET_BALANCE} SOL
            </span>
          </p>
        </div>

        {/* Vault Balance */}
        <div className='bg-[#0d2420] border border-[#1a3d34] rounded-xl px-4 py-3.5'>
          <div className='flex items-center gap-1.5 mb-2'>
            <MdOutlineAccountBalanceWallet className='text-[#8ba8a2] text-[12px]' />
            <span className='text-[11px] font-[700] leading-[16.5px] uppercase tracking-[0.08em] text-[#6e8885]'>
              VAULT BALANCE
            </span>
          </div>
          <p className='text-[20px] font-extrabold text-white m-0 leading-none'>
            <span className='text-[20px] font-[900] leading-[30px] text-white'>
              0 SOL
            </span>
          </p>
        </div>
      </div>

      {/* Deposit Amount */}
      <div className='mb-1.5'>
        <p className='font-bold text-[14px] text-[700] text-white mb-2.5 leading-[21px]'>
          Deposit Amount
        </p>

        {/* Token selector row */}
        <div className='bg-[#0c1f1c] border border-[#1e3530] border-b-0 rounded-t-xl px-3.5 py-3 flex items-center gap-2.5'>
          <SolIcon />
          <div>
            <p className=' text-[15px] text-white m-0 font-[700]'>SOL</p>
            <p className='text-[12px] text-[#6e8885] m-0 font-[500] '>Solana</p>
          </div>
        </div>

        {/* Amount input row */}
        <div className='bg-[#0c1f1c] border border-[#1e3530] border-t  rounded-b-xl px-3.5 py-3'>
          <div className='flex items-center justify-between mb-1'>
            <input
              type='text'
              inputMode='decimal'
              placeholder='0.0'
              value={amount}
              onChange={handleAmountChange}
              className={`bg-transparent border-none outline-none text-[28px] font-bold w-full p-0 ${
                amount ? 'text-white' : 'text-[#8ba8a2]'
              } placeholder:text-[#46514f] placeholder:font-[900]`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMax}
              className='bg-[#00d4a8]/10 border border-[#00d4a8]/25 rounded-md px-2.5 py-1 text-[11px] font-[900] text-[#00d4a8] cursor-pointer shrink-0 tracking-[0.06em]'
            >
              MAX
            </motion.button>
          </div>
          <p className='text-[13px] text-[#6e8885] m-0 font-[500]'>
            ≈ ${usdValue} USD
          </p>
        </div>
      </div>

      {/* Transfer diagram */}
      <TransferDiagram />

      {/* Actions */}
      <div className='flex flex-col gap-3 mt-2'>
        {/* Used this back button as a skip for next flow. so clicking this take user to nex flow, not back! */}
        {success && (
          <p className='text-[#00d4a8] text-[13px] font-[700] mb-2'>
            Deposit successful!
          </p>
        )}
        {opError && (
          <p className='text-red-400 text-[13px] font-[700] mb-2'>{opError}</p>
        )}

        <div className='flex items-center gap-3'>
          <PrimaryButton
            onClick={() => {
              if (!loading) handleDeposit()
            }}
            label={loading ? 'PROCESSING...' : 'DEPOSIT FUNDS'}
          />
          <BackButton onClick={onNext} />
        </div>
      </div>
    </motion.div>
  )
}

export default Step4FundVault
