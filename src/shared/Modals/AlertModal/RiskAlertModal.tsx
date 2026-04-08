import type { FC } from 'react'
import { FiAlertTriangle, FiX } from 'react-icons/fi'
import { BsLightbulb } from 'react-icons/bs'

type RiskAlertModalProps = {
  showRiskModal: boolean
  setShowRiskModal: () => void
}

const RiskAlertModal: FC<RiskAlertModalProps> = ({
  showRiskModal,
  setShowRiskModal
}) => {
  if (!showRiskModal) return null

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 '>
      <div
        className='
    w-full 
    max-w-[420px] 
    max-h-[76vh]     /* 👈 limits height */
    overflow-y-auto  /* 👈 enables scroll */
    rounded-xl 
    border border-[#1b3b36] 
    bg-[#071e1b] 
    p-5 
    text-[#e8f6f3]
    scrollbar-thin scrollbar-thumb-[#1b3b36]
    side
    mt-8
  '
      >
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-[#2a1b14] text-[#ff7a45]'>
              <FiAlertTriangle size={18} />
            </div>

            <div>
              <h3 className='text-[18px] font-semibold'>RISK ALERT</h3>
              <p className='text-xs text-[#7daaa4]'>1h ago</p>
            </div>
          </div>

          <button
            onClick={setShowRiskModal}
            className='text-[#8aa5a0] hover:text-white'
          >
            <FiX size={20} />
          </button>
        </div>

        <div className='my-4 h-px bg-[#14332f]' />

        {/* Stop Loss Card */}
        <div className='mb-4 rounded-lg border border-[#4d3425] bg-[#2a2018] p-4'>
          <h4 className='mb-1 font-semibold text-[#ff6b2c]'>
            STOP LOSS TRIGGERED
          </h4>

          <p className='text-sm text-[#a7c0bb]'>
            Your $JUP position hit stop loss at -5%. Loss limited to configured
            maximum.
          </p>
        </div>

        {/* Vault Card */}
        <div className='mb-4 rounded-lg border border-[#16413b] bg-[#072a26] p-4'>
          <h5 className='mb-4 text-sm font-semibold'>Current Vault Status</h5>

          <div className='flex justify-between gap-6 max-sm:flex-col'>
            <div>
              <p className='text-[11px] text-[#7daaa4]'>VAULT BALANCE</p>
              <p className='text-lg font-semibold'>42.00 SOL</p>
              <p className='text-xs text-[#7daaa4]'>$5,985.00</p>
            </div>

            <div>
              <p className='text-[11px] text-[#7daaa4]'>CURRENT DRAWDOWN</p>
              <p className='text-lg font-semibold text-[#ff6b6b]'>-15%</p>
              <p className='text-xs text-[#7daaa4]'>-$1,050.00</p>
            </div>
          </div>

          {/* Progress */}
          <div className='mt-4'>
            <div className='mb-1 flex items-center justify-between text-xs'>
              <span className='text-[#7daaa4]'>Drawdown Limit Progress</span>
              <span className='text-[#ff7a45]'>75% Used</span>
            </div>

            <div className='h-2 w-full overflow-hidden rounded-full bg-black'>
              <div className='h-full w-[75%] bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500' />
            </div>

            <div className='mt-1 flex justify-between text-[10px] text-[#7daaa4]'>
              <span>0%</span>
              <span>Max: 20%</span>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <h5 className='mb-3 text-sm font-semibold'>Recommended Actions</h5>

          <ul className='space-y-3 text-sm text-[#a7c0bb]'>
            <li className='flex gap-3'>
              <BsLightbulb className='mt-[2px] text-[#00c896]' />
              <span>
                <b>Review Position Sizing:</b> Consider reducing exposure to
                prevent reaching max drawdown limit
              </span>
            </li>

            <li className='flex gap-3'>
              <BsLightbulb className='mt-[2px] text-[#00c896]' />
              <span>
                <b>Adjust Stop Loss:</b> Tighten stop loss parameters to
                minimize further losses
              </span>
            </li>

            <li className='flex gap-3'>
              <BsLightbulb className='mt-[2px] text-[#00c896]' />
              <span>
                <b>Pause Copying:</b> Consider temporarily stopping copy trades
                until market stabilizes
              </span>
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className='mt-6 flex gap-3 max-sm:flex-col'>
          <button className='flex-1 rounded-lg bg-[#00a88f] py-3 font-semibold text-white hover:bg-[#009e84]'>
            Adjust Risk Settings
          </button>

          <button className='flex-1 rounded-lg border border-[#4d3425] bg-[#2a1c15] py-3 font-semibold text-[#ff7a45] hover:bg-[#35241c]'>
            Pause Vault
          </button>
        </div>
      </div>
    </div>
  )
}

export default RiskAlertModal
