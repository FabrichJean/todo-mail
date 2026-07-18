# Todo Mail

Outil d'envoi d'emails automatique via Gmail, multi-utilisateur, avec choix de template. Connexion à la plateforme via Google. Connexion des comptes Gmail d'envoi en mode automatique (OAuth Google) ou manuel (mot de passe d'application SMTP).

## Mise en place

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Copier `.env.example` vers `.env` si ce n'est pas déjà fait, puis générer une clé de chiffrement :

   ```bash
   openssl rand -base64 32
   ```

   Colle le résultat dans `ENCRYPTION_KEY`. Cette clé chiffre les identifiants Gmail stockés en base (refresh token OAuth, mot de passe d'application) — ne la commit jamais et ne la change pas une fois des comptes connectés (les secrets déjà chiffrés deviendraient illisibles).

3. Appliquer les migrations Prisma (crée `dev.db`) :

   ```bash
   npx prisma migrate dev
   ```

4. **Connexion à la plateforme (obligatoire)** : crée un projet sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials), configure l'écran de consentement OAuth (externe), crée un identifiant OAuth "Application Web" avec **deux** URI de redirection autorisées :
   - `http://localhost:3000/api/auth/callback` (connexion à la plateforme)
   - `http://localhost:3000/api/gmail/oauth/callback` (connexion automatique d'un compte Gmail d'envoi, étape 6)

   Colle le Client ID / Client Secret dans `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). La première personne à se connecter récupère automatiquement les données déjà présentes en base (comptes Gmail, templates, historique).

5. Lancer le serveur de développement et se connecter :

   ```bash
   npm run dev
   ```

   Ouvrir [http://localhost:3000](http://localhost:3000) → redirection vers `/login` → "Se connecter avec Google".

6. **Connecter un compte Gmail d'envoi** (depuis `/connect`, une fois connecté à la plateforme) :
   - **Manuelle (rapide)** : active la validation en 2 étapes sur le compte Google à connecter, génère un [mot de passe d'application](https://myaccount.google.com/apppasswords), colle-le dans le formulaire.
   - **Automatique (OAuth)** : ajoute ton email comme testeur dans l'écran de consentement OAuth Google Cloud (mode test), puis clique "Se connecter avec Google" sur `/connect`.

## Fonctionnement

- **`/login`** — connexion à la plateforme via Google (inscription libre : un compte est créé automatiquement à la première connexion).
- **`/connect`** — connecter/déconnecter des comptes Gmail d'envoi (OAuth ou mot de passe d'application), propres à chaque utilisateur.
- **`/templates`** — créer des templates d'email avec variables `{{prenom}}`, `{{entreprise}}`, etc. (détectées automatiquement).
- **`/send`** — envoyer à un destinataire unique, en masse via import CSV, ou via une liste d'adresses collées.
- **`/history`** — historique des envois (succès/échec) avec filtre par statut.

Chaque utilisateur ne voit que ses propres comptes Gmail, templates et historique.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + SQLite (via l'adaptateur `@prisma/adapter-better-sqlite3`), `googleapis` pour l'OAuth Google, `nodemailer` pour l'envoi (SMTP et OAuth2), `papaparse` pour le parsing CSV, `@tiptap/react` pour l'éditeur de template.

Les secrets (refresh token OAuth, mot de passe d'application) sont chiffrés en AES-256-GCM avant stockage (`lib/crypto.ts`). L'authentification à la plateforme repose sur des sessions maison (cookie httpOnly + token haché en base, `lib/auth/session.ts`), distinctes de la connexion des comptes Gmail d'envoi.
