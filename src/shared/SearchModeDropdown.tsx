import { useEffect, useRef } from 'react'
import { useGeneralContext } from '../Context/GeneralContext'

const SearchModeDropdown = () => {
  const {
    searchModes,
    searchMode,
    setSearchMode,
    searchModeOpen,
    setSearchModeOpen
  } = useGeneralContext()

  const activeMode = searchModes.find(m => m.id === searchMode)!
  // ── Close on outside click
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!searchModeOpen) return // no listener needed when already closed

    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setSearchModeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [searchModeOpen, setSearchModeOpen])

  return (
    <div ref={ref} className='relative flex items-center'>
      {/* Trigger Button */}
      <button
        onClick={() => setSearchModeOpen(prev => !prev)}
        className='flex items-center gap-1 bg-[#102221] border border-[#0A3F46] hover:border-[#00A991] transition-colors p-[0.6rem] rounded-lg text-[10px] font-[700] text-[#00A991] whitespace-nowrap'
      >
        <span>{activeMode.emoji}</span>
        <span>{activeMode.label}</span>
        <span
          className={`transition-transform duration-200 text-[12px] ${
            searchModeOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▾
        </span>
      </button>

      {/* Animated Dropdown */}
      <div
        className={`absolute top-[calc(100%+6px)] left-0 z-[100] bg-[#0c1e1e] border border-[#23483B] rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,169,145,0.15)] transition-all duration-200 origin-top ${
          searchModeOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
        style={{ minWidth: '130px' }}
      >
        {searchModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => {
              setSearchMode(mode.id)
              setSearchModeOpen(false)
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-[600] transition-colors hover:bg-[#102221] ${
              searchMode === mode.id
                ? 'text-[#00A991] bg-[#102221]'
                : 'text-gray-400'
            }`}
          >
            <span>{mode.emoji}</span>
            <span>{mode.label}</span>
            {searchMode === mode.id && (
              <span className='ml-auto text-[#00A991] text-[10px]'>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchModeDropdown
