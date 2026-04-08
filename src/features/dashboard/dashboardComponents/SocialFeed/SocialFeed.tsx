const socials = [
  {
    name: 'SolanaWhale',
    action: 'just swapped',
    time: '2m ago',
    sell: 50.5,
    buy: '7.2k $PYTH',
    comment: 3,
    likes: 24,
    message: '',
    img: '/images/person3.png',
    price: 0.084
  },
  {
    name: 'Degenerate',
    action: 'copied',
    time: '15m ago',
    sell: null,
    buy: null,
    comment: 24,
    likes: 152,
    message: '',
    img: '/images/person2.png'
  },
  {
    name: 'AlphaSeeker',
    action: 'bought',
    time: '42m ago',
    sell: null,
    buy: null,
    comment: 24,
    likes: 152,
    message: '',
    binfo: 'BUY 120M $BONK',
    price: '2,140',
    img: '/images/person1.png'
  }
]

export default function SocialFeed () {
  return (
    <div className='mt-10'>
      <div className='flex gap-2 items-center px-4'>
        <h4 className='text-[15px] font-[700]  '>Social Feed</h4>
        <p className='w-[6px] h-[6px] rounded-full bg-[#22C55E] animate-pulse'></p>
      </div>
      <div className=' bg-[#0f1a18] rounded-xl'>
        <div className=' p-4 flex flex-col mt-4 gap-8'>
          {socials.map((item, i) => {
            if (item.action.toLocaleLowerCase().includes('swapped')) {
              console.log('img:', item.img)

              return (
                <div key={i} className='flex justify-between '>
                  <div className='flex justify-center items-center h-[28px] w-[28px] border-[1px] border-[#112968] rounded-full'>
                    <span
                      style={{
                        backgroundImage: `url(${item.img})`
                      }}
                      className='bg-cover bg-center  rounded-full h-[88%] w-[88%] '
                    ></span>
                  </div>

                  <div className='flex flex-col w-[90%] gap-[5px]'>
                    <div className='flex justify-between items-center '>
                      <div className='flex gap-3 items-center'>
                        <p className='text-[10px] font-[700] text-white'>
                          {item.name}
                        </p>
                        <p className='text-[10px] text-[#B0E4DD]'>
                          {item.action}
                        </p>
                      </div>
                      <p className='text-[7.5px] text-[#B0E4DD]'>{item.time}</p>
                    </div>
                    <div className='bg-[#22403F] rounded-md flex justify-between items-center p-2 '>
                      <div className=' '>
                        <p className='text-[9px] text-[#FA6938] font-[700]'>
                          SELL: {item.sell}
                        </p>
                        <p className='text-[7.5px] font-[400] text-[#B0E4DD]'>
                          price: ${item.price}
                        </p>
                      </div>

                      <span
                        style={{
                          backgroundImage: `url('/images/arrowr.svg')`
                        }}
                        className='bg-center bg-cover h-4 w-4'
                      ></span>

                      <div className=''>
                        <p className='text-[9px] text-[#FA6938] font-[700]'>
                          BUY:
                          <span className='text-white'>{item.buy}</span>
                        </p>
                        <p className='text-[7.5px] font-[400] text-[#FA6938] flex gap-[3px] items-center'>
                          <span>Solscan</span>
                          <span
                            style={{
                              backgroundImage: `url('/images/redirect.svg')`
                            }}
                            className=' cursor-pointer  h-2 w-2 bg-center bgcover'
                          ></span>
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-3 items-center'>
                      <div className='flex gap-1 items-center'>
                        <span
                          style={{
                            backgroundImage: `url('/images/likes.svg')`
                          }}
                          className='bg-center bg-cover h-[12px] w-[15px] cursor-pointer'
                        ></span>

                        <span className='text-[8.5px] font-[400]'>
                          {item.likes}
                        </span>
                      </div>
                      <div className='flex gap-1 items-center'>
                        <span
                          style={{
                            backgroundImage: `url('/images/comment.svg')`
                          }}
                          className='bg-center bg-cover h-[12px] w-[15px] cursor-pointer'
                        ></span>

                        <span className='text-[8.5px] font-[400]'>
                          {item.comment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            } else if (item.action.toLocaleLowerCase().includes('copied')) {
              return (
                <div key={i} className='flex justify-between'>
                  <div className='flex justify-center items-center h-[28px] w-[28px] border-[1px] border-[#112968] rounded-full'>
                    <span
                      style={{
                        backgroundImage: `url(${item.img})`
                      }}
                      className='bg-cover bg-center  rounded-full h-[88%] w-[88%] '
                    ></span>
                  </div>
                  <div className='flex flex-col w-[90%] gap-[5px]'>
                    <div className='flex justify-between items-center '>
                      <div className='flex gap-3 items-center'>
                        <p className='text-[10px] font-[700] text-white'>
                          {item.name}
                        </p>
                        <p className='text-[10px] text-[#B0E4DD]'>
                          {item.action}
                        </p>
                      </div>
                      <p className='text-[7.5px] text-[#B0E4DD]'>{item.time}</p>
                    </div>
                    <div className=' rounded-md items-center p-2 '>
                      <p className='text-[#B0E4DD] text-[9px] font-[400]'>
                        Just increased allocation for @AlphaSeeker. That last
                        trade on $JUP was legendary! 🚀
                      </p>
                    </div>
                    <div className='flex gap-3 items-center'>
                      <div className='flex gap-1 items-center'>
                        <span
                          style={{
                            backgroundImage: `url('/images/likes.svg')`
                          }}
                          className='bg-center bg-cover h-[12px] w-[15px] cursor-pointer'
                        ></span>

                        <span className='text-[8.5px] font-[400]'>
                          {item.likes}
                        </span>
                      </div>
                      <div className='flex gap-1 items-center'>
                        <span
                          style={{
                            backgroundImage: `url('/images/comment.svg')`
                          }}
                          className='bg-center bg-cover h-[12px] w-[15px] cursor-pointer'
                        ></span>

                        <span className='text-[8.5px] font-[400]'>
                          {item.comment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            } else {
              return (
                <div key={i} className='flex justify-between'>
                  <div className='flex justify-center items-center h-[28px] w-[28px] border-[1px] border-[#112968] rounded-full'>
                    <span
                      style={{
                        backgroundImage: `url(${item.img})`
                      }}
                      className='bg-cover bg-center  rounded-full h-[88%] w-[88%] '
                    ></span>
                  </div>
                  <div className='flex flex-col w-[90%] gap-[5px]'>
                    <div className='flex justify-between items-center '>
                      <div className='flex gap-3 items-center'>
                        <p className='text-[10px] font-[700] text-white'>
                          {item.name}
                        </p>
                        <p className='text-[10px] text-[#B0E4DD]'>
                          {item.action}
                        </p>
                      </div>
                      <p className='text-[7.5px] text-[#B0E4DD]'>{item.time}</p>
                    </div>
                    <div className='bg-[#22403F] rounded-md flex justify-between items-center p-2 '>
                      <div className='flex justify-between  gap-3'>
                        <span
                          style={{
                            backgroundImage: `url("/images/bonk.png")`
                          }}
                          className='bg-cover bg-center h-[15px] w-[15px]'
                        ></span>

                        <p className='text-[9px] font-[700] text-[#13EC5F]'>
                          BUY 120M $BONK
                        </p>
                      </div>
                      <p className='text-[7.5px] font-[400] text-[#13EC5F]'>
                        Value: ${item.price}
                      </p>
                    </div>

                    <div className='flex gap-3 items-center'>
                      <div className='flex gap-1 items-center'>
                        <span
                          style={{
                            backgroundImage: `url('/images/likes.svg')`
                          }}
                          className='bg-center bg-cover h-[12px] w-[15px] cursor-pointer'
                        ></span>

                        <span className='text-[8.5px] font-[400]'>
                          {item.likes}
                        </span>
                      </div>
                      <div className='flex gap-1 items-center'>
                        <span
                          style={{
                            backgroundImage: `url('/images/comment.svg')`
                          }}
                          className='bg-center bg-cover h-[12px] w-[15px] cursor-pointer'
                        ></span>

                        <span className='text-[8.5px] font-[400]'>
                          {item.comment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          })}
        </div>
        <div className='mt-12'>
          <p className=' h-[0.5px] bg-[#232948]'></p>

          <div className='p-4'>
            <div className='w-full relative flex justify-center items-center'>
              <div className='cursor-pointer flex justify-center items-center bg-[#009883] rounded-full absolute  right-3 h-[30px] w-[30px] top-[28%]'>
                <p
                  style={{
                    backgroundImage: "url('/images/send.svg')"
                  }}
                  className=' bg-center bg-cover h-[12px] w-[10px] flex justify-center items-center'
                ></p>
              </div>
              <input
                placeholder='Post an update...'
                className='mt-2 bg-[#22403F] w-full p-3 rounded-lg text-xs outline-none'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
