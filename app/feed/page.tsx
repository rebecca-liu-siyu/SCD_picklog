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
  }, [])

  async function loadIdentity() {

    const localUserId = localStorage.getItem('local_user_id')
    if (!localUserId) return

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('local_user_id', localUserId)
      .single()

    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('daily_identity')
      .select(`
        *,
        profiles (*)
      `)
      .eq('user_id', user.id)
      .eq('assigned_date', today)
      .single()

    setIdentity(data)
    loadPosts(data?.profiles)
  }

  async function loadPosts(profile: any) {

    if (!profile) return

    let query = supabase
      .from('posts')
      .select(`*, profiles(*)`)

    if (profile.profile_type !== 'ANON') {
      query = query.eq('profile_id', profile.id)
    }

    const { data } = await query

    setPosts(data || [])
    setIndex(0)
  }

  function nextPost() {
    setIndex((prev) => (prev + 1) % posts.length)
  }

  const post = posts[index]

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col">

      {/* header */}
      <div className="p-3 border-b">
        <p className="text-xs text-gray-500">Today Identity</p>
        <p className="font-bold">
          {identity?.profiles?.display_name}
        </p>
      </div>

      {/* body */}
      <div className="flex-1 relative">

        {post && (
          <div className="p-4 space-y-3">

            <p className="font-semibold">
              {post.profiles?.display_name}
            </p>

            {post.image_url && (
              <img src={post.image_url} className="w-full rounded-xl" />
            )}

            <p className="text-sm whitespace-pre-wrap">
              {post.content}
            </p>

          </div>
        )}

        <div
          onClick={nextPost}
          className="absolute right-0 top-0 w-1/3 h-full"
        />
      </div>

      {/* footer */}
      <div className="border-t flex justify-around p-3">
        <button onClick={() => router.push('/feed')}>Home</button>
        <button onClick={() => router.push('/post')}>＋</button>
        <button onClick={() => router.push('/users')}>Users</button>
      </div>

    </div>
  )
}