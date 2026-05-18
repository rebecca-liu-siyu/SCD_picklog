'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function ProfilePage() {

  const { id } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      load()
    }
  }, [id])

  async function load() {

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)

    const { data: posts } = await supabase
      .from('posts')
      .select(`*, profiles(*)`)
      .eq('profile_id', profiles?.[0]?.id)

    setProfile({ user, profiles })
    setPosts(posts || [])
  }

  return (
    <div className="p-4">

      <h1>{profile?.user?.local_user_id}</h1>

      <p>
        {profile?.profiles?.[0]?.bio || 'No bio'}
      </p>

      {posts.map(p => (
        <div key={p.id} className="mt-4">
          <p>{p.content}</p>
        </div>
      ))}

    </div>
  )
}