import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    DocumentData
} from 'firebase/firestore'
import { db } from './firebase'

// ⚠️ IMPORTANT SECURITY WARNING ⚠️
// This file accesses Firestore directly from the Client Side.
// It is CRITICAL to have robust Firestore Security Rules (firestore.rules) enabled.
// Without rules, anyone can read/write your database.
//
// TODO: Ensure firestore.rules are deployed and restrict access based on request.auth


// ============================================
// TYPES
// ============================================

export interface Garage {
    id?: string
    userId: string
    nom: string
    statutJuridique?: string
    siret?: string
    numeroTVA?: string
    tvaIntracommunautaire?: string
    adresse: string
    codePostal: string
    ville: string
    telephone?: string
    email?: string
    siteWeb?: string
    effectif?: string
    logo?: string
    // Owner info
    ownerPrenom?: string
    ownerNom?: string
    ownerTelephone?: string
    ownerAvatar?: string
    // Subscription fields
    plan: 'demo' | 'pro'
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
    subscriptionCurrentPeriodEnd?: Timestamp
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface GarageConfig {
    id?: string
    garageId: string
    // Documents
    formatPapier: string
    modeleEntete: string
    couleurPrincipale: string
    prefixeDevis: string
    prefixeFacture: string
    prochainNumeroDevis: number
    prochainNumeroFacture: number
    mentionsDevis: string
    mentionsFacture: string
    mentionsLegales?: string
    // Fiscalité
    pays: string
    devise: string
    regimeTVA: string
    tauxTVA: number
    mentionExoneration?: string
    // Tarifs
    tauxHoraireMO: number
    tarifDiagnostic: number
    margeMinPieces: number
    arrondiPrix: string
    // Préférences
    formatDate: string
    formatHeure: string
    premierJourSemaine: string
    fuseauHoraire: string
    emailNotifications: boolean
    smsRappels: boolean
}

export interface Client {
    id?: string
    garageId: string
    type?: 'particulier' | 'societe'
    civilite: string
    prenom: string
    nom: string
    raisonSociale?: string
    email?: string
    telephone?: string
    adresse?: string
    codePostal?: string
    ville?: string
    pays?: string
    notes?: string
    isVIP: boolean
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface Vehicule {
    id?: string
    garageId: string
    clientId: string
    plaque: string
    vin?: string
    marque: string
    modele: string
    version?: string
    annee: number
    couleur?: string
    carburant: string
    kilometrage: number
    dateDerniereVisite?: Timestamp
    notes?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface Reparation {
    id?: string
    garageId: string
    clientId: string
    vehiculeId: string
    numero: string
    statut: 'en_attente' | 'en_cours' | 'termine' | 'facture'
    priorite: 'normal' | 'prioritaire' | 'urgent'
    description: string
    dateEntree: Timestamp
    dateSortiePrevue?: Timestamp
    dateSortieEffective?: Timestamp
    mecanicienId?: string
    tempsEstime: number // en minutes
    tempsPasse: number // en minutes
    montantHT: number
    montantTTC: number
    notes?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface LigneReparation {
    id?: string
    reparationId: string
    type: 'main_oeuvre' | 'piece' | 'forfait'
    designation: string
    quantite: number
    prixUnitaireHT: number
    tauxTVA: number
    montantHT: number
}

export interface Document {
    id?: string
    garageId: string
    clientId: string
    vehiculeId?: string
    reparationId?: string
    type: 'devis' | 'facture'
    numero: string
    statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'paye' | 'en_retard'
    dateEmission: Timestamp
    dateEcheance?: Timestamp
    datePaiement?: Timestamp
    montantHT: number
    montantTVA: number
    montantTTC: number
    notes?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface Article {
    id?: string
    garageId: string
    reference: string
    designation: string
    categorie: string
    marque?: string
    prixAchatHT: number
    prixVenteHT: number
    tauxTVA: number
    quantiteStock: number
    seuilAlerte: number
    emplacement?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface Personnel {
    id?: string
    garageId: string
    prenom: string
    nom: string
    email?: string
    telephone?: string
    role: 'mecanicien' | 'receptionniste' | 'manager' | 'apprenti' | 'carrossier' | 'electricien'
    specialites: string[]
    tauxHoraire: number
    couleur: string // Pour l'agenda/planning
    actif: boolean
    photo?: string
    dateEmbauche?: Timestamp
    notes?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface PointageHeure {
    id?: string
    garageId: string
    personnelId: string
    reparationId?: string
    date: Timestamp
    heureDebut: Timestamp
    heureFin?: Timestamp
    dureeMinutes: number
    description?: string
    type: 'reparation' | 'formation' | 'administratif' | 'pause' | 'autre'
    createdAt: Timestamp
}

export interface RendezVous {
    id?: string
    garageId: string
    clientId: string
    vehiculeId?: string
    personnelId?: string
    dateHeure: Timestamp
    dureeMinutes: number
    type: string
    description?: string
    statut: 'planifie' | 'confirme' | 'en_cours' | 'termine' | 'annule'
    rappelEnvoye: boolean
    notes?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

// ============================================
// GARAGE
// ============================================

export const createGarage = async (data: Omit<Garage, 'id' | 'createdAt' | 'updatedAt' | 'plan'> & { plan?: 'demo' | 'pro' }) => {
    // Filtrer les valeurs undefined car Firebase ne les accepte pas
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    const docRef = await addDoc(collection(db, 'garages'), {
        ...cleanData,
        plan: data.plan || 'demo', // Par défaut, tous les nouveaux garages sont en démo
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getGarageByUserId = async (userId: string): Promise<Garage | null> => {
    const q = query(collection(db, 'garages'), where('userId', '==', userId), limit(1))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const docData = snapshot.docs[0]
    return { id: docData.id, ...docData.data() } as Garage
}

export const getGarageById = async (garageId: string): Promise<Garage | null> => {
    const docSnap = await getDoc(doc(db, 'garages', garageId))
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Garage
}

export const updateGarage = async (garageId: string, data: Partial<Garage>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'garages', garageId), {
        ...cleanData,
        updatedAt: Timestamp.now()
    })
}

// ============================================
// GARAGE CONFIG
// ============================================

export const createGarageConfig = async (data: Partial<GarageConfig> & { garageId: string }) => {
    const defaultConfig: Omit<GarageConfig, 'id' | 'garageId'> = {
        formatPapier: 'A4',
        modeleEntete: 'standard',
        couleurPrincipale: '#18181b',
        prefixeDevis: 'D',
        prefixeFacture: 'F',
        prochainNumeroDevis: 1,
        prochainNumeroFacture: 1,
        mentionsDevis: 'Devis valable 30 jours',
        mentionsFacture: 'Payable à réception',
        pays: 'France',
        devise: 'EUR',
        regimeTVA: 'normal',
        tauxTVA: 20,
        tauxHoraireMO: 55,
        tarifDiagnostic: 35,
        margeMinPieces: 20,
        arrondiPrix: '0.01',
        formatDate: 'DD/MM/YYYY',
        formatHeure: 'HH:mm',
        premierJourSemaine: 'lundi',
        fuseauHoraire: 'Europe/Paris',
        emailNotifications: true,
        smsRappels: false,
    }

    const docRef = await addDoc(collection(db, 'garageConfigs'), {
        ...defaultConfig,
        ...data, // Les données passées écrasent les défauts
    })
    return docRef.id
}

export const getGarageConfig = async (garageId: string): Promise<GarageConfig | null> => {
    const q = query(collection(db, 'garageConfigs'), where('garageId', '==', garageId), limit(1))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as GarageConfig
}

export const updateGarageConfig = async (configId: string, data: Partial<GarageConfig>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'garageConfigs', configId), cleanData)
}

// ============================================
// CLIENTS
// ============================================

export const createClient = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Filtrer les valeurs undefined car Firebase ne les accepte pas
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    const docRef = await addDoc(collection(db, 'clients'), {
        ...cleanData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getClients = async (garageId: string): Promise<Client[]> => {
    const q = query(
        collection(db, 'clients'),
        where('garageId', '==', garageId),
        orderBy('nom', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client))
}

export const getClient = async (clientId: string): Promise<Client | null> => {
    const docSnap = await getDoc(doc(db, 'clients', clientId))
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Client
}

export const getClientsVIP = async (garageId: string): Promise<Client[]> => {
    const q = query(
        collection(db, 'clients'),
        where('garageId', '==', garageId),
        where('isVIP', '==', true),
        orderBy('nom', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client))
}

export const getRecentClients = async (garageId: string, limitCount: number = 10): Promise<Client[]> => {
    const q = query(
        collection(db, 'clients'),
        where('garageId', '==', garageId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client))
}

export const searchClients = async (garageId: string, searchTerm: string): Promise<Client[]> => {
    // Firebase ne supporte pas la recherche full-text, on récupère tout et on filtre
    const clients = await getClients(garageId)
    const term = searchTerm.toLowerCase()
    return clients.filter(client =>
        client.nom?.toLowerCase().includes(term) ||
        client.prenom?.toLowerCase().includes(term) ||
        client.telephone?.includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.ville?.toLowerCase().includes(term)
    )
}

export const updateClient = async (clientId: string, data: Partial<Client>) => {
    // Filtrer les valeurs undefined car Firebase ne les accepte pas
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'clients', clientId), {
        ...cleanData,
        updatedAt: Timestamp.now()
    })
}

export const deleteClient = async (clientId: string) => {
    await deleteDoc(doc(db, 'clients', clientId))
}

// ============================================
// VEHICULES
// ============================================

export const createVehicule = async (data: Omit<Vehicule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    const docRef = await addDoc(collection(db, 'vehicules'), {
        ...cleanData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getVehicules = async (garageId: string): Promise<Vehicule[]> => {
    const q = query(
        collection(db, 'vehicules'),
        where('garageId', '==', garageId),
        orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicule))
}

export const getVehiculesByClient = async (clientId: string): Promise<Vehicule[]> => {
    const q = query(
        collection(db, 'vehicules'),
        where('clientId', '==', clientId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicule))
}

export const getVehiculeByPlaque = async (garageId: string, plaque: string): Promise<Vehicule | null> => {
    const q = query(
        collection(db, 'vehicules'),
        where('garageId', '==', garageId),
        where('plaque', '==', plaque.toUpperCase()),
        limit(1)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as Vehicule
}

export const updateVehicule = async (vehiculeId: string, data: Partial<Vehicule>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'vehicules', vehiculeId), {
        ...cleanData,
        updatedAt: Timestamp.now()
    })
}

export const deleteVehicule = async (vehiculeId: string) => {
    await deleteDoc(doc(db, 'vehicules', vehiculeId))
}

export const getVehiculeById = async (vehiculeId: string): Promise<Vehicule | null> => {
    const docSnap = await getDoc(doc(db, 'vehicules', vehiculeId))
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Vehicule
}

// ============================================
// REPARATIONS
// ============================================

export const createReparation = async (data: Omit<Reparation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    const docRef = await addDoc(collection(db, 'reparations'), {
        ...cleanData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getReparations = async (garageId: string, statut?: string): Promise<Reparation[]> => {
    try {
        // Try with orderBy first (requires composite index)
        let q = query(
            collection(db, 'reparations'),
            where('garageId', '==', garageId),
            orderBy('createdAt', 'desc')
        )

        if (statut && statut !== 'all') {
            q = query(
                collection(db, 'reparations'),
                where('garageId', '==', garageId),
                where('statut', '==', statut),
                orderBy('createdAt', 'desc')
            )
        }

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reparation))
    } catch (error: any) {
        // Fallback: If index is missing, fetch without orderBy and sort client-side
        console.warn('Firestore index missing, falling back to client-side sorting:', error.message)

        let q = query(
            collection(db, 'reparations'),
            where('garageId', '==', garageId)
        )

        if (statut && statut !== 'all') {
            q = query(
                collection(db, 'reparations'),
                where('garageId', '==', garageId),
                where('statut', '==', statut)
            )
        }

        const snapshot = await getDocs(q)
        const reparations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reparation))

        // Sort client-side by createdAt descending
        return reparations.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0)
            const dateB = b.createdAt?.toDate?.() || new Date(0)
            return dateB.getTime() - dateA.getTime()
        })
    }
}

export const updateReparation = async (reparationId: string, data: Partial<Reparation>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'reparations', reparationId), {
        ...cleanData,
        updatedAt: Timestamp.now()
    })
}

export const getReparation = async (reparationId: string): Promise<Reparation | null> => {
    const docSnap = await getDoc(doc(db, 'reparations', reparationId))
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Reparation
}

export const getReparationsByClient = async (clientId: string): Promise<Reparation[]> => {
    const q = query(
        collection(db, 'reparations'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reparation))
}

export const getReparationsByVehicule = async (vehiculeId: string): Promise<Reparation[]> => {
    const q = query(
        collection(db, 'reparations'),
        where('vehiculeId', '==', vehiculeId),
        orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reparation))
}

export const getReparationsEnCours = async (garageId: string): Promise<Reparation[]> => {
    const q = query(
        collection(db, 'reparations'),
        where('garageId', '==', garageId),
        where('statut', 'in', ['en_attente', 'en_cours']),
        orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reparation))
}

