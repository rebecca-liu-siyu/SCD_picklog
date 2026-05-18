'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Profile = {
  id: string
  display_name: string
  bio?: string
  avatar_url?: string
  profile_type: string
}

export default function UsersPage() {
  const router = useRouter()

  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('*')

    if (!data) return

    // 1. 分離匿名
    const anonProfile = {
      id: 'anon',
      display_name: '匿名',
      bio: '所有匿名貼文',
      profile_type: 'ANON'
    }

    const normalProfiles = data.filter(
      p => p.profile_type !== 'ANON'
    )

    // 2. 打散順序
    const shuffled = normalProfiles.sort(
      () => Math.random() - 0.5
    )

    // 3. 加回匿名入口
    setProfiles([
      ...shuffled,
      anonProfile as any
    ])
  }

  function handleClick(profile: Profile) {
    // 匿名頁
    if (profile.profile_type === 'ANON') {
      router.push('/anon')
      return
    }

    // 一般 identity
    router.push(`/users/${profile.id}`)
  }

  return (
    <div className="max-w-md mx-auto flex flex-col h-screen">

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {profiles.map((p) => (
          <div
            key={p.id}
            onClick={() => handleClick(p)}
            className="flex items-center gap-3 p-3 border rounded-2xl cursor-pointer active:scale-[0.98] transition"
          >

            {/* avatar */}
            <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">

              {p.avatar_url ? (
                <img
                  src={p.avatar_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">
                  {p.display_name?.slice(0, 2)}
                </span>
              )}

            </div>

            {/* info */}
            <div className="flex-1">

              <p className="font-semibold">
                {p.display_name}
              </p>

              <p className="text-xs text-gray-500 line-clamp-1">
                {p.bio || ''}
              </p>

            </div>

          </div>
        ))}

      </div>

      {/* FOOT */}
      <div className="border-t flex justify-around p-3 bg-white">

        <button
          onClick={() => router.push('/feed')}
        >
          Home
        </button>

        <button
          onClick={() => router.push('/post')}
        >
          ＋
        </button>

        <button className="font-bold">
          Users
        </button>

      </div>

    </div>
  )
}