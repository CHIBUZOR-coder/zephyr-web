import type { FC } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { BsCheckCircleFill } from 'react-icons/bs'
import { useGeneralContext } from '../../../Context/GeneralContext'

type StopCopyModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const StopCopyModal: FC<StopCopyModalProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const { setStopCopyConfirm } = useGeneralContext()

  if (!open) return null

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'>
      {/* MODAL */}
      <div
        className='
        w-full 
        max-w-[420px] 
        max-h-[73vh]
        mt-4
        overflow-y-auto
        side
        rounded-xl 
        border border-[#1b3b36] 
        bg-[#071e1b] 
        text-[#e8f6f3]
        shadow-2xl
      '
      >
        {/* HEADER */}
        <div className='flex items-start gap-3 p-5 border-b border-[#123f3a]'>
          <div className='flex items-center justify-center w-9 h-9 rounded-full bg-[#2a1b14]'>
            <FiAlertTriangle className='text-[#FA6938] text-[18px]' />
          </div>

          <div>
            <h3 className='text-[16px] font-semibold tracking-wide'>
              STOP COPY TRADING?
            </h3>
            <p className='text-[12px] text-[#7daaa4] mt-1'>
              You are about to stop copying{' '}
              <span className='text-white font-medium'>AlphaSeeker</span>
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className='p-5 space-y-4'>
          {/* Vault Card */}
          <div className='rounded-lg border border-[#16413b] bg-[#072a26] p-4 flex justify-between items-center'>
            <div>
              <p className='text-[11px] text-[#7daaa4]'>
                CURRENT VAULT BALANCE
              </p>
              <p className='text-[10px] text-[#7daaa4] mt-1'>≈ $2,023.50 USD</p>
            </div>

            <p className='text-[16px] font-semibold'>14.20 SOL</p>
          </div>

          {/* Benefits */}
          <div className='space-y-3 text-[13px] text-[#a7c0bb]'>
            <div className='flex gap-3'>
              <BsCheckCircleFill className='text-[#00c896] mt-[2px]' />
              <p>
                All open positions will be{' '}
                <span className='text-white font-medium'>
                  immediately closed
                </span>{' '}
                at market price
              </p>
            </div>

            <div className='flex gap-3'>
              <BsCheckCircleFill className='text-[#00c896] mt-[2px]' />
              <p>
                Your funds will remain in the vault and can be withdrawn anytime
              </p>
            </div>

            <div className='flex gap-3'>
              <BsCheckCircleFill className='text-[#00c896] mt-[2px]' />
              <p>You can resume copying this trader at any time</p>
            </div>
          </div>

          {/* Warning Box */}
          <div className='rounded-lg border border-[#4d3425] bg-[#2a2018] p-4 flex gap-3'>
            <FiAlertTriangle className='text-[#FA6938] mt-[2px]' />

            <p className='text-[12px] text-[#f5b7a1] leading-relaxed'>
              <span className='font-semibold text-[#FA6938]'>
                Market Impact:
              </span>{' '}
              Closing positions immediately may result in slippage or
              unfavorable execution prices depending on market conditions.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className='flex gap-3 p-5 border-t border-[#123f3a]'>
          <button
            onClick={onClose}
            className='
              flex-1 
              py-3 
              rounded-lg 
              bg-[#0B2A27] 
              border border-[#123F3A] 
              text-[#9BC3BC] 
              text-[13px] 
              font-medium
              hover:bg-[#103D38]
              transition
            '
          >
            Cancel
          </button>

          <button
            onClick={() => {
              setStopCopyConfirm(true)
              onConfirm()
            }}
            className='
              flex-1 
              py-3 
              rounded-lg 
              bg-[#2a1c15] 
              border border-[#4d3425] 
              text-[#FA6938] 
              text-[13px] 
              font-semibold
              hover:bg-[#35241c]
              transition
            '
          >
            STOP COPY
          </button>
        </div>
      </div>
    </div>
  )
}

export default StopCopyModal
