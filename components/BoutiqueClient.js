'use client'
import { useTheme } from '@/lib/ThemeContext'
import { formatWhatsApp } from '@/lib/supabase'

export default function BoutiqueClient({ vendeur, produits }) {
  const { lang } = useTheme()

  const ouvrirWhatsApp = (produit) => {
    const numero = formatWhatsApp(vendeur.whatsapp)
    const msg = encodeURIComponent(
      lang === 'fr'
        ? `Bonjour ! Je suis intéressé(e) par : *${produit.nom}* à ${produit.prix.toLocaleString()} FCFA. Est-il disponible ?`
        : `Hello! I'm interested in: *${produit.nom}* at ${produit.prix.toLocaleString()} FCFA. Is it available?`
    )
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank')
  }

  const contacterVendeur = () => {
    const numero = formatWhatsApp(vendeur.whatsapp)
    const msg = encodeURIComponent(
      lang === 'fr'
        ? `Bonjour ${vendeur.nom} ! J'ai visité votre boutique sur CAMAZONE et j'aimerais en savoir plus.`
        : `Hello ${vendeur.nom}! I visited your shop on CAMAZONE and would like to know more.`
    )
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank')
  }

  return (
    <main>

      {/* Bannière boutique */}
      <div style={banniereStyle}>
        <div style={bannierePatternStyle} />
        <div style={{ position: 'relative', textAlign: 'center' }}>

          {/* Avatar */}
          <div style={avatarStyle}>
            {vendeur.nom?.charAt(0)?.toUpperCase()}
          </div>

          {/* Nom vendeur */}
          <h1 style={nomStyle}>{vendeur.nom}</h1>
          <p style={sousTitreStyle}>
            {lang === 'fr' ? 'Boutique CAMAZONE' : 'CAMAZONE Shop'}
          </p>

          {/* Stats */}
          <div style={statsStyle}>
            <div style={statStyle}>
              <p style={statNumStyle}>{produits.length}</p>
              <p style={statLabelStyle}>
                {lang === 'fr' ? 'Produits' : 'Products'}
              </p>
            </div>
            <div style={statDivStyle} />
            <div style={statStyle}>
              <p style={statNumStyle}>
                {produits.filter(p => p.stock > 0).length}
              </p>
              <p style={statLabelStyle}>
                {lang === 'fr' ? 'En stock' : 'In stock'}
              </p>
            </div>
          </div>

          {/* Bouton contacter */}
          <button onClick={contacterVendeur} style={waBtnStyle}>
            💬 {lang === 'fr' ? 'Contacter le vendeur' : 'Contact seller'}
          </button>
        </div>
      </div>

      {/* Produits */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          {lang === 'fr' ? '🛍️ Tous les produits' : '🛍️ All products'}
        </h2>

        {produits.length === 0 ? (
          <div style={emptyStyle}>
            <p style={{ fontSize: '3rem' }}>🛍️</p>
            <p style={{ color: 'var(--text2)', marginTop: '1rem' }}>
              {lang === 'fr'
                ? 'Ce vendeur n\'a pas encore de produits.'
                : 'This seller has no products yet.'}
            </p>
          </div>
        ) : (
          <div style={gridStyle}>
            {produits.map(produit => (
              <div key={produit.id} style={cardStyle}>
                <div style={{ height: '3px', background: '#C8841A' }} />
                <a href={`/produit/${produit.id}`} style={{ textDecoration: 'none' }}>
                  <div style={cardImgStyle}>
                    {produit.photos?.[0] ? (
                      <img src={produit.photos[0]} alt={produit.nom}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '2.5rem' }}>🛍️</span>
                    )}
                  </div>
                </a>
                <div style={{ padding: '0.9rem' }}>
                  <p style={catStyle}>{produit.categories?.nom}</p>
                  <h3 style={cardNameStyle}>{produit.nom}</h3>
                  <p style={priceStyle}>{produit.prix.toLocaleString()} FCFA</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`/produit/${produit.id}`} style={detailBtnStyle}>
                      {lang === 'fr' ? '👁️ Voir' : '👁️ View'}
                    </a>
                    <button
                      onClick={(e) => { e.preventDefault(); ouvrirWhatsApp(produit) }}
                      style={waBtnSmallStyle}>
                      💬
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

const banniereStyle = {
  background: '#1a1a1a',
  padding: '3rem 2rem',
  borderBottom: '3px solid #C8841A',
  position: 'relative', overflow: 'hidden',
}
const bannierePatternStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  backgroundImage: 'repeating-linear-gradient(45deg, rgba(200,132,26,0.06) 0, rgba(200,132,26,0.06) 1px, transparent 0, transparent 50%)',
  backgroundSize: '14px 14px',
}
const avatarStyle = {
  width: '80px', height: '80px', borderRadius: '50%',
  background: '#C8841A', color: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '2rem', fontWeight: '700',
  margin: '0 auto 1rem', border: '3px solid #E85D24',
}
const nomStyle = {
  fontFamily: 'Georgia,serif', fontSize: '1.8rem',
  color: '#C8841A', marginBottom: '0.3rem',
  position: 'relative',
}
const sousTitreStyle = {
  color: '#c4a882', fontSize: '0.9rem',
  marginBottom: '1.5rem', position: 'relative',
}
const statsStyle = {
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '2rem',
  marginBottom: '1.5rem', position: 'relative',
}
const statStyle = { textAlign: 'center' }
const statNumStyle = {
  fontSize: '1.8rem', fontWeight: '700', color: '#C8841A',
}
const statLabelStyle = { fontSize: '0.8rem', color: '#c4a882' }
const statDivStyle = {
  width: '1px', height: '40px', background: '#C8841A', opacity: 0.4,
}
const waBtnStyle = {
  padding: '0.8rem 2rem', background: '#25D366',
  color: 'white', border: 'none', borderRadius: '8px',
  fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
  position: 'relative',
}
const sectionStyle = {
  maxWidth: '1100px', margin: '0 auto', padding: '2rem',
}
const sectionTitleStyle = {
  fontFamily: 'Georgia,serif', fontSize: '1.3rem',
  color: 'var(--or-dark)', marginBottom: '1.5rem',
}
const emptyStyle = { textAlign: 'center', padding: '3rem' }
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
  gap: '1.2rem',
}
const cardStyle = {
  background: 'var(--card-bg)',
  border: '1px solid var(--border)',
  borderRadius: '10px', overflow: 'hidden',
}
const cardImgStyle = {
  height: '170px', background: 'var(--bg2)',
  display: 'flex', alignItems: 'center',
  justifyContent: 'center', overflow: 'hidden',
}
const catStyle = {
  fontSize: '0.72rem', color: '#C8841A',
  fontWeight: '700', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: '0.3rem',
}
const cardNameStyle = {
  fontSize: '0.95rem', fontWeight: '700',
  color: 'var(--text)', marginBottom: '0.3rem',
}
const priceStyle = {
  fontSize: '1rem', fontWeight: '700',
  color: '#E85D24', marginBottom: '0.8rem',
}
const detailBtnStyle = {
  flex: 1, padding: '0.6rem', textAlign: 'center',
  background: 'var(--or-light)', color: 'var(--or-dark)',
  border: '1px solid var(--border)', borderRadius: '8px',
  fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none',
}
const waBtnSmallStyle = {
  padding: '0.6rem 0.8rem', background: '#25D366',
  color: 'white', border: 'none', borderRadius: '8px',
  cursor: 'pointer', fontSize: '0.9rem',
}
