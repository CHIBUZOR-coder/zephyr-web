import { useState } from 'react'

import Step1Welcome from './steps/Step1welcome'
import Step2HowItWorks from './steps/Step2howitworks'
import Step3ChooseRole from './steps/Step3chooserole'
import Step4CopyTradingExplanation from './steps/Step4copytradingexplanation'
import Step5ConnectWallet from './steps/Step5connectwallet'

// ─── Types ────────────────────────────────────────────────────────────────────
type StepNumber = 1 | 2 | 3 | 4 | 5
const TOTAL_STEPS = 5 as const

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator ({
  index,
  current
}: {
  index: number
  current: StepNumber
}) {
  const n = index + 1
  const isActive = n === current
  const isDone = n < current

  return (
    <div className='flex flex-col items-center gap-1  '>
      <div
        className={`h-1 rounded-full transition-all duration-300 ${
          isActive
            ? 'w-8 bg-[#2de8c8]'
            : isDone
            ? 'w-6 bg-[rgba(45,232,200,0.35)]'
            : 'w-6 bg-[#162433]'
        }`}
      />
      <span
        className={`text-[8px] tracking-widest uppercase font-medium ${
          isActive ? 'text-[#2de8c8]' : 'text-[#3d5060]'
        }`}
      >
        Step {n}
      </span>
    </div>
  )
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
interface OnboardingProps {
  /** Called when the user finishes or skips the onboarding flow */
  onComplete?: () => void
}

export default function Onboarding ({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1)

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(s => (s + 1) as StepNumber)
    } else {
      onComplete?.()
    }
  }

  // ── Added: go back one step ──
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => (s - 1) as StepNumber)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Welcome onNext={goNext} />
      case 2:
        return <Step2HowItWorks onNext={goNext} onBack={goBack} />
      case 3:
        return <Step3ChooseRole onNext={goNext} onBack={goBack} />
      case 4:
        return <Step4CopyTradingExplanation onNext={goNext} onBack={goBack} />
      case 5:
        return <Step5ConnectWallet onNext={goNext} onBack={goBack} />
    }
  }

  return (
    /* Full-viewport overlay */
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80'>
      {/* Modal */}
      <div className='relative w-full h-full flex flex-col overflow-hidden  border border-[rgba(255,255,255,0.07)] bg-gradient-to-b from-[#0d1b26] via-[#081219] to-[#05100e] shadow-[0_40px_80px_rgba(0,0,0,0.6)]'>
        {/* Top teal glow */}
        <div className='pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(45,232,200,0.08)_0%,transparent_100%)]' />

        {/* ── Top bar ── */}
        <div className='relative z-10 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] px-5 py-3 flex-shrink-0'>
          {/* Brand */}
          <div className='flex  items-center gap-2'>
            
            <span
              className='inline-block bg-center bg-cover w-[40px] h-[40px]'
              style={{
                backgroundImage: `url("/images/zeflogo.png")`
              }}
            ></span>
            <div className='flex flex-col gap-1'>
              <span className='font-display text-[13px] font-bold text-[#e8edf2] tracking-wide'>
                Zephyr
              </span>
              <span className='text-[8px] uppercase tracking-[0.08em] text-[#B0E4DD]'>
                Social Copy Trading
              </span>
            </div>
          </div>

          {/* Skip */}
          <button
            onClick={onComplete}
            className='text-xs text-[#7a8fa0] hover:text-[#e8edf2] hover:bg-white/5 px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer'
          >
            Skip
          </button>
        </div>

        {/* ── Step body ── */}
        <div className='relative z-10 flex-1 flex  justify-center px-6 sm:px-8 py-7  overflow-y-auto sid '>
          {renderStep()}
        </div>

        {/* ── Step indicators ── */}
        <div className='relative z-10 flex items-center justify-center gap-3 border-t border-[rgba(255,255,255,0.07)] px-5 py-3 flex-shrink-0'>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <StepIndicator key={i} index={i} current={currentStep} />
          ))}
        </div>
      </div>
    </div>
  )
}
