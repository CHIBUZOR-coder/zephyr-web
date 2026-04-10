import { getTierBadgeStyle, getTierShortName } from '../../utils/tierBadge'

interface TierBadgeProps {
  tierLabel: string
  showMedal?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function TierBadge({ tierLabel, showMedal = true, size = 'md' }: TierBadgeProps) {
  const style = getTierBadgeStyle(tierLabel)
  const shortName = getTierShortName(tierLabel)

  const sizeClasses = {
    sm: 'text-[10px] py-1 px-2 gap-1',
    md: 'text-[12px] py-2 px-4 gap-2',
    lg: 'text-[14px] py-2 px-5 gap-2',
  }

  const iconSizes = {
    sm: 'h-[8px] w-[8px]',
    md: 'h-[12px] w-[12px]',
    lg: 'h-[14px] w-[14px]',
  }

  const iconName = style.icon || 'medal.svg'

  return (
    <div
      className={`
        inline-flex items-center rounded-xl border font-[900] uppercase leading-[16px] tracking-wide
        ${sizeClasses[size]}
        ${style.text.replace('text-', 'text-')}
        ${style.bg}
        ${style.border}
      `}
    >
      {showMedal && style.medalIcon && (
        <span
          style={{ backgroundImage: `url("/images/${iconName}")` }}
          className={`${iconSizes[size]} bg-center bg-cover`}
        />
      )}
      <span>{shortName}</span>
    </div>
  )
}
