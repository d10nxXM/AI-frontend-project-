import { useState } from 'react'

import { categoryIcons, type Category } from '@/lib/categories'

type BusinessPhotoPreviewProps = {
  imageUrl: string
  category: Category
  onError?: () => void
}

// The 16:9 cover as clients will see it; the category icon when there is no photo or it fails to load.
// Key it by the URL, so a new link gets a fresh try.
export function BusinessPhotoPreview({ imageUrl, category, onError }: BusinessPhotoPreviewProps) {
  const [failed, setFailed] = useState(false)
  const Icon = categoryIcons[category]

  if (!imageUrl || failed) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground">
        <Icon aria-hidden className="size-12" />
        <span className="text-sm">{failed ? 'This photo could not be loaded' : 'No photo'}</span>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt="Cover photo preview"
      onError={() => {
        setFailed(true)
        onError?.()
      }}
      className="aspect-video w-full rounded-lg bg-muted object-cover"
    />
  )
}
