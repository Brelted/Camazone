import { supabase } from '@/lib/supabase'
import BoutiqueClient from '@/components/BoutiqueClient'

export default async function Boutique({ params }) {
  const id = (await params).id

  const { data: vendeur } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  const { data: produits } = await supabase
    .from('products')
    .select('*, categories(nom)')
    .eq('vendeur_id', id)
    .order('created_at', { ascending: false })

  if (!vendeur) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ fontSize: '3rem' }}>😕</p>
      <p>Boutique introuvable.</p>
      <a href="/catalogue" style={{ color: '#C8841A' }}>← Retour au catalogue</a>
    </div>
  )

  return <BoutiqueClient vendeur={vendeur} produits={produits || []} />
}