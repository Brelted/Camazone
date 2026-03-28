'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'
import { t } from '@/lib/translations'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme, lang, toggleLang } = useTheme()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [menuOuvert, setMenuOuvert] = useState(null)
  const [sousMenuProduits, setSousMenuProduits] = useState(false)
  const navRef = useRef(null)
  const tx = t[lang].nav

  useEffect(() => {
    const chargerUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('users').select('role, nom, email, avatar').eq('id', user.id).single()
        setRole(data)
      }
    }
    chargerUser()
  }, [])

  // Fermer les menus si on clique dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOuvert(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleMenu = (menu) => {
    setMenuOuvert(menuOuvert === menu ? null : menu)
    setSousMenuProduits(false)
  }

  const seDeconnecter = async () => {
    await supabase.auth.signOut()
    setUser(null); setRole(null)
    setMenuOuvert(null)
    router.push('/')
  }

  const naviguer = (path) => {
    setMenuOuvert(null)
    router.push(path)
  }

  const tabActive = (path) => pathname === path

  return (
    <>
      {/* ── Navbar haut ── */}
      <nav style={navStyle} ref={navRef}>

        {/* Logo */}
        <a href="/" style={logoLinkStyle}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <circle cx="13" cy="16" r="12" fill="#C8841A"/>
            <circle cx="17" cy="13" r="9" fill="#1a1a1a"/>
          </svg>
          <div>
            <div style={logoTextStyle}>
              <span style={{ color: '#C8841A' }}>CAM</span>
              <span style={{ color: '#E85D24' }}>AZONE</span>
            </div>
            <div style={logoSubStyle}>
              {t[lang].hero.slogan}
            </div>
          </div>
        </a>

        {/* Icônes droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Bouton Paramètres */}
          <button style={iconBtnStyle} onClick={() => toggleMenu('settings')}>
            ⚙️
          </button>

          {/* Bouton Profil */}
          <button style={iconBtnStyle} onClick={() => toggleMenu('profile')}>
            {role?.avatar ? (
              <img
                src={role.avatar}
                alt="Avatar"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              '👤'
            )}
          </button>

          {/* ── Menu Paramètres ── */}
          {menuOuvert === 'settings' && (
            <div style={dropdownStyle}>
              <div style={dropdownHeaderStyle}>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                  {lang === 'fr' ? 'Paramètres' : 'Settings'}
                </p>
              </div>

              {/* Mode sombre/clair */}
              <div style={menuRowStyle}>
                <span style={menuLabelStyle}>
                  {theme === 'dark' ? '🌙' : '☀️'}
                  {lang === 'fr' ? ' Mode sombre' : ' Dark mode'}
                </span>
                <div onClick={toggleTheme} style={toggleTrackStyle(theme === 'dark')}>
                  <div style={toggleDotStyle(theme === 'dark')} />
                </div>
              </div>

              {/* Langue */}
              <div style={menuRowStyle}>
                <span style={menuLabelStyle}>
                  🌍 {lang === 'fr' ? 'Langue' : 'Language'}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => lang !== 'fr' && toggleLang()}
                    style={langPillStyle(lang === 'fr')}>FR</button>
                  <button onClick={() => lang !== 'en' && toggleLang()}
                    style={langPillStyle(lang === 'en')}>EN</button>
                </div>
              </div>

              {/* Déconnexion */}
              {user && (
                <button onClick={seDeconnecter} style={menuItemStyle('#E85D24')}>
                  🚪 {tx.deconnexion}
                </button>
              )}
              {!user && (
                <>
                  <button onClick={() => naviguer('/connexion')} style={menuItemStyle('#C8841A')}>
                    🔑 {tx.connexion}
                  </button>
                  <button onClick={() => naviguer('/inscription')} style={menuItemStyle('#C8841A')}>
                    ✨ {tx.inscription}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Menu Profil ── */}
          {menuOuvert === 'profile' && (
            <div style={{ ...dropdownStyle, right: '0' }}>
              {user ? (
                <>
                  <div style={dropdownHeaderStyle}>
                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                      {role?.nom || 'Mon compte'}
                    </p>
                    <p style={{ color: '#FAEEDA', fontSize: '11px', marginTop: '2px' }}>
                      {user.email} · {role?.role === 'vendeur'
                        ? (lang === 'fr' ? 'Vendeur' : 'Seller')
                        : (lang === 'fr' ? 'Acheteur' : 'Buyer')}
                    </p>
                  </div>

                  <button onClick={() => naviguer('/profil')} style={menuItemStyle('#c4a882')}>
                    ✏️ {lang === 'fr' ? 'Modifier mon profil' : 'Edit my profile'}
                  </button>

                  {role?.role === 'vendeur' && (
                    <>
                      <button
                        onClick={() => setSousMenuProduits(!sousMenuProduits)}
                        style={menuItemStyle('#c4a882')}>
                        🛍️ {tx.mesProduits}
                        <span style={{ marginLeft: 'auto', color: '#C8841A' }}>
                          {sousMenuProduits ? '▾' : '▸'}
                        </span>
                      </button>
                      {sousMenuProduits && (
                        <div style={{ background: 'rgba(0,0,0,0.2)' }}>
                          <button onClick={() => naviguer('/vendeur/ajouter-produit')}
                            style={subMenuItemStyle}>
                            ➕ {lang === 'fr' ? 'Ajouter un produit' : 'Add a product'}
                          </button>
                          <button onClick={() => naviguer('/vendeur/mes-produits')}
                            style={subMenuItemStyle}>
                            📋 {lang === 'fr' ? 'Voir mes produits' : 'My products'}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  <button onClick={() => naviguer('/favoris')} style={menuItemStyle('#c4a882')}>
                    ⭐ {lang === 'fr' ? 'Mes favoris' : 'My favorites'}
                  </button>
                  {role?.role === 'vendeur' && (
  <button onClick={() => naviguer('/vendeur/dashboard')} style={menuItemStyle('#C8841A')}>
    📊 {lang === 'fr' ? 'Mon dashboard' : 'My dashboard'}
  </button>
)}
                </>
              ) : (
                <>
                  <div style={dropdownHeaderStyle}>
                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                      {lang === 'fr' ? 'Mon compte' : 'My account'}
                    </p>
                  </div>
                  <button onClick={() => naviguer('/connexion')} style={menuItemStyle('#C8841A')}>
                    🔑 {tx.connexion}
                  </button>
                  <button onClick={() => naviguer('/inscription')} style={menuItemStyle('#C8841A')}>
                    ✨ {tx.inscription}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Barre de navigation bas (mobile) ── */}
      <div style={tabBarStyle}>
        <a href="/" style={tabStyle(tabActive('/'))}>
          <span style={{ fontSize: '20px' }}>🏠</span>
          <span>{lang === 'fr' ? 'Accueil' : 'Home'}</span>
        </a>
        <a href="/catalogue" style={tabStyle(tabActive('/catalogue'))}>
          <span style={{ fontSize: '20px' }}>🛒</span>
          <span>{tx.catalogue}</span>
        </a>
        <a href="/favoris" style={tabStyle(tabActive('/favoris'))}>
          <span style={{ fontSize: '20px' }}>❤️</span>
          <span>{lang === 'fr' ? 'Favoris' : 'Favorites'}</span>
        </a>
      </div>

      {/* Espace pour compenser la barre du bas */}
      <div style={{ height: '64px' }} />
    </>
  )
}

const navStyle = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', padding: '0.7rem 1rem',
  background: '#1a1a1a', borderBottom: '3px solid #C8841A',
  position: 'sticky', top: 0, zIndex: 100,
}
const logoLinkStyle = {
  display: 'flex', alignItems: 'center',
  gap: '8px', textDecoration: 'none',
}
const logoTextStyle = {
  fontFamily: 'Georgia,serif', fontSize: '15px',
  fontWeight: '700', lineHeight: 1,
}
const logoSubStyle = {
  fontSize: '8px', color: '#C8841A', letterSpacing: '0.5px',
}
const iconBtnStyle = {
  width: '36px', height: '36px', borderRadius: '50%',
  background: '#2a2018', border: '1px solid #C8841A',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: '16px', position: 'relative',
}
const dropdownStyle = {
  position: 'absolute', top: '58px', right: '50px',
  background: '#1a1a1a', border: '1px solid #C8841A',
  borderRadius: '10px', width: '220px',
  overflow: 'hidden', zIndex: 200,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
}
const dropdownHeaderStyle = {
  padding: '10px 14px', background: '#C8841A',
}
const menuRowStyle = {
  display: 'flex', alignItems: 'center',
  justifyContent: 'space-between',
  padding: '11px 14px',
  borderBottom: '1px solid rgba(200,132,26,0.15)',
}
const menuLabelStyle = {
  color: '#c4a882', fontSize: '13px',
}
const toggleTrackStyle = (actif) => ({
  width: '36px', height: '20px',
  background: actif ? '#C8841A' : '#444',
  borderRadius: '10px', position: 'relative',
  cursor: 'pointer', transition: 'background 0.2s',
  flexShrink: 0,
})
const toggleDotStyle = (actif) => ({
  width: '14px', height: '14px',
  background: 'white', borderRadius: '50%',
  position: 'absolute', top: '3px',
  left: actif ? '19px' : '3px',
  transition: 'left 0.2s',
})
const langPillStyle = (actif) => ({
  padding: '2px 8px', borderRadius: '4px',
  fontSize: '11px', cursor: 'pointer',
  border: '1px solid #C8841A',
  background: actif ? '#C8841A' : 'transparent',
  color: actif ? 'white' : '#C8841A',
})
const menuItemStyle = (color) => ({
  width: '100%', padding: '11px 14px',
  display: 'flex', alignItems: 'center', gap: '10px',
  color, fontSize: '13px', cursor: 'pointer',
  background: 'transparent', border: 'none',
  borderBottom: '1px solid rgba(200,132,26,0.1)',
  textAlign: 'left',
})
const subMenuItemStyle = {
  width: '100%', padding: '9px 14px 9px 40px',
  color: '#888', fontSize: '12px', cursor: 'pointer',
  background: 'transparent', border: 'none',
  borderBottom: '1px solid rgba(200,132,26,0.1)',
  textAlign: 'left', display: 'block',
}
const tabBarStyle = {
  position: 'fixed', bottom: 0, left: 0, right: 0,
  background: '#1a1a1a', borderTop: '2px solid #C8841A',
  display: 'flex', justifyContent: 'space-around',
  padding: '8px 0', zIndex: 100,
}
const tabStyle = (actif) => ({
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: '2px',
  color: actif ? '#C8841A' : '#666',
  textDecoration: 'none', fontSize: '10px',
  fontWeight: actif ? '700' : '400',
  flex: 1, textAlign: 'center',
})
