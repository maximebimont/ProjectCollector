# Load Tests

Ce dossier contient une base simple et reproductible pour demontrer une demarche de test de charge locale sur Collector.shop.

## Prerequis

- backend Spring Boot lance sur `http://localhost:8080`
- Siege installe localement
- idealement l'application complete demarree avec `docker compose up --build`

Exemple Ubuntu / Debian :

```bash
sudo apt-get update
sudo apt-get install siege
```

## Fichiers

- `siege-urls.txt` : liste des URLs publiques testees

## URLs testees

Les premiers tests visent volontairement des endpoints publics et stables :

- `GET /api/items`
- `GET /actuator/health`
- `GET /actuator/info`
- `GET /actuator/metrics`

Ce choix permet de lancer un test de demonstration rapide, sans dependre d'une authentification ou d'un scenario metier complet.

## Commandes Siege

Demonstration courte :

```bash
cd load-tests
siege -c 5 -t 15S -f siege-urls.txt
```

Demonstration un peu plus representative :

```bash
cd load-tests
siege -c 10 -t 30S -f siege-urls.txt
```

Lecture rapide des options :

- `-c 5` ou `-c 10` : nombre d'utilisateurs concurrents
- `-t 15S` ou `-t 30S` : duree du test
- `-f siege-urls.txt` : fichier listant les URLs a appeler

## Comment interpreter les resultats

Les indicateurs les plus utiles a commenter sont :

- `Availability` : taux de reponses obtenues
- `Transactions` : nombre total de requetes executees
- `Elapsed time` : duree totale mesuree
- `Response time` : temps de reponse moyen
- `Transaction rate` : nombre moyen de transactions par seconde
- `Throughput` : volume moyen traite sur la periode
- `Successful transactions` : requetes reussies
- `Failed transactions` : requetes en erreur

## Ce que les resultats permettent de montrer

A l'oral et dans la documentation, ces tests permettent de montrer :

- que les endpoints publics restent joignables sous une petite charge locale ;
- que le catalogue et les endpoints Actuator repondent de facon coherente ;
- qu'une demarche de test de charge simple existe deja dans le projet ;
- qu'il est possible de rejouer rapidement les tests sur le poste de demonstration.

## Limites du test local

Ces tests ont des limites importantes qu'il faut assumer clairement :

- ils ne representent pas un environnement de production ;
- ils dependent fortement du poste developpeur ;
- Docker, PostgreSQL local et les autres processus machine influencent fortement les chiffres ;
- ils ne couvrent pas les parcours authentifies ;
- ils ne mesurent pas les cas de concurrence metier avancee comme l'achat simultane.

## Pourquoi ces tests ne sont pas lances a chaque push

Les tests Siege ne sont pas executes automatiquement dans la CI pour plusieurs raisons pragmatiques :

- ils necessitent un environnement d'execution complet et stable ;
- les resultats seraient trop dependants de la machine GitHub Runner ;
- ils allongeraient la duree de pipeline pour une valeur limitee sur un POC ;
- ils servent surtout de demonstration reproductible locale, pas de garde-fou fonctionnel principal.

## Usage recommande dans le projet

La bonne strategie actuelle est :

1. lancer l'application localement ;
2. verifier le fonctionnement fonctionnel ;
3. rejouer Siege avec les commandes documentees ;
4. commenter les resultats de maniere qualitative, pas comme un benchmark industriel.

## Alternatives

Si Siege n'est pas disponible, la meme logique peut etre reproduite avec JMeter ou un autre outil HTTP simple, mais Siege reste le choix le plus leger pour ce projet.
