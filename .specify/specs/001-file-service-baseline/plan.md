# Plan — Spec 001 File Service Baseline

**Status:** Documentation baseline complete; runtime hardening Target  
**Created:** 2026-09-25

## Phase 0 — Spec Kit (this change set)

1. Reverse-engineer HEAD into Spec 001 + binding `.specify/`
2. Ontology `files:` + validate scripts
3. Evidence packets

## Phase 1 — Wiring repair (Target)

1. Align module paths OR migrate to README `src/` tree
2. Provide `config.example.json` → local `config/config.json` flow without committing secrets
3. Fix `package.json` `main` / start script

## Phase 2 — Project services (Target → Spec 002)

1. Implement missing Windows/project/scheduler modules
2. Enable packing-slip / intake uploads end-to-end
3. Cache + scan interval

## Out of scope

- Owner MVP definition
- Railway/production hardening beyond documented Target notes
