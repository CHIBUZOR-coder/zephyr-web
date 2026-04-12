
import type { StepProps } from '../Types'

export default function Step1Welcome ({ onNext }: StepProps) {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <div className='flex flex-col items-center justify-center text-center gap-5 animate-fade-up w-full lg:w-[40%] h-[65%] bg-[#151a1f] p-4 border-[1px] border-step1 rounded-md '>
        {/* Logo icon */}
        <span
          className='inline-block bg-center bg-cover w-14 h-14'
          style={{
            backgroundImage: `url("/images/zeflogo.png")`
          }}
        ></span>
        {/* Heading */}
        <h1 className='font-display text-4xl sm:text-5xl font-extrabold text-[#e8edf2] tracking-tight leading-none'>
          Welcome to Zephyr
        </h1>
        {/* Subtitle */}
        <p className='text-sm text-[#BCC9C4] font-[200] stepp leading-[28px] text-[12px] lg:text-[25px]'>Copy the best traders on-chain</p>
        {/* CTA */}
        <button
          onClick={onNext}
          className=' bg-[#66DAC2] text-[#041a15] font-bold text-sm px-10 py-3 rounded-lg hover:opacity-85 active:scale-95 transition-all duration-150 min-w-[180px] cursor-pointer'
        >
          Get Started →
        </button>
        {/* Footnote */}
        <p className='text-[9px] tracking-widest uppercase text-[#BCC9C499]'>
          Press start &amp; browse while we sync it
        </p>
      </div>
    </div>
  )
}
