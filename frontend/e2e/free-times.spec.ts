import { expect, filters, pickFilter, test } from './fixtures.ts'

// Times follow the mock slots of Tue 20 Oct 2026: Studio Lana has 09:00-10:00 taken, the car
// service (AutoServis Delta) closes at 16:00 and iFix Niksic has its last slot at 17:00.

const card = (page: import('@playwright/test').Page, name: string) =>
  page.getByRole('main').getByRole('listitem').filter({ hasText: name })

test('each business card shows its next free time', async ({ page }) => {
  await page.goto('/businesses')
  await expect(card(page, 'Studio Lana')).toContainText('Next free: Today, 10:30')
  await expect(page.getByText(/^Next free:/)).toHaveCount(6)
})

test('after closing time the next free time is tomorrow', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-20T19:30:00'))
  await page.goto('/businesses')
  await expect(card(page, 'Studio Lana')).toContainText('Next free: Tomorrow, 09:30')
})

test('the home page cards show the next free time too', async ({ page }) => {
  await page.goto('/')
  const businesses = page.getByRole('region', { name: 'Businesses' })
  await expect(businesses.getByText(/^Next free:/)).toHaveCount(3)
})

test('"Free today" hides businesses with no free time left today, and is kept in the URL', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-20T17:30:00'))
  await page.goto('/businesses')
  const cards = page.getByRole('main').getByRole('listitem')
  await expect(cards).toHaveCount(6)

  await filters(page).getByRole('button', { name: 'Free today' }).click()
  await expect(page).toHaveURL(/available=today/)
  await expect(cards).toHaveCount(4)
  await expect(card(page, 'AutoServis Delta')).toHaveCount(0)
  await expect(card(page, 'iFix Niksic')).toHaveCount(0)

  // Combines with the other filters, and both stay in the URL.
  await pickFilter(page, 'Category', 'Gym')
  await expect(page).toHaveURL(/category=gym/)
  await expect(page).toHaveURL(/available=today/)
  await expect(cards).toHaveCount(2)

  // A booking for today would only be a click away: their next free time is today.
  await expect(cards.first()).toContainText('Next free: Today')
})

test('"Free today" with nothing left can be cleared', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-20T23:00:00'))
  await page.goto('/businesses?available=today')
  await expect(page.getByText('No businesses match your search and filters.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page).toHaveURL(/\/businesses$/)
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(6)
})
