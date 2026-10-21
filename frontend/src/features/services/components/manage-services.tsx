import { Check, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'

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
          setEditing(undefined)
          setMessage(`${service.name} added.`)
        },
      },
    )

  const update = (id: number, values: ServiceInput) =>
    updateService.mutate(
      { id, changes: values },
      {
        onSuccess: (service) => {
          setEditing(undefined)
          setMessage(`${service.name} saved.`)
        },
      },
    )

  const remove = (service: Service) =>
    deleteService.mutate(service.id, {
      onSuccess: () => {
        if (editing === service.id) setEditing(undefined)
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
        <Button onClick={() => open('new')} disabled={editing === 'new'}>
          <Plus aria-hidden />
          Add service
        </Button>
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
        <section aria-label="New service" className="rounded-lg border">
          <h2 className="px-4 pt-4 text-lg font-semibold">New service</h2>
          <ServiceForm
            pending={createService.isPending}
            onSubmit={create}
            onCancel={() => setEditing(undefined)}
          />
        </section>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? (
        <p className="text-destructive">Services failed to load. Please try again.</p>
      ) : !services || services.length === 0 ? (
        editing !== 'new' && (
          <p className="text-muted-foreground">No services yet. Add the first one so clients can book.</p>
        )
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border">
          {services.map((service) =>
            editing === service.id ? (
              <li key={service.id}>
                <ServiceForm
                  service={service}
                  pending={updateService.isPending}
                  onSubmit={(values) => update(service.id, values)}
                  onCancel={() => setEditing(undefined)}
                />
              </li>
            ) : (
              <li
                key={service.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <p className="text-sm tabular-nums">
                    <span className="font-semibold">€{service.price}</span>
                    <span className="text-muted-foreground"> · {service.durationMinutes} min</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
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
