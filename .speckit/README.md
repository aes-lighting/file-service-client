# AES File Service Client Spec Kit

Welcome to the spec-driven development documentation for AES File Service Client. This directory contains specifications, implementation plans, and task tracking for all features.

## Quick Navigation

### Constitution & Standards
- **[CONSTITUTION.md](./CONSTITUTION.md)** — Project-wide principles, standards, and guidelines

### Active Specifications
- **[spec-windows-projects.md](./specs/spec-windows-projects.md)** — Windows file server project discovery and management

### Implementation Plans
- **[plan-windows-projects.md](./plans/plan-windows-projects.md)** — Phased implementation roadmap (Phases 1-4)

### Tasks (Generated from Plans)
- See `./tasks/` directory for individual task files (to be generated during execution)

---

## Directory Structure

```
.speckit/
├── CONSTITUTION.md              # Project-wide standards & principles
├── README.md                     # This file
│
├── specs/                        # Formal specifications
│   └── spec-windows-projects.md  # Windows file server project discovery
│
├── plans/                        # Implementation plans
│   └── plan-windows-projects.md  # 4-phase implementation roadmap
│
└── tasks/                        # Individual executable tasks
    ├── task-phase1-*.md         # Phase 1 infrastructure tasks
    ├── task-phase2-*.md         # Phase 2 scanner tasks
    └── task-*.md                # Future tasks
```

---

## Current Projects

### 1. Windows File Server Project Discovery
**Status**: Specification Complete, Ready for Phase 1 Implementation  
**Timeline**: 3-4 weeks  
**Owner**: Chris  

**What It Does**:
- Auto-discovers project folders on Windows DC file server
- Exposes projects via HTTP API for consuming applications
- Maintains cache for fast API responses
- Enables creating new projects with template copying
- Provides live index of all jobs on file server

**Key Files**:
- Specification: `specs/spec-windows-projects.md`
- Implementation Plan: `plans/plan-windows-projects.md`
- Tasks: `tasks/task-phase*.md` (to be generated)

**API Endpoints** (to be implemented):
- `GET /api/projects/list` — List all discovered projects
- `GET /api/projects/:jobNumber` — Get project details
- `GET /api/projects/scan/status` — Scan status
- `POST /api/projects/scan` — Trigger manual scan
- `GET /api/projects/templates` — List templates
- `POST /api/projects/create` — Create new project

**Next Step**: Review specification and begin Phase 1 implementation

---

## How to Use This Spec Kit

### For Understanding a Feature
1. Read the specification in `specs/spec-*.md`
   - Understand requirements, architecture, API endpoints
   - Review success criteria and testing strategy

2. Read the implementation plan in `plans/plan-*.md`
   - Understand phased approach and dependencies
   - Know which files will be created/modified

### For Implementing a Feature
1. Start with **Phase 1** of the plan
2. Work through deliverables
3. Update task status as work progresses
4. Move to next phase when current phase is complete

### For New Features
1. Create a new specification file: `specs/spec-<feature>.md`
2. Follow the template in CONSTITUTION.md
3. Create corresponding plan: `plans/plan-<feature>.md`
4. Generate task files as you begin implementation

---

## Integration with Other Projects

### Logistics Application
- **Dependency**: Logistics will consume this service's API
- **Not in this spec**: Logistics-specific UI or logic
- **Scope**: This service exposes project discovery as HTTP API
- **Future**: Logistics will call `/api/projects/list` to populate PM Portal

### Other Services
- This service can be consumed by any application needing file/project operations
- Future: Photo uploads, document management, etc. can be added to this service

---

## Workflow

### Creating a New Specification
```markdown
1. Create file: .speckit/specs/spec-<feature-name>.md
2. Fill out all 10 sections (see CONSTITUTION.md)
3. Commit to git: [spec] <feature>: initial specification
4. Review and approve
```

### Creating a New Implementation Plan
```markdown
1. Reference the specification
2. Create file: .speckit/plans/plan-<feature-name>.md
3. Break into phases with deliverables
4. Commit to git: [spec] <feature>: implementation plan
```

### Tracking Implementation
```markdown
1. Generate task files from plan
2. Update task status as work progresses
3. Commit to git: [impl] <feature>: <phase/deliverable>
4. Move task to completed when done
```

---

## Key Concepts

### Specification vs. Implementation
- **Specification**: "What" we're building, "why," and design rationale
- **Implementation**: "How" we build it in code
- Specs document intent; code documents mechanism

### Phased Delivery
- Projects broken into phases with clear dependencies
- Each phase has deliverables, critical files, and success criteria
- Enables parallel work and incremental progress

### Traceability
- Every line of code links back to a requirement
- Every task links back to a deliverable in the plan
- Specs stay in sync with implementation (updated as we learn)

---

## Git Commit Conventions

When committing changes related to specs:

```bash
# Specification changes
git commit -m "[spec] <feature>: <change description>"

# Implementation changes
git commit -m "[impl] <feature>/<phase>: <change description>"

# Documentation changes
git commit -m "[doc] <feature>: <change description>"
```

Example:
```bash
git commit -m "[spec] windows-projects: add SMB connection details"
git commit -m "[impl] windows-projects/phase-1: create windowsServerClient.js"
git commit -m "[doc] windows-projects: update Phase 2 timeline"
```

---

## Questions?

For clarification on:
- **Requirements**: See the specification (spec-*.md)
- **Implementation approach**: See the plan (plan-*.md)
- **Standards & principles**: See CONSTITUTION.md
- **Current task**: See tasks/ directory

---

**Last Updated**: September 9, 2026  
**Spec Kit Version**: 1.0  
**Status**: Ready for implementation
