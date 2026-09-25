# Plan — Spec 002 Windows Projects

**Migrated from**: `.speckit/plans/plan-windows-projects.md`  
**Status**: Target — ready when owner prioritizes implementation

## Phase 1 — Infrastructure & SMB

- Create `src/services/windowsServerClient.js` (connect, listFolders, copyFolder)
- Create `src/services/projectService.js` (cache CRUD, validation)
- Add deps (`smbprotocol` or Node SMB equivalent, `node-schedule`)
- `cache/projects-cache.json` template; `.env.example` Windows vars

## Phase 2 — Background scanner

- Scheduler / scanner service; integrate into `index.js` startup
- Stale-cache fallback; timeout recovery

## Phase 3 — REST API

- Projects router; mount on Express; admin key for manual scan
- Align route paths with Spec 002 + existing `server.js` stubs

## Phase 4 — Polish

- Perf, docs, tests, deploy prep

## Critical path

Phase 1 → 2 → 3 → 4 (linear).
