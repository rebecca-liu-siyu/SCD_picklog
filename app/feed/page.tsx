'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FeedPage() {

  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {

    // 🔥 先拿全部 posts（先確保有資料）
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url,
          profile_type
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('posts error:', error)
      return
    }

    if (!data) {
      setPosts([])
      return
    }

    // shuffle
    const shuffled = [...data].sort(() => Math.random() - 0.5)

    setPosts(shuffled)
    setIndex(0)
  }

  function nextPost() {
    setIndex((prev) => (prev + 1) % posts.length)
  }

  const post = posts[index]

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col">

      {/* BODY */}
      <div className="flex-1 relative p-4">

        {post ? (
          <>
            <p className="font-semibold">
              {post.profiles?.display_name}
            </p>

            {post.image_url && (
              <img
                src={post.image_url}
                className="w-full mt-2 rounded-xl"
              />
            )}

            <p className="mt-2 whitespace-pre-wrap">
              {post.content}
            </p>
          </>
        ) : (
          <p>No posts</p>
        )}

        <div
          onClick={nextPost}
          className="absolute right-0 top-0 w-1/3 h-full"
        />
      </div>

      {/* FOOT */}
      <div className="border-t flex justify-around p-3">
        <button onClick={() => router.push('/feed')}>Home</button>
        <button onClick={() => router.push('/post')}>＋</button>
        <button onClick={() => router.push('/users')}>Users</button>
      </div>

    </div>
  )
}