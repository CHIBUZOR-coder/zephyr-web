import { FaTelegramPlane } from 'react-icons/fa'
import {  FaDiscord, FaXTwitter } from 'react-icons/fa6'

type Integration = {
  name: string
  description: string
  connected?: boolean
  icon: React.ReactNode
  button: string
}

const integrations: Integration[] = [
  {
    name: 'Telegram',
    description: 'Instant notifications',
    connected: true,
    icon: <FaTelegramPlane size={18} />,
    button: 'DISCONNECT'
  },
  {
    name: 'Discord',
    description: 'Community alerts',
    icon: <FaDiscord size={18} />,
    button: 'CONNECT DISCORD'
  },
  {
    name: 'X (Twitter)',
    description: 'Share trades',
    icon: <FaXTwitter size={18} />,
    button: 'CONNECT TWITTER'
  }
]

export default function Integrations () {
  return (
    <section className='w-full bg-[#050A0A] text-white font-inter px-6 py-10'>
      {/* Header */}
      <div className='mb-8'>
        <h2 className='text-[18px] font-semibold tracking-wide'>
          EXTERNAL INTEGRATIONS
        </h2>

        <p className='text-[13px] text-[#7A8F8E] mt-1'>
          Connect third-party platforms for enhanced notifications
        </p>
      </div>

      {/* Cards */}
      <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 max-w-[760px]'>
        {integrations.map((item, i) => (
          <div
            key={i}
            className='bg-[#102221] border border-[#1C3A39] rounded-xl p-5 flex flex-col justify-between'
          >
            {/* Top */}
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                {/* Icon */}
                <div className='w-9 h-9 bg-[#0C1E1D] rounded-md flex items-center justify-center'>
                  {item.icon}
                </div>

                <div>
                  <p className='text-[14px] font-medium'>{item.name}</p>
                  <p className='text-[12px] text-[#7A8F8E]'>
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Status */}
              {item.connected ? (
                <span className='text-[10px] px-2 py-[3px] rounded-md bg-[#0F3D2E] text-[#22C55E]'>
                  CONNECTED
                </span>
              ) : (
                <span className='text-[10px] px-2 py-[3px] rounded-md bg-[#1B2C2B] text-[#7A8F8E]'>
                  NOT CONNECTED
                </span>
              )}
            </div>

            {/* Button */}
            <button
              className={`mt-5 w-full text-[12px] font-semibold tracking-wider rounded-lg py-2 border transition
              ${
                item.connected
                  ? 'bg-[#3A1F1F] border-[#7F1D1D] text-red-400 hover:bg-[#472525]'
                  : 'bg-[#123F63] border-[#1E5C8A] text-[#60A5FA] hover:bg-[#174e7a]'
              }`}
            >
              {item.button}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