export const getReparationsUrgentes = async (garageId: string): Promise<Reparation[]> => {
    const q = query(
        collection(db, 'reparations'),
        where('garageId', '==', garageId),
        where('priorite', '==', 'urgent'),
        where('statut', 'in', ['en_attente', 'en_cours'])
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reparation))
}

export const deleteReparation = async (reparationId: string) => {
    await deleteDoc(doc(db, 'reparations', reparationId))
}

// ============================================
// ARTICLES (Stock)
// ============================================

export const createArticle = async (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    const docRef = await addDoc(collection(db, 'articles'), {
        ...cleanData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getArticles = async (garageId: string): Promise<Article[]> => {
    const q = query(
        collection(db, 'articles'),
        where('garageId', '==', garageId),
        orderBy('designation', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
}

export const getArticlesLowStock = async (garageId: string): Promise<Article[]> => {
    const articles = await getArticles(garageId)
    return articles.filter(a => a.quantiteStock <= a.seuilAlerte)
}

export const updateArticle = async (articleId: string, data: Partial<Article>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'articles', articleId), {
        ...cleanData,
        updatedAt: Timestamp.now()
    })
}

// ============================================
// RENDEZ-VOUS
// ============================================

export const createRendezVous = async (data: Omit<RendezVous, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    const docRef = await addDoc(collection(db, 'rendezvous'), {
        ...cleanData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getRendezVous = async (garageId: string, date?: Date): Promise<RendezVous[]> => {
    let q = query(
        collection(db, 'rendezvous'),
        where('garageId', '==', garageId),
        orderBy('dateHeure', 'asc')
    )

    const snapshot = await getDocs(q)
    let rdvs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RendezVous))

    if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        rdvs = rdvs.filter(rdv => {
            const rdvDate = rdv.dateHeure.toDate()
            return rdvDate >= startOfDay && rdvDate <= endOfDay
        })
    }

    return rdvs
}

export const updateRendezVous = async (rdvId: string, data: Partial<RendezVous>) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'rendezvous', rdvId), {
        ...cleanData,
        updatedAt: Timestamp.now()
    })
}

