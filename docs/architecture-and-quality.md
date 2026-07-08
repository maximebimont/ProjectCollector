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

### Role du frontend Angular

Le frontend fournit l'interface utilisateur et consomme l'API REST du backend. Il gere notamment :

- les pages de connexion et d'inscription ;
- le catalogue public ;
- le detail d'un article ;
- la creation, la modification et la suppression d'articles cote vendeur ;
- les vues "Mes objets", "Mes achats" et "Mes ventes" ;
- l'envoi du JWT via un interceptor ;
- la protection de certaines routes via un guard.

### Role du backend Spring Boot

Le backend porte les regles metier et expose les endpoints REST. Il gere notamment :

- l'inscription et la connexion ;
- la generation et la validation des JWT ;
- la gestion des articles ;
- la logique d'achat ;
- la creation des commandes ;
- le calcul de la commission de 5 % ;
- les endpoints Actuator de base.

La structure est separee par responsabilites, avec des packages de type `auth`, `user`, `item`, `order`, `config` et `common`.

### Role de PostgreSQL

PostgreSQL stocke les utilisateurs, les articles et les commandes. Cette base est suffisante pour un POC transactionnel simple, tout en restant classique et facile a expliquer.

### Role de Docker Compose

Docker Compose orchestre le frontend, le backend, PostgreSQL, la passerelle HTTPS et la chaine d'observabilite (Prometheus, Grafana). Il apporte :

- un lancement unique pour la demonstration ;
- une execution locale reproductible ;
- une reduction des ecarts entre postes de travail.

### Role de la chaine d'observabilite (Prometheus, Grafana)

Le backend expose ses metriques au format Prometheus sur
`/actuator/prometheus` (histogrammes de latence HTTP inclus). Prometheus
scrape cet endpoint toutes les 15 secondes et conserve l'historique.
Grafana, connecte a Prometheus, affiche un tableau de bord provisionne
automatiquement (`infra/observability/`) avec quatre indicateurs :

- debit HTTP par endpoint ;
- latence p95 des requetes ;
- memoire heap JVM utilisee ;
- pool de connexions PostgreSQL (HikariCP) actives/inactives.

Ces indicateurs recoupent directement ceux definis plus bas pour l'attribut
qualite *Performance* (temps de reponse, stabilite sous charge) : le
tableau de bord permet de les observer en continu plutot que de les
mesurer ponctuellement via un test de charge isole.

## Separation des responsabilites

Le projet reste lisible grace a une separation simple :

- le frontend gere l'experience utilisateur ;
- le backend gere la securite et les regles metier ;
- la base gere la persistance ;
- Docker Compose gere l'assemblage local des services.

Cette separation facilite la maintenance, les tests et la demonstration.

### Choix d'architecture assumes

Trois choix qui pourraient ressembler a des raccourcis a premiere lecture,
mais qui sont deliberes pour la taille actuelle du projet :

- **`User implements UserDetails`** : l'entite JPA `User` implemente
  directement l'interface Spring Security `UserDetails`
  (`getAuthorities()`, `isEnabled()`, etc.) plutot que d'introduire un DTO
  d'adaptation separe. Couplage assume entre le modele de persistance et
  le modele d'authentification Spring Security : sur un projet de cette
  taille (3 entites), un adaptateur intermediaire ajouterait une couche
  supplementaire sans benefice reel. A reconsiderer seulement si `User`
  devait un jour porter des champs sensibles qu'on ne veut pas exposer au
  contexte Spring Security.
- **`OrderService` ecrit dans `ItemRepository`** : `OrderService.buyItem()`
  charge l'objet via `ItemRepository`, met a jour son statut
  (`SOLD`) et le sauvegarde, en plus de creer la commande — un service
  qui ecrit dans le repository d'un autre module metier. Cohesion
  transactionnelle assumee : l'achat d'un objet et son passage en `SOLD`
  doivent reussir ou echouer ensemble dans la meme transaction
  (`@Transactional`), et c'est le flux qui declenche ce changement d'etat,
  pas `ItemService`. Separer les deux ecritures dans deux services
  distincts obligerait a orchestrer la transaction depuis un troisieme
  composant, complexite superieure au benefice pour ce POC.
- **Logique de commission dans `OrderService`** : le taux (5 %) et le
  calcul de repartition (`platformFee`/`sellerAmount`) vivent directement
  dans `OrderService.buyItem()`, pas dans une classe dediee. Suffisant
  tant qu'il n'existe qu'une seule regle de tarification. Evolution
  identifiee si le besoin se presente : extraire une classe
  `PricingPolicy` (ou equivalent) le jour ou plusieurs regles de
  commission doivent coexister (taux variable par categorie, palier,
  periode promotionnelle...) — pas fait aujourd'hui pour eviter
  d'introduire une abstraction sans second cas d'usage reel.

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

