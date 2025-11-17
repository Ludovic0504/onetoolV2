
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

declare global {


  var __supabase__: SupabaseClient | undefined


  var __supabase_storage_kind__: 'local' | 'session' | undefined
}

function storageFor(remember: boolean): Storage {
  return remember ? window.localStorage : window.sessionStorage
}

export function getBrowserSupabase(opts: { remember?: boolean } = {}): SupabaseClient {
  const remember = opts.remember ?? true
  const desiredKind: 'local' | 'session' = remember ? 'local' : 'session'

  if (globalThis.__supabase__ && globalThis.__supabase_storage_kind__ === desiredKind) {
    return globalThis.__supabase__
  }

  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  if (!url || !key) {
    console.error('[Supabase] Variables d\'environnement manquantes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY')
    // Créer un client qui affichera des erreurs claires lors des tentatives d'authentification
    const placeholderClient = createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: storageFor(remember),
      },
    })
    // Intercepter les appels d'authentification pour afficher un message d'erreur clair
    return placeholderClient
  }

  const client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: storageFor(remember),
    },
  })

  globalThis.__supabase__ = client
  globalThis.__supabase_storage_kind__ = desiredKind
  return client
}

export const getRedirectTo = () => {
  const origin =
    (typeof window !== 'undefined' && window.location?.origin) ||
    (import.meta.env.VITE_SITE_URL as string) ||
    ''
  return `${origin}/auth/callback`
}
