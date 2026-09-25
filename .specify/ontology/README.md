# Files Domain Ontology — file-service-client

Formal OWL/RDFS + SHACL package for the AES File Service Client. **Ontological maintenance is required** for domain changes — see [../spec.md](../spec.md).

**Status:** `0.1.0-baseline` (reverse-engineered from HEAD modules + `config.example.json`).

## IRI namespace

| Prefix | IRI |
|--------|-----|
| `files:` | `https://aes-lighting.com/ns/files#` |

Open [files_domain.ttl](./files_domain.ttl) in Protégé. Prefer Turtle in Git.

## Files

| File | Maintainer | Purpose |
|------|------------|---------|
| [files_domain.ttl](./files_domain.ttl) | Thin catalog | `owl:imports` generated + axioms |
| [files_domain.generated.ttl](./files_domain.generated.ttl) | **Regenerated** | Classes/properties from domain snapshot |
| [files_domain.axioms.ttl](./files_domain.axioms.ttl) | Human | Surfaces, disjointness, agent must-nots |
| [files_domain.shacl.ttl](./files_domain.shacl.ttl) | Human | Instance shapes |
| [files_domain.shacl.enums.ttl](./files_domain.shacl.enums.ttl) | **Regenerated** | Directory `sh:in` lists |
| [catalog-v001.xml](./catalog-v001.xml) | Protégé | Catalog |
| [fixtures/](./fixtures/) | Human | Valid + deliberate-reject graphs |
| [snapshots/](./snapshots/) | **Regenerated** | Domain extract + freshness hash |

Do **not** hand-edit `files_domain.generated.ttl`, `files_domain.shacl.enums.ttl`, or committed domain snapshots. Edit sources / curated axioms / `ontology_map.py`, then regenerate.

## Neurosymbolic ownership

| Layer | Owns | Does not own |
|-------|------|--------------|
| **OWL-RL** | TBox consistency | HTTP auth / path safety |
| **SHACL** | Types, closed directories, fixtures | Multer limits, SMB crypto |
| **Node + Express + fs** | Uploads, auth checks, I/O | Spec Kit graph conceptualization |
| **Agents** | Propose changes | Auto-deploy secret policy |
| **Human owner** | Acceptance, production secrets | — |

## Directories (closed)

`INTAKE` | `DELIVERY` | `IN-TRANSIT`

## Validate

```bash
pip install -r .specify/scripts/requirements.txt
python3 .specify/scripts/validate_spec.py
```
