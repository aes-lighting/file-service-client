# Project context — file-service-client

## Identity

| Field | Value |
|-------|-------|
| Repository | `aes-lighting/file-service-client` |
| Product | AES File Service Client (AES Logistics) |
| Language | Node.js ≥16 |
| Framework | Express 4 + Multer |
| Auth | API key (`X-API-Key`; optional query `apiKey` on `server.js` routes) |
| Storage | Local/`fs` paths; example UNC `\\aes-dc1\uploads` in `config.example.json` |
| Package name | `aes-file-service-v0` @ `0.1.0` |

## Layout (as-built)

| Path | Role |
|------|------|
| `index.js` | Process entry (expects missing project services) |
| `server.js` | Express app + project/upload routes |
| `src/services/uploadService.js` | Packing-slip / intake upload to project folders |
| `fileService.js` | Filename-encoded whitelist upload + sidecar + list |
| `files.js` | Alternate router (broken relative requires) |
| `auth.js` / `config.js` / `logger.js` | Auth, JSON config loader, logging |
| `config.example.json` | Non-secret example config |
| `README.md` / `FIRST_TIME_SETUP.md` / `GITHUB_SETUP.md` | Human docs |
| `.specify/` | Binding Spec Kit + ontology |
| `spec-kit/` | Non-binding human architecture notes |

## Environment (observed)

| Variable | Notes |
|----------|-------|
| `PORT` / `HOST` | Default `3001` / `127.0.0.1` (`index.js`) |
| `API_KEY` | Overrides default test key in `server.js` |
| `ENABLE_*_ENDPOINT` | Feature flags for health/status/list/lookup/upload |
| `CORS_ENABLED` / `CORS_ALLOWED_ORIGINS` | Optional CORS |
| `PROJECT_SCAN_INTERVAL_MINUTES` | Target scanner interval (default 5) |
| `WINDOWS_SERVER_*` | Target SMB credentials (Spec 002) |

## Consumer integration

Logistics and related apps call this service for file placement and (Target) project discovery. Filename-encoded V0 and project-bound PO uploads are separate contracts — see Spec 001.

## Known gaps (Target / Roadmap)

- Missing `windowsServerClient`, `projectService`, `schedulerService`
- `package.json` `main` points at nonexistent `src/index.js`
- V0 modules use nested require paths that do not match flat tree
- No `config/config.json` committed (correct for secrets; blocks `config.js` without local file)
- Windows SMB discovery and template create (Spec 002)
- MVP definition Deferred
