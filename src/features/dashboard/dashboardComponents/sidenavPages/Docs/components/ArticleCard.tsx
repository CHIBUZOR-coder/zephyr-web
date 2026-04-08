type Props = {
  level: string
  icon: string
  label: string
  sub: string
  info: string
  time: string
}

export default function ArticleCard ({
  level,
  icon,
  label,
  sub,
  info,
  time
}: Props) {
  return (
    <div
      className='
      bg-docsCard
      border border-docsBorder
      rounded-lg
      p-5
      hover:bg-[#122827]
      transition
      cursor-pointer
      flex flex-col
      justify-between
      '
    >
      <div className=''>
        <div className='flex justify-between  items-center'>
          {/* <span className='text-xs text-docsPrimary'>{label}</span> */}
          <div className='rounded-lg  bg-[#0e2e2b] w-[48px] h-[48px] flex justify-center items-center'>
            <span
              className='w-[18px] h-[18px] bg-center bg-cover inline-block'
              style={{ backgroundImage: `url(${icon})` }}
            ></span>
          </div>
          <span
            className={`text-xs px-3 py-1  border-[1px] rounded-lg flex justify-center items-center ${
              level === 'Advanced'
                ? 'text-[#FB2C36] border-advanceb bg-advance'
                : level === 'Beginner'
                ? 'text-[#22C55E] border-beginb bg-begin'
                : 'text-[#FE9A00] bg-interm border-intermb'
            }`}
          >
            {level}
          </span>
        </div>

        <div className='flex flex-col mt-[1.4rem]'>
          <p className='text-[10px] font-[900] text-[#009883] leading-[15px] uppercase'>
            {label}
          </p>

          <h3 className=' text-[20px]  text-white font-[700]'>{sub}</h3>
        </div>

        <p className='text-xs text-[#80aaa5] leading-relaxed mt-3 '>{info}</p>

        <div className='flex flex-col gap-2 mt-4'>
          <p className='bg-[#162d29] h-[1px] w-full'></p>

          <div className='flex justify-between items-center w-full '>
            <div className='flex items-center gap-4'>
              <span
                className='w-[15px] h-[15px] bg-center bg-cover inline-block'
                style={{ backgroundImage: `url("/images/clock.svg")` }}
              ></span>
              <span className='text-[12px] font-[500] text-[#6e8885]'>
                {time}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-[12px] font-[900] text-[#009883] leading-[16px] tracking-[1.2px]'>
                READ
              </span>
              <span
                style={{ backgroundImage: `url("/images/chevron.svg")` }}
                className='bg-center bg-cover h-[16px] w-[16px]'
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
