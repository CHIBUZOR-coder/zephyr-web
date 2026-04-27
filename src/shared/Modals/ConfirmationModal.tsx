import type { FC, ReactNode } from 'react'
import { FiAlertTriangle, FiInfo } from 'react-icons/fi'

type ConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string | ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'info' | 'warning'
  isLoading?: boolean
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  isLoading = false
}) => {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <FiAlertTriangle className='text-[#FA6938] text-[20px]' />,
          iconBg: 'bg-[#2a1b14]',
          confirmBtn: 'bg-[#2a1c15] border-[#4d3425] text-[#FA6938] hover:bg-[#35241c]'
        }
      case 'info':
        return {
          icon: <FiInfo className='text-[#00ffa3] text-[20px]' />,
          iconBg: 'bg-[#0a2a24]',
          confirmBtn: 'bg-[#00ffa3] border-[#00ffa3]/20 text-black hover:bg-[#00e692]'
        }
      case 'warning':
      default:
        return {
          icon: <FiAlertTriangle className='text-[#FE9A00] text-[20px]' />,
          iconBg: 'bg-[#2a2414]',
          confirmBtn: 'bg-[#FE9A00] border-[#FE9A00]/20 text-black hover:bg-[#e58a00]'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'>
      <div
        className='
        w-full 
        max-w-[400px] 
        rounded-xl 
        border border-[#1b3b36] 
        bg-[#071e1b] 
        text-[#e8f6f3]
        shadow-2xl
        overflow-hidden
      '
      >
        {/* HEADER */}
        <div className='flex items-start gap-4 p-6 border-b border-[#123f3a]'>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${styles.iconBg}`}>
            {styles.icon}
          </div>

          <div>
            <h3 className='text-[16px] font-bold tracking-wide uppercase'>
              {title}
            </h3>
            <div className='text-[13px] text-[#7daaa4] mt-1.5 leading-relaxed'>
              {description}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className='flex gap-3 p-6 bg-[#0a221f]/50'>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='
              flex-1 
              py-2.5 
              rounded-lg 
              bg-[#0B2A27] 
              border border-[#123F3A] 
              text-[#9BC3BC] 
              text-[13px] 
              font-bold
              tracking-wider
              uppercase
              hover:bg-[#103D38]
              transition-colors
              disabled:opacity-50
            '
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex-1 
              py-2.5 
              rounded-lg 
              border 
              text-[13px] 
              font-bold
              tracking-wider
              uppercase
              transition-all
              disabled:opacity-50
              ${styles.confirmBtn}
            `}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
