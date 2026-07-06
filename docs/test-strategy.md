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

Les tests backend reellement presents dans le depot couvrent deux niveaux :

- `OrderServiceTest` : tests unitaires sur la logique de commande
- `PurchaseFlowIntegrationTest` : test d'integration sur le parcours d'achat

Ils verifient notamment :

- l'achat reussi d'un article disponible ;
- le calcul de la commission de 5 % ;
- le calcul du montant vendeur ;
- le passage de l'article en `SOLD` ;
- des refus sur des cas metier critiques.

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

Le depot contient quelques tests frontend automatises, mais leur couverture reste limitee :

- `app.component.spec.ts`
- `auth.service.spec.ts`
- `item-list.component.spec.ts`

Ils apportent un premier niveau de verification sur :

- le shell principal ;
- la persistance de session locale ;
- l'affichage du catalogue.

Commande utile :

```bash
cd frontend
npm run test:ci
```

## Tests E2E navigateur

Le projet contient un smoke test Playwright :

- `frontend/e2e/catalogue-smoke.spec.ts`

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

- 5 utilisateurs concurrents
- environ 15 secondes
- 12 870 transactions
- 100 % disponibilite
- 0 transaction echouee
- temps de reponse moyen 0.01 s
- transaction la plus longue 0.59 s

Test renforce :

- 10 utilisateurs concurrents
- environ 30 secondes
- 69 109 transactions
- 100 % disponibilite
- 0 transaction echouee
- transaction rate 2317.54 transactions/seconde
- transaction la plus longue 0.12 s

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

- tests backend ;
- build frontend ;
- quelques tests frontend unitaires ;
- un smoke test E2E navigateur ;
- scans qualite et securite en GitHub Actions.

## Ce qui reste manuel

- la demonstration complete du parcours vendeur/acheteur ;
- la verification fonctionnelle finale avant soutenance ;
- l'analyse et la priorisation des vulnerabilites remontees ;
- l'interpretation des resultats de charge.

## Limites

- les tests frontend automatises restent limites ;
- les tests E2E navigateur restent limites et gagneraient a etre completes ;
- les tests de charge sont reproductibles localement avec Siege, mais pas encore industrialises dans une pipeline dediee ;
- les tests de concurrence avances sur achat simultane restent une perspective ;
- les metriques de couverture ne sont pas encore consolidees dans un tableau de bord centralise.
