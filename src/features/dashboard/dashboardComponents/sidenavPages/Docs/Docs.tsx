
import ArticlesGrid from './components/ArticlesGrid'
import DocsCategories from './components/DocsCategories'
import DocsDifficulty from './components/DocsDifficulty'
import DocsHeader from './components/DocsHeader'
import DocsSearch from './components/DocsSearch'
import DocsStats from './components/DocsStats'

import NeedHelpSection from './components/NeedHelpSection'


export default function Docs () {

  return (
    <div className='bg-docsBg min-h-screen text-white font-inter px-6 py-10 mb-60 lg:mb-0'>
      <div className='max-w-7xl mx-auto space-y-8'>
        <DocsHeader />

        <DocsSearch />

        <DocsCategories   />

        <DocsDifficulty  />

        <DocsStats />

        <ArticlesGrid  />

        <NeedHelpSection />
      </div>
    </div>
  )
}
