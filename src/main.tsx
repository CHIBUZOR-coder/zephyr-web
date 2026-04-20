import { Buffer } from 'buffer'
window.Buffer = Buffer

import { lazy, StrictMode, Suspense } from 'react'

import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './core/query/reactQuery.ts'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { WalletProviders } from './features/wallet/WalletProviders.tsx'
// import AuthGuard from './features/auth/auth.guard.tsx'
import Loader from './shared/Loader.tsx'
import { GeneralProvider } from './Context/GeneralContext.tsx'
import VisitorProfile from './Pages/Visistorview/VisitorProfile.tsx'
import How from './Pages/How_it_works/How.tsx'

// import DashboardView from './features/dashboard/dashboardComponents/sidenavPages/DashboardView/DashboardView.tsx'

// import { SignInPage } from './features/auth/SignInPage.tsx'

// Lazy-loaded pages
// const HomePage = lazy(() => import('./features/home/HomePage.tsx'))
const WalletPage = lazy(() => import('./features/wallet/WalletPage.tsx'))

// const SignInPage = lazy(()=> import('./features/auth/SignInPage.tsx'))

// const SignInPage= lazy(() => import('./features/auth/SignInPage.tsx'))
// const SignInPage = lazy(()=> import('./features/auth/SignInPage.tsx'))
const DashboardView = lazy(
  () =>
    import(
      './features/dashboard/dashboardComponents/sidenavPages/DashboardView/DashboardView.tsx'
    )
)
const Leaderboard = lazy(
  () =>
    import(
      './features/dashboard/dashboardComponents/sidenavPages/Leaderboard/Leaderboard.tsx'
    )
)
const Portfolio = lazy(
  () =>
    import(
      './features/dashboard/dashboardComponents/sidenavPages/Portfolio/Portfolio.tsx'
    )
)
const LiveTrade = lazy(
  () =>
    import(
      './features/dashboard/dashboardComponents/sidenavPages/Livetrade/LiveTrade.tsx'
    )
)
const SettingsPage = lazy(
  () =>
    import(
      './features/dashboard/dashboardComponents/sidenavPages/Settings/SettingsPage.tsx'
    )
)
const Support = lazy(
  () =>
    import(
      './features/dashboard/dashboardComponents/sidenavPages/Support/Support.tsx'
    )
)
const Docs = lazy(
  () =>
    import(
      './features/dashboard/dashboardComponents/sidenavPages/Docs/Docs.tsx'
    )
)

const Profile = lazy(() => import('./Pages/Profile.tsx'))
const router = createBrowserRouter([
  {
    element: <App />,
    path: '/',
    children: [
      // { index: true, element: <HomePage /> },
      { path: 'wallet', element: <WalletPage /> },
      { index: true, element: <DashboardView /> },
      { path: '/leaderboard', element: <Leaderboard /> },
      { path: '/portfolio', element: <Portfolio /> },
      { path: '/livetrade', element: <LiveTrade /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/support', element: <Support /> },
      { path: '/docs', element: <Docs /> },
      { path: '/profile', element: <Profile /> },
      { path: '/profile/:address', element: <VisitorProfile /> },
      { path: '/how_it_works', element: <How /> }
      // { index: true, element: <Dashboard /> },

      // 🔐 PROTECTED ROUTES
      // {
      //   element: <AuthGuard />,
      //   children: [{ path: 'vaults/create', element: <VaultPage /> }]
      // }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GeneralProvider>
      <WalletProviders>
        <Suspense fallback={<Loader />}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </Suspense>
      </WalletProviders>
    </GeneralProvider>
  </StrictMode>
)
