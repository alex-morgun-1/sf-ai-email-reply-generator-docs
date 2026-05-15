/**
 * Salesforce Lightning helper utilities for Playwright tests.
 *
 * Provides:
 *  - login()           — log in with username + password via the standard SF login page
 *  - waitForLightning() — wait until the Lightning shell is ready
 *  - navigateToSetup() — open a Setup sub-page by fragment (e.g. "NamedCredential/home")
 */

import { Page, expect } from '@playwright/test';

const SF_ORG_URL = process.env.SF_ORG_URL || 'https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com';
const SF_ADMIN_USERNAME = process.env.SF_ADMIN_USERNAME || '';
const SF_ADMIN_PASSWORD = process.env.SF_ADMIN_PASSWORD || '';

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login(page: Page): Promise<void> {
  await page.goto(`${SF_ORG_URL}/lightning/login`);

  // Salesforce may redirect to login.salesforce.com for authentication
  await page.waitForURL(/login\.salesforce\.com|\.my\.salesforce\.com/, { timeout: 30_000 });

  // Fill username field
  const usernameInput = page.locator('#username');
  await usernameInput.waitFor({ state: 'visible', timeout: 30_000 });
  await usernameInput.fill(SF_ADMIN_USERNAME);

  // Fill password field and submit
  await page.locator('#password').fill(SF_ADMIN_PASSWORD);
  await page.locator('#Login').click();

  // Wait for redirect back to the org after login
  await page.waitForURL(`**/${SF_ORG_URL.replace(/^https?:\/\//, '')}**`, { timeout: 60_000 });
  await waitForLightning(page);
}

// ---------------------------------------------------------------------------
// Wait for Lightning App Shell to be ready
// ---------------------------------------------------------------------------

export async function waitForLightning(page: Page): Promise<void> {
  // The Lightning nav bar is a reliable indicator that the shell is loaded
  await page.waitForSelector('one-app-nav-bar, .navLinks, .slds-global-header', {
    state: 'attached',
    timeout: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Navigate to a Setup sub-page
// ---------------------------------------------------------------------------

export async function navigateToSetup(page: Page, setupFragment: string): Promise<void> {
  await page.goto(`${SF_ORG_URL}/lightning/setup/${setupFragment}`);
  await waitForLightning(page);
}
