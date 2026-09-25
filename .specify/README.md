# Spec Kit Index — AES File Service Client

Navigation for the binding Spec Kit under `.specify/`. Conventions follow GitHub Spec Kit shapes plus the ontology program used in sibling AES projects (`auth-service`, `logistics-express`, `my-accounting-v4`).

**Status legend:** **Implemented** | **Target** | **Roadmap** | **Deferred**

## Start here

| Artifact | Role | Status |
|----------|------|--------|
| [spec.md](./spec.md) | Binding agent & domain contract | Implemented |
| [memory/constitution.md](./memory/constitution.md) | Non-negotiable principles | Implemented |
| [memory/project-context.md](./memory/project-context.md) | Stack, layout, gaps | Implemented |
| [mvp-definition.md](./mvp-definition.md) | Product MVP success criteria | Deferred |
| [ontology/](./ontology/) | OWL + SHACL files domain (`files:`) | Implemented |
| [specs/001-file-service-baseline/](./specs/001-file-service-baseline/) | Reverse-engineered baseline | Implemented (docs) |
| [specs/002-windows-projects/](./specs/002-windows-projects/) | Windows project discovery | Target |

## Specs

| Spec | Title |
|------|-------|
| [001](./specs/001-file-service-baseline/) | File service baseline (current tree) |
| [002](./specs/002-windows-projects/) | Windows DC project discovery |

## Operations

| Command | Purpose |
|---------|---------|
| `python3 .specify/scripts/validate_spec.py` | Three-gate ontology contract + SHACL + OWL-RL |
| `.specify/scripts/run_validate_spec.sh` | Same via local venv if present |
| `python3 .specify/scripts/extract_domain_snapshot.py` | Refresh domain snapshot from sources |
| `python3 .specify/scripts/generate_ontology.py` | Regenerate generated TTL + directory enums |

## Conventions

- **Implemented** — true of the live tree / documented as-built behavior today.
- **Target** — intended; modules or wiring missing.
- **Roadmap** — future product direction.
- **Deferred** — deliberately undefined (MVP) until owner update.

Human-readable architecture notes (non-binding): [`../spec-kit/`](../spec-kit/).
