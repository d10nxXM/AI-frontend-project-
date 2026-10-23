import { Check, Pencil, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useCreateService, useDeleteService, useServices, useUpdateService } from '../api/use-services'
import type { Service } from '../types'
import { DeleteServiceButton } from './delete-service-button'
import { ServiceForm, type ServiceInput } from './service-form'

type ManageServicesProps = {
  businessId: number
}

// The owner's services: add, edit in place and delete, with loading, empty and error states.
// Only one form is open at a time: 'new' for adding, or the id of the service being edited.
export function ManageServices({ businessId }: ManageServicesProps) {
  const { data: services, isLoading, error } = useServices(businessId)
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()
  const [editing, setEditing] = useState<number | 'new'>()
  const [message, setMessage] = useState('')
  // Where focus goes once a form closes, so keyboard users keep their place: the service's
  // Edit button, or "Add service" after adding, cancelling a new one or deleting.
  const returnFocus = useRef<number | 'new'>(undefined)
  const addButton = useRef<HTMLButtonElement>(null)
  const editButtons = useRef(new Map<number, HTMLButtonElement>())

  useEffect(() => {
    const target = returnFocus.current
    if (editing !== undefined || target === undefined) return
    returnFocus.current = undefined
    const button = target === 'new' ? addButton.current : editButtons.current.get(target)
    ;(button ?? addButton.current)?.focus()
  }, [editing, services])

  const close = (target: number | 'new') => {
    returnFocus.current = target
    setEditing(undefined)
  }

  const open = (next: number | 'new') => {
    setEditing(next)
    setMessage('')
    createService.reset()
    updateService.reset()
  }

  const create = (values: ServiceInput) =>
    createService.mutate(
      { ...values, businessId },
      {
        onSuccess: (service) => {
          close('new')
          setMessage(`${service.name} added.`)
        },
      },
    )

  const update = (id: number, values: ServiceInput) =>
    updateService.mutate(
      { id, changes: values },
      {
        onSuccess: (service) => {
          close(service.id)
          setMessage(`${service.name} saved.`)
        },
      },
    )

  const remove = (service: Service) =>
    deleteService.mutate(service.id, {
      onSuccess: () => {
        close('new')
        setMessage(`${service.name} deleted.`)
      },
    })

  const failure = createService.isError
    ? 'The service could not be added. Please try again.'
    : updateService.isError
      ? 'The changes could not be saved. Please try again.'
      : deleteService.isError
        ? 'The service could not be deleted. Please try again.'
        : ''

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">What clients can choose when they book.</p>
        {/* Hidden while the new form is open: its own "Add service" is then the one main action. */}
        {editing !== 'new' && (
          <Button ref={addButton} onClick={() => open('new')}>
            <Plus aria-hidden />
            Add service
          </Button>
        )}
      </div>

      {message && (
        <p role="status" className="flex items-center gap-2 font-medium">
          <Check aria-hidden className="size-4 shrink-0" />
          {message}
        </p>
      )}
      {failure && (
        <p role="alert" className="text-destructive">
          {failure}
        </p>
      )}

      {editing === 'new' && (
        <section aria-label="New service" className="rounded-2xl bg-card">
          <h2 className="px-4 pt-4 text-lg font-semibold">New service</h2>
          <ServiceForm pending={createService.isPending} onSubmit={create} onCancel={() => close('new')} />
        </section>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-destructive">Services failed to load. Please try again.</p>
      ) : !services || services.length === 0 ? (
        editing !== 'new' && (
          <p className="rounded-2xl bg-card p-4 text-muted-foreground">
            No services yet. Add the first one so clients can book.
          </p>
        )
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card">
          {services.map((service) =>
            editing === service.id ? (
              <li key={service.id}>
                <ServiceForm
                  service={service}
                  pending={updateService.isPending}
                  onSubmit={(values) => update(service.id, values)}
                  onCancel={() => close(service.id)}
                />
              </li>
            ) : (
              <li
                key={service.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <p className="text-sm tabular-nums">
                    <span className="font-semibold">€{service.price}</span>
                    <span className="text-muted-foreground"> · {service.durationMinutes} min</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    ref={(button) => {
                      if (button) editButtons.current.set(service.id, button)
                      else editButtons.current.delete(service.id)
                    }}
                    variant="outline"
                    size="sm"
                    onClick={() => open(service.id)}
                    aria-label={`Edit ${service.name}`}
                  >
                    <Pencil aria-hidden />
                    Edit
                  </Button>
                  <DeleteServiceButton
                    service={service}
                    pending={deleteService.isPending && deleteService.variables === service.id}
                    onConfirm={() => remove(service)}
                  />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}
