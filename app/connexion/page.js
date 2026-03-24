'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Connexion() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setErreur('Email ou mot de passe incorrect')
      setChargement(false)
      return
    }

    router.push('/')
  }

  return (
    <main style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h1>Se connecter</h1>
      <form onSubmit={handleSubmit}>
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
        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
        <button type="submit" disabled={chargement} style={buttonStyle}>
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Pas encore de compte ? <a href="/inscription">S'inscrire</a>
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