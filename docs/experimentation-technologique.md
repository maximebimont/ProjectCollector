# Synthese du protocole d'experimentation

Conformement aux consignes ("Selectionnez les technologies pertinentes et
critiques et testez leur mise en oeuvre"), deux experimentations en bac a
sable ont ete menees avant de figer les choix retenus dans l'architecture
livree : une plateforme CI/CD alternative a GitHub Actions, et une solution
technique alternative a Nginx pour la passerelle TLS. Les deux tests ont ete
executes reellement (pas seulement documentes sur la base de la
documentation officielle) ; les resultats ci-dessous sont ceux effectivement
observes.

## Experimentation 1 — Plateforme CI/CD : GitHub Actions vs Jenkins

### Objectif

Le projet utilise GitHub Actions comme plateforme CI/CD principale (cf.
`docs/security-and-devsecops.md`). Avant de confirmer ce choix, une seconde
plateforme largement utilisee en entreprise — Jenkins, auto-heberge — a ete
testee sur le meme cas d'usage concret : compiler et executer les tests du
backend (`mvn clean test`).

### Environnement de test

- Jenkins `jenkins/jenkins:lts-jdk21` (image officielle), execute en local
  via Docker, sans acces reseau prealable autre que Docker Hub et Maven
  Central.
- Volume Docker dedie pour `JENKINS_HOME`, isole du reste du projet.
- Backend mont e en lecture seule dans le conteneur (`backend/` du depot).
- Aucun compte externe cree : experimentation entierement locale et
  jetable (conteneur et volume detruits apres le test).

### Etapes cles pour reproduire l'experimentation

1. `docker run jenkins/jenkins:lts-jdk21` avec un script d'amorcage
   (`init.groovy.d`) creant un compte administrateur et desactivant
   l'assistant d'installation interactif (`-Djenkins.install.runSetupWizard=false`),
   pour obtenir un Jenkins fonctionnel sans passer par le wizard web.
2. Installation de Maven dans le conteneur (`apt-get install maven` — l'image
   Jenkins officielle embarque un JDK mais pas Maven).
3. Creation d'un job "freestyle" via l'API REST Jenkins (`createItem`),
   executant `cd backend && mvn -B clean test`.
4. Declenchement du build via l'API REST et suivi de la sortie console en
   temps reel jusqu'au resultat final.

### Resultats obtenus

| Critere | GitHub Actions (retenu) | Jenkins (teste) |
|---|---|---|
| Temps d'installation avant premier build | 0 (deja integre a GitHub, aucune infrastructure a gerer) | ~15 minutes (choix de l'image, ecriture du script d'amorcage, 2 iterations pour corriger une erreur Groovy de configuration de securite, installation manuelle de Maven) |
| Duree du job build+test (69 tests) | ~45 secondes (mesure sur le dernier run reel de la pipeline) | ~47,5 secondes (mesure reelle, cache Maven a froid) |
| Resultat du build | Succes | Succes (69/69 tests, `BUILD SUCCESS`) |
| Gestion des secrets | Secrets GitHub natifs, `secrets: inherit` entre workflows reutilisables | Necessite un plugin Credentials + configuration manuelle |
| Maintenance infrastructure | Aucune (SaaS, inclus avec le depot GitHub) | A la charge du projet : mises a jour de l'image, sauvegarde de `JENKINS_HOME`, exposition reseau a securiser |
| Integration native avec le depot | Native (declenchement sur push/PR sans configuration reseau) | Necessite un webhook GitHub -> Jenkins exposé publiquement, ou polling SCM |

### Difficultes rencontrees

- Le script d'amorcage Groovy initial utilisait
  `GlobalMatrixAuthorizationStrategy`, une classe fournie par le plugin
  `matrix-auth` qui n'est pas installe par defaut sur une image Jenkins nue
  (`runSetupWizard=false` ne installe aucun plugin) — corrige en utilisant
  `FullControlOnceLoggedInAuthorizationStrategy`, disponible dans le coeur
  Jenkins.
- La creation d'un job via l'API REST necessite un jeton anti-CSRF
  ("crumb") lie a la session HTTP : la premiere tentative (requetes
  independantes) a echoue avec `403 No valid crumb was included in the
  request` — resolu en conservant un cookie de session entre la requete de
  recuperation du crumb et la requete de creation du job.
- Le CLI Jenkins (`jenkins-cli.jar`) a echoue avec l'erreur "Jenkins URL is
  not configured", necessitant de configurer explicitement l'URL Jenkins
  (`JenkinsLocationConfiguration`) — finalement contourne en utilisant
  directement l'API REST plutot que le CLI.

### Limites identifiees et justification du choix retenu

Jenkins reste une plateforme CI/CD credible et tres utilisee en entreprise,
avec un ecosysteme de plugins plus riche que GitHub Actions sur certains
points (orchestration complexe multi-agents, integrations legacy). Mais pour
ce projet :

- Jenkins introduit un cout d'exploitation reel (heberger, securiser et
  mettre a jour l'instance) totalement absent avec GitHub Actions, qui est
  inclus gratuitement avec le depot GitHub deja utilise.
- Le temps d'execution du job lui-meme est equivalent (~45-47 s) : Jenkins
  n'apporte aucun gain de performance qui justifierait son cout
  d'exploitation supplementaire sur ce cas d'usage.
- La configuration securisee de Jenkins (comptes, crumb CSRF, plugins) s'est
  averee plus fastidieuse a mettre en place correctement que l'ecriture d'un
  fichier YAML GitHub Actions.

**GitHub Actions est donc confirme comme le choix retenu**, l'experimentation
ayant permis de rejeter Jenkins pour ce contexte precis (POC scolaire, sans
equipe DevOps dediee a l'exploitation d'un Jenkins), sans remettre en cause
sa pertinence dans un contexte different (grande organisation avec
plusieurs equipes et besoins d'orchestration complexes).

## Experimentation 2 — Solution technique : Nginx vs Traefik (passerelle TLS)

### Objectif

La passerelle qui termine le TLS et route les requetes vers le frontend et
le backend utilise Nginx (`infra/gateway/nginx.conf`). Traefik, un reverse
proxy plus recent oriente conteneurs, a ete teste comme alternative sur le
meme role exact : terminaison TLS + routage `/api`, `/actuator` et `/` vers
les memes conteneurs backend/frontend deja en cours d'execution.

### Environnement de test

- Conteneur `traefik:v3.2` (image officielle), demarre sur le meme reseau
  Docker (`projectcollector_default`) que la stack Collector.shop deja
  active, sans interrompre ni modifier la passerelle Nginx en production
  locale (ports alternatifs `8443`/`8081` utilises pour ne pas entrer en
  conflit avec les ports `443`/`80` deja occupes par Nginx).
- Meme certificat TLS auto-signe que celui utilise par Nginx
  (`infra/gateway/certs/dev.{crt,key}`), reutilise tel quel.
- Configuration Traefik en mode fichier statique (`file provider`) — pas de
  Docker provider dynamique, pour rester comparable a la configuration
  statique de Nginx.

### Etapes cles pour reproduire l'experimentation

1. Ecriture de `traefik.yml` (points d'entree HTTP/HTTPS) et `dynamic.yml`
   (certificat TLS, trois routeurs : `/api`, `/actuator`, `/` — memes regles
   que `infra/gateway/nginx.conf`).
2. Lancement du conteneur Traefik sur le reseau Docker existant, avec les
   memes conteneurs backend/frontend cibles (`http://backend:8080`,
   `http://frontend:8080`).
3. Verification reelle des trois routes via `curl -k` : catalogue
   (`/api/items`), sante (`/actuator/health`) et frontend (`/`).
4. Comparaison des en-tetes de securite HTTP retournes par les deux
   passerelles sur la meme requete.

### Resultats obtenus

Les trois routes fonctionnent avec Traefik, exactement comme avec Nginx :

- `GET /` (frontend) -> `200`
- `GET /actuator/health` (backend) -> `{"status":"UP"}`
- `GET /api/items` (backend) -> catalogue JSON complet

| Critere | Nginx (retenu) | Traefik (teste) |
|---|---|---|
| Terminaison TLS avec certificat existant | Fonctionne (deja en place) | Fonctionne, meme certificat reutilise sans modification |
| Routage `/api`, `/actuator`, `/` | Fonctionne | Fonctionne, config equivalente en YAML |
| Redirection HTTP -> HTTPS automatique | Oui, `return 301` explicite dans `nginx.conf` | Non fournie par defaut : necessiterait un middleware `redirectScheme` supplementaire, non teste ici |
| En-tete HSTS (`Strict-Transport-Security`) | Present (`add_header` dans `nginx.conf`) | Absent avec la configuration testee : necessiterait un middleware `headers` dedie |
| Complexite de configuration pour ce cas d'usage | 1 fichier `.conf`, ~40 lignes, syntaxe deja maitrisee dans l'equipe | 2 fichiers YAML (statique + dynamique), syntaxe specifique aux "routers"/"services"/"middlewares" a apprendre |
| Interface d'administration | Aucune (fichier de conf seul) | Dashboard web integre (utile pour observer les routes en temps reel) |
| Integration native Docker (labels sur les conteneurs plutot que fichier de conf) | Non | Oui (non utilisee ici pour garder la comparaison equitable avec la config statique de Nginx) |

### Difficultes rencontrees

- Le point d'entree HTTP (`web`, port 8081) n'a pas ete configure avec un
  routeur explicite dans ce test : il retourne `404` au lieu d'une
  redirection vers HTTPS. Ce n'est pas une limite de Traefik en soi (un
  middleware `redirectScheme` regle ce point en quelques lignes), mais cela
  illustre que la parite avec la configuration Nginx actuelle (qui gere
  cette redirection nativement en une ligne) demande une etape
  supplementaire explicite avec Traefik.
- Aucun en-tete de securite (HSTS notamment) n'est ajoute par defaut par
  Traefik : contrairement a Nginx ou `add_header` suffit directement dans le
  bloc `server`, Traefik necessite de declarer un middleware `headers`
  separe et de l'attacher explicitement a chaque routeur concerne.

### Limites identifiees et justification du choix retenu

Traefik est une alternative serieuse, en particulier dans un contexte
d'orchestration dynamique (Kubernetes, Docker Swarm) ou son integration native
avec les labels de conteneurs evite d'ecrire une configuration statique a
chaque changement de service. Pour Collector.shop :

- la topologie de services est fixe et connue a l'avance (5 services
  Docker Compose stables) : l'avantage de la decouverte dynamique de
  Traefik ne s'exprime pas ici ;
- reproduire la configuration de securite deja en place avec Nginx (HSTS,
  redirection HTTPS, en-tetes `X-Frame-Options`/`X-Content-Type-Options` au
  niveau gateway) demande strictement plus de configuration avec Traefik
  (middlewares dedies) qu'avec Nginx (`add_header` direct) ;
- l'equipe maitrise deja la syntaxe Nginx, reduisant le risque d'erreur de
  configuration sur un composant critique pour la securite (terminaison
  TLS).

**Nginx est donc confirme comme le choix retenu** pour la passerelle. Le
dashboard d'administration de Traefik reste un atout reel identifie a
reconsiderer si le projet migrait un jour vers une orchestration
Kubernetes, ou la decouverte automatique de services reduirait la
maintenance de la configuration de routage.
