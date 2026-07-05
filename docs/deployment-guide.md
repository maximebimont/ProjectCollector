# 🐳 Guide de déploiement

## 1. Objectif

Ce guide décrit le déploiement local réellement supporté par le projet Collector.shop. Il est volontairement centré sur l'environnement Docker Compose utilisé pour la démonstration, les tests intégrés et la soutenance.

Il ne décrit pas un déploiement cloud de production.

## 🧭 2. Architecture déployée

Le fichier `docker-compose.yml` lance trois services :

- `postgres` : base de données PostgreSQL 16 ;
- `backend` : API Spring Boot ;
- `frontend` : application Angular servie par Nginx.

## ✅ 3. Prérequis

- Docker installé ;
- Docker Compose disponible ;
- ports libres : `4200`, `8080`, `5433` ;
- dépôt présent localement.

## 🚀 4. Lancement

Depuis la racine du projet :

```bash
docker compose up --build
```

## ✅ 5. Exposition des services

Une fois l'environnement démarré :

- frontend : `http://localhost:4200`
- backend : `http://localhost:8080`
- base PostgreSQL : `localhost:5433`

Endpoints utiles :

- catalogue : `http://localhost:4200/items`
- health backend : `http://localhost:8080/actuator/health`
- info backend : `http://localhost:8080/actuator/info`

## ✅ 6. Variables et configuration réellement utilisées

### 🗄️ Base PostgreSQL

Le service PostgreSQL est lancé avec :

- base : `vintage_marketplace`
- utilisateur : `vintage_user`
- mot de passe : `vintage_password`

### ☕ Backend

Le backend lit notamment :

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION`

Le port exposé est `8080`.

### 🎨 Frontend

Le frontend est construit dans une image Node, puis servi via Nginx sur le port `80` du conteneur, mappé en `4200` côté hôte.

## 🐳 7. Détail de la containerisation

### ☕ Backend

Le `Dockerfile` backend est un build en deux étapes :

1. image Maven avec Temurin 21 pour construire le jar ;
2. image `eclipse-temurin:21-jre` pour l'exécution.

### 🎨 Frontend

Le `Dockerfile` frontend est aussi en deux étapes :

1. image `node:20-alpine` pour exécuter `npm ci` puis `npm run build` ;
2. image `nginx:1.27-alpine` pour servir le build Angular.

## ✅ 8. Vérifications post-déploiement

Après `docker compose up --build`, vérifier :

1. que les trois conteneurs sont démarrés ;
2. que `http://localhost:4200/items` est accessible ;
3. que `http://localhost:8080/actuator/health` répond ;
4. que le flux de démonstration peut être joué.

## 🐳 9. Arrêt et nettoyage

Arrêt simple :

```bash
docker compose down
```

Le volume de données PostgreSQL est conservé par défaut via :

- `vintage_marketplace_data`

Pour rejouer une démo sur une base propre, il peut être pertinent de supprimer explicitement les volumes, mais cette opération doit être décidée volontairement car elle efface les données locales.

## 🧭 10. Ce que ce guide couvre réellement

### ✅ Réalisé

- déploiement local complet avec Docker Compose ;
- démarrage coordonné frontend/backend/PostgreSQL ;
- conteneurisation des applications ;
- endpoints d'observabilité backend.

### ⚠️ Non couvert ou non terminé

- déploiement cloud ;
- orchestration Kubernetes ;
- gestion centralisée des secrets ;
- reverse proxy de production ;
- TLS/HTTPS de production ;
- haute disponibilité.

