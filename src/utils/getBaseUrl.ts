export function getBaseUrl() {
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://fsantaclaus.us/';
}
