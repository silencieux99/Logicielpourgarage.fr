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

// ============================================
// TYPES
// ============================================

export interface Garage {
    id?: string
    userId: string
    nom: string
    statutJuridique: string
    siret?: string
    numeroTVA?: string
    adresse: string
    codePostal: string
    ville: string
    telephone?: string
    siteWeb?: string
    effectif?: string
    logo?: string
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
    mentionsDevis: string
    mentionsFacture: string
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
    civilite: string
    prenom: string
    nom: string
    email?: string
    telephone?: string
    adresse?: string
    codePostal?: string
    ville?: string
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

export interface RendezVous {
    id?: string
    garageId: string
    clientId: string
    vehiculeId?: string
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

export const createGarage = async (data: Omit<Garage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(collection(db, 'garages'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getGarageByUserId = async (userId: string): Promise<Garage | null> => {
    const q = query(collection(db, 'garages'), where('userId', '==', userId), limit(1))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as Garage
}

export const updateGarage = async (garageId: string, data: Partial<Garage>) => {
    await updateDoc(doc(db, 'garages', garageId), {
        ...data,
        updatedAt: Timestamp.now()
    })
}

// ============================================
// GARAGE CONFIG
// ============================================

export const createGarageConfig = async (data: Omit<GarageConfig, 'id'>) => {
    const docRef = await addDoc(collection(db, 'garageConfigs'), data)
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
    await updateDoc(doc(db, 'garageConfigs', configId), data)
}

// ============================================
// CLIENTS
// ============================================

export const createClient = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(collection(db, 'clients'), {
        ...data,
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
    await updateDoc(doc(db, 'clients', clientId), {
        ...data,
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
    const docRef = await addDoc(collection(db, 'vehicules'), {
        ...data,
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
    await updateDoc(doc(db, 'vehicules', vehiculeId), {
        ...data,
        updatedAt: Timestamp.now()
    })
}

export const deleteVehicule = async (vehiculeId: string) => {
    await deleteDoc(doc(db, 'vehicules', vehiculeId))
}

// ============================================
// REPARATIONS
// ============================================

export const createReparation = async (data: Omit<Reparation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(collection(db, 'reparations'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
    return docRef.id
}

export const getReparations = async (garageId: string, statut?: string): Promise<Reparation[]> => {
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
}

export const updateReparation = async (reparationId: string, data: Partial<Reparation>) => {
    await updateDoc(doc(db, 'reparations', reparationId), {
        ...data,
        updatedAt: Timestamp.now()
    })
}

// ============================================
// DOCUMENTS (Devis / Factures)
// ============================================

export const createDocument = async (data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(collection(db, 'documents'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    })
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document))
}

// ============================================
// ARTICLES (Stock)
// ============================================

export const createArticle = async (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(collection(db, 'articles'), {
        ...data,
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
    await updateDoc(doc(db, 'articles', articleId), {
        ...data,
        updatedAt: Timestamp.now()
    })
}

// ============================================
// RENDEZ-VOUS
// ============================================

export const createRendezVous = async (data: Omit<RendezVous, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(collection(db, 'rendezvous'), {
        ...data,
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
    await updateDoc(doc(db, 'rendezvous', rdvId), {
        ...data,
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
