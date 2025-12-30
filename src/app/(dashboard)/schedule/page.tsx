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
            // TODO: Load from Firebase
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
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Agenda</h1>
                    <p className="text-sm text-zinc-500 mt-1">{appointments.length} rendez-vous</p>
                </div>
                <Link
                    href="/schedule/new"
                    className="hidden sm:flex h-10 sm:h-11 px-4 sm:px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-xl items-center gap-2 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nouveau RDV</span>
                </Link>
            </div>

            {/* Date Navigation */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => goToDay(-1)}
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-zinc-600" />
                    </button>

                    <div className="text-center">
                        <p className="text-lg font-semibold text-zinc-900 capitalize">
                            {formatDate(selectedDate)}
                        </p>
                        {!isToday && (
                            <button
                                onClick={() => setSelectedDate(new Date())}
                                className="text-sm text-zinc-500 hover:text-zinc-900"
                            >
                                Retour à aujourd'hui
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => goToDay(1)}
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-zinc-600" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    {/* Time slots */}
                    <div className="divide-y divide-zinc-100">
                        {timeSlots.map((time) => {
                            const appointment = getAppointmentAtTime(time)

                            return (
                                <div
                                    key={time}
                                    className={cn(
                                        "flex items-stretch min-h-[60px]",
                                        appointment ? "bg-zinc-50" : "hover:bg-zinc-50"
                                    )}
                                >
                                    <div className="w-16 sm:w-20 flex-shrink-0 p-3 text-sm font-medium text-zinc-500 border-r border-zinc-100">
                                        {time}
                                    </div>

                                    <div className="flex-1 p-2">
                                        {appointment ? (
                                            <Link
                                                href={`/schedule/${appointment.id}`}
                                                className={cn(
                                                    "block p-3 rounded-lg border-l-4",
                                                    appointment.typeColor || "border-zinc-400 bg-zinc-100"
                                                )}
                                            >
                                                <p className="text-sm font-semibold text-zinc-900">{appointment.type}</p>
                                                {appointment.clientNom && (
                                                    <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                                        <User className="h-3 w-3" />
                                                        {appointment.clientNom}
                                                    </div>
                                                )}
                                                {appointment.vehiculePlaque && (
                                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                        <Car className="h-3 w-3" />
                                                        {appointment.vehiculePlaque}
                                                    </div>
                                                )}
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/schedule/new?date=${selectedDate.toISOString().split('T')[0]}&time=${time}`}
                                                className="w-full h-full min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors rounded-lg border-2 border-dashed border-transparent hover:border-zinc-200"
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

            {/* Empty State - only if no appointments at all */}
            {!loading && appointments.length === 0 && (
                <div className="bg-zinc-50 rounded-xl p-6 text-center">
                    <Calendar className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">
                        Aucun rendez-vous prévu ce jour
                    </p>
                    <Link
                        href={`/schedule/new?date=${selectedDate.toISOString().split('T')[0]}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 mt-2 hover:underline"
                    >
                        <Plus className="h-4 w-4" />
                        Planifier un rendez-vous
                    </Link>
                </div>
            )}

            {/* Mobile FAB */}
            <Link
                href="/schedule/new"
                className="md:hidden fixed right-4 bottom-20 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center z-30"
            >
                <Plus className="h-6 w-6" />
            </Link>
        </div>
    )
}
