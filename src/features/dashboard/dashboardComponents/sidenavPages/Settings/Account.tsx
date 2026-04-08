
import { FaXTwitter, FaDiscord, FaTelegram } from 'react-icons/fa6'
import AvatarUpload from './Components/AvatarUpload'

export default function Account () {
  return (
    <div className='w-full max-w-3xl'>
      {/* Header */}
      <h1 className='text-lg sm:text-xl font-semibold text-textMain'>
        PROFILE & IDENTITY
      </h1>

      <p className='text-xs sm:text-sm text-textMuted mt-1 mb-6'>
        Manage your public profile and on-chain identity
      </p>

      {/* Card */}
      <div
        className='
        rounded-xl
        border border-borderSubtle
        p-5 sm:p-6
        bg-gradient-to-b
        from-cardTop
        to-cardBottom
        shadow-[0_0_0_1px_rgba(0,255,200,0.04),0_10px_40px_rgba(0,0,0,0.6)]
        '
      >
        {/* Avatar Upload */}
        <AvatarUpload />

        {/* Form */}
        <div className='space-y-5 mt-6'>
          {/* Display Name */}
          <div>
            <label className='text-[11px] tracking-wide text-textMuted'>
              DISPLAY NAME
            </label>

            <input
              defaultValue='Alpha King'
              className='
              w-full mt-1
              px-3 py-2
              rounded-lg
              border border-borderSubtle
              bg-inputBg
              text-sm
              outline-none
              focus:border-accent
              '
            />
          </div>

          {/* Username */}
          <div>
            <label className='text-[11px] tracking-wide text-textMuted'>
              USERNAME
            </label>

            <input
              defaultValue='@alpha_king'
              className='
              w-full mt-1
              px-3 py-2
              rounded-lg
              border border-borderSubtle
              bg-inputBg
              text-sm
              outline-none
              focus:border-accent
              '
            />
          </div>

          {/* Bio */}
          <div>
            <div className='flex justify-between'>
              <label className='text-[11px] tracking-wide text-textMuted'>
                BIO
              </label>

              <span className='text-[10px] text-textMuted'>100/160</span>
            </div>

            <textarea
              className='
              w-full mt-1
              px-3 py-2
              h-24
              rounded-lg
              border border-borderSubtle
              bg-inputBg
              text-sm
              outline-none
              resize-none
              focus:border-accent
              '
            />
          </div>

          {/* Social Links */}
          <div className='space-y-3'>
            <p className='text-[11px] tracking-wide text-textMuted'>
              SOCIAL LINKS
            </p>

            {/* Twitter */}
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 flex items-center justify-center rounded-md bg-black'>
                <FaXTwitter size={13} />
              </div>

              <input
                placeholder='@alphatrader'
                className='
                flex-1
                px-3 py-2
                rounded-lg
                border border-borderSubtle
                bg-inputBg
                text-sm
                outline-none
                focus:border-accent
                '
              />
            </div>

            {/* Discord */}
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 flex items-center justify-center rounded-md bg-indigo-500'>
                <FaDiscord size={13} />
              </div>

              <input
                placeholder='@alphatrader'
                className='
                flex-1
                px-3 py-2
                rounded-lg
                border border-borderSubtle
                bg-inputBg
                text-sm
                outline-none
                focus:border-accent
                '
              />
            </div>

            {/* Telegram */}
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 flex items-center justify-center rounded-md bg-sky-500'>
                <FaTelegram size={13} />
              </div>

              <input
                placeholder='alphatrader#1234'
                className='
                flex-1
                px-3 py-2
                rounded-lg
                border border-borderSubtle
                bg-inputBg
                text-sm
                outline-none
                focus:border-accent
                '
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
