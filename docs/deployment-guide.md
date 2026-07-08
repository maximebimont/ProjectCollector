# Guide de deploiement

## Objectif

Ce document explique comment lancer Collector.shop localement dans son mode de deploiement reellement supporte par le projet : Docker Compose.

## Prerequis

- Docker installe ;
- Docker Compose disponible ;
- OpenSSL disponible (generation du certificat TLS de dev) ;
- depot present localement ;
- ports `80`, `443`, `4200`, `8080` et `5433` disponibles.

## Services lances

Le `docker-compose.yml` demarre :

- PostgreSQL ;
- le backend Spring Boot ;
- le frontend Angular servi par Nginx ;
- une passerelle Nginx (`gateway`) qui termine le TLS et expose l'application en HTTPS.

## Acces HTTPS local

Avant le tout premier demarrage (ou si le dossier `infra/gateway/certs/`
n'existe pas), generer un certificat auto-signe de dev :

```bash
./infra/gateway/generate-dev-cert.sh
```

Ce script cree `infra/gateway/certs/dev.{crt,key}` (SAN `localhost`), jamais
commite (`.gitignore`). Il n'a besoin d'etre relance que si ce dossier est
supprime ou si le certificat expire (validite 825 jours).

Une fois la stack demarree, l'application est accessible sur
`https://localhost`. Le certificat etant auto-signe, le navigateur affiche
un avertissement de securite au premier acces : c'est attendu, il suffit
d'accepter l'exception (`Avance` / `Continuer vers localhost`) pour
poursuivre. Le port `80` redirige automatiquement vers `443`.

## Commande principale

Depuis la racine du projet :

```bash
./infra/gateway/generate-dev-cert.sh   # une seule fois
docker compose up --build
```

## Ports exposes

- passerelle HTTPS : `443` (et `80` en redirection vers `443`)
- frontend (acces direct, sans passerelle) : `4200`
- backend (acces direct, sans passerelle) : `8080`
- PostgreSQL : `5433`

## Commande d'arret

```bash
docker compose down
```

## Commandes utiles

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f gateway
docker compose logs -f postgres
curl -k https://localhost/actuator/health
curl -k https://localhost/api/items
```

## Validation du deploiement local

Apres le demarrage :

1. verifier que `https://localhost` est accessible (accepter l'avertissement de certificat auto-signe) et sert le frontend ;
2. verifier que `curl -k https://localhost/actuator/health` retourne `UP` ;
3. verifier que `curl -k https://localhost/api/items` retourne le catalogue ;
4. verifier que le parcours manuel complet a ete realise avec succes via `https://localhost`.

## Configuration utile

Le compose actuel s'appuie notamment sur :

- une base PostgreSQL `vintage_marketplace` ;
- un backend connecte a `postgres:5432` ;
- un frontend Angular expose en `4200` via Nginx (acces direct) ;
- une passerelle Nginx qui termine le TLS et proxifie `/api` et `/actuator` vers le backend, le reste vers le frontend ;
- un volume `vintage_marketplace_data` pour la persistance locale.

## Ce que couvre ce guide

Realise :

- lancement local complet et reproductible ;
- demarrage coordonne frontend/backend/PostgreSQL/passerelle ;
- containerisation des applications ;
- acces HTTPS local via une passerelle Nginx (certificat auto-signe de dev) ;
- verification de base via Actuator et catalogue.

Non couvert :

- deploiement cloud ;
- haute disponibilite ;
- orchestration Kubernetes ;
- TLS de production (certificat valide, renouvellement automatique via
  cert-manager/Let's Encrypt) — seul un certificat auto-signe local est
  couvert ici ;
- gestion centralisee des secrets.
