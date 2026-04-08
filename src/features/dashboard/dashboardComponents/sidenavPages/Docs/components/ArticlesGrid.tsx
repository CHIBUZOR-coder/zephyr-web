
import ArticleCard from './ArticleCard'
import { useGeneralContext } from '../../../../../../Context/GeneralContext'

// const articles = new Array(12).fill(0).map((_, i) => ({
//   title: 'Quick Start Guide',
//   description:
//     'Learn how to set up your account and start trading within minutes.',
//   readTime: '5 min read',
//   tag: 'GUIDE'
// }))

export default function ArticlesGrid () {
  const articles = [
    {
      id: 1,
      level: 'Beginner',
      icon: '/images/ship.svg',
      label: 'Getting Started',
      sub: 'Quick Start Guide',
      info: 'Get started with Zephyr in under 5 minutes. Connect your wallet, verify identity, and make your first copy trade.',
      time: '5 min read'
    },
    {
      id: 2,
      level: 'Beginner',
      icon: '/images/ship.svg',
      label: 'Getting Started',
      sub: 'Account Setup & Verification',
      info: 'Complete KYC verification, enable 2FA, and configure security settings for institutional-grade account protection.',
      time: '8 min read'
    },
    {
      id: 3,
      level: 'Beginner',
      icon: '/images/people.svg',
      label: 'Understanding Copy Trading',
      sub: 'Understanding Copy Trading',
      info: 'Learn how copy trading works on Zephyr, from selecting masters to managing allocation and risk parameters.',
      time: '12 min read'
    },
    {
      id: 4,
      level: 'Beginner',
      icon: '/images/sheild.svg',
      label: 'Vault Security',
      sub: 'Emergency Withdrawal Procedures',
      info: 'Step-by-step guide for emergency situations including circuit breakers and instant position exits.',
      time: '7 min read'
    },
    {
      id: 5,
      level: 'Beginner',
      icon: '/images/docwall.svg',
      label: 'Transfers',
      sub: 'Deposit Methods & Limits',
      info: 'Available deposit methods, processing times, minimum/maximum limits, and fee structures.',
      time: '6 min read'
    },
    {
      id: 6,
      level: 'Beginner',
      icon: '/images/docwall.svg',
      label: 'Transfers',
      sub: 'Withdrawal Processing',
      info: 'How to withdraw funds, approval workflows, security checks, and settlement timeframes.',
      time: '8 min read'
    },
    {
      id: 7,
      level: 'Intermediate',
      icon: '/images/people.svg',
      label: 'Copy Trading',
      sub: 'Master Selection Criteria',
      info: 'Deep dive into evaluating master traders using Sharpe Ratio, drawdown, consistency, and risk-adjusted metrics.',
      time: '15 min read'
    },
    {
      id: 8,
      level: 'Intermediate',
      icon: '/images/people.svg',
      label: 'Vault Security',
      sub: 'Smart Contract Security',
      info: "How Zephyr's non-custodial smart contracts work, audit reports, and security best practices.",
      time: '10 min read'
    },

    {
      id: 9,
      level: 'Intermediate',
      icon: '/images/round.svg',
      label: 'On-chain',
      sub: 'Reading Transaction History',
      info: 'Navigate Solana explorers, verify transactions, and track on-chain trade execution.',
      time: '10 min read'
    },
    {
      id: 10,
      level: 'Intermediate',
      icon: '/images/round.svg',
      label: 'Fees & Payments',
      sub: 'Performance Fee Calculations',
      info: 'How high-water mark fees work, when fees are charged, and fee distribution mechanics',
      time: '9 min read'
    },
    {
      id: 11,
      level: 'Intermediate',
      icon: '/images/message.svg',
      label: 'Compliance',
      sub: 'Tax Reporting & Compliance',
      info: 'Export transaction history, generate tax reports, and understand regulatory requirements.',
      time: '11 min read'
    },

    {
      id: 12,
      level: 'Intermediate',
      icon: '/images/sheild.svg',
      label: 'Risk Management',
      sub: 'Risk Management Tools',
      info: 'Configure stop-loss, take-profit, position limits, and portfolio-level risk controls',
      time: '13 min read'
    },
    {
      id: 13,
      level: 'Advanced',
      icon: '/images/sheild.svg',
      label: 'Vault Security',
      sub: 'Multi-Signature Vaults',
      info: 'Setup and manage multi-sig vaults for institutional custody with threshold signing and role-based access.',
      time: '20 min read'
    },
    {
      id: 14,
      level: 'Advanced',
      icon: '/images/docwall.svg',
      label: 'On-chain',
      sub: 'Smart Contract Interactions',
      info: 'Understand program accounts, instruction data, and how Zephyr interacts with Solana runtime.',
      time: '14 min read'
    },
    {
      id: 15,
      level: 'Advanced',
      icon: '/images/docwall.svg',
      label: 'Master Trading',
      sub: 'Becoming a Master Trader',
      info: 'Requirements, application process, and best practices for sharing your trading strategy.',
      time: '16 min read'
    },
    {
      id: 16,
      level: 'Advanced',
      icon: '/images/docwall.svg',
      label: 'Developers',
      sub: 'API Integration Guide',
      info: 'Complete API documentation, authentication, endpoints, and code examples for developers.',
      time: '25 min read'
    }
  ]

  const { difficulty, category } = useGeneralContext()

  const filteredArticles = articles.filter(article => {
    const categoryMatch = category === 'All' || article.label === category

    const difficultyMatch = difficulty === 'All' || article.level === difficulty

    return categoryMatch && difficultyMatch
  })

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-sm text-docsMuted tracking-wide'>ALL ARTICLES</h2>

        <span className='text-xs text-docsMuted'>54 Articles</span>
      </div>

      <div
        className='
        grid
        grid-cols-1
        md:grid-cols-2
        2xl:grid-cols-3
        gap-4
      '
      >
        {filteredArticles.map((a, i) => (
          <ArticleCard
            key={i}
            level={a.level}
            label={a.label}
            sub={a.sub}
            info={a.info}
            time={a.time}
            icon={a.icon}
          />
        ))}
      </div>
    </div>
  )
}
