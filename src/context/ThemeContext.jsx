import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('fpt_theme') === 'dark'
  })

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('fpt_accent') || '#4F46E5'
  })

  useEffect(() => {
    localStorage.setItem('fpt_theme', isDark ? 'dark' : 'light')
    document.body.style.backgroundColor = isDark ? '#1a1a2e' : '#F7F6F3'
    document.body.style.color = isDark ? '#e2e8f0' : '#37352F'
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  const updateAccent = (color) => {
    setAccent(color)
    localStorage.setItem('fpt_accent', color)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, accent, updateAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}