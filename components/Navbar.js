'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'
import { t } from '@/lib/translations'

export default function Navbar() {
  const router = useRouter()
  const { theme, toggleTheme, lang, toggleLang } = useTheme()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const tx = t[lang].nav

  useEffect(() => {
    const chargerUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('users').select('role').eq('id', user.id).single()
        setRole(data?.role)
      }
    }
    chargerUser()
  }, [])

  const seDeconnecter = async () => {
    await supabase.auth.signOut()
    setUser(null); setRole(null)
    router.push('/')
  }

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="15" cy="18" r="13" fill="#C8841A"/>
          <circle cx="19" cy="15" r="10" fill="#1a1a1a"/>
          <circle cx="19" cy="15" r="9" fill="#0f0d0a"/>
        </svg>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '700', lineHeight: 1 }}>
            <span style={{ color: '#C8841A' }}>CAM</span>
            <span style={{ color: '#E85D24' }}>AZONE</span>
          </div>
          <div style={{ fontSize: '9px', color: '#C8841A', letterSpacing: '0.5px' }}>
            {t[lang].hero.slogan}
          </div>
        </div>
      </a>

      {/* Liens */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="/catalogue" style={linkStyle}>{tx.catalogue}</a>

        {!user ? (
          <>
            <a href="/connexion" style={linkStyle}>{tx.connexion}</a>
            <a href="/inscription" style={btnStyle}>{tx.inscription}</a>
          </>
        ) : (
          <>
            {role === 'vendeur' && (
              <>
                <a href="/vendeur/mes-produits" style={linkStyle}>{tx.mesProduits}</a>
                <a href="/vendeur/ajouter-produit" style={btnStyle}>{tx.ajouter}</a>
              </>
            )}
            <button onClick={seDeconnecter} style={logoutStyle}>{tx.deconnexion}</button>
          </>
        )}

        {/* Switch langue */}
        <button onClick={toggleLang} style={langStyle}>
          {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
        </button>

        {/* Switch thème */}
        <button onClick={toggleTheme} style={themeStyle}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  )
}

const navStyle = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', padding: '0.8rem 1.2rem',
  background: '#1a1a1a', borderBottom: '3px solid #C8841A',
  position: 'sticky', top: 0, zIndex: 100,
  flexWrap: 'wrap', gap: '0.5rem',
}
const linkStyle = {
  color: '#c4a882', textDecoration: 'none',
  fontSize: '0.85rem', whiteSpace: 'nowrap',
}
const btnStyle = {
  padding: '0.4rem 0.8rem', background: '#C8841A',
  color: 'white', borderRadius: '6px',
  textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700',
  whiteSpace: 'nowrap',
}
const logoutStyle = {
  padding: '0.4rem 0.8rem', background: 'transparent',
  color: '#E85D24', border: '1px solid #E85D24',
  borderRadius: '6px', fontSize: '0.8rem', whiteSpace: 'nowrap',
}
const langStyle = {
  background: 'transparent', border: '1px solid #C8841A',
  color: '#C8841A', borderRadius: '6px',
  padding: '0.3rem 0.5rem', fontSize: '0.75rem',
  whiteSpace: 'nowrap',
}
const themeStyle = {
  background: 'transparent', border: 'none',
  fontSize: '1rem', cursor: 'pointer',
}
