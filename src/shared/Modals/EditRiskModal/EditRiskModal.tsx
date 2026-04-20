import { AnimatePresence, motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import Input from './Editcomponents/Input'
import OptionalProfitParameters from './Editcomponents/OptionalProfitParameters'
import { useGeneralContext } from '../../../Context/GeneralContext'
import { useEffect, useState } from 'react'

const PrimaryButton = ({
  onClick,
  label
}: {
  onClick: () => void
  label: string
}) => (
  <motion.button
    whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className='flex-[1.8] py-[13px] bg-[#00a08a] rounded-[10px] text-white  text-[14px] tracking-[0.5px] font-[900] leading-[21px] cursor-pointer border-none w-1/2'
  >
    {label}
  </motion.button>
)
export default function EditRiskModal () {
  const [loading, setLoading] = useState(false)
  const { editRiskvisible, setEditRiskvisible } = useGeneralContext()

  useEffect(() => {
    console.log(loading)
  }, [loading])
  return (
    <>
      <AnimatePresence>
        {editRiskvisible && (
          <>
            {/* Backdrop */}
            <motion.div
              onClick={() => setEditRiskvisible(false)}
              className='fixed inset-0 bg-black/70 z-[90]
'
            />

            {/* Modal */}
            <motion.div
              onClick={() => setEditRiskvisible(false)}
              className='fixed inset-0 flex justify-center items-center z-[100]'
            >
              <motion.div
                onClick={e => e.stopPropagation()}
                className='w-[600px] bg-[#0d1f1f] rounded-xl p-5'
              >
                {/* Header */}
                <div className='flex justify-between'>
                  <h2 className='text-white text-lg font-semibold'>
                    Edit Risk Parameters
                  </h2>
                  <FiX
                    onClick={() => setEditRiskvisible(false)}
                    className='cursor-pointer text-white'
                  />
                </div>
                
                {/* <div className='w-full rounded-lg border-[1px] border-[#1c3535] p-3 flex justify-between items-center flex-col md:flex-row gap-5 md:gap-0'>
                  <div className='flex justify-between gap-2 w-full md:w-auto'>
                    <span
                      className='h-[48px] w-[48px] rounded-full bg-cover bg-center'
                      style={{
                        backgroundImage: `url(${selectedTrader?.image})`
                      }}
                    ></span>
                    <div>
                      <div className='flex items-center gap-2'>
                        <p className='text-[18px] font-[700] text-white'>
                          {selectedTrader?.name}
                        </p>
                        <span className='text-[8px] font-[400] leading-[15px] tracking-[0.5px] uppercase bg-ins border border-[#482174] text-[#D8B4FE] px-1 rounded-sm'>
                          Institutional
                        </span>
                      </div>
                      <p className='font-[400] text-[10px] leading-4 text-[#F3F3F3]'>
                        Strategy: High-Freq Solana DEX
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-5 md:gap-3 items-center w-full md:w-auto'>
                    <div className='flex flex-col gap-2'>
                      <p className='dd'>30D PnL</p>
                      <p className='numm text-[#10B981]'>+142.5%</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                      <p className='dd'>Win Rate</p>
                      <p className='numm text-white'>78.4%</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                      <p className='dd'>Max DD</p>
                      <p className='numm text-[#EF4444]'>-12.2%</p>
                    </div>
                  </div>
                </div> */}
                {/* Content */}
                <div className='mt-5 grid gap-4'>
                  <Input label='Max Vault Drawdown' value='20' />
                  <Input label='Max Trade Size' value='5' />
                  <Input label='Max Entry Slippage' value='0.5' />

                  {/* Child component */}
                  <OptionalProfitParameters />
                </div>
                {/* Footer */}
                <div className='mt-[30px] flex justify-between items-center'>
                  <span
                    onClick={() => setEditRiskvisible(false)}
                    className='text-white cursor-pointer w-1/2 '
                  >
                    Cancel
                  </span>
                  <PrimaryButton
                    label='Proceed'
                    onClick={() => setLoading(true)} // ✅
                  />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
