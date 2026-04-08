import type { Trader } from '../../../features/dashboard/dashboardComponents/sidenavPages/Leaderboard/leaderboar.types'
import { useEffect, useRef, useState } from 'react'
import { createChart, AreaSeries } from 'lightweight-charts'

type PerformanceSectionProps = {
  trader: Trader
}

type InfoProps = {
  label: string
  value: string | number
}

type Range = '30D' | '90D' | 'ALL'

export default function PerformanceSection ({
  trader
}: PerformanceSectionProps) {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [range, setRange] = useState<Range>('30D')

  useEffect(() => {
    if (!chartRef.current) return

    const chart = createChart(chartRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af'
      },
      grid: {
        vertLines: { color: 'transparent' },
        horzLines: { color: 'transparent' }
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { borderVisible: false },
      width: chartRef.current.clientWidth,
      height: 220
    })

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#2dd4bf',
      topColor: 'rgba(45, 212, 191, 0.4)',
      bottomColor: 'rgba(45, 212, 191, 0.02)',
      lineWidth: 3
    })

    // Generate mock data
    const generateData = (points: number) => {
      let value = 100
      return Array.from({ length: points }, (_, i) => {
        value += Math.random() * 10 - 5
        return {
          time: `2024-01-${String(i + 1).padStart(2, '0')}`,
          value: Math.max(50, value)
        }
      })
    }

    const dataMap = {
      '30D': generateData(30),
      '90D': generateData(90),
      ALL: generateData(180)
    }

    const data = dataMap[range]

    // Animate chart
    let i = 0
    const interval = setInterval(() => {
      if (i < data.length) {
        series.update(data[i])
        i++
      } else {
        clearInterval(interval)
      }
    }, 15)

    chart.timeScale().fitContent()

    // Tooltip (SAFE VERSION)
    chart.subscribeCrosshairMove(param => {
      if (!tooltipRef.current) return

      if (!param.point || !param.time) {
        tooltipRef.current.style.display = 'none'
        return
      }

      const priceData = param.seriesData.get(series)

      // ✅ FIX: handle undefined
      if (!priceData) {
        tooltipRef.current.style.display = 'none'
        return
      }

      // ✅ FIX: safe type narrowing
      let price: number | undefined
      if ('value' in priceData) {
        price = priceData.value
      }

      // ✅ FIX: ensure valid number
      if (price === undefined) {
        tooltipRef.current.style.display = 'none'
        return
      }

      tooltipRef.current.style.display = 'block'
      tooltipRef.current.style.left = param.point.x + 10 + 'px'
      tooltipRef.current.style.top = param.point.y + 'px'

      tooltipRef.current.innerHTML = `
        <div style="font-size:12px;">
          <strong>$${price.toFixed(2)}</strong>
        </div>
      `
    })

    // Resize handler
    const handleResize = () => {
      chart.applyOptions({
        width: chartRef.current?.clientWidth || 0
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [range])

  return (
    <div className='bg-gradient-to-b from-[#0a2a2a] to-[#051919] rounded-2xl p-6 border border-white/5'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-sm text-gray-400'>Performance Overview</h3>

        <div className='flex gap-2 text-xs'>
          {(['30D', '90D', 'ALL'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 rounded transition ${
                range === r
                  ? 'bg-teal-600 text-white'
                  : 'bg-[#0d2b2b] text-gray-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className='relative h-56 w-full rounded-xl border border-white/5 overflow-hidden bg-[#061c1c] p-2'>
        <div ref={chartRef} className='w-full h-full' />

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className='absolute hidden bg-[#062020] text-white px-2 py-1 rounded text-xs pointer-events-none'
        />
      </div>

      {/* Bottom Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 mt-6 gap-4 text-center'>
        <Info label='AUM' value={trader.aum} />
        <Info label='Copiers' value={trader.copiers} />
        <Info label='Total Trades' value={trader.trades} />
        <Info label='Volume Traded' value={trader.sol} />
      </div>
    </div>
  )
}

function Info ({ label, value }: InfoProps) {
  return (
    <div>
      <p className='text-xs text-gray-500'>{label}</p>
      <p className='text-sm mt-1 font-medium'>{value}</p>
    </div>
  )
}
