"""Fail-closed entity → OWL class allow-list for file-service-client."""

from __future__ import annotations

# Conceptual entities (not DB tables). Adding a business entity requires an entry here.
ENTITY_TO_CLASS: dict[str, str] = {
    # Live / as-built concepts
    "StoredFile": "StoredFile",
    "Directory": "Directory",
    "UploadRequest": "UploadRequest",
    "SidecarMetadata": "SidecarMetadata",
    "ApiCredential": "ApiCredential",
    "FilenameEncodedUpload": "FilenameEncodedUpload",
    "ProjectBoundUpload": "ProjectBoundUpload",
    # Target (Spec 002 / missing modules)
    "WindowsShare": "WindowsShare",
    "Project": "Project",
    "ProjectTemplate": "ProjectTemplate",
    "ProjectCache": "ProjectCache",
}

# Closed directory vocabulary (must match config.example.json paths)
DIRECTORY_CODES: tuple[str, ...] = ("INTAKE", "DELIVERY", "IN-TRANSIT")

NS = "https://aes-lighting.com/ns/files#"
