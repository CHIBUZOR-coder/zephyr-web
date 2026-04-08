import { useState } from 'react'
import { BiChevronDown } from 'react-icons/bi'
// import { FaWarehouse } from 'react-icons/fa'
// import { GiCheckedShield } from 'react-icons/gi'
import { LuMessagesSquare } from 'react-icons/lu'
import { MdMessage } from 'react-icons/md'

type FAQ = {
  question: string
  answer: string
}

// const knowledge = [
//   {
//     title: 'Vault Security',
//     text: 'Multi-sig escrow and institutional custody',
//     icon: <GiCheckedShield className='w-[32px] h-[48px] text-[#009883]' />
//   },
//   {
//     title: 'Risk Management',
//     text: 'Position sizing and drawdown controls',
//     icon: <FaWarehouse className='w-[32px] h-[48px] text-[#009883]' />
//   },
//   {
//     title: 'Performance Metrics',
//     text: 'Understanding PNL and analytics',
//     icon: <BiNetworkChart className='w-[32px] h-[48px] text-[#009883]' />
//   }
// ]

const faqData: FAQ[] = [
  {
    question: 'How does copy trading work on Zephyr?',
    answer:
      "Copy trading allows you to automatically replicate the trades of experienced traders. When you create a vault and allocate funds, our smart contract mirrors the trader's positions in real-time while respecting your configured risk parameters."
  },
  {
    question: 'Are my funds safe? Who has custody?',
    answer:
      "Zephyr is completely non-custodial. Your funds remain in your wallet at all times, secured by audited smart contracts. Neither the platform nor the trader you're copying can withdraw your funds - only you control your assets."
  },
  {
    question: 'What fees do I pay when copy trading?',
    answer:
      'You pay a performance fee only on profitable trades, enforced by high-water mark rules. This means fees are only charged when your vault reaches new profit highs. There are no monthly subscription fees or platform fees - you only pay when you profit.'
  },
  {
    question: 'Can I stop copying a trader at any time?',
    answer:
      'Yes, you have full control. You can pause copying, close all positions, or withdraw your funds at any time. There are no lock-up periods or minimum commitment requirements.'
  },
  {
    question: "What's the difference between max drawdown and stop loss?",
    answer:
      "Max Vault Drawdown is a safety limit that stops all trading if your total vault equity drops by the specified percentage. Stop Loss Override applies to individual positions and overrides the trader's stop loss with your own conservative limit."
  },
  {
    question: 'How do I choose the right trader to copy?',
    answer:
      "Review each trader's 30-day PNL, win rate, maximum drawdown, and trading strategy. Look for consistent performance rather than just high returns. Diversifying across multiple traders with different strategies can help manage risk."
  },
  {
    question: 'What happens if a trader makes a bad trade?',
    answer:
      "Your risk parameters protect you. If a trade hits your configured stop loss or if total losses approach your max drawdown limit, positions will be automatically closed. You're never exposed to more risk than you've explicitly configured."
  },
  {
    question: 'Can I adjust my risk settings after creating a vault?',
    answer:
      'Yes, you can modify your risk parameters including max drawdown, trade size limits, and slippage tolerance at any time. Changes take effect immediately for new trades, while existing positions continue with their original parameters.'
  }
]

