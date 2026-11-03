import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, UsersRound, ReceiptIndianRupee } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/groups', label: 'Groups', icon: UsersRound },
  { to: '/expenses', label: 'Expenses', icon: ReceiptIndianRupee },
  { to: '/users', label: 'People', icon: Users },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="" className="size-8" />
      <span className="font-display text-xl font-semibold tracking-tight text-ink">SplitEasy</span>
    </div>
  )
}

export default function Layout() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn btn-primary">Skip to content</a>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-dvh border-r border-line bg-surface/70 px-4 py-6">
        <div className="px-2"><Logo /></div>
        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                  isActive ? 'bg-brand-tint text-brand-deep' : 'text-ink-soft hover:bg-canvas hover:text-ink'}`}>
              <Icon className="size-[18px]" aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto px-3 text-xs text-muted leading-relaxed">
          Expenses are split equally among group members. Balances and settlements are calculated by the Spring Boot API.
        </p>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 backdrop-blur px-4 h-14">
        <Logo />
      </div>

      <main id="main" className="px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10 pb-28 lg:pb-12 max-w-6xl w-full">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav aria-label="Main" className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-surface/95 backdrop-blur grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? 'text-brand-deep' : 'text-muted'}`}>
            <Icon className="size-5" aria-hidden /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
