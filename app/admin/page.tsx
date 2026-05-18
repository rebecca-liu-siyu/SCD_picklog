'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {

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
        <button
          key={u.id}
          onClick={() => {
            localStorage.setItem('local_user_id', u.local_user_id)
            router.push('/feed')
          }}
          className="block border p-3 w-full mb-2"
        >
          {u.local_user_id}
        </button>
      ))}

    </div>
  )
}