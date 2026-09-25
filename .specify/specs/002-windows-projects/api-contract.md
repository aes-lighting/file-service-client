# API contract — Spec 002 (Target)

All endpoints require `X-API-Key` unless noted. Paths below are the **prior Spec Kit** contract; `server.js` currently stubs `/api/projects` and `/api/projects/:jobNumber` only.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/projects/list` or `/api/projects` | List cached projects |
| GET | `/api/projects/:jobNumber` | Project details |
| GET | `/api/projects/scan/status` or `/api/status` | Scan / cache status |
| POST | `/api/projects/scan` | Trigger scan (admin) |
| GET | `/api/projects/templates` | List templates |
| POST | `/api/projects/create` | Create from template |

### Create body (Target)

```json
{
  "jobNumber": "99999",
  "projectName": "New Installation",
  "templateId": "standard_3_phase"
}
```

### Env (Target)

```
WINDOWS_SERVER_UNC_PATH
WINDOWS_SERVER_TEMPLATES_PATH
WINDOWS_SERVER_USERNAME
WINDOWS_SERVER_PASSWORD
WINDOWS_SERVER_DOMAIN
PROJECT_SCAN_INTERVAL_MINUTES
API_KEY
ADMIN_API_KEY
```
