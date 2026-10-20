import { test as base, expect, type Page } from '@playwright/test'

// The mock data starts on Tue 20 Oct 2026; tests run at 08:00 that day unless they say otherwise.
export const TEST_NOW = '2026-10-20T08:00:00'

// A 1x1 transparent PNG served instead of the placeholder photos, so tests never need the network.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

// Every test gets: a fixed clock, offline images, and a check that the console stayed free of errors.
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      page.on('pageerror', (error) => errors.push(error.message))
      await page.clock.setFixedTime(new Date(TEST_NOW))
      await page.route('https://picsum.photos/**', (route) =>
        route.fulfill({ contentType: 'image/png', body: PIXEL }),
      )
      await use(errors)
      expect(errors, 'browser console errors').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

// The width the page would scroll sideways by; 0 means nothing sticks out.
export const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

// Day chips are buttons inside the "Day" group, e.g. "Wed 21 Oct".
export const dayChip = (page: Page, day: string) =>
  page.getByRole('group', { name: 'Day' }).getByRole('button', { name: new RegExp(`^${day}`) })

// Slot buttons are named "<day>, <time>, <note>", e.g. "Wed 21 Oct, 10:00, Too short".
export const slot = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

// Books Full colour (120 min) at Studio Lana on Wed 21 Oct, 09:30 and waits for the new booking.
export async function bookFullColour(page: Page) {
  await page.goto('/businesses/1')
  await page.getByRole('button', { name: /Full colour/ }).click()
  await dayChip(page, 'Wed 21 Oct').click()
  await slot(page, 'Wed 21 Oct, 09:30, 120 min').click()
  await page.getByRole('button', { name: 'Book', exact: true }).click()
  await expect(page.getByText('Booked. See you there!')).toBeVisible()
}
