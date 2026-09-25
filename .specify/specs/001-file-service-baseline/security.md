# Security — Spec 001

## Authentication

- Shared API key via `X-API-Key`.
- `server.js` also accepts `apiKey` query parameter (prefer header only — Target harden).
- Default test key in `server.js` when `API_KEY` unset — **dev only**; never ship real secrets.

## Authorization

- Single shared key (no roles). Admin-only scan routes are Spec 002 Target.

## Path safety

- `fileService` resolves upload dir under `storage.rootDirectory` and rejects traversal outside root.
- Directory must be whitelist member (case-insensitive path match).

## Upload constraints

- `server.js`: image MIME allow-list; 50MB Multer limit.
- `uploadService`: extension allow-list `.jpg/.jpeg/.png/.gif/.bmp/.webp`.

## Secrets policy

- Do not commit `config/config.json` with real keys, `.env`, SMB passwords.
- `config.example.json` uses placeholder API key.
- Logging must not print full API keys (`auth.js` truncates provided key in error logs).

## Residual risks

- Broken require graph may push operators toward insecure local shortcuts.
- Query-string API key leaks via logs/referrers.
- Missing ProjectService leaves upload routes returning 500 (fail closed) — do not bypass auth to “make it work.”
