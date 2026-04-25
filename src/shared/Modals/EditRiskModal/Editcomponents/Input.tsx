import { FiInfo } from 'react-icons/fi'

type InputProps = {
  label: string
  value: string
  onChange?: (val: string) => void
  placeholder?: string
  info?: string
  suffix?: string
}

export default function Input ({
  label,
  placeholder,
  info,
  value,
  onChange,
  suffix = '%'
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange?.(val)
    }
  }

  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-[12px] font-bold text-[#B0E4DD80] flex items-center gap-1'>
        {label}
        {info && (
          <div className='group relative'>
            <FiInfo size={12} className='cursor-help' />
            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-[#0d1f1f] border border-[#1c3535] rounded text-[10px] text-[#B0E4DD61] z-50'>
              {info}
            </div>
          </div>
        )}
      </label>

      <div className='relative'>
        <input
          type='text'
          inputMode='decimal'
          pattern='[0-9]*\.?[0-9]*'
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className='w-full bg-[#081a1a] border border-[#1c3535] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00a08a] transition-colors'
        />
        {suffix && (
          <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#B0E4DD80]'>
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
