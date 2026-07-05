# 🧪 Stratégie de test

## 1. Objectif

La stratégie de test de Collector.shop vise à sécuriser le flux métier principal sans surdimensionner le projet. Le but est de montrer une démarche de qualité adaptée à un POC scolaire :

- vérifier la logique métier critique ;
- vérifier la compilation et l'intégration technique ;
- vérifier le comportement global du système en local ;
- préparer la démonstration finale.

## 2. Périmètre prioritaire

Le périmètre prioritaire de test est le scénario métier central :

1. inscription ;
2. connexion ;
3. création d'un article ;
4. consultation du catalogue ;
5. achat ;
6. passage en `SOLD` ;
7. création de commande ;
8. visibilité côté acheteur et côté vendeur.

## 🧪 3. Tests automatisés réellement présents

### ☕ Backend

Deux niveaux de tests backend sont présents dans le dépôt :

- `OrderServiceTest` : tests unitaires du service de commande ;
- `PurchaseFlowIntegrationTest` : test d'intégration du parcours d'achat.

### 🧪 Ce que couvre le test unitaire

Le test unitaire du service de commande vérifie notamment :

- l'achat réussi d'un article disponible ;
- le calcul de la commission à 5 % ;
- le calcul du montant vendeur ;
- le passage de l'article à `SOLD` ;
- le refus d'achat de son propre objet ;
- le refus d'achat d'un objet déjà vendu ;
- le refus d'achat d'un objet inexistant.

### 🧪 Ce que couvre le test d'intégration

Le test d'intégration backend vérifie un enchaînement proche du métier réel :

- création d'un compte vendeur ;
- création d'un compte acheteur ;
- création d'un article ;
- achat de l'article ;
- vérification du statut `SOLD` ;
- vérification des achats côté acheteur ;
- refus d'achat sans token.

## 🎨 4. Vérifications automatisées côté frontend

L'état actuel du dépôt montre surtout une validation technique frontend par build :

- installation des dépendances avec `npm ci` dans la CI ;
- compilation via `npm run build`.

Cette stratégie ne constitue pas une couverture fonctionnelle frontend complète. Elle vérifie surtout :

- la validité du code TypeScript ;
- la cohérence des imports et templates Angular ;
- la capacité à produire l'artefact de build.

## 🚀 5. CI comme filet de sécurité

La stratégie de test s'appuie aussi sur GitHub Actions :

- exécution des tests backend ;
- build frontend ;
- build Docker ;
- scans qualité et sécurité.

La CI ne remplace pas tous les tests métier, mais elle réduit le risque d'intégrer une régression évidente.

## 🧪 6. Tests manuels

Un test manuel de bout en bout reste indispensable pour la soutenance.

### ✅ Scénario manuel recommandé

1. lancer l'application avec `docker compose up --build` ;
2. créer un compte vendeur ;
3. créer un article ;
4. vérifier sa présence dans le catalogue ;
5. créer un compte acheteur ;
6. acheter l'article ;
7. vérifier le statut `SOLD` ;
8. vérifier l'achat dans `my-purchases` ;
9. vérifier la vente dans `my-sales`.

### ✅ Statut honnête à documenter

- les tests automatisés backend sont présents ;
- le build frontend est automatisé ;
- le test manuel final complet est à rejouer avant la soutenance ;
- cette documentation ne prétend pas qu'une recette exhaustive déjà figée est archivée dans le dépôt.

## 📊 7. Tests de charge

Le projet contient un dossier `load-tests/` avec une base de test Siege.

### 📦 Endpoints visés

- `GET /api/items`
- `GET /actuator/health`
- `GET /actuator/info`
- `GET /actuator/metrics`

### 🚀 Exemple de commandes

```bash
cd load-tests
siege -c 5 -t 15S -f siege-urls.txt
```

```bash
cd load-tests
siege -c 10 -t 30S -f siege-urls.txt
```

### ✅ Ce que ces tests apportent

- une première vérification de disponibilité ;
- un indicateur simple de réactivité ;
- une préparation à la discussion sur la performance.

### ⚠️ Ce qu'ils n'apportent pas

- aucun engagement de performance de production ;
- aucune simulation avancée de charge métier authentifiée ;
- aucune campagne historisée automatiquement dans le dépôt.

## ⚠️ 8. Limites actuelles de la stratégie de test

- peu de tests frontend automatisés ;
- pas de test E2E automatisé navigateur ;
- pas de campagne de charge industrialisée ;
- pas de tests de concurrence avancés sur l'achat simultané ;
- pas de métriques de couverture consolidées dans la documentation actuelle.

## 🔮 9. Améliorations pertinentes en perspective

- ajouter des tests frontend ciblés sur les composants critiques ;
- ajouter un scénario E2E automatisé sur le parcours d'achat ;
- ajouter des tests négatifs d'autorisation plus nombreux ;
- conserver les résultats des tests de charge dans des artefacts ;
- introduire des tests de non-régression sur les routes principales.

