# Spec 002 — Windows File Server Project Discovery

**Status**: Target / Roadmap  
**Version**: 1.0  
**Migrated from**: `.speckit/specs/spec-windows-projects.md` (2026-09-09)  
**Updated**: 2026-09-25  

> **Not Implemented.** `server.js` exposes related routes, but `windowsServerClient`, `projectService`, and `schedulerService` are **absent** from the tree. Do not invent operable behavior.

## 1. Overview

Discover, cache, and serve project folders on a Windows DC file server. Enable consumers to query projects, create projects from templates, and maintain a live index.

## 2. Requirements

### Functional (Target)

- **FR-1**: Scan configured UNC/local path for project folders; extract job numbers; periodic scans; on-disk cache.
- **FR-2**: API — list, get by job number, scan status, trigger scan (admin), templates list, create from template.
- **FR-3**: Cache-first reads; graceful degradation if file server unavailable.
- **FR-4**: Network errors logged; service remains up with stale cache.

### Non-functional (Target)

- Scan &lt;30s typical; API &lt;500ms; cache hit &lt;100ms.
- SMB credentials in env only; API key on endpoints; audit logging.

## 3. Architecture (Target)

```
Express → projectService → windowsServerClient → Windows DC (SMB / local path)
                ↓
         projects-cache.json
```

Observed stubs today: `GET /api/projects`, `GET /api/projects/:jobNumber`, `GET /api/status` in `server.js` requiring `app.locals.projectService`.

Canonical Target paths from prior spec (may differ from stubs):

- `GET /api/projects/list`
- `GET /api/projects/:jobNumber`
- `GET /api/projects/scan/status`
- `POST /api/projects/scan`
- `GET /api/projects/templates`
- `POST /api/projects/create`

Reconcile path names when implementing.

## 4. Success criteria (feature — not product MVP)

- [ ] SMB/local connect works
- [ ] Scanner populates cache
- [ ] List/get endpoints serve cache
- [ ] Template create works
- [ ] Scan interval configurable
- [ ] Offline file server does not crash process

Product MVP remains Deferred — see [../../mvp-definition.md](../../mvp-definition.md).
