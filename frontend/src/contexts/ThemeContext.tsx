import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type MouseEvent,
} from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggle: (
    eventOrElement?: MouseEvent<HTMLElement> | HTMLElement | null,
  ) => Promise<void>;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "_theme";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(
    async (eventOrElement?: MouseEvent<HTMLElement> | HTMLElement | null) => {
      const nextTheme: Theme = theme === "dark" ? "light" : "dark";

      // Detect origin element if an event or direct DOM element is passed
      let triggerEl: HTMLElement | null = null;
      if (eventOrElement) {
        if ("currentTarget" in eventOrElement) {
          triggerEl = eventOrElement.currentTarget as HTMLElement;
        } else if (eventOrElement instanceof HTMLElement) {
          triggerEl = eventOrElement;
        }
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Fallback if View Transitions API is not available or motion is reduced
      if (!document.startViewTransition || prefersReducedMotion) {
        setTheme(nextTheme);
        return;
      }

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme(nextTheme);
        });
      });

      await transition.ready;

      // Compute coordinate origin for the expanding circle
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;

      if (triggerEl) {
        const rect = triggerEl.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      const right = window.innerWidth - x;
      const bottom = window.innerHeight - y;
      const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    },
    [theme],
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        setTheme,
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
