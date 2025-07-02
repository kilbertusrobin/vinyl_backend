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

## 📬 Fonctionnalités

- Authentification via JWT
- Recommandations personnalisées
- Intégration Stripe (paiement)
- Envoi d'e-mails (Mailjet)
- Gestion d'utilisateurs et de profils

