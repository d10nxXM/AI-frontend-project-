// A Google Maps search for the address, which opens the app on phones and shows a route option.
export const directionsUrl = (address: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&${new URLSearchParams({ query: `${address}, ${city}` })}`
