/**
 * Script pour extraire les credentials Firebase Admin et les formater pour Vercel
 * Usage: node scripts/extract-firebase-credentials.js
 */

const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '..', 'firebase-admin-key.json');

if (!fs.existsSync(keyPath)) {
    console.error('❌ Fichier firebase-admin-key.json non trouvé à la racine du projet');
    console.error('   Téléchargez-le depuis Firebase Console > Project Settings > Service Accounts');
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    console.log('\n📋 Variables d\'environnement pour Vercel:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('FIREBASE_ADMIN_CLIENT_EMAIL');
    console.log(serviceAccount.client_email);
    console.log('');

    console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    console.log(serviceAccount.project_id);
    console.log('');

    console.log('FIREBASE_ADMIN_PRIVATE_KEY');
    console.log('⚠️  IMPORTANT: Copiez la valeur ci-dessous EXACTEMENT (avec les \\n)');
    console.log(serviceAccount.private_key);
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Copiez ces valeurs dans Vercel > Settings > Environment Variables');
    console.log('');

} catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier:', error.message);
    process.exit(1);
}
