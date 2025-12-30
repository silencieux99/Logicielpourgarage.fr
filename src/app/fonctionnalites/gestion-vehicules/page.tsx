import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Gestion Véhicules et Parc Auto | GaragePro",
    description: "Gérez votre parc automobile avec recherche par plaque ou VIN. Historique complet de chaque véhicule. Logiciel garage professionnel.",
    keywords: "gestion véhicules garage, recherche plaque immatriculation, parc automobile, logiciel garage",
}

export default function GestionVehiculesPage() {
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
                        <p className="text-blue-600 text-[14px] font-medium mb-3">Fonctionnalité</p>
                        <h1 className="text-[32px] sm:text-[42px] font-bold text-zinc-900 leading-tight mb-4">
                            Gestion des véhicules
                        </h1>
                        <p className="text-[18px] text-zinc-600 leading-relaxed">
                            Recherchez par plaque ou VIN, récupérez automatiquement les informations et gardez un historique complet.
                        </p>
                    </header>

                    <section className="prose prose-zinc max-w-none">
                        <h2>Recherche intelligente</h2>
                        <p>
                            Entrez simplement la plaque d'immatriculation ou le numéro VIN du véhicule. GaragePro récupère automatiquement les informations : marque, modèle, année, motorisation.
                        </p>

                        <h2>Fonctionnalités principales</h2>
                        <ul>
                            <li><strong>Recherche par plaque</strong> : format français (AB-123-CD) reconnu automatiquement</li>
                            <li><strong>Recherche par VIN</strong> : identifiez n'importe quel véhicule</li>
                            <li><strong>Fiche véhicule</strong> : toutes les caractéristiques techniques</li>
                            <li><strong>Historique complet</strong> : toutes les interventions passées</li>
                            <li><strong>Liaison client</strong> : chaque véhicule est lié à son propriétaire</li>
                        </ul>

                        <h2>Historique des interventions</h2>
                        <p>
                            Consultez l'intégralité des réparations effectuées sur chaque véhicule. Idéal pour anticiper les besoins d'entretien et conseiller vos clients.
                        </p>

                        <h2>Multi-véhicules par client</h2>
                        <p>
                            Un client peut avoir plusieurs véhicules. GaragePro gère naturellement les flottes et les familles avec plusieurs voitures.
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
