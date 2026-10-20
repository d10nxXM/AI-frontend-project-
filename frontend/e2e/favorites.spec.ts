import { expect, test } from './fixtures.ts'

const heart = (page: import('@playwright/test').Page, name: string) =>
  page.getByRole('main').getByRole('button', { name: `Favorite ${name}`, exact: true })
const cards = (page: import('@playwright/test').Page) => page.getByRole('main').getByRole('listitem')
const stored = (page: import('@playwright/test').Page) =>
  page.evaluate(() => localStorage.getItem('zakazi.favorites'))

test('the heart saves a favorite without opening the business, and it survives a reload', async ({
  page,
}) => {
  await page.goto('/businesses')
  await expect(heart(page, 'Studio Lana')).toHaveAttribute('aria-pressed', 'false')

  await heart(page, 'Studio Lana').click()
  await expect(heart(page, 'Studio Lana')).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL(/\/businesses$/)
  expect(await stored(page)).toBe('[1]')

  await page.reload()
  await expect(heart(page, 'Studio Lana')).toHaveAttribute('aria-pressed', 'true')

  // Tapping again removes it.
  await heart(page, 'Studio Lana').click()
  await expect(heart(page, 'Studio Lana')).toHaveAttribute('aria-pressed', 'false')
  expect(await stored(page)).toBe('[]')
})

test('the rest of the card still opens the business', async ({ page }) => {
  await page.goto('/businesses')
  // A real click on the address, not the name: the link is stretched over the whole card, so it
  // sits on top of the address and catches the click (a locator click would refuse a covered element).
  const address = cards(page).filter({ hasText: 'Iron Gym' }).getByText('Vuka Karadzica 8, Niksic')
  await address.scrollIntoViewIfNeeded()
  const box = await address.boundingBox()
  if (!box) throw new Error('address is not visible')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page).toHaveURL(/\/businesses\/3$/)
})

test('the heart works from the keyboard as its own control', async ({ page }) => {
  await page.goto('/businesses')
  await heart(page, 'Iron Gym').focus()
  await page.keyboard.press('Enter')
  await expect(heart(page, 'Iron Gym')).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL(/\/businesses$/)
})

test('"Favorites" shows only saved businesses, combines with other filters and stays in the URL', async ({
  page,
}) => {
  await page.goto('/businesses')
  await heart(page, 'Studio Lana').click()
  await heart(page, 'Iron Gym').click()

  await page.getByRole('group', { name: 'Show' }).getByRole('button', { name: 'Favorites' }).click()
  await expect(page).toHaveURL(/favorites=1/)
  await expect(cards(page)).toHaveCount(2)

  await page.getByRole('group', { name: 'Category' }).getByRole('button', { name: 'Gym' }).click()
  await expect(cards(page)).toHaveCount(1)
  await expect(cards(page)).toContainText('Iron Gym')

  // Removing a favorite while the filter is on takes it out of the list.
  await heart(page, 'Iron Gym').click()
  await expect(page.getByText('No businesses match your search and filters.')).toBeVisible()
})

test('with no favorites yet, the filter explains how to add one', async ({ page }) => {
  await page.goto('/businesses?favorites=1')
  await expect(page.getByText('No favorites yet. Tap the heart on a business to save it.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(cards(page)).toHaveCount(6)
})

test('the business page heart and the list hearts stay in sync', async ({ page }) => {
  await page.goto('/businesses/2')
  await page.getByRole('button', { name: 'Favorite Barber Shop Kruna' }).click()
  await page.getByRole('link', { name: 'All businesses' }).click()
  await expect(heart(page, 'Barber Shop Kruna')).toHaveAttribute('aria-pressed', 'true')
})

test('junk in storage is ignored', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('zakazi.favorites', '["4", 1, 1, -2, {"x":1}]'))
  await page.goto('/businesses')
  await expect(heart(page, 'Studio Lana')).toHaveAttribute('aria-pressed', 'true')
  await expect(heart(page, 'FitZone Budva')).toHaveAttribute('aria-pressed', 'false')
})

test('another tab clearing storage is respected, and the old list does not come back', async ({ page }) => {
  await page.goto('/businesses')
  await heart(page, 'Studio Lana').click()
  await heart(page, 'Iron Gym').click()

  // A second tab in the same browser clears all site data.
  const other = await page.context().newPage()
  await other.goto('/businesses')
  await other.evaluate(() => localStorage.clear())

  await expect(heart(page, 'Studio Lana')).toHaveAttribute('aria-pressed', 'false')
  await heart(page, 'FitZone Budva').click()
  expect(await stored(page)).toBe('[4]')
})

test('a favorite saved in another tab shows up here', async ({ page }) => {
  await page.goto('/businesses')
  const other = await page.context().newPage()
  await other.goto('/businesses')
  await heart(other, 'AutoServis Delta').click()
  await expect(heart(page, 'AutoServis Delta')).toHaveAttribute('aria-pressed', 'true')
})
