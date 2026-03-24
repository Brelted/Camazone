'use client'
import { useTheme } from '@/lib/ThemeContext'
import { t } from '@/lib/translations'
import Link from 'next/link'

export default function HomeClient({ produits, categories }) {
  const { lang } = useTheme()
  const tx = t[lang]

  const ouvrirWhatsApp = (produit) => {
    const msg = encodeURIComponent(
      lang === 'fr'
        ? `Bonjour ! Je suis intéressé(e) par : *${produit.nom}* à ${produit.prix.toLocaleString()} FCFA. Est-il disponible ?`
        : `Hello! I'm interested in: *${produit.nom}* at ${produit.prix.toLocaleString()} FCFA. Is it available?`
    )
    window.open(`https://wa.me/${produit.users?.whatsapp}?text=${msg}`, '_blank')
  }

  return (
    <main>
      {/* Hero */}
      <section style={heroStyle}>
        <div style={heroPatternStyle} />
        <div style={{ position: 'relative' }}>
          {/* Logo grand */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="34" cy="40" r="30" fill="#C8841A"/>
              <circle cx="44" cy="32" r="22" fill="#1a1a1a"/>
              <circle cx="44" cy="32" r="20" fill="#0f0d0a"/>
            </svg>
          </div>
          <h1 style={heroTitleStyle}>CAMAZONE</h1>
          <p style={heroSloganStyle}>{tx.hero.sousTitre}</p>
          <Link href="/catalogue" style={heroBtnStyle}>
            {tx.hero.cta}
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>{tx.catalogue.titre}</h2>
        <div style={catsStyle}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/catalogue?categorie=${cat.id}`} style={catPillStyle}>
              {cat.nom}
            </Link>
          ))}
        </div>
      </section>

      {/* Produits récents */}
      <section style={{ ...sectionStyle, background: 'var(--bg2)' }}>
        <h2 style={sectionTitleStyle}>
          {lang === 'fr' ? 'Produits récents' : 'Recent products'}
        </h2>
        <div style={gridStyle}>
          {produits.map(produit => (
            <div key={produit.id} style={cardStyle}>
              <div style={cardImgStyle}>
                {produit.photos?.[0] ? (
                  <img src={produit.photos[0]} alt={produit.nom}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2rem' }}>🛍️</span>
                )}
              </div>
              <div style={{ padding: '0.8rem' }}>
                <p style={catLabelStyle}>{produit.categories?.nom}</p>
                <h3 style={cardNameStyle}>{produit.nom}</h3>
                <p style={cardPriceStyle}>{produit.prix.toLocaleString()} FCFA</p>
                <button onClick={() => ouvrirWhatsApp(produit)} style={waBtnStyle}>
                  {tx.catalogue.contacter}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/catalogue" style={voirPlusStyle}>
            {lang === 'fr' ? 'Voir tous les produits →' : 'See all products →'}
          </Link>
        </div>
      </section>

      {/* Bandeau vendeur */}
      <section style={bandeauStyle}>
        <div style={heroPatternStyle} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <h2 style={{ color: '#C8841A', fontFamily: 'Georgia,serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {lang === 'fr' ? 'Vous vendez des produits ? 🤝' : 'Do you sell products? 🤝'}
          </h2>
          <p style={{ color: '#c4a882', marginBottom: '1.5rem' }}>
            {lang === 'fr'
              ? 'Rejoignez CAMAZONE et touchez des milliers d\'acheteurs'
              : 'Join CAMAZONE and reach thousands of buyers'}
          </p>
          <Link href="/inscription" style={heroBtnStyle}>
            {lang === 'fr' ? 'Devenir vendeur →' : 'Become a seller →'}
          </Link>
        </div>
      </section>
    </main>
  )
}

const heroStyle = {
  background: '#1a1a1a',
  padding: '4rem 2rem',
  textAlign: 'center',
  borderBottom: '3px solid #C8841A',
  position: 'relative',
  overflow: 'hidden',
}
const heroPatternStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  backgroundImage: 'repeating-linear-gradient(45deg, rgba(200,132,26,0.08) 0, rgba(200,132,26,0.08) 1px, transparent 0, transparent 50%)',
  backgroundSize: '14px 14px',
}
const heroTitleStyle = {
  fontFamily: 'Georgia, serif',
  fontSize: '2.8rem', fontWeight: '700',
  color: '#C8841A', marginBottom: '0.5rem',
}
const heroSloganStyle = {
  color: '#c4a882', fontSize: '1rem',
  marginBottom: '2rem', maxWidth: '500px',
  margin: '0 auto 2rem',
}
const heroBtnStyle = {
  display: 'inline-block',
  padding: '0.8rem 2rem',
  background: '#C8841A', color: 'white',
  borderRadius: '8px', fontWeight: '700',
  fontSize: '1rem',
}
const sectionStyle = {
  maxWidth: '1100px', margin: '0 auto',
  padding: '3rem 2rem',
}
const sectionTitleStyle = {
  fontSize: '1.3rem', fontWeight: '700',
  color: 'var(--or-dark)', marginBottom: '1.2rem',
  fontFamily: 'Georgia, serif',
}
const catsStyle = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }
const catPillStyle = {
  padding: '0.5rem 1.2rem',
  background: 'var(--or-light)',
  color: 'var(--or-dark)',
  border: '1px solid var(--border)',
  borderRadius: '20px', fontSize: '0.9rem',
}
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1.2rem',
}
const cardStyle = {
  background: 'var(--card-bg)',
  border: '1px solid var(--border)',
  borderRadius: '10px', overflow: 'hidden',
  borderTop: '3px solid #C8841A',
}
const cardImgStyle = {
  height: '160px',
  background: 'var(--bg2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden',
}
const catLabelStyle = {
  fontSize: '0.75rem', color: 'var(--or)',
  fontWeight: '700', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: '0.3rem',
}
const cardNameStyle = { fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.4rem' }
const cardPriceStyle = { fontSize: '1rem', fontWeight: '700', color: '#E85D24', marginBottom: '0.8rem' }
const waBtnStyle = {
  width: '100%', padding: '0.6rem',
  background: '#25D366', color: 'white',
  border: 'none', borderRadius: '8px',
  fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
}
const voirPlusStyle = {
  display: 'inline-block', padding: '0.8rem 2rem',
  border: '2px solid #C8841A', color: '#C8841A',
  borderRadius: '8px', fontWeight: '700',
}
const bandeauStyle = {
  background: '#1a1a1a',
  padding: '4rem 2rem',
  borderTop: '3px solid #C8841A',
  position: 'relative', overflow: 'hidden',
}