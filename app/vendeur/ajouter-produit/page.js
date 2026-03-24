'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'
import { t } from '@/lib/translations'

export default function AjouterProduit() {
  const router = useRouter()
  const { lang } = useTheme()
  const tx = t[lang].produit
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ nom: '', description: '', prix: '', stock: '', categorie_id: '' })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  useEffect(() => {
    const chargerCategories = async () => {
      const { data } = await supabase.from('categories').select('*')
      setCategories(data || [])
    }
    chargerCategories()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    setPhoto(file)
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }

    let photoUrl = null
    if (photo) {
      const nomFichier = `${user.id}-${Date.now()}-${photo.name}`
      const { error: uploadError } = await supabase.storage
        .from('photos-produits').upload(nomFichier, photo)
      if (uploadError) {
        setErreur("Erreur lors de l'upload de la photo")
        setChargement(false)
        return
      }
      const { data: urlData } = supabase.storage
        .from('photos-produits').getPublicUrl(nomFichier)
      photoUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('products').insert({
      vendeur_id: user.id,
      categorie_id: form.categorie_id,
      nom: form.nom,
      description: form.description,
      prix: parseFloat(form.prix),
      stock: parseInt(form.stock),
      photos: photoUrl ? [photoUrl] : [],
    })

    if (error) {
      setErreur('Erreur lors de la sauvegarde')
      setChargement(false)
      return
    }
    router.push('/vendeur/mes-produits')
  }

  return (
    <main style={pageStyle}>
      {/* En-tête */}
      <div style={headerStyle}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="17" cy="20" r="15" fill="#C8841A"/>
          <circle cx="22" cy="17" r="11" fill="#1a1a1a"/>
        </svg>
        <div>
          <h1 style={titleStyle}>{tx.publier}</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            {lang === 'fr' ? 'Remplissez les informations de votre produit' : 'Fill in your product information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>

        {/* Preview photo */}
        <div style={photoZoneStyle}>
          {preview ? (
            <img src={preview} alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text2)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</p>
              <p style={{ fontSize: '0.85rem' }}>{tx.photo}</p>
            </div>
          )}
        </div>

        <input type="file" accept="image/*" onChange={handlePhoto}
          style={{ marginBottom: '1.2rem', color: 'var(--text2)', fontSize: '0.9rem' }} />

        <div style={fieldStyle}>
          <label style={labelStyle}>{tx.nom}</label>
          <input name="nom" value={form.nom} onChange={handleChange}
            required placeholder={lang === 'fr' ? 'Ex: Huile de palme rouge 1L' : 'Ex: Red palm oil 1L'} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>{tx.description}</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={4} placeholder={lang === 'fr' ? 'Décrivez votre produit...' : 'Describe your product...'}
            style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text)', fontSize: '1rem', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>{tx.prix}</label>
            <input name="prix" type="number" value={form.prix} onChange={handleChange}
              required placeholder="2500" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>{tx.stock}</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange}
              required placeholder="10" />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>{tx.categorie}</label>
          <select name="categorie_id" value={form.categorie_id} onChange={handleChange} required>
            <option value="">{tx.choixCategorie}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
        </div>

        {erreur && (
          <div style={erreurStyle}>⚠️ {erreur}</div>
        )}

        <button type="submit" disabled={chargement} style={submitBtnStyle}>
          {chargement ? tx.publication : tx.publier}
        </button>

      </form>
    </main>
  )
}

const pageStyle = { maxWidth: '600px', margin: '0 auto', padding: '2rem' }
const headerStyle = { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }
const titleStyle = { fontFamily: 'Georgia,serif', fontSize: '1.5rem', color: 'var(--or-dark)' }
const formStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }
const photoZoneStyle = {
  height: '180px', border: '2px dashed var(--or)',
  borderRadius: '10px', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  marginBottom: '1rem', overflow: 'hidden',
  background: 'var(--or-light)',
}
const fieldStyle = { marginBottom: '1.2rem' }
const labelStyle = { display: 'block', fontSize: '0.88rem', fontWeight: '700', color: 'var(--or-dark)', marginBottom: '0.4rem' }
const erreurStyle = {
  background: '#FEE2E2', color: '#991B1B',
  padding: '0.8rem 1rem', borderRadius: '8px',
  marginBottom: '1rem', fontSize: '0.9rem',
}
const submitBtnStyle = {
  width: '100%', padding: '0.9rem',
  background: '#C8841A', color: 'white',
  border: 'none', borderRadius: '8px',
  fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
}