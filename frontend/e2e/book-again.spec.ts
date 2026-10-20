import { dayChip, expect, slot, test } from './fixtures.ts'

// At 12:00 on Tue 20 Oct, booking 1 (Women's haircut, 09:30 that day) is in the past.
const NOON = new Date('2026-10-20T12:00:00')

test('a past booking can be booked again with the same service already chosen', async ({ page }) => {
  await page.clock.setFixedTime(NOON)
  await page.goto('/bookings')
  const past = page.getByRole('region', { name: 'Past and cancelled' })
  const card = past.getByRole('listitem').filter({ hasText: "Women's haircut and blow-dry" })
  await card.getByRole('link', { name: "Book again: Women's haircut and blow-dry at Studio Lana" }).click()

  await expect(page).toHaveURL(/\/businesses\/1\?service=1$/)
  const service = page.getByRole('button', { name: /^Women's haircut and blow-dry/ })
  await expect(service).toHaveAttribute('aria-pressed', 'true')
  // The time step is unlocked straight away and uses the service length (60 min).
  await expect(page.getByText('Choose a service first.')).toBeHidden()
  await dayChip(page, 'Wed 21 Oct').click()
  await expect(slot(page, 'Wed 21 Oct, 09:30, 60 min')).toBeEnabled()
})

test('the preselected service can still be changed', async ({ page }) => {
  await page.goto('/businesses/1?service=1')
  await expect(page.getByRole('button', { name: /^Women's haircut and blow-dry/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: /^Blow-dry/ }).click()
  await expect(page.getByRole('button', { name: /^Blow-dry/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: /^Women's haircut and blow-dry/ })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test('a cancelled booking offers "Book again" on its page', async ({ page }) => {
  await page.goto('/bookings/4')
  await expect(page.getByText('This booking is cancelled.')).toBeVisible()
  await page
    .getByRole('link', { name: /^Book again: Men's haircut and beard trim at Barber Shop Kruna$/ })
    .click()

  await expect(page).toHaveURL(/\/businesses\/2\?service=4$/)
  await expect(page.getByRole('button', { name: /^Men's haircut and beard trim/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('upcoming bookings offer cancel, not "Book again"', async ({ page }) => {
  await page.goto('/bookings')
  const upcoming = page.getByRole('region', { name: 'Upcoming' })
  await expect(upcoming.getByRole('button', { name: 'Cancel booking' }).first()).toBeVisible()
  await expect(upcoming.getByRole('link', { name: /^Book again/ })).toHaveCount(0)
})

test('a service the business does not offer is ignored', async ({ page }) => {
  for (const value of ['999', '4', 'abc', '-1', '0x1', '1e0']) {
    // Service 4 exists, but at another business (Barber Shop Kruna); 0x1 and 1e0 spell 1 but are not digits.
    await page.goto(`/businesses/1?service=${value}`)
    await expect(page.getByRole('button', { name: /^Full colour/ })).toBeVisible()
    await expect(page.getByText('Choose a service first.')).toBeVisible()
    await expect(page.locator('ul button[aria-pressed="true"]')).toHaveCount(0)
  }
})
