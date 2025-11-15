# Playwright-Training-V1
Leveraging the Learning till now

## Overview
This is a Playwright project configured with:
- Playwright Test Framework
- Multi-browser testing (Chromium, Firefox, WebKit)
- Allure reporting for beautiful test reports

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Install system dependencies (Linux only):
```bash
npx playwright install-deps
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in headed mode:
```bash
npm run test:headed
```

### Run tests in UI mode:
```bash
npm run test:ui
```

### Run tests in debug mode:
```bash
npm run test:debug
```

## Allure Reports

### Generate Allure report:
```bash
npm run allure:generate
```

### Open generated Allure report:
```bash
npm run allure:open
```

### Generate and serve Allure report in one command:
```bash
npm run allure:serve
```

## Project Structure

```
.
├── tests/                    # Test files
│   ├── example.spec.ts      # Example tests (requires internet)
│   └── offline.spec.ts      # Offline demo tests
├── playwright.config.ts      # Playwright configuration
├── package.json             # Project dependencies and scripts
├── allure-results/          # Allure test results (auto-generated)
├── allure-report/           # Allure HTML report (auto-generated)
└── test-results/            # Playwright test results (auto-generated)
```

## Configuration

The Playwright configuration is in `playwright.config.ts` and includes:
- Test directory: `./tests`
- Parallel execution enabled
- Screenshots on failure
- Video recording on failure
- Trace on first retry
- Allure reporter configured
- HTML reporter for Playwright's built-in reports

## Browsers Installed
- Chromium
- Firefox
- WebKit (Safari)

All tests run across all three browsers by default.
