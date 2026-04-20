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
const JUPITER_API = 'https://api.jup.ag/tokens/v2'

const intervalMap: Record<string, string> = {
  '1M': 'M1',
  '5M': 'M5',
  '15M': 'M15',
  '1H': 'H1',
  '4H': 'H1' // Backend schema doesn't have H4, falling back to H1
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

        interface ChartCandle {
          time: UTCTimestamp
          open: number
          high: number
          low: number
          close: number
        }

        const candles: ChartCandle[] = data.map(
          (c: {
            time?: number
            timestamp?: string | number
            open: string | number | number
            high: string | number
            low: string | number
            close: string | number
          }) => {
            let timeVal: number
            if (c.time) {
              timeVal = c.time
            } else if (typeof c.timestamp === 'string') {
              timeVal = Math.floor(new Date(c.timestamp).getTime() / 1000)
            } else if (typeof c.timestamp === 'number') {
              timeVal = c.timestamp > 1000000000000 ? Math.floor(c.timestamp / 1000) : c.timestamp
            } else {
              timeVal = NaN
            }

            return {
              time: timeVal as UTCTimestamp,
              open: Number(c.open),
              high: Number(c.high),
              low: Number(c.low),
              close: Number(c.close)
            }
          }
        ).filter((c: ChartCandle) => !isNaN(c.time as number) && !isNaN(c.open) && !isNaN(c.high) && !isNaN(c.low) && !isNaN(c.close))
        .sort((a: ChartCandle, b: ChartCandle) => (a.time as number) - (b.time as number))

        // Ensure strictly increasing timestamps for lightweight-charts
        const uniqueCandles: ChartCandle[] = []
        for (const c of candles) {
          if (uniqueCandles.length === 0 || (c.time as number) > (uniqueCandles[uniqueCandles.length - 1].time as number)) {
            uniqueCandles.push(c)
          }
        }

        candleSeries.setData(uniqueCandles)
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
            
            // The backend broadcasts events in { event: string, data: any } format
            // We only care about CANDLE_UPDATE here.
            if (msg.event && msg.event !== 'CANDLE_UPDATE') return;
            
            // If it's an event wrapper, use msg.data; otherwise assume raw candle data
            const candle = msg.data || msg;
            
            // Safety check: ensure we have required fields to avoid NaN in chart
            if (!(candle.timestamp || candle.time) || candle.open === undefined) return;

            let time: number
            if (candle.time) {
              time = candle.time
            } else if (typeof candle.timestamp === 'string') {
              time = Math.floor(new Date(candle.timestamp).getTime() / 1000)
            } else if (typeof candle.timestamp === 'number') {
              time = candle.timestamp > 1000000000000 ? Math.floor(candle.timestamp / 1000) : candle.timestamp
            } else {
              time = NaN
            }

            const open = Number(candle.open);
            const high = Number(candle.high);
            const low = Number(candle.low);
            const close = Number(candle.close);
            
            if (!isNaN(time) && !isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
              candleSeries.update({ time: time as UTCTimestamp, open, high, low, close })
            }
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

        const extractSymbol = (pairStr: string) => pairStr.replace('/USDC', '').replace('/SOL', '').replace('/', '')

        const fetchOraclePrice = async () => {
          let price = 0

          try {
            const res = await fetch(`${INDEXER_API}/price?pair=${encodeURIComponent(pair)}`)
            const data = await res.json()
            if (data?.data?.price && data.data.price > 0) {
              price = data.data.price
            }
          } catch {}

          if (price === 0) {
            const symbol = extractSymbol(pair)
            try {
              const jupRes = await fetch(`${JUPITER_API}/search?query=${symbol}&limit=1`)
              const jupData = await jupRes.json()
              if (jupData && jupData[0]?.usdPrice) {
                price = jupData[0].usdPrice
              }
            } catch {}
          }

          if (!cancelled && price > 0) {
            oracleLine.update({
              time: Math.floor(Date.now() / 1000) as UTCTimestamp,
              value: price
            })
          }
        }

        fetchOraclePrice()
        oraclePoll = setInterval(fetchOraclePrice, 5000)
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
