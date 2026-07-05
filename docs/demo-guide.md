# Guide de démonstration Collector.shop

## Objectif de la démo

La démonstration doit prouver que le POC couvre un flux métier complet de marketplace entre particuliers :

1. un vendeur s'inscrit et se connecte ;
2. il crée un article ;
3. un acheteur consulte le catalogue public ;
4. l'acheteur ouvre le détail de l'article ;
5. l'acheteur achète l'article ;
6. l'article passe au statut `SOLD` ;
7. une commande est créée avec une commission plateforme de 5 % ;
8. le vendeur voit la vente ;
9. l'acheteur voit l'achat.

La démo ne cherche pas à montrer une marketplace de production. Elle vise à montrer un POC propre, cohérent et démontrable techniquement.

## Prérequis

- Docker Desktop ou Docker Engine installé et démarré
- Docker Compose disponible
- ports libres : `4200`, `8080`, `5433`
- dépôt cloné localement
- terminal positionné à la racine du projet

## Commande de lancement

```bash
docker compose up --build
```

## Services attendus

Après démarrage, l'environnement local doit exposer :

- frontend Angular : `http://localhost:4200`
- backend Spring Boot : `http://localhost:8080`
- PostgreSQL : `localhost:5433`
- Actuator health : `http://localhost:8080/actuator/health`
- Actuator info : `http://localhost:8080/actuator/info`

## Vérifications rapides avant la démo

1. Ouvrir `http://localhost:4200/items` et vérifier que le catalogue s'affiche.
2. Ouvrir `http://localhost:8080/actuator/health` et vérifier que le backend répond.
3. Vérifier dans les logs Docker que les conteneurs `collector_frontend`, `collector_backend` et `collector_postgres` sont démarrés.

## Scénario de démonstration recommandé

### Étape 1 - Présenter l'architecture en 30 secondes

À l'oral :

- frontend Angular séparé du backend Spring Boot ;
- backend connecté à PostgreSQL ;
- authentification JWT ;
- lancement complet avec Docker Compose.

### Étape 2 - Créer le compte vendeur

1. Aller sur `http://localhost:4200/register`.
2. Créer un compte vendeur avec une adresse email dédiée.
3. Se connecter si l'application ne le fait pas automatiquement.

Exemple de données :

- prénom : `Paul`
- nom : `Vendeur`
- email : `vendeur.demo@collector.local`
- mot de passe : `password123`

### Étape 3 - Créer une annonce

1. Aller sur la page de création d'objet.
2. Saisir un titre, une description, un prix et éventuellement une image.
3. Valider la création.
4. Montrer que l'objet apparaît dans :
   - le catalogue public ;
   - l'espace du vendeur.

Exemple de données :

- titre : `Figurine Star Wars vintage`
- description : `Figurine originale en bon état, années 1980.`
- prix : `100.00`
- image : URL publique facultative

### Étape 4 - Déconnexion vendeur

1. Utiliser le bouton de déconnexion.
2. Revenir sur le catalogue public.
3. Expliquer que le catalogue reste visible sans authentification.

### Étape 5 - Créer le compte acheteur

1. Aller sur `http://localhost:4200/register`.
2. Créer un second compte.
3. Se connecter avec ce compte.

Exemple de données :

- prénom : `Alice`
- nom : `Acheteur`
- email : `acheteur.demo@collector.local`
- mot de passe : `password123`

### Étape 6 - Parcours d'achat

1. Depuis le catalogue, ouvrir le détail de l'objet créé par le vendeur.
2. Vérifier que le détail affiche le prix et les informations vendeur.
3. Lancer l'achat depuis la page détail.
4. Montrer le message de succès et le résumé de commande si affiché.

## Contrôles à montrer pendant l'achat

Les points suivants sont importants à verbaliser :

- l'acheteur ne peut pas acheter son propre objet ;
- un objet déjà vendu ne peut pas être acheté une seconde fois ;
- le backend calcule automatiquement la commission de 5 % ;
- le montant vendeur correspond au prix moins la commission.

Exemple attendu pour un article à `100.00` euros :

- prix total : `100.00`
- commission plateforme : `5.00`
- montant vendeur : `95.00`

## Vérifications après achat

1. Revenir au détail de l'objet et montrer le statut `SOLD`.
2. Aller dans les achats de l'acheteur et montrer la commande.
3. Se déconnecter.
4. Se reconnecter avec le compte vendeur.
5. Aller dans les ventes et montrer la vente correspondante.

## Points techniques à citer pendant la soutenance

- l'authentification est gérée par JWT ;
- les règles métier critiques sont côté backend ;
- le backend expose aussi des endpoints Actuator ;
- la CI/CD et les scans de sécurité sont automatisés dans GitHub Actions ;
- la charge a été testée en local avec Siege sur des endpoints publics.

## Ce qui est réellement réalisé

- flux métier complet de vente/achat jusqu'à la création de commande ;
- passage de l'objet en `SOLD` ;
- calcul de commission à 5 % ;
- pages frontend vendeur et acheteur ;
- exécution complète avec Docker Compose ;
- CI/CD et scans DevSecOps dans le dépôt.

## Ce qui est simulé ou simplifié

- aucun paiement réel n'est intégré ;
- les tests de charge restent des tests locaux de démonstration ;
- l'observabilité reste limitée à Spring Boot Actuator ;
- la sécurité reste adaptée à un POC, pas à une production Internet.

## Ce qui reste en perspective

- test manuel final complet de bout en bout à rejouer juste avant la soutenance ;
- préparation du support PowerPoint ;
- renforcement éventuel des tests frontend automatisés ;
- durcissement sécurité si le projet devait dépasser le cadre scolaire.

## Arrêt de l'environnement

```bash
docker compose down
```
