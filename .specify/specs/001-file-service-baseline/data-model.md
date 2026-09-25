# Data model — Spec 001

## Filename grammar (FilenameEncodedSurface)

```
DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext
```

| Part | Rule |
|------|------|
| `DIRECTORY` | First `_`-segment; uppercased; must match whitelist `directories[].path` |
| Remainder | Rest of basename including further `_` segments |
| Extension | Preserved on stored file |

Example: `INTAKE_SHIP-12345_2026-08-28T14-23-00_abc123.jpg`

## Directory (whitelist)

From `config.example.json`:

| name | path |
|------|------|
| INTAKE | INTAKE |
| DELIVERY | DELIVERY |
| IN-TRANSIT | IN-TRANSIT |

Stored under `storage.rootDirectory` / `{DIRECTORY}` / `{originalFilename}`.

## SidecarMetadata

Path: same directory, basename with extension replaced by `.json`. Arbitrary JSON object from upload `metadata` field.

## ProjectBoundUpload (Partial)

| Field | Rule |
|-------|------|
| `po_number` | `/^\d{5}-\d{2}$/` |
| Project number | First five digits of PO |
| Packing slip path | `{base}/{folderPath}/PROJECT MANAGEMENT/Accounting Docs/Purchase Orders and Packing Slips/Packing Slips/{po}{ext}` |
| Intake path | `…/Packing Slips/INTAKE/` with `{po}_{n}{ext}` collision suffix |

## ApiCredential

Shared secret string compared to `X-API-Key` (and optionally `apiKey` query on `server.js`).

## Entities (ontology)

Live conceptual: `StoredFile`, `Directory`, `UploadRequest`, `SidecarMetadata`, `ApiCredential`, `FilenameEncodedUpload`, `ProjectBoundUpload`.  
Target: `WindowsShare`, `Project`, `ProjectTemplate`, `ProjectCache`.
