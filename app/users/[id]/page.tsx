'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

type Profile = {
  id: string
  display_name: string
  avatar_url: string
  bio: string
  profile_type: string
}

type Post = {
  id: string
  image_url: string
  content: string
  created_at: string
}

export default function UserProfilePage() {

  const router = useRouter()

  const params = useParams()

  const profileId = params.id as string

  const [profile, setProfile] =
    useState<Profile | null>(null)

  const [posts, setPosts] =
    useState<Post[]>([])

  useEffect(() => {

    if (!profileId) return

    loadProfile()
    loadPosts()

  }, [profileId])

  // ================= LOAD PROFILE =================
  async function loadProfile() {

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (error) {
      console.log(error)
      return
    }

    setProfile(data)
  }

  // ================= LOAD POSTS =================
  async function loadPosts() {

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', {
        ascending: false
      })

    if (error) {
      console.log(error)
      return
    }

    setPosts(data || [])
  }

  return (
    <div className="h-screen bg-white flex justify-center overflow-hidden">

      {/* APP */}
      <div className="w-full max-w-md h-screen flex flex-col bg-white">

        {/* ================= HEAD ================= */}
        <div className="shrink-0 border-b bg-white">

          {/* top bar */}
          <div
            className="
              px-4
              py-3
              flex
              items-center
              justify-between
            "
          >

            <button
              onClick={() => router.back()}
              className="text-sm"
            >
              Back
            </button>

            <p className="font-semibold">
              Profile
            </p>

            <div className="w-10" />

          </div>

          {/* profile */}
          {profile && (

            <div className="px-4 pb-5">

              <div className="flex gap-4">

                {/* avatar */}
                {profile.avatar_url ? (

                  <img
                    src={profile.avatar_url}
                    className="
                      w-24
                      h-24
                      rounded-full
                      object-cover
                      shrink-0
                    "
                  />

                ) : (

                  <div
                    className="
                      w-24
                      h-24
                      rounded-full
                      bg-gray-300
                      shrink-0
                    "
                  />

                )}

                {/* info */}
                <div className="flex-1 min-w-0">

                  <p
                    className="
                      text-xl
                      font-bold
                      break-words
                    "
                  >
                    {profile.display_name}
                  </p>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      mt-1
                    "
                  >
                    {profile.profile_type}
                  </p>

                  <p
                    className="
                      text-sm
                      mt-3
                      whitespace-pre-wrap
                      break-words
                      leading-6
                    "
                  >
                    {profile.bio || 'No bio yet'}
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>

        {/* ================= BODY ================= */}
        <div
          className="
            flex-1
            overflow-y-auto
            scrollbar-hide
          "
        >

          {posts.length > 0 ? (

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
                No posts yet
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