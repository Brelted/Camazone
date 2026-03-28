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
  const [avis, setAvis] = useState([])
  const [monAvis, setMonAvis] = useState({ note: 5, commentaire: '' })
  const [dejaNote, setDejaNote] = useState(false)
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: fav } = await supabase
          .from('favoris').select('id')
          .eq('user_id', user.id).eq('produit_id', produit.id).single()
        if (fav) { setEstFavori(true); setFavoriId(fav.id) }
      }
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, users(nom)')
        .eq('produit_id', produit.id)
        .order('created_at', { ascending: false })
      setAvis(reviews || [])
      if (user) {
        const dejaLaisse = reviews?.find(r => r.acheteur_id === user.id)
        if (dejaLaisse) setDejaNote(true)
      }
    }
    init()
  }, [])

  const toggleFavori = async () => {
    if (!userId) { window.location.href = '/connexion'; return }
    if (estFavori) {
      await supabase.from('favoris').delete().eq('id', favoriId)
      setEstFavori(false); setFavoriId(null)
    } else {
      const { data } = await supabase.from('favoris')
        .insert({ user_id: userId, produit_id: produit.id }).select().single()
      setEstFavori(true); setFavoriId(data.id)
    }
  }

  const ouvrirWhatsApp = () => {
    const numero = formatWhatsApp(produit.users?.whatsapp)
    const msg = encodeURIComponent(
      lang === 'fr'
        ? `Bonjour ! Je suis intéressé(e) par : *${produit.nom}* à ${produit.prix.toLocaleString()} FCFA. Est-il disponible ?`
        : `Hello! I'm interested in: *${produit.nom}* at ${produit.prix.toLocaleString()} FCFA. Is it available?`
    )
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank')
  }

  const soumettreAvis = async (e) => {
    e.preventDefault()
    if (!userId) { window.location.href = '/connexion'; return }
    setEnvoi(true)
    const { data } = await supabase.from('reviews').insert({
      acheteur_id: userId,
      produit_id: produit.id,
      note: monAvis.note,
      commentaire: monAvis.commentaire,
    }).select('*, users(nom)').single()
    if (data) {
      setAvis([data, ...avis])
      setDejaNote(true)
    }
    setEnvoi(false)
  }

  const moyenneNote = avis.length > 0
    ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1)
    : null

  const etoiles = (note, taille = 16) =>
    [1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize: taille, color: i <= note ? '#C8841A' : '#ccc' }}>★</span>
    ))

  return (
    <main style={pageStyle}>

      <a href="/catalogue" style={backStyle}>
        ← {lang === 'fr' ? 'Retour au catalogue' : 'Back to catalogue'}
      </a>

      <div style={layoutStyle}>

        {/* Photos */}
        <div style={photosColStyle}>
          <div style={mainPhotoStyle}>
            {produit.photos?.[photoActive] ? (
              <img src={produit.photos[photoActive]} alt={produit.nom}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '4rem' }}>🛍️</span>
            )}
          </div>
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

        {/* Infos */}
        <div style={infoColStyle}>
          <p style={catStyle}>{produit.categories?.nom}</p>
          <h1 style={nomStyle}>{produit.nom}</h1>

          {/* Note moyenne */}
          {moyenneNote && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div>{etoiles(Math.round(moyenneNote))}</div>
              <span style={{ fontWeight: '700', color: '#C8841A' }}>{moyenneNote}</span>
              <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                ({avis.length} {lang === 'fr' ? 'avis' : 'reviews'})
              </span>
            </div>
          )}

          <p style={prixStyle}>{produit.prix.toLocaleString()} FCFA</p>

          <div style={stockStyle(produit.stock > 0)}>
            {produit.stock > 0
              ? `✅ ${lang === 'fr' ? 'En stock' : 'In stock'} (${produit.stock})`
              : `❌ ${lang === 'fr' ? 'Rupture de stock' : 'Out of stock'}`}
          </div>

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

          <a href={`/boutique/${produit.users?.id}`} style={vendeurCardStyle}>
            <div style={vendeurAvatarStyle}>
              {produit.users?.nom?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>
                {lang === 'fr' ? 'Vendu par' : 'Sold by'}
              </p>
              <p style={{ fontWeight: '700', color: 'var(--or-dark)' }}>
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
                ? (lang === 'fr' ? ' Retiré' : ' Saved')
                : (lang === 'fr' ? ' Favoris' : ' Save')}
            </button>
          </div>

          <button onClick={ouvrirWhatsApp} style={waBtnStyle}>
            💬 {lang === 'fr' ? 'Contacter le vendeur sur WhatsApp' : 'Contact seller on WhatsApp'}
          </button>
        </div>
      </div>

      {/* Section avis */}
      <div style={avisSection}>
        <h2 style={avisTitleStyle}>
          {lang === 'fr' ? '⭐ Avis clients' : '⭐ Customer reviews'}
          {moyenneNote && (
            <span style={{ fontSize: '1rem', color: '#C8841A', marginLeft: '0.8rem' }}>
              {moyenneNote}/5
            </span>
          )}
        </h2>

        {/* Formulaire avis */}
        {userId && !dejaNote && (
          <form onSubmit={soumettreAvis} style={avisFormStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--or-dark)', marginBottom: '1rem' }}>
              {lang === 'fr' ? 'Laisser un avis' : 'Leave a review'}
            </h3>

            {/* Étoiles cliquables */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(i => (
                <span key={i}
                  onClick={() => setMonAvis({ ...monAvis, note: i })}
                  style={{ fontSize: '28px', cursor: 'pointer', color: i <= monAvis.note ? '#C8841A' : '#ccc' }}>
                  ★
                </span>
              ))}
            </div>

            <textarea
              value={monAvis.commentaire}
              onChange={e => setMonAvis({ ...monAvis, commentaire: e.target.value })}
              placeholder={lang === 'fr' ? 'Partagez votre expérience...' : 'Share your experience...'}
              rows={3}
              style={textareaStyle}
            />
            <button type="submit" disabled={envoi} style={submitAvisStyle}>
              {envoi
                ? (lang === 'fr' ? 'Envoi...' : 'Sending...')
                : (lang === 'fr' ? '📝 Publier mon avis' : '📝 Publish review')}
            </button>
          </form>
        )}

        {!userId && (
          <div style={connectStyle}>
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
              {lang === 'fr'
                ? 'Connectez-vous pour laisser un avis.'
                : 'Log in to leave a review.'}
            </p>
            <a href="/connexion" style={connectBtnStyle}>
              {lang === 'fr' ? 'Se connecter' : 'Log in'}
            </a>
          </div>
        )}

        {dejaNote && (
          <div style={dejaStyle}>
            ✅ {lang === 'fr' ? 'Vous avez déjà laissé un avis.' : 'You already left a review.'}
          </div>
        )}

        {/* Liste des avis */}
        {avis.length === 0 ? (
          <p style={{ color: 'var(--text2)', textAlign: 'center', padding: '2rem' }}>
            {lang === 'fr' ? 'Aucun avis pour l\'instant.' : 'No reviews yet.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {avis.map(a => (
              <div key={a.id} style={avisCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={avisAvatarStyle}>
                      {a.users?.nom?.charAt(0)?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{a.users?.nom}</span>
                  </div>
                  <div>{etoiles(a.note, 14)}</div>
                </div>
                {a.commentaire && (
                  <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {a.commentaire}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

const pageStyle = { maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }
const backStyle = { color: '#C8841A', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }
const layoutStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }
const photosColStyle = { display: 'flex', flexDirection: 'column', gap: '0.8rem' }
const mainPhotoStyle = { width: '100%', aspectRatio: '1', background: 'var(--bg2)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }
const thumbsStyle = { display: 'flex', gap: '8px' }
const thumbStyle = (actif) => ({ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${actif ? '#C8841A' : 'var(--border)'}` })
const infoColStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const catStyle = { fontSize: '0.75rem', color: '#C8841A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }
const nomStyle = { fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: 'var(--text)', lineHeight: 1.3 }
const prixStyle = { fontSize: '1.8rem', fontWeight: '700', color: '#E85D24' }
const stockStyle = (enStock) => ({ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', background: enStock ? '#DCFCE7' : '#FEE2E2', color: enStock ? '#166534' : '#991B1B' })
const descStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }
const descTitleStyle = { fontSize: '0.9rem', fontWeight: '700', color: 'var(--or-dark)', marginBottom: '0.5rem' }
const vendeurCardStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', borderLeft: '4px solid #C8841A', textDecoration: 'none' }
const vendeurAvatarStyle = { width: '44px', height: '44px', borderRadius: '50%', background: '#C8841A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '700', flexShrink: 0 }
const favBtnStyle = (actif) => ({ flex: 1, padding: '0.8rem', background: actif ? '#FEE2E2' : 'var(--card-bg)', color: actif ? '#991B1B' : 'var(--text2)', border: `1px solid ${actif ? '#E85D24' : 'var(--border)'}`, borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' })
const waBtnStyle = { width: '100%', padding: '1rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }
const avisSection = { marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }
const avisTitleStyle = { fontFamily: 'Georgia,serif', fontSize: '1.3rem', color: 'var(--or-dark)', marginBottom: '1.5rem' }
const avisFormStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', borderTop: '3px solid #C8841A' }
const textareaStyle = { width: '100%', padding: '0.7rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text)', fontSize: '0.95rem', resize: 'vertical', marginBottom: '1rem' }
const submitAvisStyle = { padding: '0.7rem 1.5rem', background: '#C8841A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }
const connectStyle = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg2)', borderRadius: '10px', marginBottom: '1rem' }
const connectBtnStyle = { padding: '0.5rem 1rem', background: '#C8841A', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }
const dejaStyle = { padding: '0.8rem 1rem', background: '#DCFCE7', color: '#166534', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }
const avisCardStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }
const avisAvatarStyle = { width: '32px', height: '32px', borderRadius: '50%', background: '#C8841A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' }
