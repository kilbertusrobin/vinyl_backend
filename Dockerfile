# Utilise une image officielle Node.js comme image de base
FROM node:20-alpine as builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (yarn ou npm install --only=production après build)
RUN npm install

# Copier le reste du code source
COPY . .

# Copier le .env si besoin (en prod, il est souvent injecté à part, mais on le prévoit)
COPY .env .env

# Build l'application
RUN npm run build

# Étape de production : n'embarquer que le nécessaire
FROM node:20-alpine as production
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env

# Exposer le port (par défaut 3000)
EXPOSE 3000

# Commande de lancement
CMD ["node", "dist/main.js"] 