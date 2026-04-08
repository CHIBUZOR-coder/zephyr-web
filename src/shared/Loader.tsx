const Loader = () => {
  return (
    <div
      className={` absolute top-0 left-0 bg-primary z-50 w-full h-full flex justify-center items-center`}
    >
      <div
        className='w-24 h-24 border-r-[4px] bg-primary border-white fixed top-[50%] flex justify-center items-center rounded-full  animate-spin
'
      >
        <span className="bg-[url('/images/logo.png')] bg-cover bg-center h-16 w-16  animate-spin-slow animate-spin-reverse  "></span>
      </div>
    </div>
  )
}

export default Loader
