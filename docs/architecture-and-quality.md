# 🧭 Architecture et qualité logicielle

## 1. Contexte et objectif

Collector.shop est un projet scolaire individuel qui démontre la supervision et l'assurance qualité du développement d'une application web. Le périmètre métier est volontairement simple : une marketplace d'objets de collection entre particuliers.

Le POC doit montrer un flux métier complet :

1. un vendeur crée un article ;
2. un acheteur consulte le catalogue ;
3. il ouvre le détail ;
4. il achète l'article ;
5. l'article devient `SOLD` ;
6. une commande est créée ;
7. la plateforme calcule une commission de 5 % ;
8. le vendeur voit la vente ;
9. l'acheteur voit l'achat.

L'objectif n'est pas de produire une marketplace industrielle, mais un socle technique clair, maintenable et démontrable.

## 🧭 2. Architecture fonctionnelle

Le système repose sur trois blocs principaux :

- un frontend Angular ;
- un backend Spring Boot exposé en API REST ;
- une base PostgreSQL.

Schéma simplifié :

```txt
Navigateur
   |
   | HTTP
   v
Frontend Angular
   |
   | REST JSON + JWT
   v
Backend Spring Boot
   |
   | JPA / Hibernate
   v
PostgreSQL
```

## ☕ 3. Architecture technique du backend

Le backend est structuré par domaines fonctionnels :

- `auth`
- `user`
- `item`
- `order`
- `config`
- `common`

### 🧭 Rôle des couches

- `controller` : exposition des endpoints REST ;
- `service` : logique métier et règles de gestion ;
- `repository` : accès aux données ;
- `dto` : contrats d'entrée et de sortie ;
- `entity` : persistence JPA ;
- `config` : sécurité, CORS et configuration transverse ;
- `common` : gestion des erreurs et composants mutualisés.

Cette organisation aide à garder des contrôleurs fins, une logique métier lisible et une persistance relativement isolée.

## 🎨 4. Architecture technique du frontend

Le frontend est une application Angular organisée par fonctionnalités. Les routes observées dans le dépôt couvrent :

- `/login`
- `/register`
- `/items`
- `/items/new`
- `/items/:id`
- `/items/:id/edit`
- `/my-items`
- `/my-purchases`
- `/my-sales`
- `/profile`

Le frontend utilise :

- des composants standalone ;
- Angular Router ;
- des services HTTP ;
- un guard d'authentification ;
- un interceptor JWT ;
- des modèles TypeScript ;
- PrimeNG et Tailwind pour l'interface.

## ✅ 5. Stack réellement constatée dans le dépôt

### ☕ Backend

- Spring Boot `3.5.14`
- Java configuré en `21` dans `backend/pom.xml`
- Spring Security
- Spring Data JPA / Hibernate
- PostgreSQL
- JWT via `jjwt`
- Bean Validation
- Spring Boot Actuator
- Lombok
- Maven

### 🎨 Frontend

- Angular `19`
- Node `20` dans la CI
- PrimeNG `19`
- Tailwind CSS
- SCSS

### 🐳 Containerisation

- backend conteneurisé avec un build Maven puis une image JRE ;
- frontend conteneurisé avec build Node puis service Nginx ;
- base PostgreSQL dans Docker Compose.

## ✅ 6. Qualité logicielle

## ✅ Maintenabilité

Les éléments favorables à la maintenabilité sont :

- séparation claire frontend / backend / base ;
- organisation backend par domaines ;
- découpage controller / service / repository ;
- usage de DTO ;
- structure frontend par features ;
- lancement local homogène avec Docker Compose.

## 🧭 Lisibilité et simplicité

Le projet reste volontairement modeste :

- peu de services techniques complexes ;
- flux métier central facile à expliquer ;
- API REST limitée à l'essentiel ;
- interface utilisateur orientée démonstration.

## ✅ Fiabilité

La fiabilité s'appuie sur :

- tests unitaires backend sur le service de commande ;
- test d'intégration backend sur le parcours d'achat complet ;
- validations d'entrée côté backend ;
- gestion globale des erreurs ;
- compilation et build automatisés en CI.

## 🔐 Sécurité fonctionnelle

La sécurité fonctionnelle repose notamment sur :

- authentification JWT ;
- routes protégées côté backend ;
- guard et interceptor côté frontend ;
- impossibilité d'acheter son propre objet ;
- impossibilité d'acheter un objet déjà vendu ;
- contrôle de propriété pour la modification et la suppression d'un objet.

## 📊 Observabilité minimale

Le backend expose :

- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`

Cette observabilité est simple mais utile pour une démo et pour le suivi du conteneur backend.

## 🚀 7. Processus qualité et cycle de développement

Le cycle projet visible dans le dépôt est le suivant :

1. développement sur le code applicatif ;
2. vérifications locales ;
3. exécution des workflows GitHub Actions ;
4. scans qualité et sécurité ;
5. builds Docker ;
6. exécution intégrée avec Docker Compose ;
7. tests manuels et démonstration.

La pipeline principale orchestre plusieurs workflows réutilisables :

- tests backend ;
- build frontend ;
- qualité de code et SAST ;
- scan de secrets ;
- scan Dockerfile ;
- build Docker et scan d'images.

## 🧭 8. Réalisé, simulé, perspective

### ✅ Réalisé

- architecture frontend/backend/base fonctionnelle ;
- flux métier principal complet ;
- dockerisation des trois services ;
- CI/CD GitHub Actions ;
- tests backend automatisés ;
- observabilité de base avec Actuator.

### ⚠️ Simulé ou limité volontairement

- aucun paiement réel ;
- aucun environnement cloud réel ;
- charge testée localement seulement ;
- observabilité sans stack dédiée type Prometheus/Grafana.

### 🔮 Perspectives

- aligner définitivement la cible Java entre documentation, CI et packaging ;
- renforcer les tests frontend automatisés ;
- enrichir l'observabilité et les alertes ;
- préparer un déploiement hors poste local si nécessaire.

