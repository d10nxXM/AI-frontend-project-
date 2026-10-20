import { expect, test } from './fixtures.ts'

// Studio Lana has three mock reviews: 5, 4 and 5 stars (average 4.7).
// At 12:00 on Tue 20 Oct, booking 1 (Studio Lana, 09:30) is in the past and has no review yet.
const NOON = new Date('2026-10-20T12:00:00')

// The radio itself is visually hidden; a user clicks the star, i.e. its label.
const star = (page: import('@playwright/test').Page, name: string) =>
  page.locator('label').filter({ has: page.getByRole('radio', { name, exact: true }) })

test('the business page shows the average and the reviews, newest first', async ({ page }) => {
  await page.goto('/businesses/1')
  await expect(page.getByText('4.7', { exact: true })).toBeVisible()
  await expect(page.getByText('· 3 reviews')).toBeVisible()
  const list = page.getByRole('region', { name: 'Reviews' }).getByRole('listitem')
  await expect(list).toHaveCount(3)
  await expect(list.first()).toContainText('Sara D.')
  await expect(list.nth(1)).toContainText('Great cut, but I waited about ten minutes')
})

test('business cards show a short rating line', async ({ page }) => {
  await page.goto('/businesses')
  const card = page.getByRole('main').getByRole('listitem').filter({ hasText: 'Studio Lana' })
  await expect(card).toContainText('4.7')
  await expect(card).toContainText('(3 reviews)')
})

test('a past booking can be rated once, and the review shows on the business page', async ({ page }) => {
  await page.clock.setFixedTime(NOON)
  await page.goto('/bookings/1')
  await expect(page.getByRole('heading', { name: 'Rate your visit' })).toBeVisible()
  // The public name is shown before sending, not only afterwards.
  await expect(page.getByText('Shown publicly as “Milena V.”')).toBeVisible()

  // No stars chosen: the form says what is missing.
  await page.getByRole('button', { name: 'Send review' }).click()
  await expect(page.getByText('Choose 1 to 5 stars.')).toBeVisible()

  await star(page, '4 stars').click()
  await expect(page.getByText('4 out of 5')).toBeVisible()
  await page.getByRole('textbox', { name: /Comment/ }).fill('  Lovely colour, friendly team.  ')
  await page.getByRole('button', { name: 'Send review' }).click()

  const yours = page.getByRole('region', { name: 'Your review' })
  await expect(yours).toContainText('4 out of 5')
  await expect(yours).toContainText('Lovely colour, friendly team.')
  await expect(yours).toContainText('Shown on the business page as “Milena V.”')
  await expect(page.getByRole('button', { name: 'Send review' })).toHaveCount(0)

  await page.getByRole('link', { name: 'Studio Lana', exact: true }).click()
  const first = page.getByRole('region', { name: 'Reviews' }).getByRole('listitem').first()
  await expect(first).toContainText('Milena V.')
  await expect(first).toContainText('Lovely colour, friendly team.')
  // (5 + 4 + 5 + 4) / 4
  await expect(page.getByText('4.5', { exact: true })).toBeVisible()
  await expect(page.getByText('· 4 reviews')).toBeVisible()
})

test('stars work from the keyboard like any radio group', async ({ page }) => {
  await page.clock.setFixedTime(NOON)
  await page.goto('/bookings/1')
  await star(page, '1 star').click()
  await expect(page.getByRole('radio', { name: '1 star' })).toBeChecked()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: '2 stars' })).toBeChecked()
  await expect(page.getByText('2 out of 5')).toBeVisible()
})

test('a comment with HTML is shown as plain text', async ({ page }) => {
  await page.clock.setFixedTime(NOON)
  await page.goto('/bookings/1')
  await star(page, '5 stars').click()
  const html = '<img src=x onerror="document.title=1"><b>bold</b>'
  await page.getByRole('textbox', { name: /Comment/ }).fill(html)
  await page.getByRole('button', { name: 'Send review' }).click()

  const yours = page.getByRole('region', { name: 'Your review' })
  await expect(yours.getByText(html, { exact: true })).toBeVisible()
  await expect(yours.locator('img, b')).toHaveCount(0)
})

test('upcoming and cancelled bookings cannot be rated', async ({ page }) => {
  await page.goto('/bookings/2')
  await expect(page.getByText('Personal training session').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Rate your visit' })).toHaveCount(0)

  await page.goto('/bookings/4')
  await expect(page.getByText('This booking is cancelled.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Rate your visit' })).toHaveCount(0)
})
