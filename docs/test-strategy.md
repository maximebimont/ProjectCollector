# Strategie de test

## Objectif de la strategie de test

La strategie de test de Collector.shop vise a securiser le parcours metier principal sans surdimensionner le projet. Elle cherche a montrer une demarche de qualite credible pour un POC scolaire, avec un bon equilibre entre automatisation, verification manuelle et reproductibilite.

## Perimetre prioritaire

Le scenario metier central reste :

```txt
vendeur -> creation article -> catalogue -> acheteur -> achat -> SOLD -> mes achats -> mes ventes -> commission 5 %
```

Ce test manuel complet a ete realise avec succes.

## Tests backend

Le backend est couvre par 17 classes de tests (63 tests, ~99 % de lignes et
~97 % de branches en couverture JaCoCo) :

- tests unitaires de services : `OrderServiceTest`, `ItemServiceTest`,
  `AuthServiceTest` ;
- tests unitaires des controleurs REST (construction manuelle, sans
  contexte Spring) : `OrderControllerTest`, `ItemControllerTest`,
  `UserControllerTest`, `AuthControllerTest` ;
- tests unitaires securite : `JwtServiceTest`,
  `JwtAuthenticationFilterTest`, `CustomUserDetailsServiceTest` ;
- tests unitaires entites JPA (`@PrePersist`/`@PreUpdate`) : `ItemTest`,
  `OrderTest`, `UserTest` ;
- tests unitaires DTO : `UserResponseTest`, `MessageResponseTest` ;
- `GlobalExceptionHandlerTest` : gestion centralisee des erreurs ;
- `PurchaseFlowIntegrationTest` : test d'integration sur le parcours
  d'achat (base H2 en memoire).

Ils verifient notamment :

- l'achat reussi d'un article disponible ;
- le calcul de la commission de 5 % ;
- le calcul du montant vendeur ;
- le passage de l'article en `SOLD` ;
- des refus sur des cas metier critiques ;
- l'authentification JWT (generation, validation, filtre de securite) ;
- les valeurs par defaut poses par les callbacks JPA.

Commande utile :

```bash
cd backend
mvn test
```

## Build frontend

Le frontend est verifie par un build automatise :

```bash
cd frontend
npm run build
```

Cette etape valide la compilation de l'application Angular et sert de garde-fou minimal dans la CI.

## Tests frontend automatises

Le depot contient 16 fichiers de specs (87 tests, 100 % de couverture
Istanbul sur statements/branches/functions/lines) :

- shell applicatif : `app.component.spec.ts` ;
- services coeur : `auth.service.spec.ts`, `item.service.spec.ts`,
  `order.service.spec.ts` ;
- garde et intercepteur : `auth.guard.spec.ts`,
  `auth.interceptor.spec.ts` ;
- authentification : `login.component.spec.ts`,
  `register.component.spec.ts` ;
- objets : `item-list.component.spec.ts`, `item-create.component.spec.ts`,
  `item-edit.component.spec.ts`, `item-detail.component.spec.ts`,
  `my-items.component.spec.ts` ;
- commandes : `my-purchases.component.spec.ts`,
  `my-sales.component.spec.ts` ;
- profil : `profile.component.spec.ts`.

Ils apportent une verification sur :

- le shell principal et la navigation contextuelle (espace utilisateur) ;
- la persistance et la restitution de la session locale ;
- l'affichage et le filtrage du catalogue ;
- les parcours de creation/edition/suppression d'un article ;
- l'achat, la consultation des achats/ventes ;
- les cas d'erreur serveur (messages par defaut, absence de reponse) et les
  branches conditionnelles (garde de route, intercepteur d'authentification).

Commande utile :

```bash
cd frontend
npm run test:ci
```

## Tests E2E navigateur

Le projet contient un smoke test Playwright :

- `frontend/e2e/catalogue-smoke.spec.ts`.

Il verifie seulement le chargement du shell principal et de la page catalogue. Il s'agit d'un premier filet E2E, pas d'une recette complete du parcours metier.

Commande utile :

```bash
cd frontend
npm run e2e
```

## Tests manuels

Le test manuel complet du flux principal a ete realise avec succes.

Scenario manuel valide :

1. creation d'un compte vendeur ;
2. creation d'un article ;
3. verification dans le catalogue ;
4. creation d'un compte acheteur ;
5. achat de l'article ;
6. verification du statut `SOLD` ;
7. verification dans "Mes achats" ;
8. verification dans "Mes ventes" ;
9. verification de la commission de 5 %.

Ce test reste important pour la soutenance car il valide l'experience de bout en bout, au-dela des seuls tests techniques.

## Tests de charge

Le projet contient un dossier `load-tests/` et un fichier `siege-urls.txt` pour rejouer des tests Siege localement.

Commande utile :

```bash
cd load-tests
siege -c 5 -t 15S -f siege-urls.txt
```

### Resultats Siege documentes

Test leger :

- 5 utilisateurs concurrents ;
- environ 15 secondes ;
- 12 870 transactions ;
- 100 % disponibilite ;
- 0 transaction echouee ;
- temps de reponse moyen 0.01 s ;
- transaction la plus longue 0.59 s.

Test renforce :

- 10 utilisateurs concurrents ;
- environ 30 secondes ;
- 69 109 transactions ;
- 100 % disponibilite ;
- 0 transaction echouee ;
- transaction rate 2317.54 transactions/seconde ;
- transaction la plus longue 0.12 s.

Interpretation :

- resultats satisfaisants pour un test local ;
- stabilite correcte pour un POC ;
- ces tests ne remplacent pas une campagne complete en preproduction ou production.

## Tests CI/CD

La chaine CI/CD couvre notamment :

- compilation, tests et packaging backend ;
- build frontend ;
- analyses SAST ;
- secret scanning ;
- scans Dockerfile ;
- scans de dependances et d'images.

Ces verifications automatisent une partie importante du controle qualite, meme si elles ne remplacent pas les validations fonctionnelles.

## Tests de securite

Les controles de securite du depot reposent sur :

- Semgrep ;
- CodeQL ;
- Gitleaks ;
- Checkov ;
- Trivy ;
- OWASP Dependency-Check.

Les rapports de scans sont conserves afin de pouvoir analyser et prioriser les vulnerabilites detectees.

## Ce qui est automatise

- tests backend (63 tests, ~99 % lignes / ~97 % branches) ;
- build frontend ;
- tests frontend unitaires (87 tests, 100 % statements/branches/functions/lines) ;
- un smoke test E2E navigateur ;
- scans qualite et securite en GitHub Actions ;
- blocage local du `git push` sous les seuils qualite SonarCloud (hook
  `scripts/git-hooks/pre-push`, voir `docs/deployment-guide.md`).

## Ce qui reste manuel

- la demonstration complete du parcours vendeur/acheteur ;
- la verification fonctionnelle finale avant soutenance ;
- l'analyse et la priorisation des vulnerabilites remontees ;
- l'interpretation des resultats de charge.

## Limites

- les tests E2E navigateur restent limites (un seul smoke test) et gagneraient a etre completes ;
- les tests de charge sont reproductibles localement avec Siege, mais pas encore industrialises dans une pipeline dediee ;
- les tests de concurrence avances sur achat simultane restent une perspective ;
- les metriques de couverture sont desormais consolidees dans le tableau de bord SonarCloud et bloquantes localement via le hook pre-push, mais l'historique de tendance n'est suivi que depuis la mise en place de ce dispositif (pas de recul sur plusieurs mois).
