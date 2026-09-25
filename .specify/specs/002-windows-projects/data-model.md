# Data model — Spec 002 (Target)

## Discovered Project

```json
{
  "jobNumber": "12345",
  "projectName": "Main Generator Install",
  "folderPath": "\\\\dc\\projects\\12345_MainGenerator",
  "folderSize": 5242880,
  "fileCount": 47,
  "subfolders": ["Documents", "Drawings", "Photos", "Warranty"],
  "lastModified": "2026-09-08T15:00:00Z",
  "discovered": true
}
```

## Cache file (`projects-cache.json`)

```json
{
  "lastScan": "2026-09-09T13:32:00Z",
  "scanDuration": 12,
  "projects": [],
  "errors": [],
  "metadata": { "scansCompleted": 0, "cacheVersion": 1 }
}
```

## Ontology (Target classes)

`WindowsShare`, `Project`, `ProjectTemplate`, `ProjectCache` — subclass TargetSurface; not asserted as Live/Implemented.
