# Load Tests

Ce dossier contient une base simple pour demontrer une demarche de test de charge sur Collector.shop.

## Prerequis

- backend Spring Boot lance sur `http://localhost:8080`
- Siege installe localement

Exemple Ubuntu / Debian :

```bash
sudo apt-get update
sudo apt-get install siege
```

## Fichiers

- `siege-urls.txt` : liste des URLs publiques testees

## URLs testees

Les premiers tests visent uniquement des endpoints publics pour une demonstration rapide :

- catalogue public
- endpoint de sante
- endpoint d'information

## Commandes Siege

Demonstration rapide :

```bash
cd load-tests
siege -c 5 -t 15S -f siege-urls.txt
```

Test un peu plus representatif :

```bash
cd load-tests
siege -c 10 -t 30S -f siege-urls.txt
```

Explication des options :

- `-c 5` ou `-c 10` : nombre d'utilisateurs concurrents
- `-t 15S` ou `-t 30S` : duree du test
- `-f siege-urls.txt` : liste des endpoints a appeler

## Exemple d'usage pour le projet

Ces commandes permettent de verifier rapidement que :

- le catalogue reste accessible
- les endpoints Actuator repondent correctement
- le backend local supporte une petite charge concurrente

## Comment lire les resultats

Les metriques les plus utiles a regarder sont :

- disponibilite : pourcentage de reponses obtenues
- transactions : nombre total de requetes executees
- temps de reponse : vitesse moyenne de reponse du backend
- throughput / debit : volume traite sur la duree du test
- successful transactions : nombre de requetes reussies
- failed transactions : nombre d'erreurs constatees

Dans le dossier et a l'oral, ces resultats peuvent servir a :

- verifier que le catalogue public reste disponible sous une petite charge
- identifier les premieres limites du backend en local
- montrer une demarche de validation performance simple et reproductible

## Limites

- un test local ne represente pas un environnement de production
- les performances dependent fortement du poste developpeur
- PostgreSQL local peut devenir un facteur limitant
- le reseau local, Docker et les autres processus machine influencent les chiffres
- une vraie validation production demanderait des scenarios plus complets, des donnees plus realistes et un environnement dedie

## Alternatives

Si Siege n'est pas disponible, il est possible de reproduire la meme logique avec JMeter :

- creer un plan de test simple
- ajouter plusieurs requetes HTTP GET vers les URLs publiques
- definir un petit nombre d'utilisateurs virtuels
- observer le temps de reponse et le taux d'erreur
