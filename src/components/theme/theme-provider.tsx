import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

export type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isMobileDevice: boolean
  isDarkTheme: boolean
  isInitialized: boolean
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize theme
  useEffect(() => {
    try {
      // Get stored theme
      const stored = localStorage.getItem("SmartMess-theme")
      const initialTheme = (stored === "dark" || stored === "light" || stored === "system") 
        ? stored 
        : defaultTheme
      
      setThemeState(initialTheme)
      
      // Apply theme
      const isDark = initialTheme === "dark" || 
        (initialTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      
      // Force apply theme immediately
      if (isDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      setIsDarkTheme(isDark)
      
      // Check mobile device
      setIsMobileDevice(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))
      
      // Mark as initialized
      setIsInitialized(true)
      
      console.log("Theme initialized:", { initialTheme, isDark, stored })
    } catch (error) {
      console.warn("Theme initialization error:", error)
      setIsInitialized(true)
    }
  }, [defaultTheme])

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      setThemeState(newTheme)
      localStorage.setItem("SmartMess-theme", newTheme)
      
      const isDark = newTheme === "dark" || 
        (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      
      // Force apply theme immediately
      if (isDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      setIsDarkTheme(isDark)
      
      console.log("Theme changed:", { newTheme, isDark })
    } catch (error) {
      console.warn("Theme setting error:", error)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
  }, [theme, setTheme])

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isMobileDevice,
    isDarkTheme,
    isInitialized
  }

  // Prevent theme flickering by not rendering until initialized
  if (!isInitialized) {
    return null
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 