import { readFile } from 'node:fs/promises'

import { bookFullColour, expect, test } from './fixtures.ts'

test('an upcoming booking can be added to the calendar as an .ics file', async ({ page }) => {
  await bookFullColour(page)

  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Add to calendar' }).click()
  const download = await downloading

  expect(download.suggestedFilename()).toBe('zakazi-2026-10-21-full-colour.ics')
  const ics = await readFile(await download.path(), 'utf8')
  expect(ics).toContain('DTSTART:20261021T093000')
  expect(ics).toContain('DTEND:20261021T113000')
  expect(ics).toContain('SUMMARY:Full colour at Studio Lana')
  expect(ics).toContain('LOCATION:Njegoseva 12\\, Podgorica')
  expect(ics).toContain('Booked for Ana Petrovic')
})

test('past and cancelled bookings have no calendar button', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-20T12:00:00'))
  await page.goto('/bookings/1')
  await expect(page.getByText('Past', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add to calendar' })).toHaveCount(0)

  await page.goto('/bookings/4')
  await expect(page.getByText('This booking is cancelled.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add to calendar' })).toHaveCount(0)
})

test('business and booking pages link to directions in a new tab', async ({ page }) => {
  await page.goto('/businesses/2')
  const directions = page.getByRole('link', { name: /Directions/ })
  await expect(directions).toHaveAttribute('target', '_blank')
  await expect(directions).toHaveAttribute('rel', 'noreferrer')
  const url = new URL((await directions.getAttribute('href')) ?? '')
  expect(url.searchParams.get('query')).toBe('Bulevar Svetog Petra Cetinjskog 45, Podgorica')

  await page.goto('/bookings/2')
  const bookingUrl = new URL(
    (await page.getByRole('link', { name: /Directions/ }).getAttribute('href')) ?? '',
  )
  expect(bookingUrl.searchParams.get('query')).toBe('Vuka Karadzica 8, Niksic')
})
