#!/usr/bin/env python3
"""Spec Kit ontology validation for file-service-client.

Three labeled gates (all required):

  1. Spec Kit ontology contract validation — deps, files, markers, freshness
  2. SHACL instance validation — fixtures (valid + deliberate reject)
  3. OWL-RL TBox consistency — expansion + required probes
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from ontology_map import DIRECTORY_CODES, ENTITY_TO_CLASS  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SPECIFY = ROOT / ".specify"
ONTOLOGY = SPECIFY / "ontology"
SNAPSHOT = ONTOLOGY / "snapshots" / "domain.snapshot.json"
GENERATED = ONTOLOGY / "files_domain.generated.ttl"
ENUMS = ONTOLOGY / "files_domain.shacl.enums.ttl"

REQUIRED_FILES = [
    SPECIFY / "spec.md",
    SPECIFY / "README.md",
    SPECIFY / "mvp-definition.md",
    SPECIFY / "memory" / "constitution.md",
    SPECIFY / "memory" / "project-context.md",
    SPECIFY / "specs" / "001-file-service-baseline" / "spec.md",
    SPECIFY / "specs" / "001-file-service-baseline" / "data-model.md",
    SPECIFY / "specs" / "001-file-service-baseline" / "api-contract.md",
    SPECIFY / "specs" / "001-file-service-baseline" / "security.md",
    SPECIFY / "specs" / "001-file-service-baseline" / "mvp-definition.md",
    SPECIFY / "specs" / "002-windows-projects" / "spec.md",
    ONTOLOGY / "README.md",
    ONTOLOGY / "files_domain.ttl",
    GENERATED,
    ONTOLOGY / "files_domain.axioms.ttl",
    ONTOLOGY / "files_domain.shacl.ttl",
    ENUMS,
    ONTOLOGY / "catalog-v001.xml",
    ONTOLOGY / "fixtures" / "valid-upload.ttl",
    ONTOLOGY / "fixtures" / "reject-bad-directory.ttl",
    SNAPSHOT,
    SPECIFY / "evidence" / "repo-survey-reverse-engineering.md",
    SPECIFY / "evidence" / "spec-kit-baseline.md",
    SPECIFY / "evidence" / "ontology-phase-0-foundation.md",
    SCRIPTS / "requirements.txt",
    SCRIPTS / "ontology_map.py",
    SCRIPTS / "extract_domain_snapshot.py",
    SCRIPTS / "generate_ontology.py",
    SCRIPTS / "validate_spec.py",
    SCRIPTS / "validate_instances.py",
    SCRIPTS / "validate_owl.py",
]

REQUIRED_SPEC_MARKERS = [
    "OntologyRequired",
    "PolicyNoSecretsInGit",
    "PolicyDualSurfaceHonesty",
    "PolicyNoInventLiveRoutesFromLib",
    "PolicyMvpDeferred",
]

REQUIRED_AXIOM_MARKERS = [
    "PolicyNoSecretsInGit",
    "PolicyDualSurfaceHonesty",
    "PolicyNoInventLiveRoutesFromLib",
    "OntologyRequired",
    "PolicyMvpDeferred",
    "LiveSurface",
    "TargetSurface",
    "FilenameEncodedSurface",
    "ProjectBoundUploadSurface",
    "AiRawAdvice",
    "owl:disjointWith",
]


class BlockingFailure(Exception):
    pass


def gate1_contract() -> None:
    print("=== Gate 1: Spec Kit ontology contract ===")
    try:
        import rdflib  # noqa: F401
        import pyshacl  # noqa: F401
        import owlrl  # noqa: F401
    except ImportError as e:
        raise BlockingFailure(
            f"missing Python dependency: {e}; pip install -r .specify/scripts/requirements.txt"
        ) from e

    missing = [p for p in REQUIRED_FILES if not p.is_file()]
    if missing:
        raise BlockingFailure(
            "missing required files:\n  "
            + "\n  ".join(str(p.relative_to(ROOT)) for p in missing)
        )

    spec_text = (SPECIFY / "spec.md").read_text(encoding="utf-8")
    for marker in REQUIRED_SPEC_MARKERS:
        if marker not in spec_text:
            raise BlockingFailure(f"spec.md missing marker: {marker}")

    axioms = (ONTOLOGY / "files_domain.axioms.ttl").read_text(encoding="utf-8")
    for marker in REQUIRED_AXIOM_MARKERS:
        if marker not in axioms:
            raise BlockingFailure(f"axioms missing marker: {marker}")

    mvp = (SPECIFY / "mvp-definition.md").read_text(encoding="utf-8")
    if "STATUS: TBD" not in mvp:
        raise BlockingFailure("mvp-definition.md must retain STATUS: TBD until owner update")
    if "do not invent success criteria" not in mvp.lower() and "Do not invent success criteria" not in mvp:
        # accept either casing via explicit second check already in file
        if "invent success criteria" not in mvp.lower():
            raise BlockingFailure("mvp-definition.md must forbid inventing success criteria")

    mvp001 = (SPECIFY / "specs" / "001-file-service-baseline" / "mvp-definition.md").read_text(
        encoding="utf-8"
    )
    for snippet in ("Deferred", "TBD", "invent success criteria"):
        if snippet.lower() not in mvp001.lower():
            raise BlockingFailure(f"001 mvp-definition.md missing: {snippet}")

    # Freshness: re-extract and compare sha
    before = SNAPSHOT.read_text(encoding="utf-8") if SNAPSHOT.is_file() else ""
    r_ex = subprocess.run(
        [sys.executable, str(SCRIPTS / "extract_domain_snapshot.py")],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    if r_ex.returncode != 0:
        raise BlockingFailure(f"extract_domain_snapshot.py failed:\n{r_ex.stderr}")
    after_snap = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    if before:
        before_snap = json.loads(before)
        if before_snap.get("sourceSha256") != after_snap.get("sourceSha256"):
            # restore and fail — committed snapshot stale
            SNAPSHOT.write_text(before, encoding="utf-8")
            raise BlockingFailure(
                "domain snapshot stale vs sources — run extract_domain_snapshot.py && generate_ontology.py"
            )
        # restore identical content
        SNAPSHOT.write_text(before, encoding="utf-8")

    if set(after_snap.get("directories") or []) != set(DIRECTORY_CODES):
        raise BlockingFailure(
            f"snapshot directories {after_snap.get('directories')} != DIRECTORY_CODES {DIRECTORY_CODES}"
        )

    for entity, cls in ENTITY_TO_CLASS.items():
        bucket = after_snap["entities"]["live"] + after_snap["entities"]["target"]
        if entity not in bucket:
            raise BlockingFailure(f"ENTITY_TO_CLASS {entity} missing from snapshot entities")
        if after_snap["entityMap"].get(entity) != cls:
            raise BlockingFailure(f"entityMap drift for {entity}")

    generated = GENERATED.read_text(encoding="utf-8")
    if "AUTO-GENERATED" not in generated:
        raise BlockingFailure("generated TTL missing AUTO-GENERATED marker")
    sha = after_snap["sourceSha256"]
    if sha[:12] not in generated and sha not in generated:
        raise BlockingFailure("generated TTL does not reference sourceSha256")
    for cls in ENTITY_TO_CLASS.values():
        if f"files:{cls}" not in generated:
            raise BlockingFailure(f"generated TTL missing class files:{cls}")

    enums = ENUMS.read_text(encoding="utf-8")
    if "AUTO-GENERATED" not in enums:
        raise BlockingFailure("enums TTL missing AUTO-GENERATED marker")
    for d in DIRECTORY_CODES:
        if f'"{d}"' not in enums:
            raise BlockingFailure(f"enums missing directory {d}")

    # Idempotent generate check
    before_gen = GENERATED.read_bytes()
    before_enum = ENUMS.read_bytes()
    r_gen = subprocess.run(
        [sys.executable, str(SCRIPTS / "generate_ontology.py")],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    if r_gen.returncode != 0:
        GENERATED.write_bytes(before_gen)
        ENUMS.write_bytes(before_enum)
        raise BlockingFailure(f"generate_ontology.py failed:\n{r_gen.stderr}")
    if GENERATED.read_bytes() != before_gen or ENUMS.read_bytes() != before_enum:
        GENERATED.write_bytes(before_gen)
        ENUMS.write_bytes(before_enum)
        raise BlockingFailure(
            "generated TTL/enums drift from generate_ontology.py — regenerate and commit"
        )

    from rdflib import Graph

    for name in (
        "files_domain.ttl",
        "files_domain.generated.ttl",
        "files_domain.axioms.ttl",
        "files_domain.shacl.ttl",
        "files_domain.shacl.enums.ttl",
        "fixtures/valid-upload.ttl",
        "fixtures/reject-bad-directory.ttl",
    ):
        g = Graph()
        try:
            g.parse(ONTOLOGY / name, format="turtle")
        except Exception as exc:  # noqa: BLE001
            raise BlockingFailure(f"Turtle parse failed for {name}: {exc}") from exc

    print("Gate 1 OK")


def gate2_shacl() -> None:
    print("=== Gate 2: SHACL instances ===")
    r = subprocess.run(
        [sys.executable, str(SCRIPTS / "validate_instances.py")],
        cwd=str(ROOT),
    )
    if r.returncode != 0:
        raise BlockingFailure("SHACL instance validation failed")
    print("Gate 2 OK")


def gate3_owl() -> None:
    print("=== Gate 3: OWL-RL TBox ===")
    r = subprocess.run(
        [sys.executable, str(SCRIPTS / "validate_owl.py")],
        cwd=str(ROOT),
    )
    if r.returncode != 0:
        raise BlockingFailure("OWL-RL validation failed")
    print("Gate 3 OK")


def main() -> int:
    try:
        gate1_contract()
        gate2_shacl()
        gate3_owl()
    except BlockingFailure as e:
        print(f"FAIL: {e}", file=sys.stderr)
        return 1
    print("\nALL GATES PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
