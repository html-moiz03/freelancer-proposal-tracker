import { createContext, useContext, useState, useEffect } from 'react'
import { scopedKey } from '../utils/accountStorage'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(scopedKey('fpt_theme')) === 'dark'
  })

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem(scopedKey('fpt_accent')) || '#4F46E5'
  })

  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem(scopedKey('fpt_compact_mode')) === 'true'
  })

  const [animations, setAnimations] = useState(() => {
    return localStorage.getItem(scopedKey('fpt_animations')) !== 'false'
  })

  useEffect(() => {
    localStorage.setItem(scopedKey('fpt_theme'), isDark ? 'dark' : 'light')
    document.body.style.backgroundColor = isDark ? '#1a1a2e' : '#F7F6F3'
    document.body.style.color = isDark ? '#e2e8f0' : '#37352F'
    // Lets index.css target dark mode for things inline styles can't reach,
    // like the native browser icon inside <input type="date"/"time">.
    document.body.classList.toggle('fpt-dark', isDark)
  }, [isDark])

  useEffect(() => {
    localStorage.setItem(scopedKey('fpt_compact_mode'), String(compactMode))
    document.body.classList.toggle('fpt-compact', compactMode)
  }, [compactMode])

  useEffect(() => {
    localStorage.setItem(scopedKey('fpt_animations'), String(animations))
    document.body.classList.toggle('fpt-no-animations', !animations)
  }, [animations])

  const toggleTheme = () => setIsDark(!isDark)

  const updateAccent = (color) => {
    setAccent(color)
    localStorage.setItem(scopedKey('fpt_accent'), color)
  }

  const toggleCompactMode = () => setCompactMode(prev => !prev)
  const toggleAnimations = () => setAnimations(prev => !prev)

  return (
    <ThemeContext.Provider value={{
      isDark, toggleTheme, accent, updateAccent,
      compactMode, toggleCompactMode,
      animations, toggleAnimations,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
