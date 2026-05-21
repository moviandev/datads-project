import 'dotenv/config';

export const config = {
  baseUrl:
    process.env.BASE_URL ??
    'https://datads-mock-ad-apis.happygrass-47d99234.germanywestcentral.azurecontainerapps.io',
  maxRetries: Number(process.env.MAX_RETRIES ?? 4),
  baseDelay: Number(process.env.BASE_DELAY_MS ?? 500),
};
