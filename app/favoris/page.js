'use client'
import { useState, useEffect } from 'react'
import { supabase, formatWhatsApp } from '@/lib/supabase'
import { useTheme } from '@/lib/ThemeContext'
import { useRouter } from 'next/navigation'

export default function Favoris() {
  const { lang } = useTheme()
  const router = useRouter()
  const [favoris, setFavoris] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      const { data } = await supabase
        .from('favoris')
        .select('*, products(*, categories(nom), users(nom, whatsapp))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setFavoris(data || [])
      setChargement(false)
    }
    charger()
  }, [])

  const retirerFavori = async (favoriId) => {
    await supabase.from('favoris').delete().eq('id', favoriId)
    setFavoris(favoris.filter(f => f.id !== favoriId))
  }

  const ouvrirWhatsApp = (produit) => {
    const numero = formatWhatsApp(produit.users?.whatsapp)
    const msg = encodeURIComponent(
      lang === 'fr'
        ? `Bonjour ! Je suis intéressé(e) par : *${produit.nom}* à ${produit.prix.toLocaleString()} FCFA. Est-il disponible ?`
        : `Hello! I'm interested in: *${produit.nom}* at ${produit.prix.toLocaleString()} FCFA. Is it available?`
    )
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank')
  }

  if (chargement) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <p style={{ color: 'var(--or)' }}>Chargement...</p>
    </div>
  )

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={titleStyle}>
        {lang === 'fr' ? '❤️ Mes favoris' : '❤️ My favorites'}
      </h1>

      {favoris.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ fontSize: '3rem' }}>❤️</p>
          <p style={{ color: 'var(--text2)', marginTop: '1rem' }}>
            {lang === 'fr' ? 'Aucun favori pour l\'instant.' : 'No favorites yet.'}
          </p>
          <a href="/catalogue" style={btnStyle}>
            {lang === 'fr' ? '🛒 Découvrir des produits' : '🛒 Discover products'}
          </a>
        </div>
      ) : (
        <div style={gridStyle}>
          {favoris.map(favori => {
            const produit = favori.products
            if (!produit) return null
            return (
              <div key={favori.id} style={cardStyle}>
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
                    <button onClick={() => ouvrirWhatsApp(produit)} style={waBtnStyle}>
                      💬 {lang === 'fr' ? 'Contacter' : 'Contact'}
                    </button>
                    <button onClick={() => retirerFavori(favori.id)} style={removeBtnStyle}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

const titleStyle = { fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: 'var(--or-dark)', marginBottom: '2rem' }
const emptyStyle = { textAlign: 'center', padding: '4rem 2rem' }
const btnStyle = { display: 'inline-block', marginTop: '1.5rem', padding: '0.8rem 1.5rem', background: '#C8841A', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.2rem' }
const cardStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }
const cardImgStyle = { height: '170px', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }
const catStyle = { fontSize: '0.72rem', color: '#C8841A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }
const cardNameStyle = { fontSize: '0.95rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.3rem' }
const priceStyle = { fontSize: '1rem', fontWeight: '700', color: '#E85D24', marginBottom: '0.8rem' }
const waBtnStyle = { flex: 1, padding: '0.6rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }
const removeBtnStyle = { padding: '0.6rem 0.8rem', background: 'transparent', border: '1px solid #E85D24', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }