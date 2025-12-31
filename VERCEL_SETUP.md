# Configuration Vercel - GaragePro

## Variables d'environnement requises

Pour déployer l'application sur Vercel, vous devez configurer les variables d'environnement suivantes dans les paramètres de votre projet Vercel :

### Firebase Admin SDK

Ces variables sont nécessaires pour l'authentification Firebase Admin côté serveur.

1. **FIREBASE_ADMIN_PRIVATE_KEY**
   - Valeur : La clé privée de votre service account Firebase
   - Comment l'obtenir : 
     1. Allez dans Firebase Console > Project Settings > Service Accounts
     2. Cliquez sur "Generate new private key"
     3. Ouvrez le fichier JSON téléchargé
     4. Copiez la valeur du champ `private_key` (incluant les `-----BEGIN PRIVATE KEY-----` et `-----END PRIVATE KEY-----`)
   - **Important** : Remplacez les retours à la ligne `\n` par `\\n` dans Vercel

2. **FIREBASE_ADMIN_CLIENT_EMAIL**
   - Valeur : L'email du service account
   - Format : `firebase-adminsdk-xxxxx@votre-projet.iam.gserviceaccount.com`
   - Se trouve dans le même fichier JSON que ci-dessus, champ `client_email`

3. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
   - Valeur : L'ID de votre projet Firebase
   - Se trouve dans Firebase Console > Project Settings
   - Exemple : `logicielpourgarage`

### Firebase Client SDK

Ces variables sont nécessaires pour l'authentification Firebase côté client.

4. **NEXT_PUBLIC_FIREBASE_API_KEY**
5. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
6. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
7. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
8. **NEXT_PUBLIC_FIREBASE_APP_ID**

Toutes ces valeurs se trouvent dans Firebase Console > Project Settings > General > Your apps > SDK setup and configuration

### Stripe

9. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Clé publique Stripe (commence par `pk_`)
   
10. **STRIPE_SECRET_KEY**
    - Clé secrète Stripe (commence par `sk_`)

### Email (Nodemailer)

11. **EMAIL_HOST** (ex: smtp.gmail.com)
12. **EMAIL_PORT** (ex: 587)
13. **EMAIL_USER** (votre email)
14. **EMAIL_PASSWORD** (mot de passe d'application)
15. **EMAIL_FROM** (email expéditeur)

## Comment ajouter les variables sur Vercel

1. Allez sur votre projet Vercel
2. Cliquez sur "Settings"
3. Allez dans "Environment Variables"
4. Ajoutez chaque variable une par une
5. Sélectionnez les environnements (Production, Preview, Development)
6. Cliquez sur "Save"
7. Redéployez votre application

## Vérification

Après avoir configuré toutes les variables, redéployez votre application. Si tout est correct, le build devrait réussir.

## Développement local

Pour le développement local, copiez `.env.example` vers `.env.local` et remplissez les valeurs.

Pour Firebase Admin en local, vous pouvez soit :
- Utiliser les variables d'environnement (recommandé)
- OU placer le fichier `firebase-admin-key.json` à la racine du projet (ne JAMAIS le commiter)
