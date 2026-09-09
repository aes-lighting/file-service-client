# AES File Service Client Spec Kit Constitution

This document establishes the principles and standards for spec-driven development in the file-service-client repository.

## Core Principles

### 1. Service Responsibility
- File Service Client is responsible for **all file and folder operations**
- This includes: uploads, downloads, directory scanning, metadata management
- Other applications (logistics, etc.) consume this service via HTTP API
- No file operations logic belongs in consuming applications

### 2. Specification First
- All features begin with a formal specification
- Specs define **what** the service does before code is written
- Specs are living documents synchronized with implementation

### 3. API-First Design
- Service is consumed via REST HTTP API
- Every feature adds endpoints with clear request/response contracts
- API changes are documented and versioned

### 4. Technology Stack
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Authentication**: API Key (X-API-Key header)
- **File Handling**: fs (Node built-in), Multer for uploads
- **SMB/Windows Access**: smbprotocol library
- **Configuration**: JSON-based config files

### 5. Configuration Management
- Sensitive data (API keys, SMB credentials) stored in environment variables
- Non-sensitive config (directories, paths) in config.json
- `.env.example` documents all required environment variables
- No secrets committed to git

### 6. Error Handling
- All errors return JSON: `{ error: "message", code: "ERROR_CODE" }`
- HTTP status codes used correctly: 400 (bad request), 401 (auth), 403 (forbidden), 404 (not found), 500 (server error)
- Errors logged with context for debugging

### 7. Logging
- All operations logged to console and file
- Log format: `[timestamp] LEVEL: message { context }`
- Security-sensitive data (passwords, keys) never logged
- Logs helpful for troubleshooting and audit trail

### 8. Code Organization
- `src/index.js` — Entry point, starts server
- `src/server.js` — Express app configuration
- `src/services/*.js` — Business logic (FileService, ProjectService, etc.)
- `src/routes/*.js` — API endpoints
- `src/middleware/*.js` — Authentication, validation
- `src/utils/*.js` — Helpers (logger, etc.)
- `config/` — Configuration files
- `cache/` — Temporary cache files (discovered projects, etc.)

### 9. Testing
- Unit tests for services
- Integration tests for API endpoints
- Manual testing documented in setup guides

### 10. Documentation
- Specs serve as primary documentation
- README.md explains what the service does
- Setup guides for developers and operators
- API documentation with examples

## Specification Template

All specs should follow this structure:

1. **Overview** — 1-2 sentence summary
2. **Requirements** — Numbered must-haves
3. **Architecture** — Data flow, components, integrations
4. **API Endpoints** — HTTP method, path, request/response formats
5. **Data Models** — JSON schema or structure definitions
6. **Configuration** — Environment variables, config settings
7. **Implementation Plan** — Phased approach, timeline
8. **Success Criteria** — Verification checklist
9. **Testing** — Unit, integration, manual tests
10. **Deployment** — Environment setup, dependencies, rollback

## File Naming Conventions

- Specs: `spec-<feature-name>.md`
- Plans: `plan-<feature-name>.md`
- Tasks: `task-<phase>-<number>.md`

## Version Control

- `.speckit/` directory committed to git
- Specs and plans stay in sync with code
- Git commit messages:
  - `[spec] <feature>: <change>` for spec updates
  - `[impl] <feature>: <change>` for code changes
  - `[doc] <feature>: <change>` for documentation

---

**Constitution Version**: 1.0  
**Adopted**: September 9, 2026  
**Last Modified**: September 9, 2026
