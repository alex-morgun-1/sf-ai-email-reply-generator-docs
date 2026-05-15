/**
 * Salesforce Setup helpers for Named Credentials and External Credentials.
 *
 * Provides:
 *  - configureNamedCredentialUrl()   — set the URL on a Named Credential via Setup
 *  - configureExternalCredential()   — set the Authorization header value on the
 *                                      External Credential principal via Setup
 */

import { Page } from '@playwright/test';
import { navigateToSetup } from './salesforce';

// ---------------------------------------------------------------------------
// Named Credential — update URL
// ---------------------------------------------------------------------------

/**
 * Opens the Named Credential setup list, finds the credential by name,
 * opens the Edit page, and sets the URL to the supplied value.
 *
 * @param page          Playwright Page (must already be logged in)
 * @param credentialName  e.g. "AI_Email_Reply_Provider"
 * @param url             e.g. "https://api.openai.com/v1/chat/completions"
 */
export async function configureNamedCredentialUrl(
  page: Page,
  credentialName: string,
  url: string,
): Promise<void> {
  await navigateToSetup(page, 'NamedCredential/home');

  // The Setup page may load inside an iframe — Salesforce uses a "setupContentIframe"
  const setupFrame = page.frameLocator('#setupContentIframe').first();

  // Find the row for this credential and click the Edit action link
  const credRow = setupFrame.locator(`text="${credentialName}"`).first();
  await credRow.waitFor({ state: 'visible', timeout: 30_000 });

  // Click the row's Edit action link (typically in the action dropdown)
  const editLink = setupFrame.locator(`a[title="Edit ${credentialName}"], td:has-text("${credentialName}") ~ td a:has-text("Edit")`).first();
  if (await editLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await editLink.click();
  } else {
    // Some orgs show a gear/action dropdown
    const actionDropdown = setupFrame
      .locator(`tr:has-text("${credentialName}") .actionMenu, tr:has-text("${credentialName}") a.action-menu`)
      .first();
    await actionDropdown.click();
    await setupFrame.locator('a:has-text("Edit")').first().click();
  }

  // Wait for the edit form to load (may be a new page or inline)
  await page.waitForTimeout(2_000);

  // Fill in the URL field
  // The label is typically "URL" in the Named Credential edit form
  const urlInput = setupFrame.locator('input[name="url"], input#url').first();
  await urlInput.waitFor({ state: 'visible', timeout: 20_000 });
  await urlInput.click({ clickCount: 3 });
  await urlInput.fill(url);

  // Save
  const saveButton = setupFrame.locator('input[value="Save"], button:has-text("Save")').first();
  await saveButton.click();

  // Confirm we're back on the list/detail page (no error)
  await page.waitForTimeout(2_000);
}

// ---------------------------------------------------------------------------
// External Credential — update Authorization header value on the principal
// ---------------------------------------------------------------------------

/**
 * Opens the External Credential setup page, navigates to the specified
 * principal, and updates the "Authorization" Authentication Parameter value.
 *
 * @param page            Playwright Page (must already be logged in)
 * @param credentialName  e.g. "AI_Email_Reply_ExtCred"
 * @param principalName   e.g. "AI_Email_Reply_User"
 * @param apiKey          The raw API key.  The helper prepends "Bearer " automatically.
 */
export async function configureExternalCredential(
  page: Page,
  credentialName: string,
  principalName: string,
  apiKey: string,
): Promise<void> {
  await navigateToSetup(page, 'ExternalCredential/home');

  const setupFrame = page.frameLocator('#setupContentIframe').first();

  // Click the external credential name to open its detail page
  const credLink = setupFrame.locator(`a:has-text("${credentialName}")`).first();
  await credLink.waitFor({ state: 'visible', timeout: 30_000 });
  await credLink.click();

  await page.waitForTimeout(2_000);

  // Find the principal row and click "Edit"
  const principalEditLink = setupFrame
    .locator(`tr:has-text("${principalName}") a:has-text("Edit"), a[title="Edit ${principalName}"]`)
    .first();
  await principalEditLink.waitFor({ state: 'visible', timeout: 20_000 });
  await principalEditLink.click();

  await page.waitForTimeout(2_000);

  // The edit dialog / page shows Authentication Parameters.
  // We look for an input whose sibling label says "Authorization".
  const authParamInput = setupFrame
    .locator(
      'input[name="authParamValue"], ' +
      'td:has-text("Authorization") + td input, ' +
      'label:has-text("Value") + div input, ' +
      'input[placeholder*="Value"]',
    )
    .first();
  await authParamInput.waitFor({ state: 'visible', timeout: 20_000 });
  await authParamInput.click({ clickCount: 3 });
  await authParamInput.fill(`Bearer ${apiKey}`);

  // Save
  const saveButton = setupFrame.locator('input[value="Save"], button:has-text("Save")').first();
  await saveButton.click();

  await page.waitForTimeout(2_000);
}

// ---------------------------------------------------------------------------
// Custom Metadata — switch provider + model in the admin config record
// ---------------------------------------------------------------------------

/**
 * Updates the AI_Email_Reply_Config custom metadata record via Salesforce Setup
 * so that Test Connection runs against the desired provider.
 *
 * @param page      Playwright Page (must already be logged in)
 * @param provider  One of: "OpenAI", "Anthropic", "Google", "xAI"
 * @param model     Provider-specific model string (e.g. "gpt-4o-mini")
 */
export async function switchAdminConfig(
  page: Page,
  provider: string,
  model: string,
): Promise<void> {
  // Navigate to Custom Metadata list for AI_Email_Reply_Config__mdt
  await navigateToSetup(page, 'CustomMetadata/home');

  const setupFrame = page.frameLocator('#setupContentIframe').first();

  // Click "Manage Records" link next to AI_Email_Reply_Config
  const manageLink = setupFrame
    .locator('tr:has-text("AI Email Reply Config") a:has-text("Manage Records"), a:has-text("Manage Records"):near(text("AI Email Reply Config"))')
    .first();
  await manageLink.waitFor({ state: 'visible', timeout: 30_000 });
  await manageLink.click();

  await page.waitForTimeout(2_000);

  // Click Edit on the first (and typically only) record
  const editLink = setupFrame.locator('a:has-text("Edit")').first();
  await editLink.waitFor({ state: 'visible', timeout: 20_000 });
  await editLink.click();

  await page.waitForTimeout(2_000);

  // Update Provider field
  const providerSelect = setupFrame.locator('select[name*="Provider"], select#Provider__c').first();
  if (await providerSelect.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await providerSelect.selectOption({ label: provider });
  } else {
    const providerInput = setupFrame.locator('input[name*="Provider"]').first();
    await providerInput.click({ clickCount: 3 });
    await providerInput.fill(provider);
  }

  // Update Model field
  const modelInput = setupFrame
    .locator('input[name*="Model"], input#Model__c, input[name="Model__c"]')
    .first();
  await modelInput.waitFor({ state: 'visible', timeout: 10_000 });
  await modelInput.click({ clickCount: 3 });
  await modelInput.fill(model);

  // Save
  const saveButton = setupFrame.locator('input[value="Save"], button:has-text("Save")').first();
  await saveButton.click();

  await page.waitForTimeout(2_000);
}
