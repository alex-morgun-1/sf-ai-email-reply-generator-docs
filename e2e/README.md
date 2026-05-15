# Playwright E2E Tests — AI Email Reply Generator

End-to-end acceptance tests that validate the **"Test Connection"** flow for all four AI providers (OpenAI · Anthropic · Google Gemini · xAI / Grok) in the AI Email Reply Generator Salesforce app.

## Acceptance Criteria

> Clicking **"Test Connection"** and getting a **green success banner** for all 4 models is the ultimate acceptance-criteria success.

---

## Setup

### 1. Install dependencies

```bash
npm install
npx playwright install chromium --with-deps
```

### 2. Configure credentials

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
# Then edit .env with your real API keys and org credentials
```

The `.env` file is `.gitignore`-d — **never commit it**.

#### Required variables

| Variable | Description |
|---|---|
| `SF_ORG_URL` | Salesforce org base URL |
| `SF_ADMIN_USERNAME` | Admin user username |
| `SF_ADMIN_PASSWORD` | Admin user password |
| `OPENAI_API_KEY` | OpenAI API key (`sk-...`) |
| `ANTHROPIC_API_KEY` | Anthropic API key (`sk-ant-...`) |
| `GOOGLE_API_KEY` | Google Gemini API key (`AIza...`) |
| `XAI_API_KEY` | xAI / Grok API key (`xai-...`) |

See `.env.example` for the full list including model names and Named Credential URLs.

---

## Running the Tests

### Run all providers (headless, default)

```bash
npm test
```

### Run with a visible browser

```bash
npm run test:headed
```

### Run a single provider

```bash
npx playwright test --grep "OpenAI"
npx playwright test --grep "Anthropic"
npx playwright test --grep "Google"
npx playwright test --grep "xAI"
```

### Debug mode (pause on failure)

```bash
npm run test:debug
```

### View HTML report after a run

```bash
npm run test:report
```

---

## Test Structure

```
e2e/
├── helpers/
│   ├── salesforce.ts   — Login + Lightning navigation utilities
│   └── setup.ts        — Named Credential, External Credential, and Admin Config helpers
└── tests/
    └── test-connection.spec.ts  — Main acceptance tests (5 test cases)
playwright.config.ts             — Playwright configuration
.env.example                     — Credential template
```

### What each test does

1. **Logs in** to the Salesforce org as the admin user.
2. **Configures the Named Credential URL** for the provider in Setup.
3. **Configures the External Credential** (sets `Bearer <API_KEY>` on the principal's Authorization parameter).
4. **Switches the Admin Config** (Custom Metadata) to use the target provider + model.
5. **Opens the Admin App page**, clicks **"Test Connection"**, and asserts the green success banner appears.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Cannot reach AI provider" | Named Credential URL not set | Check the NC URL env vars and re-run |
| "Authentication failed" | Wrong API key in External Credential | Verify API key values in `.env` |
| Test skipped | API key env var is empty | Fill in the missing key in `.env` |
| Login redirect loop | Wrong org URL or credentials | Verify `SF_ORG_URL`, `SF_ADMIN_USERNAME`, `SF_ADMIN_PASSWORD` |
| Timeout on Setup page | Salesforce setup iframe loading slowly | Tests have 120 s timeout; try increasing `timeout` in `playwright.config.ts` |
