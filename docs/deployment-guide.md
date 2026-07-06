# Guide de deploiement

## Objectif

Ce document explique comment lancer Collector.shop localement dans son mode de deploiement reellement supporte par le projet : Docker Compose.

## Prerequis

- Docker installe
- Docker Compose disponible
- Ports `4200`, `8080` et `5433` disponibles
- Depot present localement

## Services lances

Le `docker-compose.yml` demarre :

- PostgreSQL ;
- le backend Spring Boot ;
- le frontend Angular servi par Nginx.

## Commande principale

Depuis la racine du projet :

```bash
docker compose up --build
```

## Ports exposes

- frontend : `4200`
- backend : `8080`
- PostgreSQL : `5433`

## Commande d'arret

```bash
docker compose down
```

## Commandes utiles

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/items
```

## Validation du deploiement local

Apres le demarrage :

1. verifier que le frontend est accessible sur `http://localhost:4200` ;
2. verifier que `http://localhost:8080/actuator/health` retourne `UP` ;
3. verifier que `http://localhost:8080/api/items` retourne le catalogue ;
4. verifier que le parcours manuel complet a ete realise avec succes.

## Configuration utile

Le compose actuel s'appuie notamment sur :

- une base PostgreSQL `vintage_marketplace` ;
- un backend connecte a `postgres:5432` ;
- un frontend expose en `4200` via Nginx ;
- un volume `vintage_marketplace_data` pour la persistance locale.

## Ce que couvre ce guide

Realise :

- lancement local complet et reproductible ;
- demarrage coordonne frontend/backend/PostgreSQL ;
- containerisation des applications ;
- verification de base via Actuator et catalogue.

Non couvert :

- deploiement cloud ;
- haute disponibilite ;
- orchestration Kubernetes ;
- TLS/HTTPS de production ;
- gestion centralisee des secrets.
