type InputProps = {
  label: string
  value: string
  placeholder?: string // ✅ optional
  info?: string // ✅ optional
}

export default function Input ({ label, placeholder, info, value }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#B0E4DD80' }}>
        {label}
      </label>

      <input
        readOnly
        value={value}
        placeholder={placeholder}
        style={{
          background: '#081a1a',
          border: '1px solid #1c3535',
          borderRadius: 8,
          padding: '10px 12px',
          color: '#fff'
        }}
      />

      {info && (
        <p style={{ fontSize: 10, color: '#B0E4DD61', margin: 0 }}>{info}</p>
      )}
    </div>
  )
}