// ============================================
// STATS
// ============================================

export const getStats = async (garageId: string) => {
    const [clients, vehicules, reparations, documents] = await Promise.all([
        getClients(garageId),
        getVehicules(garageId),
        getReparations(garageId),
        getDocuments(garageId)
    ])

    const facturesPayees = documents.filter(d => d.type === 'facture' && d.statut === 'paye')
    const caTotal = facturesPayees.reduce((sum, f) => sum + f.montantTTC, 0)
    const reparationsEnCours = reparations.filter(r => r.statut === 'en_cours').length
    const devisEnAttente = documents.filter(d => d.type === 'devis' && d.statut === 'envoye').length

    return {
        totalClients: clients.length,
        totalVehicules: vehicules.length,
        totalReparations: reparations.length,
        reparationsEnCours,
        caTotal,
        devisEnAttente
    }
}

// ============================================
// SUBSCRIPTION & LIMITS
// ============================================

const DEMO_LIMITS = {
    clients: 5,
    vehicules: 5
}

export const checkClientLimit = async (garageId: string): Promise<{ allowed: boolean; current: number; limit: number; isPro: boolean }> => {
    const garage = await getGarageById(garageId)
    if (!garage) throw new Error('Garage not found')

    const isPro = garage.plan === 'pro' && garage.subscriptionStatus === 'active'
    if (isPro) {
        return { allowed: true, current: 0, limit: Infinity, isPro: true }
    }

    const clients = await getClients(garageId)
    const current = clients.length
    const allowed = current < DEMO_LIMITS.clients

    return { allowed, current, limit: DEMO_LIMITS.clients, isPro: false }
}

