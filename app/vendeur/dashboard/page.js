'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'

export default function Dashboard() {
  const router = useRouter()
  const { lang } = useTheme()
  const [stats, setStats] = useState(null)
  const [produits, setProduits] = useState([])
  const [avis, setAvis] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      // Produits du vendeur
      const { data: prods } = await supabase
        .from('products')
        .select('*, categories(nom)')
        .eq('vendeur_id', user.id)
        .order('created_at', { ascending: false })

      // Favoris reçus sur ses produits
      const prodIds = prods?.map(p => p.id) || []
      const { data: favs } = prodIds.length > 0
        ? await supabase.from('favoris').select('*').in('produit_id', prodIds)
        : { data: [] }

      // Avis reçus
      const { data: reviews } = prodIds.length > 0
        ? await supabase
            .from('reviews')
            .select('*, products(nom), users(nom)')
            .in('produit_id', prodIds)
            .order('created_at', { ascending: false })
            .limit(5)
        : { data: [] }

      const moyenneNote = reviews?.length > 0
        ? (reviews.reduce((s, r) => s + r.note, 0) / reviews.length).toFixed(1)
        : null

      setStats({
        totalProduits: prods?.length || 0,
        enStock: prods?.filter(p => p.stock > 0).length || 0,
        rupture: prods?.filter(p => p.stock === 0).length || 0,
        totalFavoris: favs?.length || 0,
        totalAvis: reviews?.length || 0,
        moyenneNote,
      })
      setProduits(prods || [])
      setAvis(reviews || [])
      setChargement(false)
    }
    charger()
  }, [])

  const etoiles = (note) =>
    [1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= note ? '#C8841A' : '#ccc', fontSize: '14px' }}>★</span>
    ))

  if (chargement) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <p style={{ color: 'var(--or)' }}>Chargement...</p>
    </div>
  )

  return (
    <main style={pageStyle}>

      {/* En-tête */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="18" cy="22" r="17" fill="#C8841A"/>
            <circle cx="24" cy="18" r="13" fill="#1a1a1a"/>
          </svg>
          <div>
            <h1 style={titleStyle}>
              {lang === 'fr' ? '📊 Dashboard vendeur' : '📊 Seller dashboard'}
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
              {lang === 'fr' ? 'Vue d\'ensemble de votre boutique' : 'Overview of your shop'}
            </p>
          </div>
        </div>
        <a href="/vendeur/ajouter-produit" style={addBtnStyle}>
          ➕ {lang === 'fr' ? 'Ajouter' : 'Add'}
        </a>
      </div>

      {/* Cartes stats */}
      <div style={statsGridStyle}>
        <div style={statCardStyle('#C8841A')}>
          <p style={statLabelStyle}>
            {lang === 'fr' ? 'Total produits' : 'Total products'}
          </p>
          <p style={statNumStyle}>{stats.totalProduits}</p>
          <p style={statIconStyle}>🛍️</p>
        </div>
        <div style={statCardStyle('#1D9E75')}>
          <p style={statLabelStyle}>
            {lang === 'fr' ? 'En stock' : 'In stock'}
          </p>
          <p style={statNumStyle}>{stats.enStock}</p>
          <p style={statIconStyle}>✅</p>
        </div>
        <div style={statCardStyle('#E85D24')}>
          <p style={statLabelStyle}>
            {lang === 'fr' ? 'Rupture' : 'Out of stock'}
          </p>
          <p style={statNumStyle}>{stats.rupture}</p>
          <p style={statIconStyle}>⚠️</p>
        </div>
        <div style={statCardStyle('#854F0B')}>
          <p style={statLabelStyle}>
            {lang === 'fr' ? 'Favoris reçus' : 'Favorites received'}
          </p>
          <p style={statNumStyle}>{stats.totalFavoris}</p>
          <p style={statIconStyle}>❤️</p>
        </div>
        <div style={statCardStyle('#534AB7')}>
          <p style={statLabelStyle}>
            {lang === 'fr' ? 'Avis reçus' : 'Reviews received'}
          </p>
          <p style={statNumStyle}>{stats.totalAvis}</p>
          <p style={statIconStyle}>⭐</p>
        </div>
        <div style={statCardStyle('#0F6E56')}>
          <p style={statLabelStyle}>
            {lang === 'fr' ? 'Note moyenne' : 'Average rating'}
          </p>
          <p style={statNumStyle}>{stats.moyenneNote || '—'}</p>
          <p style={statIconStyle}>📈</p>
        </div>
      </div>

      {/* Produits populaires */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            {lang === 'fr' ? '🛍️ Mes produits' : '🛍️ My products'}
          </h2>
          <a href="/vendeur/mes-produits" style={voirToutStyle}>
            {lang === 'fr' ? 'Voir tout →' : 'See all →'}
          </a>
        </div>

        {produits.slice(0, 4).map(produit => (
          <div key={produit.id} style={rowStyle}>
            <div style={rowImgStyle}>
              {produit.photos?.[0] ? (
                <img src={produit.photos[0]} alt={produit.nom}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '1.2rem' }}>🛍️</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', color: '#C8841A', fontWeight: '700', textTransform: 'uppercase' }}>
                {produit.categories?.nom}
              </p>
              <p style={{ fontWeight: '700', fontSize: '0.95rem', margin: '0.2rem 0' }}>
                {produit.nom}
              </p>
              <p style={{ color: '#E85D24', fontWeight: '700', fontSize: '0.9rem' }}>
                {produit.prix.toLocaleString()} FCFA
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={stockBadge(produit.stock > 0)}>
                {produit.stock > 0 ? `✅ ${produit.stock}` : '❌ 0'}
              </span>
            </div>
          </div>
        ))}

        {produits.length === 0 && (
          <div style={emptyStyle}>
            <p style={{ color: 'var(--text2)' }}>
              {lang === 'fr' ? 'Aucun produit.' : 'No products.'}
            </p>
            <a href="/vendeur/ajouter-produit" style={addBtnStyle}>
              ➕ {lang === 'fr' ? 'Ajouter un produit' : 'Add a product'}
            </a>
          </div>
        )}
      </div>

      {/* Derniers avis */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          {lang === 'fr' ? '⭐ Derniers avis reçus' : '⭐ Latest reviews'}
        </h2>

        {avis.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            {lang === 'fr' ? 'Aucun avis pour l\'instant.' : 'No reviews yet.'}
          </p>
        ) : (
          avis.map(a => (
            <div key={a.id} style={avisRowStyle}>
              <div style={avisAvatarStyle}>
                {a.users?.nom?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{a.users?.nom}</p>
                  <div>{etoiles(a.note)}</div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#C8841A', marginBottom: '0.2rem' }}>
                  {a.products?.nom}
                </p>
                {a.commentaire && (
                  <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {a.commentaire}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions rapides */}
      <div style={actionsStyle}>
        <h2 style={sectionTitleStyle}>
          {lang === 'fr' ? '⚡ Actions rapides' : '⚡ Quick actions'}
        </h2>
        <div style={actionsGridStyle}>
          <a href="/vendeur/ajouter-produit" style={actionCardStyle('#C8841A')}>
            <span style={{ fontSize: '1.5rem' }}>➕</span>
            <span>{lang === 'fr' ? 'Ajouter un produit' : 'Add a product'}</span>
          </a>
          <a href="/vendeur/mes-produits" style={actionCardStyle('#1D9E75')}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <span>{lang === 'fr' ? 'Gérer mes produits' : 'Manage products'}</span>
          </a>
          <a href="/profil" style={actionCardStyle('#854F0B')}>
            <span style={{ fontSize: '1.5rem' }}>✏️</span>
            <span>{lang === 'fr' ? 'Modifier mon profil' : 'Edit profile'}</span>
          </a>
          <a href="/catalogue" style={actionCardStyle('#534AB7')}>
            <span style={{ fontSize: '1.5rem' }}>🛒</span>
            <span>{lang === 'fr' ? 'Voir le catalogue' : 'View catalogue'}</span>
          </a>
        </div>
      </div>

    </main>
  )
}

const pageStyle = { maxWidth: '900px', margin: '0 auto', padding: '2rem' }
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }
const titleStyle = { fontFamily: 'Georgia,serif', fontSize: '1.5rem', color: 'var(--or-dark)' }
const addBtnStyle = { padding: '0.6rem 1.2rem', background: '#C8841A', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }
const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }
const statCardStyle = (color) => ({ background: 'var(--card-bg)', border: `1px solid var(--border)`, borderTop: `3px solid ${color}`, borderRadius: '10px', padding: '1rem', textAlign: 'center', position: 'relative' })
const statLabelStyle = { fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.4rem' }
const statNumStyle = { fontSize: '2rem', fontWeight: '700', color: 'var(--text)' }
const statIconStyle = { fontSize: '1.2rem', marginTop: '0.3rem' }
const sectionStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }
const sectionHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }
const sectionTitleStyle = { fontFamily: 'Georgia,serif', fontSize: '1.1rem', color: 'var(--or-dark)', marginBottom: '1rem' }
const voirToutStyle = { color: '#C8841A', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '700' }
const rowStyle = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }
const rowImgStyle = { width: '56px', height: '56px', borderRadius: '8px', background: 'var(--bg2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
const stockBadge = (enStock) => ({ padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: enStock ? '#DCFCE7' : '#FEE2E2', color: enStock ? '#166534' : '#991B1B' })
const emptyStyle = { textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }
const avisRowStyle = { display: 'flex', gap: '12px', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }
const avisAvatarStyle = { width: '36px', height: '36px', borderRadius: '50%', background: '#C8841A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', flexShrink: 0 }
const actionsStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }
const actionsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }
const actionCardStyle = (color) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--bg2)', border: `1px solid var(--border)`, borderRadius: '10px', textDecoration: 'none', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '700', textAlign: 'center', borderTop: `3px solid ${color}` })