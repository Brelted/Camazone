'use client'
import { useTheme } from '@/lib/ThemeContext'

export default function Favoris() {
  const { lang } = useTheme()

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>
        {lang === 'fr' ? '❤️ Mes favoris' : '❤️ My favorites'}
      </h1>
      <div style={emptyStyle}>
        <p style={{ fontSize: '3rem' }}>❤️</p>
        <p style={{ color: 'var(--text2)', marginTop: '1rem' }}>
          {lang === 'fr'
            ? 'Vous n\'avez pas encore de favoris.'
            : 'You have no favorites yet.'}
        </p>
        <a href="/catalogue" style={btnStyle}>
          {lang === 'fr' ? '🛒 Découvrir des produits' : '🛒 Discover products'}
        </a>
      </div>
    </main>
  )
}

const pageStyle = { maxWidth: '800px', margin: '0 auto', padding: '2rem' }
const titleStyle = { fontFamily: 'Georgia,serif', fontSize: '1.5rem', color: 'var(--or-dark)', marginBottom: '2rem' }
const emptyStyle = { textAlign: 'center', padding: '4rem 2rem' }
const btnStyle = {
  display: 'inline-block', marginTop: '1.5rem',
  padding: '0.8rem 1.5rem', background: '#C8841A',
  color: 'white', borderRadius: '8px',
  fontWeight: '700', textDecoration: 'none',
}