export const checkVehiculeLimit = async (garageId: string): Promise<{ allowed: boolean; current: number; limit: number; isPro: boolean }> => {
    const garage = await getGarageById(garageId)
    if (!garage) throw new Error('Garage not found')

    const isPro = garage.plan === 'pro' && garage.subscriptionStatus === 'active'
    if (isPro) {
        return { allowed: true, current: 0, limit: Infinity, isPro: true }
    }

    const vehicules = await getVehicules(garageId)
    const current = vehicules.length
    const allowed = current < DEMO_LIMITS.vehicules

    return { allowed, current, limit: DEMO_LIMITS.vehicules, isPro: false }
}

export const getGarageLimits = async (garageId: string) => {
    const garage = await getGarageById(garageId)
    if (!garage) throw new Error('Garage not found')

    const isPro = garage.plan === 'pro' && garage.subscriptionStatus === 'active'

    const [clients, vehicules] = await Promise.all([
        getClients(garageId),
        getVehicules(garageId)
    ])

    return {
        isPro,
        plan: garage.plan || 'demo',
        subscriptionStatus: garage.subscriptionStatus,
        clients: {
            current: clients.length,
            limit: isPro ? Infinity : DEMO_LIMITS.clients,
            remaining: isPro ? Infinity : Math.max(0, DEMO_LIMITS.clients - clients.length)
        },
        vehicules: {
            current: vehicules.length,
            limit: isPro ? Infinity : DEMO_LIMITS.vehicules,
            remaining: isPro ? Infinity : Math.max(0, DEMO_LIMITS.vehicules - vehicules.length)
        }
    }
}

