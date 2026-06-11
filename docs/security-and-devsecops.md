# Security and DevSecOps

## Contexte du projet

Collector.shop est une marketplace de type POC etudiant construite avec :

- un backend Spring Boot
- un frontend Angular
- une base PostgreSQL
- une authentification JWT
- Docker et Docker Compose
- GitHub Actions pour la CI
- Spring Boot Actuator pour une observabilite minimale
- des tests automatises backend
- une base de tests de charge avec Siege

L'application manipule des donnees liees a une activite de vente entre particuliers :

- comptes utilisateurs
- emails
- mots de passe hashes
- annonces d'objets
- commandes d'achat

Comme pour toute marketplace, plusieurs risques generaux existent :

- usurpation de compte
- acces non autorise aux annonces ou aux actions protegees
- achat frauduleux ou incoherent
- suppression ou modification d'un objet par un autre utilisateur
- utilisation de dependances vulnerables
- exposition excessive d'endpoints techniques

## Mesures de securite deja presentes

Le projet integre deja plusieurs mecanismes de securite et de qualite.

### Authentification et controle d'acces

- authentification par JWT cote backend
- Spring Security pour proteger les routes sensibles
- routes frontend protegees avec `authGuard`
- interceptor Angular pour ajouter automatiquement le token JWT sur les appels HTTP
- stockage du token et de l'identifiant utilisateur dans le navigateur pour gerer la session

### Regles metier de protection

- seul le proprietaire d'un objet peut le modifier ou le supprimer
- un utilisateur ne peut pas acheter son propre objet
- un objet deja vendu ne peut pas etre achete une seconde fois
- les pages frontend adaptent certaines actions selon le contexte utilisateur, par exemple en desactivant l'achat de son propre objet

### Validation et robustesse

- utilisation de DTO cote backend
- validation d'entree avec Bean Validation
- gestion globale des erreurs avec un handler centralise
- separation entre controller, service et repository pour garder une logique plus lisible et plus testable

### Exposition reseau et endpoints techniques

- CORS limite au frontend local `http://localhost:4200`
- endpoints Actuator limites a :
  - `/actuator/health`
  - `/actuator/info`
  - `/actuator/metrics`
- les autres endpoints techniques ne sont pas exposes publiquement

### Qualite, CI et deploiement

- tests automatises backend sur le parcours d'achat
- pipeline GitHub Actions pour compiler, tester et builder
- workflow dedie au scan de dependances OWASP pour le backend
- dockerisation du backend et du frontend

## Securite des dependances

La gestion des dependances repose sur des outils standards et simples :

- Maven pour le backend
- npm pour le frontend
- GitHub Actions pour verifier le build et les tests
- Dependabot pour proposer des mises a jour automatiques des dependances backend Maven et des GitHub Actions

Le projet contient aussi un workflow dedie a l'analyse de vulnerabilites du backend :

- OWASP Dependency-Check dans `backend-security.yml`
- separation du scan dans un workflow distinct, ce qui permet de garder la CI principale plus rapide

L'objectif de cette strategie est d'identifier les CVE connues dans les bibliotheques utilisees et de faciliter leur mise a jour.

Pour le frontend, la strategie reste plus simple dans l'etat actuel :

- suivi des dependances via `package.json` et `package-lock.json`
- build dans la CI
- possibilite d'ajouter ou de renforcer les audits npm dans une etape ulterieure

## Matrice simple des risques

