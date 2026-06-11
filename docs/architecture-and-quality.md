# Architecture and Quality

## Contexte fonctionnel

Collector.shop est une marketplace entre particuliers orientee objets vintage et de collection.

Le POC permet de demontrer un parcours metier simple mais complet :

1. Un utilisateur cree un compte.
2. Il se connecte.
3. Un vendeur cree une annonce.
4. Un acheteur consulte le catalogue.
5. L’acheteur achete un objet.
6. L’objet passe en `SOLD`.
7. Une commande est creee.
8. La commission Collector de 5 % est calculee.
9. L’acheteur voit ses achats.
10. Le vendeur voit ses ventes.

L’objectif du projet n’est pas de livrer une vraie marketplace de production, mais de proposer une base demonstrable pour une evaluation de qualite logicielle, de securite et de supervision du developpement.

## Architecture applicative

L’application repose sur une architecture web classique separee en trois blocs :

- frontend Angular
- backend Spring Boot expose en API REST
- base de donnees PostgreSQL

Le frontend communique avec le backend en HTTP/JSON.
L’authentification repose sur JWT.
L’environnement local peut etre lance avec Docker Compose.

Schema simplifie :

```txt
Navigateur
   |
   | HTTP
   v
Frontend Angular
   |
   | API REST + JWT
   v
Backend Spring Boot
   |
   | JPA / Hibernate
   v
PostgreSQL
```

## Architecture backend

Le backend suit une organisation par domaines fonctionnels, ce qui facilite la lisibilite du code :

- `auth`
- `user`
- `item`
- `order`
- `config`
- `common`

### Role des couches backend

- `Controller` : expose les endpoints REST et gere l’entree HTTP
- `Service` : porte la logique metier et les regles fonctionnelles
- `Repository` : gere l’acces aux donnees avec Spring Data JPA
- `DTO` : definit les objets d’entree et de sortie de l’API
- `Entity` : represente les donnees persistantes
- `Security Filter` : valide le JWT sur les requetes protegees
- `GlobalExceptionHandler` : centralise la gestion des erreurs et uniformise les reponses

Cette separation permet de garder :

- des controllers relativement fins
- une logique metier concentree dans les services
- une persistence isolee dans les repositories

## Architecture frontend

Le frontend Angular est organise par features pour rester simple a comprendre.

Il utilise :

- des composants standalone
- des services Angular pour les appels API
- un `authGuard` pour proteger les routes privees
- un interceptor pour ajouter automatiquement le token JWT
- des modeles TypeScript pour typer les donnees

### Pages principales

- login
- register
- catalogue
- detail objet
- creation objet
- profil / mon espace
- mes objets
- mes achats
- mes ventes

Cette organisation par fonctionnalite rend l’application plus lisible qu’une structure tres centralisee, tout en restant adaptee a un projet etudiant.

## Cycle de developpement

Le projet suit un cycle simple inspire d’une logique DevSecOps :

1. Analyse du besoin
2. Conception de la fonctionnalite
3. Developpement backend / frontend
4. Tests locaux
5. Commit sur la branche `dev`
6. Execution de la CI GitHub Actions
7. Verification des builds et des tests
8. Merge vers `main` quand la fonctionnalite est stable
9. Analyse securite / dependances
10. Deploiement local avec Docker

Schema simplifie :

```txt
Besoin → Développement → Tests → CI → Analyse sécurité → Build Docker → Déploiement local → Observabilité
```

Ce cycle reste volontairement simple, mais il permet deja de montrer :

- une logique d’integration continue
- une validation reguliere
- une prise en compte de la securite et de l’observabilite

## Qualite logicielle

Le projet peut etre lu avec une logique proche d’ISO 25010, sans chercher une couverture theorique exhaustive.

### Maintenabilite

Le projet favorise la maintenabilite grace a :

- l’architecture par domaines
- la separation controller / service / repository
- l’usage de DTO
- une structure frontend par features
- des composants Angular standalone lisibles

### Securite

La securite s’appuie notamment sur :

- JWT pour l’authentification
- Spring Security pour proteger les routes sensibles
- `authGuard` et interceptor cote frontend
- controles metier sur la propriete des objets
- interdiction d’acheter son propre objet
- interdiction d’acheter un objet deja vendu

### Fiabilite

La fiabilite est soutenue par :

- des tests automatises backend
- des tests d’integration sur le parcours d’achat
- une gestion globale des erreurs
- des validations d’entrees cote backend

### Performance

La performance n’est pas poussee au niveau d’une production, mais une base de validation existe :

- endpoints publics simples
- preparation de tests de charge avec Siege
- exposition des metriques via Actuator

### Utilisabilite

L’utilisabilite a ete amelioree cote frontend par :

- une navigation plus claire
- une page profil / mon espace
- une interface modernisee avec PrimeNG et Tailwind
- une separation lisible des parcours vendeur / acheteur

## Indicateurs qualite

