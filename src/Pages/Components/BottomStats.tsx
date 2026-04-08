interface RowProps {
  label: string
  value: string
  color?: string
}

function StatRow ({ label, value, color = 'text-teal-200' }: RowProps) {
  return (
    <div className='flex justify-between text-sm'>
      <span className='text-teal-200/70'>{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  )
}

export default function BottomStats () {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4'>
      {/* Drawdown Analysis */}

      <div className='bg-gradient-to-br from-[#071b1b] to-[#041010] border border-teal-900/30 rounded-2xl p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-yellow-400 text-sm'>⚠</span>

          <h4 className='text-sm font-semibold text-teal-100 tracking-wide'>
            DRAWDOWN ANALYSIS
          </h4>
        </div>

        <div className='space-y-3'>
          <StatRow
            label='Maximum Drawdown'
            value='-12.4%'
            color='text-yellow-400'
          />

          <StatRow label='Average Drawdown' value='-4.2%' />

          <StatRow label='Recovery Time' value='8 days' />

          <StatRow
            label='Current Drawdown'
            value='0%'
            color='text-emerald-400'
          />
        </div>
      </div>

      {/* Trade Distribution */}

      <div className='bg-gradient-to-br from-[#071b1b] to-[#041010] border border-teal-900/30 rounded-2xl p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-teal-400 text-sm'>📊</span>

          <h4 className='text-sm font-semibold text-teal-100 tracking-wide'>
            TRADE DISTRIBUTION
          </h4>
        </div>

        <div className='space-y-3'>
          <StatRow
            label='Winning Trades'
            value='282 (68.5%)'
            color='text-emerald-400'
          />

          <StatRow
            label='Losing Trades'
            value='130 (31.5%)'
            color='text-red-400'
          />

          <StatRow
            label='Avg Win Size'
            value='+8.4%'
            color='text-emerald-400'
          />

          <StatRow label='Avg Loss Size' value='-3.2%' color='text-red-400' />
        </div>
      </div>
    </div>
  )
}
