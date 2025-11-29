import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');

    // Use more specific selector for the navigation brand
    await expect(page.getByRole('navigation').getByText('Tabung.in')).toBeVisible();
    // Check the hero headline
    await expect(page.getByText('Kelola Uangmu.')).toBeVisible();
  });

  test('should navigate to login page', async ({ page, browserName }) => {
    // Skip Firefox due to known navigation timing issues with Next.js
    test.skip(browserName === 'firefox', 'Firefox has navigation timing issues');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on the first login link in navigation (inside the nav element)
    await page.locator('nav').getByRole('link', { name: 'Masuk' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    await expect(page.getByText('Selamat Datang Kembali')).toBeVisible();
  });

  test('should navigate to register page', async ({ page, browserName }) => {
    // Skip Firefox due to known navigation timing issues with Next.js
    test.skip(browserName === 'firefox', 'Firefox has navigation timing issues');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on the Mulai Gratis button text directly within nav
    await page.locator('nav').getByText('Mulai Gratis', { exact: true }).click();
    await expect(page).toHaveURL(/\/register/, { timeout: 15000 });
    await expect(page.getByText('Buat Akun Baru')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    // Use more specific selectors to avoid strict mode violations
    await expect(page.getByRole('heading', { name: 'Scan Struk OCR' })).toBeVisible();
    await expect(page.getByText('Anggaran Cerdas')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Laporan Visual' }).first()).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should show validation errors on empty registration', async ({ page }) => {
    await page.goto('/register');

    await page.click('button[type="submit"]');

    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });
});