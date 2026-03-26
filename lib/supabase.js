import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function formatWhatsApp(numero) {
  if (!numero) return null
  // Enlever tous les espaces, tirets, +
  let n = numero.replace(/[\s\-\+]/g, '')
  // Si commence par 00, remplacer par rien
  if (n.startsWith('00')) n = n.slice(2)
  // Si numéro camerounais à 9 chiffres, ajouter 237
  if (n.length === 9) n = '237' + n
  return n
}