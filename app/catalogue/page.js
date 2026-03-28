'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { t } from '@/lib/translations'

export default function Catalogue() {
  const { lang } = useTheme()
  const tx = t[lang].catalogue
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [categorieActive, setCategorieActive] = useState('')
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const chargerDonnees = async () => {
      const { data: cats } = await supabase.from('categories').select('*')
      setCategories(cats || [])
      const { data: prods } = await supabase
        .from('products')
        .select('*, categories(nom), users(nom, whatsapp)')
        .order('created_at', { ascending: false })
      setProduits(prods || [])
      setChargement(false)
    }
    chargerDonnees()
  }, [])

  const produitsFiltres = produits.filter(p => {
    const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase())
    const matchCategorie = categorieActive === '' || p.categorie_id === categorieActive
    return matchRecherche && matchCategorie
  })

  const ouvrirWhatsApp = (produit) => {
    const msg = encodeURIComponent(
      lang === 'fr'
        ? `Bonjour ! Je suis intéressé(e) par : *${produit.nom}* à ${produit.prix.toLocaleString()} FCFA. Est-il disponible ?`
        : `Hello! I'm interested in: *${produit.nom}* at ${produit.prix.toLocaleString()} FCFA. Is it available?`
    )
    window.open(`https://wa.me/${produit.users?.whatsapp}?text=${msg}`, '_blank')
  }

  if (chargement) return (
    <div style={loadingStyle}>
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle cx="22" cy="25" r="18" fill="#C8841A" opacity="0.8"/>
        <circle cx="28" cy="21" r="13" fill="#1a1a1a"/>
      </svg>
      <p style={{ color: 'var(--or)', marginTop: '1rem' }}>Chargement...</p>
    </div>
  )

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

      {/* Titre */}
      <h1 style={pageTitleStyle}>🛒 {tx.titre}</h1>

      {/* Recherche */}
      <input
        type="text"
        placeholder={tx.recherche}
        value={recherche}
        onChange={e => setRecherche(e.target.value)}
        style={searchStyle}
      />

      {/* Filtres */}
      <div style={filtersStyle}>
        <button
          onClick={() => setCategorieActive('')}
          style={filterBtn(categorieActive === '')}>
          {tx.tout}
        </button>
        {categories.map(cat => (
          <button key={cat.id}
            onClick={() => setCategorieActive(cat.id)}
            style={filterBtn(categorieActive === cat.id)}>
            {cat.nom}
          </button>
        ))}
      </div>

      {/* Résultats */}
      <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        {produitsFiltres.length} {lang === 'fr' ? 'produit(s) trouvé(s)' : 'product(s) found'}
      </p>

      {produitsFiltres.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ fontSize: '3rem' }}>🔍</p>
          <p style={{ color: 'var(--text2)', marginTop: '1rem' }}>{tx.aucun}</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {produitsFiltres.map(produit => (
            <a key={produit.id} href={`/produit/${produit.id}`} style={{ ...cardStyle, textDecoration: 'none' }}>
              {/* Barre dorée */}
              <div style={{ height: '3px', background: '#C8841A' }} />

              {/* Photo */}
              <div style={cardImgStyle}>
                {produit.photos?.[0] ? (
                  <img src={produit.photos[0]} alt={produit.nom}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>🛍️</span>
                )}
              </div>

              {/* Infos */}
              <div style={{ padding: '0.9rem' }}>
                <p style={catLabelStyle}>{produit.categories?.nom}</p>
                <h3 style={cardNameStyle}>{produit.nom}</h3>
                <p style={vendeurStyle}>
                  {tx.vendeur} {produit.users?.nom}
                </p>
                <p style={priceStyle}>
                  {produit.prix.toLocaleString()} FCFA
                </p>
                <button onClick={(e) => { e.preventDefault(); ouvrirWhatsApp(produit) }} style={waBtnStyle}>
  {tx.contacter}
</button>
              </div>
          </a>
          ))}
        </div>
      )}
    </main>
  )
}

const loadingStyle = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  minHeight: '50vh',
}
const pageTitleStyle = {
  fontFamily: 'Georgia,serif', fontSize: '1.8rem',
  color: 'var(--or-dark)', marginBottom: '1.5rem',
}
const searchStyle = {
  width: '100%', padding: '0.8rem 1rem',
  border: '1px solid var(--border)',
  borderRadius: '8px', fontSize: '1rem',
  background: 'var(--card-bg)', color: 'var(--text)',
  marginBottom: '1rem', outline: 'none',
}
const filtersStyle = {
  display: 'flex', gap: '0.6rem',
  flexWrap: 'wrap', marginBottom: '1.2rem',
}
const filterBtn = (actif) => ({
  padding: '0.4rem 1rem',
  border: `1px solid ${actif ? '#C8841A' : 'var(--border)'}`,
  borderRadius: '20px', cursor: 'pointer',
  background: actif ? '#C8841A' : 'var(--card-bg)',
  color: actif ? 'white' : 'var(--text2)',
  fontSize: '0.85rem', fontWeight: actif ? '700' : '400',
  transition: 'all 0.2s',
})
const emptyStyle = {
  textAlign: 'center', padding: '4rem 2rem',
}
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
  gap: '1.2rem',
}
const cardStyle = {
  background: 'var(--card-bg)',
  border: '1px solid var(--border)',
  borderRadius: '10px', overflow: 'hidden',
  transition: 'border-color 0.2s',
}
const cardImgStyle = {
  height: '170px', background: 'var(--bg2)',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', overflow: 'hidden',
}
const catLabelStyle = {
  fontSize: '0.72rem', color: '#C8841A',
  fontWeight: '700', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: '0.3rem',
}
const cardNameStyle = {
  fontSize: '0.95rem', fontWeight: '700',
  color: 'var(--text)', marginBottom: '0.25rem',
}
const vendeurStyle = {
  fontSize: '0.8rem', color: 'var(--text2)',
  marginBottom: '0.5rem',
}
const priceStyle = {
  fontSize: '1.05rem', fontWeight: '700',
  color: '#E85D24', marginBottom: '0.8rem',
}
const waBtnStyle = {
  width: '100%', padding: '0.65rem',
  background: '#25D366', color: 'white',
  border: 'none', borderRadius: '8px',
  fontWeight: '700', fontSize: '0.88rem',
  cursor: 'pointer',
}