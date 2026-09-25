# file-service-client Constitution

**Version:** 1.1.0 | **Ratified:** 2026-09-09 | **Last Amended:** 2026-09-25

Migrated from `.speckit/CONSTITUTION.md` and aligned to as-built reverse-engineering.

## Principles

1. **Service responsibility** — This service owns file and folder operations for AES Logistics consumers. Consuming apps call the HTTP API; they do not re-implement storage logic.
2. **Evidence before Implemented** — Reverse-engineer and record before claiming behavior is Implemented. Do not describe Target or aspirational README layout as live.
3. **Specification first** — Features begin with a Spec Kit artifact under `.specify/specs/`. Specs stay synchronized with code.
4. **API-first** — REST HTTP with documented request/response contracts. API changes update Spec Kit in the same change set.
5. **Stack baseline** — Node.js ≥16, Express, Multer, `fs`, JSON config; API key via `X-API-Key`. SMB/Windows access is Target until modules land.
6. **Secrets stay outside Git** — Never commit API keys, SMB passwords, or `.env`. Prefer env vars for secrets; example config only with placeholders.
7. **Honest dual surfaces** — Filename-encoded V0 upload and project-bound packing-slip upload are distinct; do not collapse them. Do not invent operable routes from missing modules.
8. **Ontology complements runtime** — Node/Express/`fs` own I/O correctness; OWL/SHACL own vocabulary and surface law. Domain changes update `.specify/spec.md` + `.specify/ontology/` and pass `validate_spec.py` in the same change set.
9. **MVP remains Deferred** — Until the owner authors [mvp-definition.md](../mvp-definition.md), do not invent product success criteria.
10. **Evidence for future agents** — Leave packets under `.specify/evidence/`. Prefer small, reviewable changes.

## Code organization (as-built vs Target)

**Implemented (present today):** flat root modules (`server.js`, `index.js`, `fileService.js`, `files.js`, `auth.js`, `config.js`, `logger.js`) plus `src/services/uploadService.js`.

**Target (README / constitution aspirational):**

- `src/index.js`, `src/server.js`, `src/routes/`, `src/middleware/`, `src/services/`, `src/utils/`, `config/`, `cache/`

Do not claim the Target tree is Implemented until the migration lands.

## Required validation (domain changes)

When changing file/domain behavior, record:

- Git status before and after
- Validation: `python3 .specify/scripts/validate_spec.py`
- Files changed
- Security impact (auth, path traversal, secrets)
- Remaining risks

## Version control prefixes

- `[spec]` — Spec Kit / ontology updates
- `[impl]` — runtime code
- `[doc]` — human docs only

## Amendments

Changes to this constitution require a PR with rationale and a SemVer bump:

- **MAJOR** — principle removal or incompatible redefinition
- **MINOR** — new principle or material expansion
- **PATCH** — clarification only
