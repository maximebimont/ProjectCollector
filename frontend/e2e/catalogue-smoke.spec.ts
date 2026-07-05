import { expect, test } from '@playwright/test';

test('loads the application shell and catalogue page', async ({ page }) => {
  await page.goto('/items');

  await expect(page.getByText('Collector.shop')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Objets disponibles' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Catalogue' }).first()).toBeVisible();
});
