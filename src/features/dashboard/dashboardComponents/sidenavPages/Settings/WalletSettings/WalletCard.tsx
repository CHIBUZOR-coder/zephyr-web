import React from 'react'
import { FiCopy, FiExternalLink, FiTrash2, FiCreditCard } from 'react-icons/fi'

type WalletType = 'SOLANA' | 'ETHEREUM'

interface WalletCardProps {
  name?: string
  address: string
  type: WalletType
  primary?: boolean
  onSetPrimary?: () => void
  onRemove?: () => void
}

const WalletCard: React.FC<WalletCardProps> = ({
  name,
  address,
  type,
  primary,
  onSetPrimary,
  onRemove
}) => {
  return (
    <div
      className='
      w-full
      rounded-xl
      border border-[#184A45]
      bg-gradient-to-r from-[#071F1D] to-[#0A2C28]
      p-5
      flex
      items-center
      justify-between
      gap-4
      flex-wrap
      '
    >
      <div className='flex items-center gap-4 min-w-0'>
        <div
          className='
          w-10
          h-10
          rounded-lg
          flex
          items-center
          justify-center
          bg-[#0F3B36]
          border border-[#1E5B54]
          '
        >
          <FiCreditCard size={18} className='text-[#7FE8D6]' />
        </div>

        <div className='flex flex-col gap-1 min-w-0'>
          {name && (
            <p className='text-white font-medium text-sm truncate'>{name}</p>
          )}

          <div className='flex items-center gap-2 text-xs text-[#7A9E9A]'>
            <span className='truncate'>{address}</span>

            <FiCopy
              size={14}
              className='cursor-pointer opacity-70 hover:opacity-100'
              onClick={() => navigator.clipboard.writeText(address)}
            />

            <FiExternalLink
              size={14}
              className='cursor-pointer opacity-70 hover:opacity-100'
            />
          </div>

          <div className='flex gap-2 mt-1'>
            <span
              className='
              text-[10px]
              px-2
              py-[2px]
              rounded
              font-semibold
              tracking-wider
              bg-[#2D1B4E]
              text-[#C6A8FF]
              '
            >
              {type}
            </span>

            {primary && (
              <span
                className='
                text-[10px]
                px-2
                py-[2px]
                rounded
                font-semibold
                tracking-wider
                bg-[#123C36]
                text-[#7FE8D6]
                '
              >
                PRIMARY
              </span>
            )}
          </div>
        </div>
      </div>

      {!primary && (
        <div className='flex items-center gap-3'>
          <button
            onClick={onSetPrimary}
            className='
            text-xs
            font-medium
            px-4
            py-2
            rounded-md
            border border-[#2A5E57]
            bg-[#0F2D2A]
            text-[#CFEFED]
            hover:bg-[#143A36]
            transition
            '
          >
            SET PRIMARY
          </button>

          <button
            onClick={onRemove}
            className='
            w-9
            h-9
            flex
            items-center
            justify-center
            rounded-md
            border border-[#2A2A2A]
            text-red-400
            hover:bg-[#2A1010]
            '
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default WalletCard
