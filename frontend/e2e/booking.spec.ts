import { bookFullColour, dayChip, expect, slot, test } from './fixtures.ts'

// Studio Lana, Wed 21 Oct (30 min slots): 09:00, 11:30, 14:00 and 16:30 are booked in the mock.

test('a long service only starts where enough free slots follow', async ({ page }) => {
  await page.goto('/businesses/1')

  // Before a service is chosen, no time can be picked.
  await expect(page.getByText('Choose a service first.')).toBeVisible()
  await dayChip(page, 'Wed 21 Oct').click()
  await expect(slot(page, 'Wed 21 Oct, 09:30, 30 min')).toBeDisabled()

  await page.getByRole('button', { name: /Full colour/ }).click()

  // 09:30 + 120 min ends exactly when 11:30 (booked) starts.
  await expect(slot(page, 'Wed 21 Oct, 09:30, 120 min')).toBeEnabled()
  // 10:00 + 120 min would run into 11:30.
  await expect(slot(page, 'Wed 21 Oct, 10:00, Too short')).toBeDisabled()
  await expect(slot(page, 'Wed 21 Oct, 11:00, Too short')).toBeDisabled()
  await expect(slot(page, 'Wed 21 Oct, 11:30, Booked')).toBeDisabled()
  // 18:30 + 120 min is past closing time (19:00).
  await expect(slot(page, 'Wed 21 Oct, 18:30, Too short')).toBeDisabled()
})

test('changing the service clears a time that no longer fits', async ({ page }) => {
  await page.goto('/businesses/1')
  await page.getByRole('button', { name: /^Blow-dry/ }).click()
  await dayChip(page, 'Wed 21 Oct').click()
  await slot(page, 'Wed 21 Oct, 11:00, 30 min').click()
  await expect(page.getByRole('button', { name: 'Book', exact: true })).toBeEnabled()

  await page.getByRole('button', { name: /Full colour/ }).click()
  await expect(slot(page, 'Wed 21 Oct, 11:00, Too short')).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Book', exact: true })).toBeDisabled()
})

test('a booking takes every slot it covers and opens the new booking', async ({ page }) => {
  await bookFullColour(page)

  await expect(page).toHaveURL(/\/bookings\/\d+$/)
  await expect(page).toHaveTitle('Full colour · Zakazi.me')
  for (const time of ['09:30', '10:00', '10:30', '11:00']) {
    await expect(slot(page, `Wed 21 Oct, ${time}, Your time`)).toBeVisible()
  }
})

test('cancelling asks first, and a confirmed cancel frees all the slots', async ({ page }) => {
  await bookFullColour(page)

  // "Keep booking" closes the dialog and changes nothing.
  await page.getByRole('button', { name: 'Cancel booking' }).click()
  const dialog = page.getByRole('alertdialog', { name: 'Cancel this booking?' })
  await expect(dialog).toContainText('Full colour at Studio Lana')
  await dialog.getByRole('button', { name: 'Keep booking' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('This booking is cancelled.')).toBeHidden()

  await page.getByRole('button', { name: 'Cancel booking' }).click()
  await dialog.getByRole('button', { name: 'Cancel booking' }).click()
  await expect(page.getByText('This booking is cancelled.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancel booking' })).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Change time' })).toBeHidden()

  // Back on the business, 09:30 fits a 120 min service again.
  await page.getByRole('link', { name: /Book again/ }).click()
  await page.getByRole('button', { name: /Full colour/ }).click()
  await dayChip(page, 'Wed 21 Oct').click()
  await expect(slot(page, 'Wed 21 Oct, 09:30, 120 min')).toBeEnabled()
})

test('moving a booking frees the old time and takes the new one', async ({ page }) => {
  await bookFullColour(page)

  // Its own slots count as free, so it can move by just 30 minutes.
  await expect(slot(page, 'Wed 21 Oct, 09:30, Your time')).toBeVisible()
  await slot(page, 'Wed 21 Oct, 12:00, 120 min').click()
  await page.getByRole('button', { name: 'Change time' }).click()
  await expect(page.getByText('Time changed.')).toBeVisible()

  for (const time of ['12:00', '12:30', '13:00', '13:30']) {
    await expect(slot(page, `Wed 21 Oct, ${time}, Your time`)).toBeVisible()
  }
  await expect(slot(page, 'Wed 21 Oct, 09:30, 120 min')).toBeEnabled()
})

test('cancelling from the list asks first and frees the slots', async ({ page }) => {
  await bookFullColour(page)
  await page.getByRole('link', { name: 'My bookings' }).click()

  const card = page.getByRole('listitem').filter({ hasText: 'Full colour' })
  await card.getByRole('button', { name: 'Cancel booking' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel booking' }).click()
  await expect(card.getByText('Cancelled', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'Businesses' }).click()
  await page.getByRole('link', { name: /Studio Lana/ }).click()
  await page.getByRole('button', { name: /Full colour/ }).click()
  await dayChip(page, 'Wed 21 Oct').click()
  await expect(slot(page, 'Wed 21 Oct, 09:30, 120 min')).toBeEnabled()
})

test('past times are hidden and past bookings cannot be cancelled', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-20T12:00:00'))

  await page.goto('/businesses/1')
  await expect(dayChip(page, 'Tue 20 Oct')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Tue 20 Oct, 11:30/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Tue 20 Oct, 12:00/ })).toBeVisible()

  // The 09:30 booking from this morning is now in the past.
  await page.goto('/bookings')
  const past = page.getByRole('region', { name: 'Past and cancelled' })
  const card = past.getByRole('listitem').filter({ hasText: "Women's haircut and blow-dry" })
  await expect(card.getByText('Past', { exact: true })).toBeVisible()
  await expect(card.getByRole('button', { name: 'Cancel booking' })).toHaveCount(0)
})
