"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    User,
    Car
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Appointment {
    id: string
    type: string
    typeColor: string
    heure: string
    dureeMinutes: number
    clientNom?: string
    vehiculePlaque?: string
    description?: string
}

const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
]

export default function SchedulePage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())

    useEffect(() => {
        loadAppointments()
    }, [selectedDate])

    const loadAppointments = async () => {
        setLoading(true)
        try {
            setAppointments([])
        } catch (error) {
            console.error("Erreur chargement RDV:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    const goToDay = (offset: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + offset)
        setSelectedDate(newDate)
    }

    const isToday = selectedDate.toDateString() === new Date().toDateString()

    const getAppointmentAtTime = (time: string) => {
        return appointments.find(a => a.heure === time)
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Agenda</h1>
                    <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">{appointments.length} rendez-vous</p>
                </div>
                <Link
                    href="/schedule/new"
                    className="hidden sm:inline-flex h-9 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium rounded-lg items-center gap-2 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nouveau RDV</span>
                </Link>
            </div>

            {/* Date Navigation */}
            <div className="bg-white rounded-xl border border-[var(--border-light)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => goToDay(-1)}
                        className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-[var(--text-secondary)]" />
                    </button>

                    <div className="text-center">
                        <p className="text-[15px] font-semibold text-[var(--text-primary)] capitalize">
                            {formatDate(selectedDate)}
                        </p>
                        {!isToday && (
                            <button
                                onClick={() => setSelectedDate(new Date())}
                                className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                            >
                                Retour à aujourd'hui
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => goToDay(1)}
                        className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-[var(--text-secondary)]" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-[var(--border-light)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <div className="divide-y divide-[var(--border-light)]">
                        {timeSlots.map((time) => {
                            const appointment = getAppointmentAtTime(time)

                            return (
                                <div
                                    key={time}
                                    className={cn(
                                        "flex items-stretch min-h-[56px]",
                                        appointment ? "bg-[var(--bg-tertiary)]" : "hover:bg-[var(--bg-secondary)]"
                                    )}
                                >
                                    <div className="w-16 sm:w-20 flex-shrink-0 p-3 text-[13px] font-medium text-[var(--text-muted)] border-r border-[var(--border-light)]">
                                        {time}
                                    </div>

                                    <div className="flex-1 p-2">
                                        {appointment ? (
                                            <Link
                                                href={`/schedule/${appointment.id}`}
                                                className={cn(
                                                    "block p-3 rounded-lg border-l-4",
                                                    appointment.typeColor || "border-[var(--accent-primary)] bg-[var(--bg-tertiary)]"
                                                )}
                                            >
                                                <p className="text-[13px] font-semibold text-[var(--text-primary)]">{appointment.type}</p>
                                                {appointment.clientNom && (
                                                    <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] mt-1">
                                                        <User className="h-3 w-3" />
                                                        {appointment.clientNom}
                                                    </div>
                                                )}
                                                {appointment.vehiculePlaque && (
                                                    <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                                                        <Car className="h-3 w-3" />
                                                        {appointment.vehiculePlaque}
                                                    </div>
                                                )}
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/schedule/new?date=${selectedDate.toISOString().split('T')[0]}&time=${time}`}
                                                className="w-full h-full min-h-[40px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-tertiary)] transition-colors rounded-lg border border-dashed border-transparent hover:border-[var(--border-default)]"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && appointments.length === 0 && (
                <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 text-center">
                    <Calendar className="h-6 w-6 text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-[13px] text-[var(--text-tertiary)]">
                        Aucun rendez-vous prévu ce jour
                    </p>
                    <Link
                        href={`/schedule/new?date=${selectedDate.toISOString().split('T')[0]}`}
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--accent-primary)] mt-2 hover:underline"
                    >
                        <Plus className="h-4 w-4" />
                        Planifier un rendez-vous
                    </Link>
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/schedule/new"
                className="md:hidden fixed right-4 bottom-20 w-12 h-12 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center z-30"
                style={{ boxShadow: 'var(--shadow-lg)' }}
            >
                <Plus className="h-5 w-5" />
            </Link>
        </div>
    )
}
