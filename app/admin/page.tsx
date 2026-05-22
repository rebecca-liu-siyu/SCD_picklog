'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  pwd: string
  identity: string | null

  profiles: {
    id: string
    display_name: string
    avatar_url: string
    profile_type: string
    bio: string
  }[]
}

export default function AdminPage() {

  const [users, setUsers] =
    useState<User[]>([])

  const [loading, setLoading] =
    useState(true)

  const [savingId, setSavingId] =
    useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  // ================= LOAD USERS =================
  async function loadUsers() {

    setLoading(true)

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        profiles (
          id,
          display_name,
          avatar_url,
          profile_type,
          bio
        )
      `)

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    setUsers(data || [])
    setLoading(false)
  }

  // ================= UPDATE IDENTITY =================
  async function updateIdentity(
    userId: string,
    profileType: string
  ) {

    try {

      setSavingId(userId)

      const { error } = await supabase
        .from('users')
        .update({
          identity: profileType
        })
        .eq('id', userId)

      if (error) {
        console.log(error)
        alert('Update failed')
        return
      }

      setUsers(prev =>
        prev.map(user => {

          if (user.id !== userId)
            return user

          return {
            ...user,
            identity: profileType
          }

        })
      )

    } catch (err) {

      console.log(err)

    } finally {

      setSavingId(null)

    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= HEAD ================= */}
      <div
        className="
          sticky
          top-0
          z-10
          bg-white
          border-b
          px-5
          py-4
        "
      >

        <p className="text-2xl font-bold">
          Admin Panel
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Manage user identities
        </p>

      </div>

      {/* ================= BODY ================= */}
      <div className="p-4 space-y-5">

        {loading ? (

          <div className="py-20 text-center">

            <p className="text-gray-400">
              Loading...
            </p>

          </div>

        ) : users.length > 0 ? (

          users.map(user => (

            <div
              key={user.id}
              className="
                bg-white
                rounded-3xl
                p-5
                shadow-sm
                border
              "
            >

              {/* top */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-5
                "
              >

                <div>

                  <p className="font-bold text-lg">
                    USER
                  </p>

                  <p
                    className="
                      text-xs
                      text-gray-500
                      mt-1
                      break-all
                    "
                  >
                    {user.id}
                  </p>

                </div>

                <div
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-gray-100
                    text-sm
                    font-medium
                  "
                >
                  {user.identity || 'NONE'}
                </div>

              </div>

              {/* profiles */}
              <div className="space-y-3">

                {user.profiles?.map(profile => (

                  <div
                    key={profile.id}
                    className="
                      border
                      rounded-2xl
                      p-4
                    "
                  >

                    <div className="flex gap-4">

                      {/* avatar */}
                      {profile.avatar_url ? (

                        <img
                          src={
                            profile.avatar_url
                          }
                          className="
                            w-16
                            h-16
                            rounded-full
                            object-cover
                            shrink-0
                          "
                        />

                      ) : (

                        <div
                          className="
                            w-16
                            h-16
                            rounded-full
                            bg-gray-300
                            shrink-0
                          "
                        />

                      )}

                      {/* info */}
                      <div className="flex-1 min-w-0">

                        <p className="font-semibold">
                          {
                            profile.display_name
                          }
                        </p>

                        <p
                          className="
                            text-xs
                            text-gray-500
                            mt-1
                          "
                        >
                          {
                            profile.profile_type
                          }
                        </p>

                        <p
                          className="
                            text-sm
                            mt-3
                            whitespace-pre-wrap
                            break-words
                            text-gray-700
                          "
                        >
                          {profile.bio || 'No bio'}
                        </p>

                      </div>

                    </div>

                    {/* action */}
                    <button
                      onClick={() =>
                        updateIdentity(
                          user.id,
                          profile.profile_type
                        )
                      }
                      disabled={
                        savingId === user.id
                      }
                      className="
                        w-full
                        mt-4
                        py-3
                        rounded-xl
                        bg-black
                        text-white
                        text-sm
                        font-semibold
                        disabled:opacity-50
                      "
                    >
                      {savingId === user.id
                        ? 'Saving...'
                        : `Assign ${profile.profile_type}`}
                    </button>

                  </div>

                ))}

              </div>

            </div>

          ))

        ) : (

          <div className="py-20 text-center">

            <p className="text-gray-400">
              No users
            </p>

          </div>

        )}

      </div>

    </div>
  )
}