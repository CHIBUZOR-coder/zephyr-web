import { useGeneralContext } from '../../../../Context/GeneralContext'

type StepFourProps = {
  onClose: () => void
  onGoPortfolio: () => void
  form: {
    vaultPda?: string;
    depositAmount?: string;
    maxVaultDrawdown?: string | number;
    maxTradeSize?: string | number;
    takeProfitTriggerBps?: string | number;
  }
}

export const StepFour = ({ onClose, onGoPortfolio, form }: StepFourProps) => {
  const { selectedTrader } = useGeneralContext()

  const displayPda = form.vaultPda
    ? `${form.vaultPda.slice(0, 4)}...${form.vaultPda.slice(-4)}`
    : 'N/A'

  return (
    <div>
      <div className='flex flex-col h-full justify-between px-6'>
        {/* ================= MAIN CONTENT ================= */}
        <div className='space-y-8 text-gray-300'>
          {/* SUCCESS ICON */}
          <div className='flex flex-col items-center pt-4'>
            <div className='relative flex items-center justify-center'>
              {/* Your custom check icon */}
              <div className='relative h-[50px] w-[50px] rounded-full border-[1.4px] border-teal-400/40 flex items-center justify-center bg-acopy shadow-[0px_0px_12px_8px_rgba(20,184,166,0.1)]'>
                <span
                  style={{ backgroundImage: `url("/images/copycheck.svg")` }}
                  className='inline-block bg-center bg-contain bg-no-repeat h-[40px] w-[40px]'
                ></span>
              </div>
            </div>

            <h2 className='text-white text-[24px] font-[700] mt-2'>
              Active Copy Enabled
            </h2>

            <p className='text-gray-400 text-sm text-center mt-2 w-[60%]'>
              You are now mirroring{' '}
              <span className='text-white font-medium text-[16px]'>
                @{selectedTrader?.name}
              </span>
              . Your assets are deposited in the on-chain vault.
            </p>
          </div>
          {/* VAULT SUMMARY CARD */}
          <div className='bg-[#081414] border border-[#132b2b] rounded-2xl overflow-hidden'>
            {/* HEADER */}
            <div className='flex justify-between items-center px-5 py-4 border-b border-[#0f2424]'>
              <div className='flex items-center gap-3'>
                {/* Avatar circle */}
                <span
                  style={{ backgroundImage: `url(${selectedTrader?.image})` }}
                  className='w-9 h-9 bg-center bg-cover rounded-full bg-[#102a2a] flex items-center justify-center text-xs text-teal-400 font-semibold'
                ></span>

                <div>
                  <p className='text-white text-[14px] font-medium'>
                    {selectedTrader?.name} Vault
                  </p>
                  <p className='text-[11px] text-[#5f7d84]'>{displayPda}</p>
                </div>
              </div>

              {/* LIVE BADGE */}
              <div className='flex items-center gap-2 bg-[#0e2d22] text-[#19d3a2] px-2.5 py-1 rounded-md border border-[#123f33]'>
                <p className='animate-pulse h-[6px] w-[6px] rounded-full bg-[#22C55E]'></p>
                <span className='text-[10px]'>LIVE</span>
              </div>
            </div>

            {/* STATS GRID */}
            <div className='grid grid-cols-2 px-5 py-5 gap-y-6 gap-x-8 text-sm'>
              <div>
                <p className='text-[10px] text-[#5f7d84] uppercase tracking-widest mb-1'>
                  INITIAL DEPOSIT
                </p>
                <p className='text-white font-semibold text-[14px]'>
                  {form.depositAmount || '0.00'} SOL
                </p>
              </div>

              <div>
                <p className='text-[10px] text-[#5f7d84] uppercase tracking-widest mb-1'>
                  STOP LOSS
                </p>
                <p className='text-[#ef4444] font-semibold text-[14px]'>
                  -{form.maxVaultDrawdown}%
                </p>
              </div>

              <div>
                <p className='text-[10px] text-[#5f7d84] uppercase tracking-widest mb-1'>
                  POSITION SIZE
                </p>
                <p className='text-white font-semibold text-[14px]'>
                  {form.maxTradeSize}% Max
                </p>
              </div>

              <div>
                <p className='text-[10px] text-[#5f7d84] uppercase tracking-widest mb-1'>
                  TAKE PROFIT
                </p>
                <p className='text-[#10b981] font-semibold text-[14px]'>
                  {form.takeProfitTriggerBps
                    ? `+${form.takeProfitTriggerBps}%`
                    : 'None Set'}
                </p>
              </div>
            </div>

            {/* TRANSACTION ROW */}
            <div className='flex justify-between items-center px-5 py-4 border-t border-[#0f2424] text-[11px] text-[#5f7d84]'>
              <span className='text-[#6B7280]'>Verified On-Chain</span>

              <button className='text-[#14B8A6] hover:text-teal-300 transition'>
                View on Solscan ↗
              </button>
            </div>
          </div>

          {/* PRIMARY CTA */}
          <button
            onClick={onGoPortfolio}
            className='
    w-full
    mt-6
    py-3.5
    rounded-xl
    bg-gradient-to-r from-[#19d3c5] to-[#0fbfae]
    font-semibold
    text-[14px]
    hover:brightness-110
    transition
    text-white
  '
          >
            View Portfolio Dashboard
          </button>

          {/* CLOSE TEXT BUTTON */}
          <div className='text-center'>
            <button
              onClick={onClose}
              className='text-[#6B7280] text-sm hover:text-white transition'
            >
              Close
            </button>
          </div>
        </div>
      </div>
      {/* ================= GUARANTEE STRIP ================= */}
      <div className=' mt-6 bg-yellow-500/10 border-t border-yellow-500/20 px-6 py-4 text-xs text-yellow-400'>
        <p className='font-medium mb-1'>Non-Custodial Guarantee</p>
        <p>
          All vault permissions are enforced on-chain via smart contracts. The
          backend never holds your private keys or signs transactions on your
          behalf.
        </p>
      </div>
    </div>
  )
}
