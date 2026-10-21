import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { Service } from '../types'
import { type ServiceFormValues, serviceSchema } from './service-schema'

export type ServiceInput = z.output<typeof serviceSchema>

type ServiceFormProps = {
  // The service being edited; without it the form adds a new one.
  service?: Service
  pending: boolean
  onSubmit: (values: ServiceInput) => void
  onCancel: () => void
}

// Name, description, price and duration of one service. Errors show after the first submit.
export function ServiceForm({ service, pending, onSubmit, onCancel }: ServiceFormProps) {
  const id = useId()
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<ServiceFormValues, unknown, ServiceInput>({
    resolver: zodResolver(serviceSchema),
    // Checked on submit, then on every change: an error appearing on blur would push the
    // submit button down mid-click, so the click would miss it.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name: service?.name ?? '',
      description: service?.description ?? '',
      price: service ? String(service.price) : '',
      durationMinutes: service ? String(service.durationMinutes) : '',
    },
  })

  // The form replaces the button that opened it, so focus moves into it.
  useEffect(() => setFocus('name'), [setFocus])

  const errorId = (field: keyof ServiceFormValues) => (errors[field] ? `${id}-${field}-error` : undefined)
  const errorText = (field: keyof ServiceFormValues) =>
    errors[field] && (
      <p id={`${id}-${field}-error`} className="text-sm text-destructive">
        {errors[field].message}
      </p>
    )

  return (
    <form
      noValidate
      aria-label={service ? `Edit ${service.name}` : 'New service'}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 p-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-name`}>Name</Label>
        <Input
          id={`${id}-name`}
          maxLength={80}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errorId('name')}
          {...register('name')}
        />
        {errorText('name')}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-description`}>Description</Label>
        <Textarea
          id={`${id}-description`}
          rows={2}
          maxLength={500}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errorId('description')}
          {...register('description')}
        />
        {errorText('description')}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-price`}>Price (€)</Label>
          <Input
            id={`${id}-price`}
            inputMode="decimal"
            placeholder="e.g. 25"
            className="tabular-nums"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errorId('price')}
            {...register('price')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-durationMinutes`}>Duration (min)</Label>
          <Input
            id={`${id}-durationMinutes`}
            inputMode="numeric"
            placeholder="e.g. 60"
            className="tabular-nums"
            aria-invalid={Boolean(errors.durationMinutes)}
            aria-describedby={errorId('durationMinutes')}
            {...register('durationMinutes')}
          />
        </div>
      </div>
      {/* Under both fields, so a long message does not squeeze the half-width columns. */}
      {errorText('price')}
      {errorText('durationMinutes')}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {service ? 'Save changes' : 'Add service'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
