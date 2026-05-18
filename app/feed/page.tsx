'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  content: string
  image_url: string
  created_at: string
  profiles: {
    display_name: string
    avatar_url?: string
    profile_type?: string
  }
}

export default function FeedPage() {
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [index, setIndex] = useState(0)
  const [identity, setIdentity] = useState<any>(null)

  useEffect(() => {
    loadTodayIdentity()
    loadPosts()
  }, [])

  // ================= IDENTITY =================
  async function loadTodayIdentity() {

    const localUserId = localStorage.getItem('local_user_id')
    const forcedType = localStorage.getItem('force_profile_type')

    if (!localUserId) return

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('local_user_id', localUserId)
      .single()

    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    let { data } = await supabase
      .from('daily_identity')
      .select(`
        *,
        profiles (
          id,
          display_name,
          profile_type,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('assigned_date', today)
      .single()

    // force override（admin用）
    if (forcedType && data) {
      const { data: forcedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('profile_type', forcedType)
        .single()

      if (forcedProfile) {
        data.profiles = forcedProfile
      }
    }

    setIdentity(data)
  }

  // ================= POSTS (GLOBAL FEED) =================
  async function loadPosts() {

    const { data } = await supabase
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

    if (data) {
      setPosts(data)
      setIndex(0)
    }
  }

  function nextPost() {
    setIndex((prev) =>
      posts.length ? (prev + 1) % posts.length : 0
    )
  }

  const post = posts[index]

  return (
    <div className="h-screen w-full bg-gray-100 flex justify-center">

      {/* phone container */}
      <div className="w-full max-w-md bg-white h-full flex flex-col">

        {/* ================= HEADER ================= */}
        {identity && (
          <div className="h-14 border-b flex items-center justify-between px-4 bg-white shrink-0">

            <div>
              <p className="text-xs text-gray-500">
                Today Identity
              </p>

              <p className="font-bold text-sm">
                {identity.profiles?.display_name}
              </p>

              <p className="text-xs text-gray-400">
                {identity.profiles?.profile_type}
              </p>
            </div>

            {identity.profiles?.avatar_url && (
              <img
                src={identity.profiles.avatar_url}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}

          </div>
        )}

        {/* ================= BODY ================= */}
        <div className="flex-1 relative overflow-y-auto">

        {post ? (
            <div className="w-full px-4 py-6 space-y-4">

            {/* USER INFO */}
            <div className="flex items-center gap-3">

                {post.profiles?.avatar_url ? (
                <img
                    src={post.profiles.avatar_url}
                    className="w-9 h-9 rounded-full object-cover"
                />
                ) : (
                <div className="w-9 h-9 rounded-full bg-gray-300" />
                )}

                <p className="text-sm font-medium">
                {post.profiles?.display_name}
                </p>

            </div>

            {/* IMAGE */}
            {post.image_url && (
                <img
                src={post.image_url}
                className="w-full max-h-[60vh] object-cover rounded-xl"
                />
            )}

            {/* TEXT（重點修復） */}
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {post.content}
            </p>

            </div>
        ) : (
            <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No posts</p>
            </div>
        )}

        {/* NEXT CLICK AREA */}
        <div
            onClick={nextPost}
            className="absolute right-0 top-0 w-1/2 h-full"
        />

        </div>

        {/* ================= FOOT ================= */}
        <div className="h-14 border-t flex justify-around items-center bg-white shrink-0">

          <button onClick={() => router.push('/feed')}>
            Home
          </button>

          <button onClick={() => router.push('/post')}>
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