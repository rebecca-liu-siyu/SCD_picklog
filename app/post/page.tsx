'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTodayIdentity } from '@/lib/getTodayIdentity'
import { useRouter } from 'next/navigation'

export default function PostPage() {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePost() {
    if (!image) return

    setLoading(true)

    // 1. 取得 local user id
    const localUserId = localStorage.getItem('local_user_id')

    // 2. 找 user
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('local_user_id', localUserId)
        .single()

    if (!user) {
      alert('No user found')
      return
    }

    const identity = await getTodayIdentity(user.id)

    // 3. 找 profile（先固定 REAL）
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', identity.profile_id)
        .single()

    // 4. 上傳圖片
    const fileName = `${Date.now()}-${image.name}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, image)

    if (uploadError) {
      console.error(uploadError)
      return
    }

    // 5. 取得圖片 URL
    const { data: imageData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName)

    // 6. 建立 post
    await supabase.from('posts').insert({
      user_id: user.id,
      profile_id: profile?.id,
      image_url: imageData.publicUrl,
      content
    })

    alert('Post created!')
    router.push('/feed')

    setContent('')
    setImage(null)
    setLoading(false)
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">
        Create Post
      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setImage(e.target.files[0])
          }
        }}
      />

      <textarea
        className="w-full border p-3 rounded-lg"
        rows={4}
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={handlePost}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </main>
  )
}