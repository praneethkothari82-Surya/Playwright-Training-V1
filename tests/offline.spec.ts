import { test, expect } from '@playwright/test';

test.describe('Offline Test Suite', () => {
  test('basic page functionality test', async ({ page }) => {
    // Create a simple HTML page
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <h1>Welcome to Playwright</h1>
          <button id="myButton">Click Me</button>
          <div id="result"></div>
          <script>
            document.getElementById('myButton').addEventListener('click', () => {
              document.getElementById('result').textContent = 'Button Clicked!';
            });
          </script>
        </body>
      </html>
    `);
    
    // Verify the page title
    await expect(page).toHaveTitle('Test Page');
    
    // Check for the main heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Welcome to Playwright');
    
    // Click the button
    await page.click('#myButton');
    
    // Verify the result
    const result = page.locator('#result');
    await expect(result).toHaveText('Button Clicked!');
  });

  test('form input test', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Form Test</title>
        </head>
        <body>
          <form>
            <input type="text" id="nameInput" placeholder="Enter your name">
            <input type="email" id="emailInput" placeholder="Enter your email">
            <button type="submit" id="submitBtn">Submit</button>
          </form>
        </body>
      </html>
    `);
    
    // Fill in the form
    await page.fill('#nameInput', 'John Doe');
    await page.fill('#emailInput', 'john@example.com');
    
    // Verify the inputs
    await expect(page.locator('#nameInput')).toHaveValue('John Doe');
    await expect(page.locator('#emailInput')).toHaveValue('john@example.com');
    
    // Check if submit button is visible
    await expect(page.locator('#submitBtn')).toBeVisible();
  });
});
