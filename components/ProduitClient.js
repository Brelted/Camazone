'use client'
import { useState, useEffect } from 'react'
import { supabase, formatWhatsApp } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'

export default function ProduitClient({ produit }) {
  const { lang } = useTheme()
  const [photoActive, setPhotoActive] = useState(0)
  const [estFavori, setEstFavori] = useState(false)
  const [userId, setUserId] = useState(null)
  const [favoriId, setFavoriId] = useState(null)

  useEffect(() => {
    const verifierFavori = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('favoris')
        .select('id')
        .eq('user_id', user.id)
        .eq('produit_id', produit.id)
        .single()
      if (data) {
        setEstFavori(true)
        setFavoriId(data.id)
      }
    }
    verifierFavori()
  }, [])

  const toggleFavori = async () => {
    if (!userId) { window.location.href = '/connexion'; return }
    if (estFavori) {
      await supabase.from('favoris').delete().eq('id', favoriId)
      setEstFavori(false)
      setFavoriId(null)
    } else {
      const { data } = await supabase.from('favoris').insert({
        user_id: userId,
        produit_id: produit.id,
      }).select().single()
      setEstFavori(true)
      setFavoriId(data.id)
    }
  }

  const ouvrirWhatsApp = () => {
    const numero = formatWhatsApp(produit.users?.whatsapp)
    const msg = encodeURIComponent(
      lang === 'fr'
        ? `Bonjour ! Je suis intéressé(e) par votre produit : *${produit.nom}* à ${produit.prix.toLocaleString()} FCFA. Est-il disponible ?`
        : `Hello! I'm interested in your product: *${produit.nom}* at ${produit.prix.toLocaleString()} FCFA. Is it available?`
    )
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank')
  }

  return (
    <main style={pageStyle}>

      {/* Retour */}
      <a href="/catalogue" style={backStyle}>
        ← {lang === 'fr' ? 'Retour au catalogue' : 'Back to catalogue'}
      </a>

      <div style={layoutStyle}>

        {/* Photos */}
        <div style={photosColStyle}>
          <div style={mainPhotoStyle}>
            {produit.photos?.[photoActive] ? (
              <img
                src={produit.photos[photoActive]}
                alt={produit.nom}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '4rem' }}>🛍️</span>
            )}
          </div>
          {/* Miniatures si plusieurs photos */}
          {produit.photos?.length > 1 && (
            <div style={thumbsStyle}>
              {produit.photos.map((photo, i) => (
                <div key={i} onClick={() => setPhotoActive(i)}
                  style={thumbStyle(i === photoActive)}>
                  <img src={photo} alt={`photo ${i+1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div style={infoColStyle}>

          {/* Catégorie */}
          <p style={catStyle}>{produit.categories?.nom}</p>

          {/* Nom */}
          <h1 style={nomStyle}>{produit.nom}</h1>

          {/* Prix */}
          <p style={prixStyle}>{produit.prix.toLocaleString()} FCFA</p>

          {/* Stock */}
          <div style={stockStyle(produit.stock > 0)}>
            {produit.stock > 0
              ? `✅ ${lang === 'fr' ? 'En stock' : 'In stock'} (${produit.stock})`
              : `❌ ${lang === 'fr' ? 'Rupture de stock' : 'Out of stock'}`}
          </div>

          {/* Description */}
          {produit.description && (
            <div style={descStyle}>
              <h3 style={descTitleStyle}>
                {lang === 'fr' ? 'Description' : 'Description'}
              </h3>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {produit.description}
              </p>
            </div>
          )}

          {/* Vendeur */}
          <a href={`/boutique/${produit.users?.id}`} style={vendeurCardStyle}>
            <div style={vendeurAvatarStyle}>
              {produit.users?.nom?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>
                {lang === 'fr' ? 'Vendu par' : 'Sold by'}
              </p>
              <p style={{ fontWeight: '700', color: 'var(--or-dark)', fontSize: '0.95rem' }}>
                {produit.users?.nom}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#C8841A' }}>
                {lang === 'fr' ? 'Voir la boutique →' : 'View shop →'}
              </p>
            </div>
          </a>

         {/* Boutons action */}
<div style={{ display: 'flex', gap: '10px' }}>
  <button onClick={toggleFavori} style={favBtnStyle(estFavori)}>
    {estFavori ? '❤️' : '🤍'}
    {estFavori
      ? (lang === 'fr' ? ' Retiré des favoris' : ' Remove from favorites')
      : (lang === 'fr' ? ' Ajouter aux favoris' : ' Add to favorites')}
  </button>
</div>

{/* Bouton WhatsApp */}
<button onClick={ouvrirWhatsApp} style={waBtnStyle}>
  💬 {lang === 'fr' ? 'Contacter le vendeur sur WhatsApp' : 'Contact seller on WhatsApp'}
</button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text2)', textAlign: 'center', marginTop: '0.5rem' }}>
            {lang === 'fr'
              ? 'Vous serez redirigé vers WhatsApp'
              : 'You will be redirected to WhatsApp'}
          </p>

        </div>
      </div>
    </main>
  )
}

const pageStyle = { maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }
const backStyle = { color: '#C8841A', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }
const layoutStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem',
}
const photosColStyle = { display: 'flex', flexDirection: 'column', gap: '0.8rem' }
const mainPhotoStyle = {
  width: '100%', aspectRatio: '1',
  background: 'var(--bg2)', borderRadius: '12px',
  overflow: 'hidden', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  border: '1px solid var(--border)',
}
const thumbsStyle = { display: 'flex', gap: '8px' }
const thumbStyle = (actif) => ({
  width: '60px', height: '60px', borderRadius: '8px',
  overflow: 'hidden', cursor: 'pointer',
  border: `2px solid ${actif ? '#C8841A' : 'var(--border)'}`,
})
const infoColStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const catStyle = {
  fontSize: '0.75rem', color: '#C8841A',
  fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
}
const nomStyle = {
  fontFamily: 'Georgia,serif', fontSize: '1.6rem',
  color: 'var(--text)', lineHeight: 1.3,
}
const prixStyle = {
  fontSize: '1.8rem', fontWeight: '700', color: '#E85D24',
}
const stockStyle = (enStock) => ({
  display: 'inline-block', padding: '0.4rem 1rem',
  borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700',
  background: enStock ? '#DCFCE7' : '#FEE2E2',
  color: enStock ? '#166534' : '#991B1B',
})
const descStyle = {
  background: 'var(--card-bg)', border: '1px solid var(--border)',
  borderRadius: '10px', padding: '1rem',
}
const descTitleStyle = {
  fontSize: '0.9rem', fontWeight: '700',
  color: 'var(--or-dark)', marginBottom: '0.5rem',
}
const vendeurCardStyle = {
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '1rem', background: 'var(--card-bg)',
  border: '1px solid var(--border)', borderRadius: '10px',
  borderLeft: '4px solid #C8841A', textDecoration: 'none',
}
const vendeurAvatarStyle = {
  width: '44px', height: '44px', borderRadius: '50%',
  background: '#C8841A', color: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.2rem', fontWeight: '700', flexShrink: 0,
}
const waBtnStyle = {
  width: '100%', padding: '1rem',
  background: '#25D366', color: 'white',
  border: 'none', borderRadius: '10px',
  fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
}

const favBtnStyle = (actif) => ({
  flex: 1, padding: '0.8rem',
  background: actif ? '#FEE2E2' : 'var(--card-bg)',
  color: actif ? '#991B1B' : 'var(--text2)',
  border: `1px solid ${actif ? '#E85D24' : 'var(--border)'}`,
  borderRadius: '10px', fontWeight: '700',
  fontSize: '0.9rem', cursor: 'pointer',
})