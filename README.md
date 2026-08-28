# AES File Service V0

**Version 0: MVP for local testing and feedback**

This is a minimal but functional file upload service designed for testing before production deployment and Railway integration.

## What It Does

- ✅ Accepts file uploads via HTTP API
- ✅ Routes files to directories based on **filename encoding**
- ✅ Stores optional JSON metadata alongside files
- ✅ Simple API key authentication
- ✅ Whitelist-based directory access

## Filename Encoding

Files are routed based on their name, not API parameters.

**Format:** `DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext`

**Examples:**
- `INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg` → Saves to `./test-files/INTAKE/`
- `DELIVERY_TRUCK-001_2026-08-28T14-30-00_def456.jpg` → Saves to `./test-files/DELIVERY/`
- `IN-TRANSIT_ROUTE-42_2026-08-28T15-00-00_ghi789.jpg` → Saves to `./test-files/IN-TRANSIT/`

## Quick Start

```bash
npm install
npm start
```

See **QUICKSTART.md** for testing examples.

## Architecture

```
Client (Logistics App)
    ↓
POST /api/upload
    │
    ├─ Authenticate (X-API-Key)
    ├─ Parse filename for directory
    ├─ Validate directory is whitelisted
    ├─ Save file to correct directory
    ├─ (Optional) Save JSON metadata sidecar
    └─ Return success response
```

## Directory Structure

```
aes-file-service-v0/
├── src/
│   ├── index.js              (Entry point)
│   ├── server.js             (Express app)
│   ├── config.js             (Config loader)
│   ├── routes/files.js       (API endpoints)
│   ├── middleware/auth.js    (API key validation)
│   ├── services/fileService.js (File operations)
│   └── utils/logger.js       (Logging)
├── config/
│   └── config.json           (Configuration)
├── test-files/               (Storage, auto-created)
├── logs/                     (Logs, auto-created)
├── package.json
├── QUICKSTART.md             (Testing guide)
└── README.md                 (This file)
```

## Configuration

Edit `config/config.json`:

```json
{
  "service": {
    "port": 3001,
    "host": "127.0.0.1"
  },
  "storage": {
    "rootDirectory": "./test-files",
    "maxFileSize": 52428800
  },
  "directories": [
    {"name": "INTAKE", "path": "INTAKE"},
    {"name": "DELIVERY", "path": "DELIVERY"},
    {"name": "IN-TRANSIT", "path": "IN-TRANSIT"}
  ],
  "authentication": {
    "apiKey": "test-api-key-12345"
  }
}
```

### Add a Directory

```json
{
  "name": "DAMAGE",
  "path": "DAMAGE"
}
```

Restart the service and files with `DAMAGE_...` prefix will route there.

### Change API Key

```json
"authentication": {
  "apiKey": "your-new-key-12345"
}
```

All requests must include this in the `X-API-Key` header.

## API Endpoints

### POST /api/upload

Upload a file with directory encoded in filename.

**Example:**
```bash
curl -X POST http://127.0.0.1:3001/api/upload \
  -H "X-API-Key: test-api-key-12345" \
  -F "file=@photo.jpg" \
  -F "filename=INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg" \
  -F "metadata={\"uploadedBy\":\"driver-7\"}"
```

**Response:**
```json
{
  "success": true,
  "filename": "INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg",
  "directory": "INTAKE",
  "size": 2048576,
  "path": "./test-files/INTAKE/INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg",
  "uploadedAt": "2026-08-28T14:23:00.000Z",
  "metadataSaved": true
}
```

### GET /api/list/:directory

List files in a directory.

**Example:**
```bash
curl http://127.0.0.1:3001/api/list/INTAKE \
  -H "X-API-Key: test-api-key-12345"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "name": "INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg",
        "size": 2048576,
        "modifiedAt": "2026-08-28T14:23:00.000Z"
      }
    ],
    "directory": "INTAKE"
  }
}
```

### GET /api/config

Get service configuration (for debugging).

**Example:**
```bash
curl http://127.0.0.1:3001/api/config \
  -H "X-API-Key: test-api-key-12345"
```

**Response:**
```json
{
  "directories": ["INTAKE", "DELIVERY", "IN-TRANSIT"],
  "port": 3001,
  "rootDirectory": "./test-files"
}
```

### GET /api/health

Health check (no authentication required).

