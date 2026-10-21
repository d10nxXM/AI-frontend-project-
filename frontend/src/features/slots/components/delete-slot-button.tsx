import { Trash2 } from 'lucide-react'

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

type DeleteSlotButtonProps = {
  // e.g. "Wed 21 Oct, 09:30"
  label: string
  time: string
  pending: boolean
  onConfirm: () => void
}

// Deleting is destructive, so it asks first and the confirm button is the destructive one.
export function DeleteSlotButton({ label, time, pending, onConfirm }: DeleteSlotButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending} aria-label={`Delete ${time}`}>
          <Trash2 aria-hidden />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this free time?</AlertDialogTitle>
          <AlertDialogDescription>{label}. Clients will no longer be able to book it.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep time</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            <Trash2 aria-hidden />
            Delete time
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
