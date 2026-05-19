'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {

  const router = useRouter()

  // ================= REAL =================
  const [realId, setRealId] = useState('')
  const [realBio, setRealBio] = useState('')
  const [realAvatar, setRealAvatar] =
    useState<File | null>(null)

  // ================= PSEUDO =================
  const [pseudoId, setPseudoId] = useState('')
  const [pseudoBio, setPseudoBio] = useState('')
  const [pseudoAvatar, setPseudoAvatar] =
    useState<File | null>(null)

  const [loading, setLoading] = useState(false)

  // ================= UPLOAD AVATAR =================
  async function uploadAvatar(file: File, type: 'REAL' | 'PSEUDO') {
    const ext = file.name.split('.').pop()

    const fileName = `${Date.now()}-${Math.random()}.${ext}`

    const filePath = `${type}/${fileName}`

    const { error } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file)

    if (error) {
        console.log(error)
        return ''
    }

    const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath)

    return data.publicUrl
    }

  // ================= SUBMIT =================
  async function handleSubmit() {

    try {

      setLoading(true)

      // ================= CREATE USER =================
      const localUserId = crypto.randomUUID()

      const { data: userData, error: userError } =
        await supabase
          .from('users')
          .insert({
            local_user_id: localUserId
          })
          .select()
          .single()

      if (userError || !userData) {
        console.log(userError)
        alert('Create user failed')
        return
      }

      // save local identity
      localStorage.setItem(
        'local_user_id',
        localUserId
      )

      // ================= UPLOAD REAL AVATAR =================
      let realAvatarUrl = ''

      if (realAvatar) {
        realAvatarUrl =
          await uploadAvatar(realAvatar, "REAL")
      }

      // ================= UPLOAD PSEUDO AVATAR =================
      let pseudoAvatarUrl = ''

      if (pseudoAvatar) {
        pseudoAvatarUrl =
          await uploadAvatar(pseudoAvatar, "PSEUDO")
      }

      // ================= CREATE REAL PROFILE =================
      const { data: realProfile } =
        await supabase
          .from('profiles')
          .insert({
            user_id: userData.id,
            display_name: realId,
            bio: realBio,
            avatar_url: realAvatarUrl,
            profile_type: 'REAL'
          })
          .select()
          .single()

      // ================= CREATE PSEUDO PROFILE =================
      const { data: pseudoProfile } =
        await supabase
          .from('profiles')
          .insert({
            user_id: userData.id,
            display_name: pseudoId,
            bio: pseudoBio,
            avatar_url: pseudoAvatarUrl,
            profile_type: 'PSEUDO'
          })
          .select()
          .single()

      // ================= CREATE ANON PROFILE =================
      const { data: anonProfile } =
        await supabase
          .from('profiles')
          .insert({
            user_id: userData.id,
            display_name: 'Anonymous',
            profile_type: 'ANON'
          })
          .select()
          .single()

      // ================= ASSIGN DAILY IDENTITY =================
      const profiles = [
        realProfile,
        pseudoProfile,
        anonProfile
      ].filter(Boolean)

      const randomProfile =
        profiles[
          Math.floor(
            Math.random() * profiles.length
          )
        ]

      const today = new Date()
        .toISOString()
        .split('T')[0]

      await supabase
        .from('daily_identity')
        .insert({
          user_id: userData.id,
          profile_id: randomProfile.id,
          assigned_date: today
        })

      router.push('/feed')

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">

      {/* APP */}
      <div className="w-full max-w-md h-screen flex flex-col bg-white">

        {/* ================= HEAD ================= */}
        <div className="shrink-0 border-b px-4 py-3 bg-white">

          <p className="text-xl font-bold">
            Welcome
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Create your identities
          </p>

        </div>

        {/* ================= BODY ================= */}
        <div
          className="
            flex-1
            overflow-y-auto
            scrollbar-hide
            p-4
            space-y-8
          "
        >

          {/* ================= REAL ================= */}
          <div className="space-y-4">

            <div>

              <p className="font-semibold">
                REAL
              </p>

              <p className="text-sm text-gray-500">
                Your main identity
              </p>

            </div>

            {/* avatar */}
            <div>

              <label
                className="
                  block
                  border
                  rounded-2xl
                  p-4
                  text-center
                  text-sm
                "
              >

                Upload Avatar

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {

                    const file =
                      e.target.files?.[0]

                    if (file) {
                      setRealAvatar(file)
                    }

                  }}
                />

              </label>

            </div>

            {/* preview */}
            {realAvatar && (

              <img
                src={URL.createObjectURL(realAvatar)}
                className="
                  w-24
                  h-24
                  rounded-full
                  object-cover
                "
              />

            )}

            {/* id */}
            <input
              value={realId}
              onChange={(e) =>
                setRealId(e.target.value)
              }
              placeholder="ID"
              className="
                w-full
                border-b
                py-3
                outline-none
              "
            />

            {/* bio */}
            <textarea
              value={realBio}
              onChange={(e) =>
                setRealBio(e.target.value)
              }
              placeholder="Bio"
              className="
                w-full
                min-h-[100px]
                border-b
                py-3
                outline-none
                resize-none
              "
            />

          </div>

          {/* ================= PSEUDO ================= */}
          <div className="space-y-4">

            <div>

              <p className="font-semibold">
                PSEUDO
              </p>

              <p className="text-sm text-gray-500">
                Your alternate identity
              </p>

            </div>

            {/* avatar */}
            <div>

              <label
                className="
                  block
                  border
                  rounded-2xl
                  p-4
                  text-center
                  text-sm
                "
              >

                Upload Avatar

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {

                    const file =
                      e.target.files?.[0]

                    if (file) {
                      setPseudoAvatar(file)
                    }

                  }}
                />

              </label>

            </div>

            {/* preview */}
            {pseudoAvatar && (

              <img
                src={URL.createObjectURL(
                  pseudoAvatar
                )}
                className="
                  w-24
                  h-24
                  rounded-full
                  object-cover
                "
              />

            )}

            {/* id */}
            <input
              value={pseudoId}
              onChange={(e) =>
                setPseudoId(e.target.value)
              }
              placeholder="ID"
              className="
                w-full
                border-b
                py-3
                outline-none
              "
            />

            {/* bio */}
            <textarea
              value={pseudoBio}
              onChange={(e) =>
                setPseudoBio(e.target.value)
              }
              placeholder="Bio"
              className="
                w-full
                min-h-[100px]
                border-b
                py-3
                outline-none
                resize-none
              "
            />

          </div>

        </div>

        {/* ================= FOOT ================= */}
        <div
          className="
            shrink-0
            border-t
            bg-white
            p-3
          "
        >

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full
              bg-black
              text-white
              rounded-full
              py-3
              font-semibold
              disabled:opacity-50
            "
          >

            {loading
              ? 'Creating...'
              : 'Enter'}

          </button>

        </div>

      </div>

    </div>
  )
}