# AGENTS.md — ProjectCollector / Collector.shop

## Project context

This repository contains a school project for an individual evaluation about supervising and ensuring software application development.

The application is a simplified marketplace called **Collector.shop**. It allows users to buy and sell vintage or collectible items.

The main proof of concept must demonstrate a complete business flow:

1. A seller creates an item.
2. A buyer views the catalogue.
3. A buyer opens the item detail page.
4. A buyer purchases the item.
5. The item becomes `SOLD`.
6. The order is created.
7. Collector.shop calculates a 5% platform commission.
8. The seller can see sales.
9. The buyer can see purchases.

The project must remain simple, maintainable, and suitable for a school evaluation. Do not over-engineer.

## My role and evaluation goal

The user acts as a **Lead Developer**.

The final deliverable must demonstrate:

* software quality process;
* secure development lifecycle;
* CI/CD pipeline;
* automated tests;
* security analysis;
* basic observability;
* deployment/containerization;
* load testing readiness;
* a working business feature.

The priority is not to build a production marketplace, but to deliver a clean, understandable and demonstrable technical POC.

## Repository structure

The repository is a monorepo:

```txt
ProjectCollector/
├── backend/
├── frontend/
├── docker-compose.yml
├── .github/
│   └── workflows/
└── AGENTS.md
```

## Backend stack

The backend is located in `backend/`.

Use:

* Java 17;
* Spring Boot 3.x;
* Maven;
* PostgreSQL;
* Spring Security;
* JWT stateless authentication;
* JPA/Hibernate;
* Lombok;
* Bean Validation;
* Actuator;
* Docker.

Do not migrate to Java 21 unless explicitly requested. The current CI and Docker setup expect Java 17.

## Frontend stack

The frontend is located in `frontend/`.

Use:

* Angular;
* standalone components;
* SCSS;
* Angular Router;
* HttpClient;
* JWT interceptor;
* route guard;
* Node compatible with the current installed version.

Keep the frontend simple and clear. Avoid adding external UI libraries unless explicitly requested.

## Current backend features

The backend already includes:

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* JWT generation
* JWT validation through a security filter

### User

* `GET /api/users/me`

### Items

* `GET /api/items`
* `GET /api/items/{id}`
* `GET /api/items/me`
* `POST /api/items`
* `PUT /api/items/{id}`
* `DELETE /api/items/{id}`

Business rules:

* public catalogue;
* item creation requires authentication;
* only the seller can edit or delete their own item;
* only available items are listed in the catalogue;
* item status can be `AVAILABLE` or `SOLD`.

### Orders

* `POST /api/orders/items/{itemId}`
* `GET /api/orders/me`
* `GET /api/orders/sales`

Business rules:

* a user cannot buy their own item;
* a sold item cannot be purchased again;
* after purchase, the item becomes `SOLD`;
* platform fee = item price × 5%;
* seller amount = item price − platform fee;
* total amount = item price.

### Quality and security

The backend already includes:

* global exception handling;
* DTOs;
* validation;
* CORS for Angular;
* Actuator endpoints:

  * `/actuator/health`
  * `/actuator/info`
* unit tests for the order flow;
* integration tests or preparation for API flow tests;
* Dockerfile;
* docker-compose with PostgreSQL and backend.

## Current frontend features

The Angular frontend already includes or is being built with:

* authentication service;
* JWT interceptor;
* authentication guard;
* login page;
* register page;
* item list page;
* item detail page;
* purchase flow from item detail.

The current focus is to finish the frontend flow:

1. Fix and stabilize item list cards.
2. Add item creation page.
3. Add my items page.
4. Add edit/delete item actions.
5. Add my purchases page.
6. Add my sales page.
7. Add navigation/logout.
8. Add frontend build in CI.
9. Dockerize frontend if needed.

## Important implementation rules

Before editing code:

1. Inspect the existing files.
2. Identify the current structure.
3. Avoid replacing large parts blindly.
4. Make the smallest clean change that solves the issue.
5. Keep naming consistent with the existing code.
6. Keep code understandable for a student-level project.
7. Avoid unnecessary abstractions.
8. Do not introduce new dependencies without asking.
9. Do not change backend API contracts unless necessary.
10. If changing an API contract, update both backend and frontend.

## Coding style

Backend:

* Keep packages by feature:

  * `auth`
  * `user`
  * `item`
  * `order`
  * `config`
  * `common`
* Use DTOs for API input/output.
* Keep controllers thin.
* Put business logic in services.
* Use repositories only for persistence.
* Keep error messages understandable in French.

Frontend:

* Use standalone Angular components.
* Use `inject()` when consistent with current code.
* Use services for API calls.
* Use models in `core/models`.
* Use guards in `core/guards`.
* Use interceptors in `core/interceptors`.
* Use services in `core/services`.
* Keep HTML/SCSS simple and readable.
* Do not use complex state management libraries.

## Commands

From repository root:

### Backend

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
npm run build
```

### Docker

```bash
docker compose up --build
docker compose down
```

### Git

Work on branch:

```bash
dev
```

Use small commits with clear messages, for example:

```txt
Fix Angular item list display
Add Angular item creation page
Add Angular my purchases page
Add frontend CI build
```

## GitHub Actions

The backend CI should stay fast and include:

* compile;
* tests;
* package;
* Docker build.

OWASP Dependency-Check should stay in a separate workflow if configured, because it can be slow.

## Current known issue

The item list page at:

```txt
http://localhost:4200/items
```

may display cards without all expected item information even though the backend returns correct JSON.

The backend response from:

```bash
curl http://localhost:8080/api/items
```

contains valid fields:

* `id`
* `title`
* `description`
* `price`
* `imageUrl`
* `status`
* `sellerId`
* `sellerFirstname`
* `sellerLastname`
* `createdAt`
* `updatedAt`

So if the item list display is broken, investigate the Angular files first:

```txt
frontend/src/app/features/items/item-list/item-list.component.ts
frontend/src/app/features/items/item-list/item-list.component.html
frontend/src/app/features/items/item-list/item-list.component.scss
frontend/src/app/core/models/item.model.ts
frontend/src/app/core/services/item.service.ts
```

Likely causes to inspect:

* incorrect HTML structure;
* CSS hiding or overlapping content;
* wrong `*ngFor`;
* wrong class names;
* bad card layout;
* Angular cache;
* image loading affecting layout;
* missing `CommonModule`;
* mismatch between model and backend JSON.

Do not modify the backend for this issue unless the frontend investigation proves it is necessary.

## Testing expectations

After code changes, run the relevant checks.

For backend changes:

```bash
cd backend
mvn test
```

For frontend changes:

```bash
cd frontend
npm run build
```

If a change affects both frontend and backend, run both.

## Preferred working method

For each task:

1. Briefly explain what you found.
2. Propose a short plan.
3. Apply the change.
4. Run the relevant command if possible.
5. Summarize modified files.
6. Mention any remaining issue clearly.

Do not invent project files, inspect the repository first.
