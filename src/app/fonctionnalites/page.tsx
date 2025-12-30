import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Fonctionnalités Logiciel Garage Automobile | GaragePro",
    description: "Découvrez toutes les fonctionnalités de GaragePro : gestion clients, véhicules, réparations, factures, stock, agenda et plus.",
    keywords: "fonctionnalités logiciel garage, gestion garage automobile, logiciel mécanique auto",
}

const features = [
    {
        title: "Gestion des clients",
        description: "Centralisez les informations clients et leur historique",
        href: "/fonctionnalites/gestion-clients",
        color: "bg-emerald-500"
    },
    {
        title: "Gestion des véhicules",
        description: "Recherche par plaque ou VIN, historique complet",
        href: "/fonctionnalites/gestion-vehicules",
        color: "bg-blue-500"
    },
    {
        title: "Suivi des réparations",
        description: "Suivez chaque intervention en temps réel",
        href: "/fonctionnalites/suivi-reparations",
        color: "bg-amber-500"
    },
    {
        title: "Devis et factures",
        description: "Documents professionnels conformes aux normes",
        href: "/fonctionnalites/devis-factures",
        color: "bg-violet-500"
    },
    {
        title: "Agenda et planning",
        description: "Planifiez les RDV et envoyez des rappels SMS",
        href: "/fonctionnalites/agenda-planning",
        color: "bg-cyan-500"
    },
    {
        title: "Gestion de stock",
        description: "Inventaire pièces détachées et alertes",
        href: "/fonctionnalites/gestion-stock",
        color: "bg-orange-500"
    },
]

export default function FonctionnalitesPage() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-zinc-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-24 sm:h-28 md:h-32 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/GaragePROlogo.png"
                            alt="GaragePro"
                            className="h-20 sm:h-24 md:h-28 w-auto"
                        />
                    </Link>
                    <Link href="/tarifs" className="h-9 px-4 bg-zinc-900 text-white text-[14px] font-medium rounded-lg flex items-center">
                        Voir les tarifs
                    </Link>
                </div>
            </nav>

            <main className="py-12 sm:py-20 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <header className="text-center mb-12 sm:mb-16">
                        <h1 className="text-[32px] sm:text-[42px] font-bold text-zinc-900 mb-4">
                            Fonctionnalités
                        </h1>
                        <p className="text-[16px] sm:text-[18px] text-zinc-600 max-w-2xl mx-auto">
                            Tout ce dont vous avez besoin pour gérer votre garage efficacement.
                        </p>
                    </header>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <Link
                                key={feature.title}
                                href={feature.href}
                                className="group p-6 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-colors"
                            >
                                <div className={`w-3 h-3 rounded-full ${feature.color} mb-4`}></div>
                                <h2 className="text-[17px] font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700">
                                    {feature.title}
                                </h2>
                                <p className="text-[14px] text-zinc-600">
                                    {feature.description}
                                </p>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-[16px] text-zinc-600 mb-6">
                            Prêt à essayer GaragePro ?
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link href="/inscription" className="w-full sm:w-auto h-12 px-8 bg-zinc-900 text-white text-[15px] font-semibold rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors">
                                Créer un compte gratuit
                            </Link>
                            <Link href="/tarifs" className="w-full sm:w-auto h-12 px-8 bg-zinc-100 text-zinc-900 text-[15px] font-semibold rounded-xl flex items-center justify-center hover:bg-zinc-200 transition-colors">
                                Voir les tarifs
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
