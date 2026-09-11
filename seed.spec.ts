import { test, expect } from '@playwright/test';

test.describe('Arabic i18n verification', () => {
  test('seed', async ({ page, context }) => {
    // Set Arabic language cookie before navigating
    await context.addCookies([{
      name: 'language',
      value: 'ar',
      domain: 'affiliate-portal-q00mmwjm8-jupi-solutions.vercel.app',
      path: '/',
    }]);
    await page.goto('https://affiliate-portal-q00mmwjm8-jupi-solutions.vercel.app/login');
    await page.waitForLoadState('networkidle');
  });
});
