import { createBrowserRouter } from 'react-router'

import { BookingDetail } from '@/app/routes/booking-detail'
import { Bookings } from '@/app/routes/bookings'
import { BusinessDetail } from '@/app/routes/business-detail'
import { Businesses } from '@/app/routes/businesses'
import { Home } from '@/app/routes/home'
import { NotFound } from '@/app/routes/not-found'
import { OwnerDashboard } from '@/app/routes/owner-dashboard'
import { OwnerProfile } from '@/app/routes/owner-profile'
import { OwnerServices } from '@/app/routes/owner-services'
import { OwnerSlots } from '@/app/routes/owner-slots'
import { AppLayout } from '@/components/layout/app-layout'
import { OwnerLayout } from '@/components/layout/owner-layout'

// basename comes from Vite's `base`: '/' locally, '/<repo>/' on GitHub Pages.
export const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/businesses', element: <Businesses /> },
        { path: '/businesses/:id', element: <BusinessDetail /> },
        { path: '/bookings', element: <Bookings /> },
        { path: '/bookings/:id', element: <BookingDetail /> },
        {
          path: '/owner',
          element: <OwnerLayout />,
          children: [
            { index: true, element: <OwnerDashboard /> },
            { path: 'services', element: <OwnerServices /> },
            { path: 'slots', element: <OwnerSlots /> },
            { path: 'profile', element: <OwnerProfile /> },
          ],
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
