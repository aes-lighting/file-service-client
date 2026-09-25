# Evidence — Ontology phase 0 foundation

**Date:** 2026-09-25  
**Domain:** `files:` (`https://aes-lighting.com/ns/files#`)

## Delivered

- Catalog, generated TBox, curated axioms, SHACL + enums
- Fixtures: `valid-upload.ttl`, `reject-bad-directory.ttl`
- Snapshot extract from JS + `config.example.json`
- Three-gate `validate_spec.py` (contract → SHACL → OWL-RL)

## Entities

**Live:** StoredFile, Directory, UploadRequest, SidecarMetadata, ApiCredential, FilenameEncodedUpload, ProjectBoundUpload  

**Target:** WindowsShare, Project, ProjectTemplate, ProjectCache

## Gate command

```bash
.specify/scripts/run_validate_spec.sh
```
