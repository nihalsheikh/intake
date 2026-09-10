import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/services";
import { TOKEN_KEY } from "@/lib/api";
import type { User, LoginCredentials, RegisterPayload } from "@/types/user";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(
    ({ user, token }: { user: User; token: string }): User => {
      localStorage.setItem(TOKEN_KEY, token);
      setUser(user);
      return user;
    },
    [],
  );

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      const res = await authApi.login(credentials);
      return persist(res);
    },
    [persist],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const res = await authApi.register(payload);
      return persist(res);
    },
    [persist],
  );

  const logout = useCallback((): void => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>): void => {
    setUser((u) => (u ? { ...u, ...patch } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