| Risque | Impact | Probabilite | Mesure mise en place | Amelioration possible |
|---|---|---|---|---|
| Vol de token JWT | Eleve | Moyen | JWT requis sur les routes protegees, guard frontend, interceptor Angular | Refresh token, duree de vie plus courte, stockage plus durci, rotation de secret |
| Acces a une route protegee sans authentification | Eleve | Faible a moyen | Spring Security cote backend, `authGuard` cote frontend | Ajouter plus de tests d'autorisation et journalisation de securite |
| Modification d'un objet par un autre utilisateur | Eleve | Moyen | Controle proprietaire cote backend | Ajouter plus de tests d'integration sur les cas d'acces interdit |
| Achat d'un objet deja vendu | Moyen | Moyen | Regle metier backend bloquant le rachat d'un objet `SOLD` | Renforcer la couverture de tests de concurrence |
| Vulnerabilite dans une dependance | Eleve | Moyen | Dependabot, CI, OWASP Dependency-Check backend | Ajouter des scans complementaires frontend et suivi regulier des mises a jour |
| Endpoint Actuator trop expose | Moyen | Faible | Exposition limitee a `health`, `info`, `metrics` | Restreindre encore l'acces selon l'environnement, filtrage reseau |
| Mot de passe faible | Moyen | Moyen | Hashage des mots de passe, validation de base | Politique de mot de passe plus stricte, controle de robustesse, MFA |
| CORS trop permissif | Moyen | Faible | Origine frontend locale explicitement autorisee | Parametrage par environnement et revue reguliere |
| Donnees de test ou secrets en dur | Eleve | Moyen | Variables d'environnement supportees pour la base et le secret JWT | GitHub Secrets, Vault, rotation des secrets |
| Absence de paiement reel securise | Eleve | Faible dans le POC | Aucun vrai paiement integre, logique limitee a la commande | Integration future avec un PSP securise et conformite adaptee |

## Observabilite minimale

L'observabilite reste volontairement simple pour rester adaptee a un projet etudiant.

Le backend expose :

- `/actuator/health` pour verifier l'etat de l'application
- `/actuator/info` pour exposer des informations de contexte non sensibles
- `/actuator/metrics` pour consulter des metriques techniques de base

Les informations `/actuator/info` incluent actuellement :

- nom de l'application
- description
- version
- environnement local de developpement

Cette approche permet deja de demontrer une base d'observabilite sans mettre en place une stack plus lourde comme Prometheus ou Grafana.

## Tests de charge

Le projet contient un dossier `load-tests/` avec :

- `README.md`
- `siege-urls.txt`

Cette base permet de lancer rapidement des tests de charge simples sur des endpoints publics avec Siege, en particulier :

- `/api/items`
- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`

L'objectif n'est pas de valider une production, mais de montrer une demarche :

- verifier que le catalogue reste accessible
- observer le temps de reponse
- identifier les limites d'un environnement local

## Limites actuelles

Le projet presente volontairement plusieurs limites importantes, assumees dans le cadre d'un POC etudiant :

- pas de vrai paiement en ligne
- pas de systeme de reinitialisation de mot de passe
- pas de refresh token
- pas de MFA
- pas de monitoring avance de type Prometheus / Grafana
- pas d'environnement cloud reel
- pas de journalisation de securite complete
- securite adaptee a un POC de demonstration, pas a une production

## Ameliorations futures

Les pistes d'amelioration les plus pertinentes seraient :

- mise en place de refresh tokens
- rotation reguliere des secrets
- stockage des secrets dans GitHub Secrets ou Vault
- rate limiting sur les endpoints sensibles
- logs de securite et traces d'audit
- audit trail sur les actions critiques
- scan SAST dans la CI
- scan des images Docker / containers
- HTTPS obligatoire dans un vrai deploiement
- deploiement cloud avec configuration securisee
- monitoring avance et alerting

## Resume oral

Sur ce projet, la securite a ete prise en compte des la conception, meme si l'objectif reste celui d'un POC etudiant et non d'une application de production. Les routes sensibles sont protegees cote backend avec Spring Security, et cote frontend avec un guard et un interceptor JWT.

Les regles metier participent aussi a la securite fonctionnelle. Par exemple, un utilisateur ne peut pas modifier l'objet d'un autre vendeur, ne peut pas acheter son propre objet, et ne peut pas acheter un objet deja vendu. Cela montre que la securite ne se limite pas a l'authentification, mais qu'elle concerne aussi la coherence du metier.

La qualite et la securisation du developpement passent egalement par la CI, les tests automatises, la dockerisation et le scan des dependances. Le projet inclut Dependabot, un workflow CI principal et un workflow OWASP dedie au backend pour identifier les vulnerabilites connues.

Enfin, les limites actuelles sont clairement identifiees : pas de MFA, pas de refresh token, pas de paiement reel, pas de monitoring avance, et securite adaptee a une soutenance de projet etudiant. Cette transparence est importante, car elle montre une analyse honnete du niveau de maturite du projet et des evolutions necessaires pour aller vers un environnement plus proche de la production.
