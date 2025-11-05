import { useEffect, useState } from "react"
import { ThemeProviderContext, type ThemeProviderState } from "@/context/ThemeContext"
type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: "light" | "dark" | "system"
  storageKey?: string
}
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
    return defaultTheme as "light" | "dark"
  })
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])
  const value: ThemeProviderState = {
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