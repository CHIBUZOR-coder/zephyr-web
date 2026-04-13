import type { StepProps } from '../Types'

export default function Step1Welcome ({ onNext }: StepProps) {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <div className=' items-center justify-center text-center  animate-fade-up w-full lg:w-[40%]  bg-[#151a1f] px-4 py-10 border-[1px] border-step1 rounded-md '>
        {/* Logo icon */}
        <div className='w-full flex justify-center items-center'>
          <div className='flex justify-center items-center bg-[#1d2d2f] border-2 h-[60px] w-[60px] border-[#66DAC233] rounded-md'>
            <span
              className='block  bg-center bg-cover w-[40px] h-[40px]'
              style={{ backgroundImage: `url("/images/zeflogo.png")` }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className='flex flex-col gap-1 mt-4'>
          <h1 className=' font-display text-[20px] lg:text-[30px] font-extrabold text-[#e8edf2] tracking-tight leading-none grok'>
            Welcome to Zephyr
          </h1>
          {/* Subtitle */}
          <p className='text-sm text-[#BCC9C4] font-[200] stepp leading-[28px] text-[10px] lg:text-[15px]'>
            Copy the best traders on-chain
          </p>
        </div>

        {/* CTA */}
        <div className='flex flex-col gap-3 justify-center items-center mt-5 '>
          <button
            onClick={onNext}
            className=' bg-[#66DAC2] text-[#041a15] font-bold text-sm px-10 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 w-full lg:w-1/2 cursor-pointer'
          >
            Get Started →
          </button>
          {/* Footnote */}
          {/* <p className='text-[9px] tracking-widest uppercase text-[#BCC9C499]'>
            Press start &amp; browse while we sync it
          </p> */}
        </div>
      </div>
    </div>
  )
}
