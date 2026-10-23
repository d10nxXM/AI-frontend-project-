import { BriefcaseBusiness, CalendarDays, House, Store } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home', icon: House },
  { to: '/businesses', label: 'Businesses', icon: Store },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/owner', label: 'For business', icon: BriefcaseBusiness },
]

// Glass chrome over the content: a top bar everywhere, and on phones a floating tab bar at the
// bottom, within thumb reach. Only one set of links exists at a time (the other is display: none).
export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <header className="glass scroll-edge sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          {/* Neutral, not red: red is saved for the main action on a screen. */}
          <Link
            to="/"
            className="pressable rounded-md font-heading text-lg font-bold tracking-[-0.02em] whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            Zakazi.me
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1 text-sm">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'pressable block rounded-full px-4 py-2 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring',
                        isActive && 'bg-secondary font-semibold text-foreground',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-[calc(var(--tab-bar-space)+2rem)] md:pt-8 md:pb-16">
        <Outlet />
      </main>

      <nav
        aria-label="Main"
        className="glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 rounded-full border border-border/60 shadow-lg md:hidden"
      >
        <ul className="grid h-16 grid-cols-4 p-1">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'pressable flex flex-1 flex-col items-center justify-center gap-1 rounded-full text-[0.6875rem] leading-none font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring',
                    // The selected tab is the one place the accent marks status, next to its label.
                    isActive && 'bg-secondary font-semibold text-tint',
                  )
                }
              >
                <Icon aria-hidden className="size-5" />
                <span className="max-w-full truncate px-1">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
