import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
import Input from './Input'

interface OptionalProfitParametersProps {
  takeProfitPct: string
  setTakeProfitPct: (val: string) => void
  stopLossOverridePct: string
  setStopLossOverridePct: (val: string) => void
}

export default function OptionalProfitParameters ({
  takeProfitPct,
  setTakeProfitPct,
  stopLossOverridePct,
  setStopLossOverridePct
}: OptionalProfitParametersProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className='mt-6'>
      {/* Toggle */}
      <div
        onClick={() => setOpen(prev => !prev)}
        className='border border-dashed border-[#1f3c3c] rounded-lg p-3 flex justify-between items-center cursor-pointer bg-[#0d1f1f] hover:bg-[#0f2525] transition-colors'
      >
        <div className='flex items-center gap-3'>
          <IoMdOptions color='#fff' size={20} />
          <p className='text-white text-sm font-medium'>
            Optional Profit Parameters
          </p>
        </div>

        <FiChevronDown
          className={`text-white transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </div>

      {/* Content */}
      {open && (
        <div className='mt-4 flex flex-col gap-5 p-4 bg-[#0a1a1a] rounded-lg border border-[#1c3535] animate-in fade-in slide-in-from-top-2 duration-200'>
          <Input
            label='Take Profit Target (%)'
            placeholder='25'
            value={takeProfitPct}
            onChange={setTakeProfitPct}
            info='Auto-close position when profit reaches this percentage.'
          />

          <Input
            label='Stop Loss Override (%)'
            placeholder='10'
            value={stopLossOverridePct}
            onChange={setStopLossOverridePct}
            info="Override trader's stop loss with your own limit."
          />

          <Input
            label='Trailing Stop Distance'
            placeholder='Coming soon'
            value=''
            onChange={() => {}}
            suffix=''
            info='Auto-adjusting stop loss that follows price action (Coming Soon).'
          />
        </div>
      )}
    </div>
  )
}
