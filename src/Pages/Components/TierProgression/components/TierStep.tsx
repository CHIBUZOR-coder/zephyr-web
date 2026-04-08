interface Props {
  label: string
  value?: string
  completed?: boolean
  active?: boolean
}

export default function TierStep ({ label, value, completed, active }: Props) {
  const borderColorClass = completed
    ? 'border-emerald-400'
    : active
      ? 'border-yellow-400'
      : 'border-tier_border'
  const textColorClass = completed
    ? 'text-emerald-400'
    : active
      ? 'text-yellow-400'
      : 'text-teal-200/60'

  const iconImage = completed
    ? '/images/white_check.svg'
    : active
      ? '/images/yellow_award.svg' // Example: Active tier might have a different icon
      : '/images/white_check.svg'

  return (
    <div className={`flex flex-col items-center text-center w-full `}>
      <div
        className={`w-[56px] h-[56px] rounded-full border-2 flex items-center justify-center text-xs bg-tier ${borderColorClass} font-[700] leading-[18px] uppercase`}
      >
        <span
          style={{
            backgroundImage: `url(${iconImage})`
          }}
          className='bg-center bg-cover h-[24px] w-[24px] '
        ></span>
      </div>

      <p
        className={`text-[9px] md:text-[12px] font-[700] leading-[18px]  mt-2 uppercase ${textColorClass}`}
      >
        {label}
      </p>

      {value && (
        <p
          className={`${textColorClass} text-[8px] md:text-[11px] font-[900] `}
        >
          {value}
        </p>
      )}
    </div>
  )
}
