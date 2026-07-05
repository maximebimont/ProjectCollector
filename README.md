# 🧩 Collector.shop

**Collector.shop** est une application web de vente d’objets de collection entre particuliers.

Le projet a été réalisé dans le cadre du bloc **Superviser et assurer le développement des applications logicielles**.
L’objectif est de proposer un POC fonctionnel intégrant une démarche de qualité logicielle, de sécurité, de CI/CD et de déploiement local reproductible.

---

## 📚 Sommaire

* [🎯 Contexte](#-contexte)
* [🧪 Périmètre du POC](#-périmètre-du-poc)
* [✨ Fonctionnalités](#-fonctionnalités)
* [🏗️ Architecture technique](#️-architecture-technique)
* [⚙️ Prérequis](#️-prérequis)
* [🐳 Lancement avec Docker Compose](#-lancement-avec-docker-compose)
* [🔗 URLs utiles](#-urls-utiles)
* [📁 Structure du projet](#-structure-du-projet)
* [🔌 API principale](#-api-principale)
* [🧪 Tests](#-tests)
* [🚀 CI/CD et DevSecOps](#-cicd-et-devsecops)
* [🔐 Sécurité](#-sécurité)
* [📊 Tests de charge](#-tests-de-charge)
* [📖 Documentation](#-documentation)
* [⚠️ Limites actuelles](#️-limites-actuelles)
* [🔮 Perspectives](#-perspectives)

---

## 🎯 Contexte

Collector.shop est une application de marketplace dédiée aux objets de collection et objets vintage.

Le principe métier est le suivant :

* un utilisateur peut consulter le catalogue sans être connecté ;
* un utilisateur doit être inscrit et connecté pour vendre ou acheter un objet ;
* un vendeur peut publier un objet ;
* un acheteur peut acheter un objet disponible ;
* lorsqu’un objet est acheté, une commande est créée ;
* l’objet passe au statut `SOLD` ;
* Collector.shop calcule une commission de 5 % sur la transaction.

---

## 🧪 Périmètre du POC

Le POC implémente le parcours métier principal :

```txt
Vendeur crée un article
→ Acheteur consulte le catalogue
→ Acheteur achète l’article
→ Commande créée
→ Article passé en SOLD
→ Commission Collector calculée
```

Certaines fonctionnalités prévues dans le contexte global ne sont pas développées dans ce POC, mais sont identifiées comme perspectives :

* chat entre acheteur et vendeur ;
* back-office administrateur complet ;
* modération automatisée des articles ;
* paiement réel ;
* recommandations personnalisées ;
* notifications ;
* détection avancée de fraude ;
* internationalisation ;
* accessibilité avancée.

---

## ✨ Fonctionnalités

### 🔑 Authentification

* inscription utilisateur ;
* connexion utilisateur ;
* authentification par JWT ;
* récupération de l’utilisateur connecté ;
* routes protégées côté backend ;
* interceptor JWT côté frontend.

### 🛍️ Catalogue

* affichage public des objets ;
* consultation du détail d’un objet ;
* affichage du statut de l’objet ;
* affichage du vendeur si disponible.

### 📦 Gestion des objets

* création d’un objet par un utilisateur connecté ;
* consultation des objets publiés par l’utilisateur ;
* modification d’un objet par son propriétaire ;
* suppression d’un objet par son propriétaire ;
* contrôle d’accès pour empêcher un utilisateur de modifier ou supprimer un objet qui ne lui appartient pas.

### 🧾 Commandes

* achat d’un objet disponible ;
* interdiction d’acheter son propre objet ;
* interdiction d’acheter un objet déjà vendu ;
* création d’une commande ;
* passage automatique de l’objet au statut `SOLD` ;
* calcul de la commission Collector de 5 % ;
* historique des achats ;
* historique des ventes.

### 🎨 Interface utilisateur

* page catalogue ;
* page détail article ;
* page création article ;
* page modification article ;
* page espace utilisateur ;
* page mes objets ;
* page mes achats ;
* page mes ventes ;
* navigation connectée / non connectée ;
* messages utilisateur ;
* états vides ;
* interface responsive.

---

## 🏗️ Architecture technique

Le projet est organisé en monorepo.

```txt
ProjectCollector/
├── backend/
├── frontend/
├── docs/
├── load-tests/
├── docker-compose.yml
└── .github/workflows/
```

### ☕ Backend

Technologies principales :

* Java 21 ;
* Spring Boot ;
* Spring Security ;
* JWT ;
* Spring Data JPA ;
* PostgreSQL ;
* Maven ;
* Actuator ;
* Docker.

Le backend expose une API REST permettant la gestion de l’authentification, des objets et des commandes.

### 🅰️ Frontend

Technologies principales :

* Angular ;
* TypeScript ;
* PrimeNG ;
* Tailwind CSS ;
* Angular Router ;
* HttpClient ;
* Interceptor JWT ;
* AuthGuard.

Le frontend consomme l’API backend et permet de réaliser le parcours utilisateur complet.

### 🐘 Base de données

La base de données utilisée est PostgreSQL.

Elle est lancée localement via Docker Compose.

### 🐳 Déploiement local

L’application complète est orchestrée avec Docker Compose :

* service PostgreSQL ;
* service backend Spring Boot ;
* service frontend Angular servi par Nginx.

---

## ⚙️ Prérequis

Pour lancer le projet localement, il faut avoir installé :

* Docker ;
* Docker Compose ;
* Git.

Pour lancer les parties séparément hors Docker :

* Java 21 ;
* Maven ;
* Node.js 20 ;
* npm ;
* PostgreSQL.

---

## 🐳 Lancement avec Docker Compose

Depuis la racine du projet :

```bash
docker compose up --build
```

Cette commande construit et lance :

* la base PostgreSQL ;
* le backend Spring Boot ;
* le frontend Angular.

Pour arrêter l’application :

```bash
docker compose down
```

Pour consulter les logs :

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

---

## 🔗 URLs utiles

Frontend :

```txt
http://localhost:4200
```

Backend :

```txt
http://localhost:8080
```

Health check Actuator :

```txt
http://localhost:8080/actuator/health
```

Catalogue API :

```txt
http://localhost:8080/api/items
```

---

## 📁 Structure du projet

### ☕ Backend

```txt
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
├── Dockerfile
└── pom.xml
```

Responsabilités principales :

* `auth` : inscription, connexion, JWT ;
* `user` : utilisateur connecté ;
* `item` : gestion des objets ;
* `order` : gestion des commandes ;
* `config` : sécurité et configuration ;
* `common` : éléments transverses.

### 🅰️ Frontend

```txt
frontend/
├── src/
│   ├── app/
│   ├── assets/
│   └── environments/
├── Dockerfile
├── nginx.conf
├── package.json
└── angular.json
```

Responsabilités principales :

* pages d’authentification ;
* catalogue ;
* détail article ;
* création et modification d’article ;
* espace utilisateur ;
* achats ;
* ventes ;
* services Angular ;
* guard d’authentification ;
* interceptor JWT.

### 📖 Documentation

```txt
docs/
├── demo-guide.md
├── architecture-and-quality.md
├── security-and-devsecops.md
├── test-strategy.md
└── deployment-guide.md
```

### 📊 Tests de charge

```txt
load-tests/
├── README.md
└── siege-urls.txt
```

---

## 🔌 API principale

### 🔑 Authentification

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/users/me
```

### 📦 Objets

```http
GET    /api/items
GET    /api/items/{id}
GET    /api/items/me
POST   /api/items
PUT    /api/items/{id}
DELETE /api/items/{id}
```

### 🧾 Commandes

```http
POST /api/orders/items/{itemId}
GET  /api/orders/me
GET  /api/orders/sales
```

---

## 📮 Exemple de création d’article avec Postman

Endpoint :

```http
POST http://localhost:8080/api/items
```

Headers :

```http
Authorization: Bearer <TOKEN_VENDEUR>
Content-Type: application/json
```

Body :

```json
{
  "title": "Figurine Star Wars vintage 1983",
  "description": "Figurine articulée Star Wars originale des années 80, en bon état général avec quelques traces d’usage. Objet idéal pour collectionneur de pièces vintage.",
  "price": 89.90,
  "imageUrl": "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64"
}
```

---

## 🧪 Tests

### ☕ Tests backend

Depuis le dossier `backend/` :

```bash
mvn test
```

Build backend :

```bash
mvn clean package
```

### 🅰️ Build frontend

Depuis le dossier `frontend/` :

```bash
npm ci
npm run build
```

### ✅ Test manuel principal

Scénario de validation :

```txt
1. Créer un compte vendeur
2. Se connecter en vendeur
3. Créer un article
4. Vérifier l’article dans le catalogue
5. Vérifier l’article dans Mes objets
6. Créer un compte acheteur
7. Se connecter en acheteur
8. Acheter l’article
9. Vérifier que l’article passe en SOLD
10. Vérifier Mes achats côté acheteur
11. Vérifier Mes ventes côté vendeur
12. Vérifier la commission de 5 %
```

---

## 🚀 CI/CD et DevSecOps

Le projet utilise GitHub Actions.

Workflows principaux :

```txt
.github/workflows/
├── main-pipeline.yml
├── backend-tests.yml
├── frontend-build.yml
├── docker-build.yml
├── code-quality-sast.yml
├── secret-scanning.yml
├── iac-dockerfile-scan.yml
├── backend-security.yml
└── sca-dependency-scan.yml
```

La pipeline principale vérifie notamment :

* compilation et tests backend ;
* build frontend ;
* analyse statique du code ;
* recherche de secrets ;
* scan Dockerfile / IaC ;
* build des images Docker ;
* scan des images Docker.

Certains scans de sécurité sont configurés comme non bloquants afin de ne pas interrompre le flux de développement pendant la phase POC. Les rapports restent générés et doivent être analysés pour prioriser les corrections.

---

## 🔐 Sécurité

Mesures mises en place :

* authentification JWT ;
* séparation routes publiques / protégées ;
* contrôle des accès côté backend ;
* interdiction d’acheter son propre article ;
* interdiction d’acheter un article déjà vendu ;
* validation des entrées ;
* gestion globale des erreurs ;
* CORS configuré pour le frontend ;
* scan de secrets avec Gitleaks ;
* analyse statique avec CodeQL / Semgrep ;
* scan des dépendances ;
* scan Docker / IaC avec Checkov ;
* scan d’images Docker avec Trivy.

Limites actuelles :

* pas de paiement réel ;
* pas de gestion avancée des rôles admin ;
* pas de modération automatisée ;
* pas de chiffrement applicatif spécifique au-delà des mécanismes standards ;
* pas encore de politique complète de gestion des incidents ;
* pas encore de monitoring de production.

---

## 📊 Tests de charge

Des tests de charge ont été réalisés avec Siege.

### 🟢 Test léger

Configuration :

```txt
5 utilisateurs concurrents
Durée : environ 15 secondes
```

Résultats :

```txt
Transactions : 12 870
Disponibilité : 100 %
Transactions échouées : 0
Temps de réponse moyen : 0.01 s
Transaction la plus longue : 0.59 s
```

### 🔵 Test renforcé

Configuration :

```txt
10 utilisateurs concurrents
Durée : environ 30 secondes
```

Résultats :

```txt
Transactions : 69 109
Disponibilité : 100 %
Transactions échouées : 0
Transaction rate : 2317.54 transactions/seconde
Transaction la plus longue : 0.12 s
```

Interprétation :

Ces résultats montrent une bonne stabilité de l’application dans un environnement local pour le périmètre du POC.
Ils ne remplacent cependant pas une campagne de tests de performance complète en environnement de préproduction ou de production.

---

## 📖 Documentation

La documentation projet est disponible dans le dossier `docs/`.

Documents principaux :

* `demo-guide.md` : scénario de démonstration ;
* `architecture-and-quality.md` : architecture et qualité logicielle ;
* `security-and-devsecops.md` : sécurité et démarche DevSecOps ;
* `test-strategy.md` : stratégie de tests ;
* `deployment-guide.md` : lancement et déploiement local.

---

## ⚠️ Limites actuelles

Le projet est un POC et non une application de production complète.

Limites principales :

* paiement simulé ;
* absence de chat acheteur/vendeur ;
* absence de back-office admin complet ;
* absence de système de notification ;
* absence de recommandations personnalisées ;
* absence de détection avancée de fraude ;
* absence d’internationalisation complète ;
* accessibilité non auditée en profondeur ;
* supervision limitée à Actuator en local ;
* tests de charge limités à un environnement local.

---

## 🔮 Perspectives

Évolutions possibles :

* intégrer un vrai module de paiement ;
* ajouter un back-office administrateur ;
* ajouter un système de modération ;
* ajouter un chat entre acheteur et vendeur ;
* ajouter des notifications email ou applicatives ;
* ajouter des recommandations personnalisées ;
* intégrer un service de détection de fraude ;
* améliorer l’accessibilité ;
* ajouter des tests end-to-end ;
* renforcer la couverture de tests ;
* déployer l’application sur un environnement cloud ;
* ajouter une observabilité complète avec Prometheus et Grafana ;
* mettre en place une stratégie de remédiation des vulnérabilités.

---

## 👤 Auteur

Projet réalisé par **Maxime Bimont** dans le cadre du bloc :

```txt
Superviser et assurer le développement des applications logicielles
```
