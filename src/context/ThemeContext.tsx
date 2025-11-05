import { createContext } from "react"
export type ThemeProviderState = {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}
const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}
export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)