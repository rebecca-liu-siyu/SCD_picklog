'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  const [users, setUsers] = useState<any[]>([])
  const [force, setForce] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
    setForce(localStorage.getItem('force_profile_type'))
  }, [])

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')

    setUsers(data || [])
  }

  function switchUser(localUserId: string) {
    localStorage.setItem('local_user_id', localUserId)
    router.push('/feed')
  }

  function setForceType(type: string | null) {
    if (type) {
      localStorage.setItem('force_profile_type', type)
    } else {
      localStorage.removeItem('force_profile_type')
    }
    setForce(type)
  }

  const btn = (label: string, type: string | null) => (
    <button
      onClick={() => setForceType(type)}
      className={`border px-3 py-1 rounded-full ${
        force === type ? 'bg-black text-white' : ''
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">

      <h1 className="text-2xl font-bold">Switch User</h1>

      {/* FORCE CONTROL */}
      <div className="space-y-2">
        <p className="font-bold">Force Identity</p>

        <div className="flex gap-2 flex-wrap">
          {btn('REAL', 'REAL')}
          {btn('PSEUDO', 'PSEUDO')}
          {btn('ANON', 'ANON')}
          {btn('RESET', null)}
        </div>

        {force && (
          <p className="text-xs text-gray-500">
            Current: {force}
          </p>
        )}
      </div>

      {/* USER SWITCH */}
      <div className="space-y-2">
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => switchUser(user.local_user_id)}
            className="w-full border rounded-2xl p-4 text-left"
          >
            <p className="font-bold">{user.local_user_id}</p>
            <p className="text-xs text-gray-500">{user.id}</p>
          </button>
        ))}
      </div>

    </div>
  )
}