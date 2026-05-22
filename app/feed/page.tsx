'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FeedPage() {

  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [posts, setPosts] = useState<any[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    loadUser()
    loadPosts()
  }, [])

  // ================= USER + IDENTITY =================
  async function loadUser() {

    const userId = localStorage.getItem('user_id')

    if (!userId) return

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!userData) return

    setUser(userData)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.id)
      .eq('profile_type', userData.identity)
      .single()

    setProfile(profileData)
  }

  // ================= POSTS =================
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
      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setPosts(shuffled)
      setIndex(0)
    }
  }

  function nextPost() {
    setIndex((prev) => (prev + 1) % posts.length)
  }

  const post = posts[index]

  return (
    <div className="h-screen flex justify-center bg-white">

      <div className="w-full max-w-md flex flex-col h-screen">

        {/* ================= HEADER ================= */}
        <div className="border-b p-3 flex items-center gap-3">

          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300" />
          )}

          <div>
            <p className="font-bold">
              {profile?.display_name || 'Loading...'}
            </p>

            <p className="text-xs text-gray-500">
              {user?.identity}
            </p>
          </div>

        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 relative p-4 overflow-y-auto">

          {post ? (
            <>
              <div className="flex items-center gap-2 mb-2">

                {post.profiles?.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300" />
                )}

                <p className="font-semibold text-sm">
                  {post.profiles?.display_name}
                </p>

                <span className="text-xs text-gray-400">
                  {post.profiles?.profile_type}
                </span>

              </div>

              {post.image_url && (
                <img
                  src={post.image_url}
                  className="w-full rounded-xl"
                />
              )}

              <p className="mt-3 whitespace-pre-wrap">
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

        {/* ================= FOOT ================= */}
        <div className="border-t flex justify-around p-3">
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