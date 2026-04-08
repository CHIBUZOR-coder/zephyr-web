type StateScreenProps = {
  title: string
  description?: string
  tone?: 'info' | 'error' | 'warning'
  action?: React.ReactNode // ✅ ADD THIS
}

// export default function StateScreen ({
//   title,
//   description,
//   tone = 'info',
//   action
// }: StateScreenProps) {
//   return (
//     <div className='min-h-screen relative  items-center justify-center bg-slate-950'>
//       <div className='text-center flex justify-center items-center w-full'>
//         <h1
//           className={`text-2xl font-semibold ${
//             tone === 'error' ? 'text-red-400' : 'text-slate-200'
//           }`}
//         >
//           {title}
//         </h1>

//         {description && <p className='text-white'>{description}</p>}

//         {action && <div className='w-full h-full flex justify-center'>{action}</div>}
//       </div>
//     </div>
//   )
// }


export default function StateScreen ({
  title,
  description,
  tone = 'info',
  action
}: StateScreenProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-950'>
      <div className='text-center flex flex-col items-center gap-4'>
        {title && (
          <h1
            className={`text-2xl font-semibold ${
              tone === 'error' ? 'text-red-400' : 'text-slate-200'
            }`}
          >
            {title}
          </h1>
        )}

        {description && <p className='text-white'>{description}</p>}

        {action}
      </div>
    </div>
  )
}
