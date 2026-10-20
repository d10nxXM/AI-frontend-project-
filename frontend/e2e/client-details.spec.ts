import {
  bookFullColour,
  dayChip,
  expect,
  fillClientDetails,
  rememberCheckbox,
  slot,
  test,
} from './fixtures.ts'

// Goes to Studio Lana with Blow-dry and a time chosen, so only step 3 is left.
async function chooseServiceAndTime(page: import('@playwright/test').Page) {
  await page.goto('/businesses/1')
  await page.getByRole('button', { name: /^Blow-dry/ }).click()
  await dayChip(page, 'Wed 21 Oct').click()
  await slot(page, 'Wed 21 Oct, 10:00, 30 min').click()
}

test('Book stays disabled until name and phone are valid', async ({ page }) => {
  await chooseServiceAndTime(page)
  const book = page.getByRole('button', { name: 'Book', exact: true })
  await expect(book).toBeDisabled()
  await expect(page.getByText('Add your name and phone')).toBeVisible()

  await page.getByRole('textbox', { name: 'Name' }).fill('Ana Petrovic')
  await page.getByRole('textbox', { name: 'Phone' }).fill('067-123')
  await page.getByRole('textbox', { name: 'Phone' }).blur()
  await expect(page.getByText('Enter a phone number with digits only')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Phone' })).toHaveAttribute('aria-invalid', 'true')
  await expect(book).toBeDisabled()

  await page.getByRole('textbox', { name: 'Phone' }).fill('+382 69 555 123')
  await expect(page.getByText('Enter a phone number with digits only')).toBeHidden()
  await expect(page.getByText('Ana Petrovic, +382 69 555 123')).toBeVisible()
  await expect(book).toBeEnabled()
})

test('a name that is too short shows an error once the field is left', async ({ page }) => {
  await chooseServiceAndTime(page)
  await page.getByRole('textbox', { name: 'Name' }).fill('A')
  // No error while still typing in the field.
  await expect(page.getByText('Enter your name (at least 2 characters).')).toBeHidden()
  await page.getByRole('textbox', { name: 'Phone' }).focus()
  await expect(page.getByText('Enter your name (at least 2 characters).')).toBeVisible()
})

test('the booking shows who it is for, including the note', async ({ page }) => {
  await chooseServiceAndTime(page)
  await fillClientDetails(page, '  Ana Petrovic ', '+382 69 555 123')
  await page.getByRole('textbox', { name: /Note for the business/ }).fill('First visit')
  await page.getByRole('button', { name: 'Book', exact: true }).click()

  const bookedFor = page.getByRole('region', { name: 'Booked for' })
  await expect(bookedFor).toContainText('Ana Petrovic')
  await expect(bookedFor.getByRole('link', { name: '+382 69 555 123' })).toHaveAttribute(
    'href',
    'tel:+38269555123',
  )
  await expect(bookedFor).toContainText('First visit')
})

test('details are not remembered unless the client ticks the box', async ({ page }) => {
  await bookFullColour(page)

  await page.goto('/businesses/2')
  await expect(rememberCheckbox(page)).not.toBeChecked()
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('')
  await expect(page.getByRole('textbox', { name: 'Phone' })).toHaveValue('')
  expect(await page.evaluate(() => localStorage.getItem('zakazi.client'))).toBeNull()
})

test('with the box ticked, name and phone are remembered for the next booking, the note is not', async ({
  page,
}) => {
  await bookFullColour(page, { remember: true })

  await page.goto('/businesses/2')
  await expect(page.getByText('Filled in from your last booking on this device.')).toBeVisible()
  await expect(rememberCheckbox(page)).toBeChecked()
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Ana Petrovic')
  await expect(page.getByRole('textbox', { name: 'Phone' })).toHaveValue('+382 69 555 123')
  await expect(page.getByRole('textbox', { name: /Note for the business/ })).toHaveValue('')
})

test('"Not you? Clear" forgets the saved details at once', async ({ page }) => {
  await bookFullColour(page, { remember: true })

  await page.goto('/businesses/2')
  await page.getByRole('button', { name: 'Not you? Clear' }).click()
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('')
  await expect(page.getByRole('textbox', { name: 'Phone' })).toHaveValue('')
  await expect(rememberCheckbox(page)).not.toBeChecked()
  expect(await page.evaluate(() => localStorage.getItem('zakazi.client'))).toBeNull()

  // Still forgotten after a reload.
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('')
})

test('unticking the box before booking forgets details saved earlier', async ({ page }) => {
  await bookFullColour(page, { remember: true })
  await page.goto('/businesses/2')
  await expect(rememberCheckbox(page)).toBeChecked()

  await page.getByRole('button', { name: /^Men's haircut Clipper and scissor cut, wash/ }).click()
  await page
    .getByRole('group', { name: 'Day' })
    .getByRole('button', { name: /^Wed 21 Oct/ })
    .click()
  await page.getByRole('button', { name: 'Wed 21 Oct, 10:00, 30 min', exact: true }).click()
  await rememberCheckbox(page).uncheck()
  await page.getByRole('button', { name: 'Book', exact: true }).click()
  await expect(page.getByText('Booked. See you there!')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('zakazi.client'))).toBeNull()
})

test('existing bookings show the mock client', async ({ page }) => {
  await page.goto('/bookings/1')
  const bookedFor = page.getByRole('region', { name: 'Booked for' })
  await expect(bookedFor).toContainText('Milena Vukovic')
  await expect(bookedFor).toContainText('First visit, shoulder-length hair.')
})
