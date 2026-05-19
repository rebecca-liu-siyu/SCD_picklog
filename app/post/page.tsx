'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PostPage() {

  const router = useRouter()

  const [identity, setIdentity] = useState<any>(null)

  const [content, setContent] = useState('')
  const [imageFile, setImageFile] =
    useState<File | null>(null)

  const [previewUrl, setPreviewUrl] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    loadIdentity()
  }, [])

  // ================= LOAD IDENTITY =================
  async function loadIdentity() {

    const localUserId = localStorage.getItem(
      'local_user_id'
    )

    if (!localUserId) return

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('local_user_id', localUserId)
      .single()

    if (!user) return

    const today = new Date()
      .toISOString()
      .split('T')[0]

    const { data } = await supabase
      .from('daily_identity')
      .select(`
        *,
        profiles (
          id,
          display_name,
          avatar_url,
          profile_type
        )
      `)
      .eq('user_id', user.id)
      .eq('assigned_date', today)
      .single()

    if (!data) return

    setIdentity({
      user_id: user.id,
      profile_id: data.profile_id,
      profile: data.profiles
    })
  }

  // ================= IMAGE CHANGE =================
  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = e.target.files?.[0]

    if (!file) return

    setImageFile(file)

    const localUrl =
      URL.createObjectURL(file)

    setPreviewUrl(localUrl)
  }

  // ================= CREATE POST =================
  async function createPost() {

    if (!identity) return

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

      // ===== upload image =====
      const fileExt =
        imageFile.name.split('.').pop()

      const fileName =
        `${Date.now()}.${fileExt}`

      const filePath =
        `posts/${identity.user_id}/${fileName}`

      const { error: uploadError } =
        await supabase.storage
          .from('post-images')
          .upload(filePath, imageFile)

      if (uploadError) {
        console.log(uploadError)
        alert('Upload failed')
        return
      }

      // ===== get public url =====
      const { data: publicUrlData } =
        supabase.storage
          .from('post-images')
          .getPublicUrl(filePath)

      const imageUrl =
        publicUrlData.publicUrl

      // ===== insert post =====
      const { error: insertError } =
        await supabase
          .from('posts')
          .insert({
            user_id: identity.user_id,
            profile_id: identity.profile_id,
            image_url: imageUrl,
            content
          })

      if (insertError) {
        console.log(insertError)
        alert('Create post failed')
        return
      }

      router.push('/feed')

    } catch (err) {

      console.log(err)
      alert('Something went wrong')

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

          <div className="flex items-center justify-between">

            <button
              onClick={() => router.push('/feed')}
              className="text-sm"
            >
              Cancel
            </button>

            <p className="font-semibold">
              New Post
            </p>

            <button
              onClick={createPost}
              disabled={loading}
              className="
                text-sm
                font-semibold
                text-blue-500
                disabled:opacity-50
              "
            >
              {loading
                ? 'Posting...'
                : 'Post'}
            </button>

          </div>

        </div>

        {/* ================= BODY ================= */}
        <div
          className="
            flex-1
            overflow-y-auto
            p-4
            space-y-5
          "
        >

          {/* identity */}
          {identity?.profile && (

            <div className="flex items-center gap-3">

              {identity.profile.avatar_url ? (

                <img
                  src={
                    identity.profile.avatar_url
                  }
                  className="
                    w-12
                    h-12
                    rounded-full
                    object-cover
                  "
                />

              ) : (

                <div className="w-12 h-12 rounded-full bg-gray-300" />

              )}

              <div>

                <p className="font-semibold">
                  {identity.profile.display_name}
                </p>

                <p className="text-xs text-gray-500">
                  {
                    identity.profile
                      .profile_type
                  }
                </p>

              </div>

            </div>

          )}

          {/* upload */}
          <div>

            <label
              className="
                w-full
                aspect-square
                border-2
                border-dashed
                rounded-3xl
                flex
                items-center
                justify-center
                overflow-hidden
                cursor-pointer
                bg-gray-50
              "
            >

              {previewUrl ? (

                <img
                  src={previewUrl}
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              ) : (

                <div className="text-center">

                  <p className="text-4xl mb-2">
                    ＋
                  </p>

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

          </div>

          {/* content */}
          <div>

            <textarea
              value={content}
              onChange={e =>
                setContent(e.target.value)
              }
              placeholder="Write a caption..."
              className="
                w-full
                min-h-[160px]
                border
                rounded-2xl
                p-4
                resize-none
                outline-none
                text-sm
                leading-6
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
            className="
              text-2xl
              font-semibold
            "
          >
            ＋
          </button>

          <button
            onClick={() => router.push('/users')}
            className="text-sm"
          >
            Users
          </button>

        </div>

      </div>

    </div>
  )
}