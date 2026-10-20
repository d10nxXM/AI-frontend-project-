import { expect, horizontalOverflow, test } from './fixtures.ts'

// Each page with a text that only shows once its data has loaded.
const pages = [
  { path: '/', ready: 'Zakazi.me' },
  { path: '/businesses', ready: 'iFix Niksic' },
  { path: '/businesses/1', ready: 'Full colour' },
  { path: '/bookings', ready: 'Personal training session' },
  { path: '/bookings/1', ready: 'Change time' },
]

for (const { path, ready } of pages) {
  test(`${path} loads without sideways scrolling`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByText(ready).first()).toBeVisible()
    await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0)
    expect(await horizontalOverflow(page)).toBe(0)
  })
}

test('missing business and booking show a not-found message', async ({ page }) => {
  await page.goto('/businesses/999')
  await expect(page.getByText('This business does not exist or was removed.')).toBeVisible()
  await page.goto('/bookings/999')
  await expect(page.getByText('This booking does not exist.')).toBeVisible()
  await page.goto('/businesses/abc')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})

test('category and city filters combine, and an empty result can be cleared', async ({ page }) => {
  await page.goto('/businesses')
  const cards = page.getByRole('main').getByRole('listitem')
  await expect(cards).toHaveCount(6)

  await page.getByRole('group', { name: 'Category' }).getByRole('button', { name: 'Gym' }).click()
  await page.getByRole('group', { name: 'City' }).getByRole('button', { name: 'Niksic' }).click()
  await expect(cards).toHaveCount(1)
  await expect(cards).toContainText('Iron Gym')

  await page.getByRole('textbox', { name: 'Search businesses' }).fill('zzz')
  await expect(page.getByText('No businesses match your search and filters.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(cards).toHaveCount(6)
})

test('the long address keeps its city visible', async ({ page }) => {
  await page.goto('/businesses')
  await expect(page.getByText('Bulevar Svetog Petra Cetinjskog 45, Podgorica')).toBeVisible()
  expect(await horizontalOverflow(page)).toBe(0)
})
