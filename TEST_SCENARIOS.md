# Test Scenarios — AI Email Reply Generator

**Package:** AI Email Reply Generator (`aiemailreply`) | v1.14.0.1  
**Test Org:** https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com  
**Date:** May 7, 2026

All permission sets and test data are pre-staged. No setup steps are required before testing.

---

## Test Accounts

**Admin User**

- Username: `epic.30beb5bc4b5e@orgfarm.salesforce.com`
- Password: `Review2027#Adm!`
- Permissions: AI_Email_Reply_Admin + AI_Email_Reply_User

**End User 1** (has app access)

- Username: `testenduser.853007@00ddm00000unecpuas.scratch`
- Password: `Review2027#Usr1!`
- Permissions: AI_Email_Reply_User only

**End User 2** (no access — for negative/denial testing)

- Username: `testenduser.859758@00ddm00000unecpuas.scratch`
- Password: `Review2027#Usr2!`
- Permissions: None

---

## A1 — Admin Config Page (With Permission)

**Log in as:** epic.30beb5bc4b5e@orgfarm.salesforce.com

1. Open App Launcher (grid icon, top-left) → search "AI Reply" → select **AI Reply Admin**.
   Direct URL: https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com/lightning/n/aiemailreply__AI_Email_Reply_Admin

2. **VERIFY:** The Configuration card displays: Provider, Model, Temperature, Max Tokens, Default Tone, Active: Yes, and the Include Sender / Include Recipient / Include Timestamp toggles.

3. Click **Test Connection**.
   **VERIFY:** Green status message — "Connection successful! AI provider is responding."

4. Scroll to the **Prompt Templates** section.
   **VERIFY:** Three templates are listed: General_Reply, Support_Reply, Sales_Reply.
   **VERIFY:** One template is marked as the default.

5. Expand each collapsible section (Setup Guide, Lightning Pages, User Access, Template Tips).
   **VERIFY:** All sections expand and display content.

**Expected:** Full admin panel loads; connection test succeeds; all sections are accessible.

---

## A2 — Admin Config Page (Without Permission)

**Log in as:** End User 2

1. Navigate to: https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com/lightning/n/aiemailreply__AI_Email_Reply_Admin

2. **VERIFY:** "Admin Access Required" banner is shown with instructions to self-assign the AI_Email_Reply_Admin permission set.

3. **VERIFY:** No configuration data, model settings, or Test Connection button are visible.

**Expected:** Access is denied gracefully. No configuration data is exposed to an unauthorized user.

---

## C1 — Case Page / Full Happy Path (With Permission)

**Log in as:** End User 1

1. Navigate to the Case list: https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com/lightning/o/Case/list

2. Open staged test Case https://orgfarm-2384b18009-dev-ed.develop.lightning.force.com/lightning/r/Case/500dM00003EBcoNQAT/view

3. Scroll to the **AI Email Reply Generator** component on the Case page.
   **VERIFY:** Component loads without error.
   **VERIFY:** The email thread is automatically displayed (latest inbound email auto-loaded).

4. **Data Disclosure Gate:**
   **VERIFY:** A "Data Disclosure" banner is shown and the Generate Reply button is disabled.
   **VERIFY:** Banner reads: "When you generate a reply, the email thread content (including sender names, email addresses, and message body) will be sent to the external AI provider configured by your administrator. This data leaves Salesforce for processing."
   Click **I Understand, Proceed**.
   **VERIFY:** Banner dismisses. Generate Reply button becomes active.

5. Click the **Professional** tone button.
   **VERIFY:** Button highlights (brand/blue). Other tones remain unselected.

6. Click **Generate Reply**.
   **VERIFY:** Loading spinner appears while the AI processes the request.
   **VERIFY:** Generated draft text appears in the rich-text editor.
   **VERIFY:** Provider name, model name, and token count are shown.

7. Make a small edit to the generated text.
   **VERIFY:** Word count and character count update in real time.
   **VERIFY:** Formatting toolbar works (bold, italic, link, etc.).

8. Click **Send Reply**.
   **VERIFY:** Success toast appears. Component resets to its initial state.

**Expected:** Full generation → edit → send flow completes without errors.

---

## C2 — Case Page (Without Permission)

**Log in as:** End User 2

1. Open the same Case used in scenario C1.

2. Scroll to the **AI Email Reply Generator** component.
   **VERIFY:** Component displays: "You don't have access to AI Email Reply Generator. Please contact your administrator to be assigned the AI Email Reply User permission set."

3. **VERIFY:** No email thread, tone selector, or Generate button are visible.

**Expected:** Access is denied. No app functionality is exposed to an unauthorized user.

---

## C3 — Disclosure Gate Enforcement

**Log in as:** End User 1

1. Open a Case with an email thread.

2. **Before** clicking "I Understand, Proceed":
   **VERIFY:** Generate Reply button is disabled. No AI callout can be triggered.

3. Click **I Understand, Proceed**.
   **VERIFY:** Generate Reply button becomes enabled.

**Expected:** The disclosure acknowledgment is enforced as a hard gate — generation is blocked until the user explicitly accepts.

---

## C4 — Custom Tone

**Log in as:** End User 1

1. Open a Case with an email thread → accept the disclosure banner.

2. Click **Custom** in the tone selector.
   **VERIFY:** A free-text input field appears below the tone buttons.

3. Type a custom tone (e.g., "empathetic and detailed") → click **Generate Reply**.
   **VERIFY:** A draft is returned without error.
   **VERIFY:** The generated text style reflects the custom tone.

**Expected:** Custom tone input is accepted, passed to the AI provider, and reflected in the generated reply.

---

## S2 — Error Masking (No Raw API Error Exposure)

**Log in as:** Admin

1. Go to Setup → Named Credentials → AI_Email_Reply_Provider.
   Edit the External Credential principal → change the API key to an invalid value (e.g., "sk-invalid").

**Log in as:** End User 1

2. Open a Case → accept the disclosure → click **Generate Reply**.
   **VERIFY:** A generic error message is shown (e.g., "AI provider authentication failed. Please verify your API key configuration.").
   **VERIFY:** No raw HTTP response body from the AI provider is shown.
   **VERIFY:** No stack trace, exception class name, or line number appears in the UI.

**Log in as:** Admin

3. Restore the valid API key → run **Test Connection** to confirm restoration.

**Expected:** Third-party error details are never surfaced to the UI. Only generic, user-friendly messages are displayed.

---

## Quick Reference Links

- Org login: https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com
- Admin app page: https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com/lightning/n/aiemailreply__AI_Email_Reply_Admin
- Case list: https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com/lightning/o/Case/list
- Permission Sets (Setup): https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com/lightning/setup/PermSets/home
- Named Credentials (Setup): https://orgfarm-2384b18009-dev-ed.develop.my.salesforce.com/lightning/setup/NamedCredential/home
