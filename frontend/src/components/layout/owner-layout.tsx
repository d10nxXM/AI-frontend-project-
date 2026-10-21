import { NavLink, Outlet } from 'react-router'

import { cn } from '@/lib/utils'

const links = [
  { to: '/owner', label: 'Dashboard' },
  { to: '/owner/services', label: 'Services' },
  { to: '/owner/slots', label: 'Time slots' },
  { to: '/owner/profile', label: 'Profile' },
]

// The owner area: a second row of navigation above each owner page.
export function OwnerLayout() {
  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Business" className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0">
        <ul className="flex gap-6 text-sm">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/owner'}
                className={({ isActive }) =>
                  cn(
                    'inline-block rounded-sm border-b-2 border-transparent pb-3 whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring',
                    isActive && 'border-foreground font-semibold text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </div>
  )
}
