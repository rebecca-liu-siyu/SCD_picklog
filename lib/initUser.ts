import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export async function initUser() {
  // 1. 取得或建立 local user id
  let localUserId = localStorage.getItem('local_user_id')

  if (!localUserId) {
    localUserId = uuidv4()
    localStorage.setItem('local_user_id', localUserId)
  }

  // 2. 查 Supabase 有沒有這個 user
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('local_user_id', localUserId)
    .maybeSingle()

  // 已存在 → 直接回傳
  if (existingUser) {
    return existingUser
  }

  // 3. 不存在 → 建立 user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      local_user_id: localUserId
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return null
  }

  // 4. 建立 3 個 profiles
  await supabase.from('profiles').insert([
    {
      user_id: newUser.id,
      profile_type: 'REAL',
      display_name: 'Real User'
    },
    {
      user_id: newUser.id,
      profile_type: 'PSEUDO',
      display_name: `user_${Math.floor(Math.random() * 9999)}`
    },
    {
      user_id: newUser.id,
      profile_type: 'ANON',
      display_name: '匿名'
    }
  ])

  return newUser
}