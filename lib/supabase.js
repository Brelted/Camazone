import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function formatWhatsApp(numero) {
  if (!numero) return null
  let n = numero.replace(/[\s\-\+]/g, '')
  if (n.startsWith('00')) n = n.slice(2)
  if (n.length === 9) n = '237' + n
  return n
}