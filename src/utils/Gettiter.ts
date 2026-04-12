const tags = [
  {
    name: "Community",
    text: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    border: "border-[#10B981]/40",
  },
  {
    name: "Rising",
    text: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/40",
  },
  {
    name: "Verified",
    text: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10",
    border: "border-[#3B82F6]/40",
  },
  {
    name: "Elite",
    text: "text-[#FFB900]",
    bg: "bg-[#FFB900]/10",
    border: "border-[#FFB900]/40",
  },
  {
    name: "Institutional",
    text: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    border: "border-[#8B5CF6]/40",
  },
];

export const getTier = (tierName: string) => {
  return tags.find((t) => t.name.toLowerCase() === tierName.toLowerCase());
};

export const isCommunityTier = (tierName: string): boolean => {
  return tierName?.toLowerCase() === "community";
};
