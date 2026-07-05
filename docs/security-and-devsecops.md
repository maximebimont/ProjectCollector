# Sécurité et démarche DevSecOps

## 1. Positionnement

Collector.shop est un POC scolaire. La sécurité mise en place vise à montrer une démarche sérieuse et structurée, sans prétendre atteindre le niveau d'une application de production exposée sur Internet.

L'application manipule tout de même des données et actions sensibles :

- comptes utilisateurs ;
- mots de passe hashés ;
- authentification par token ;
- annonces d'objets ;
- commandes d'achat.

## 2. Mesures de sécurité applicative réellement présentes

### Authentification et contrôle d'accès

Le dépôt montre les mécanismes suivants :

- endpoints publics `POST /api/auth/register` et `POST /api/auth/login` ;
- génération et validation de JWT côté backend ;
- backend stateless avec Spring Security ;
- guard Angular pour bloquer certaines routes côté frontend ;
- interceptor Angular pour envoyer le bearer token automatiquement.

### Protection des routes et des ressources

La configuration de sécurité backend autorise publiquement :

- `/api/auth/**`
- `GET /api/items`
- `GET /api/items/*`
- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`

Le reste nécessite une authentification.

### Règles métier qui renforcent la sécurité

- seul le vendeur peut modifier ou supprimer son objet ;
- un utilisateur ne peut pas acheter son propre objet ;
- un objet déjà vendu ne peut pas être acheté une seconde fois ;
- les pages frontend adaptent l'expérience utilisateur, mais la règle de blocage reste côté backend.

### Validation et gestion des erreurs

- DTO côté backend ;
- Bean Validation ;
- gestion globale des exceptions ;
- séparation controller / service / repository pour limiter les effets de bord.

### CORS

La configuration actuelle autorise explicitement l'origine :

- `http://localhost:4200`

Cela est cohérent avec le mode de fonctionnement local du projet.

## 3. DevSecOps dans le dépôt

Le dépôt contient une pipeline principale et plusieurs workflows réutilisables.

### Pipeline principale

Le workflow principal `main-pipeline.yml` orchestre :

- tests backend ;
- build frontend ;
- SAST et qualité de code ;
- scan de secrets ;
- scan Dockerfile ;
- build Docker et scan d'images.

Il est déclenché sur :

- push sur `dev` ;
- push sur `main` ;
- pull request vers `main` ;
- déclenchement manuel ;
- planification hebdomadaire.

### Contrôles automatisés réellement présents

- `backend-tests.yml` : compilation, tests et packaging Maven ;
- `frontend-build.yml` : `npm ci` puis `npm run build` ;
- `code-quality-sast.yml` : Semgrep + CodeQL ;
- `secret-scanning.yml` : Gitleaks ;
- `iac-dockerfile-scan.yml` : Checkov sur les Dockerfiles ;
- `sca-dependency-scan.yml` : OWASP Dependency-Check + Trivy filesystem ;
- `docker-build.yml` : build des images backend/frontend + scans Trivy.

### Dépendances et mises à jour

Le dépôt contient aussi un `dependabot.yml` pour :

- les dépendances Maven du backend ;
- les GitHub Actions.

Les mises à jour sont planifiées chaque semaine sur la branche `dev`.

## 4. Analyse de risques simple

| Risque | Niveau | Mesure actuelle | Limite actuelle | Perspective |
| --- | --- | --- | --- | --- |
| Vol ou fuite de JWT | Élevé | JWT, routes protégées, interceptor, guard | pas de refresh token | rotation et gestion plus robuste des sessions |
| Accès non autorisé à une ressource métier | Élevé | contrôles backend sur achat et propriété | couverture perfectible sur tous les cas négatifs | davantage de tests d'autorisation |
| Achat incohérent d'un objet vendu | Moyen | règle métier backend + statut `SOLD` | pas de test de concurrence avancé | scénarios de concurrence et verrouillage si besoin |
| Dépendance vulnérable | Élevé | Dependabot, OWASP Dependency-Check, Trivy | traitement manuel des alertes | routine de correction et suivi régulier |
| Secret commité par erreur | Élevé | Gitleaks | dépend de la discipline projet | revue régulière et secrets centralisés |
| Mauvaise configuration Dockerfile | Moyen | Checkov | couverture limitée au périmètre scanné | durcissement des images et règles supplémentaires |
| Exposition excessive d'endpoints techniques | Moyen | Actuator limité à health/info/metrics | endpoints tout de même publics en local | filtrage réseau selon environnement |
| Mots de passe insuffisamment robustes | Moyen | hashage et validation de base | pas de politique forte, pas de MFA | politique plus stricte, MFA, reset sécurisé |

## 5. Observabilité et sécurité opérationnelle

Le backend expose une observabilité minimale avec Actuator :

- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`

Cette observabilité aide à :

- vérifier qu'un conteneur backend est vivant ;
- montrer un début de supervision ;
- appuyer les tests de charge sur des endpoints techniques simples.

Elle ne constitue pas une supervision de production complète.

## 6. Charge et résilience

Le dépôt contient un dossier `load-tests/` avec un jeu d'URLs Siege :

- `http://localhost:8080/api/items`
- `http://localhost:8080/actuator/health`
- `http://localhost:8080/actuator/info`
- `http://localhost:8080/actuator/metrics`

Cette démarche montre une validation de base sous petite charge concurrente. En revanche :

- ce n'est pas un benchmark de production ;
- les chiffres dépendent fortement du poste local ;
- aucun historique chiffré détaillé n'est versionné dans ce dépôt.

## 7. Ce qui est réalisé, simulé et prévu

### Réalisé

- authentification JWT ;
- règles métier de sécurité côté backend ;
- CORS configuré pour le frontend local ;
- SAST, SCA, secret scanning et scans container/IaC dans GitHub Actions ;
- build Docker des images applicatives ;
- tests backend automatisés.

### Simulé ou limité volontairement

- pas de paiement réel ;
- pas de MFA ;
- pas de refresh token ;
- pas de coffre à secrets externe ;
- pas d'infrastructure cloud ni de WAF ;
- sécurité calibrée pour un POC de soutenance.

### Prévu ou pertinent en perspective

- centralisation des secrets ;
- rotation des secrets et durée de vie JWT plus fine ;
- scans complémentaires côté frontend ;
- logs de sécurité plus détaillés ;
- HTTPS et durcissement réseau dans un environnement cible.

## 8. Point d'honnêteté important pour la soutenance

La présence de workflows DevSecOps dans le dépôt est réelle et démontrable. En revanche, il ne faut pas prétendre que cela équivaut à une chaîne de sécurité complète de production. Le projet montre une démarche crédible de sécurisation du développement, pas une conformité exhaustive.

## 9. Message clé pour l'oral

La sécurité de Collector.shop ne repose pas sur un seul mécanisme. Elle combine authentification, contrôles métier, validation, scans automatisés et conteneurisation contrôlée. Pour une soutenance, la force du projet est de montrer une démarche DevSecOps cohérente et honnête, avec des limites identifiées.
