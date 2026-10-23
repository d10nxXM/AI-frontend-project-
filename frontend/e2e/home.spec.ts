import { expect, filterMenu, pickFilter, test } from './fixtures.ts'

test('search on the home page opens the filtered business list', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Zakazi.me')
  await page.getByRole('search').getByRole('textbox', { name: 'Search businesses' }).fill('iron')
  await page.getByRole('button', { name: 'Search' }).click()

  await expect(page).toHaveURL(/\/businesses\?search=iron$/)
  await expect(page.getByRole('textbox', { name: 'Search businesses' })).toHaveValue('iron')
  const cards = page.getByRole('main').getByRole('listitem')
  await expect(cards).toHaveCount(1)
  await expect(cards).toContainText('Iron Gym')
})

test('an empty search shows every business', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/\/businesses$/)
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(6)
})

test('a category tile opens the list with that category selected', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Gyms, 2 places' }).click()

  await expect(page).toHaveURL(/\/businesses\?category=gym$/)
  await expect(filterMenu(page, 'Category')).toHaveAccessibleName('Category: Gym')
  await expect(filterMenu(page, 'Category')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(2)
})

test('the next booking links to that booking', async ({ page }) => {
  // At 08:00 on Tue 20 Oct the 09:30 haircut at Studio Lana is the next one.
  await page.goto('/')
  const next = page.getByRole('region', { name: 'Your next booking' })
  await expect(next).toContainText("Women's haircut and blow-dry")
  // The sheet peeks collapsed; open it like a user would, then follow the link to the booking
  // itself (the sheet also links to directions).
  await next.getByRole('button', { expanded: false }).click()
  await expect(next.getByRole('button', { expanded: true })).toBeVisible()
  await next.getByRole('link', { name: 'View booking' }).click()
  await expect(page).toHaveURL(/\/bookings\/1$/)
})

test('the home page shows three businesses and a link to all of them', async ({ page }) => {
  await page.goto('/')
  const businesses = page.getByRole('region', { name: 'Businesses' })
  await expect(businesses.getByRole('listitem')).toHaveCount(3)
  await businesses.getByRole('link', { name: 'See all' }).click()
  await expect(page).toHaveURL(/\/businesses$/)
})

test('filters are kept in the URL and restored by the back button', async ({ page }) => {
  await page.goto('/businesses')
  await pickFilter(page, 'City', 'Budva')
  await expect(page).toHaveURL(/city=Budva/)
  await page
    .getByRole('main')
    .getByRole('link', { name: /FitZone Budva/ })
    .click()
  await expect(page).toHaveURL(/\/businesses\/4$/)

  await page.goBack()
  await expect(page).toHaveURL(/city=Budva/)
  await expect(filterMenu(page, 'City')).toHaveAccessibleName('City: Budva')
  await expect(filterMenu(page, 'City')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(2)
})

test('an unknown category in the URL is ignored', async ({ page }) => {
  await page.goto('/businesses?category=bakery')
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(6)
})
