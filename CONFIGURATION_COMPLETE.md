# Configuration complétée ✅

## Changements effectués

### 1. Firebase Admin - Variables d'environnement
- ✅ Suppression du `require()` du fichier `firebase-admin-key.json` dans `src/lib/firebase-admin.ts`
- ✅ Configuration complète via variables d'environnement uniquement
- ✅ Ajout des credentials Firebase Admin dans `.env.local`

### 2. Sécurité
- ✅ `firebase-admin-key.json` ajouté au `.gitignore`
- ✅ Fichiers `.env`, `.env.local`, `.env*.local` ajoutés au `.gitignore`
- ✅ Seul `.env.example` reste dans le repo pour la documentation

### 3. Correction Next.js 16
- ✅ Correction de `src/app/api/invoices/[id]/route.ts` pour Next.js 16
- ✅ Les `params` sont maintenant une `Promise` et doivent être `await`

## Variables d'environnement configurées

Les variables suivantes ont été ajoutées dans `.env.local` :

```bash
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@logicielpourgarage.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Pour Vercel

Sur Vercel, vous devez configurer ces mêmes variables d'environnement :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez :
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

**Important** : Pour `FIREBASE_ADMIN_PRIVATE_KEY`, gardez les guillemets et les `\n` exactement comme dans `.env.local`

## Prochaines étapes

```bash
# 1. Commit et push
git add .
git commit -m "fix: configure Firebase Admin via env vars and fix Next.js 16 params"
git push

# 2. Configure les variables sur Vercel (voir VERCEL_SETUP.md)

# 3. Le build devrait maintenant réussir ! 🎉
```

## Fichiers modifiés

- ✅ `src/lib/firebase-admin.ts` - Utilise uniquement les env vars
- ✅ `src/app/api/invoices/[id]/route.ts` - Fix Next.js 16 params
- ✅ `.env.local` - Ajout des credentials Firebase Admin
- ✅ `.env.example` - Documentation mise à jour
- ✅ `.gitignore` - Protection des secrets
- ✅ `VERCEL_SETUP.md` - Guide de déploiement
- ✅ `scripts/extract-firebase-credentials.js` - Helper script