export const updateGarageSubscription = async (
    garageId: string,
    data: {
        plan?: 'demo' | 'pro'
        stripeCustomerId?: string
        stripeSubscriptionId?: string
        subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
        subscriptionCurrentPeriodEnd?: Timestamp
    }
) => {
    await updateDoc(doc(db, 'garages', garageId), {
        ...data,
        updatedAt: Timestamp.now()
    })
}

export const getGarageByStripeCustomerId = async (customerId: string): Promise<Garage | null> => {
    const q = query(collection(db, 'garages'), where('stripeCustomerId', '==', customerId))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Garage
}

export const getGarageByStripeSubscriptionId = async (subscriptionId: string): Promise<Garage | null> => {
    const q = query(collection(db, 'garages'), where('stripeSubscriptionId', '==', subscriptionId))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Garage
}

// ============================================
// DOCUMENTS (DEVIS & FACTURES)
// ============================================

export interface LigneDocument {
    id?: string
    documentId?: string
    designation: string
    description?: string
    quantite: number
    prixUnitaireHT: number
    tauxTVA: number
    montantHT: number
}

export const createDocument = async (
    data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>,
    lignes: Omit<LigneDocument, 'id' | 'documentId'>[]
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'documents'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })

    // Créer les lignes du document
    for (const ligne of lignes) {
        await addDoc(collection(db, 'lignesDocument'), {
            documentId: docRef.id,
            ...ligne
        })
    }

    return docRef.id
}

