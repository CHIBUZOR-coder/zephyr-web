import { useEffect, useState, useRef } from 'react'

interface Props {
  title: string
  value: string
  progress: number
  info: string
}

export default function RequirementBar ({
  title,
  value,
  progress,
  info
}: Props) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]

        if (entry.isIntersecting) {
          setWidth(progress)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [progress])

  return (
    <div
      ref={ref}
      className='bg-[#031414] border border-teal-900/30 rounded-xl p-4'
    >
      <div className='flex justify-between text-[14px] font-[700] text-white '>
        <div className='flex items-center gap-2'>
          <span
            className={` bg-center bg-cover h-[20px] w-[20px] ${
              title === 'Maximum Drawdown' ? 'rotate-180' : ''
            }`}
            style={{
              backgroundImage: `url(${
                title === 'Trade Count'
                  ? '/images/bar_chart3.svg'
                  : title === 'Assets Under Management'
                  ? '/images/trendingup.svg'
                  : title === 'Risk Consistency Score'
                  ? '/images/Shield_pro.svg'
                  : title === 'Maximum Drawdown'
                  ? '/images/trendingup.svg'
                  : title === 'Track Record Duration'
                  ? '/images/calendar.svg'
                  : '/images/users.svg'
              })`
            }}
          ></span>
          <span>{title}</span>
        </div>
        <span className='text-[#009883]'>{value}</span>
      </div>

      <div className='flex flex-col gap-3 mt-5'>
        <div className='w-full bg-black/40 rounded-full h-2'>
          <div
            className='bg-teal-400 h-2 rounded-full transition-all duration-1000 ease-out'
            style={{ width: `${width}%` }}
          />
        </div>

        <p className='text-[#6e8885] font-[400] leading-[18px]'>{info}</p>
      </div>
    </div>
  )
}
