export interface TierBadgeStyle {
  name: string
  text: string
  bg: string
  border: string
  medalIcon?: boolean
  icon?: string
}

const TIER_STYLES: Record<string, TierBadgeStyle> = {
  "Community": {
    name: "Community",
    text: "text-[#00D4AA]",
    bg: "bg-[#00D4AA]/10",
    border: "border-[#00D4AA]/40",
    medalIcon: true,
    icon: "green_award.svg",
  },
  "Rising": {
    name: "Rising",
    text: "text-[#51A2FF]",
    bg: "bg-[#51A2FF]/10",
    border: "border-[#51A2FF]/40",
    medalIcon: true,
    icon: "blue_award.svg",
  },
  "Verified": {
    name: "Verified",
    text: "text-[#C27AFF]",
    bg: "bg-[#C27AFF]/10",
    border: "border-[#C27AFF]/40",
    medalIcon: true,
    icon: "medal.svg",
  },
  "Elite": {
    name: "Elite",
    text: "text-[#FFB900]",
    bg: "bg-[#FFB900]/10",
    border: "border-[#FFB900]/40",
    medalIcon: true,
    icon: "medal.svg",
  },
  "Institutional": {
    name: "Institutional",
    text: "text-[#009883]",
    bg: "bg-[#009883]/10",
    border: "border-[#009883]/40",
    medalIcon: true,
    icon: "medal.svg",
  },
  "Unranked": {
    name: "Unranked",
    text: "text-[#6B7280]",
    bg: "bg-[#6B7280]/10",
    border: "border-[#6B7280]/40",
    medalIcon: false,
  },
}

export function getTierBadgeStyle(tierLabel: string): TierBadgeStyle {
  return TIER_STYLES[tierLabel] || TIER_STYLES["Community"]
}

export function getTierShortName(tierLabel: string): string {
  return tierLabel
}
