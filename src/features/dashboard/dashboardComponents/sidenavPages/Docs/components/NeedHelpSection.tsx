import { FiBookOpen } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export default function NeedHelpSection () {
  return (
    <section className='w-full flex justify-center bg-[#020B0B] py-10 px-4'>
      <div
        className='
        w-full
        max-w-[1100px]
        rounded-2xl
        border border-[#0E3B37]
        bg-gradient-to-r
        from-[#052321]
        via-[#031716]
        to-[#021212]
        p-6
        sm:p-8
        lg:px-10
        lg:py-8
        flex
        flex-col
        lg:flex-row
        items-center
        lg:items-center
        justify-between
        gap-8
        shadow-[0_0_0_1px_rgba(0,255,200,0.04)_inset]
        '
      >
        {/* Icon (top on mobile) */}
        <div
          className='
          order-1
          lg:order-2
          w-[72px]
          h-[72px]
          sm:w-[88px]
          sm:h-[88px]
          rounded-xl
          border border-[#134843]
          bg-[#072524]
          flex
          items-center
          justify-center
          '
        >
          <FiBookOpen className='text-[#0EC7B1]' size={36} />
        </div>

        {/* Content */}
        <div className='order-2 lg:order-1 text-center lg:text-left'>
          <h2 className='text-white text-[18px] sm:text-[20px] font-semibold tracking-wide'>
            NEED MORE HELP?
          </h2>

          <p className='text-[#7FA6A1] text-[13px] sm:text-[14px] mt-2 max-w-[520px]'>
            Can't find what you're looking for? Our support team is available
            24/7 to assist you.
          </p>

          {/* Buttons */}
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 justify-center lg:justify-start'>
            <Link
              target='_blank'
              to={'https://t.me/ZephyrAssist'}
              className='
              px-6
              py-3
              rounded-lg
              text-[11px]
              sm:text-[12px]
              font-semibold
              tracking-widest
              text-white
              bg-[#0EC7B1]
              hover:bg-[#10d6be]
              shadow-[0_0_20px_rgba(14,199,177,0.35)]
              transition
              '
            >
              CONTACT SUPPORT
            </Link>

            <Link
              target='_blank'
              to={'https://t.me/zephyrlabscommunity'}
              className='
              px-6
              py-3
              rounded-lg
              text-[11px]
              sm:text-[12px]
              font-semibold
              tracking-widest
              text-white
              border border-[#173C38]
              bg-[#0A1E1D]
              hover:bg-[#0F2B29]
              transition
              '
            >
              JOIN COMMUNITY
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
