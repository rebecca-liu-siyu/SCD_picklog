'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AnonPage() {

  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {

    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          profile_type
        )
      `)
      .order('created_at', {
        ascending: false
      })

    const anonPosts = data?.filter(
      p => p.profiles?.profile_type === 'ANON'
    )

    setPosts(anonPosts || [])
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">

      <h1 className="text-2xl font-bold">
        匿名
      </h1>

      {posts.map(post => (
        <div
          key={post.id}
          className="border rounded-2xl overflow-hidden"
        >

          {post.image_url && (
            <img
              src={post.image_url}
              className="w-full aspect-square object-cover"
            />
          )}

          <div className="p-3">
            {post.content}
          </div>

        </div>
      ))}

    </div>
  )
}