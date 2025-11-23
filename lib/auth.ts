import { supabase } from '../services/supabase';

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  return await supabase.auth.getUser();
}