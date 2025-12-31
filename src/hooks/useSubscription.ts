import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SubscriptionData } from '@/lib/stripe'

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    const subscriptionsRef = collection(db, 'subscriptions')
    const q = query(
      subscriptionsRef,
      where('userId', '==', user.uid),
      where('status', 'in', ['active', 'trialing', 'past_due']),
      limit(1)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setSubscription(null)
      } else {
        const doc = snapshot.docs[0]
        setSubscription({ id: doc.id, ...doc.data() } as SubscriptionData)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isTrial = subscription?.status === 'trialing'
  const isPastDue = subscription?.status === 'past_due'

  return {
    subscription,
    loading,
    isActive,
    isTrial,
    isPastDue,
  }
}
