export const baseUrl =
  typeof window !== 'undefined'
    ? !location.host.includes('localhost')
      ? `${location.protocol}//${location.host}`
      : 'http://localhost:9000'
    : '';
