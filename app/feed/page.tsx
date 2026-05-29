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

  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // ================= INIT =================
  useEffect(() => {
    loadUser()
    loadPosts()
  }, [])

  // load comments + likes when post changes
  useEffect(() => {

    if (posts[index]) {

      loadComments(posts[index].id)
      loadLikes(posts[index].id)

    }

  }, [posts, index])

  // ================= USER =================
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
      .order('created_at', {
        ascending: false
      })

    if (data) {
      setPosts(data)
      setIndex(0)
    }
  }

  // ================= COMMENTS =================
  async function loadComments(postId: string) {

    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url,
          profile_type
        )
      `)
      .eq('post_id', postId)
      .order('created_at', {
        ascending: true
      })

    if (data) {
      setComments(data)
    }
  }

  // ================= LIKES =================
  async function loadLikes(postId: string) {

    if (!profile) return

    // total likes
    const { count } = await supabase
      .from('likes')
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('post_id', postId)

    setLikeCount(count || 0)

    // current liked
    const { data } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('profile_id', profile.id)
      .maybeSingle()

    setLiked(!!data)
  }

  // ================= TOGGLE LIKE =================
  async function toggleLike() {

    const post = posts[index]

    if (!post || !profile || !user) return

    // unlike
    if (liked) {

      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('profile_id', profile.id)

      setLiked(false)
      setLikeCount(prev => Math.max(prev - 1, 0))

    } else {

      // like
      await supabase
        .from('likes')
        .insert({
          post_id: post.id,
          user_id: user.id,
          profile_id: profile.id
        })

      setLiked(true)
      setLikeCount(prev => prev + 1)

    }
  }

  // ================= CREATE COMMENT =================
  async function createComment() {

    if (!commentText.trim()) return

    const post = posts[index]

    if (!post || !user || !profile) return

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        user_id: user.id,
        profile_id: profile.id,
        content: commentText
      })

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    setCommentText('')

    loadComments(post.id)
  }

  const post = posts[index]

  return (
    <div className="h-screen overflow-hidden flex justify-center bg-white">

      <div className="w-full max-w-md h-screen flex flex-col overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="shrink-0 border-b p-3 flex items-center gap-3 bg-white">

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
        <div className="flex-1 overflow-y-auto relative">

          {post ? (

            <div className="p-4 pb-32">

              {/* post profile */}
              <div className="flex items-center gap-2 mb-3">

                {post.profiles?.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-300" />
                )}

                <div>
                  <p className="font-semibold text-sm">
                    {post.profiles?.display_name}
                  </p>

                  <p className="text-xs text-gray-400">
                    {post.profiles?.profile_type}
                  </p>
                </div>

              </div>

              {/* image */}
              {post.image_url && (
                <img
                  src={post.image_url}
                  className="w-full rounded-2xl"
                />
              )}

              {/* like */}
              <div className="mt-4 flex items-center gap-3">

                <button
                  onClick={toggleLike}
                  className="text-2xl z-5"
                >
                  {liked ? '❤️' : '🤍'}
                </button>

                <p className="text-sm text-gray-600">
                  {likeCount} likes
                </p>

              </div>

              {/* content */}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                {post.content}
              </p>

              {/* ================= COMMENTS ================= */}
              <div className="mt-8 space-y-4 z-10">

                <p className="font-semibold text-sm">
                  Comments
                </p>

                {comments.map(comment => (

                  <div
                    key={comment.id}
                    className="flex gap-3"
                  >

                    {comment.profiles?.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0" />
                    )}

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <p className="font-semibold text-sm">
                          {comment.profiles?.display_name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {comment.profiles?.profile_type}
                        </p>

                      </div>

                      <p className="text-sm whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          ) : (

            <div className="p-4">
              No posts
            </div>

          )}

          {/* LEFT */}
          <div
            onClick={() =>
              setIndex(prev =>
                prev > 0 ? prev - 1 : prev
              )
            }
            className="absolute left-0 top-0 w-1/3 h-full z-10"
          />

          {/* RIGHT */}
          <div
            onClick={() =>
              setIndex(prev =>
                prev < posts.length - 1
                  ? prev + 1
                  : prev
              )
            }
            className="absolute right-0 top-0 w-1/3 h-full z-10"
          />

          {/* ================= FLOAT COMMENT ================= */}
          <div
            className="
              sticky
              bottom-0
              left-0
              right-0
              bg-white/90
              backdrop-blur
              border-t
              p-3
            "
          >

            <div className="flex gap-2">

              <input
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }
                placeholder="Write a comment..."
                className="
                  flex-1
                  border
                  rounded-full
                  px-4
                  py-2
                  text-sm
                  outline-none
                "
              />

              <button
                onClick={createComment}
                className="
                  px-4
                  rounded-full
                  bg-black
                  text-white
                  text-sm
                "
              >
                Send
              </button>

            </div>

          </div>

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
            className="text-sm font-semibold"
          >
            Users
          </button>

        </div>

      </div>

    </div>
  )
}