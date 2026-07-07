# Securite et demarche DevSecOps

## Objectifs de securite

Collector.shop manipule des comptes utilisateurs, des articles, des achats et un calcul de commission. Meme dans un POC, il est donc important de proteger :

- l'authentification ;
- l'acces aux operations sensibles ;
- la coherence des transactions ;
- la surface de code et de dependances.

## Securite applicative

### Authentification JWT

Le backend expose :

- `POST /api/auth/register`
- `POST /api/auth/login`

Apres connexion, un JWT est genere puis verifie par le backend sur les routes protegees. Le frontend stocke et rejoue ce token via un interceptor HTTP.

### Routes publiques et protegees

Les routes publiques couvrent principalement :

- l'inscription et la connexion ;
- le catalogue public ;
- le detail d'un article disponible ;
- les endpoints Actuator de base utiles a la demo.

Les operations sensibles restent protegees par authentification, par exemple :

- creation d'article ;
- modification et suppression d'un article ;
- achat ;
- consultation des espaces personnels.

### Protection des operations sensibles

Les regles critiques sont appliquees cote backend :

- seul le proprietaire peut modifier ou supprimer son article ;
- un utilisateur ne peut pas acheter son propre article ;
- un article deja vendu ne peut pas etre achete une seconde fois ;
- la commande et le passage au statut `SOLD` sont geres dans la logique metier.

### Validation backend

Le backend s'appuie sur :

- des DTO ;
- Bean Validation ;
- une separation controller / service / repository.

Cela permet de filtrer les donnees d'entree et de centraliser les regles importantes dans la couche metier.

### CORS

La configuration CORS autorise le frontend local sur `http://localhost:4200`, ce qui est coherent avec le mode de demonstration retenu.

### Gestion des erreurs

Une gestion globale des erreurs est en place pour renvoyer des reponses comprehensibles et eviter de laisser remonter des comportements techniques bruts a l'utilisateur.

## CI/CD DevSecOps

Le depot contient les workflows suivants :

- `backend-tests.yml`
- `frontend-build.yml`
- `code-quality-sast.yml`
- `secret-scanning.yml`
- `iac-dockerfile-scan.yml`
- `docker-build.yml`
- `backend-security.yml`
- `sca-dependency-scan.yml`

### Role des workflows

- `backend-tests.yml` : compilation, tests et packaging Maven
- `frontend-build.yml` : installation des dependances frontend puis build Angular
- `code-quality-sast.yml` : analyse Semgrep et CodeQL
- `secret-scanning.yml` : detection de secrets avec Gitleaks
- `iac-dockerfile-scan.yml` : scan des Dockerfiles avec Checkov
- `docker-build.yml` : build des images backend/frontend et scan Trivy des images
- `backend-security.yml` : lancement manuel ou planifie du workflow de scans de dependances
- `sca-dependency-scan.yml` : OWASP Dependency-Check et scan Trivy filesystem

## Outils utilises

### CodeQL

Analyse statique de securite et de qualite pour remonter des problemes dans le code.

### Semgrep

SAST rapide oriente regles, utile pour identifier des motifs de code a risque.

### Gitleaks

Detection de secrets commits par erreur dans le depot.

### Checkov

Analyse de securite appliquee ici aux Dockerfiles.

### Trivy

Scan de vulnerabilites sur le filesystem du projet et sur les images Docker construites.

### SARIF

Format standardise permettant de conserver et publier les rapports de scan dans GitHub.

### OWASP Dependency-Check

Analyse des dependances backend pour identifier des CVE connues. Le workflow est present et utilisable.

## Politique de scans dans la pipeline

- les scans sont conserves ;
- plusieurs scans sont non bloquants dans la pipeline principale ;
- les rapports restent generes pour permettre une analyse ulterieure ;
- les vulnerabilites detectees doivent etre analysees et priorisees ;
- les scans les plus lourds peuvent etre lances manuellement ou planifies via `backend-security.yml`.

Cette approche est adaptee a un POC scolaire : elle montre une demarche DevSecOps sans rendre la pipeline principale trop lente ou trop fragile.

Le suivi des vulnerabilites remontees (statut, justification, correctif applique) est trace dans [`docs/vulnerability-register.md`](vulnerability-register.md).

## Limites et remediations futures

Limites actuelles :

- paiement reel non integre ;
- pas de gestion complete des roles administrateur ;
- pas de monitoring Prometheus/Grafana ;
- pas encore de politique complete de gestion d'incident ;
- vulnerabilites detectees par les scans encore a traiter selon leur priorite.

Remediations futures pertinentes :

- durcir la gestion des secrets et des sessions ;
- etendre la couverture de tests de securite ;
- renforcer l'observabilite et la supervision ;
- corriger progressivement les vulnerabilites remontees par les outils ;
- preparer, si necessaire, une trajectoire vers un environnement cible plus proche de la production.
