// src/shared/Navigation/Footer.tsx

const Footer = () => {
  // const currentYear = new Date().getFullYear()

  return (
 <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              {/* Logo placeholder */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
              <h3 className="text-white text-2xl font-bold">Zephyr</h3>
            </div>

            <p className="mt-4 text-sm text-white/60 max-w-sm">
              The premiere destination for social copy trading on Solana.
              Empowering retail traders with institutional-grade risk tools.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest text-white uppercase">
              Platform
            </h4>

            <ul className="mt-4 space-y-3 text-white/60 text-sm">
              <li className="hover:text-white transition">Launch App</li>
              <li className="hover:text-white transition">Top Traders</li>
              <li className="hover:text-white transition">Leaderboard</li>
              <li className="hover:text-white transition">Risk Specs</li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest text-white uppercase">
              Community
            </h4>

            <ul className="mt-4 space-y-3 text-white/60 text-sm">
              <li className="hover:text-white transition">X (Twitter)</li>
              <li className="hover:text-white transition">Discord</li>
              <li className="hover:text-white transition">Documentation</li>
              <li className="hover:text-white transition">Support</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
          <p>© 2026 Zephyr Labs. All rights reserved.</p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-white transition cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-white transition cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
