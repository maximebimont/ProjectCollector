# Backlog fonctionnel

## Perimetre

Conformement aux consignes d'evaluation ("il ne vous est pas demande
d'implementer l'ensemble des fonctionnalites [...] vous devez cependant a
minima implementer une fonctionnalite metier"), le backlog complet ci-dessous
couvre l'ensemble du parcours metier cible de Collector.shop. La
fonctionnalite retenue et effectivement implementee dans le prototype est
**US-05 (Achat d'un objet)**, avec ses dependances directes **US-01
(inscription)**, **US-02 (connexion)** et **US-03 (creation d'un objet)** —
necessaires pour qu'un scenario d'achat complet soit demontrable de bout en
bout. Les autres user stories (US-04, US-06, US-07) sont formalisees pour
donner une vision complete du produit cible, et sont egalement implementees
dans le prototype (elles decoulent directement du meme flux metier), mais
n'etaient pas le coeur de l'exercice.

## US-01 — Inscription

**En tant que** visiteur non authentifie,
**je veux** creer un compte avec mon email et un mot de passe,
**afin de** pouvoir vendre ou acheter des objets sur Collector.shop.

Criteres d'acceptation :

- Given un email non deja utilise et un mot de passe valide, When je soumets
  le formulaire d'inscription, Then un compte est cree et je recois un JWT
  valide.
- Given un email deja utilise, When je soumets le formulaire, Then
  l'inscription est refusee avec un message d'erreur explicite.
- Given un mot de passe absent ou vide, When je soumets le formulaire, Then
  l'inscription est refusee (validation cote backend, pas seulement cote
  frontend).

Tests couvrant ce critere : `AuthControllerTest`, `AuthServiceTest`
(backend), tests Karma du composant d'inscription (frontend).

## US-02 — Connexion

**En tant qu'** utilisateur inscrit,
**je veux** me connecter avec mon email et mon mot de passe,
**afin d'**accéder aux fonctionnalites reservees aux membres (creation
d'objet, achat, historique).

Criteres d'acceptation :

- Given des identifiants valides, When je me connecte, Then je recois un JWT
  valide et je suis redirige vers le catalogue.
- Given des identifiants invalides, When je tente de me connecter, Then la
  connexion est refusee sans reveler si c'est l'email ou le mot de passe qui
  est incorrect (pas d'enumeration de comptes).
- Given plus de 5 tentatives echouees en moins d'une minute pour une meme IP
  cliente reelle (derriere la gateway), When je retente, Then la tentative
  est bloquee temporairement (`LoginRateLimitFilter`).

Tests couvrant ce critere : `AuthControllerTest`, `AuthServiceTest`,
`LoginRateLimitFilterTest` (backend).

## US-03 — Creation d'un objet (cote vendeur)

**En tant qu'** utilisateur connecte,
**je veux** publier un objet de collection avec titre, description, prix et
photo,
**afin de** le proposer a la vente sur le catalogue public.

Criteres d'acceptation :

- Given je suis connecte, When je cree un objet avec un titre, un prix
  positif et une description, Then l'objet est cree avec le statut
  `AVAILABLE` et devient visible dans le catalogue public.
- Given je ne suis pas connecte, When je tente de creer un objet, Then la
  requete est refusee (401).
- Given un prix negatif ou nul, When je soumets le formulaire, Then la
  creation est refusee.

Tests couvrant ce critere : `ItemControllerTest`, `ItemServiceTest`
(backend).

## US-04 — Consultation du catalogue et du detail d'un objet

**En tant que** visiteur ou utilisateur connecte,
**je veux** consulter le catalogue public et le detail d'un objet,
**afin de** decider si je souhaite l'acheter.

Criteres d'acceptation :

- Given des objets disponibles, When je consulte le catalogue, Then je vois
  la liste des objets au statut `AVAILABLE` (les objets `SOLD` restent
  consultables en detail mais n'apparaissent plus proposes a l'achat).
- Given un objet existant, When je consulte son detail, Then je vois son
  titre, sa description, son prix et le statut courant.
- Given un identifiant d'objet inexistant, When je consulte son detail, Then
  je recois une erreur 404 explicite.

Tests couvrant ce critere : `ItemControllerTest` (backend).

## US-05 — Achat d'un objet (fonctionnalite metier implementee)

**En tant qu'** utilisateur connecte,
**je veux** acheter un objet disponible propose par un autre utilisateur,
**afin d'**en devenir proprietaire et de declencher la vente cote vendeur.

Criteres d'acceptation :

- Given un objet au statut `AVAILABLE` propose par un autre utilisateur, When
  j'achete cet objet, Then une commande est creee, l'objet passe au statut
  `SOLD`, et la commission Collector de 5 % est calculee
  (`platformFee` = 5 % du prix, `sellerAmount` = 95 % du prix).
- Given un objet que j'ai moi-meme mis en vente, When je tente de l'acheter,
  Then l'achat est refuse ("Vous ne pouvez pas acheter votre propre objet").
- Given un objet deja au statut `SOLD`, When je tente de l'acheter, Then
  l'achat est refuse ("Cet objet est deja vendu").
- Given un objet pour lequel une commande existe deja, When je tente de
  l'acheter a nouveau, Then l'achat est refuse ("Une commande existe deja
  pour cet objet") — protection contre un double achat concurrent.
- Given un identifiant d'objet inexistant, When je tente de l'acheter, Then
  l'achat est refuse ("Objet introuvable").

Tests couvrant ce critere (tests d'acceptation au sens des consignes —
verifient le comportement de bout en bout du cas d'usage metier, pas
seulement une unite de code isolee) :

- `OrderServiceTest.shouldBuyAvailableItemSuccessfully` — cas nominal complet
  (creation de commande, statut `SOLD`, calcul de la commission).
- `OrderServiceTest.shouldRejectPurchaseWhenBuyerIsSeller`
- `OrderServiceTest.shouldRejectPurchaseWhenItemIsAlreadySold`
- `OrderServiceTest.shouldRejectPurchaseWhenItemDoesNotExist`
- `OrderServiceTest.shouldRejectPurchaseWhenOrderAlreadyExistsForItem`
- `OrderControllerTest.shouldBuyItem` — verifie le contrat API (controller
  vers service).
- Test manuel complet du parcours (`docs/demo-guide.md`) — rejoue le meme
  scenario via l'interface, de bout en bout.

Ces tests constituent les tests d'acceptation integres au pipeline CI/CD
(`backend-tests.yml`, job execute a chaque push/PR) demandes par les
consignes ("Le respect de la fonctionnalite devra etre presente via des
tests d'appels voire des tests d'acceptation").

## US-06 — Historique des achats

**En tant qu'** utilisateur connecte,
**je veux** consulter la liste des objets que j'ai achetes,
**afin de** garder une trace de mes acquisitions.

Criteres d'acceptation :

- Given j'ai achete un ou plusieurs objets, When je consulte "Mes achats",
  Then je vois la liste triee par date decroissante, avec le prix payé et le
  vendeur.
- Given je n'ai encore rien achete, When je consulte "Mes achats", Then je
  vois une liste vide (pas d'erreur).

Tests couvrant ce critere : `OrderControllerTest.shouldReturnMyPurchases`,
`OrderServiceTest.shouldReturnMyPurchases`.

## US-07 — Historique des ventes

**En tant qu'** utilisateur connecte,
**je veux** consulter la liste des objets que j'ai vendus,
**afin de** suivre mon activite de vendeur et les montants percus apres
commission.

Criteres d'acceptation :

- Given j'ai vendu un ou plusieurs objets, When je consulte "Mes ventes",
  Then je vois la liste triee par date decroissante, avec le montant percu
  (`sellerAmount`, apres deduction de la commission) et l'acheteur.
- Given je n'ai encore rien vendu, When je consulte "Mes ventes", Then je
  vois une liste vide (pas d'erreur).

Tests couvrant ce critere : `OrderControllerTest.shouldReturnMySales`,
`OrderServiceTest.shouldReturnMySales`.

## US-08 — Moderation par un administrateur

**En tant qu'** administrateur de la plateforme,
**je veux** consulter la liste des utilisateurs et des annonces, desactiver
un compte abusif et supprimer une annonce non conforme,
**afin de** faire respecter les regles de la plateforme sans dependre d'une
intervention manuelle en base de donnees.

Cette user story a ete ajoutee apres la v1 pour demontrer, lors de la
soutenance, le deploiement d'une nouvelle fonctionnalite au travers de la
chaine CI/CD (`main-pipeline.yml`) plutot que le seul parcours metier
initial. Elle n'etait pas requise par les consignes (« il ne vous est pas
demande d'implementer l'ensemble des fonctionnalites ») mais respecte les
memes regles que le reste du produit : architecture en couches, controle
d'acces par role, gestion centralisee des erreurs, tests unitaires et
d'integration.

Criteres d'acceptation :

- Given je suis authentifie avec le role `ADMIN`, When j'appelle
  `GET /api/admin/users`, Then je recois la liste de tous les comptes avec
  leur statut (actif/desactive).
- Given je suis authentifie avec le role `USER`, When j'appelle
  `GET /api/admin/users` ou toute autre route `/api/admin/**`, Then la
  requete est refusee (403).
- Given un compte utilisateur actif, When un administrateur le desactive
  (`PATCH /api/admin/users/{id}/status`), Then l'utilisateur ne peut plus
  se connecter (401 explicite : "Ce compte a ete desactive par un
  administrateur").
- Given un administrateur, When il tente de desactiver son propre compte,
  Then l'action est refusee ("Vous ne pouvez pas modifier le statut de
  votre propre compte") — pour eviter qu'un admin ne se verrouille
  lui-meme hors de la plateforme.
- Given une annonce existante (quel que soit son vendeur ou son statut),
  When un administrateur la supprime (`DELETE /api/admin/items/{id}`),
  Then l'annonce est retiree du catalogue.
- Given aucune variable d'environnement `ADMIN_BOOTSTRAP_EMAIL` /
  `ADMIN_BOOTSTRAP_PASSWORD` n'est fournie, When le backend demarre, Then
  aucun compte administrateur n'est cree (aucun identifiant admin n'est
  commite dans le depot).

Tests couvrant ce critere : `AdminServiceTest`, `AdminControllerTest`,
`AdminBootstrapRunnerTest`, `GlobalExceptionHandlerTest`
(`AccessDeniedException`, `DisabledException`), `AdminAccessIntegrationTest`
(backend, test d'integration MockMvc bout en bout) ; `admin.service.spec.ts`,
`admin.guard.spec.ts`, `admin-users.component.spec.ts`,
`admin-items.component.spec.ts` (frontend).

## Hors perimetre (assume, cf. `docs/architecture-and-quality.md#limites-actuelles`)

- paiement reel (carte bancaire, virement) ;
- litiges entre acheteur et vendeur (la moderation de base est couverte
  par US-08, mais pas la gestion de litiges) ;
- messagerie entre acheteur et vendeur ;
- notation/avis apres transaction.
