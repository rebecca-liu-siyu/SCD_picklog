'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {

  const router = useRouter()

  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  // ================= LOAD USERS =================
  async function loadUsers() {

    // join profiles to show display name
    const { data } = await supabase
      .from('users')
      .select(`
        id,
        pwd,
        identity,
        profiles (
          display_name,
          profile_type
        )
      `)

    if (data) setUsers(data)
  }

  // ================= LOGIN =================
  async function handleLogin() {

    if (!selectedUser) {
      alert('Select user')
      return
    }

    if (!password) {
      alert('Enter password')
      return
    }

    setLoading(true)

    try {

      // check password
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', selectedUser.id)
        .eq('pwd', password)
        .single()

      if (!data) {
        alert('Wrong password')
        return
      }

      // save session (simple auth)
      localStorage.setItem(
        'user_id',
        data.id
      )

      router.push('/feed')

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex justify-center bg-white">

      <div className="w-full max-w-md flex flex-col">

        {/* HEAD */}
        <div className="p-4 border-b">
          <p className="text-xl font-bold">
            Login
          </p>
          <p className="text-sm text-gray-500">
            Choose your account
          </p>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {users.map((user) => {

            const profile_0 = user.profiles?.[0]
            const profile_1 = user.profiles?.[1]
            const profile_2 = user.profiles?.[2]
            const profile = profile_0.profile_type == "REAL" ? profile_0 : (profile_1.profile_type == "REAL"? profile_1 : profile_2)

            return (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full text-left p-3 border rounded-xl
                  ${selectedUser?.id === user.id
                    ? 'border-black'
                    : ''
                  }
                `}
              >

                <p className="font-semibold">
                  {profile?.display_name || 'No name'}
                </p>

              </button>
            )

          })}

        </div>

        {/* FOOT */}
        <div className="border-t p-3 space-y-2">

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded-lg"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </div>

      </div>

    </div>
  )
}