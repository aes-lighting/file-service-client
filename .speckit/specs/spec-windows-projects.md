# Specification: Windows File Server Project Discovery

**Status**: Draft  
**Version**: 1.0  
**Owner**: Chris (AES File Service)  
**Created**: September 9, 2026

---

## 1. Overview

Add capability to AES File Service Client to discover, cache, and serve information about project folders on a Windows DC file server. Enable consuming applications (logistics, etc.) to query available projects, create new projects with template copying, and maintain a live index of all jobs stored on the file server.

## 2. Requirements

### Functional Requirements

**FR-1**: Discover Windows file server projects
- Scan configured UNC path for project folders
- Extract job number and metadata from folder names
- Run periodic scans (configurable interval)
- Maintain cache of discovered projects

**FR-2**: Expose project discovery via API**
- GET `/api/projects/list` — List all discovered projects
- GET `/api/projects/:jobNumber` — Get single project details
- GET `/api/projects/scan/status` — Get latest scan status
- POST `/api/projects/scan` — Trigger manual scan (admin)

**FR-3**: Template management**
- GET `/api/projects/templates` — List available templates
- POST `/api/projects/create` — Create new project (copy template)

**FR-4**: Caching**
- Cache discovered projects to avoid expensive repeated scans
- Scan runs automatically in background (configurable interval)
- API serves cached data immediately
- Graceful degradation if file server unavailable

**FR-5**: Error handling**
- Network timeouts don't crash service
- Network errors logged and reported
- Service remains available even if file server offline

### Non-Functional Requirements

**NFR-1**: Performance
- Scan completes in <30 seconds (typical AES folder structure)
- API endpoints respond in <500ms
- Cache hit: <100ms response time

**NFR-2**: Reliability
- Automatic retry on transient network errors
- Graceful handling of file server unavailability
- Service continues operating with stale cache

**NFR-3**: Security
- SMB credentials stored in environment variables only
- Service account with read-only SMB permissions
- API key authentication on all endpoints
- All folder operations logged with timestamps

**NFR-4**: Maintainability
- Modular design: separate services for SMB, project logic
- Comprehensive logging for debugging
- Clear error messages for common issues

## 3. Architecture

### 3.1 Component Diagram

```
┌─────────────────────────────────────────────┐
│   Express Server (file-service-client)      │
├─────────────────────────────────────────────┤
│                                             │
│  Routes:                                    │
│  ├─ /api/projects/list                      │
│  ├─ /api/projects/<jobNumber>               │
│  ├─ /api/projects/scan                      │
│  └─ /api/projects/templates                 │
│                        ↓                     │
│  ┌──────────────────────────────┐           │
│  │  projectService.js           │           │
│  │  - CRUD operations           │           │
│  │  - Cache management          │           │
│  │  - Project creation          │           │
│  └──────────────────────────────┘           │
│                        ↓                     │
│  ┌──────────────────────────────┐           │
│  │  windowsServerClient.js      │           │
│  │  - SMB connection            │           │
│  │  - Folder discovery          │           │
│  │  - Template operations       │           │
│  └──────────────────────────────┘           │
│                        ↓                     │
│  ┌──────────────────────────────┐           │
│  │  projects-cache.json         │           │
│  │  (auto-generated, on disk)   │           │
│  └──────────────────────────────┘           │
│                                             │
└─────────────────────────────────────────────┘
                        ↓
              ┌─────────────────┐
              │  Windows DC     │
              │  File Server    │
              │  (SMB Share)    │
              │                 │
              │ \\dc\projects\  │
              │ \\dc\templates\ │
              └─────────────────┘
```

### 3.2 Data Flow: Scanning

1. **Startup**: Service initializes scanner (APScheduler or node-schedule)
2. **Scheduled Scan** (every N minutes):
   - Connect to Windows DC via SMB
   - List all folders in `\\dc\projects\`
   - Parse folder names: extract job number
   - Compare against previous cache
   - Save to `projects-cache.json`
   - If error: log warning, continue with old cache
3. **API Request**: Client requests `/api/projects/list`
   - Read from `projects-cache.json`
   - Return immediately (<100ms)

### 3.3 Data Flow: Project Creation

1. Client POSTs to `/api/projects/create` with job number, name, template
2. Validate job number (not already in use)
3. Copy template folder from `\\dc\templates\<template>` to `\\dc\projects\<NNNNN>_<Name>`
4. Update `projects-cache.json`
5. Return success with project ID

## 4. API Endpoints

All endpoints require `X-API-Key` header authentication.

### GET /api/projects/list

List all discovered projects.

**Request:**
```bash
curl http://localhost:3001/api/projects/list \
  -H "X-API-Key: your-api-key"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "jobNumber": "12345",
      "projectName": "Main Generator Install",
      "folderPath": "\\\\dc\\projects\\12345_MainGenerator",
      "folderSize": 5242880,
      "fileCount": 47,
      "discovered": true,
      "lastModified": "2026-09-08T15:00:00Z"
    },
    {
      "jobNumber": "67890",
      "projectName": "Distribution Panel",
      "folderPath": "\\\\dc\\projects\\67890_DistributionPanel",
      "folderSize": 1048576,
      "fileCount": 12,
      "discovered": true,
      "lastModified": "2026-09-07T10:00:00Z"
    }
  ],
  "total": 2,
  "cacheAge": "2 minutes",
  "lastScan": "2026-09-09T13:32:00Z"
}
```

### GET /api/projects/:jobNumber

Get details for a specific project.

**Request:**
```bash
curl http://localhost:3001/api/projects/12345 \
  -H "X-API-Key: your-api-key"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobNumber": "12345",
    "projectName": "Main Generator Install",
    "folderPath": "\\\\dc\\projects\\12345_MainGenerator",
    "folderSize": 5242880,
    "fileCount": 47,
    "subfolders": ["Documents", "Drawings", "Photos", "Warranty"],
    "lastModified": "2026-09-08T15:00:00Z"
  }
}
```

### GET /api/projects/scan/status

Get latest scan status.

**Request:**
```bash
curl http://localhost:3001/api/projects/scan/status \
  -H "X-API-Key: your-api-key"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "lastScan": "2026-09-09T13:32:00Z",
    "scanDuration": "12 seconds",
    "discovered": 2,
    "errors": [],
    "cacheSize": 2
  }
}
```

### POST /api/projects/scan

Manually trigger a scan (admin only).

**Request:**
```bash
curl -X POST http://localhost:3001/api/projects/scan \
  -H "X-API-Key: your-admin-api-key"
