import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShield, FiAlertTriangle } from 'react-icons/fi'
import { useMasterVault } from '../../../../features/master/useMasterVault'
import { useGeneralContext } from '../../../../Context/GeneralContext'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Props {
  onNext: () => void
  onBack: () => void
  setCreatedVaultAddress: (address: string) => void
}

// ─── INNER COMPONENTS ─────────────────────────────────────────────────────────

const StepIndicator = () => (
  <div className='flex items-center gap-2 mb-5'>
    <div className='flex gap-1.5'>
      {[true, true, true, false, false].map((active, i) => (
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
      STEP 3 OF 5
    </span>
  </div>
)

const BackButton = ({
  onClick,
  disabled
}: {
  onClick: () => void
  disabled?: boolean
}) => (
  <motion.button
    whileHover={disabled ? {} : { scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.97 }}
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 py-[13px] bg-transparent border border-[#1a3530] rounded-[10px] text-white  text-[14px] tracking-[0.5px] font-[900] leading-[21px] uppercase ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    }`}
  >
    BACK
  </motion.button>
)

const Spinner = ({
  size = 20,
  color = '#00d4a8'
}: {
  size?: number
  color?: string
}) => (
  <>
    <style>{`@keyframes mtf-spin { to { transform: rotate(360deg); } }`}</style>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${color}30`,
        borderTopColor: color,
        animation: 'mtf-spin 0.75s linear infinite',
        flexShrink: 0
      }}
    />
  </>
)

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const Step3CreateVault: React.FC<Props> = ({
  onNext,
  onBack,
  setCreatedVaultAddress
}) => {
  const { createMasterVault, initializeProgramConfig, loading, error } =
    useMasterVault()
  const [internalLoading, setInternalLoading] = useState(false)
  const { showToast } = useGeneralContext()

  const isConfigError = error?.includes('config') && error?.includes('3012')

  const handleCreateVault = async () => {
    setInternalLoading(true)
    try {
      const vaultAddress = await createMasterVault()
      if (vaultAddress) {
        setCreatedVaultAddress(vaultAddress?.address)
        showToast(
          'Master Vault Creation Successful',
          'View your vault on Portfolio page. You can now proceed to set up your trading strategy.'
        )
      }

      onNext()
    } catch (err) {
      console.error('Failed to create vault:', err)
    } finally {
      setInternalLoading(false)
    }
  }

  const handleInitializeConfig = async () => {
    setInternalLoading(true)
    try {
      await initializeProgramConfig()
      // Refresh by just resetting loading, user can then retry create
    } catch (err) {
      console.error('Failed to initialize config:', err)
    } finally {
      setInternalLoading(false)
    }
  }

  const isDeploying = loading || internalLoading

  const vaultRows = [
    {
      label: 'VAULT TYPE',
      value: 'Master Execution Vault',
      valueClass: 'text-white',
      icon: null
    },
    {
      label: 'NETWORK',
      value: 'Solana Devnet',
      valueClass: 'text-white',
      icon: (
        <div className='w-5 h-5 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] shrink-0' />
      )
    },
    {
      label: 'STATUS',
      value: isDeploying
        ? 'Deploying vault on-chain...'
        : error
        ? 'Deployment Failed'
        : 'Ready to deploy',
      valueClass: error ? 'text-[#ff4a4a]' : 'text-[#6f9691]',
      icon: isDeploying ? <Spinner size={14} /> : null
    }
  ]

  // const { showToast } = useGeneralContext()

  //   useEffect(() => {
  //     if (status === 'success' || successMessage) {
  //       showToast(
  //         'Deposit Successful',
  //         'Transaction confirmed on Solana Mainnet.'
  //       )
  //     }

  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [vaultAddress])

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <StepIndicator />

      <h1 className='font-[900] text-[16px] md:text-[20px] leading-[38px] text-white mb-2.5 '>
        Create Your Master Execution Vault
      </h1>
      <p className='text-[13px] font-[500] text-[#a3d2cb] mb-6'>
        Your vault will be deployed on-chain and used to execute all trading
        activity.
      </p>

      {/* Vault info table */}
      <div className='bg-[#0c1f1c] border border-[#1e3530] rounded-xl overflow-hidden mb-3.5'>
        {vaultRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between items-center px-[18px] py-4 ${
              i < vaultRows.length - 1 ? 'border-b border-[#1a3530]' : ''
            }`}
          >
            <span className='text-[13px] font-[700] leading-[19px] tracking-[0.5px] text-[#6e8885] uppercase'>
              {row.label}
            </span>
            <div className='flex items-center gap-2'>
              {row.icon}
              <motion.span
                key={row.value}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`text-[14px] font-[700] ${row.valueClass}`}
              >
                {row.value}
              </motion.span>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className='bg-[#3d1a1a] border border-[#ff4a4a40] rounded-[10px] px-4 py-3 flex gap-3 items-center mb-4'
          >
            <FiAlertTriangle className='text-[#ff4a4a] shrink-0' />
            <p className='text-[12px] text-[#ffa3a3] leading-[1.4] m-0'>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-custodial notice — hidden while deploying */}
      <AnimatePresence>
        {!isDeploying && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
            transition={{ duration: 0.25 }}
            className='bg-[#0d2420] border border-[#1a3d34] rounded-[10px] px-4 py-3.5 flex gap-3 items-start mb-7 overflow-hidden'
          >
            <FiShield className='text-[#00d4a8] text-[16px] mt-[1px] shrink-0' />
            <p className='text-[12.5px] text-[#a8c4be] leading-[1.6] m-0'>
              Your vault will be deployed as a non-custodial smart contract.
              Only you have control over your funds and trading actions.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <AnimatePresence mode='wait'>
        {isDeploying ? (
          <motion.div
            key='spinner-btn'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className='w-full py-[13px] bg-[#0c1f1c] border border-[#1e3530] rounded-[10px] flex items-center justify-center mt-7 box-border'
          >
            <Spinner size={22} />
          </motion.div>
        ) : (
          <div className='flex flex-col gap-3 mt-7'>
            {isConfigError && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleInitializeConfig}
                className='w-full py-[13px] bg-[#d4a800] rounded-[10px] text-[#000] text-[14px] tracking-[0.5px] font-[900] leading-[21px] cursor-pointer border-none mb-2'
              >
                INITIALIZE PROGRAM CONFIG (ONE-TIME)
              </motion.button>
            )}

            <motion.div
              key='action-btns'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex gap-3'
            >
              <BackButton onClick={onBack} />
              <motion.button
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateVault}
                className='flex-[1.8] py-[13px] bg-[#00a08a] rounded-[10px] text-white  text-[14px] tracking-[0.5px] font-[900] leading-[21px] cursor-pointer border-none'
              >
                {error ? 'RETRY DEPLOY' : 'CREATE VAULT'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Step3CreateVault
