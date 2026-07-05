# 🧪 Strategie de test

## 1. Objectif

La strategie de test de Collector.shop vise a securiser le flux metier principal sans surdimensionner le projet. L'objectif est de montrer une demarche de qualite credible pour un POC scolaire :

- verifier la logique metier critique ;
- verifier la compilation et l'integration technique ;
- ajouter un premier niveau de tests frontend automatises ;
- ajouter un premier smoke test E2E navigateur ;
- garder des tests de charge simples et rejouables localement.

## 2. Perimetre prioritaire

Le perimetre prioritaire reste le scenario metier central :

1. inscription ;
2. connexion ;
3. creation d'un article ;
4. consultation du catalogue ;
5. achat ;
6. passage en `SOLD` ;
7. creation de commande ;
8. visibilite cote acheteur et cote vendeur.

## 🧪 3. Tests automatises reellement presents

### ☕ Backend

Deux niveaux de tests backend sont presents dans le depot :

- `OrderServiceTest` : tests unitaires du service de commande ;
- `PurchaseFlowIntegrationTest` : test d'integration du parcours d'achat.

Ces tests verifient notamment :

- l'achat reussi d'un article disponible ;
- le calcul de la commission a 5 % ;
- le calcul du montant vendeur ;
- le passage de l'article a `SOLD` ;
- les refus d'achat sur les cas metier critiques ;
- un scenario complet de parcours d'achat cote backend.

### 🎨 Frontend

Le frontend dispose maintenant d'un premier socle de tests unitaires simples et stables :

- `app.component.spec.ts` : creation du shell principal et affichage de la navigation de base ;
- `auth.service.spec.ts` : persistance de session locale et deconnexion ;
- `item-list.component.spec.ts` : affichage du catalogue et fallback vendeur.

Ces tests ne couvrent pas toute l'interface, mais ils reduisent la limite initiale d'absence quasi totale de tests frontend automatises.

### 🛒 Smoke test E2E navigateur

Un premier smoke test Playwright est ajoute :

- demarrage de l'application frontend ;
- ouverture de `/items` ;
- verification du chargement de la page ;
- verification de la presence du shell principal et du titre du catalogue.

Ce test reste volontairement minimal. Il sert de preuve d'un premier niveau d'E2E automatise sans chercher a stabiliser tout le parcours metier complet.

## 🚀 4. Verifications techniques automatisees

Le projet s'appuie aussi sur plusieurs verifications techniques automatisees :

- `mvn test` cote backend ;
- `npm run build` cote frontend ;
- `npm run test:ci` pour les tests Angular headless ;
- `npm run e2e` pour le smoke test Playwright ;
- scans qualite, securite, dependances, secrets et images Docker via GitHub Actions.

## 🧪 5. Commandes utiles

### Frontend

```bash
cd frontend
npm run build
npm run test:ci
npm run e2e
```

### Prerequis navigateur sur Linux / WSL

Dans certains environnements Linux ou WSL, les tests navigateur peuvent necessiter :

```bash
cd frontend
npx playwright install chromium
npx playwright install-deps chromium
```

### Backend

```bash
cd backend
mvn test
```

### Charge locale

```bash
cd load-tests
siege -c 5 -t 15S -f siege-urls.txt
```

## 📊 6. Tests de charge reproductibles localement

Le projet contient un dossier `load-tests/` avec un scenario Siege simple sur des endpoints publics :

- `GET /api/items`
- `GET /actuator/health`
- `GET /actuator/info`
- `GET /actuator/metrics`

Cette approche permet :

- de rejouer rapidement un test de charge local ;
- d'obtenir des metriques simples a commenter ;
- de montrer une preparation au sujet performance sans industrialiser une campagne lourde.

Ces tests ne sont pas executes automatiquement a chaque push, car leurs resultats seraient trop dependants de l'environnement et peu fiables comme garde-fou CI.

## 🧪 7. Tests manuels

Un test manuel de bout en bout reste indispensable pour la soutenance.

Scenario recommande :

1. lancer l'application avec `docker compose up --build` ;
2. creer un compte vendeur ;
3. creer un article ;
4. verifier sa presence dans le catalogue ;
5. creer un compte acheteur ;
6. acheter l'article ;
7. verifier le statut `SOLD` ;
8. verifier l'achat dans `my-purchases` ;
9. verifier la vente dans `my-sales`.

## ✅ 8. Ce qui est maintenant automatise

- tests backend unitaires et d'integration ;
- build frontend ;
- premiers tests frontend unitaires ;
- premier smoke test E2E navigateur ;
- scans CI/CD qualite et securite ;
- tests de charge reproductibles localement via documentation et scripts Siege.

## ⚠️ 9. Limites restantes

La strategie de test a ete renforcee, mais plusieurs limites restent assumees :

- les tests frontend restent limites a quelques composants et services ;
- le test Playwright reste un smoke test, pas une recette E2E complete ;
- il n'y a pas encore de tests de concurrence avances sur l'achat simultane ;
- les tests de charge ne sont pas industrialises dans la CI ;
- la couverture n'est pas consolidee dans un tableau de bord centralise ;
- dans cet environnement WSL, les tests navigateur restent bloques tant que la dependance systeme `libgbm.so.1` n'est pas disponible.

## 🔮 10. Evolutions pertinentes ensuite

Les prochaines ameliorations utiles seraient :

- ajouter quelques tests frontend supplementaires sur les ecrans cles ;
- etendre Playwright a un scenario authentification ou navigation simple ;
- conserver des artefacts de tests de charge ;
- consolider la couverture et les rapports dans un support central ;
- renforcer progressivement les tests de non-regression sans complexifier excessivement le projet.

## 11. Message cle pour l'oral

Le projet ne se limite plus a des tests backend et a un build frontend. Il dispose desormais d'un premier socle coherent : tests metier backend, tests unitaires frontend, smoke test navigateur, scans CI/CD et tests de charge locaux reproductibles. C'est suffisant pour montrer une vraie demarche qualite, tout en restant honnete sur les limites d'un POC scolaire.
