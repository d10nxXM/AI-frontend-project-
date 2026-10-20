import { XCircle } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import type { Booking } from '../types'
import { formatStartsAt } from './format-starts-at'

type CancelBookingButtonProps = {
  booking: Booking
  pending: boolean
  onConfirm: () => void
}

// Cancelling is destructive, so it asks first and the confirm button is the destructive one.
export function CancelBookingButton({ booking, pending, onConfirm }: CancelBookingButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending}>
          <XCircle aria-hidden />
          Cancel booking
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            {booking.serviceName} at {booking.businessName}, {formatStartsAt(booking.startsAt)}. The time will
            be freed for other clients.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep booking</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            <XCircle aria-hidden />
            Cancel booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
