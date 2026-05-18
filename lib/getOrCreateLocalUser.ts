import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'

export async function getOrCreateLocalUser() {
  let localUserId = localStorage.getItem('local_user_id')

  // 1. 沒有就生成
  if (!localUserId) {
    localUserId = uuidv4()
    localStorage.setItem('local_user_id', localUserId)
  }

  // 2. 查 Supabase 有沒有這個 user
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('local_user_id', localUserId)
    .single()

  if (existing) {
    return existing
  }

  // 3. 沒有 → 建立 user
  const { data: newUser } = await supabase
    .from('users')
    .insert({
      local_user_id: localUserId
    })
    .select()
    .single()

  // 4. 幫他建立 3 個 profiles
  if (newUser) {
    await supabase.from('profiles').insert([
      {
        user_id: newUser.id,
        profile_type: 'REAL',
        display_name: 'Real Name'
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
  }

  return newUser
}