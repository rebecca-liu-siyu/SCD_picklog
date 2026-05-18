'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PostPage() {

  const router = useRouter()
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')

  async function handlePost() {

    const localUserId = localStorage.getItem('local_user_id')
    if (!localUserId) return

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('local_user_id', localUserId)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_type', 'REAL')
      .single()

    await supabase.from('posts').insert({
      content,
      image_url: image,
      profile_id: profile.id
    })

    router.push('/feed')
  }

  return (
    <div className="p-4 max-w-md mx-auto">

      <textarea
        className="w-full border p-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        className="mt-4 w-full border"
        onClick={handlePost}
      >
        Post
      </button>

    </div>
  )
}