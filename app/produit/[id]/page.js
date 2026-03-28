import { supabase } from '@/lib/supabase'
import ProduitClient from '@/components/ProduitClient'

export default async function FicheProduit({ params }) {
  const id = (await params).id

  console.log('ID reçu:', id) // pour déboguer

  const { data: produit, error } = await supabase
    .from('products')
    .select('*, categories(nom), users(id, nom, whatsapp)')
    .eq('id', id)
    .single()

  console.log('Produit:', produit)
  console.log('Erreur:', error)

  if (!produit) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ fontSize: '3rem' }}>😕</p>
      <p>Produit introuvable.</p>
      <a href="/catalogue" style={{ color: '#C8841A' }}>← Retour au catalogue</a>
    </div>
  )

  return <ProduitClient produit={produit} />
}