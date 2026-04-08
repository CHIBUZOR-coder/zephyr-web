import { useState } from 'react'
import { useGeneralContext } from '../../../../../../Context/GeneralContext'

export default function DocsDifficulty () {
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const

  const [activeDifficulty, setActiveDifficulty] = useState('All')
  const { setDifficulty } = useGeneralContext()

  return (
    <div className='mt-6'>
      <h3 className='text-xs tracking-wider text-gray-400 mb-3'>
        DIFFICULTY LEVEL
      </h3>

      <div className='flex flex-wrap gap-2'>
        {difficulties.map((level, i) => {
          const isActive = activeDifficulty === level

          return (
            <button
              key={i}
              onClick={() => {
                setActiveDifficulty(level)
                setDifficulty(level)
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
              {level}
            </button>
          )
        })}
      </div>
    </div>
  )
}
