import { bookFullColour, expect, horizontalOverflow, test } from './fixtures.ts'

// The owner runs Studio Lana (business 1). At 08:00 on Tue 20 Oct its only active booking is
// mock booking 1, today at 09:30.

test('the dashboard lists today and upcoming bookings with the client', async ({ page }) => {
  await bookFullColour(page)
  await page.getByRole('link', { name: 'For business' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('1 booking today · 1 upcoming')).toBeVisible()

  const today = page.getByRole('region', { name: 'Today' })
  await expect(today.getByText('09:30', { exact: true })).toBeVisible()
  await expect(today.getByText('Milena Vukovic')).toBeVisible()
  await expect(today.getByRole('link', { name: '+382 67 123 456' })).toHaveAttribute(
    'href',
    'tel:+38267123456',
  )
  await expect(today.getByText('First visit, shoulder-length hair.')).toBeVisible()

  const upcoming = page.getByRole('region', { name: 'Upcoming' })
  await expect(upcoming.getByText('Full colour')).toBeVisible()
  await expect(upcoming.getByText('Ana Petrovic')).toBeVisible()

  expect(await horizontalOverflow(page)).toBe(0)
})

test('the owner cancels a booking and its time is free again', async ({ page }) => {
  await page.goto('/owner')
  const today = page.getByRole('region', { name: 'Today' })
  await today.getByRole('button', { name: /^Cancel booking of Milena Vukovic/ }).click()

  const dialog = page.getByRole('alertdialog', { name: 'Cancel this booking?' })
  await expect(dialog).toContainText('Milena Vukovic will lose')
  await dialog.getByRole('button', { name: 'Cancel booking' }).click()

  await expect(today.getByText('No bookings today.')).toBeVisible()
  await expect(page.getByText('0 bookings today · 0 upcoming')).toBeVisible()

  // Same app session (client-side navigation), so the in-memory mock keeps the change.
  await page.getByRole('link', { name: 'Businesses' }).click()
  await page.getByRole('link', { name: 'Studio Lana' }).first().click()
  await page.getByRole('button', { name: /Women's haircut and blow-dry/ }).click()
  await expect(page.getByRole('button', { name: 'Tue 20 Oct, 09:30, 60 min', exact: true })).toBeEnabled()
})

test('keeping the booking leaves it in place', async ({ page }) => {
  await page.goto('/owner')
  const today = page.getByRole('region', { name: 'Today' })
  await today.getByRole('button', { name: /^Cancel booking of Milena Vukovic/ }).click()
  await page.getByRole('button', { name: 'Keep booking' }).click()
  await expect(today.getByText('Milena Vukovic')).toBeVisible()
})
