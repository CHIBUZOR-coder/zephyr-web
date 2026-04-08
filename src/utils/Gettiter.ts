const tags = [
  {
    name: "Alpha Caller",
    text: "text-[#C27AFF]",
    bg: "bg-[#C27AFF]/10",
    border: "border-[#C27AFF]/40",
  },
  {
    name: "Legendary",
    text: "text-[#009883]",
    bg: "bg-[#009883]/10",
    border: "border-[#009883]/40",
  },
  {
    name: "Elite Alpha",
    text: "text-[#FFB900]",
    bg: "bg-[#FFB900]/10",
    border: "border-[#FFB900]/40",
  },
  {
    name: "Proven Caller",
    text: "text-[#51A2FF]",
    bg: "bg-[#51A2FF]/10",
    border: "border-[#51A2FF]/40",
  },
];

export const getTier = (tierName: string) => {
  return tags.find((t) => t.name.toLocaleLowerCase() === tierName.toLocaleLowerCase());
};
