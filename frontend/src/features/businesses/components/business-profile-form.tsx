import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Save } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { NotFoundError } from '@/lib/mock-db'

import { useBusiness, useUpdateBusiness } from '../api/use-businesses'
import type { Business } from '../types'
import { BusinessPhotoPreview } from './business-photo-preview'
import { businessProfileSchema, type BusinessProfile } from './business-profile-schema'
import { categoryLabels } from './category-meta'

type BusinessProfileFormProps = {
  id: number
}

// The owner's business profile, with loading, not-found and error states.
export function BusinessProfileForm({ id }: BusinessProfileFormProps) {
  const { data: business, isLoading, error } = useBusiness(id)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="aspect-video w-full rounded-2xl" />
      </div>
    )
  }

  if (error instanceof NotFoundError) {
    return <p className="text-muted-foreground">This business does not exist or was removed.</p>
  }

  if (error || !business) {
    return <p className="text-destructive">Business failed to load. Please try again.</p>
  }

  return <ProfileFields business={business} />
}

const toProfile = (business: Business): BusinessProfile => ({
  name: business.name,
  city: business.city,
  address: business.address,
  openingHours: business.openingHours,
  description: business.description,
  imageUrl: business.imageUrl,
})

type ProfileFieldsProps = {
  business: Business
}

function ProfileFields({ business }: ProfileFieldsProps) {
  const id = useId()
  const updateBusiness = useUpdateBusiness()
  const [saved, setSaved] = useState(false)
  const savedRef = useRef<HTMLParagraphElement>(null)
  // The link whose photo failed to load in the preview: a warning, so the owner knows clients
  // will see the category icon. Not an error, because the host may only be down for a while.
  const [brokenUrl, setBrokenUrl] = useState('')
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(businessProfileSchema),
    // Checked on submit, then on every change: an error appearing on blur would push the
    // submit button down mid-click, so the click would miss it.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: toProfile(business),
  })
  const imageUrl = watch('imageUrl').trim()
  // Only links the schema accepts are previewed, so no http or javascript: URL is ever loaded.
  const previewUrl = businessProfileSchema.shape.imageUrl.safeParse(imageUrl).success ? imageUrl : ''

  // Saving turns "Save changes" off while it has focus, so focus moves to "Saved".
  useEffect(() => {
    if (saved) savedRef.current?.focus()
  }, [saved])

  const save = handleSubmit((values) => {
    setSaved(false)
    updateBusiness.mutate(
      { id: business.id, changes: values },
      {
        onSuccess: (updated) => {
          // The saved values become the new starting point, so "Save changes" turns off again.
          reset(toProfile(updated))
          setSaved(true)
        },
      },
    )
  })

  // Shared props of every field: id, error wiring, and hiding "Saved" once something changes.
  const field = (name: keyof BusinessProfile) => ({
    id: `${id}-${name}`,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined,
    ...register(name, { onChange: () => setSaved(false) }),
  })

  const fieldError = (name: keyof BusinessProfile) => {
    const message = errors[name]?.message
    return (
      message && (
        <p id={`${id}-${name}-error`} className="text-sm text-destructive">
          {message}
        </p>
      )
    )
  }

  return (
    <form
      noValidate
      onSubmit={save}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
    >
      <div className="flex flex-col gap-6 rounded-2xl bg-card p-4 md:p-6">
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm font-medium">Category</span>
          <Badge variant="secondary">{categoryLabels[business.category]}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-name`}>Name</Label>
          <Input autoComplete="organization" maxLength={80} {...field('name')} />
          {fieldError('name')}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-description`}>Description</Label>
          <Textarea rows={3} maxLength={500} {...field('description')} />
          {fieldError('description')}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-city`}>City</Label>
            <Input autoComplete="address-level2" maxLength={60} {...field('city')} />
            {fieldError('city')}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-address`}>Address</Label>
            <Input autoComplete="street-address" maxLength={120} {...field('address')} />
            {fieldError('address')}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-openingHours`}>Opening hours</Label>
          <Input
            placeholder="Mon–Sat 09:00–19:00"
            maxLength={100}
            className="tabular-nums"
            {...field('openingHours')}
          />
          {fieldError('openingHours')}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-imageUrl`}>
            Cover photo link <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input type="url" inputMode="url" placeholder="https://" maxLength={500} {...field('imageUrl')} />
          {fieldError('imageUrl')}
          {previewUrl !== '' && brokenUrl === previewUrl && (
            <p className="text-sm text-muted-foreground">
              This link does not open a photo, so clients will see the category icon instead.
            </p>
          )}
        </div>
      </div>

      {/* On phones right under the photo link, before Save; from lg up a sticky side column. */}
      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <span className="text-sm font-medium">Preview</span>
        <BusinessPhotoPreview
          key={previewUrl}
          imageUrl={previewUrl}
          category={business.category}
          onError={() => setBrokenUrl(previewUrl)}
        />
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:col-start-1">
        <Button type="submit" disabled={!isDirty || updateBusiness.isPending}>
          <Save aria-hidden />
          {updateBusiness.isPending ? 'Saving…' : 'Save changes'}
        </Button>
        {saved && (
          <p
            ref={savedRef}
            tabIndex={-1}
            role="status"
            className="flex items-center gap-2 rounded-sm text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            <Check aria-hidden className="size-4 shrink-0" />
            Saved
          </p>
        )}
        {updateBusiness.isError && (
          <p role="alert" className="text-sm text-destructive">
            The profile could not be saved. Please try again.
          </p>
        )}
      </div>
    </form>
  )
}
