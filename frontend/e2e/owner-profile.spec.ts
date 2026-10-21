import { expect, horizontalOverflow, test } from './fixtures.ts'

// The owner edits the business profile; the public page shows the change.
test.describe('Owner business profile', () => {
  test('saves changes and shows them on the public page', async ({ page }) => {
    await page.goto('/owner/profile')
    const save = page.getByRole('button', { name: 'Save changes' })
    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Studio Lana')
    await expect(save).toBeDisabled()

    await page.getByRole('textbox', { name: 'Opening hours' }).fill('Mon–Fri 10:00–18:00')
    await save.click()
    await expect(page.getByRole('status')).toHaveText('Saved')
    await expect(save).toBeDisabled()

    await page.getByRole('link', { name: 'View public page' }).click()
    await expect(page.getByText('Mon–Fri 10:00–18:00')).toBeVisible()
  })

  test('rejects a short name and a non-https photo link', async ({ page }) => {
    await page.goto('/owner/profile')
    await page.getByRole('textbox', { name: 'Name' }).fill('A')
    await page.getByRole('textbox', { name: /Cover photo link/ }).fill('javascript:alert(1)')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Enter the name (at least 2 characters).')).toBeVisible()
    await expect(page.getByText('Enter a photo link that starts with https://.')).toBeVisible()
    await expect(page.getByText('No photo')).toBeVisible()
    await expect(page.getByRole('status')).toHaveCount(0)
  })

  test('fits the screen', async ({ page }) => {
    await page.goto('/owner/profile')
    await expect(page.getByRole('heading', { name: 'Business profile' })).toBeVisible()
    expect(await horizontalOverflow(page)).toBe(0)
  })
})
