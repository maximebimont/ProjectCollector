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

### Schema d'architecture physique detaille

Le schema simplifie (navigateur -> frontend -> backend -> PostgreSQL, plus
haut) omet volontairement la passerelle TLS et la chaine d'observabilite
pour rester lisible en premiere lecture. Voici le detail complet des
composants physiques reellement deployes par `docker-compose.yml` et de
leurs interactions :

```txt
                              Navigateur (HTTPS)
                                     |
                          port hote 443 (TLS) / 80 (redirige vers 443)
                                     v
                    +--------------------------------------+
                    |  gateway  (Nginx 1.27, TLS)            |
                    |  - termine le TLS (certificat dev)     |
                    |  - route /api* et /actuator* -> backend|
                    |  - route /*                -> frontend|
                    +-----------------+----------------------+
                                      |
                    reseau Docker prive "projectcollector_default"
                                      |
        +-----------------------------+-----------------------------+
        v                                                            v
+----------------------+                              +----------------------------+
| frontend              |                              | backend                    |
| Nginx + build Angular |                              | Spring Boot (API REST, JWT)|
| port interne 8080     |                              | port interne 8080          |
+----------------------+                              +---------------+------------+
                                                                       |
                                     +---------------------------------+---------------------------------+
                                     | JDBC                                                               | scrape /actuator/prometheus (15 s)
                                     v                                                                     v
                          +----------------------+                                          +----------------------+
                          | postgres (16)         |                                          | prometheus (v3.1.0)   |
                          | port interne 5432      |                                          | port interne 9090     |
                          | volume vintage_..._data|                                          | volume prometheus_data|
                          +----------------------+                                          +-----------+----------+
                                                                                                          |
                                                                                                          v
                                                                                              +----------------------+
                                                                                              | grafana (11.4.0)      |
                                                                                              | dashboard provisionne  |
                                                                                              | port interne 3000     |
                                                                                              +----------------------+
```

Detail des composants de l'environnement Docker Compose (architecture interne
de l'environnement manage) :

| Service | Image | Port interne | Port publie sur l'hote | Role |
|---|---|---|---|---|
| `gateway` | `nginx:1.27-alpine` | 80, 443 | 80, 443 | seul point d'entree externe ; termine le TLS ; route vers `frontend`/`backend` |
| `frontend` | build local (`frontend/Dockerfile`, Nginx + Angular) | 8080 | aucun (acces uniquement via `gateway`) | sert les fichiers statiques Angular |
| `backend` | build local (`backend/Dockerfile`, Spring Boot) | 8080 | aucun (acces uniquement via `gateway`) | API REST, JWT, regles metier |
| `postgres` | `postgres:16` | 5432 | 5433 (debug local uniquement) | persistance utilisateurs/articles/commandes |
| `prometheus` | `prom/prometheus:v3.1.0` | 9090 | 9090 | scrape et stocke les metriques exposees par `backend` |
| `grafana` | `grafana/grafana:11.4.0` | 3000 | 3000 | visualise les metriques Prometheus (dashboard provisionne) |

Seuls `gateway`, `prometheus` (9090) et `grafana` (3000) exposent un port sur
l'hote : `frontend` et `backend` ne sont accessibles que via la passerelle,
ce qui reduit la surface d'attaque du reseau Docker interne. Ce choix
(Nginx plutot qu'une alternative comme Traefik) a ete confirme par une
experimentation reelle documentee dans
[`docs/experimentation-technologique.md`](experimentation-technologique.md).

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

## Indicateurs qualite retenus et prevention de la dette technique

Quatre indicateurs/metriques ont ete retenus pour suivre la conformite de
Collector.shop aux exigences de qualite. Chacun est deja outille (pas
d'indicateur theorique non mesure) et couvre un ou plusieurs attributs
ISO/IEC 25010 (detailles ci-dessous) :

1. **Couverture de tests** (JaCoCo backend + lcov frontend, consolidee par
   SonarCloud — actuellement ~99 % lignes backend, 100 % frontend).
   Couvre : *Fiabilite*, *Maintenabilite*.
   Prevention de la dette technique : une baisse de couverture signale du
   code ajoute sans test associe — donc une zone qui peut regresser sans
   qu'on s'en apercoive. Suivie en continu (SonarCloud a chaque push) et
   bloquante localement via le hook `pre-push` (seuil 90 %) : la dette de
   test est visible et bloquee des le commit qui l'introduit, plutot que
   decouverte des mois plus tard lors d'un bug en production.

2. **Duplication de code** (SonarCloud, actuellement 0 %).
   Couvre : *Maintenabilite*.
   Prevention de la dette technique : du code duplique oblige a repercuter
   chaque correctif a plusieurs endroits ; oublier l'un d'eux reintroduit un
   bug deja corrige ailleurs. Suivie en continu et bloquante via le hook
   `pre-push` (seuil 0 %) : la duplication ne peut pas s'accumuler
   silencieusement commit apres commit.

3. **Vulnerabilites ouvertes de severite HIGH/MEDIUM** (SonarCloud +
   Trivy + OWASP Dependency-Check + Gitleaks, consolidees dans
   `docs/vulnerability-register.md`).
   Couvre : *Securite*, *Maintenabilite* (une vulnerabilite non traitee est
   une forme de dette technique a part entiere).
   Prevention de la dette technique : une vulnerabilite laissee ouverte
   devient plus couteuse a corriger avec le temps (la version corrigee de la
   dependance s'eloigne davantage, le risque d'exploitation reste actif).
   Suivie a chaque push (scans CI) et bloquante localement via le hook
   `pre-push` : aucune nouvelle issue HIGH/MEDIUM ne peut s'accumuler sans
   etre visible immediatement.

4. **Latence p95 des requetes HTTP** (Prometheus/Grafana, histogrammes
   Micrometer, observee en continu y compris pendant les tests de charge
   Siege).
   Couvre : *Performance*, *Fiabilite*.
   Prevention de la dette technique : une degradation progressive de la
   latence (requetes N+1, index manquant, fuite de ressources) est un
   symptome classique de dette technique qui s'installe sans etre remarquee
   tant qu'aucune mesure continue n'existe. Le tableau de bord Grafana rend
   cette derive visible en continu, plutot que de la decouvrir seulement
   lors d'un test de charge ponctuel ou en production.

Ces quatre indicateurs ne couvrent pas l'integralite des exigences de
qualite ISO/IEC 25010 (ce n'est pas demande) : ils ont ete choisis pour leur
capacite a signaler tot une accumulation de dette technique dans les zones
les plus a risque du projet (tests, structure du code, securite,
performance), avec un outillage deja en place plutot que des indicateurs
theoriques non suivis.

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
- role administrateur basique (gestion des comptes, moderation des annonces, cf US-08 dans `docs/backlog.md`), sans gestion de litiges ni journal d'audit des actions admin ;
- observabilite limitee aux metriques (Prometheus/Grafana) : pas de logs centralises ni de traces distribuees ;
- tests frontend et E2E encore partiels ;
- pas de gestion avancee de la concurrence sur achat simultane ;
- pas de deploiement de production cible dans le depot ;
- pas de strategie de sauvegarde/restauration PostgreSQL (backup planifie, test de restauration) ;
- pas d'alerting automatique sur les metriques Grafana (dashboards consultables manuellement, aucune regle d'alerte configuree).
