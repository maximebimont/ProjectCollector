# Guide de demonstration Collector.shop

## Objectif de la demo

La demonstration doit montrer que Collector.shop couvre un parcours metier complet et coherent pour un POC de marketplace entre particuliers.

Le scenario cible est le suivant :

1. creation d'un compte vendeur ;
2. connexion vendeur ;
3. creation d'un article ;
4. verification dans le catalogue ;
5. verification dans "Mes objets" ;
6. creation d'un compte acheteur ;
7. connexion acheteur ;
8. consultation du detail de l'article ;
9. achat de l'article ;
10. passage automatique au statut `SOLD` ;
11. verification dans "Mes achats" ;
12. verification dans "Mes ventes" ;
13. verification de la commission Collector de 5 %.

Ce scenario a ete teste manuellement avec succes.

## Prerequis

- Docker installe et demarre ;
- Docker Compose disponible ;
- depot present en local ;
- ports `4200`, `8080` et `5433` disponibles.

## Commande de lancement

```bash
docker compose up --build
```

## URLs utiles

- frontend : `http://localhost:4200`
- backend health : `http://localhost:8080/actuator/health`
- catalogue API : `http://localhost:8080/api/items`

## Verification rapide avant la soutenance

1. ouvrir `http://localhost:4200` ;
2. verifier que `http://localhost:8080/actuator/health` retourne `UP` ;
3. verifier que `http://localhost:8080/api/items` retourne le catalogue ;
4. verifier que les conteneurs `collector_frontend`, `collector_backend` et `collector_postgres` sont demarres.

## Scenario de demonstration valide

### 1. Creation du vendeur

1. aller sur `http://localhost:4200/register` ;
2. creer un compte vendeur ;
3. se connecter avec ce compte.

### 2. Creation de l'article

1. aller sur la page de creation d'article ;
2. saisir un titre, une description, un prix et, si besoin, une image ;
3. valider la creation.

Exemple simple :

- titre : `Figurine Star Wars vintage`
- description : `Figurine originale en bon etat, annees 1980`
- prix : `100.00`

### 3. Verification cote vendeur

1. ouvrir le catalogue ;
2. verifier que l'article apparait bien dans la liste publique ;
3. ouvrir la page "Mes objets" ;
4. verifier que l'article apparait aussi dans l'espace vendeur.

### 4. Creation de l'acheteur

1. se deconnecter ;
2. aller sur `http://localhost:4200/register` ;
3. creer un compte acheteur ;
4. se connecter avec ce second compte.

### 5. Achat de l'article

1. ouvrir le catalogue ;
2. acceder au detail de l'article cree par le vendeur ;
3. verifier les informations affichees ;
4. lancer l'achat.

### 6. Verification apres achat

1. verifier que l'article passe automatiquement au statut `SOLD` ;
2. aller dans "Mes achats" et verifier la presence de la commande cote acheteur ;
3. se deconnecter puis se reconnecter en vendeur ;
4. aller dans "Mes ventes" et verifier la presence de la vente.

### 7. Verification de la commission

Pour un article a `100.00` :

- montant total : `100.00`
- commission Collector : `5.00`
- montant vendeur : `95.00`

Cette verification a elle aussi ete validee lors du test manuel complet.

## Ce qu'il faut verbaliser pendant la demo

- le catalogue est public ;
- la creation d'article et l'achat necessitent une authentification ;
- les regles critiques sont controlees par le backend ;
- un utilisateur ne peut pas acheter son propre article ;
- un article deja vendu ne peut pas etre achete une seconde fois ;
- le calcul de la commission de 5 % est automatique ;
- Docker Compose permet un lancement local reproductible.

## Plan B demo

Si la demonstration frontend rencontre un probleme :

1. verifier l'etat des conteneurs Docker ;
2. verifier les logs backend, frontend et postgres ;
3. verifier `http://localhost:8080/actuator/health` ;
4. utiliser Postman pour montrer les endpoints backend si besoin.

Commandes utiles :

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## Ce qui est realise, teste, simule et en perspective

Realise :

- parcours vendeur -> acheteur -> achat -> `SOLD` ;
- creation de commande ;
- calcul de la commission ;
- pages "Mes objets", "Mes achats" et "Mes ventes" ;
- lancement complet avec Docker Compose.

Teste :

- test manuel complet du parcours principal, realise avec succes ;
- tests backend automatises ;
- build frontend automatise ;
- tests de charge locaux documentes.

Simule ou simplifie :

- aucun paiement reel ;
- pas d'administration complete ;
- observabilite limitee a Actuator.

Perspective :

- rejouer le scenario juste avant la soutenance ;
- preparer les captures et le support PowerPoint ;
- garder un plan B API/Postman si le frontend pose probleme.
