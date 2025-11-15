export const baseUrl =
  typeof window !== 'undefined'
    ? !location.host.includes('localhost')
      ? `${location.protocol}//${location.host}`
      : 'http://localhost:9000'
    : '';

export const baseUrlAuth =
  typeof window !== 'undefined'
    ? !location.host.includes('localhost')
      ? `${location.protocol}//${location.hostname}:8080`
      : 'http://localhost:8080'
    : '';
