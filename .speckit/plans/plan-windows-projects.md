# Implementation Plan: Windows File Server Project Discovery

**Spec Reference**: `spec-windows-projects.md`  
**Timeline**: 3-4 weeks  
**Status**: Ready for phase-based execution

---

## Overview

This plan breaks the Windows file server project discovery feature into 4 phases, each with clear deliverables and success criteria.

## Phase 1: Infrastructure & SMB Connection (Week 1)

**Objective**: Establish Windows file server connectivity and project discovery foundation.

### Deliverables

1. **Create `src/services/windowsServerClient.js`**
   - Implement SMB connection using `smbprotocol`
   - Path parsing: extract job number from folder names
   - Folder discovery: list all folders matching pattern
   - Error handling: network timeouts, connection failures
   - Functions: connect(), listFolders(), validateTemplate(), copyFolder()

2. **Create `src/services/projectService.js`**
   - Project CRUD operations (in-memory for now)
   - Cache management: read/write `projects-cache.json`
   - Validation: job number format, uniqueness
   - Functions: listProjects(), getProject(), createProject(), scanProjects()

3. **Update `package.json`**
   - Add `smbprotocol@^1.10.0`
   - Add `node-schedule@^2.1.0`

4. **Create `cache/` directory**
   - Create `cache/projects-cache.json` template
   - Initialize with empty projects array

5. **Update `.env.example`**
   ```env
   WINDOWS_SERVER_UNC_PATH=\\dc\projects
   WINDOWS_SERVER_TEMPLATES_PATH=\\dc\templates
   WINDOWS_SERVER_USERNAME=logistics_service
   WINDOWS_SERVER_PASSWORD=your-password
   PROJECT_SCAN_INTERVAL_MINUTES=5
   ```

### Critical Files
- `src/services/windowsServerClient.js` (NEW)
- `src/services/projectService.js` (NEW)
- `package.json` (MODIFIED)
- `.env.example` (MODIFIED)
- `cache/projects-cache.json` (NEW - template)

### Success Criteria
- [ ] `windowsServerClient.js` connects to Windows DC (test with actual UNC path)
- [ ] Folder listing works without crashing
- [ ] Job number extraction works (5-digit prefix pattern)
- [ ] `projectService.js` passes unit tests
- [ ] Cache file can be read/written
- [ ] All dependencies in package.json

### Testing
- Unit tests: `test-windows-client.js`, `test-project-service.js`
- Manual: Connect to actual Windows DC, list folders
- Manual: Parse sample folder names, verify job extraction

---

## Phase 2: Background Scanner (Week 1-2)

**Objective**: Implement automatic project discovery with background scanning.

### Deliverables

1. **Create `src/services/projectScanner.js`**
   - Implement node-schedule based scanner
   - Scheduled scan function: runs every N minutes
   - Discovery logic: list folders, extract job numbers
   - Cache update: write to `projects-cache.json`
   - Error handling: network errors, timeout recovery
   - Logging: comprehensive diagnostics

2. **Integrate scanner into Express app**
   - Initialize scheduler in `src/index.js` startup
   - Graceful shutdown on app exit
   - Log scanner health on startup

3. **Implement cache management**
   - Read cache on startup
   - Update cache after each scan
   - Detect stale cache (age > max age)
   - Fallback to stale cache if scan fails

4. **Error recovery**
   - Network timeout handling
   - Partial scan recovery
   - Retry logic for transient failures

### Critical Files
- `src/services/projectScanner.js` (NEW)
- `src/index.js` (MODIFIED - add scheduler init)
- `cache/projects-cache.json` (auto-updated)

### Success Criteria
- [ ] Scanner runs automatically without manual intervention
- [ ] Scan completes in <30 seconds
- [ ] Cache updates after each scan
- [ ] Network timeout doesn't crash app
- [ ] Stale cache served if scan fails
- [ ] Logging shows scan activity

### Testing
- Unit tests: `test-scanner.js` (mock SMB)
- Integration: actual file server, verify cache updates
- Stress: measure scan time with 100+ folders
- Error simulation: disconnect mid-scan, verify recovery

---

## Phase 3: REST API Endpoints (Week 2)

