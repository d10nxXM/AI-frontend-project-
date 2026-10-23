import { CalendarClock, LayoutDashboard, Scissors, Store } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

import { cn } from '@/lib/utils'

const links = [
  { to: '/owner', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/services', label: 'Services', icon: Scissors },
  { to: '/owner/slots', label: 'Time slots', icon: CalendarClock },
  { to: '/owner/profile', label: 'Profile', icon: Store },
]

// The owner area, laid out like a settings app: a sidebar from lg up, and on smaller screens a
// segmented control over the page. Same links, one element, only the layout changes.
export function OwnerLayout() {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <nav aria-label="Business" className="lg:sticky lg:top-20">
        <p className="hidden px-3 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">
          Your business
        </p>
        <ul className="grid grid-cols-4 gap-1 rounded-full bg-secondary p-1 lg:flex lg:flex-col lg:rounded-2xl lg:bg-card lg:p-2">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/owner'}
                className={({ isActive }) =>
                  cn(
                    'pressable flex h-9 items-center justify-center gap-2 rounded-full px-2 text-[0.8125rem] font-medium sm:px-4 sm:text-sm whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring lg:h-10 lg:justify-start lg:rounded-lg lg:px-3',
                    // Phones: the selected segment is a raised white thumb on the gray track.
                    // Sidebar: the selected row is filled, its icon in the accent.
                    isActive &&
                      'font-semibold text-foreground max-lg:bg-card max-lg:shadow-sm lg:bg-secondary lg:[&>svg]:text-tint dark:max-lg:bg-popover',
                  )
                }
              >
                <Icon aria-hidden className="hidden size-4 shrink-0 lg:block" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
