Security Policy

This repository contains an internal company platform made of three applications:

Application	Folders	Purpose
Admin	admin/backend, admin/frontend	Users, roles, permissions, authentication
Invoice	invoice/server, invoice/client	Clients, quotations, invoices, payments
Media	media/backend, media/frontend	Media assets, projects, approvals

The system handles sensitive business data (client details, tax information, invoices, payments, and uploaded media files), so we take security reports seriously.

Supported Versions

Only the latest code on the main branch (and the version currently deployed to production) receives security fixes. Older commits, forks, and local development copies are not supported.

Version / Branch	Supported
main (production)	:white_check_mark:
Any other branch	:x:
Older releases / tags	:x:

When formal version numbers are introduced (for example 1.x), update this table to list the supported ones.

Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues, pull requests, or discussions.

Report privately using one of these options:

GitHub Private Vulnerability Reporting: open the repository's Security tab, then Report a vulnerability.
Email: security@yourcompany.com (replace with your real address).

Please include as much of the following as you can:

Which application is affected (Admin, Invoice, or Media) and the affected endpoint, page, or file
A clear description of the issue and its potential impact
Step-by-step instructions to reproduce it (requests, payloads, screenshots, or a proof of concept)
Your environment (browser, OS, role or permission level used)
Any suggested fix, if you have one
What to Expect
Stage	Target time
Acknowledgement of your report	within 72 hours
Initial assessment (accepted / declined / needs more info)	within 7 days
Status updates while we work on it	at least every 7 days
Fix for critical or high severity issues	as soon as possible, ideally within 14 days
If accepted: we will confirm the issue, work on a fix, deploy it, and tell you once it is resolved. With your permission, we will credit you.
If declined: we will explain why (for example, expected behavior, not reproducible, or out of scope).
Scope

In scope:

Authentication and session issues (JWT handling, login, token expiry, password reset)
Broken access control (accessing another user's or client's data, role or permission bypass)
Injection flaws (SQL injection, XSS, command injection)
Insecure file upload or download in the Media application
Exposure of invoices, client data, or secrets through the API
Weaknesses in the service-to-service API communication between Admin, Invoice, and Media
Misconfigurations in the deployment files (docker-compose.yml, Caddyfile)

Out of scope:

Denial-of-service or brute-force load testing against production
Social engineering or phishing of employees
Physical attacks against servers or offices
Vulnerabilities in third-party services we do not control (report these to the vendor)
Issues that require a compromised device or already-privileged admin access
Missing best-practice headers with no demonstrable impact
Rules for Testing
Do not access, modify, or delete data that does not belong to you.
Stop testing and report immediately if you reach real client or financial data.
Do not run automated scanners at high volume against production.
Give us a reasonable time to fix the issue before disclosing it publicly.

We will not take legal action against people who follow this policy and act in good faith.

Security Practices (for contributors)
Never commit .env files, API keys, JWT secrets, or database passwords.
Never commit database backups (backups/) or uploaded media.
Keep dependencies up to date and review npm audit results regularly.
Every new endpoint must check authentication and the user's role or permission.
Service-to-service calls must use the dedicated service API key, not a user token.
Contact

Security contact: pixelrun2000@gmail.com
