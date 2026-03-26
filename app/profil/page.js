'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'

export default function Profil() {
  const router = useRouter()
  const { lang } = useTheme()
  const [form, setForm] = useState({ nom: '', whatsapp: '' })
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [chargement, setChargement] = useState(true)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }
      const { data } = await supabase
        .from('users').select('*').eq('id', user.id).single()
      if (data) {
        setForm({ nom: data.nom || '', whatsapp: data.whatsapp || '' })
        setEmail(user.email)
        setRole(data.role)
      }
      setChargement(false)
    }
    charger()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSauvegarde(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('users').update({
      nom: form.nom,
      whatsapp: form.whatsapp,
    }).eq('id', user.id)
    setMessage(lang === 'fr' ? '✅ Profil mis à jour !' : '✅ Profile updated!')
    setSauvegarde(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (chargement) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <p style={{ color: 'var(--or)' }}>Chargement...</p>
    </div>
  )

  return (
    <main style={pageStyle}>

      {/* En-tête */}
      <div style={headerStyle}>
        <div style={avatarStyle}>
          {form.nom?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <h1 style={titleStyle}>{form.nom}</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            {email} · {role === 'vendeur'
              ? (lang === 'fr' ? 'Vendeur' : 'Seller')
              : (lang === 'fr' ? 'Acheteur' : 'Buyer')}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={sectionTitleStyle}>
          {lang === 'fr' ? 'Modifier mes informations' : 'Edit my information'}
        </h2>

        <div style={fieldStyle}>
          <label style={labelStyle}>
            {lang === 'fr' ? 'Nom complet' : 'Full name'}
          </label>
          <input
            value={form.nom}
            onChange={e => setForm({ ...form, nom: e.target.value })}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '0.3rem' }}>
            {lang === 'fr' ? "L'email n'est pas modifiable" : 'Email cannot be changed'}
          </p>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>
            {lang === 'fr' ? 'Numéro WhatsApp' : 'WhatsApp number'}
          </label>
          <input
            value={form.whatsapp}
            onChange={e => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="237690000000"
          />
        </div>

        {message && (
          <div style={messageStyle}>{message}</div>
        )}

        <button type="submit" disabled={sauvegarde} style={submitStyle}>
          {sauvegarde
            ? (lang === 'fr' ? 'Sauvegarde...' : 'Saving...')
            : (lang === 'fr' ? '💾 Sauvegarder' : '💾 Save')}
        </button>
      </form>

      {/* Lien vers mes produits si vendeur */}
      {role === 'vendeur' && (
        <div style={vendeurCardStyle}>
          <h2 style={sectionTitleStyle}>
            {lang === 'fr' ? '🛍️ Espace vendeur' : '🛍️ Seller space'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/vendeur/mes-produits" style={linkBtnStyle}>
              📋 {lang === 'fr' ? 'Mes produits' : 'My products'}
            </a>
            <a href="/vendeur/ajouter-produit" style={{ ...linkBtnStyle, background: '#E85D24' }}>
              ➕ {lang === 'fr' ? 'Ajouter un produit' : 'Add a product'}
            </a>
          </div>
        </div>
      )}
    </main>
  )
}

const pageStyle = { maxWidth: '600px', margin: '0 auto', padding: '2rem' }
const headerStyle = {
  display: 'flex', alignItems: 'center', gap: '1rem',
  marginBottom: '2rem', padding: '1.5rem',
  background: 'var(--card-bg)', border: '1px solid var(--border)',
  borderRadius: '12px', borderTop: '4px solid #C8841A',
}
const avatarStyle = {
  width: '60px', height: '60px', borderRadius: '50%',
  background: '#C8841A', color: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.5rem', fontWeight: '700', flexShrink: 0,
}
const titleStyle = {
  fontFamily: 'Georgia,serif', fontSize: '1.3rem',
  color: 'var(--or-dark)',
}
const formStyle = {
  background: 'var(--card-bg)', border: '1px solid var(--border)',
  borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem',
}
const sectionTitleStyle = {
  fontSize: '1rem', fontWeight: '700', color: 'var(--or-dark)',
  marginBottom: '1.2rem', fontFamily: 'Georgia,serif',
}
const fieldStyle = { marginBottom: '1.2rem' }
const labelStyle = {
  display: 'block', fontSize: '0.85rem',
  fontWeight: '700', color: 'var(--or-dark)', marginBottom: '0.4rem',
}
const messageStyle = {
  background: '#DCFCE7', color: '#166534',
  padding: '0.8rem 1rem', borderRadius: '8px',
  marginBottom: '1rem', fontSize: '0.9rem',
}
const submitStyle = {
  width: '100%', padding: '0.9rem',
  background: '#C8841A', color: 'white',
  border: 'none', borderRadius: '8px',
  fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
}
const vendeurCardStyle = {
  background: 'var(--card-bg)', border: '1px solid var(--border)',
  borderRadius: '12px', padding: '1.5rem',
  borderTop: '4px solid #E85D24',
}
const linkBtnStyle = {
  display: 'inline-block', padding: '0.7rem 1.2rem',
  background: '#C8841A', color: 'white',
  borderRadius: '8px', textDecoration: 'none',
  fontWeight: '700', fontSize: '0.9rem',
}
