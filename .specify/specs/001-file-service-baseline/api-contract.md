# API contract — Spec 001

Auth unless noted: header `X-API-Key` (server also accepts `?apiKey=`).

## Implemented in `server.js`

### GET /health

No auth. Response:

```json
{ "status": "ok", "service": "AES File Service Client", "timestamp": "<iso>" }
```

### GET /api/status

Requires API key + `app.locals.projectService`. Returns cache stats + scheduler status. **Fails today** without ProjectService.

### GET /api/projects

Requires API key + ProjectService. Returns `getAllProjects()` result.

### GET /api/projects/:jobNumber

200 with project JSON or 404 `{ error }`.

### POST /api/upload/packing-slip

Multipart: field `file` (image), body `po_number`.  
400 on validation; 500 if services missing; else upload result JSON.

### POST /api/upload/intake

Same shape as packing-slip; intake folder + auto-numbering.

## Modules present — FilenameEncodedSurface (`files.js`)

Intended routes (wiring Target):

| Method | Path | Body / params |
|--------|------|----------------|
| GET | `/health` | — |
| POST | `/upload` | `file`, `filename`, optional `metadata` |
| GET | `/list/:directory` | directory name |
| GET | `/config` | returns directories, port, rootDirectory (no secrets ideally) |

Upload success shape (`fileService.uploadFile`):

```json
{
  "success": true,
  "filename": "...",
  "directory": "INTAKE",
  "size": 123,
  "path": "...",
  "uploadedAt": "<iso>"
}
```

Errors: JSON `{ "error": "<message>" }` with 400/401/500 as coded.

## Feature flags (`server.js` env)

`ENABLE_HEALTH_ENDPOINT`, `ENABLE_STATUS_ENDPOINT`, `ENABLE_PROJECTS_LIST_ENDPOINT`, `ENABLE_PROJECT_LOOKUP_ENDPOINT`, `ENABLE_UPLOAD_ENDPOINT` (default on unless `false`).