**Objective**: Expose project discovery via HTTP API with authentication.

### Deliverables

1. **Create `src/routes/projects.js`**
   - GET `/api/projects/list` — list all projects
   - GET `/api/projects/:jobNumber` — get project details
   - GET `/api/projects/scan/status` — scan status
   - POST `/api/projects/scan` — trigger manual scan (admin)
   - GET `/api/projects/templates` — list templates
   - POST `/api/projects/create` — create new project

2. **Update `src/server.js`**
   - Mount projects router: `app.use('/api', projectsRouter)`

3. **Implement authentication middleware**
   - Reuse existing `src/middleware/auth.js` for API key validation
   - Add admin API key support

4. **Error handling**
   - Validate input (job number format, required fields)
   - Return meaningful error messages
   - Proper HTTP status codes

5. **Response formatting**
   - All successful responses: `{ success: true, data: {...} }`
   - All error responses: `{ error: "message", code: "ERROR_CODE" }`
   - Include metadata: timestamps, cache age

### Critical Files
- `src/routes/projects.js` (NEW)
- `src/server.js` (MODIFIED - add router)
- `src/middleware/auth.js` (MODIFIED - add admin key)

### Success Criteria
- [ ] All endpoints return proper HTTP status codes
- [ ] Authentication restricts access as specified
- [ ] Input validation prevents invalid data
- [ ] List endpoint returns cached projects in <500ms
- [ ] Error responses include descriptive messages
- [ ] API documentation complete

### Testing
- Unit tests: mock Express test client
- Integration tests: end-to-end API flows
- Auth tests: verify API key validation
- Error cases: invalid input, network down

---

## Phase 4: Integration & Documentation (Week 3-4)

**Objective**: Polish, optimize, and document for production use.

### Deliverables

1. **Performance optimization**
   - Profile scanner: reduce if >30 seconds
   - Optimize cache read/write
   - Add response caching headers

2. **Error handling & logging**
   - Comprehensive error logging
   - Admin endpoint for scan diagnostics
   - Clear error messages for common issues

3. **Documentation**
   - Update README.md with new endpoints
   - API documentation with examples
   - Setup guide for Windows Server integration
   - Troubleshooting guide

4. **Testing & QA**
   - Full test suite execution
   - Load testing: 500+ projects
   - Security review: auth, input validation
   - Manual testing of all flows

5. **Deployment preparation**
   - Update config examples
   - Environment variable documentation
   - Rollback plan
   - Monitoring setup

### Critical Files
- `README.md` (MODIFIED)
- `src/routes/projects.js` (MODIFIED - final polish)
- `.env.example` (MODIFIED - complete)
- All test files (MODIFIED - comprehensive)

### Success Criteria
- [ ] All unit and integration tests pass
- [ ] Performance targets met
- [ ] Documentation complete and accurate
- [ ] No known bugs or edge cases
- [ ] Ready for production deployment

---

## Dependency & Critical Path

```
Phase 1 (Infrastructure)
    ↓
Phase 2 (Scanner)
    ↓
Phase 3 (API)
    ↓
Phase 4 (Polish & Docs)
```

**Critical Path**: Linear dependency (each phase depends on previous)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Windows DC unreachable during dev | Blocks testing | Use mock SMB for unit tests |
| SMB auth issues | Can't access server | Early testing with actual credentials |
| Slow folder scans (1000+) | Performance problems | Implement async scanning, chunked traversal |
| Job number collisions | Data integrity | Add unique constraint in cache |
| Cache corruption | Lost data | Implement cache versioning, backups |

---

## Checklist

- [ ] Phase 1 complete: SMB connection and service working
- [ ] Phase 2 complete: Scanner running and caching projects
- [ ] Phase 3 complete: API endpoints functional and tested
- [ ] Phase 4 complete: Documented and optimized
- [ ] All tests passing: unit, integration, manual
- [ ] Deployed to production: environment variables configured
- [ ] Monitoring in place: alerts for scan failures

---

**Plan Created**: September 9, 2026  
**Plan Status**: Ready for phase-based execution  
**Next Step**: Approve spec and begin Phase 1
