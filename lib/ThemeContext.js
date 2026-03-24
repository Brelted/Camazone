'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [lang, setLang] = useState('fr')

  // Détecter la langue du navigateur au démarrage
  useEffect(() => {
    const browserLang = navigator.language?.startsWith('fr') ? 'fr' : 'en'
    setLang(browserLang)

    const savedTheme = localStorage.getItem('camazone-theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('camazone-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleLang = () => setLang(l => l === 'fr' ? 'en' : 'fr')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, lang, toggleLang }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)