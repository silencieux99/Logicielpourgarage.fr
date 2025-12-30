import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Agenda et Planning Garage Automobile | GaragePro",
    description: "Planifiez vos rendez-vous et gérez votre planning atelier. Rappels SMS automatiques. Logiciel planning garage.",
    keywords: "agenda garage, planning atelier auto, prise rendez-vous garage, logiciel planning mécanique",
}

export default function AgendaPlanningPage() {
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
                        <p className="text-cyan-600 text-[14px] font-medium mb-3">Fonctionnalité</p>
                        <h1 className="text-[32px] sm:text-[42px] font-bold text-zinc-900 leading-tight mb-4">
                            Agenda et planning
                        </h1>
                        <p className="text-[18px] text-zinc-600 leading-relaxed">
                            Gérez vos rendez-vous et la charge de travail de votre atelier. Rappels automatiques par SMS.
                        </p>
                    </header>

                    <section className="prose prose-zinc max-w-none">
                        <h2>Vue calendrier</h2>
                        <p>
                            Visualisez votre planning par jour, semaine ou mois. Identifiez rapidement les créneaux disponibles et les périodes chargées.
                        </p>

                        <h2>Fonctionnalités</h2>
                        <ul>
                            <li><strong>Prise de RDV</strong> : créez des rendez-vous en quelques clics</li>
                            <li><strong>Vue jour/semaine/mois</strong> : adaptez l'affichage à vos besoins</li>
                            <li><strong>Rappels SMS</strong> : envoi automatique la veille du RDV</li>
                            <li><strong>Confirmation</strong> : le client confirme par SMS</li>
                            <li><strong>Durée estimée</strong> : bloquez le temps nécessaire</li>
                            <li><strong>Catégories</strong> : distinguez les types d'interventions</li>
                        </ul>

                        <h2>Réduction des no-shows</h2>
                        <p>
                            Les rappels SMS automatiques réduisent significativement les rendez-vous manqués. Vos clients n'oublient plus leur RDV.
                        </p>

                        <h2>Optimisation du planning</h2>
                        <p>
                            Évitez les trous dans votre planning et maximisez l'utilisation de votre atelier.
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
