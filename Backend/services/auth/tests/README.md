# Auth Service Test Suite

This folder contains the MVP test suite for the auth service.

## Test layers

- `tests/unit`: fast unit tests for domain value objects, HTTP middlewares, and application use-cases.
- `tests/integration/http`: HTTP integration tests for Express routes, controllers, middlewares, and use-cases wired together with in-memory fake repositories.

The integration tests intentionally avoid a real database so they can run quickly in local development and CI. Repository/database integration tests can be added later with a dedicated Postgres test database.

## Commands

From `services/auth`:

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:watch
```

## Current coverage focus

- Public OTP request with selected role: `client` or `chef`.
- Public OTP verification for completed users.
- New public registration flow:
  - `verify-otp` returns `requiresRegistration` and `registrationToken`.
  - `register/complete` creates/completes user profile.
  - chef registration creates an active chef account.
- Public refresh token rotation keeps `firstName`, `lastName`, and `username` in the new session.
- Public phone change keeps profile fields and revokes old refresh tokens.
- Admin OTP login, `/admin/auth/me`, manager phone change with OTP.
- Manager-only admin user management: add, list, change normal admin phone, disable.
- Token scope isolation: public token is rejected on admin routes and admin token is rejected on public routes.
- Logout refresh-token revocation.
