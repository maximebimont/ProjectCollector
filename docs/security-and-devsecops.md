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

## Cycle de vie du developpement (demarche DevSecOps)

Le cycle de vie retenu pour Collector.shop integre une mesure de securite a
chaque etape cle, plutot que de concentrer la securite sur une seule phase
(par exemple un scan final avant mise en production) :

```txt
   PLAN              CODE               BUILD              TEST                RELEASE             DEPLOY              OPERATE / MONITOR
    |                  |                  |                  |                    |                   |                       |
    v                  v                  v                  v                    v                   v                       v
Backlog +        Bean Validation    Checkov            Tests unitaires      Trivy (scan des     HTTPS/TLS           Prometheus/Grafana
user stories +   (entree filtree)   (Dockerfiles)       + integration       images Docker       (passerelle         (metriques, latence
cas de rejet     Secrets jamais     Dependency-Check    SonarCloud          construites)         Nginx, certificat   p95, disponibilite)
identifies       commit (.env      (CVE dependances)   (couverture,        SARIF publie        auto-signe dev)
(docs/backlog)   gitignore)                            duplication,        (Security tab)      Secrets via .env
                                                        complexite)         Gitleaks            non commite
                                                        Semgrep + CodeQL    (secrets avant       HEALTHCHECK
                                                        (SAST)              merge)              Docker
    |                  |                  |                  |                    |                   |                       |
    +------------------+------------------+------------------+--------------------+-------------------+-----------------------+
                                                               |
                                          Boucle de feedback continue vers PLAN
                          (issues SonarCloud, vulnerabilites du registre, metriques Grafana, resultats des tests de charge)
```

Explication des phases :

- **Plan** : le backlog (`docs/backlog.md`) formalise chaque fonctionnalite
  sous forme de user story avec criteres d'acceptation, y compris les cas de
  rejet (achat de son propre objet, objet deja vendu...) — ces cas de rejet
  sont deja une reflexion de securite/robustesse en amont du code.
- **Code** : validation systematique des entrees (Bean Validation, DTO),
  aucun secret en dur dans le code source (`.env` gitignore, cf plus haut).
- **Build** : Checkov verifie les Dockerfiles (utilisateur non-root,
  HEALTHCHECK) des la construction de l'image ; Dependency-Check identifie
  les CVE connues sur les dependances declarees avant meme d'executer le
  code.
- **Test** : deux familles de tests distinctes alimentent directement les
  indicateurs qualite retenus (`docs/architecture-and-quality.md#indicateurs-qualite-retenus-et-prevention-de-la-dette-technique`)
  — tests unitaires/integration (couverture) et scans SAST (Semgrep,
  CodeQL) qui detectent des vulnerabilites dans le code applicatif lui-meme,
  pas seulement dans ses dependances.
- **Release** : les images Docker construites sont scannees (Trivy) avant
  d'etre considerees pretes, et Gitleaks bloque la fusion si un secret a ete
  commis par erreur.
- **Deploy** : la passerelle TLS termine le HTTPS, les secrets applicatifs
  sont fournis par un `.env` local jamais commite, et chaque conteneur
  expose un `HEALTHCHECK` verifie par Docker.
- **Operate/Monitor** : Prometheus/Grafana rendent visibles en continu les
  metriques de performance et de disponibilite ; le registre de
  vulnerabilites (`docs/vulnerability-register.md`) trace la boucle
  detection -> decision -> correctif, qui reboucle vers la phase Plan pour
  les chantiers restants (ex. migration Angular 20 LTS).

## CI/CD DevSecOps

### Schema detaille du pipeline CI/CD

```txt
Declencheurs : push (dev, main) | pull_request (dev, main) | workflow_dispatch | cron hebdomadaire (lundi 06h00)
                                              |
          +-----------------+-----------------+------------------+-----------------+-----------------+
          |                 |                 |                  |                 |                 |
          v                 v                 v                  v                 v                 v
   backend-tests      frontend-build    code-quality-sast    sonar-scan      secret-scanning   secure-iac-
   [BLOQUANT]         [BLOQUANT]        [non bloquant]       [non bloquant]  [BLOQUANT]        dockerfile-scan
   mvn test + JaCoCo  npm build +       Semgrep + CodeQL     SonarCloud      Gitleaks          [non bloquant]
                      tests + E2E                            (JaCoCo+lcov)                     Checkov
                      Playwright
          \                 /
           \               /
            v             v
         docker-build [non bloquant]
         build images backend/frontend + scan Trivy des images
                              |
   (attend la fin de tous les jobs ci-dessus, quel que soit leur resultat individuel)
                              v
                     pipeline-summary
          tableau recapitulatif + liens SARIF (Security tab) / dashboard SonarCloud
```

