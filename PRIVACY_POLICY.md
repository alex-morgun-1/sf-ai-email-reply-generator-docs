# Privacy Policy — AI Email Reply Generator

> **Effective Date**: April 24, 2026
> **Company**: MDS LLC
> **Contact**: omorgun@morgunsolutions.com

---

## 1. Introduction

This Privacy Policy describes how MDS LLC ("we", "us", "our") handles data in connection with the AI Email Reply Generator application ("the App") available on Salesforce AppExchange. This policy applies to all organizations ("customers") that install and use the App.

---

## 2. Our Role

The AI Email Reply Generator is a Salesforce managed package that runs entirely within the customer's Salesforce org. **MDS LLC does not operate any servers, APIs, databases, or external infrastructure for this product.** We provide software only — the App executes within your Salesforce environment under your control.

MDS LLC is **not** a data processor or sub-processor. We do not receive, access, store, or process any customer data, email content, or user information through the operation of the App.

---

## 3. Data the App Processes

When a user generates an AI-powered email reply, the App reads the following data from the customer's Salesforce org:

- Email subject and body text (from EmailMessage records)
- Sender and recipient email addresses (configurable — can be disabled by admin)
- Message timestamps (configurable — can be disabled by admin)
- User-selected tone and prompt template

This data is processed in-memory within the customer's Salesforce org to assemble a prompt for the AI provider.

---

## 4. Data Transmitted to Third Parties

The App sends assembled prompt data (which includes email thread content) to the **external AI provider configured by the customer's administrator**. This is the core functionality of the App — generating AI-powered email reply drafts.

**Key facts about this data transmission:**

- The customer chooses and configures their own AI provider (e.g., OpenAI, Anthropic).
- The customer provides their own API key via Salesforce External Credentials.
- Data travels directly from the customer's Salesforce org to the customer's AI provider via Salesforce Named Credentials (HTTPS).
- **MDS LLC does not intercept, route, store, or view this data.**
- The AI provider's handling of transmitted data is governed by the customer's own agreement with that provider.

Administrators can reduce the data sent to the AI provider by disabling sender addresses, recipient addresses, and message timestamps in the App's configuration.

---

## 5. Data Stored by the App

The App stores AI-generated reply drafts in a custom Salesforce object (`AI_Email_Reply_Draft__c`) within the customer's org. This includes:

- The AI-generated reply text
- User-edited version of the reply
- Metadata (tone used, AI provider, model, token count, template name)
- Reference IDs to the source email and parent record

This data is stored under a **Private sharing model** — users can only see their own drafts. Data retention is managed by the customer within their Salesforce org.

---

## 6. Data We Do NOT Collect

MDS LLC does not collect, receive, or have access to:

- Customer email content or email metadata
- Salesforce user credentials, session tokens, or authentication data
- AI provider API keys or credentials
- Usage analytics, telemetry, or behavioral data
- Any data from the customer's Salesforce org

The App does not "phone home" or communicate with any MDS LLC systems.

---

## 7. Data Security

- All external callouts use Salesforce Named Credentials with HTTPS enforcement.
- API keys are stored in Salesforce External Credentials (encrypted, masked).
- Access to the App is controlled by Salesforce Permission Sets.
- All data operations enforce Salesforce CRUD and FLS (field-level security).
- Email content undergoes prompt injection sanitization before being sent to the AI provider.
- The App does not use `eval()`, `innerHTML`, dynamic SOQL, or other insecure patterns.

---

## 8. Customer Responsibilities

Customers are responsible for:

- Evaluating whether the AI provider they configure meets their organization's data handling and compliance requirements.
- Reviewing and accepting their AI provider's terms of service and data processing agreements.
- Configuring the App's privacy settings (sender/recipient/timestamp toggles) in accordance with their data minimization policies.
- Managing data retention of AI-generated drafts within their Salesforce org.
- Ensuring their users understand that email content is sent to an external AI provider (the App provides an in-app disclosure banner for this purpose).

---

## 9. Children's Privacy

The App is a business tool designed for use within Salesforce orgs. It is not directed at children under 13, and we do not knowingly collect data from children.

---

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be communicated through the AppExchange listing and release notes. Continued use of the App after changes constitutes acceptance of the updated policy.

---

## 11. Contact

For privacy-related questions or concerns:

- **Email**: amorgun@morgunsolutions.com
- **Company**: MDS LLC