export default function Support () {
  const [open, setOpen] = useState<number | null>(null)
  

  return (
    <div className='bg-supportBg min-h-screen text-supportText font-inter px-6 py-12'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <h1 className='text-[30px] font-[900] leading-[72px] uppercase text-white mb-2'>
          SUPPORT CENTER
        </h1>

        <p className='text-[14px] md:text-[18px] text-[#89ada8] mb-6 font-[400]'>
          Access institutional-grade assistance, key trading resources, and
          account management guidance.
        </p>

        {/* Search */}
        <div className='mb-10'>
          <input
            type='text'
            placeholder='Search articles, guides, and common issues...'
            className='w-full bg-supportCard border border-supportBorder rounded-lg px-4 py-3 text-sm outline-none focus:border-supportAccent'
          />
        </div>

        {/* FAQ */}
        <div className='mb-12'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-sm tracking-wider text-gray-400 font-[900]'>
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <span className='text-xs text-gray-500'>8 QUESTIONS</span>
          </div>

          <div className='space-y-3'>
            {faqData.map((faq, index) => {
              const isOpen = open === index

              return (
                <div
                  key={index}
                  className='bg-supportCard border border-supportBorder rounded-lg overflow-hidden'
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : index)}
                    className='w-full flex justify-between items-center px-4 py-4 text-left hover:bg-[#0f1e1e] transition'
                  >
                    <span className='text-sm text-[16px] font-[600] leading-[24px] text-white'>
                      {faq.question}
                    </span>

                    <BiChevronDown
                      size={18}
                      className={`transition ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className='px-4 pb-4 text-sm text-[#89ada8] font-[400] flex flex-col gap-4 mt-4'>
                      <p className='h-[1px] bg-[#23483b] w-full'></p>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact + Community */}
        <div className='grid md:grid-cols-2 gap-10 md:gap-8 mb-12'>
          {/* Contact Support */}
          <div>
            <h3 className='text-white font-[900] text-[24px] lg:text-[30px]  mb-2'>
              CONTACT SUPPORT
            </h3>

            <div className='space-y-3'>
              <div className='bg-supportCard border border-supportBorder rounded-lg p-4 flex justify-between items-center'>
                <div className='flex items-center gap-3'>
                  <span>
                    <MdMessage className='w-[28px] h-[42px] text-[#009883]' />
                  </span>
                  <div>
                    <p className='text-[16px] font-[600] text-white'>
                      Live Multi-Brand Chat
                    </p>
                    <p className='text-xs text-gray-400 text-[12px] leading-[18px] font-[400] '>
                      AVERAGE WAIT: 2 MIN
                    </p>
                  </div>
                </div>

                <button
                  className='bg-[#009883n dev
                ] text-white text-[14px] font-[600] text-xs px-4 py-2 rounded-md leading-[21px] bg-[#009883] '
                >
                  START CHAT
                </button>
              </div>

              <div className='bg-supportCard border border-supportBorder rounded-lg p-4 flex justify-between items-center'>
                <div>
                  <p className='text-sm text-white'>Email Support</p>
                  <p className='text-xs text-gray-400'>24 hour response</p>
                </div>

                <button className='border border-[#009883] text-[#009883] text-[14px] font-[600] px-4 py-2 rounded-md hover:bg-[#0f1e1e]'>
                  SEND EMAIL
                </button>
              </div>
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className='text-white font-[900] text-[24px] lg:text-[30px]  mb-2'>
              COMMUNITY
            </h3>

            <div className='bg-supportCard border border-supportBorder rounded-lg p-6'>
              <div className='flex items-center gap-3'>
                <span>
                  <LuMessagesSquare className='w-[28px] h-[42px] text-[#5865F2]' />
                </span>

                <div>
                  <p className='text-sm text-white mb-2'>
                    Join the Community Discord
                  </p>

                  <p className='text-xs text-gray-400 mb-5'>
                    Connect with traders, get platform updates, and share
                    strategies
                  </p>
                </div>
              </div>

              <button className='w-full text-white bg-[#5865F2] hover:bg-indigo-600 transition text-sm py-3 rounded-md font-medium'>
                JOIN DISCORD
              </button>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div>
          {/* <div className='flex justify-between mb-4'>
            <h3 className='text-sm text-white text-[24px] font-[900]'>
              KNOWLEDGE BASE
            </h3>

            <button className='text-xs text-[#009883]'>
              View all articles →
            </button>
          </div> */}

          {/* <div className='grid md:grid-cols-3 gap-4'>
            {knowledge.map((item, i) => (
              <div
                key={i}
                className='bg-[#102221] border-[1.3px] border-[#23483b] rounded-lg p-5 hover:bg-[#0f1e1e] cursor-pointer transition'
              >
                <span>{item.icon}</span>
                <div>
                  <p className='text-white text-sm mb-1'>{item.title}</p>

                  <p className='text-xs text-gray-400'>
                    Learn more about {item.text.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Security Notice */}
        <div className='mt-10 bg-yellow-900/20 border border-[#EAB308] rounded-lg p-4 text-[14px] text-yel flex justify-center item-center gap-2'>
          <p className='text-[24px] flex items-center justify-center'>⚠️</p>
          <div className='flex flex-col gap-2'>
            <p className='text-[#EAB308] font-[700] text-[16px] leading-[24px]'>
              Security Protocol Reminder
            </p>
            <p>
              Security Reminder: Never share private keys, passwords, or
              recovery phrases with anyone. Official Discord administrators will
              never ask for this information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
