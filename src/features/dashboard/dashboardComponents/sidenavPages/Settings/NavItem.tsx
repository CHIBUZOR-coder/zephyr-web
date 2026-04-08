interface Props {
  icon: React.ReactNode
  text: string
  active: boolean
  onClick: () => void
}

export default function NavItem ({ icon, text, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition
      ${
        active
          ? 'bg-accentSoft text-white'
          : 'text-textMuted hover:text-textMain'
      }`}
    >
      <span className='text-lg'>{icon}</span>
      {text}
    </button>
  )
}
