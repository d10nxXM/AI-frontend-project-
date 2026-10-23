import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { ClientDetails } from '../types'
import { clientDetailsSchema } from './client-details-schema'
import { forgetClient, loadRememberedClient } from './remembered-client'

type ClientDetailsFormProps = {
  // Called with valid, trimmed details (or undefined while something is missing or wrong) and
  // whether to remember name and phone on this device. Pass a stable function (useCallback).
  onChange: (details: ClientDetails | undefined, remember: boolean) => void
}

// Name, phone and an optional note for the business. Errors show once a field was left.
// Remembering is opt-in: off by default, on only if the client chose it last time.
export function ClientDetailsForm({ onChange }: ClientDetailsFormProps) {
  const id = useId()
  const [remembered] = useState(loadRememberedClient)
  const hadRemembered = Boolean(remembered.clientName || remembered.clientPhone)
  const [remember, setRemember] = useState(hadRemembered)
  const [showClear, setShowClear] = useState(hadRemembered)
  const {
    register,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientDetailsSchema),
    mode: 'onTouched',
    defaultValues: { clientName: '', clientPhone: '', note: '', ...remembered },
  })

  // "Not you?": forget the saved details at once and empty the fields (the note stays).
  function clearRemembered() {
    forgetClient()
    reset({ clientName: '', clientPhone: '', note: getValues('note') })
    setRemember(false)
    setShowClear(false)
  }

  // Report validity on every change, and once for values remembered from last time.
  useEffect(() => {
    const report = (values: unknown) => {
      const result = clientDetailsSchema.safeParse(values)
      onChange(result.success ? result.data : undefined, remember)
    }
    report(getValues())
    const subscription = watch(report)
    return () => subscription.unsubscribe()
  }, [watch, getValues, onChange, remember])

  return (
    <form
      noValidate
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-4 rounded-2xl bg-card p-4"
    >
      {showClear && (
        <p className="text-sm text-muted-foreground">
          Filled in from your last booking on this device.{' '}
          <button
            type="button"
            onClick={clearRemembered}
            className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            Not you? Clear
          </button>
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-name`}>Name</Label>
        <Input
          id={`${id}-name`}
          autoComplete="name"
          aria-invalid={Boolean(errors.clientName)}
          aria-describedby={errors.clientName ? `${id}-name-error` : undefined}
          {...register('clientName')}
        />
        {errors.clientName && (
          <p id={`${id}-name-error`} className="text-sm text-destructive">
            {errors.clientName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-phone`}>Phone</Label>
        <Input
          id={`${id}-phone`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+382 67 123 456"
          aria-invalid={Boolean(errors.clientPhone)}
          aria-describedby={errors.clientPhone ? `${id}-phone-error` : undefined}
          className="tabular-nums"
          {...register('clientPhone')}
        />
        {errors.clientPhone && (
          <p id={`${id}-phone-error`} className="text-sm text-destructive">
            {errors.clientPhone.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-note`}>
          Note for the business <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={`${id}-note`}
          rows={2}
          maxLength={200}
          aria-invalid={Boolean(errors.note)}
          aria-describedby={errors.note ? `${id}-note-error` : undefined}
          {...register('note')}
        />
        {errors.note && (
          <p id={`${id}-note-error`} className="text-sm text-destructive">
            {errors.note.message}
          </p>
        )}
      </div>
      <div className="flex items-start gap-2">
        <input
          id={`${id}-remember`}
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          aria-describedby={`${id}-remember-hint`}
          className="mt-0.5 size-4 shrink-0 accent-foreground"
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${id}-remember`}>Remember my name and phone on this device</Label>
          <span id={`${id}-remember-hint`} className="text-xs text-muted-foreground">
            Saved only in this browser. Leave it off on a shared computer.
          </span>
        </div>
      </div>
    </form>
  )
}
