import Layout from '../../shared/Layout/Layout'
import TopTradersTable from './TopTradersTablee'
import { HiShieldCheck } from 'react-icons/hi2'

// import TraderProfilePage from '../trader/TraderProfilePage'

const HomePage = () => {
  return (
    <Layout>
      <div className='min-h-screen py-6'>
        {/****HERO SECTION*****/}
        <div className='Hero bg-gradient-to-tr from-black to-herolight py-5 w-full flex flex-col lg:flex-row justify-center items-center px-3 md:px-[120px] gap-10 md:gap-[100px] lg:gap-[60px] '>
          {/* child1 */}
          <div className='herochild flex flex-col gap-5'>
            <div
              className='flex items-center gap-2 animate-pulse
'
            >
              <div className='w-2 h-2 bg-emerald-500 rounded-full ' />
              <span className='text-xs uppercase font-mono tracking-tighter text-emerald-500'>
                LIVE ON SOLANA MAINNET
              </span>
            </div>
            <p className='font-[900] text-[30px] md:text-[60px]  text-white  text-start leading-[0.5] '>
              On-chain social
            </p>
            <div>
              <p
                className='font-[900] text-[30px] md:text-[60px]
 text-start text-transparent bg-gradient-to-tr from-textshade to-textshade2 bg-clip-text'
              >
                copy trading
              </p>
            </div>
            <p className='text-[18px] text-[#577884] font-[400]'>
              Experience the future of DeFi with secure, transparent, and
              non-custodial copy trading. Professional risk controls enforced by
              smart contracts.
            </p>
            <div className='flex justify-between gap-4 mt-4 w-full flex-col md:flex-row'>
              <button className='bg-btnprimary text-btnsecondary px-6 py-3 rounded-lg  font-[600] hover:scale-105 transition-transform duration-200 w-full md:w-[40%]'>
                Launch App
              </button>
              <button className='bg-btnprimary text-btnsecondary px-6 py-3 rounded-lg  font-[600] hover:scale-105 transition-transform duration-200 w-full md:w-[60%]'>
                View Top Traders
              </button>
            </div>
            <div className='flex items-center  justify-start w-[80%] md:w-[60%] gap-0 md:gap-4'>
              <div className='flex w-[30%] relative fan min-h-10   justify-center items-center'>
                <div className='smallcircl bg-circle1 left-0'>TV</div>
                <div className='smallcircl bg-circle2 left-7'>JD</div>
                <div className='smallcircl bg-circle3 left-14'>AS</div>
              </div>

              <div className='w-[70%] min-h-10 flex flex-col justify-center items-center '>
                <p className='text-[#577884] text-[13.125px] font-[500]'>
                  Join 2,400+ active traders
                </p>
              </div>
            </div>
          </div>
          {/* child2 */}
          <div className='herochild h-[386px] '>
            <div className='rounded-md overflow-hidden p-4 h-full w-full border-[1px] border-textshade'>
              <div className="rounded-md img bg-[url('/images/dash.png')] h-full w-full bg-cover bg-center overflow-hidden "></div>
            </div>
          </div>
        </div>
        {/* ******* */}
        {/****STATS SECTION*****/}
        <div className='stats  grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 items-center text-white px-3 md:px-[120px] mt-24 py-4'>
          <div className='num'>
            <p>
              $142M <span>+</span>
            </p>
            <p className='label'>Trading Volume</p>
          </div>

          <div className='num'>
            <p>
              45k <span>+</span>
            </p>
            <p className='label'>Total Trades</p>
          </div>
          <div className='num'>
            <p>
              12<span>s</span>
            </p>
            <p className='label'>Avg Execution</p>
          </div>
          <div className='num'>
            <p>
              0%<span>s</span>
            </p>
            <p className='label'>Custody Risk</p>
          </div>
        </div>
        {/* ******* */}
        {/****CONTAINER1*****/}
        <div className='container1 flex flex-col justify-center items-center px-3 md:px-[120px] mt-24  '>
          <p className='text-center font-jebrains tracking-[1.169px] font-jetbrains uppercase text-[#00A991]'>
            The ZEPHYR Process
          </p>

          <p className='font-[900] text-[38px] lg:text-[45px] text-white text-center md:text-start'>
            Start mirroring in 3 steps
          </p>
        </div>
        {/* ******* */}
        {/****CONTAINER2*****/}
        <div className='container2 grid grid-cols-1  lg:grid-cols-3 gap-5 px-3 md:px-[120px] mt-24 justify-center items-center justify-items-center'>
          <div className='box '>
            <div className='boximgcon'>
              <p className="boximg bg-[url('/images/icon.svg')] "></p>
            </div>
            <div className='boxtextcon '>
              <p className='numero'>1</p>
              <p className='boxtext'>Connect</p>
            </div>

            <p className='boxinfo'>
              Securely link your Phantom or Solflare wallet. You maintain 100%
              control over your private keys at all times.
            </p>
          </div>
          <div className='box '>
            <div className='boximgcon'>
              <p className="boximg bg-[url('/images/person.svg')] "></p>
            </div>
            <div className='boxtextcon '>
              <p className='numero'>2</p>
              <p className='boxtext'>Choose</p>
            </div>

            <p className='boxinfo'>
              Securely link your Phantom or Solflare wallet. You maintain 100%
              control over your private keys at all times.
            </p>
          </div>
          <div className='box '>
            <div className='boximgcon'>
              <p className="boximg bg-[url('/images/sheild.svg')] "></p>
            </div>
            <div className='boxtextcon '>
              <p className='numero'>3</p>
              <p className='boxtext'>Set Risk</p>
            </div>

            <p className='boxinfo'>
              Securely link your Phantom or Solflare wallet. You maintain 100%
              control over your private keys at all times.
            </p>
          </div>
        </div>
        {/****CONTAINER2 DONE*****/}
        {/* ******* */}
        {/* ******Table******** */}
        <div className='px-3 md:px-[120px]'>
          <TopTradersTable />
        </div>
        {/* ******* */}
        {/* ******Why Trade******** */};
        <section className='relative px-3 md:px-[120px]  text-white py-24 '>
          <div className='max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center'>
            {/* LEFT CONTENT */}
            <div>
              <h2 className='text-4xl md:text-5xl font-bold leading-tight mb-6'>
                Why traders trust <br /> Zephyr
              </h2>

              <p className='text-gray-400 max-w-xl mb-10'>
                Built for security and transparency on the world’s fastest
                blockchain. We prioritize your safety above all else.
              </p>

              <div className='space-y-8'>
                {/* Item */}
                <div className='flex gap-4 '>
                  <div className='imgcirclecon'>
                    <p className="imgcircle bg-[url('/images/key.svg')]"></p>
                  </div>
                  <div className='trust'>
                    <h4 className='font-semibold mb-1'>Non-custodial Vaults</h4>
                    <p className='text-gray-400 text-sm leading-relaxed'>
                      Your funds never leave your control. Zephyr utilizes
                      program-derived addresses that only follow your
                      pre-authorized risk parameters.
                    </p>
                  </div>
                </div>

                <div className='flex gap-4'>
                  <div className='imgcirclecon'>
                    <p className="imgcircle bg-[url('/images/data.svg')]"></p>
                  </div>
                  <div className='trust'>
                    <h4 className='font-semibold mb-1'>
                      Immutable Performance History
                    </h4>
                    <p className='text-gray-400 text-sm leading-relaxed'>
                      No fake stats. Every trade, profit, and loss is pulled
                      directly from the Solana ledger, ensuring total
                      transparency.
                    </p>
                  </div>
                </div>

                <div className='flex gap-4'>
                  <div className='imgcirclecon'>
                    <p className="imgcircle bg-[url('/images/padlock.svg')]"></p>
                  </div>
                  <div className='trust'>
                    <h4 className='font-semibold mb-1'>
                      Enforced Risk Controls
                    </h4>
                    <p className='text-gray-400 text-sm leading-relaxed'>
                      Traders cannot bypass your safety limits. If a trade
                      violates your max drawdown setting, the contract rejects
                      the transaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div>
              <div className='bg-gradient-to-br from-[#0c1a1a] to-[#071010] border border-white/10 rounded-2xl p-8 shadow-white-glow'>
                <div className='flex items-center justify-between mb-8'>
                  <h4 className='font-semibold'>Safety Dashboard</h4>
                  <span className='text-xs font-medium bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full'>
                    ACTIVE GUARD
                  </span>
                </div>

                <div className='space-y-6'>
                  <div>
                    <div className='flex justify-between  text-sm mb-2'>
                      <span className='text-gray-400'>Daily Max Loss</span>
                      <span>5.0%</span>
                    </div>
                    <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                      <div className='h-full w-[65%] bg-teal-400 rounded-full' />
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span className='text-gray-400'>Account Drawdown</span>
                      <span>12.4%</span>
                    </div>
                    <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                      <div className='h-full w-[40%] bg-teal-400 rounded-full' />
                    </div>
                  </div>
                </div>

                <div className='mt-8 flex gap-3 bg-black/40 border border-white/10 rounded-xl p-4'>
                  <HiShieldCheck className='h-5 w-5 text-teal-400' />
                  <p className='text-xs text-gray-400 leading-relaxed'>
                    All risk parameters are stored and verified on-chain via
                    Zephyr Core contracts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ******* */};
        <section className=' py-24  px-3 md:px-[120px]'>
          <div className='max-w-6xl mx-auto'>
            <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e3d3a] via-[#147b6e] to-[#1aa38f] px-10 py-20 text-center shadow-2xl'>
              {/* Heading */}
              <h1 className='text-white text-4xl md:text-6xl font-extrabold leading-tight'>
                Ready to trade with <br className='hidden md:block' />
                the best?
              </h1>

              {/* Subtext */}
              <p className='mt-6 max-w-2xl mx-auto text-white/80 text-base md:text-lg'>
                Connect your wallet and start following expert strategies today
                with professional-grade risk management.
              </p>

              {/* Buttons */}
              <div className='mt-10 flex flex-col sm:flex-row gap-4 justify-center'>
                <button className='bg-white text-emerald-700 font-semibold px-8 py-4 rounded-xl shadow-md hover:scale-105 transition-transform'>
                  Launch Application
                </button>

                <button className='bg-emerald-900/60 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 hover:bg-emerald-900 transition'>
                  Read Docs
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default HomePage
