/**
 * Playwright E2E — "Test Connection" acceptance tests
 *
 * Acceptance criteria:
 *   Clicking "Test Connection" and getting success banner for all 4 models
 *   (OpenAI · Anthropic · Google Gemini · xAI / Grok) is the ultimate success.
 *
 * Pre-requisites (configured in .env — see .env.example):
 *   SF_ORG_URL, SF_ADMIN_USERNAME, SF_ADMIN_PASSWORD
 *   OPENAI_API_KEY / OPENAI_MODEL
 *   ANTHROPIC_API_KEY / ANTHROPIC_MODEL
 *   GOOGLE_API_KEY / GOOGLE_MODEL
 *   XAI_API_KEY / XAI_MODEL
 *   OPENAI_NC_URL / ANTHROPIC_NC_URL / GOOGLE_NC_URL / XAI_NC_URL
 */

import { test, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import { login } from '../helpers/salesforce';
import { configureNamedCredentialUrl, configureExternalCredential, switchAdminConfig } from '../helpers/setup';

dotenv.config();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SF_ORG_URL = process.env.SF_ORG_URL || 'https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com';
const ADMIN_APP_URL = process.env.SF_ADMIN_APP_URL
  || `${SF_ORG_URL}/lightning/n/aiemailreply__AI_Email_Reply_Admin`;

const EXT_CRED_NAME = process.env.SF_EXTERNAL_CREDENTIAL_NAME || 'AI_Email_Reply_ExtCred';
const EXT_CRED_PRINCIPAL = process.env.SF_EXTERNAL_CREDENTIAL_PRINCIPAL || 'AI_Email_Reply_User';

const SUCCESS_MESSAGE_RE = /connection successful|ai provider is responding/i;

// ---------------------------------------------------------------------------
// Provider definitions
// ---------------------------------------------------------------------------

interface ProviderConfig {
  label: string;
  namedCredentialName: string;
  ncUrl: string;
  apiKey: string;
  model: string;
}

function buildProviders(): ProviderConfig[] {
  return [
    {
      label: 'OpenAI',
      namedCredentialName: 'AI_Email_Reply_Provider',
      ncUrl: process.env.OPENAI_NC_URL || 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    {
      label: 'Anthropic',
      namedCredentialName: 'AI_Email_Reply_Anthropic',
      ncUrl: process.env.ANTHROPIC_NC_URL || 'https://api.anthropic.com/v1/messages',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    },
    {
      label: 'Google',
      namedCredentialName: 'AI_Email_Reply_Google',
      ncUrl:
        process.env.GOOGLE_NC_URL ||
        `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GOOGLE_MODEL || 'gemini-1.5-flash'}:generateContent`,
      apiKey: process.env.GOOGLE_API_KEY || '',
      model: process.env.GOOGLE_MODEL || 'gemini-1.5-flash',
    },
    {
      label: 'xAI',
      namedCredentialName: 'AI_Email_Reply_XAI',
      ncUrl: process.env.XAI_NC_URL || 'https://api.x.ai/v1/chat/completions',
      apiKey: process.env.XAI_API_KEY || '',
      model: process.env.XAI_MODEL || 'grok-beta',
    },
  ];
}

// ---------------------------------------------------------------------------
// Helpers — Admin UI
// ---------------------------------------------------------------------------

/**
 * Navigate to the Admin Config page, click "Test Connection", and assert the
 * green success banner appears within 60 seconds.
 */
async function runTestConnection(page: Page): Promise<void> {
  await page.goto(ADMIN_APP_URL);

  // Wait for the Lightning component to fully load
  await page.waitForSelector(
    'c-ai-reply-admin-config, lightning-card, .admin-config-container, [data-id="test-connection-btn"]',
    { state: 'visible', timeout: 60_000 },
  );

  // A spinner may be present while the config loads — wait for it to disappear
  await page.waitForSelector('.slds-spinner, lightning-spinner', {
    state: 'detached',
    timeout: 30_000,
  }).catch(() => { /* spinner may never appear — that is OK */ });

  // Click the "Test Connection" button
  const testBtn = page.locator(
    'button:has-text("Test Connection"), lightning-button:has-text("Test Connection"), [data-id="test-connection-btn"]',
  ).first();
  await testBtn.waitFor({ state: 'visible', timeout: 30_000 });
  await testBtn.click();

  // Wait for the success message
  await expect(
    page.locator('.slds-notify--success, .successMessage, [data-id="connection-status"], .status-message'),
  ).toContainText(SUCCESS_MESSAGE_RE, { timeout: 60_000 });
}

// ---------------------------------------------------------------------------
// Tests — one per provider
// ---------------------------------------------------------------------------

const providers = buildProviders();

// Validate required env vars are present before running
test.beforeAll(() => {
  const missing = providers
    .filter((p) => !p.apiKey)
    .map((p) => `${p.label}: API key env var missing`);

  if (missing.length > 0) {
    console.warn(
      '\n⚠  Some API keys are missing from .env — those provider tests will be skipped.\n' +
      missing.join('\n') + '\n',
    );
  }
});

for (const provider of providers) {
  test(`Test Connection — ${provider.label} (${provider.model})`, async ({ page }) => {
    test.skip(!provider.apiKey, `${provider.label}: API key not configured in .env — skipping`);

    // ── Step 1: Log in ──────────────────────────────────────────────────────
    await login(page);

    // ── Step 2: Configure Named Credential URL ──────────────────────────────
    await test.step(`Configure Named Credential URL for ${provider.label}`, async () => {
      await configureNamedCredentialUrl(page, provider.namedCredentialName, provider.ncUrl);
    });

    // ── Step 3: Configure External Credential (API key) ────────────────────
    await test.step(`Configure External Credential API key for ${provider.label}`, async () => {
      await configureExternalCredential(
        page,
        EXT_CRED_NAME,
        EXT_CRED_PRINCIPAL,
        provider.apiKey,
      );
    });

    // ── Step 4: Switch Admin Config to this provider ────────────────────────
    await test.step(`Switch Admin Config to ${provider.label} / ${provider.model}`, async () => {
      await switchAdminConfig(page, provider.label, provider.model);
    });

    // ── Step 5: Click Test Connection and verify success ────────────────────
    await test.step('Click Test Connection and verify success banner', async () => {
      await runTestConnection(page);
    });
  });
}

// ---------------------------------------------------------------------------
// Convenience: run all 4 providers in sequence inside a single test
// ---------------------------------------------------------------------------

test('Test Connection — all 4 providers sequentially', async ({ page }) => {
  const configured = providers.filter((p) => p.apiKey);
  test.skip(
    configured.length === 0,
    'No API keys are configured in .env — cannot run combined test',
  );

  await login(page);

  for (const provider of configured) {
    await test.step(`${provider.label}: configure Named Credential URL`, async () => {
      await configureNamedCredentialUrl(page, provider.namedCredentialName, provider.ncUrl);
    });

    await test.step(`${provider.label}: configure External Credential API key`, async () => {
      await configureExternalCredential(page, EXT_CRED_NAME, EXT_CRED_PRINCIPAL, provider.apiKey);
    });

    await test.step(`${provider.label}: switch Admin Config`, async () => {
      await switchAdminConfig(page, provider.label, provider.model);
    });

    await test.step(`${provider.label}: Test Connection → expect success banner`, async () => {
      await runTestConnection(page);
    });
  }
});
