'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FeedPage() {

  const router = useRouter()

  const [posts, setPosts] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [identity, setIdentity] = useState<any>(null)

  useEffect(() => {
    loadIdentity()
    loadPosts()
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
          display_name,
          avatar_url,
          profile_type
        )
      `)
      .eq('user_id', user.id)
      .eq('assigned_date', today)
      .single()

    setIdentity(data)
  }

  // ================= LOAD POSTS =================
  async function loadPosts() {

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
      .order('created_at', {
        ascending: false
      })

    if (error) {
      console.log(error)
      return
    }

    if (!data) return

    const shuffled = [...data].sort(
      () => Math.random() - 0.5
    )

    setPosts(shuffled)
    setIndex(0)
  }

  // ================= NEXT POST =================
  function nextPost() {

    if (posts.length === 0) return

    setIndex(prev =>
      (prev + 1) % posts.length
    )
  }

  const post = posts[index]

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">

      {/* APP */}
      <div className="w-full max-w-md h-screen flex flex-col bg-white">

        {/* ================= HEAD ================= */}
        <div className="shrink-0 border-b px-4 py-3 bg-white">

          {identity?.profiles && (

            <div className="flex items-center gap-3">

              {/* avatar */}
              {identity.profiles.avatar_url ? (
                <img
                  src={identity.profiles.avatar_url}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300" />
              )}

              {/* info */}
              <div>

                <p className="text-xs text-gray-500">
                  TODAY IDENTITY
                </p>

                <p className="font-semibold leading-tight">
                  {identity.profiles.display_name}
                </p>

                <p className="text-xs text-gray-500">
                  {identity.profiles.profile_type}
                </p>

              </div>

            </div>

          )}

        </div>

        {/* ================= BODY ================= */}
        <div
          className="
            flex-1
            overflow-y-auto
            relative
            scrollbar-hide
          "
        >

          {post ? (

            <div className="p-4 pb-24">

              {/* post user */}
              <div className="flex items-center gap-3 mb-3">

                {post.profiles?.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    className="
                      w-10
                      h-10
                      rounded-full
                      object-cover
                    "
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300" />
                )}

                <div>

                  <p className="font-semibold text-sm">
                    {post.profiles?.display_name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {post.profiles?.profile_type}
                  </p>

                </div>

              </div>

              {/* image */}
              {post.image_url && (

                <img
                  src={post.image_url}
                  className="
                    w-full
                    rounded-2xl
                    object-cover
                    mb-4
                  "
                />

              )}

              {/* content */}
              <p
                className="
                  whitespace-pre-wrap
                  break-words
                  text-sm
                  leading-6
                "
              >
                {post.content}
              </p>

            </div>

          ) : (

            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">
                No posts
              </p>
            </div>

          )}

          {/* NEXT TAP AREA */}
          <div
            onClick={nextPost}
            className="
              absolute
              right-0
              top-0
              w-1/3
              h-full
            "
          />

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
            className="text-sm font-semibold"
          >
            Home
          </button>

          <button
            onClick={() => router.push('/post')}
            className="text-2xl"
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