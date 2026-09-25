#!/usr/bin/env python3
"""SHACL instance validation for file-service-client Spec Kit ontology."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ONTOLOGY = ROOT / ".specify" / "ontology"


def load_shapes():
    from rdflib import Graph

    g = Graph()
    for name in (
        "files_domain.generated.ttl",
        "files_domain.shacl.enums.ttl",
        "files_domain.shacl.ttl",
    ):
        g.parse(ONTOLOGY / name, format="turtle")
    return g


def main() -> int:
    from pyshacl import validate
    from rdflib import Graph

    shapes = load_shapes()
    ok = True

    valid_path = ONTOLOGY / "fixtures" / "valid-upload.ttl"
    data = Graph()
    data.parse(valid_path, format="turtle")
    conforms, _, results_text = validate(
        data_graph=data,
        shacl_graph=shapes,
        inference="rdfs",
        abort_on_first=False,
        meta_shacl=False,
        advanced=True,
        inplace=False,
    )
    if not conforms:
        print("FAIL: valid-upload.ttl should conform")
        print(results_text)
        ok = False
    else:
        print("OK: fixtures/valid-upload.ttl conforms")

    reject_path = ONTOLOGY / "fixtures" / "reject-bad-directory.ttl"
    bad = Graph()
    bad.parse(reject_path, format="turtle")
    conforms_bad, _, results_bad = validate(
        data_graph=bad,
        shacl_graph=shapes,
        inference="rdfs",
        abort_on_first=False,
        meta_shacl=False,
        advanced=True,
        inplace=False,
    )
    if conforms_bad:
        print("FAIL: reject-bad-directory.ttl should NOT conform")
        print(results_bad)
        ok = False
    else:
        print("OK: fixtures/reject-bad-directory.ttl correctly rejected")

    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
