import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Gestion Stock Pièces Détachées Garage | GaragePro",
    description: "Gérez votre inventaire de pièces détachées. Alertes stock bas, mouvements, fournisseurs. Logiciel gestion stock garage.",
    keywords: "gestion stock garage, inventaire pièces auto, stock pièces détachées, logiciel stock mécanique",
}

export default function GestionStockPage() {
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
                        <p className="text-orange-600 text-[14px] font-medium mb-3">Fonctionnalité</p>
                        <h1 className="text-[32px] sm:text-[42px] font-bold text-zinc-900 leading-tight mb-4">
                            Gestion de stock
                        </h1>
                        <p className="text-[18px] text-zinc-600 leading-relaxed">
                            Gérez votre inventaire de pièces détachées. Alertes automatiques et suivi des mouvements.
                        </p>
                    </header>

                    <section className="prose prose-zinc max-w-none">
                        <h2>Inventaire complet</h2>
                        <p>
                            Référencez toutes vos pièces détachées avec leurs caractéristiques : référence fournisseur, prix d'achat, prix de vente, emplacement.
                        </p>

                        <h2>Fonctionnalités</h2>
                        <ul>
                            <li><strong>Fiches articles</strong> : référence, marque, catégorie, prix</li>
                            <li><strong>Seuils d'alerte</strong> : notification quand le stock est bas</li>
                            <li><strong>Mouvements</strong> : entrées, sorties, historique</li>
                            <li><strong>Catégories</strong> : organisez par type de pièce</li>
                            <li><strong>Valeur du stock</strong> : visualisez la valeur totale</li>
                            <li><strong>Liaison réparations</strong> : déstockage automatique</li>
                        </ul>

                        <h2>Alertes stock bas</h2>
                        <p>
                            Définissez un seuil minimum pour chaque pièce. Recevez une alerte quand il est temps de recommander.
                        </p>

                        <h2>Déstockage automatique</h2>
                        <p>
                            Quand vous utilisez une pièce dans une réparation, le stock est automatiquement mis à jour.
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
