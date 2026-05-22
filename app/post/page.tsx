'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PostPage() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadIdentity()
  }, [])

  // ================= LOAD IDENTITY =================
  async function loadIdentity() {

    const localUserId = localStorage.getItem('user_id')

    if (!localUserId) return

    // 1. get user
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', localUserId)
      .single()

    if (!userData) return

    setUser(userData)

    // 2. get profile by identity (REAL / PSEUDO / ANON)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.id)
      .eq('profile_type', userData.identity)
      .single()

    if (!profileData) {
      console.log('Profile not found for identity:', userData.identity)
      return
    }

    setProfile(profileData)
  }

  // ================= IMAGE =================
  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // ================= CREATE POST =================
  async function createPost() {

    if (!user || !profile) {
      alert('Missing user or profile')
      return
    }

    if (!content.trim()) {
      alert('Please write something')
      return
    }

    if (!imageFile) {
      alert('Please upload an image')
      return
    }

    try {

      setLoading(true)

      // ================= STORAGE PATH =================
      const ext = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`

      // ✔ 符合你的架構：post-images bucket
      const filePath = `${profile.profile_type}/${fileName}`

      // ================= UPLOAD =================
      const { error: uploadError } =
        await supabase.storage
          .from('post-images')
          .upload(filePath, imageFile)

      if (uploadError) {
        console.log(uploadError)
        alert(uploadError.message)
        return
      }

      // ================= PUBLIC URL =================
      const { data: publicUrlData } =
        supabase.storage
          .from('post-images')
          .getPublicUrl(filePath)

      const imageUrl = publicUrlData.publicUrl

      // ================= INSERT POST =================
      const { error: insertError } =
        await supabase.from('posts').insert({
          user_id: user.id,
          profile_id: profile.id,
          image_url: imageUrl,
          content
        })

      if (insertError) {
        console.log(insertError)
        alert(insertError.message)
        return
      }

      router.push('/feed')

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex justify-center bg-white">

      <div className="w-full max-w-md h-screen flex flex-col overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="shrink-0 border-b px-4 py-3 bg-white">

          <div className="flex items-center justify-between">

            <button onClick={() => router.push('/feed')}>
              Cancel
            </button>

            <p className="font-semibold">
              New Post
            </p>

            <button
              onClick={createPost}
              disabled={loading}
              className="text-blue-500 font-semibold"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>

          </div>

          {/* identity */}
          {profile && (
            <div className="flex items-center gap-3 mt-3">

              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300" />
              )}

              <div>
                <p className="font-semibold text-sm">
                  {profile.display_name}
                </p>

                <p className="text-xs text-gray-500">
                  {user?.identity}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* upload */}
          <label className="w-full aspect-square border-2 border-dashed rounded-3xl flex items-center justify-center bg-gray-50 overflow-hidden">

            {previewUrl ? (
              <img
                src={previewUrl}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <p className="text-4xl">＋</p>
                <p className="text-sm text-gray-500">
                  Upload Photo
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

          </label>

          {/* content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a caption..."
            className="w-full min-h-[160px] border rounded-2xl p-4 text-sm outline-none resize-none"
          />

        </div>

        {/* ================= FOOT ================= */}
        <div className="shrink-0 border-t flex justify-around p-3 bg-white">

          <button onClick={() => router.push('/feed')}>
            Home
          </button>

          <button className="text-2xl font-bold">
            ＋
          </button>

          <button onClick={() => router.push('/users')}>
            Users
          </button>

        </div>

      </div>

    </div>
  )
}