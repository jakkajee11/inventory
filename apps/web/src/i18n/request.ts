import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure valid locale
  if (!locale || !routing.locales.includes(locale as 'en' | 'th')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      common: (await import(`./locales/${locale}/common.json`)).default,
      auth: (await import(`./locales/${locale}/auth.json`)).default,
      navigation: (await import(`./locales/${locale}/navigation.json`)).default,
      dashboard: (await import(`./locales/${locale}/dashboard.json`)).default,
      products: (await import(`./locales/${locale}/products.json`)).default,
      categories: (await import(`./locales/${locale}/categories.json`)).default,
      inventory: (await import(`./locales/${locale}/inventory.json`)).default,
    },
  };
});
