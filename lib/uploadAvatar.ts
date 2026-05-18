import { supabase } from './supabase'

export async function uploadAvatar(file: File, userId: string) {
  const fileName = `${userId}-${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  return data.publicUrl
}