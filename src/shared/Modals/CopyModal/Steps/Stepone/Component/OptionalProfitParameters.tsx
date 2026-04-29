import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
import type { Dispatch, SetStateAction } from 'react'

import type { VaultFormData } from '../StepOne'

const dropdown = {
  hidden: { height: 0, opacity: 0 },
  show: { height: 'auto', opacity: 1 }
}

interface OptionalProfitParametersProps {
  form: VaultFormData
  setForm: Dispatch<SetStateAction<VaultFormData>>
}


export default function OptionalProfitParameters ({ form, setForm }: OptionalProfitParametersProps) {
  const [open, setOpen] = useState(false)

  const handleInputChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value })
  }

  return (
    <div className='mt-6'>
      {/* HEADER */}
      <div
        onClick={() => setOpen(!open)}
        className='
        w-full
        border
        border-dashed
        border-[#1f3c3c]
        rounded-lg
        px-4
        py-3
        flex
        items-center
        justify-between
        cursor-pointer
        bg-[#0d1f1f]
        '
      >
        <div className='flex items-center gap-3'>
          <IoMdOptions className='h-[24px] w-[24px] text-white' />

          <p className='text-[14px] text-[#F3F3F3]  leading-[20px] font-[500]'>
            Optional Profit Parameters
          </p>
        </div>

        <FiChevronDown
          className={`text-white transition ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {/* DROPDOWN BODY */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdown}
            initial='hidden'
            animate='show'
            exit='hidden'
            transition={{ duration: 0.25 }}
            className='overflow-hidden'
          >
            <div
              className='
              mt-4
              flex
              flex-col
              gap-6
              '
            >
              {/* TAKE PROFIT */}
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <p className='text-[12px] text-[#B0E4DD80] font-[700]  leading-[18px]'>
                    Take Profit Target (%)
                  </p>

                  <span className='text-[9px]  h-[16px] w-[16px] bg-[#23483B] text-[#6fd6c2] rounded-full p-1 flex justify-center items-center'>
                    ?
                  </span>
                </div>

                <input
                  placeholder='e.g., 25'
                  value={form.takeProfitTriggerBps}
                  onChange={(e) => handleInputChange('takeProfitTriggerBps', e.target.value)}
                  className='
                  opt
                  w-full
                  bg-[#081a1a]
                  border
                  border-[#1c3535]
                  rounded-lg
                  px-3
                  py-3
                  text-white
                  text-[13px]
                  outline-none
                  '
                />

                <p className='text-[10px] text-[#B0E4DD61] mt-1 font-[400] leading-[15px]'>
                  Auto-close position when profit reaches this percentage.
                </p>
              </div>

              {/* STOP LOSS */}
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <p className='text-[12px] text-[#B0E4DD80] font-[700]  leading-[18px]'>
                    Stop Loss Override (SOL)
                  </p>

                  <span className='text-[9px]  h-[16px] w-[16px] bg-[#23483B] text-[#6fd6c2] rounded-full p-1 flex justify-center items-center'>
                    ?
                  </span>
                </div>
                <input
                  placeholder='e.g., 1.0'
                  value={form.stopLossTriggerBps}
                  onChange={(e) => handleInputChange('stopLossTriggerBps', e.target.value)}
                  className='
                  opt
                  w-full
                  bg-[#081a1a]
                  border
                  border-[#1c3535]
                  rounded-lg
                  px-3
                  py-3
                  text-white
                  text-[13px]
                  outline-none
                  '
                />

                <p className='text-[10px] text-[#B0E4DD61] mt-1 font-[400] leading-[15px]'>
                  Override trader's stop loss with your own fixed SOL limit.
                </p>
              </div>

              {/* TRAILING STOP */}
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <p className='text-[12px] text-[#B0E4DD80] font-[700]  leading-[18px]'>
                    Trailing Stop Distance
                  </p>

                  <span className='text-[9px]  h-[16px] w-[16px] bg-[#23483B] text-[#6fd6c2] rounded-full p-1 flex justify-center items-center'>
                    ?
                  </span>
                </div>
                <input
                  disabled
                  placeholder='Coming soon'
                  className='
                 opt
                  w-full
                  bg-[#081a1a]
                  border
                  border-[#1c3535]
                  rounded-lg
                  px-3
                  py-3
                  text-white
                  text-[13px]
                  outline-none
                  '
                />

                <p className='text-[10px] text-[#B0E4DD61] mt-1 font-[400] leading-[15px]'>
                  Automatically adjust stop loss as profit increases.
                </p>
              </div>

              {/* INFO BOX */}
              <div
                className='
                opt
                flex
                items-center
                gap-3
                text-[10px]
                bg-[#0f2d2a]
                border
                border-[#1c3535]
                rounded-lg
                px-3
                py-3
                text-[#009883]
                '
              >
                <span className='text-[14px] bg-[#009883] h-[16px] w-[16px] p-1 rounded-full text-white flex justify-center items-center'>
                  ✓
                </span>

                <p className='font-[400] leading-[16px]'>
                  These parameters are optional and will override the trader’s
                  settings when active.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
