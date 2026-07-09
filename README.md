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
- Docker Compose fonctionnel pour lancer PostgreSQL, backend, frontend, passerelle HTTPS et observabilite ;
- endpoints Actuator pour la verification de base ;
- observabilite via Prometheus/Grafana (debit HTTP, latence p95, memoire JVM, pool de connexions).

Le test manuel complet du parcours principal a ete realise avec succes.

## Lancement rapide

Depuis la racine du projet :

```bash
cp .env.example .env   # une seule fois, puis completer APP_JWT_SECRET (voir docs/deployment-guide.md)
./infra/gateway/generate-dev-cert.sh   # une seule fois, genere un certificat TLS de dev
docker compose up --build
```

URLs utiles (via la passerelle HTTPS, certificat auto-signe a accepter dans le navigateur) :

- application (frontend + API) : `https://localhost`
- health backend : `https://localhost/actuator/health`
- catalogue API : `https://localhost/api/items`
- tableau de bord Grafana : `http://localhost:3000` (identifiants par defaut `admin` / `admin`, a changer hors demo locale)
- Prometheus : `http://localhost:9090`

Voir [`docs/deployment-guide.md`](docs/deployment-guide.md#acces-https-local) pour le detail.

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
- `sonar-scan.yml`
- `secret-scanning.yml`
- `iac-dockerfile-scan.yml`
- `docker-build.yml`
- `backend-security.yml`
- `sca-dependency-scan.yml`

Ils couvrent notamment :

- compilation, tests et packaging backend ;
- build frontend ;
- SAST avec Semgrep et CodeQL ;
- qualite de code avec [SonarCloud](https://sonarcloud.io/project/overview?id=maximebimont_ProjectCollector) (couverture, duplication, dette technique) ;
- secret scanning avec Gitleaks ;
- scans Dockerfile avec Checkov ;
- scans SCA et scans Trivy sur filesystem et images Docker.

Plusieurs scans sont conserves meme lorsqu'ils sont non bloquants dans la pipeline principale, afin de garder les rapports et de pouvoir analyser les vulnerabilites detectees.

Un hook git local optionnel (`./scripts/install-git-hooks.sh`) bloque
`git push` si la couverture globale passe sous 90 %, si de la duplication
apparait, ou si une issue SonarCloud HIGH/MEDIUM reste ouverte — voir
[`docs/deployment-guide.md`](docs/deployment-guide.md#hook-pre-push-qualite-optionnel).

**`dev` est la branche d'integration reelle du projet** : tout le
developpement, les correctifs et le suivi qualite (SonarCloud, hook
pre-push) s'y font au fil de l'eau. `main` peut donc etre en retard de
plusieurs commits par rapport a `dev` — ce n'est pas un oubli, `dev` est
la reference a jour pour evaluer l'etat reel du projet.

## Tests

Le projet s'appuie sur :

- des tests backend unitaires et d'integration (63 tests, ~99 % lignes / ~97 % branches) ;
- un build frontend automatise ;
- des tests frontend automatises (87 tests, 100 % de couverture) ;
- un smoke test navigateur Playwright limite ;
- un test manuel complet valide ;
- des tests de charge locaux reproductibles avec Siege.

Resultats Siege documentes :

- test leger : 5 utilisateurs concurrents, environ 15 secondes, 12 870 transactions, 100 % de disponibilite, 0 echec, temps de reponse moyen 0.01 s, transaction la plus longue 0.59 s
- test renforce : 10 utilisateurs concurrents, environ 30 secondes, 69 109 transactions, 100 % de disponibilite, 0 echec, 2317.54 transactions/seconde, transaction la plus longue 0.12 s

Ces resultats sont satisfaisants pour un test local de POC, sans valoir une campagne complete de preproduction.

## Documentation detaillee

- [Guide de demo](docs/demo-guide.md)
- [Backlog fonctionnel (user stories et criteres d'acceptation)](docs/backlog.md)
- [Architecture et qualite](docs/architecture-and-quality.md)
- [Securite et DevSecOps](docs/security-and-devsecops.md)
- [Strategie de test](docs/test-strategy.md)
- [Guide de deploiement](docs/deployment-guide.md)
- [Registre de suivi des vulnerabilites](docs/vulnerability-register.md)
- [Synthese d'experimentation technologique (CI/CD, passerelle TLS)](docs/experimentation-technologique.md)
- [Equipe et competences](docs/equipe-et-competences.md)

## Limites du POC

- pas de paiement reel ;
- pas de role administrateur complet ;
- observabilite limitee aux metriques (Prometheus/Grafana), pas de logs centralises ni de traces distribuees ;
- tests E2E encore limites (un seul smoke test) ;
- tests de charge reproductibles localement, mais non industrialises dans une pipeline dediee ;
- pas d'internationalisation (contenu et interface en francais uniquement) ;
- accessibilite WCAG non auditee formellement (quelques corrections ponctuelles apportees - langue de la page, titre, aria-label/aria-expanded du menu mobile - mais pas de verification systematique du contraste des couleurs ni de gestion explicite du focus clavier apres navigation entre pages) — chantier V2.
