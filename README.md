# Question-Answers

Site de questionnaires :

- **Public** (sans connexion) : l'utilisateur renseigne nom/prénom, répond aux questionnaires actifs (radio, checkbox, select) et peut laisser un commentaire libre, puis envoie tout en une fois.
- **Admin** (`/admin`, sans authentification pour l'instant) : création des questionnaires et de leurs questions (libellé + type de réponse), et consultation de la liste des utilisateurs avec leurs réponses.

## Backend

API Node.js (Express + TypeScript) utilisant Supabase comme base de données côté serveur (via la clé `service_role`).

### Setup

```bash
cd backend
npm install
cp .env.example .env   # puis renseigner SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
npm run dev             # démarre le serveur en mode dev (http://localhost:4000)
```

### Scripts

- `npm run dev` — démarre le serveur avec rechargement à chaud
- `npm run build` — compile TypeScript vers `dist/`
- `npm start` — lance le build compilé

### Endpoints

Public :

- `GET /api/public/questionnaires` — questionnaires actifs avec leurs questions
- `POST /api/public/submissions` — envoi d'une réponse (`{ nom, prenom, open_answer?, answers: [{ question_id, value }] }`)

Admin :

- `GET /api/admin/questionnaires` — tous les questionnaires avec leurs questions
- `GET /api/admin/questionnaires/:id` — détail d'un questionnaire
- `POST /api/admin/questionnaires` — création (`{ title, description? }`)
- `PUT /api/admin/questionnaires/:id` — mise à jour (`{ title?, description?, is_active? }`)
- `DELETE /api/admin/questionnaires/:id` — suppression
- `POST /api/admin/questionnaires/:id/questions` — ajout d'une question (`{ libelle, type: "radio"|"checkbox"|"select", options: string[] }`)
- `PUT /api/admin/questionnaires/:id/questions/:questionId` — mise à jour d'une question
- `DELETE /api/admin/questionnaires/:id/questions/:questionId` — suppression d'une question
- `GET /api/admin/submissions` — liste des utilisateurs avec leurs réponses

> ⚠️ Les routes `/api/admin/*` ne sont pas protégées pour l'instant (pas d'authentification). À ajouter avant une mise en production publique.

### Supabase

Le schéma SQL complet est dans [`backend/sql/schema.sql`](backend/sql/schema.sql) — à exécuter dans l'éditeur SQL de Supabase. Il crée les tables :

- `questionnaires` — un questionnaire (titre, description, actif ou non)
- `questions` — les questions d'un questionnaire (libellé, type `radio`/`checkbox`/`select`, options)
- `submissions` — une soumission d'un visiteur (nom, prénom, commentaire libre)
- `answers` — les réponses d'une soumission, une par question répondue

Le backend utilise la clé `service_role` (jamais exposée au frontend) pour accéder directement à la base sans passer par Row Level Security.

## Frontend

Application React (Vite + TypeScript + React Router). Elle ne parle jamais directement à Supabase : toutes les données passent par l'API du backend.

### Setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL pointe vers le backend (http://localhost:4000 par défaut)
npm run dev             # démarre le serveur en mode dev (http://localhost:5173)
```

### Scripts

- `npm run dev` — démarre le serveur de dev
- `npm run build` — build de production dans `dist/`
- `npm run preview` — sert le build de production localement

### Pages

- `/` — page publique : formulaire nom/prénom + tous les questionnaires actifs + commentaire libre + bouton Envoyer
- `/admin` — liste des questionnaires + création d'un nouveau questionnaire
- `/admin/questionnaires/:id` — gestion des questions d'un questionnaire (ajout/suppression, activer/désactiver)
- `/admin/questionnaires/:id/results` — résultats agrégés (un graphique en barres par question, façon Google/Microsoft Forms) + export PDF
- `/admin/submissions` — liste des utilisateurs ayant répondu, avec le détail de leurs réponses

### Structure

- `src/api/` — clients fetch typés vers l'API backend (`public.ts`, `admin.ts`)
- `src/types/domain.ts` — types partagés (Questionnaire, Question, Submission, Answer...)
- `src/components/QuestionField.tsx` — rendu d'une question selon son type (radio/checkbox/select)
- `src/components/BarResultsChart.tsx` — graphique en barres (comptage + %) pour une question
- `src/pages/` — pages publique et admin
- `src/pages/admin/AdminQuestionnaireResultsPage.tsx` — agrège les réponses par question et exporte la vue en PDF (`html2canvas` + `jspdf`, généré côté client, aucun appel backend supplémentaire)

## Lancer le projet complet

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Le frontend (port 5173) appelle le backend (port 4000), qui lui-même parle à Supabase.

## Déploiement sur Vercel

Le repo contient deux apps (`backend/`, `frontend/`) → **deux projets Vercel séparés**, pointant chacun sur le même repo GitHub avec un "Root Directory" différent.

Le backend Express ne tourne pas comme un serveur classique sur Vercel (plateforme serverless) : `backend/src/app.ts` exporte l'app Express sans `listen()`, et `backend/api/index.ts` + `backend/vercel.json` l'exposent comme une fonction serverless qui reçoit toutes les requêtes (`/api/...`, `/health`). `backend/src/index.ts` (avec `app.listen`) reste utilisé uniquement en local (`npm run dev` / `npm start`).

### 0. Pousser le code sur GitHub

```bash
git add -A
git commit -m "..."
git push
```

### 1. Déployer le backend

Sur [vercel.com](https://vercel.com) → **Add New → Project** → importer le repo :

- **Root Directory** : `backend`
- **Framework Preset** : Other
- **Environment Variables** :
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

Déployer → noter l'URL générée (ex. `https://question-answers-backend.vercel.app`).

> Le CORS est ouvert à toutes les origines (`origin: "*"` dans `src/app.ts`) — pas de variable d'environnement à gérer pour ça. C'est volontairement permissif tant qu'il n'y a pas d'authentification/cookies à protéger ; à resserrer si l'API devient sensible.

### 2. Déployer le frontend

Nouveau projet Vercel, même repo :

- **Root Directory** : `frontend`
- **Framework Preset** : Vite (détecté automatiquement, build `npm run build`, output `dist`)
- **Environment Variables** :
  - `VITE_API_URL` = l'URL du backend obtenue à l'étape 1

Déployer → noter l'URL du frontend (ex. `https://question-answers.vercel.app`).

### 3. Vérifier

- `https://<backend>.vercel.app/health` doit répondre `{"status":"ok"}`
- Le frontend déployé doit afficher les questionnaires actifs et permettre l'envoi de réponses
- `/admin` sur le frontend déployé doit lister/créer des questionnaires

> ⚠️ Rappel : `/admin` n'a toujours pas d'authentification — une fois en ligne publiquement, n'importe qui connaissant l'URL peut créer des questionnaires ou voir les réponses. À sécuriser avant un vrai lancement public.

### CLI Vercel (alternative au dashboard)

```bash
npm i -g vercel

cd backend && vercel        # puis vercel --prod, en configurant les env vars (vercel env add)
cd ../frontend && vercel    # idem
```
