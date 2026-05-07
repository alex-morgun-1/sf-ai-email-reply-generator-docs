# Security Policy — AI Email Reply Generator

> **Company**: MDS LLC
> **Product**: AI Email Reply Generator (Salesforce AppExchange Managed Package)
> **Last Updated**: April 24, 2026
> **Document Owner**: MDS LLC Engineering
> **Contact**: omorgun@morgunsolutions.com

---

## 1. Purpose

This document defines the security policies and practices MDS LLC follows to protect customer data and assets in the AI Email Reply Generator managed package. It is maintained as a living document and updated as practices evolve.

---

## 2. Product Architecture Overview

AI Email Reply Generator is a 100% native Salesforce Lightning application distributed as a second-generation managed package (2GP) with namespace `aiemailreply`. The app runs entirely within the customer's Salesforce org — MDS LLC does not operate any external servers, APIs, or data stores.

### Data Processing Model

- **BYOK (Bring Your Own Key)**: Customers provide their own AI provider API key. MDS LLC never receives, stores, or processes customer email data or API credentials.
- **Data flow**: Email content travels directly from the customer's Salesforce org to the AI provider the customer configures. MDS LLC is not a data processor or sub-processor.
- **No ISV-hosted infrastructure**: No external endpoints, databases, or services are operated by MDS LLC for this product.

---

## 3. Customer Data Protection

### 3.1 Data at Rest

- **AI-generated drafts** are stored in `AI_Email_Reply_Draft__c` with a `Private` sharing model — users can only see their own drafts.
- **Configuration data** is stored in Custom Metadata Types (`AI_Email_Reply_Config__mdt`, `AI_Email_Reply_Prompt_Template__mdt`) — org-wide settings managed by administrators.
- **API credentials** are stored in Salesforce External Credentials with masked authentication parameters — never in code, custom settings, or custom objects.

### 3.2 Data in Transit

- All external callouts use Salesforce Named Credentials, which enforce HTTPS.
- No hardcoded endpoints or API keys exist in the codebase.
- The Salesforce platform manages TLS encryption for all callout traffic.

### 3.3 Data Access Control

- Access is governed exclusively by two Permission Sets:
  - **AI_Email_Reply_User** — standard user access (read/create/edit drafts)
  - **AI_Email_Reply_Admin** — full CRUD on drafts, configuration access
- No profile-based access controls are used.
- All Apex classes enforce `with sharing` and CRUD/FLS via `WITH SECURITY_ENFORCED` and `Security.stripInaccessible()`.

### 3.4 Data Minimization

- Administrators can disable sender addresses, recipient addresses, and timestamps from AI prompts via configuration toggles (`Include_Sender__c`, `Include_Recipient__c`, `Include_Timestamp__c`).
- Users are shown a data disclosure banner and must acknowledge it before any data is sent to the AI provider.

---

## 4. Secure Development Lifecycle (SDLC)

### 4.1 Development Practices

- **Source control**: All code is managed in Git with branch-based development and code review before merge.
- **Static analysis**: Salesforce Code Scanner (`sf scanner run`) is run against the codebase to identify security violations before each release.
- **Automated testing**:
  - Apex test classes with `@isTest` annotation — target 90%+ code coverage
  - LWC Jest tests (`npm test`) for all frontend components
- **Security-first coding standards**:
  - No dynamic SOQL — all queries are static with bind variables
  - No `eval()`, `innerHTML`, or unsafe DOM manipulation in LWC
  - No third-party JavaScript libraries — pure LWC and SLDS
  - CSP compliant — no external scripts loaded
  - Error messages returned to UI are generic — raw API details logged server-side only at `LoggingLevel.ERROR`
  - No stack traces logged in `System.debug` statements

### 4.2 Dependency Management

- **Zero production dependencies**: The package contains no third-party libraries.
- **Development-only dependencies**: Jest testing framework (`jest`, `@lwc/jest-preset`, `@salesforce/sfdx-lwc-jest`) — not included in the distributed package.

### 4.3 Release Process

1. All changes are developed in scratch orgs (never in production or Dev Hub orgs).
2. Code undergoes peer review focusing on security, governor limits, and CRUD/FLS enforcement.
3. Automated test suites must pass with ≥ 90% coverage before a package version is created.
4. Salesforce Code Scanner is run and all findings are reviewed/resolved.
5. Package version is created and tested in a clean scratch org before promotion.

---

## 5. Vulnerability Management

### 5.1 Identification

- Static analysis via Salesforce Code Scanner on every release.
- Manual code review against OWASP Top 10 and OWASP LLM Top 10 checklists.
- Monitoring of Salesforce security advisories and partner notifications.

### 5.2 Classification

Vulnerabilities are classified by severity:

| Severity | Description                                      | Response Target |
| -------- | ------------------------------------------------ | --------------- |
| Critical | Exploitable vulnerability exposing customer data | 24 hours        |
| High     | Security control bypass or data leak potential   | 72 hours        |
| Medium   | Defense-in-depth weakness                        | Next release    |
| Low      | Best practice improvement                        | Backlog         |

### 5.3 Remediation

- Critical and High findings are patched, tested, and released as a new package version.
- Affected customers are notified via the AppExchange listing and direct communication.
- All remediation is tracked in the project's security analysis documentation.

---

## 6. Breach Response Procedures

### 6.1 Scope

Since MDS LLC does not host infrastructure or process customer data, a "breach" in this context means discovery of a vulnerability in the managed package code that could expose customer data.

### 6.2 Response Process

1. **Detection**: Vulnerability reported via security contact (omorgun@morgunsolutions.com), Salesforce partner notification, or internal discovery.
2. **Assessment** (within 4 hours): Determine severity, affected versions, and blast radius.
3. **Containment** (within 24 hours for Critical):
   - Develop and test a fix.
   - If the vulnerability is actively exploitable and no fix is immediately available, notify affected customers with mitigation guidance (e.g., temporarily disable the component).
4. **Remediation**:
   - Release a patched package version.
   - Communicate the fix via AppExchange listing update and direct notification to customers.
5. **Post-Incident Review**:
   - Document root cause, timeline, and corrective actions.
   - Update SDLC practices to prevent recurrence.

### 6.3 Salesforce Notification

If Salesforce notifies MDS LLC of a security concern, MDS LLC will:

- Acknowledge receipt within 24 hours.
- Provide an assessment and remediation plan within the timeframe specified by Salesforce.
- Deliver the fix within the required window.

---

## 7. Third-Party Data Sharing

### 7.1 AI Providers

The app facilitates data transmission from the customer's Salesforce org to the customer's chosen AI provider. Key facts:

- **MDS LLC is not a party to this data flow.** The customer configures their own API key and endpoint.
- **MDS LLC does not receive, store, view, or process** any email content or AI-generated responses.
- **Data handling is governed by the customer's own agreement** with their AI provider (e.g., OpenAI Terms of Use, Anthropic Usage Policy).
- **The app discloses this data flow** to users via an in-app banner before any data is transmitted.

### 7.2 Sub-Processors

MDS LLC does not use sub-processors for this product. No customer data passes through MDS LLC systems.

---

## 8. Certifications

MDS LLC does not currently hold SOC 2, ISO 27001, or equivalent certifications. The BYOK architecture means MDS LLC does not process, store, or transmit customer data — the security boundary is the customer's own Salesforce org and their chosen AI provider.

---

## 9. Contact

| Purpose             | Contact                           |
| ------------------- | --------------------------------- |
| Security issues     | omorgun@morgunsolutions.com       |
| General support     | omorgun@morgunsolutions.com       |
| AppExchange listing | MDS LLC on Salesforce AppExchange |
