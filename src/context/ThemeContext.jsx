import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('fpt_theme') === 'dark'
  })

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('fpt_accent') || '#4F46E5'
  })

  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('fpt_compact_mode') === 'true'
  })

  const [animations, setAnimations] = useState(() => {
    return localStorage.getItem('fpt_animations') !== 'false'
  })

  useEffect(() => {
    localStorage.setItem('fpt_theme', isDark ? 'dark' : 'light')
    document.body.style.backgroundColor = isDark ? '#1a1a2e' : '#F7F6F3'
    document.body.style.color = isDark ? '#e2e8f0' : '#37352F'
  }, [isDark])

  useEffect(() => {
    localStorage.setItem('fpt_compact_mode', String(compactMode))
    document.body.classList.toggle('fpt-compact', compactMode)
  }, [compactMode])

  useEffect(() => {
    localStorage.setItem('fpt_animations', String(animations))
    document.body.classList.toggle('fpt-no-animations', !animations)
  }, [animations])

  const toggleTheme = () => setIsDark(!isDark)

  const updateAccent = (color) => {
    setAccent(color)
    localStorage.setItem('fpt_accent', color)
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