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
dette technique, avec un Quality Gate unique.

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

### A traiter en priorite (chantiers en cours ou prevus)

- **Secret JWT par defaut** : la valeur par defaut de `APP_JWT_SECRET` est
  codee en dur dans `application.yml` et reprise telle quelle dans
  `docker-compose.yml`. Acceptable en demo locale, a documenter comme non
  reproductible tel quel hors de ce contexte.

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
