'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OnboardingPage() {

  const router = useRouter()

  // ================= REAL =================
  const [realName, setRealName] = useState('')
  const [realBio, setRealBio] = useState('')
  const [realAvatar, setRealAvatar] = useState('')

  // ================= PSEUDO =================
  const [pseudoName, setPseudoName] = useState('')
  const [pseudoBio, setPseudoBio] = useState('')
  const [pseudoAvatar, setPseudoAvatar] = useState('')

  const [loading, setLoading] = useState(false)

  // ================= INIT =================
  useEffect(() => {
    checkExistingUser()
  }, [])

  async function checkExistingUser() {

    const localUserId = localStorage.getItem(
      'local_user_id'
    )

    if (!localUserId) return

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('local_user_id', localUserId)
      .single()

    if (!userData) {

      localStorage.removeItem('local_user_id')
      localStorage.removeItem('force_profile_type')

      return
    }

    router.push('/feed')
  }

  // ================= UPLOAD =================
  async function uploadAvatar(
    file: File,
    type: 'REAL' | 'PSEUDO'
  ) {

    const fileExt = file.name.split('.').pop()

    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const filePath = `${type}/${fileName}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (error) {
      console.error(error)
      alert('圖片上傳失敗')
      return null
    }

    const {
      data: { publicUrl }
    } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // ================= SUBMIT =================
  async function handleSubmit() {

    if (!realName || !pseudoName) {
      alert('請填寫名字')
      return
    }

    setLoading(true)

    try {

      const localUserId = crypto.randomUUID()

      // ================= CREATE USER =================
      const { data: user, error: userError } =
        await supabase
          .from('users')
          .insert({
            local_user_id: localUserId
          })
          .select()
          .single()

      if (userError || !user) {
        console.error(userError)
        alert('建立 user 失敗')
        setLoading(false)
        return
      }

      // ================= REAL PROFILE =================
      await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          profile_type: 'REAL',
          display_name: realName,
          bio: realBio,
          avatar_url: realAvatar
        })

      // ================= PSEUDO PROFILE =================
      await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          profile_type: 'PSEUDO',
          display_name: pseudoName,
          bio: pseudoBio,
          avatar_url: pseudoAvatar
        })

      // ================= ANON PROFILE =================
      await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          profile_type: 'ANON',
          display_name: '匿名'
        })

      // ================= SAVE =================
      localStorage.setItem(
        'local_user_id',
        localUserId
      )

      localStorage.removeItem(
        'force_profile_type'
      )

      router.push('/feed')

    } catch (err) {

      console.error(err)
      alert('發生錯誤')

    }

    setLoading(false)
  }

  return (

    <div className="min-h-screen bg-gray-100 flex justify-center">

      <div className="w-full max-w-md bg-white min-h-screen p-4 space-y-6">

        {/* TITLE */}
        <div>
          <h1 className="text-2xl font-bold">
            Create Your Accounts
          </h1>

          <p className="text-sm text-gray-500">
            設定你的大帳與小帳
          </p>
        </div>

        {/* ================= REAL ================= */}
        <div className="space-y-3 border rounded-2xl p-4">

          <h2 className="font-bold">
            大帳（REAL）
          </h2>

          <input
            value={realName}
            onChange={(e) =>
              setRealName(e.target.value)
            }
            placeholder="名字"
            className="w-full border rounded-xl p-3"
          />

          <input
            value={realBio}
            onChange={(e) =>
              setRealBio(e.target.value)
            }
            placeholder="個人簡介"
            className="w-full border rounded-xl p-3"
          />

          {/* REAL AVATAR */}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {

              const file = e.target.files?.[0]

              if (!file) return

              const url = await uploadAvatar(
                file,
                'REAL'
              )

              if (url) {
                setRealAvatar(url)
              }
            }}
          />

          {realAvatar && (
            <img
              src={realAvatar}
              className="w-20 h-20 rounded-full object-cover"
            />
          )}

        </div>

        {/* ================= PSEUDO ================= */}
        <div className="space-y-3 border rounded-2xl p-4">

          <h2 className="font-bold">
            小帳（PSEUDO）
          </h2>

          <input
            value={pseudoName}
            onChange={(e) =>
              setPseudoName(e.target.value)
            }
            placeholder="匿名 ID"
            className="w-full border rounded-xl p-3"
          />

          <input
            value={pseudoBio}
            onChange={(e) =>
              setPseudoBio(e.target.value)
            }
            placeholder="個人簡介"
            className="w-full border rounded-xl p-3"
          />

          {/* PSEUDO AVATAR */}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {

              const file = e.target.files?.[0]

              if (!file) return

              const url = await uploadAvatar(
                file,
                'PSEUDO'
              )

              if (url) {
                setPseudoAvatar(url)
              }
            }}
          />

          {pseudoAvatar && (
            <img
              src={pseudoAvatar}
              className="w-20 h-20 rounded-full object-cover"
            />
          )}

        </div>

        {/* ================= ANON ================= */}
        <div className="border rounded-2xl p-4 bg-gray-50">

          <h2 className="font-bold mb-1">
            匿名帳號（ANON）
          </h2>

          <p className="text-sm text-gray-500">
            系統將自動建立匿名身份。
          </p>

        </div>

        {/* ================= SUBMIT ================= */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white rounded-2xl p-4 font-bold"
        >
          {loading
            ? 'Creating...'
            : '開始使用'}
        </button>

      </div>

    </div>
  )
}