#!/usr/bin/env python3
"""Compare des mesures/issues SonarCloud (fichiers JSON deja telecharges) a
des seuils qualite, et sort en erreur si l'un d'eux n'est pas respecte.
Appele par le hook pre-push ; pas de fonctionnalite Quality Gate SonarCloud
utilisee (payante), tout est calcule ici a partir des API mesures/issues.
"""
import json
import sys


def main() -> int:
    measures_path, issues_path, coverage_threshold, duplication_threshold, project_key = sys.argv[1:6]
    coverage_threshold = float(coverage_threshold)
    duplication_threshold = float(duplication_threshold)

    with open(measures_path, encoding="utf-8") as fh:
        measures_data = json.load(fh)

    with open(issues_path, encoding="utf-8") as fh:
        issues_data = json.load(fh)

    values = {m["metric"]: float(m["value"]) for m in measures_data["component"]["measures"]}
    coverage = values.get("coverage", 0.0)
    duplication = values.get("duplicated_lines_density", 0.0)

    issue_count = issues_data["total"]
    issues = issues_data.get("issues", [])

    failures = []
    if coverage < coverage_threshold:
        failures.append(f"Coverage {coverage:.1f}% < seuil {coverage_threshold:.0f}%")
    if duplication > duplication_threshold:
        failures.append(f"Duplication {duplication:.1f}% > seuil {duplication_threshold:.0f}%")
    if issue_count > 0:
        failures.append(f"{issue_count} issue(s) HIGH/MEDIUM ouverte(s) (seuil : 0)")

    print(f"Coverage             : {coverage:.1f}%  (seuil >= {coverage_threshold:.0f}%)")
    print(f"Duplication          : {duplication:.1f}%  (seuil <= {duplication_threshold:.0f}%)")
    print(f"Issues HIGH/MEDIUM   : {issue_count} ouverte(s)  (seuil : 0)")

    if issues:
        print()
        print("Detail des issues HIGH/MEDIUM ouvertes :")
        for issue in issues:
            component = issue["component"].split(":")[-1]
            line = issue.get("line", "-")
            severity = next(
                (i["severity"] for i in issue.get("impacts", []) if i["severity"] in ("HIGH", "MEDIUM")),
                "?"
            )
            print(f"  [{severity}] {issue['rule']} - {component}:{line} - {issue['message']}")

    print()

    if failures:
        print("PUSH BLOQUE par le hook pre-push :")
        for failure in failures:
            print(f"  - {failure}")
        print()
        print(f"Dashboard : https://sonarcloud.io/project/issues?id={project_key}&resolved=false")
        print("Echappatoire volontaire (a utiliser sciemment) : git push --no-verify")
        return 1

    print("Tous les seuils qualite sont respectes, push autorise.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
