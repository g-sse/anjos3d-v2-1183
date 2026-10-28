import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import "../admin-appearance.css";

type Theme = "dark" | "light";
const key = "anjos3d.admin.theme";
const AppearanceContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });
export function AdminAppearance({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return localStorage.getItem(key) === "light" ? "light" : "dark"; } catch { return "dark"; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, theme); } catch { /* Preference remains usable without storage. */ }
  }, [theme]);
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === key) setTheme(event.newValue === "light" ? "light" : "dark"); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return <AppearanceContext.Provider value={{ theme, toggle: () => setTheme(value => value === "dark" ? "light" : "dark") }}><div className="admin-surface" data-theme={theme}>{children}</div></AppearanceContext.Provider>;
}
export function AdminThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useContext(AppearanceContext);
  return <button className={`admin-theme-toggle ${className}`} type="button" onClick={toggle} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={theme === "light"}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === "dark" ? "MODO CLARO" : "MODO ESCURO"}</span></button>;
}