# Collector.shop

Collector.shop est un POC de marketplace d'objets de collection entre particuliers, realise dans le cadre d'une evaluation sur la supervision et l'assurance qualite du developpement logiciel.

Le parcours metier principal est couvre de bout en bout :

```txt
Vendeur cree un article
-> Acheteur consulte le catalogue
-> Acheteur achete l'article
-> Commande creee
-> Article passe en SOLD
-> Commission Collector de 5 % calculee
-> Achat visible cote acheteur
-> Vente visible cote vendeur
```

Le projet reste volontairement simple, demonstrable et maintenable. L'objectif n'est pas de reproduire une marketplace de production complete.

## Fonctionnel

- backend Spring Boot avec API REST, JWT, JPA et PostgreSQL ;
- frontend Angular avec parcours vendeur et acheteur ;
- Docker Compose fonctionnel pour lancer PostgreSQL, backend et frontend ;
- endpoints Actuator pour la verification de base.

Le test manuel complet du parcours principal a ete realise avec succes.

## Lancement rapide

Depuis la racine du projet :

```bash
docker compose up --build
```

URLs utiles :

- frontend : `http://localhost:4200`
- health backend : `http://localhost:8080/actuator/health`
- catalogue API : `http://localhost:8080/api/items`

Arret :

```bash
docker compose down
```

## Qualite, CI/CD et securite

Les workflows GitHub Actions principaux presents dans le depot sont :

- `main-pipeline.yml`
- `backend-tests.yml`
- `frontend-build.yml`
- `code-quality-sast.yml`
- `secret-scanning.yml`
- `iac-dockerfile-scan.yml`
- `docker-build.yml`
- `backend-security.yml`
- `sca-dependency-scan.yml`

Ils couvrent notamment :

- compilation, tests et packaging backend ;
- build frontend ;
- SAST avec Semgrep et CodeQL ;
- secret scanning avec Gitleaks ;
- scans Dockerfile avec Checkov ;
- scans SCA et scans Trivy sur filesystem et images Docker.

Plusieurs scans sont conserves meme lorsqu'ils sont non bloquants dans la pipeline principale, afin de garder les rapports et de pouvoir analyser les vulnerabilites detectees.

## Tests

Le projet s'appuie sur :

- des tests backend unitaires et d'integration ;
- un build frontend automatise ;
- quelques tests frontend automatises ;
- un smoke test navigateur Playwright limite ;
- un test manuel complet valide ;
- des tests de charge locaux reproductibles avec Siege.

Resultats Siege documentes :

- test leger : 5 utilisateurs concurrents, environ 15 secondes, 12 870 transactions, 100 % de disponibilite, 0 echec, temps de reponse moyen 0.01 s, transaction la plus longue 0.59 s
- test renforce : 10 utilisateurs concurrents, environ 30 secondes, 69 109 transactions, 100 % de disponibilite, 0 echec, 2317.54 transactions/seconde, transaction la plus longue 0.12 s

Ces resultats sont satisfaisants pour un test local de POC, sans valoir une campagne complete de preproduction.

## Documentation detaillee

- [Guide de demo](docs/demo-guide.md)
- [Architecture et qualite](docs/architecture-and-quality.md)
- [Securite et DevSecOps](docs/security-and-devsecops.md)
- [Strategie de test](docs/test-strategy.md)
- [Guide de deploiement](docs/deployment-guide.md)

## Limites du POC

- pas de paiement reel ;
- pas de role administrateur complet ;
- observabilite limitee a Actuator ;
- tests frontend et E2E encore limites ;
- tests de charge reproductibles localement, mais non industrialises dans une pipeline dediee.
