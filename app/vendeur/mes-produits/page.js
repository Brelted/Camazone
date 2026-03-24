'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'
import { t } from '@/lib/translations'

export default function MesProduits() {
  const router = useRouter()
  const { lang } = useTheme()
  const tx = t[lang]
  const [produits, setProduits] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const chargerProduits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }
      const { data } = await supabase
        .from('products')
        .select('*, categories(nom)')
        .eq('vendeur_id', user.id)
        .order('created_at', { ascending: false })
      setProduits(data || [])
      setChargement(false)
    }
    chargerProduits()
  }, [])

  const supprimer = async (id) => {
    const msg = lang === 'fr' ? 'Supprimer ce produit ?' : 'Delete this product?'
    if (!confirm(msg)) return
    await supabase.from('products').delete().eq('id', id)
    setProduits(produits.filter(p => p.id !== id))
  }

  if (chargement) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <p style={{ color: 'var(--or)' }}>Chargement...</p>
    </div>
  )

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="17" cy="20" r="15" fill="#C8841A"/>
            <circle cx="22" cy="17" r="11" fill="#1a1a1a"/>
          </svg>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', color: 'var(--or-dark)' }}>
            {tx.nav.mesProduits}
          </h1>
        </div>
        <a href="/vendeur/ajouter-produit" style={addBtnStyle}>
          {tx.nav.ajouter}
        </a>
      </div>

      {/* Stats */}
      <div style={statsStyle}>
        <div style={statCardStyle}>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
            {lang === 'fr' ? 'Total produits' : 'Total products'}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#C8841A' }}>{produits.length}</p>
        </div>
        <div style={statCardStyle}>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
            {lang === 'fr' ? 'En stock' : 'In stock'}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1D9E75' }}>
            {produits.filter(p => p.stock > 0).length}
          </p>
        </div>
        <div style={statCardStyle}>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
            {lang === 'fr' ? 'Rupture de stock' : 'Out of stock'}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#E85D24' }}>
            {produits.filter(p => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Liste produits */}
      {produits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text2)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</p>
          <p>{lang === 'fr' ? "Vous n'avez pas encore de produits." : "You don't have any products yet."}</p>
          <a href="/vendeur/ajouter-produit" style={{ ...addBtnStyle, display: 'inline-block', marginTop: '1rem' }}>
            {tx.nav.ajouter}
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {produits.map(produit => (
            <div key={produit.id} style={rowStyle}>
              {/* Photo */}
              <div style={rowImgStyle}>
                {produit.photos?.[0] ? (
                  <img src={produit.photos[0]} alt={produit.nom}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                )}
              </div>

              {/* Infos */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', color: '#C8841A', fontWeight: '700', textTransform: 'uppercase' }}>
                  {produit.categories?.nom}
                </p>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0.2rem 0' }}>{produit.nom}</h3>
                <p style={{ fontWeight: '700', color: '#E85D24' }}>
                  {produit.prix.toLocaleString()} FCFA
                </p>
              </div>

              {/* Stock + actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ ...stockBadge(produit.stock > 0) }}>
                  {lang === 'fr' ? 'Stock' : 'Stock'} : {produit.stock}
                </span>
                <button onClick={() => supprimer(produit.id)} style={deleteBtnStyle}>
                  🗑️ {lang === 'fr' ? 'Supprimer' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

const addBtnStyle = {
  padding: '0.6rem 1.2rem', background: '#C8841A',
  color: 'white', borderRadius: '8px',
  textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem',
}
const statsStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
  gap: '1rem', marginBottom: '2rem',
}
const statCardStyle = {
  background: 'var(--card-bg)', border: '1px solid var(--border)',
  borderRadius: '10px', padding: '1rem',
  borderTop: '3px solid #C8841A', textAlign: 'center',
}
const rowStyle = {
  display: 'flex', alignItems: 'center', gap: '1rem',
  background: 'var(--card-bg)', border: '1px solid var(--border)',
  borderRadius: '10px', padding: '1rem',
  borderLeft: '4px solid #C8841A',
}
const rowImgStyle = {
  width: '70px', height: '70px', borderRadius: '8px',
  background: 'var(--bg2)', overflow: 'hidden',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}
const stockBadge = (enStock) => ({
  padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
  background: enStock ? '#DCFCE7' : '#FEE2E2',
  color: enStock ? '#166534' : '#991B1B',
})
const deleteBtnStyle = {
  padding: '0.4rem 0.8rem', background: 'transparent',
  color: '#E85D24', border: '1px solid #E85D24',
  borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
}