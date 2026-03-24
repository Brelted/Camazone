import { supabase } from '@/lib/supabase'
import HomeClient from '@/components/HomeClient'

export default async function Home() {
  const { data: produits } = await supabase
    .from('products')
    .select('*, categories(nom), users(nom, whatsapp)')
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  return <HomeClient produits={produits || []} categories={categories || []} />
}