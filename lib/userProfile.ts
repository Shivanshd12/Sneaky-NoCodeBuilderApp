
import { supabase } from '../services/supabase';

export async function saveUserProfile(userId: string, email: string, name: string, wantsNews: boolean = true) {
  // Using upsert to handle cases where the user might already exist 
  // (e.g. created by a trigger or previous failed attempt)
  const { error } = await supabase.from('users').upsert({
    id: userId,
    email,
    name,
    wants_news: wantsNews
  }, { onConflict: 'id' });
  
  if (error) {
    // Log the full error object so it's readable in console
    console.error("Supabase Profile Save Error:", JSON.stringify(error, null, 2));
  }
  
  return { error };
}