Le detail des jobs `backend-tests` et `frontend-build` (les deux seuls jobs
bloquants avec `secret-scanning`) integre a minima deux types de tests
distincts, comme demande par les consignes : tests unitaires/integration
Maven (JaCoCo) cote backend, tests unitaires Karma/Jasmine et smoke test
Playwright cote frontend. Ces deux familles alimentent directement
l'indicateur "couverture de tests" retenu dans
[`docs/architecture-and-quality.md`](architecture-and-quality.md#indicateurs-qualite-retenus-et-prevention-de-la-dette-technique).

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

### Analyse des tests de charge et vulnerabilites potentielles

Les tests Siege documentes dans
[`docs/test-strategy.md`](test-strategy.md#tests-de-charge) montrent 100 %
de disponibilite et une latence tres faible (0.01 s en moyenne) — mais
cette analyse doit rester honnete sur ce qu'ils couvrent reellement :
`load-tests/siege-urls.txt` n'appelle que des endpoints **publics en
lecture seule** (`GET /api/items`, `/actuator/health`, `/actuator/info`,
`/actuator/metrics`), sans authentification ni ecriture. Les resultats
excellents obtenus ne demontrent donc que la robustesse du chemin de
lecture, pas celle des chemins d'ecriture (connexion, creation d'article,
achat), qui sont pourtant les operations les plus sensibles de
l'application.

Cette limite de couverture des tests de charge, une fois croisee avec la
connaissance de l'application, fait ressortir deux vulnerabilites
potentielles non verifiees experimentalement :

- **Concurrence sur l'achat simultane d'un meme objet** : la protection
  applicative (`OrderService.buyItem()` verifie `existsByItemId` avant de
  creer la commande) est doublee d'une contrainte d'unicite au niveau base
  de donnees (`uq_orders_item_id`, `V1__init.sql`), ce qui devrait empecher
  qu'un objet soit vendu deux fois meme en cas de requetes concurrentes
  quasi simultanees. Cette garantie n'a toutefois jamais ete verifiee sous
  charge reelle : un test Siege/JMeter cible sur `POST
  /api/orders/items/{id}` avec plusieurs utilisateurs concurrents visant le
  meme objet permettrait de confirmer que la contrainte DB se declenche
  bien comme filet de securite en pratique, et pas seulement en theorie.
- **Comportement du rate limiting sous charge concurrente reelle** :
  `LoginRateLimitFilter` (cf. [Deja traite](#deja-traite) plus bas) a ete
  valide par des tests unitaires (`LoginRateLimitFilterTest`), mais jamais
  sous une charge Siege/JMeter simulant plusieurs IP/clients tentant de se
  connecter simultanement — un test de charge cible sur `POST
  /api/auth/login` permettrait de confirmer que la limite (10
  tentatives/minute par IP) tient sous une charge realiste sans faux
  positifs (utilisateurs legitimes bloques a tort) ni faux negatifs (limite
  contournable par un pic de requetes tres rapproche).

Ces deux points sont ajoutes au plan de remediation ci-dessous plutot que
presentes comme des vulnerabilites confirmees : l'analyse des tests de
charge existants a permis de les identifier comme zones a verifier, pas de
les valider ou de les invalider.

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
- **Rate limiting sur `/api/auth/login`** : aucune protection anti
  brute-force a l'origine. `LoginRateLimitFilter` bloque au-dela de 10
  tentatives/minute avec une reponse 429. La limite est appliquee par IP
  client reelle, extraite du header `X-Forwarded-For` pose par la
  passerelle Nginx (repli sur `request.getRemoteAddr()` si le header est
  absent). Ce header n'est fiable que parce que le backend n'est plus
  joignable directement (ports retires de `docker-compose.yml`, cf plus
  haut) : seule la gateway peut l'atteindre, un client externe ne peut donc
  pas le forger pour contourner la limite.
- **CSRF desactive (SonarCloud `java:S4502`)** : verifie et documente
  comme acceptable, pas corrige par du code. Justification en commentaire
  directement dans `SecurityConfig.java` et detail dans
  [`docs/vulnerability-register.md`](vulnerability-register.md). Voir
  aussi la section [CSRF](#csrf) ci-dessus.

### A traiter en priorite (chantiers en cours ou prevus)

- **Verifier sous charge reelle la contrainte d'unicite sur l'achat
  concurrent** et **le comportement du rate limiting de connexion sous
  charge concurrente** : deux points identifies par l'analyse des tests de
  charge existants (cf. [Analyse des tests de charge et vulnerabilites
  potentielles](#analyse-des-tests-de-charge-et-vulnerabilites-potentielles)
  ci-dessus), non encore verifies experimentalement faute de scenario Siege
  couvrant les chemins d'ecriture authentifies.
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
