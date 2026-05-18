'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    check()
  }, [])

  async function check() {
    const localUserId = localStorage.getItem('local_user_id')

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('local_user_id', localUserId)
      .single()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)

    if (!profiles || profiles.length === 0) {
      router.push('/onboarding')
    } else {
      router.push('/feed')
    }
  }

  return <div className="p-6">Loading...</div>
}