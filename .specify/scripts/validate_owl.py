#!/usr/bin/env python3
"""OWL-RL TBox consistency gate for file-service-client."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ONTOLOGY = ROOT / ".specify" / "ontology"
GENERATED = ONTOLOGY / "files_domain.generated.ttl"
AXIOMS = ONTOLOGY / "files_domain.axioms.ttl"
FILES = "https://aes-lighting.com/ns/files#"


class BlockingFailure(Exception):
    pass


def main() -> int:
    try:
        from rdflib import OWL, RDF, URIRef, Graph
        from owlrl import DeductiveClosure, OWLRL_Semantics
    except ImportError as e:
        print(f"error: missing dependency: {e}", file=sys.stderr)
        return 1

    for path in (GENERATED, AXIOMS):
        if not path.is_file():
            raise BlockingFailure(f"missing {path.relative_to(ROOT)}")

    g = Graph()
    g.parse(GENERATED.resolve().as_uri(), format="turtle")
    g.parse(AXIOMS.resolve().as_uri(), format="turtle")

    DeductiveClosure(OWLRL_Semantics).expand(g)

    required_disjoint = [
        (URIRef(FILES + "LiveSurface"), URIRef(FILES + "TargetSurface")),
        (
            URIRef(FILES + "FilenameEncodedSurface"),
            URIRef(FILES + "ProjectBoundUploadSurface"),
        ),
        (
            URIRef(FILES + "FilenameEncodedSurface"),
            URIRef(FILES + "AiRawAdvice"),
        ),
    ]
    for a, b in required_disjoint:
        if (a, OWL.disjointWith, b) not in g and (b, OWL.disjointWith, a) not in g:
            raise BlockingFailure(f"missing owl:disjointWith {a} / {b}")

    policies = [
        "PolicyNoSecretsInGit",
        "PolicyDualSurfaceHonesty",
        "PolicyNoInventLiveRoutesFromLib",
        "OntologyRequired",
        "PolicyMvpDeferred",
    ]
    for name in policies:
        if not list(g.triples((URIRef(FILES + name), None, None))):
            raise BlockingFailure(f"missing policy individual files:{name}")

    probe = Graph()
    for t in g:
        probe.add(t)
    collision = URIRef(FILES + "DeliberateCollisionIndividual")
    probe.add((collision, RDF.type, URIRef(FILES + "LiveSurface")))
    probe.add((collision, RDF.type, URIRef(FILES + "TargetSurface")))
    DeductiveClosure(OWLRL_Semantics).expand(probe)
    typed_live = (collision, RDF.type, URIRef(FILES + "LiveSurface")) in probe
    typed_tgt = (collision, RDF.type, URIRef(FILES + "TargetSurface")) in probe
    if not (typed_live and typed_tgt):
        raise BlockingFailure("deliberate disjoint probe setup failed")

    print("OWL-RL TBox validation: OK")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except BlockingFailure as e:
        print(f"error: {e}", file=sys.stderr)
        raise SystemExit(1)
