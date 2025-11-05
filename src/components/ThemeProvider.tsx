import { createContext, useContext, useEffect, useState } from "react"
type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: "light" | "dark" | "system"
  storageKey?: string
}
type ThemeProviderState = {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}
const initialState: ThemeProviderState = {
  theme: "system" as any, // Will be resolved to light/dark in useEffect
  setTheme: () => null,
}
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const storedTheme = localStorage.getItem(storageKey) as "light" | "dark" | null
    if (storedTheme) return storedTheme
    if (defaultTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return defaultTheme
  })
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])
  const value = {
    theme,
    setTheme: (newTheme: "light" | "dark") => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}