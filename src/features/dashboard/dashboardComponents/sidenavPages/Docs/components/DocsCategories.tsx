import { useState } from 'react'
import { useGeneralContext } from '../../../../../../Context/GeneralContext'

const categories = [
  'All',
  'Getting Started',
  'Copy Trading',
  'Vault Security',
  'Transfers',
  'On-Chain',
  'Fees & Payments',
  'Master Trading',
  'Risk Management',
  'Developers',
  'Compliance'
] as const

export default function DocsCategories () {
  const [activeCategory, setActiveCategory] = useState('All')
  const { setCategory } = useGeneralContext()

  return (
    <div>
      <h3 className='text-xs tracking-wider text-gray-400 mb-3'>CATEGORY</h3>

      <div className='flex flex-wrap gap-2'>
        {categories.map((c, i) => {
          const isActive = activeCategory === c

          return (
            <button
              key={i}
              onClick={() => {
                setActiveCategory(c)
                setCategory(c)
              }}
              className={`
              px-3 py-1.5
             text-[12px]
              font-[900]
              rounded-lg
              border
              transition

              ${
                isActive
                  ? 'bg-[#89ada8] text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'border-docsBorder bg-[#030707] hover:bg-[#122827] text-[#6A7282]'
              }
              `}
            >
              {c}
            </button>
          )
        })}
      </div>
    </div>
  )
}
