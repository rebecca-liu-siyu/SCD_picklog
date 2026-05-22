'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  image_url: string
  content: string
  created_at: string
}

export default function AnonPage() {

  const router = useRouter()

  const [posts, setPosts] =
    useState<Post[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  // ================= LOAD POSTS =================
  async function loadPosts() {

    setLoading(true)

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!inner (
          profile_type
        )
      `)
      .eq('profiles.profile_type', 'ANON')
      .order('created_at', {
        ascending: false
      })

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    setPosts(data || [])
    setLoading(false)
  }

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">

      {/* APP */}
      <div className="w-full max-w-md h-screen flex flex-col bg-white">

        {/* ================= HEAD ================= */}
        <div className="shrink-0 border-b px-4 py-3 bg-white">

          <div className="flex items-center gap-3">

            {/* anon avatar */}
            <div
              className="
                w-14
                h-14
                rounded-full
                bg-black
                flex
                items-center
                justify-center
                text-white
                text-2xl
              "
            >
              ?
            </div>

            {/* info */}
            <div>

              <p className="text-xl font-bold">
                Anonymous
              </p>

              <p className="text-sm text-gray-500 mt-1">
                All anonymous posts
              </p>

            </div>

          </div>

        </div>

        {/* ================= BODY ================= */}
        <div
          className="
            flex-1
            overflow-y-auto
            scrollbar-hide
          "
        >

          {loading ? (

            <div
              className="
                h-full
                flex
                items-center
                justify-center
              "
            >

              <p className="text-gray-400">
                Loading...
              </p>

            </div>

          ) : posts.length > 0 ? (

            <div className="p-4 space-y-8">

              {posts.map(post => (

                <div key={post.id}>

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
                      text-sm
                      leading-6
                      whitespace-pre-wrap
                      break-words
                    "
                  >
                    {post.content}
                  </p>

                  {/* date */}
                  <p
                    className="
                      text-xs
                      text-gray-400
                      mt-3
                    "
                  >
                    {new Date(
                      post.created_at
                    ).toLocaleDateString()}
                  </p>

                </div>

              ))}

            </div>

          ) : (

            <div
              className="
                h-full
                flex
                items-center
                justify-center
              "
            >

              <p className="text-gray-400">
                No anonymous posts yet
              </p>

            </div>

          )}

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
            onClick={() => router.push('/post')}
            className="text-2xl"
          >
            ＋
          </button>

          <button
            onClick={() => router.push('/users')}
            className="
              text-sm
              font-semibold
            "
          >
            Users
          </button>

        </div>

      </div>

    </div>
  )
}