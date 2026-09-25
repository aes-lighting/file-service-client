# Agent & Domain Contract — file-service-client

> **Binding.** This document is the universal Spec Kit contract for **every** human and AI agent working on this repository. Informal prompts do not override it.

**Status legend:** **Implemented** | **Target** | **Roadmap** | **Deferred**

**Incorporation by reference (normative):**

| Artifact | Role |
|----------|------|
| [ontology/files_domain.ttl](./ontology/files_domain.ttl) | OWL catalog (`owl:imports` generated + axioms) |
| [ontology/files_domain.generated.ttl](./ontology/files_domain.generated.ttl) | Regenerated structural TBox |
| [ontology/files_domain.axioms.ttl](./ontology/files_domain.axioms.ttl) | Curated constraints / agent must-nots |
| [ontology/files_domain.shacl.ttl](./ontology/files_domain.shacl.ttl) | SHACL shapes |
| [ontology/files_domain.shacl.enums.ttl](./ontology/files_domain.shacl.enums.ttl) | Regenerated directory `sh:in` lists |
| [memory/constitution.md](./memory/constitution.md) | Non-negotiable principles |
| [memory/project-context.md](./memory/project-context.md) | Stack and layout baseline |
| [specs/001-file-service-baseline/](./specs/001-file-service-baseline/) | Reverse-engineered product baseline |
| [specs/002-windows-projects/](./specs/002-windows-projects/) | Windows project discovery (Target) |
| [mvp-definition.md](./mvp-definition.md) | Product MVP — **Deferred** |

## 1. Purpose

**AES File Service Client** owns file and folder operations for **AES Logistics**. Consumers upload and query via HTTP; this service routes to storage (local or UNC) according to filename encoding and/or project/PO rules.

Runtime authority for I/O remains **Node.js + Express + Multer + `fs`**. The Spec Kit ontology complements that authority; it does **not** replace it.

Markers (normative vocabulary for validation): `OntologyRequired`, `PolicyNoSecretsInGit`, `PolicyDualSurfaceHonesty`, `PolicyNoInventLiveRoutesFromLib`, `PolicyMvpDeferred`.

## 2. Surfaces (must not collapse)

| Surface | Status | Notes |
|---------|--------|-------|
| Public health | Implemented (code in `server.js`) | `GET /health` — no API key |
| FilenameEncodedSurface | Implemented (modules) / Target (wiring) | `fileService.js` + `files.js` — broken requires |
| ProjectBoundUploadSurface | Partial | `server.js` + `uploadService.js`; needs ProjectService |
| ProjectDiscoverySurface | Target | Routes stubbed; modules missing — Spec 002 |
| AiRawAdvice | Never operational law | Unreviewed agent output |

Agents must not invent operable HTTP behavior from missing `src/services/*` modules (`PolicyNoInventLiveRoutesFromLib`).

## 3. Ontology maintenance

Domain-affecting entity, directory vocabulary, filename grammar, or surface changes must update this Spec Kit (`.specify/spec.md` + `.specify/ontology/`) and pass `python3 .specify/scripts/validate_spec.py` in the **same change set** (`OntologyRequired`).

## 4. Agent must-nots

1. Do not commit secrets (`API_KEY`, SMB passwords, `config/config.json` with real keys, `.env`) — `PolicyNoSecretsInGit`.
2. Do not treat ontology / SHACL success as proof of secure path handling or auth.
3. Do not describe Target SMB/project discovery as Implemented.
4. Do not redefine MVP success criteria — update [mvp-definition.md](./mvp-definition.md) when the owner defines it (`PolicyMvpDeferred`).
5. Do not collapse FilenameEncodedSurface with ProjectBoundUploadSurface (`PolicyDualSurfaceHonesty`).

## 5. IRI prefix

| Prefix | IRI |
|--------|-----|
| `files:` | `https://aes-lighting.com/ns/files#` |

## 6. Validation

```bash
python3 .specify/scripts/validate_spec.py
# or
.specify/scripts/run_validate_spec.sh
```

Three gates (all required): contract → SHACL instances → OWL-RL TBox.
