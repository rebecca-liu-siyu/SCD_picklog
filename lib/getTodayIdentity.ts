import { supabase } from './supabase'

const forcedType = localStorage.getItem(
  'force_profile_type'
)

export async function getTodayIdentity(userId: string) {
    if (forcedType) {

    const { data: forcedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_type', forcedType)
      .single()

    return {
      profile_id: forcedProfile.id,
      profiles: forcedProfile
    }
  }
  const today = new Date().toISOString().split('T')[0]

  // 1. 查今天是否已經有身份
  const { data: existing } = await supabase
    .from('daily_identity')
    .select('*')
    .eq('user_id', userId)
    .eq('assigned_date', today)
    .maybeSingle()

  if (existing) {
    return existing
  }

  // 2. 沒有 → 讀 profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)

  if (!profiles || profiles.length === 0) {
    throw new Error('No profiles found')
  }

  // 3. 隨機挑一個身份
  const randomProfile =
    profiles[Math.floor(Math.random() * profiles.length)]

  // 4. 寫入 daily_identity
  const { data } = await supabase
    .from('daily_identity')
    .insert({
      user_id: userId,
      profile_id: randomProfile.id,
      assigned_date: today
    })
    .select()
    .single()

  return data
}