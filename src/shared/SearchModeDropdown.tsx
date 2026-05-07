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

  const ref = useRef<HTMLDivElement>(null)
  const activeMode = searchModes.find(m => m.id === searchMode)!

  useEffect(() => {
    if (!searchModeOpen) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setSearchModeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [searchModeOpen, setSearchModeOpen])

  return (
    <div ref={ref} className='relative flex-shrink-0'>
      {/* Trigger */}
      <button
        type='button'
        onMouseDown={e => e.stopPropagation()}
        onClick={() => setSearchModeOpen(prev => !prev)}
        className='flex items-center gap-1 bg-[#102221] border border-[#0A3F46] hover:border-[#00A991] transition-colors p-[0.6rem] rounded-lg text-[10px] font-[700] text-[#00A991] whitespace-nowrap'
      >
        <span>{activeMode.emoji}</span>
        <span>{activeMode.label}</span>
        <span
          className={`transition-transform duration-200 text-[12px] ${
            searchModeOpen ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      {/* Dropdown — only in DOM when open */}
      {searchModeOpen && (
        <div
          className='absolute top-[calc(100%+6px)] left-0 z-[200] bg-[#0c1e1e] border border-[#23483B] rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,169,145,0.15)]'
          style={{ minWidth: '130px' }}
        >
          {searchModes.map(mode => (
            <button
              type='button'
              key={mode.id}
              onMouseDown={e => e.stopPropagation()}
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
      )}
    </div>
  )
}

export default SearchModeDropdown
