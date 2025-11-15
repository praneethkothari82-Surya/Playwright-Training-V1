import { test, expect } from '@playwright/test';

test.describe('Sample Test Suite', () => {
  test('basic navigation test', async ({ page }) => {
    // Navigate to Playwright's website
    await page.goto('https://playwright.dev/');
    
    // Verify the page title
    await expect(page).toHaveTitle(/Playwright/);
    
    // Check for the main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('search functionality test', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    
    // Click on the search button
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Type in the search box
    await page.getByPlaceholder('Search docs').fill('test');
    
    // Verify search results are displayed
    await expect(page.locator('.DocSearch-Dropdown')).toBeVisible();
  });
});
