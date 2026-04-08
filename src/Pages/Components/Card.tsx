import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card ({ children, className }: CardProps) {
  return (
    <div
      className={`bg-gradient-to-br from-[#071b1b] to-[#041010] 
      border border-teal-900/30 
      rounded-2xl 
      p-1
      md:p-4
      ${className}`}
    >
      {children}
    </div>
  )
}
