'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {

  const router = useRouter()

  // ================= ACCOUNT =================
  const [password, setPassword] = useState('')

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

  const routerPush = useRouter()

  // ================= UPLOAD =================
  async function uploadAvatar(
    file: File,
    type: 'REAL' | 'PSEUDO'
  ) {

    const ext = file.name.split('.').pop()

    const fileName =
      `${Date.now()}-${Math.random()}.${ext}`

    const filePath =
      `${type}/${fileName}`

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

      // ================= USER COUNT =================
      const { count } = await supabase
        .from('users')
        .select('*', {
          count: 'exact',
          head: true
        })

      const userCount = count || 0

      // ================= ASSIGN IDENTITY =================
      const identities = [
        'REAL',
        'PSEUDO',
        'ANON'
      ]

      const assignedIdentity =
        identities[userCount % 3]

      // ================= CREATE USER =================
      const { data: userData, error: userError } =
        await supabase
          .from('users')
          .insert({
            pwd: password,
            identity: assignedIdentity
          })
          .select()
          .single()

      if (userError || !userData) {

        console.log(userError)

        alert('Create user failed')
        return
      }

      // save login
      localStorage.setItem(
        'user_id',
        userData.id
      )

      // ================= AVATAR =================
      let realAvatarUrl = ''
      let pseudoAvatarUrl = ''

      if (realAvatar) {
        realAvatarUrl =
          await uploadAvatar(
            realAvatar,
            'REAL'
          )
      }

      if (pseudoAvatar) {
        pseudoAvatarUrl =
          await uploadAvatar(
            pseudoAvatar,
            'PSEUDO'
          )
      }

      // ================= REAL PROFILE =================
      await supabase
        .from('profiles')
        .insert({
          user_id: userData.id,
          display_name: realId,
          bio: realBio,
          avatar_url: realAvatarUrl,
          profile_type: 'REAL'
        })

      // ================= PSEUDO PROFILE =================
      await supabase
        .from('profiles')
        .insert({
          user_id: userData.id,
          display_name: pseudoId,
          bio: pseudoBio,
          avatar_url: pseudoAvatarUrl,
          profile_type: 'PSEUDO'
        })

      // ================= ANON PROFILE =================
      await supabase
        .from('profiles')
        .insert({
          user_id: userData.id,
          display_name: 'Anonymous',
          profile_type: 'ANON'
        })

      routerPush.push('/feed')

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">

      <div className="w-full max-w-md h-screen flex flex-col bg-white">

        {/* ================= HEAD ================= */}
        <div className="shrink-0 border-b px-4 py-3 bg-white relative">

          <button
            onClick={() => router.push('/login')}
            className="
              absolute
              right-4
              top-3
              text-sm
              font-semibold
              text-blue-500
            "
          >
            Login
          </button>

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

          {/* PASSWORD */}
          <div className="space-y-2">

            <p className="font-semibold">
              Password
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              className="
                w-full
                border-b
                py-3
                outline-none
              "
            />

          </div>

          {/* ================= REAL ================= */}
          <div className="space-y-4">

            <p className="font-semibold">
              REAL
            </p>

            <label className="
              block
              border
              rounded-2xl
              p-4
              text-center
              text-sm
            ">

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

            <p className="font-semibold">
              PSEUDO
            </p>

            <label className="
              block
              border
              rounded-2xl
              p-4
              text-center
              text-sm
            ">

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
        <div className="
          shrink-0
          border-t
          bg-white
          p-3
        ">

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