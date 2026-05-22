'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Profile = {
  id: string
  display_name: string
  avatar_url: string
  bio: string
  profile_type: string
}

export default function UsersPage() {

  const router = useRouter()

  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    loadProfiles()
  }, [])

  // ================= LOAD =================
  async function loadProfiles() {

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('profile_type', 'ANON')

    if (error) {
      console.log(error)
      return
    }

    if (!data) return

    // ✅ 按 display_name 字母排序（A → Z）
    const sorted = [...data].sort((a, b) =>
      (a.display_name || '').localeCompare(b.display_name || '')
    )

    setProfiles(sorted)
  }

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">

      {/* APP */}
      <div className="w-full max-w-md h-screen flex flex-col bg-white">

        {/* ================= HEAD ================= */}
        <div className="shrink-0 border-b px-4 py-3 bg-white">

          <p className="text-xl font-bold">
            Users
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Explore profiles
          </p>

        </div>

        {/* ================= BODY ================= */}
        <div
          className="
            flex-1
            overflow-y-auto
            scrollbar-hide
          "
        >

          {/* ================= ANON ================= */}
          <button
            onClick={() => router.push('/anon')}
            className="
              w-full
              p-4
              border-b
              text-left
              active:bg-gray-50
            "
          >

            <div className="flex items-center gap-3">

              {/* avatar */}
              <div
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-black
                  flex
                  items-center
                  justify-center
                  text-white
                  text-xl
                "
              >
                ?
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">

                <p className="font-semibold">
                  Anonymous
                </p>

                <p
                  className="
                    text-sm
                    text-gray-500
                    line-clamp-2
                  "
                >
                  All anonymous posts
                </p>

              </div>

            </div>

          </button>

          {/* ================= USERS ================= */}
          {profiles.map(profile => (

            <button
              key={profile.id}
              onClick={() =>
                router.push(`/users/${profile.id}`)
              }
              className="
                w-full
                p-4
                border-b
                text-left
                active:bg-gray-50
              "
            >

              <div className="flex gap-3">

                {/* avatar */}
                {profile.avatar_url ? (

                  <img
                    src={profile.avatar_url}
                    className="
                      w-14
                      h-14
                      rounded-full
                      object-cover
                      shrink-0
                    "
                  />

                ) : (

                  <div
                    className="
                      w-14
                      h-14
                      rounded-full
                      bg-gray-300
                      shrink-0
                    "
                  />

                )}

                {/* info */}
                <div className="flex-1 min-w-0">

                  {/* id */}
                  <p className="font-semibold">
                    {profile.display_name}
                  </p>

                  {/* bio */}
                  <p
                    className="
                      text-sm
                      text-gray-500
                      mt-1
                      whitespace-pre-wrap
                      break-words
                      line-clamp-2
                    "
                  >
                    {profile.bio || 'No bio yet'}
                  </p>

                </div>

              </div>

            </button>

          ))}

        </div>

        {/* ================= FOOT ================= */}
        <div
          className="
            shrink-0
            border-t
            bg-white
            flex
            justify-around
            items-center
            py-3
          "
        >

          <button
            onClick={() => router.push('/feed')}
            className="text-sm"
          >
            Home
          </button>

          <button
            onClick={() => router.push('/post')}
            className="text-2xl"
          >
            ＋
          </button>

          <button
            onClick={() => router.push('/users')}
            className="
              text-sm
              font-semibold
            "
          >
            Users
          </button>

        </div>

      </div>

    </div>
  )
}