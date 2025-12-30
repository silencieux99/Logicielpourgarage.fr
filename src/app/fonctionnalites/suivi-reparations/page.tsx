import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Suivi des Réparations Garage | GaragePro",
    description: "Suivez vos interventions en temps réel. Statuts, temps passé, pièces utilisées. Logiciel de gestion atelier automobile.",
    keywords: "suivi réparations garage, gestion atelier auto, logiciel mécanique, ordre de réparation",
}

export default function SuiviReparationsPage() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-zinc-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center">
                        <div className="relative h-10 w-32">
                            <Image
                                src="/GaragePROlogo.png"
                                alt="GaragePro"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </a>
                    <a href="/tarifs" className="h-9 px-4 bg-zinc-900 text-white text-[14px] font-medium rounded-lg">
                        Voir les tarifs
                    </a>
                </div>
            </nav>

            <main className="py-12 sm:py-20 px-4 sm:px-6">
                <article className="max-w-3xl mx-auto">
                    <header className="mb-12">
                        <p className="text-amber-600 text-[14px] font-medium mb-3">Fonctionnalité</p>
                        <h1 className="text-[32px] sm:text-[42px] font-bold text-zinc-900 leading-tight mb-4">
                            Suivi des réparations
                        </h1>
                        <p className="text-[18px] text-zinc-600 leading-relaxed">
                            Suivez chaque intervention de A à Z. Statuts en temps réel, temps passé et pièces utilisées.
                        </p>
                    </header>

                    <section className="prose prose-zinc max-w-none">
                        <h2>Vue d'ensemble de l'atelier</h2>
                        <p>
                            Visualisez en un coup d'œil toutes les réparations en cours, en attente et terminées. Priorisez les urgences et gérez la charge de travail de votre équipe.
                        </p>

                        <h2>Fonctionnalités</h2>
                        <ul>
                            <li><strong>Statuts clairs</strong> : en attente, en cours, terminé, facturé</li>
                            <li><strong>Priorités</strong> : normal, prioritaire, urgent</li>
                            <li><strong>Temps de travail</strong> : suivi du temps passé vs estimé</li>
                            <li><strong>Affectation mécanicien</strong> : assignez chaque tâche</li>
                            <li><strong>Liste des travaux</strong> : détail de chaque opération</li>
                            <li><strong>Pièces utilisées</strong> : liaison avec le stock</li>
                        </ul>

                        <h2>Suivi du temps</h2>
                        <p>
                            Comparez le temps estimé au temps réellement passé. Améliorez vos devis et identifiez les interventions qui prennent plus de temps que prévu.
                        </p>

                        <h2>Notifications client</h2>
                        <p>
                            Informez automatiquement vos clients de l'avancement de leur véhicule par SMS ou email.
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
