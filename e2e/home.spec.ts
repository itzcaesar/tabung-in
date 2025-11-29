import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Tabung.in')).toBeVisible();
    await expect(page.locator('text=Master Your Money')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Sign In');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Get Started');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('text=Create your account')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Receipt Scanning')).toBeVisible();
    await expect(page.locator('text=Smart Budgets')).toBeVisible();
    await expect(page.locator('text=Visual Reports')).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    // Browser validation should prevent submission with empty required fields
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