### Observabilite

- `GET /actuator/health`
- `GET /actuator/info`
- `GET /actuator/prometheus` (scrape par Prometheus, visualise dans Grafana — voir [Role de la chaine d'observabilite](#role-de-la-chaine-dobservabilite-prometheus-grafana))

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

Collector.shop y repond par des tests Siege locaux avec 100 % de disponibilite sur les scenarios documentes, et par un tableau de bord Grafana (debit HTTP, latence p95, memoire JVM, pool de connexions) qui permet d'observer ces indicateurs en continu, y compris pendant les tests de charge.

Limite ou perspective : ces tests restent locaux et ne remplacent pas une campagne de preproduction.

### Compatibilite

Definition courte : le logiciel interagit correctement avec ses autres composants.

Collector.shop y repond via une API REST consommee par Angular et une execution coordonnee avec Docker Compose entre frontend, backend et base PostgreSQL.

Limite ou perspective : la compatibilite est verifiee surtout dans le cadre local du projet.

### Facilite d'utilisation

Definition courte : le logiciel reste facile a comprendre et a utiliser.

Collector.shop y repond par une UX simplifiee, des pages dediees au vendeur et a l'acheteur, et un parcours manuel valide.

Limite ou perspective : l'ergonomie reste celle d'un POC et peut encore etre polie.

### Fiabilite

Definition courte : le logiciel reste stable et produit des resultats coherents.

Collector.shop y repond par des tests backend, un test manuel complet, une gestion globale des erreurs et un suivi en continu du taux d'erreur HTTP et de la sante de l'application via Grafana/Actuator.

Limite ou perspective : les tests de concurrence avances sur achat simultane restent a completer ; aucune strategie de sauvegarde PostgreSQL (backup/restauration planifie) ni d'alerting automatique (Grafana expose les metriques mais aucune regle d'alerte n'est configuree) ne sont mises en place - limites assumees pour ce POC, a traiter avant tout usage en production reelle.

### Securite

Definition courte : le logiciel protege l'acces, les donnees et les operations sensibles.

Collector.shop y repond par JWT, routes protegees, controle proprietaire et regles metier cote backend.

Limite ou perspective : pas de MFA, pas de paiement reel et pas de dispositif de securite de production avance.

### Maintenabilite

Definition courte : le logiciel peut etre compris, corrige et faire evoluer.

Collector.shop y repond par la separation frontend/backend, une architecture backend structuree, un monorepo lisible, une documentation dediee, et un Quality Gate SonarCloud (`sonar-scan.yml`) qui mesure en continu couverture de tests, duplication de code et complexite cognitive sur le backend et le frontend. Ce suivi dans le temps est ce qui permet d'eviter l'accumulation silencieuse de dette technique : une regression de couverture ou une hausse de duplication est visible des le commit qui l'introduit, plutot que decouverte tardivement.

Limite ou perspective : une Quality Gate personnalisee (`Collector strict`) existe bien dans l'organisation SonarCloud, mais l'activer comme gate active du projet (celle qui bloque reellement) est une fonctionnalite payante indisponible sur ce plan gratuit — la creer est possible, l'appliquer ne l'est pas. L'application des seuils (couverture >= 90 %, duplication = 0 %, 0 issue HIGH/MEDIUM ouverte) se fait donc cote client via un hook git local plutot que cote serveur SonarCloud (cf `docs/security-and-devsecops.md`). La couverture de tests elle-meme est desormais elevee (backend ~99 % lignes / ~97 % branches, frontend 100 %).

### Portabilite

Definition courte : le logiciel peut etre installe et execute facilement dans un autre environnement.

Collector.shop y repond par Docker Compose et des Dockerfiles pour les applications.

Limite ou perspective : le projet documente surtout le deploiement local, pas un environnement cloud complet.

## Limites actuelles

- pas de paiement reel ;
- pas de role administrateur complet ;
- observabilite limitee aux metriques (Prometheus/Grafana) : pas de logs centralises ni de traces distribuees ;
- tests frontend et E2E encore partiels ;
- pas de gestion avancee de la concurrence sur achat simultane ;
- pas de deploiement de production cible dans le depot ;
- pas de strategie de sauvegarde/restauration PostgreSQL (backup planifie, test de restauration) ;
- pas d'alerting automatique sur les metriques Grafana (dashboards consultables manuellement, aucune regle d'alerte configuree).
