import { expect, horizontalOverflow, test } from './fixtures.ts'

// The owner (Studio Lana) adds, edits and deletes a service; clients see the change.
test.describe('owner services', () => {
  test('adds a service and shows it on the business page', async ({ page }) => {
    await page.goto('/owner/services')
    await expect(page.getByRole('heading', { name: 'Services', level: 1 })).toBeVisible()
    await expect(page.getByText('Full colour')).toBeVisible()

    await page.getByRole('button', { name: 'Add service' }).click()
    const form = page.getByRole('form', { name: 'New service' })
    await form.getByLabel('Name').fill('Balayage')
    await form.getByLabel('Description').fill('Hand-painted highlights with toner and blow-dry.')
    await form.getByLabel('Price (€)').fill('70')
    await form.getByLabel('Duration (min)').fill('150')
    await form.getByRole('button', { name: 'Add service' }).click()

    await expect(page.getByRole('status')).toHaveText('Balayage added.')
    await expect(page.getByRole('heading', { name: 'Balayage' })).toBeVisible()
    expect(await horizontalOverflow(page)).toBe(0)

    // The client side reads the same mock data in this tab.
    await page.getByRole('link', { name: 'Businesses' }).click()
    await page.getByRole('link', { name: 'Studio Lana' }).first().click()
    await expect(page.getByRole('button', { name: /Balayage/ })).toBeVisible()
  })

  test('shows errors for an invalid service', async ({ page }) => {
    await page.goto('/owner/services')
    await page.getByRole('button', { name: 'Add service' }).click()
    const form = page.getByRole('form', { name: 'New service' })
    await form.getByLabel('Price (€)').fill('-5')
    await form.getByRole('button', { name: 'Add service' }).click()

    await expect(form.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true')
    await expect(form.getByText('Enter a price in euros, e.g. 25 or 12.50.')).toBeVisible()
  })

  test('edits the price and deletes a service after confirming', async ({ page }) => {
    await page.goto('/owner/services')
    await page.getByRole('button', { name: 'Edit Blow-dry' }).click()
    const form = page.getByRole('form', { name: 'Edit Blow-dry' })
    await form.getByLabel('Price (€)').fill('14.50')
    await form.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('status')).toHaveText('Blow-dry saved.')
    await expect(page.getByText('€14.5')).toBeVisible()

    await page.getByRole('button', { name: 'Delete Blow-dry' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete service' }).click()
    await expect(page.getByRole('status')).toHaveText('Blow-dry deleted.')
    await expect(page.getByRole('heading', { name: 'Blow-dry', exact: true })).toHaveCount(0)
  })
})
