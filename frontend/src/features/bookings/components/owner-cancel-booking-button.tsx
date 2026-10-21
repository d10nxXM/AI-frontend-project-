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

type OwnerCancelBookingButtonProps = {
  booking: Booking
  pending: boolean
  onConfirm: () => void
}

// The owner's cancel: same confirm-first pattern as the client's, worded for the business.
export function OwnerCancelBookingButton({ booking, pending, onConfirm }: OwnerCancelBookingButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          aria-label={`Cancel booking of ${booking.clientName}, ${formatStartsAt(booking.startsAt)}`}
        >
          <XCircle aria-hidden />
          Cancel booking
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            {booking.clientName} will lose {booking.serviceName} on {formatStartsAt(booking.startsAt)}. Let
            them know by phone. The time will be free for other clients again.
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
