import { useState } from 'react'
import {
  TbLayoutDashboard,
  TbChartCandle,
  TbWallet,
  TbTrophy
} from 'react-icons/tb'
import { NavLink } from 'react-router-dom'

const navItems = [
  {
    name: 'Dashboard',
    icon: TbLayoutDashboard,
    path: '/'
  },
  {
    name: 'Live Trade',
    icon: TbChartCandle,
    path: '/livetrade'
  },
  {
    name: 'Portfolio',
    icon: TbWallet,
    path: '/portfolio'
  },
  {
    name: 'Leaderboard',
    icon: TbTrophy,
    path: '/leaderboard'
  }
]

export default function MobileBottomNav () {
  const [active, setActive] = useState('Dashboard')

  return (
    <div className='lg:hidden w-full  fixed  bottom-4 left-0 z-[30] flex justify-center items-center'>
      <div className=' w-[92%] '>
        {/* container */}
        <div
          className='
      flex justify-between items-center
      px-6 py-3
      rounded-full
      backdrop-blur-[1px]
      bg-[rgba(6,31,28,0.3)]
      border border-[#1B4C46]
      shadow-[0_10px_40px_rgba(0,0,0,0.6)]
      '
        >
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = active === item.name

            return (
              <NavLink
                to={item.path}
                key={item.name}
                onClick={() => setActive(item.name)}
                className='flex flex-col items-center gap-[4px] text-center group'
              >
                {/* icon */}
                <div className='rounded-full backdrop-blur-[70px] bg-white/10   h-12 w-12 flex justify-center items-center'>
                  <Icon
                    size={22}
                    className={`
                transition-colors
                ${isActive ? 'text-gray-200' : 'text-gray-500'}
                `}
                  />
                </div>

                {/* label */}
                <span
                  className={`
                text-[11px]
                font-medium
                leading-none
                  ${isActive ? 'text-gray-200' : 'text-gray-500'}
                `}
                >
                  {item.name}
                </span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}
