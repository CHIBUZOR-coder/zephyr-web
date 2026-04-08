import { useWallet } from '@solana/wallet-adapter-react'
import type { ReactNode } from 'react'

interface FooterButtonsProps {
  onBack?: () => void
  onNext?: () => void
  nextLabel: string
  icon?: ReactNode
}

const FooterButtons = ({
  onBack,
  onNext,
  nextLabel,
  icon
}: FooterButtonsProps) => {
  const { connected } = useWallet()
  return (
    <div className='flex justify-between gap-4 '>
      {onBack ? (
        <button
          onClick={onBack}
          className='px-5 py-2 rounded-lg border border-[#1c3535] text-gray-400 hover:bg-teal-400 hover:text-white transition ease-in-out duration-500'
        >
          Back
        </button>
      ) : (
        <div />
      )}

      <button
        disabled={!connected}
        onClick={onNext}
        className=' smm py-2 rounded-lg bg-teal-400 text-white  flex items-center gap-2 px-3 text-[12px] md:text-[14px] font-[700]  disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {nextLabel}
        {icon && icon}
      </button>
    </div>
  )
}

export default FooterButtons