export const getDocuments = async (garageId: string, type?: 'devis' | 'facture'): Promise<Document[]> => {
    let q = query(
        collection(db, 'documents'),
        where('garageId', '==', garageId),
        orderBy('createdAt', 'desc')
    )

    if (type) {
        q = query(
            collection(db, 'documents'),
            where('garageId', '==', garageId),
            where('type', '==', type),
            orderBy('createdAt', 'desc')
        )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document))
}

export const getDocumentById = async (documentId: string): Promise<Document | null> => {
    const docSnap = await getDoc(doc(db, 'documents', documentId))
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Document
}

export const getDocumentLignes = async (documentId: string): Promise<LigneDocument[]> => {
    const q = query(collection(db, 'lignesDocument'), where('documentId', '==', documentId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LigneDocument))
}

export const updateDocument = async (documentId: string, data: Partial<Document>): Promise<void> => {
    await updateDoc(doc(db, 'documents', documentId), {
        ...data,
        updatedAt: Timestamp.now()
    })
}

// ============================================
// PERSONNEL
// ============================================

export const createPersonnel = async (data: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    const docRef = await addDoc(collection(db, 'personnel'), {
        ...cleanData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getPersonnelByGarage = async (garageId: string): Promise<Personnel[]> => {
    const q = query(
        collection(db, 'personnel'),
        where('garageId', '==', garageId),
        orderBy('nom', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Personnel))
}

export const getPersonnelById = async (personnelId: string): Promise<Personnel | null> => {
    const docSnap = await getDoc(doc(db, 'personnel', personnelId))
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Personnel
}

export const getActivePersonnel = async (garageId: string): Promise<Personnel[]> => {
    const q = query(
        collection(db, 'personnel'),
        where('garageId', '==', garageId),
        where('actif', '==', true),
        orderBy('nom', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Personnel))
}

export const updatePersonnel = async (personnelId: string, data: Partial<Personnel>): Promise<void> => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'personnel', personnelId), {
        ...cleanData,
        updatedAt: Timestamp.now()
    })
}

export const deletePersonnel = async (personnelId: string): Promise<void> => {
    await deleteDoc(doc(db, 'personnel', personnelId))
}

// ============================================
// POINTAGE HEURES
// ============================================

export const createPointage = async (data: Omit<PointageHeure, 'id' | 'createdAt'>): Promise<string> => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    const docRef = await addDoc(collection(db, 'pointages'), {
        ...cleanData,
        createdAt: Timestamp.now()
    })
    return docRef.id
}

export const getPointagesByPersonnel = async (personnelId: string, startDate?: Timestamp, endDate?: Timestamp): Promise<PointageHeure[]> => {
    let q = query(
        collection(db, 'pointages'),
        where('personnelId', '==', personnelId),
        orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    let pointages = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PointageHeure))

    // Filtrer par dates si spécifiées
    if (startDate) {
        pointages = pointages.filter(p => p.date.toMillis() >= startDate.toMillis())
    }
    if (endDate) {
        pointages = pointages.filter(p => p.date.toMillis() <= endDate.toMillis())
    }

    return pointages
}

export const getPointagesByReparation = async (reparationId: string): Promise<PointageHeure[]> => {
    const q = query(
        collection(db, 'pointages'),
        where('reparationId', '==', reparationId),
        orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PointageHeure))
}

export const updatePointage = async (pointageId: string, data: Partial<PointageHeure>): Promise<void> => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(doc(db, 'pointages', pointageId), cleanData)
}

export const deletePointage = async (pointageId: string): Promise<void> => {
    await deleteDoc(doc(db, 'pointages', pointageId))
}