**Example:**
```bash
curl http://127.0.0.1:3001/api/health
```

**Response:**
```json
{"status":"ok","service":"AES File Service V0","timestamp":"2026-08-28T..."}
```

## Metadata (JSON Sidecar)

When you upload a file with metadata, the service creates a `.json` file alongside it:

**Upload:**
```bash
curl -X POST http://127.0.0.1:3001/api/upload \
  -H "X-API-Key: test-api-key-12345" \
  -F "file=@photo.jpg" \
  -F "filename=INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg" \
  -F "metadata={\"uploadedBy\":\"driver-7\",\"location\":\"Dock 2\",\"quality\":\"high-res\"}"
```

**Creates two files:**
1. `./test-files/INTAKE/INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg`
2. `./test-files/INTAKE/INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.json`

**JSON contents:**
```json
{
  "uploadedBy": "driver-7",
  "location": "Dock 2",
  "quality": "high-res"
}
```

This enables future processing logic without changing the API.

## Logging

**Console output:**
- Watch terminal while running

**File logs:**
```bash
cat logs/service.log
```

**Log format:**
```
[2026-08-28T14:23:00.000Z] INFO: File uploaded {"filename":"...","directory":"INTAKE","size":2048576}
```

## Error Handling

**Missing API key:**
```json
{"error":"Missing X-API-Key header"}
```

**Invalid API key:**
```json
{"error":"Invalid API key"}
```

**Invalid filename format:**
```json
{"error":"Invalid filename format. Expected: DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext"}
```

**Directory not whitelisted:**
```json
{"error":"Directory 'INVALID' is not whitelisted. Available: INTAKE, DELIVERY, IN-TRANSIT"}
```

## Testing Checklist

- [ ] Server starts: `npm start`
- [ ] Health check works: `curl http://127.0.0.1:3001/api/health`
- [ ] Config endpoint works with API key
- [ ] Upload file to INTAKE directory
- [ ] Upload file with metadata
- [ ] List INTAKE directory
- [ ] Verify files saved to disk: `ls ./test-files/INTAKE/`
- [ ] Test invalid API key (should fail)
- [ ] Test invalid directory (should fail)
- [ ] Test missing filename parameter
- [ ] Add new directory to config.json, restart, test it works

## Next Steps

1. **Test locally** - Follow QUICKSTART.md
2. **Provide feedback** - What works? What needs changing?
3. **Deploy to Railway** - Once stable, deploy as a service
4. **Other apps integrate** - Logistics app and other services call the API
5. **Add features** - As needed (web UI, more endpoints, etc.)

## Known Limitations (V0)

- No persistent database (files tracked only on filesystem)
- No audit logging to database
- No file deletion endpoint
- No bulk operations
- No authentication beyond simple API key
- No rate limiting

These can be added in V1 if needed.

## Support

If you encounter issues:

1. Check `logs/service.log`
2. Verify `config/config.json` is valid JSON
3. Check API key in header matches config
4. Verify directory name is in whitelist
5. Check filename format is correct: `DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext`

## Architecture Diagram

```
┌─────────────────────────────────────┐
│   Logistics App / Other Services    │
└────────────────┬────────────────────┘
                 │
                 │ POST /api/upload
                 │ X-API-Key: test-api-key-12345
                 ↓
    ┌────────────────────────────┐
    │   Express Server (V0)      │
    │  http://127.0.0.1:3001     │
    └────────────────────────────┘
              ↓
    ┌────────────────────────────┐
    │   Route: /api/upload       │
    │ - Authenticate             │
    │ - Parse filename           │
    │ - Validate directory       │
    │ - Save file                │
    │ - Save metadata (optional) │
    └────────────────────────────┘
              ↓
    ┌────────────────────────────┐
    │   File System              │
    │   ./test-files/            │
    │   ├── INTAKE/              │
    │   ├── DELIVERY/            │
    │   └── IN-TRANSIT/          │
    └────────────────────────────┘
```

## Future: Railway Deployment

Once V0 is stable, the same code deploys to Railway:

```
User/App → https://your-railway-url/api/upload
            ↓
         Railway Container
         (Same Node.js code)
            ↓
         Persistent Storage
         (Railway Postgres or S3)
```

## Technologies

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **File Handling:** Multer
- **Logging:** File + console

## License

MIT
