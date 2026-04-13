import { useRef, useState, useEffect } from 'react'
import { HiArrowUpTray } from 'react-icons/hi2'

interface AvatarUploadProps {
  avatar?: string | null
  seed?: string
  onAvatarChange?: (url: string) => void
}

export default function AvatarUpload({ avatar, seed, onAvatarChange }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(avatar || null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (avatar) {
        setPreview(avatar)
      } else {
        setPreview(null)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [avatar])

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

    if (onAvatarChange) {
      onAvatarChange(imageUrl)
    }
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className='flex items-center gap-4 flex-wrap'>
      {/* Avatar */}
      <div
        className='
        w-20 h-20
        rounded-xl
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
        ) : seed ? (
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
            alt='avatar'
            className='w-full h-full object-cover'
          />
        ) : (
          '?'
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
