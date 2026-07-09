# Cartographie des competences et plan de formation

## Contexte

Ce document formalise, pour le cas d'entreprise fictif de Collector.shop,
les metiers necessaires a la mise en oeuvre du projet au-dela du prototype
individuel realise dans le cadre de cette evaluation, ainsi qu'une action de
formation ciblee. Conformement aux consignes, les profils restent realistes
(pas de profil cumulant seul l'ensemble des expertises) sans contrainte
budgetaire ou de nombre de membres imposee.

## Metiers necessaires au projet

| Role | Responsabilite principale | Interactions |
|---|---|---|
| **Product Owner** | Priorise le backlog (`docs/backlog.md`) avec l'entreprise fictive, arbitre les criteres d'acceptation, valide que la fonctionnalite livree repond au besoin metier | Transmet les user stories au Lead Developer ; valide les demonstrations avec l'equipe |
| **Lead Developer / Tech Lead** | Definit le processus de developpement et l'architecture technique (`docs/architecture-and-quality.md`), arbitre les choix techniques, anime la montee en competence de l'equipe | Interface entre le Product Owner et les developpeurs ; role tenu par le candidat dans le cadre de cette evaluation |
| **Developpeur Backend (Java/Spring Boot)** | Implemente l'API REST, les regles metier, la securite applicative (JWT, validation) | Consomme les user stories du backlog ; collabore avec le developpeur frontend sur le contrat d'API |
| **Developpeur Frontend (Angular/TypeScript)** | Implemente les parcours utilisateur, consomme l'API backend, respecte les criteres d'acceptation du backlog | Collabore avec le backend sur le contrat d'API ; remonte les besoins d'ergonomie au Product Owner |
| **Ingenieur DevSecOps** | Industrialise le pipeline CI/CD, integre les scans de securite (SAST, SCA, secrets, IaC), maintient l'observabilite (Prometheus/Grafana) | Fournit a l'equipe de developpement les retours qualite/securite (SonarCloud, registre de vulnerabilites) ; collabore avec le Lead Developer sur les seuils qualite |
| **QA / Testeur** | Definit et execute la strategie de tests (`docs/test-strategy.md`), notamment les tests d'acceptation valides sur le backlog, et les tests de charge (Siege) | Valide que les criteres d'acceptation du backlog sont couverts par des tests automatises avant chaque livraison |

Ces six profils sont deliberement distincts et realistes (pas de "mouton a
5 pattes" cumulant backend, frontend, securite et QA) : sur un projet de
cette nature, cette repartition permet a chaque role de se specialiser tout
en gardant des interactions clairement definies via le backlog et le
pipeline CI/CD, qui servent de contrat commun entre les roles.

Dans le cadre de cette evaluation individuelle, le candidat a assume
successivement l'ensemble de ces roles (Lead Developer en premier plan,
conformement a l'enonce, mais aussi Backend/Frontend/DevSecOps/QA pour la
realisation effective du prototype) — ce tableau documente la repartition
cible dans un contexte d'equipe reelle, pas l'organisation suivie pour cet
exercice solo.

## Action de formation proposee

### Constat

L'analyse du plan de remediation securite (`docs/security-and-devsecops.md`)
et du registre de vulnerabilites (`docs/vulnerability-register.md`) montre
que la majorite des vulnerabilites reelles rencontrees sur ce projet ne
venaient pas d'un manque d'outillage (les scans SAST/SCA/secrets sont bien
en place), mais d'ecarts de comprehension au moment de la conception :
un secret laisse en dur avec une valeur par defaut, une pipeline dont un job
de scan ne tournait plus silencieusement, un CSRF desactive sans
documentation de la justification. Ce sont des competences de securite
applicative "shift-left", pas des lacunes d'outillage.

### Formation retenue

**"Securite applicative OWASP et DevSecOps pour developpeurs"** — formation
courte (2 jours), destinee aux profils Developpeur Backend, Developpeur
Frontend et Ingenieur DevSecOps.

Objectifs :

- reconnaitre et corriger par la pratique les categories OWASP Top 10 les
  plus pertinentes pour une application transactionnelle (injection,
  authentification cassee, exposition de donnees sensibles, mauvaise
  configuration de securite) ;
- savoir lire et prioriser soi-meme un rapport de scan (SARIF, SonarCloud,
  Trivy) plutot que de deleguer systematiquement cette lecture a un expert
  securite externe a l'equipe ;
- integrer le reflexe de justifier explicitement (et pas seulement corriger
  ou ignorer) chaque exception de securite acceptee, sur le modele de la
  justification CSRF deja documentee dans `SecurityConfig.java`.

Format realiste : formation inter-entreprises existante sur le marche
(type "OWASP Top 10 applique" ou equivalent propose par un organisme
generaliste en cybersecurite applicative), pas une formation sur mesure a
concevoir en interne — reste proportionne a la taille de l'equipe cible
(3 profils techniques).

Justification du choix : cette formation renforce directement l'autonomie
de l'equipe sur la phase **Code** du cycle de vie DevSecOps
(`docs/security-and-devsecops.md#cycle-de-vie-du-developpement-demarche-devsecops`),
la ou la detection actuelle repose presque entierement sur l'outillage
automatise (Semgrep, CodeQL, SonarCloud) plutot que sur la vigilance humaine
en amont — reduisant le nombre de findings a traiter en aval et donc le
volume de dette de securite qui s'accumule avant detection.
