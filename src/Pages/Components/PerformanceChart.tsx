
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import Card from './Card'
import type { RoiInterval } from '../../features/master/useMasterTier'

interface PerformanceChartProps {
  roiChartData?: RoiInterval[];
}

export default function PerformanceChart ({ roiChartData }: PerformanceChartProps) {
  const formattedData = roiChartData?.map(item => ({
    name: `Day ${item.day}`,
    value: item.roiPct, // Display ROI as a percentage
  })) || []

  return (
    <Card>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-sm font-semibold text-teal-100 tracking-wide'>
          PERFORMANCE OVERVIEW
        </h3>

        <span className='text-xs bg-teal-500/20 text-teal-300 px-3 py-1 rounded-lg'>
          30 Days
        </span>
      </div>

      <div className='h-[260px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={formattedData}>
            <XAxis dataKey='name' stroke='#3e6d6d' />

            <YAxis stroke='#3e6d6d' domain={[ 'auto', 'auto' ]} />

            <Tooltip />

            <Line
              type='monotone'
              dataKey='value'
              stroke='#1ff2c1'
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
