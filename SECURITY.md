# Security Policy

## Supported Versions

GharKhata is currently in an early personal-project stage.

Until the first stable release, there are no officially supported production versions.

| Version | Supported |
| ------- | --------- |
| pre-1.0 | No formal support |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please do not open a public issue with exploit details.

Instead, contact the maintainer privately.

Maintainer:

```text
Neel Shah
```

Suggested report details:

- Description of the issue
- Steps to reproduce
- Potential impact
- Affected files or modules
- Suggested fix, if any

---

## Security Scope

Security-sensitive areas may include:

- Authentication
- Household membership and access control
- Vendor/payment data
- File uploads
- Exported reports
- API authorization
- Database migrations
- Environment variables and secrets

---

## Development Security Notes

Please avoid committing:

- `.env` files
- Database passwords
- API keys
- JWT secrets
- Cloud credentials
- Personal household data
- Real vendor phone numbers or payment details

Use sample data for development and demos.
