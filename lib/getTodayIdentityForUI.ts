import { supabase } from './supabase'

export async function getTodayIdentityForUI(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_identity')
    .select(`
      *,
      profiles (
        display_name,
        profile_type
      )
    `)
    .eq('user_id', userId)
    .eq('assigned_date', today)
    .single()

  return data
}