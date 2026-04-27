import Card from './Card'
import { fmtCompactCurrency } from '../../utils/currencyHelpers'

interface StatCardProps {
  value: number
  label: string
  color?: string
  duration: string
  unit?: string

  indicator: {
    alert: string
    progress: string
    win: string
  }
}

export default function StatCard ({
  value,
  label,
  color = 'text-white',
  duration,
  unit = '%',
  indicator
}: StatCardProps) {
  const formattedValue = unit === '$' 
    ? (value >= 1000 ? fmtCompactCurrency(value) : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    : unit === 'SOL'
    ? `${value.toFixed(4)} SOL`
    : `${value < 0 ? value : `+${value}`}${unit}`

  return (
    <Card className='p-5'>
      <div className='flex justify-between'>
        <p className='text-[12px] font-[900] leading-[16px] tracking-[1.2px] uppercase text-[#607572]'>
          {label}
        </p>
        <span
          style={{
            backgroundImage: `url(${
              label === 'Win Rate'
                ? indicator.win
                : value > 0
                ? indicator.progress
                : indicator.alert
            })`
          }}
          className='bg-center bg-cover h-[16px] w-[16px]'
        ></span>
      </div>

      <div className={`text-2xl font-semibold ${color} mt-3`}>
        {formattedValue}
      </div>

      <p className=' text-[12px] font-[400] leading-[16px] tracking-[1.2px] uppercase text-[#6e8885]'>
        {duration}
      </p>
    </Card>
  )
}
