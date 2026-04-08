import { FaInfoCircle } from 'react-icons/fa'

interface InputProps {
  label: string
  placeholder: string
  info: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Input = ({ label, placeholder, info, value, onChange }: InputProps) => (
  <div>
    <div className='flex items-center gap-3 mb-1'>
      <p className='text-xs text-gray-400 '>{label}</p>
      <span className='flex justify-center items-center '>
        <FaInfoCircle className='text-white w-[14px] h-[14px]' />
      </span>
    </div>

    <input
      className='bg-[#0a1717] border border-[#1c3535] rounded-md px-3 py-2 text-white outline-none placeholder-white w-full'
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />

    <p className='text-[10px] font-[400] text-[#F3F3F3] leading-[15px] mt-1'>
      {info && info}
    </p>
  </div>
)

export default Input
