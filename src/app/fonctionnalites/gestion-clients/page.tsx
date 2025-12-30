import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Gestion Clients pour Garage Automobile | GaragePro",
    description: "Centralisez toutes les informations de vos clients, leur historique de réparations et véhicules. Logiciel de gestion garage simple et efficace.",
    keywords: "gestion clients garage, logiciel garage automobile, fichier client garage, CRM garage",
}

export default function GestionClientsPage() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-zinc-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className="text-[16px] font-bold text-zinc-900">GaragePro</span>
                    </a>
                    <a href="/tarifs" className="h-9 px-4 bg-zinc-900 text-white text-[14px] font-medium rounded-lg">
                        Voir les tarifs
                    </a>
                </div>
            </nav>

            <main className="py-12 sm:py-20 px-4 sm:px-6">
                <article className="max-w-3xl mx-auto">
                    <header className="mb-12">
                        <p className="text-emerald-600 text-[14px] font-medium mb-3">Fonctionnalité</p>
                        <h1 className="text-[32px] sm:text-[42px] font-bold text-zinc-900 leading-tight mb-4">
                            Gestion des clients
                        </h1>
                        <p className="text-[18px] text-zinc-600 leading-relaxed">
                            Centralisez toutes les informations de vos clients et accédez à leur historique complet en un clic.
                        </p>
                    </header>

                    <section className="prose prose-zinc max-w-none">
                        <h2>Pourquoi une bonne gestion client ?</h2>
                        <p>
                            Un garage qui connaît ses clients est un garage qui fidélise. Avec GaragePro, vous gardez une trace de chaque interaction, chaque véhicule et chaque intervention.
                        </p>

                        <h2>Ce que vous pouvez faire</h2>
                        <ul>
                            <li><strong>Fiche client complète</strong> : coordonnées, véhicules, historique des interventions</li>
                            <li><strong>Recherche rapide</strong> : trouvez un client par nom, téléphone ou plaque d'immatriculation</li>
                            <li><strong>Historique détaillé</strong> : consultez toutes les réparations passées</li>
                            <li><strong>Notes personnalisées</strong> : ajoutez des remarques sur les préférences du client</li>
                            <li><strong>Statut VIP</strong> : identifiez vos meilleurs clients</li>
                        </ul>

                        <h2>Gain de temps au quotidien</h2>
                        <p>
                            Plus besoin de chercher dans des carnets ou fichiers Excel. Toutes les informations sont accessibles en quelques secondes depuis n'importe quel appareil.
                        </p>

                        <h2>Conformité RGPD</h2>
                        <p>
                            Vos données clients sont stockées en France et conformes au RGPD. Vous pouvez exporter ou supprimer les données sur demande.
                        </p>
                    </section>

                    <div className="mt-12 p-6 sm:p-8 bg-zinc-50 rounded-2xl">
                        <h3 className="text-[18px] font-bold text-zinc-900 mb-2">Essayez gratuitement</h3>
                        <p className="text-[15px] text-zinc-600 mb-4">
                            Démo gratuite avec 5 clients et 5 véhicules. Sans carte bancaire.
                        </p>
                        <a href="/inscription" className="inline-block h-11 px-6 bg-zinc-900 text-white text-[14px] font-semibold rounded-lg leading-[44px]">
                            Créer un compte
                        </a>
                    </div>
                </article>
            </main>
        </div>
    )
}
