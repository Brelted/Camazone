'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Inscription() {
  const router = useRouter()
  const [form, setForm] = useState({
    nom: '', email: '', password: '',
    whatsapp: '', role: 'acheteur'
  })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    // 1. Créer le compte auth
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setErreur(error.message)
      setChargement(false)
      return
    }

    // 2. Sauvegarder les infos dans notre table users
    await supabase.from('users').insert({
      id: data.user.id,
      nom: form.nom,
      email: form.email,
      whatsapp: form.whatsapp,
      role: form.role,
    })

    router.push('/connexion')
  }

  return (
    <main style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Nom complet</label><br />
          <input name="nom" value={form.nom} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br />
          <input name="email" type="email" value={form.email} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Mot de passe</label><br />
          <input name="password" type="password" value={form.password} onChange={handleChange}
            required style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Numéro WhatsApp (ex: 237690000000)</label><br />
          <input name="whatsapp" value={form.whatsapp} onChange={handleChange}
            style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Je suis :</label><br />
          <select name="role" value={form.role} onChange={handleChange} style={inputStyle}>
            <option value="acheteur">Acheteur</option>
            <option value="vendeur">Vendeur</option>
          </select>
        </div>
        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
        <button type="submit" disabled={chargement} style={buttonStyle}>
          {chargement ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Déjà un compte ? <a href="/connexion">Se connecter</a>
      </p>
    </main>
  )
}

const inputStyle = {
  width: '100%', padding: '0.6rem',
  border: '1px solid #ccc', borderRadius: '6px',
  fontSize: '1rem', marginTop: '0.3rem'
}
const buttonStyle = {
  width: '100%', padding: '0.8rem',
  background: '#16a34a', color: 'white',
  border: 'none', borderRadius: '6px',
  fontSize: '1rem', cursor: 'pointer'
}