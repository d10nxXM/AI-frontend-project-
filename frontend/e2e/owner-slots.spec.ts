import { expect, test } from './fixtures.ts'

// The owner runs Studio Lana. Its mock slots on Tue 20 Oct 2026 are 30 min from 09:00, with
// 09:00-10:00 booked and 10:30 free; Sun 25 Oct has no slots (closed on Sundays).

const schedule = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Schedule' })
const row = (page: import('@playwright/test').Page, time: string) =>
  schedule(page).getByRole('listitem').filter({ hasText: time })

async function publish(page: import('@playwright/test').Page, date: string, from: string, to: string) {
  await page.getByLabel('Day', { exact: true }).fill(date)
  await page.getByLabel('From').fill(from)
  await page.getByLabel('To', { exact: true }).fill(to)
  await page.getByRole('button', { name: 'Publish' }).click()
}

test('the schedule opens on today with free and booked slots written out', async ({ page }) => {
  await page.goto('/owner/slots')
  await expect(schedule(page)).toContainText('Tue 20 Oct')
  await expect(row(page, '09:00')).toContainText('Booked')
  await expect(row(page, '09:00').getByRole('button', { name: /Delete/ })).toHaveCount(0)
  await expect(row(page, '10:30')).toContainText('Free')
})

test('publishing a range adds back-to-back free slots and shows that day', async ({ page }) => {
  await page.goto('/owner/slots')
  await publish(page, '2026-10-25', '09:00', '11:00')
  await expect(page.getByRole('status')).toContainText('Published 4 time slots.')
  await expect(schedule(page)).toContainText('Sun 25 Oct')
  await expect(schedule(page).getByText('Free', { exact: true })).toHaveCount(4)
})

test('times already published are not published twice', async ({ page }) => {
  await page.goto('/owner/slots')
  await publish(page, '2026-10-21', '09:00', '10:00')
  await expect(page.getByRole('status')).toContainText('Nothing new to publish')
})

test('the end time must be after the start time', async ({ page }) => {
  await page.goto('/owner/slots')
  await publish(page, '2026-10-21', '17:00', '09:00')
  await expect(page.getByText('End after the start time.')).toBeVisible()
  await expect(page.getByLabel('To', { exact: true })).toHaveAttribute('aria-invalid', 'true')
})

test('a free slot can be deleted after confirming', async ({ page }) => {
  await page.goto('/owner/slots')
  await row(page, '10:30').getByRole('button', { name: 'Delete 10:30' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete time' }).click()
  await expect(row(page, '10:30')).toHaveCount(0)
})

test('week view lists seven days and opens a day', async ({ page }) => {
  await page.goto('/owner/slots')
  await page.getByRole('button', { name: 'Week', exact: true }).click()
  await expect(page.getByText('Mon 19 Oct – Sun 25 Oct')).toBeVisible()
  await expect(schedule(page).getByRole('button', { name: /Open day$/ })).toHaveCount(7)
  await schedule(page)
    .getByRole('button', { name: /^Thu 22 Oct/ })
    .click()
  await expect(page.getByRole('button', { name: 'Day', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(schedule(page)).toContainText('Thu 22 Oct')
})

test('previous and next move by a day', async ({ page }) => {
  await page.goto('/owner/slots')
  await page.getByRole('button', { name: 'Next day' }).click()
  await expect(schedule(page)).toContainText('Wed 21 Oct')
  await page.getByRole('button', { name: 'Today', exact: true }).click()
  await expect(schedule(page)).toContainText('Tue 20 Oct')
})
