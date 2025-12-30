import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Devis et Factures Garage Automobile | GaragePro",
    description: "Créez des devis et factures professionnels en quelques clics. Conformes aux normes. Logiciel facturation garage.",
    keywords: "devis garage, facture garage automobile, logiciel facturation mécanique, facture auto",
}

export default function DevisFacturesPage() {
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
                        <p className="text-violet-600 text-[14px] font-medium mb-3">Fonctionnalité</p>
                        <h1 className="text-[32px] sm:text-[42px] font-bold text-zinc-900 leading-tight mb-4">
                            Devis et factures
                        </h1>
                        <p className="text-[18px] text-zinc-600 leading-relaxed">
                            Créez des documents professionnels et conformes en quelques clics. Envoyez-les par email instantanément.
                        </p>
                    </header>

                    <section className="prose prose-zinc max-w-none">
                        <h2>Création rapide</h2>
                        <p>
                            Sélectionnez le client, ajoutez les prestations et pièces, GaragePro génère automatiquement un document professionnel avec votre logo et vos coordonnées.
                        </p>

                        <h2>Fonctionnalités</h2>
                        <ul>
                            <li><strong>Devis</strong> : proposez des estimations claires à vos clients</li>
                            <li><strong>Factures</strong> : conformes aux obligations légales françaises</li>
                            <li><strong>Conversion</strong> : transformez un devis en facture en un clic</li>
                            <li><strong>TVA automatique</strong> : calcul selon votre régime fiscal</li>
                            <li><strong>Envoi par email</strong> : directement depuis l'application</li>
                            <li><strong>Export PDF</strong> : téléchargez et imprimez</li>
                        </ul>

                        <h2>Conformité légale</h2>
                        <p>
                            Tous les documents respectent les obligations légales françaises : mentions obligatoires, numérotation séquentielle, TVA.
                        </p>

                        <h2>Suivi des paiements</h2>
                        <p>
                            Suivez le statut de chaque facture : payée, en attente, en retard. Relancez automatiquement les impayés.
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
