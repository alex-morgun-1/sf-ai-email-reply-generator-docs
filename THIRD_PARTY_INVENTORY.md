# Third-Party Library Inventory — AI Email Reply Generator

> **Company**: MDS LLC
> **Last Updated**: April 24, 2026

---

## Production Dependencies

**None.**

The AI Email Reply Generator uses no third-party JavaScript libraries, Apex libraries, or external dependencies in the distributed managed package. All components are built using:

- Native Lightning Web Components (LWC) framework
- Salesforce Lightning Design System (SLDS)
- Standard Apex platform libraries (`System`, `Messaging`, `Database`, `Security`)

No external CSS frameworks, UI libraries, charting libraries, or utility packages are included.

---

## Development-Only Dependencies

The following packages are used exclusively during development and testing. They are **not included** in the distributed managed package.

| Package                     | Version | Purpose                         | License      |
| --------------------------- | ------- | ------------------------------- | ------------ |
| `jest`                      | ^29.7.0 | JavaScript testing framework    | MIT          |
| `@lwc/jest-preset`          | ^16.0.0 | LWC Jest testing preset         | MIT          |
| `@salesforce/sfdx-lwc-jest` | ^5.1.0  | Salesforce LWC Jest integration | BSD-3-Clause |

These are declared as `devDependencies` in `package.json` and are used for running LWC Jest tests during development only.

---

## External Services

The App makes HTTP callouts to external AI providers, but these are:

- Configured entirely by the customer (BYOK model)
- Routed through Salesforce Named Credentials
- Not bundled as libraries or SDKs in the package

No AI provider SDK, HTTP client library, or API wrapper is included. All HTTP communication uses the native Salesforce `Http`, `HttpRequest`, and `HttpResponse` Apex classes.
