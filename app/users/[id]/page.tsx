'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function UserProfilePage() {

  const params = useParams()
  const userId = params.id as string

  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    if (userId) {
      loadProfile()
      loadPosts()
    }
  }, [userId])

  // ================= PROFILE =================
  async function loadProfile() {

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!user) return

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)

    setProfile({
      user,
      profiles: profiles || []
    })
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
      .eq('profile_id', userId) // ⚠️ 可能要改（看你 schema）

    setPosts(data || [])
  }

  return (
    <div className="min-h-screen bg-white flex justify-center">

        <div className="w-full max-w-md">

        {/* ================= HEADER ================= */}
        <div className="p-4 border-b">

            {/* avatar + name */}
            <div className="flex items-center gap-3">

            {profile?.user && (
                <>
                {profile.profiles?.[0]?.avatar_url ? (
                    <img
                    src={profile.profiles[0].avatar_url}
                    className="w-14 h-14 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-300" />
                )}

                <div>

                    <p className="font-bold text-base">
                    {profile.user?.local_user_id}
                    </p>

                    <p className="text-xs text-gray-500">
                    {profile.profiles?.[0]?.profile_type}
                    </p>

                </div>
                </>
            )}

            </div>

        </div>

        {/* ================= POSTS ================= */}
        <div className="p-4 space-y-6">

            {posts.length === 0 && (
            <p className="text-gray-400 text-center">
                No posts yet
            </p>
            )}

            {posts.map((post) => (

            <div key={post.id} className="space-y-2">

                {/* user */}
                <div className="flex items-center gap-2">

                {post.profiles?.avatar_url ? (
                    <img
                    src={post.profiles.avatar_url}
                    className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                )}

                <p className="text-sm font-medium">
                    {post.profiles?.display_name}
                </p>

                </div>

                {/* image */}
                {post.image_url && (
                <img
                    src={post.image_url}
                    className="w-full rounded-xl object-cover"
                />
                )}

                {/* text */}
                <p className="text-sm whitespace-pre-wrap break-words">
                {post.content}
                </p>

            </div>

            ))}

        </div>

        </div>

    </div>
    )
}