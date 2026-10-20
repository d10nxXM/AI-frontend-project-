import { expect, test } from './fixtures.ts'

const toggle = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Dark mode' })
const isDark = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'))

test('the header switch turns dark mode on and off, and remembers it', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  expect(await isDark(page)).toBe(false)

  await toggle(page).click()
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
  expect(await isDark(page)).toBe(true)

  // Applied before React starts, so the page does not flash light first.
  await page.reload({ waitUntil: 'domcontentloaded' })
  expect(await isDark(page)).toBe(true)
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')

  await toggle(page).click()
  expect(await isDark(page)).toBe(false)
})

test('without a choice the system setting decides, and a choice overrides it', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  expect(await isDark(page)).toBe(true)

  await toggle(page).click()
  await page.reload()
  expect(await isDark(page)).toBe(false)
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
})

test('a bad saved value falls back to the system setting', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('zakazi.theme', 'purple'))
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  expect(await isDark(page)).toBe(false)

  // ...and with a dark system setting it is dark, in index.html and in the toggle alike.
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.reload()
  expect(await isDark(page)).toBe(true)
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
})