```

**Response (202):**
```json
{
  "success": true,
  "message": "Scan triggered",
  "scanId": "scan-abc123",
  "estimatedCompletion": "2026-09-09T13:33:00Z"
}
```

### GET /api/projects/templates

List available project templates.

**Request:**
```bash
curl http://localhost:3001/api/projects/templates \
  -H "X-API-Key: your-api-key"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Standard 3-Phase",
      "id": "standard_3_phase",
      "path": "\\\\dc\\templates\\standard_3_phase",
      "subfolders": ["Documents", "Drawings", "Photos", "Warranty"]
    },
    {
      "name": "Residential",
      "id": "residential",
      "path": "\\\\dc\\templates\\residential",
      "subfolders": ["Documents", "Photos", "Warranty"]
    }
  ]
}
```

### POST /api/projects/create

Create new project (copy template to new folder).

**Request:**
```bash
curl -X POST http://localhost:3001/api/projects/create \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jobNumber": "99999",
    "projectName": "New Installation",
    "templateId": "standard_3_phase"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "jobNumber": "99999",
    "projectName": "New Installation",
    "folderPath": "\\\\dc\\projects\\99999_NewInstallation",
    "template": "standard_3_phase",
    "created": "2026-09-09T13:35:00Z"
  }
}
```

## 5. Data Models

### Discovered Project (in cache)

```json
{
  "jobNumber": "12345",
  "projectName": "Main Generator Install",
  "folderPath": "\\\\dc\\projects\\12345_MainGenerator",
  "folderSize": 5242880,
  "fileCount": 47,
  "subfolders": ["Documents", "Drawings", "Photos", "Warranty"],
  "lastModified": "2026-09-08T15:00:00Z",
  "discovered": true
}
```

### Cache File (projects-cache.json)

```json
{
  "lastScan": "2026-09-09T13:32:00Z",
  "scanDuration": 12,
  "projects": [
    { "jobNumber": "12345", "projectName": "...", ... },
    { "jobNumber": "67890", "projectName": "...", ... }
  ],
  "errors": [],
  "metadata": {
    "scansCompleted": 145,
    "cacheVersion": 1
  }
}
```

## 6. Configuration

### Environment Variables

```env
# Windows File Server
WINDOWS_SERVER_UNC_PATH=\\dc\projects
WINDOWS_SERVER_TEMPLATES_PATH=\\dc\templates
WINDOWS_SERVER_USERNAME=logistics_service
WINDOWS_SERVER_PASSWORD=your-secure-password
WINDOWS_SERVER_DOMAIN=DOMAIN

# Project Scanning
PROJECT_SCAN_INTERVAL_MINUTES=5
PROJECT_SCAN_ENABLED=true

# Service
API_KEY=your-api-key
ADMIN_API_KEY=your-admin-api-key
```

### Config File (config/config.json)

```json
{
  "windows": {
    "uncPath": "\\\\dc\\projects",
    "templatesPath": "\\\\dc\\templates"
  },
  "projects": {
    "scanInterval": 5,
    "cacheFile": "./cache/projects-cache.json",
    "maxCacheAge": 300
  }
}
```

## 7. Implementation Plan

See `plan-windows-projects.md` for detailed phased implementation.

## 8. Success Criteria

- [ ] Service can connect to Windows DC via SMB
- [ ] Scanner discovers projects and extracts job numbers
- [ ] `/api/projects/list` returns cached project list
- [ ] `/api/projects/scan` triggers manual scan
- [ ] New projects can be created with template copying
- [ ] Scan runs automatically every N minutes
- [ ] Network unavailability doesn't crash service
- [ ] All operations logged with timestamps
- [ ] Performance: scan <30s, API responses <500ms

## 9. Testing

### Unit Tests
- `test-projects-service.js`: CRUD, validation, caching
- `test-windows-client.js`: SMB connection (mocked), path parsing
- `test-scanner.js`: Schedule logic, error handling

### Integration Tests
- Actual Windows DC connection (staging)
- Create project and verify folder created
- Scan and verify cache updates

### Manual Testing
- Scan existing projects
- Create new project
- Verify API responses
- Test error scenarios (network down, invalid paths)

## 10. Deployment

### Dependencies to Add

```bash
npm install smbprotocol node-schedule
```

### Environment Setup

1. Set Windows Server credentials in environment
2. Verify UNC paths are accessible
3. Ensure service account has read permissions
4. Configure scan interval (default: 5 minutes)

### Rollback

1. Remove endpoints from routes
2. Stop scheduler
3. Delete `cache/projects-cache.json` (optional)

---

**Approved By**: [Pending]  
**Implementation Start**: [Pending]  
**Target Completion**: [3-4 weeks, phased]