| Indicateur | Objectif | Mesure | Utilité |
| ---------- | -------- | ------ | ------- |
| Taux de reussite de la CI | Verifier que les changements n’introduisent pas de regression evidente | Statut des jobs GitHub Actions | Mesurer la stabilite globale du projet |
| Nombre de tests backend reussis | Valider les regles metier critiques | Resultat de `mvn test` | Confirmer la fiabilite du backend |
| Temps de reponse moyen sur `GET /api/items` | Verifier que le catalogue reste repondant | Resultats Siege en local | Donner un premier indicateur de performance |
| Nombre de vulnerabilites critiques detectees | Identifier les dependances a risque | Rapport OWASP Dependency-Check | Suivre la securite des librairies |
| Etat de l’application | Verifier que le service est operationnel | `/actuator/health` | Fournir un indicateur simple d’observabilite |

## Politique de tests

La politique de tests du projet reste pragmatique.

### Backend

- tests unitaires backend
- tests d’integration backend sur le parcours d’achat si presents
- verification reguliere via `mvn test`

### Frontend

- build Angular comme validation technique minimale
- verification du bon typage et de la compilation via `npm run build`

### Charge

- tests de charge simples avec Siege sur des endpoints publics

### Tests manuels

Le parcours utilisateur complet doit etre verifie manuellement :

- creation vendeur
- creation objet
- creation acheteur
- achat
- objet en `SOLD`
- achat visible cote acheteur
- vente visible cote vendeur

## CI/CD

La pipeline principale s’appelle `CollectorShop CI`.

### Declenchement

- push sur `dev`
- push sur `main`
- pull request vers `main`

### Job backend

- setup Java 21
- compilation
- tests
- package
- build Docker du backend

### Job frontend

- setup Node 20
- `npm ci`
- `npm run build`

Le projet contient egalement un workflow de securite distinct pour le backend, afin de garder la CI principale raisonnablement rapide :

- scan OWASP Dependency-Check
- execution separee de la pipeline principale

Cette separation est utile dans un projet etudiant, car elle permet de montrer une logique DevSecOps sans ralentir chaque push de maniere excessive.

## Deploiement local

Le deploiement local repose sur Docker Compose.

Dans l’etat actuel du projet, `docker-compose.yml` permet de lancer :

- PostgreSQL
- backend Spring Boot
- frontend

Le backend utilise des variables d’environnement pour la connexion base de donnees et le secret JWT.
PostgreSQL est isole dans un conteneur dedie avec un volume Docker.
Le frontend est construit dans son conteneur et servi sur le port `4200`, via une image de production basee sur Nginx.

Cette approche permet de demontrer :

- un environnement local reproductible
- une separation claire des services
- une premiere logique de deploiement technique

## Observabilite

Le projet integre une observabilite minimale via Spring Boot Actuator.

Endpoints exposes :

- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`

Cette base permet deja de demontrer :

- le controle de l’etat applicatif
- l’exposition d’informations techniques utiles
- une capacite de supervision simple pour le developpement et la soutenance

## Choix techniques

Les choix techniques principaux sont coherents avec l’objectif du projet :

- Angular pour un frontend web clair et structure
- Spring Boot pour accelerer la creation d’une API securisee
- PostgreSQL pour une base relationnelle adaptee aux objets, utilisateurs et commandes
- JWT pour une authentification stateless simple
- Docker pour standardiser l’execution locale
- GitHub Actions pour automatiser les verifications

Ces choix privilegient un bon equilibre entre :

- lisibilite
- rapidite de mise en oeuvre
- demonstrabilite
- adequation avec un niveau mastère / lead developer

## Limites et ameliorations

Le projet presente encore des limites normales pour un POC :

- pas de paiement reel
- pas de refresh token
- pas de MFA
- pas de monitoring avance type Prometheus / Grafana
- pas d’environnement cloud reel
- pas de SAST complet integre a la chaine

Ameliorations possibles :

- renforcement des tests frontend
- ajout de scans SAST et container
- mise en place d’un systeme de secrets plus robuste
- supervision plus avancee
- gestion plus complete des tokens et de la securite session

## Resume oral

L’architecture de Collector.shop a ete choisie pour rester simple, lisible et demonstrable. Le frontend Angular est separe du backend Spring Boot, qui expose une API REST securisee par JWT, avec PostgreSQL comme base relationnelle. Cette separation permet de montrer une architecture moderne classique, facile a expliquer a l’oral.

La qualite logicielle est assuree par plusieurs mecanismes concrets : organisation du code par domaines, separation des responsabilites, tests backend, build frontend, gestion des erreurs et integration continue avec GitHub Actions. Le projet montre ainsi une demarche de developpement structuree, et pas seulement un resultat fonctionnel.

La CI/CD aide a securiser le developpement en automatisant la compilation, les tests et les builds Docker. En complement, le projet prepare aussi l’analyse de dependances et une base de tests de charge, ce qui montre une logique DevSecOps adaptee au contexte du projet.

Enfin, l’observabilite minimale via Actuator et les tests de charge avec Siege permettent de verifier l’etat et le comportement du systeme. Les limites actuelles sont clairement identifiees : il s’agit d’un POC etudiant, pas d’une application de production. Cet aspect est important a l’oral, car il montre une analyse lucide du niveau de maturite du projet.
