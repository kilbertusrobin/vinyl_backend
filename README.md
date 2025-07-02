<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Vinyl Backend 🎵

![Vinyl Logo](https://ltwhfwsovkxhbfjzdfet.supabase.co/storage/v1/object/public/images//DoVinyl.png)

Backend Node.js avec NestJS + PostgreSQL pour l'application Vinyl.

## 📦 Prérequis

- Node.js v18+
- Docker & Docker Compose
- PostgreSQL
- Stripe (facultatif pour le paiement)
- Mailjet (facultatif pour l’envoi d’e-mails)

---

## ⚙️ Variables d'environnement

Voici les variables d'environnement à définir dans un fichier `.env` à la racine du projet :

```env
# --- Base de données (choisir une des deux options) ---

# Option 1 : DB via Docker
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=vinyl

# Option 2 : DB locale
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=
# DB_DATABASE=dovinyl

# --- Docker ---
IS_DOCKER=true

# --- JWT ---
JWT_SECRET=dev_secret_key

# --- Mail (Mailjet) ---
MJ_APIKEY_PUBLIC=
MJ_APIKEY_PRIVATE=
MJ_SENDER_EMAIL=

# --- URL Frontend ---
FRONTEND_URL=http://localhost:3700

# --- Stripe ---
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

---

## 🚀 Démarrage

### Avec Docker

```bash
docker-compose up --build
```

### En local

```bash
npm install
npm run start:dev
```

Assure-toi que PostgreSQL tourne localement et que les variables `.env` sont bien configurées.

---

## 🧪 Tests

```bash
npm run test
```

---

## 📬 Fonctionnalités

- Authentification via JWT
- Recommandations personnalisées
- Intégration Stripe (paiement)
- Envoi d'e-mails (Mailjet)
- Gestion d'utilisateurs et de profils

