import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { localNow } from '@/lib/local-time'

import { usePublishSlots } from '../api/use-slots'
import { publishSlotsSchema, slotLengths } from './publish-slots-schema'

// Looks like the Input component, for the native select.
const selectClassName =
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base tabular-nums shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-background'

const plural = (n: number) => (n === 1 ? 'time slot' : 'time slots')

function resultMessage(created: number, skipped: number) {
  if (created === 0) return 'Nothing new to publish: these times are already published or have passed.'
  const skippedNote = skipped > 0 ? ` Skipped ${skipped} that overlap published slots or have passed.` : ''
  return `Published ${created} ${plural(created)}.${skippedNote}`
}

type PublishSlotsFormProps = {
  businessId: number
  // Called with the day that was published, e.g. to show it in the schedule.
  onPublished?: (date: string) => void
}

// One day at a time: a time range cut into back-to-back free slots of one length.
export function PublishSlotsForm({ businessId, onPublished }: PublishSlotsFormProps) {
  const id = useId()
  const publish = usePublishSlots()
  const [message, setMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(publishSlotsSchema),
    // Checked on submit, then on every change: an error appearing on blur would push the
    // submit button down mid-click, so the click would miss it.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    // slotLengths[1] is 30 min, typed as one of the offered lengths.
    defaultValues: { date: localNow().slice(0, 10), from: '09:00', to: '17:00', slotMinutes: slotLengths[1] },
  })

  const submit = handleSubmit((values) => {
    setMessage('')
    publish.mutate(
      { businessId, ...values },
      {
        onSuccess: ({ created, skipped }) => {
          setMessage(resultMessage(created.length, skipped))
          onPublished?.(values.date)
        },
      },
    )
  })

  const field = (name: 'date' | 'from' | 'to' | 'slotMinutes') => ({
    id: `${id}-${name}`,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined,
  })

  const error = (name: 'date' | 'from' | 'to' | 'slotMinutes') =>
    errors[name] && (
      <p id={`${id}-${name}-error`} className="text-sm text-destructive">
        {errors[name].message}
      </p>
    )

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4 rounded-lg border p-4">
      <h2 className="text-xl font-semibold">Publish free times</h2>
      <div className="grid grid-cols-2 items-start gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <div className="col-span-2 flex flex-col gap-2 lg:col-span-1">
          <Label htmlFor={`${id}-date`}>Day</Label>
          <Input
            type="date"
            min={localNow().slice(0, 10)}
            className="tabular-nums"
            {...field('date')}
            {...register('date')}
          />
          {error('date')}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-from`}>From</Label>
          <Input type="time" className="tabular-nums" {...field('from')} {...register('from')} />
          {error('from')}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-to`}>To</Label>
          <Input type="time" className="tabular-nums" {...field('to')} {...register('to')} />
          {error('to')}
        </div>
        <div className="col-span-2 flex flex-col gap-2 lg:col-span-1">
          <Label htmlFor={`${id}-slotMinutes`}>Slot length</Label>
          <select className={selectClassName} {...field('slotMinutes')} {...register('slotMinutes')}>
            {slotLengths.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} min
              </option>
            ))}
          </select>
          {error('slotMinutes')}
        </div>
        {/* Lines up with the inputs on desktop, under the labels' height. */}
        <Button type="submit" disabled={publish.isPending} className="col-span-2 lg:col-span-1 lg:mt-6">
          <CalendarPlus aria-hidden />
          {publish.isPending ? 'Publishing…' : 'Publish'}
        </Button>
      </div>

      {publish.isError && (
        <p role="alert" className="text-sm text-destructive">
          The time slots could not be published. Please try again.
        </p>
      )}
      <p role="status" className="text-sm font-medium empty:hidden">
        {message}
      </p>
    </form>
  )
}
