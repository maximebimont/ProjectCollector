# Securite et demarche DevSecOps

## Objectifs de securite

Collector.shop manipule des comptes utilisateurs, des articles, des achats et un calcul de commission. Meme dans un POC, il est donc important de proteger :

- l'authentification ;
- l'acces aux operations sensibles ;
- la coherence des transactions ;
- la surface de code et de dependances.

## Contexte applicatif

L'application gere une transaction simple entre un vendeur et un acheteur, avec un calcul automatique de commission. Cette nature transactionnelle justifie une attention particuliere sur la securite des acces et des regles metier.

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

### HTTPS / TLS

Une passerelle Nginx dediee (`infra/gateway/`) termine le TLS et expose
l'application sur `https://localhost` (redirection automatique depuis le
port `80`). Le certificat est auto-signe et genere localement
(`infra/gateway/generate-dev-cert.sh`), jamais commite. Le trafic
`passerelle -> backend`/`passerelle -> frontend` reste en clair sur le
reseau Docker interne : choix assume pour un POC qui tourne entierement sur
une seule machine (chiffrer aussi ce tronçon interne serait de la
sur-ingenierie a ce niveau). Voir
[`docs/deployment-guide.md`](deployment-guide.md#acces-https-local) pour la
procedure d'acces.

### CORS

La configuration CORS autorise `https://localhost` (acces via la passerelle
TLS) ainsi que `http://localhost:4200` (mode `ng serve` sans passerelle),
ce qui est coherent avec les deux modes de demonstration retenus.

### CSRF

La protection CSRF est explicitement desactivee (`SecurityConfig.java`,
commentaire en place sur la ligne concernee). C'est un choix assume, pas un
oubli : l'authentification se fait exclusivement via un header
`Authorization: Bearer` lu par `JwtAuthenticationFilter` (jamais un cookie
ni un parametre d'URL) et la session est `STATELESS`. La CSRF repose sur
l'envoi automatique par le navigateur de cookies/identifiants lors d'une
requete cross-site ; sans cookie de session, elle n'a pas de prise ici.
C'est la recommandation Spring Security elle-meme pour les API stateless a
base de JWT. Detail dans
[`docs/vulnerability-register.md`](vulnerability-register.md) (finding
SonarCloud `java:S4502`).

### Gestion des erreurs

Une gestion globale des erreurs est en place pour renvoyer des reponses comprehensibles et eviter de laisser remonter des comportements techniques bruts a l'utilisateur.

## CI/CD DevSecOps

Le depot contient les workflows suivants :

- `main-pipeline.yml`
- `backend-tests.yml`
- `frontend-build.yml`
- `code-quality-sast.yml`
- `sonar-scan.yml`
- `secret-scanning.yml`
- `iac-dockerfile-scan.yml`
- `docker-build.yml`
- `backend-security.yml`
- `sca-dependency-scan.yml`

### Role des workflows

- `backend-tests.yml` : compilation, tests et packaging Maven ;
- `frontend-build.yml` : installation des dependances frontend puis build Angular ;
- `code-quality-sast.yml` : analyse Semgrep et CodeQL ;
- `sonar-scan.yml` : scan qualite de code SonarCloud (backend + frontend) ;
- `secret-scanning.yml` : detection de secrets avec Gitleaks ;
- `iac-dockerfile-scan.yml` : scan des Dockerfiles avec Checkov ;
- `docker-build.yml` : build des images backend/frontend et scan Trivy des images ;
- `backend-security.yml` : lancement manuel ou planifie du workflow de scans de dependances ;
- `sca-dependency-scan.yml` : OWASP Dependency-Check et scan Trivy filesystem.

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

### SonarCloud

Analyse consolidee de la qualite de code (backend Java + frontend
TypeScript dans un seul projet, `sonar-project.properties` a la racine) :
couverture de tests (JaCoCo + lcov), duplication, complexite cognitive et
dette technique.

A la difference de CodeQL et Semgrep (SAST oriente detection de
vulnerabilites), SonarCloud n'est pas une source supplementaire de scan
securite dans ce projet — c'est assume : son role est de rendre visible,
dans un seul tableau de bord, ce qui etait auparavant disperse (rapport
JaCoCo genere mais jamais visualise, aucune mesure de qualite cote
frontend). C'est directement ce qui est demande dans les consignes pour
justifier le suivi d'indicateurs qualite dans le temps.

Setup requis (non automatisable depuis ce depot) : creer un compte
SonarCloud, importer le repo, generer un token d'analyse et l'ajouter comme
secret GitHub Actions `SONAR_TOKEN`. Tant que ce secret n'est pas
configure, le job `sonar-scan.yml` est ignore proprement (pas d'echec de
pipeline).

Une Quality Gate personnalisee (`Collector strict`) peut etre creee sur
SonarCloud, mais l'activer comme gate active du projet (celle qui bloque
reellement une analyse) est une fonctionnalite payante indisponible sur
ce plan gratuit. Le job CI `sonar-scan.yml` reste donc informatif, sans
blocage automatique. L'application des seuils qualite
(couverture >= 90 %, duplication = 0 %, 0 issue HIGH/MEDIUM ouverte) se
fait cote client, via un hook git local (`scripts/git-hooks/pre-push`) qui
interroge directement l'API mesures/issues et bloque le `git push` si l'un
des seuils n'est pas respecte. Voir
[`docs/deployment-guide.md`](deployment-guide.md#hook-pre-push-qualite-optionnel).

### SARIF

Format standardise permettant de conserver et publier les rapports de scan dans GitHub (onglet Security > Code scanning).

Les rapports Semgrep et Checkov sont en plus publies comme artefacts de build telechargeables (7 jours de retention), pour rester consultables meme sans acces a l'onglet Security du depot.

### OWASP Dependency-Check

Analyse des dependances backend pour identifier des CVE connues. Le workflow est present et utilisable.

## Politique de scans dans la pipeline

- les scans sont conserves ;
- certains scans sont non bloquants dans la pipeline principale ;
- les rapports restent generes pour permettre une analyse ulterieure ;
- les vulnerabilites detectees doivent etre analysees et priorisees ;
- les scans les plus lourds peuvent etre lances manuellement ou planifies via `backend-security.yml`.

Cette approche est adaptee a un POC scolaire : elle montre une demarche DevSecOps sans rendre la pipeline principale trop lente ou trop fragile.

Le suivi des vulnerabilites remontees (statut, justification, correctif applique) est trace dans [`docs/vulnerability-register.md`](vulnerability-register.md).

## Ce qui est realise, teste, simule et a poursuivre

Realise :

- authentification JWT ;
- protection des operations sensibles ;
- controle proprietaire sur les articles ;
- scans CI/CD de qualite et de securite ;
- publication de rapports de scan en SARIF quand le workflow le permet.

Teste :

- regles metier critiques verifiees par les tests backend ;
- parcours complet verifie manuellement ;
- scans lances dans la chaine GitHub Actions.

Simule ou simplifie :

- aucun paiement reel ;
- pas de gestion complete des roles administrateur ;
- observabilite securite limitee au niveau du POC.

## Plan de remediation securite

Ce plan est construit a partir de l'analyse reelle des scans de la pipeline
(run GitHub Actions du 2026-07-07) et d'une verification locale du
2026-07-08 (build + scan Trivy des deux images apres correctif). Le detail
ligne par ligne (CVE, severite, statut, justification) est trace dans
[`docs/vulnerability-register.md`](vulnerability-register.md) ; cette
section en donne la synthese priorisee.

### Deja traite

- **Durcissement des images Docker** : utilisateur non-root et `HEALTHCHECK`
  ajoutes sur les deux images (findings Checkov CKV_DOCKER_2 / CKV_DOCKER_3).
- **CVE applicatives backend** : bump `spring-boot-starter-parent` 3.5.14 ->
  3.5.16, qui resout le CVE critique Tomcat (CVE-2026-41293) et le CVE
  Jackson-databind (CVE-2026-54512).
- **CVE image frontend** : changement de base image
  (`nginxinc/nginx-unprivileged`) et mise a jour des paquets OS Alpine au
  build (`apk upgrade`), qui resout le CVE `golang.org/x/net` d'origine
  ainsi qu'un lot de 31 CVE OS decouvert en verifiant le correctif, non lie
  au code applicatif.
- **Fiabilite de la pipeline elle-meme** : deux bugs de process corriges,
  decouverts en analysant les runs reels plutot qu'en partant d'un registre
  vide :
  - le scan OWASP Dependency-Check ciblait la branche `main` (qui ne
    contient pas le code applicatif) et n'avait donc jamais reellement
    tourne depuis au moins 4 semaines ;
  - l'action Semgrep etait cassee silencieusement (`continue-on-error`
    masquait un crash de la CLI), donnant une fausse impression de
    couverture SAST.
- **HTTPS/TLS** : passerelle Nginx de terminaison TLS ajoutee
  (`https://localhost`, redirection depuis le port 80). Voir la section
  [HTTPS / TLS](#https--tls) ci-dessus.
- **Observabilite (metriques)** : backend instrumente pour Prometheus
  (`/actuator/prometheus`, histogrammes de latence HTTP), scrape automatique
  et tableau de bord Grafana provisionne (debit HTTP par endpoint, latence
  p95, memoire heap JVM, pool de connexions HikariCP). Voir
  [`docs/architecture-and-quality.md`](architecture-and-quality.md#role-de-la-chaine-dobservabilite-prometheus-grafana).
- **Secret JWT en dur** : `APP_JWT_SECRET` etait code en dur (meme valeur
  de demonstration visible dans `application.yml`, `.env.example` et
  `docker-compose.yml`, donc dans l'historique git). Le fallback par
  defaut dans `application.yml` a ete retire (`${APP_JWT_SECRET}` sans
  valeur de repli : l'application refuse de demarrer si la variable n'est
  pas fournie), `.env.example` ne contient plus qu'un gabarit vide avec
  instruction `openssl rand -base64 48`, et `docker-compose.yml` porte
  desormais le guard `${APP_JWT_SECRET:?APP_JWT_SECRET manquant, voir
  .env.example}` qui fait echouer `docker compose up` avec un message
  explicite si `.env` est absent ou incomplet.
- **CSRF desactive (SonarCloud `java:S4502`)** : verifie et documente
  comme acceptable, pas corrige par du code. Justification en commentaire
  directement dans `SecurityConfig.java` et detail dans
  [`docs/vulnerability-register.md`](vulnerability-register.md). Voir
  aussi la section [CSRF](#csrf) ci-dessus.

### A traiter en priorite (chantiers en cours ou prevus)

- **Migration Angular 20 LTS** : 9 advisories npm (8 high / 1 moderate)
  sur `@angular/core`/`@angular/common`/`@angular/compiler` `19.2.22` sans
  correctif disponible en version 19.x. Detail complet, analyse
  d'exploitabilite et justification de l'acceptation temporaire dans
  [`docs/vulnerability-register.md`](vulnerability-register.md) (ligne
  2026-07-09). Migration `ng update` vers Angular 20 LTS identifiee comme
  chantier a part entiere, pas fait dans un correctif ponctuel.

### Accepte pour le perimetre POC (a justifier a l'oral)

- **Role ADMIN inutilise** : le role existe dans le modele (`Role.ADMIN`)
  mais aucun endpoint ne l'exploite encore. Accepte car hors perimetre de la
  fonctionnalite metier implementee (achat/vente), identifie comme premiere
  extension naturelle.
- **Paiement reel non integre** : hors scope explicite d'un POC scolaire.
- **Politique de gestion d'incident** : non formalisee en tant que telle ;
  le registre de vulnerabilites materialise deja la boucle minimale
  detection -> decision -> tracabilite attendue a ce niveau d'exercice.

### Limites actuelles restantes

- observabilite limitee aux metriques (pas de logs centralises ni de traces distribuees) ;
- paiement reel non integre ;
- pas de gestion complete des roles admin ;
- pas encore de politique complete de gestion d'incident.
