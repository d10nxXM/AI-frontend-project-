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

// Business list filters live in the "Filters" group. Dropdown buttons are named "<label>: <choice>",
// e.g. "Category: All"; toggles keep their own name ("Free today").
export const filters = (page: Page) => page.getByRole('group', { name: 'Filters' })
export const filterMenu = (page: Page, label: string) =>
  filters(page).getByRole('button', { name: new RegExp(`^${label}: `) })

// Opens a filter dropdown and picks one option, e.g. pickFilter(page, 'Category', 'Gym').
export async function pickFilter(page: Page, label: string, option: string) {
  await filterMenu(page, label).click()
  await page.getByRole('menuitemradio', { name: option, exact: true }).click()
}

// Slot buttons are named "<day>, <time>, <note>", e.g. "Wed 21 Oct, 10:00, Too short".
export const slot = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

export const rememberCheckbox = (page: Page) =>
  page.getByRole('checkbox', { name: 'Remember my name and phone on this device' })

// Fills step 3 of the booking flow with a valid client.
export async function fillClientDetails(page: Page, name = 'Ana Petrovic', phone = '+382 69 555 123') {
  await page.getByRole('textbox', { name: 'Name' }).fill(name)
  await page.getByRole('textbox', { name: 'Phone' }).fill(phone)
}

// Books Full colour (120 min) at Studio Lana on Wed 21 Oct, 09:30 and waits for the new booking.
// Pass `remember` to tick "Remember my name and phone on this device" (off by default).
export async function bookFullColour(page: Page, { remember = false } = {}) {
  await page.goto('/businesses/1')
  await page.getByRole('button', { name: /Full colour/ }).click()
  await dayChip(page, 'Wed 21 Oct').click()
  await slot(page, 'Wed 21 Oct, 09:30, 120 min').click()
  await fillClientDetails(page)
  if (remember) await rememberCheckbox(page).check()
  await page.getByRole('button', { name: 'Book', exact: true }).click()
  await expect(page.getByText('Booked. See you there!')).toBeVisible()
}
