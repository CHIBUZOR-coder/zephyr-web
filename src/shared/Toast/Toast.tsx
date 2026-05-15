// src/components/Toast/Toast.tsx
import React, { useEffect, useState } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'
import { FiCheck, FiX, FiInfo } from 'react-icons/fi'
import { useGeneralContext } from '../../Context/GeneralContext'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  id: number
  message: string
  subMessage?: string
  type?: ToastType
  onDismiss: (id: number) => void
  centered?: boolean
}

const iconConfig = {
  success: {
    icon: <FiCheck size={13} strokeWidth={3} />,
    iconClass: 'text-white border-[#444] bg-[#2a2a2a]'
  },
  error: {
    icon: <FiX size={13} strokeWidth={3} />,
    iconClass: 'text-red-400 border-[#5a2a2a] bg-[#2a1a1a]'
  },
  info: {
    icon: <FiInfo size={13} />,
    iconClass: 'text-blue-400 border-[#2a4a6a] bg-[#1a2a3a]'
  }
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  subMessage,
  type = 'success',
  onDismiss,
  centered = false
}) => {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const cfg = iconConfig[type]
  const { callTradeToast } = useGeneralContext()
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleDismiss = () => {
    setLeaving(true)
    setTimeout(() => onDismiss(id), 300)
  }

  // Animation logic:
  // Corner: Slides from right (120% -> 0)
  // Centered: Slides from top (-40px -> 0)
  const transform = centered
    ? visible && !leaving
      ? 'translateY(0)'
      : 'translateY(-40px)'
    : visible && !leaving
    ? 'translateX(0)'
    : 'translateX(120%)'

  if (centered) {
    return (
      <div
        className='relative'
        style={{
          transform,
          opacity: visible && !leaving ? 1 : 0,
          transition:
            'transform 0.4s cubic-bezier(.22,1,.36,1), opacity 0.3s ease'
        }}
      >
        <div
          className='
            flex items-center gap-3
            bg-[#102221] border border-[#14b8a6]/50
            rounded-full px-6 py-2.5
            shadow-[0_8px_30px_rgb(20,184,166,0.15)]
            min-w-[300px] backdrop-blur-md
          '
        >
          <div className='w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse' />
          <div className='flex flex-col'>
            <p className='text-[#14b8a6] text-[12px] font-[900] uppercase tracking-[1.5px] m-0'>
              {message}
            </p>
            {subMessage && (
              <p className='text-[#8fb3ae] text-[10px] font-medium m-0'>
                {subMessage}
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className='ml-4 text-[#14b8a6]/60 hover:text-[#14b8a6] transition cursor-pointer'
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className='relative'
      style={{
        transform,
        opacity: visible && !leaving ? 1 : 0,
        transition:
          'transform 0.35s cubic-bezier(.22,.68,0,1.2), opacity 0.3s ease'
      }}
    >
      {/* floating X — top left corner */}
      <button
        onClick={handleDismiss}
        className='
          absolute -top-2 -left-2 z-10
          w-5 h-5 rounded-full
          bg-[#2a2a2a] border border-[#444]
          flex items-center justify-center
          text-[#aaa] hover:text-white
          transition cursor-pointer
        '
      >
        <FiX size={11} />
      </button>

      {/* card */}
      <div
        className='
          flex items-start gap-3
          bg-black border border-[#2e2e2e]
          rounded-2xl px-4 py-3
          min-w-[280px] max-w-[360px]
        '
      >
        {/* circle icon */}
        <div
          className={`
            w-7 h-7 rounded-full border-[1.5px]
            flex items-center justify-center
            flex-shrink-0 mt-[1px]
            ${cfg.iconClass}
          `}
        >
          {cfg.icon}
        </div>

        {/* text */}
        <div className='flex gap-2'>
          <span className='text-white'>
            <FaCircleCheck className='h-5 w-5' />
          </span>
          <div>
            <p className='text-white text-[13px] font-semibold m-0'>
              {message}
            </p>
            {subMessage && (
              <p className='text-[#888] text-[12px] mt-[3px] m-0'>
                {subMessage}
              </p>
            )}

            {callTradeToast && (
              <span className='inline-block rounded-md font-semibold p-2 text-[12px] mt-[3px] m-0 bg-white text-black'>
                Share to Feed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
