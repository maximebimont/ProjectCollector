# Architecture et qualite logicielle

## Contexte Collector.shop

Collector.shop est un POC de marketplace d'objets de collection entre particuliers. Le projet sert a demontrer un developpement logiciel maitrise, avec qualite, securite, CI/CD, tests et deploiement local reproductible.

Le perimetre fonctionnel volontairement retenu est le parcours principal suivant :

```txt
Vendeur cree un article
-> Acheteur consulte le catalogue
-> Acheteur achete l'article
-> Commande creee
-> Article passe en SOLD
-> Commission Collector de 5 % calculee
-> Achat visible cote acheteur
-> Vente visible cote vendeur
```

## Perimetre du POC

Le projet cherche a etre simple, lisible et demonstrable. Il ne vise pas une couverture complete d'une marketplace de production.

Le POC couvre :

- l'authentification ;
- le catalogue public ;
- la gestion des articles cote vendeur ;
- l'achat cote acheteur ;
- la creation de commande ;
- le calcul de la commission ;
- l'historique d'achats et de ventes ;
- la containerisation locale.

## Architecture logique

L'application repose sur trois briques principales :

```txt
Navigateur
   |
   v
Frontend Angular
   |
   v
Backend Spring Boot
   |
   v
PostgreSQL
```

## Architecture technique

### Frontend Angular

Le frontend fournit l'interface utilisateur et consomme l'API REST du backend. Il gere notamment :

- les pages de connexion et d'inscription ;
- le catalogue public ;
- le detail d'un article ;
- la creation, la modification et la suppression d'articles cote vendeur ;
- les vues "Mes objets", "Mes achats" et "Mes ventes" ;
- l'envoi du JWT via un interceptor ;
- la protection de certaines routes via un guard.

### Backend Spring Boot

Le backend porte les regles metier et expose les endpoints REST. Il gere notamment :

- l'inscription et la connexion ;
- la generation et la validation des JWT ;
- la gestion des articles ;
- la logique d'achat ;
- la creation des commandes ;
- le calcul de la commission de 5 % ;
- les endpoints Actuator de base.

La structure est separee par responsabilites, avec des packages de type `auth`, `user`, `item`, `order`, `config` et `common`.

### PostgreSQL

PostgreSQL stocke les utilisateurs, les articles et les commandes. Cette base est suffisante pour un POC transactionnel simple, tout en restant classique et facile a expliquer.

### Docker Compose

Docker Compose orchestre le frontend, le backend et PostgreSQL. Il apporte :

- un lancement unique pour la demonstration ;
- une execution locale reproductible ;
- une reduction des ecarts entre postes de travail.

## Separation des responsabilites

Le projet reste lisible grace a une separation simple :

- le frontend gere l'experience utilisateur ;
- le backend gere la securite et les regles metier ;
- la base gere la persistance ;
- Docker Compose gere l'assemblage local des services.

Cette separation facilite la maintenance, les tests et la demonstration.

## Endpoints principaux

### Authentification

- `POST /api/auth/register`
- `POST /api/auth/login`

### Utilisateur

- `GET /api/users/me`

### Articles

- `GET /api/items`
- `GET /api/items/{id}`
- `GET /api/items/me`
- `POST /api/items`
- `PUT /api/items/{id}`
- `DELETE /api/items/{id}`

### Commandes

- `POST /api/orders/items/{itemId}`
- `GET /api/orders/me`
- `GET /api/orders/sales`

### Observabilite minimale

- `GET /actuator/health`
- `GET /actuator/info`

## Pourquoi un monorepo

Le choix du monorepo est adapte a ce projet scolaire car il permet :

- de centraliser frontend, backend, documentation et CI/CD ;
- de lancer l'application plus facilement ;
- de garder une vision simple du POC ;
- de simplifier la soutenance et la demonstration technique.

## Alignement qualite selon ISO/IEC 25010

### Adequation fonctionnelle

Definition courte : le logiciel couvre correctement les besoins attendus.

Collector.shop y repond par un parcours vendeur/acheteur complet, teste manuellement avec succes.

Limite ou perspective : le perimetre reste volontairement restreint aux fonctions essentielles du POC.

### Performance

Definition courte : le logiciel fournit un niveau de reponse acceptable pour la charge visee.

Collector.shop y repond par des tests Siege locaux avec 100 % de disponibilite sur les scenarios documentes.

Limite ou perspective : ces tests restent locaux et ne remplacent pas une campagne de preproduction.

### Compatibilite

Definition courte : le logiciel interagit correctement avec ses autres composants.

Collector.shop y repond via une API REST consommee par Angular et une execution coordonnee avec Docker Compose.

Limite ou perspective : la compatibilite est verifiee surtout dans le cadre local du projet.

### Facilite d'utilisation

Definition courte : le logiciel reste facile a comprendre et a utiliser.

Collector.shop y repond par une UX simplifiee et un parcours manuel vendeur/acheteur valide.

Limite ou perspective : l'ergonomie reste celle d'un POC et peut encore etre polie.

### Fiabilite

Definition courte : le logiciel reste stable et produit des resultats coherents.

Collector.shop y repond par des tests backend, un test manuel complet et une gestion globale des erreurs.

Limite ou perspective : les tests de concurrence avances restent a completer.

### Securite

Definition courte : le logiciel protege l'acces, les donnees et les operations sensibles.

Collector.shop y repond par JWT, routes protegees, controle proprietaire et regles metier cote backend.

Limite ou perspective : pas de MFA, pas de paiement reel et pas de dispositif de securite de production avance.

### Maintenabilite

Definition courte : le logiciel peut etre compris, corrige et faire evoluer.

Collector.shop y repond par la separation frontend/backend, une architecture backend structuree et une documentation dediee.

Limite ou perspective : la couverture de tests frontend reste encore modeste.

### Portabilite

Definition courte : le logiciel peut etre installe et execute facilement dans un autre environnement.

Collector.shop y repond par Docker Compose et des Dockerfiles pour les applications.

Limite ou perspective : le projet documente surtout le deploiement local, pas un environnement cloud complet.

## Limites actuelles

- pas de paiement reel ;
- pas de role administrateur complet ;
- observabilite limitee a Actuator ;
- tests frontend et E2E encore partiels ;
- pas de gestion avancee de la concurrence sur achat simultane ;
- pas de deploiement de production cible dans le depot.
