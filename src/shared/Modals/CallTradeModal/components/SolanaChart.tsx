import { useEffect, useRef } from 'react'
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  type UTCTimestamp
} from 'lightweight-charts'

// ✅ Point these at your local backend
const INDEXER_API = 'http://localhost:3002/api'
const INDEXER_WS = 'ws://localhost:3002/ws'

const intervalMap: Record<string, string> = {
  '1M': 'M1',
  '5M': 'M5',
  '15M': 'M15',
  '1H': 'H1',
  '4H': 'H4' // Note: Backend schema says H1 then D1, but usually H4 exists in these systems. Let's stick to M15/H1 for now if H4 is missing.
}

type Props = {
  interval?: string
  pair?: string
}

const SolanaChart = ({ interval = '15M', pair = 'SOL/USDC' }: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const showLoading = () => {
    if (loadingRef.current) loadingRef.current.style.display = 'flex'
    if (errorRef.current) errorRef.current.style.display = 'none'
  }
  const showError = () => {
    if (loadingRef.current) loadingRef.current.style.display = 'none'
    if (errorRef.current) errorRef.current.style.display = 'flex'
  }
  const hideOverlays = () => {
    if (loadingRef.current) loadingRef.current.style.display = 'none'
    if (errorRef.current) errorRef.current.style.display = 'none'
  }

  useEffect(() => {
    if (!chartContainerRef.current) return

    showLoading()

    let cancelled = false
    let ws: WebSocket | null = null
    let oraclePoll: ReturnType<typeof setInterval> | null = null
    const controller = new AbortController()

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#7DAAA4'
      },
      grid: {
        vertLines: { color: '#0f3a33' },
        horzLines: { color: '#0f3a33' }
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#0f3a33' },
      timeScale: { borderColor: '#0f3a33', timeVisible: true },
      width: chartContainerRef.current.clientWidth,
      height: 160
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C896',
      downColor: '#EF4444',
      borderUpColor: '#00C896',
      borderDownColor: '#EF4444',
      wickUpColor: '#00C896',
      wickDownColor: '#EF4444'
    })

    const oracleLine = chart.addSeries(LineSeries, {
      color: '#F59E0B',
      lineWidth: 1,
      lineStyle: 2, 
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'Oracle'
    })

    const cgInterval = intervalMap[interval] ?? 'M15'

    fetch(
      `${INDEXER_API}/chart?pair=${encodeURIComponent(
        pair
      )}&interval=${cgInterval}`,
      { signal: controller.signal }
    )
      .then(res => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then(res => {
        if (cancelled) return
        
        const data = res.data || []

        const candles = data.map(
          (c: {
            timestamp: string | number
            open: string | number
            high: string | number
            low: string | number
            close: string | number
          }) => ({
            time: (typeof c.timestamp === 'string' ? Math.floor(new Date(c.timestamp).getTime() / 1000) : Math.floor(c.timestamp / 1000)) as UTCTimestamp,
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close)
          })
        )

        candleSeries.setData(candles)
        chart.timeScale().fitContent()
        hideOverlays()

        try {
          ws = new WebSocket(
            `${INDEXER_WS}?pair=${encodeURIComponent(
              pair
            )}&interval=${cgInterval}`
          )

          ws.onopen = () => {
            console.log('WebSocket connected successfully')
          }

          ws.onmessage = event => {
            const msg = JSON.parse(event.data)
            candleSeries.update({
              time: Math.floor(msg.timestamp / 1000) as UTCTimestamp,
              open: Number(msg.open),
              high: Number(msg.high),
              low: Number(msg.low),
              close: Number(msg.close)
            })
          }

          ws.onerror = (error) => {
            console.warn('WebSocket error, continuing with polling', error)
          }

          ws.onclose = () => {
            console.log('WebSocket disconnected')
          }
        } catch (e) {
          console.warn('Failed to connect WebSocket', e)
        }

        const fetchOraclePrice = () => {
          fetch(`${INDEXER_API}/price?pair=${encodeURIComponent(pair)}`)
            .then(res => res.json())
            .then(res => {
              if (cancelled) return
              const data = res.data
              if (data && data.price) {
                oracleLine.update({
                  time: Math.floor(Date.now() / 1000) as UTCTimestamp,
                  value: Number(data.price)
                })
              }
            })
            .catch(() => {}) 
        }

        fetchOraclePrice()
        oraclePoll = setInterval(fetchOraclePrice, 2000)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        console.error('Chart fetch error:', err)
        showError()
      })

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelled = true
      controller.abort()
      ws?.close()
      if (oraclePoll) clearInterval(oraclePoll)
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [interval, pair])

  return (
    <div className='relative w-full'>
      <div ref={chartContainerRef} className='w-full h-40' />

      <div
        ref={loadingRef}
        style={{ display: 'flex' }}
        className='absolute inset-0 items-center justify-center bg-[#0A2B27] rounded-lg z-10'
      >
        <span className='text-[#00C896] text-[12px] animate-pulse uppercase font-mono tracking-widest'>
          Initializing Data Stream...
        </span>
      </div>

      <div
        ref={errorRef}
        style={{ display: 'none' }}
        className='absolute inset-0 items-center justify-center bg-[#0A2B27] rounded-lg z-10'
      >
        <span className='text-red-400 text-[10px] uppercase font-mono tracking-widest'>
          Data Stream Offline
        </span>
      </div>
    </div>
  )
}

export default SolanaChart
