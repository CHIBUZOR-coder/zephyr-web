import { useRef, useState } from 'react'
import { HiArrowUpTray } from 'react-icons/hi2'

export default function AvatarUpload () {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('File must be under 2MB')
      return
    }

    if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
      setError('Invalid file type')
      return
    }

    const imageUrl = URL.createObjectURL(file)

    setPreview(imageUrl)
    setError(null)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className='flex items-center gap-4 flex-wrap'>
      {/* Avatar */}
      <div
        className='
        w-12 h-12
        rounded-lg
        bg-accent
        flex items-center justify-center
        font-semibold
        text-black
        overflow-hidden
        '
      >
        {preview ? (
          <img
            src={preview}
            alt='avatar'
            className='w-full h-full object-cover'
          />
        ) : (
          'AK'
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/png, image/jpeg, image/gif'
        onChange={handleFileChange}
        className='hidden'
      />

      {/* Upload Button */}
      <button
        type='button'
        onClick={openFilePicker}
        className='
        flex items-center gap-2
        text-xs
        px-3 py-1.5
        rounded-md
        border border-borderSubtle
        cursor-pointer
        transition
        hover:bg-white/5
        '
      >
        <HiArrowUpTray size={14} />

        <span className='font-medium tracking-wide'>UPLOAD PHOTO</span>
      </button>

      <span className='text-[10px] text-textMuted'>
        JPG, PNG or GIF. Max 2MB.
      </span>

      {error && <p className='text-red-400 text-xs w-full'>{error}</p>}
    </div>
  )
}
