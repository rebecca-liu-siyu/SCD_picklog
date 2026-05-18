'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function UsersPage() {

  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('users').select('*')
    setUsers(data || [])
  }

  return (
    <div className="p-4">

      {users.map(u => (
        <div
          key={u.id}
          onClick={() => router.push(`/users/${u.id}`)}
          className="border p-3 mb-2"
        >
          {u.local_user_id}
        </div>
      ))}

    </div>
  )
}