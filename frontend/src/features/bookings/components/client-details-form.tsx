import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { ClientDetails } from '../types'
import { clientDetailsSchema } from './client-details-schema'
import { loadRememberedClient } from './remembered-client'

type ClientDetailsFormProps = {
  // Called with valid, trimmed details, or undefined while something is missing or wrong.
  onChange: (details: ClientDetails | undefined) => void
}

// Name, phone and an optional note for the business. Errors show once a field was left.
export function ClientDetailsForm({ onChange }: ClientDetailsFormProps) {
  const id = useId()
  const {
    register,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientDetailsSchema),
    mode: 'onTouched',
    defaultValues: { clientName: '', clientPhone: '', note: '', ...loadRememberedClient() },
  })

  // Report validity on every change, and once for values remembered from last time.
  useEffect(() => {
    const report = (values: unknown) => {
      const result = clientDetailsSchema.safeParse(values)
      onChange(result.success ? result.data : undefined)
    }
    report(getValues())
    const subscription = watch(report)
    return () => subscription.unsubscribe()
  }, [watch, getValues, onChange])

  return (
    <form
      noValidate
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-4 rounded-lg border p-4"
    >
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
    </form>
  )
}
