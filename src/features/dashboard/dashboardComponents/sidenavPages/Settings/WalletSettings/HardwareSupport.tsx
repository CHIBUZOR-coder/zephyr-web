

const HardwareSupport = () => {
  return (
    <div
      className='
      w-full
      border border-[#1A3D39]
      rounded-xl
      p-4
      bg-[#061B19]
      '
    >
      <p className='text-sm text-[#CFEFED] font-medium'>
        Hardware Wallet Support
      </p>

      <p className='text-xs text-[#7A9E9A] mt-1'>
        Ledger and Trezor hardware wallets are supported for enhanced security.
        Connect via your wallet provider.
      </p>
    </div>
  )
}

export default HardwareSupport
