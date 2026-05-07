---
layout: default
title: "AI Email Reply Generator — Documentation"
---

# AI Email Reply Generator

**Publisher**: MDS LLC — [omorgun@morgunsolutions.com](mailto:omorgun@morgunsolutions.com)  
**Package**: `aiemailreply` (2GP managed, API version 60.0)

AI Email Reply Generator is a 100% native Salesforce Lightning managed package that generates AI-powered email reply drafts within Lightning Experience. It uses a Bring Your Own Key (BYOK) model — MDS LLC does not host any external infrastructure. All AI callouts go from the customer's Salesforce org directly to the customer's own configured AI provider.

---

## Documentation

### For Security Reviewers

| Document | Description |
|---|---|
| [Architecture & Data Flow](DATA_FLOW_ARCHITECTURE) | Full technical data flow — component interactions, SOQL queries, callout path, draft persistence |
| [Security Review Submission Notes](SUBMISSION_NOTES) | BYOK architecture explanation, data transmitted, test org configuration, credential security |
| [Sensitive Data Inventory](SENSITIVE_DATA_INVENTORY) | PII fields accessed, usage context, retention model |
| [Third-Party Inventory](THIRD_PARTY_INVENTORY) | All external dependencies — zero ISV-hosted third-party services |
| [False Positive Report](FALSE_POSITIVE_REPORT) | Justifications for PMD `ApexCRUDViolation` suppressions on Custom Metadata queries |

### Policies

| Document | Description |
|---|---|
| [Privacy Policy](PRIVACY_POLICY) | Data handling disclosure — MDS LLC is not a data processor |
| [Security Policy](SECURITY_POLICY) | SDLC, vulnerability response, breach response, and security certifications |
