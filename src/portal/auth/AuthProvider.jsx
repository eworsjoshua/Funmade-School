import { useCallback, useEffect, useState } from "react";
import { api, setAuthFailureHandler, tokens } from "../api/client";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokens.clear();
    setUser(null);
  }, []);

  // On first load, restore the session if a refresh token is saved
  useEffect(() => {
    setAuthFailureHandler(() => setUser(null));
    let cancelled = false;
    (async () => {
      if (tokens.getRefresh()) {
        try {
          const me = await api("/api/auth/me/");
          if (!cancelled) setUser(me);
        } catch {
          tokens.clear();
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api("/api/auth/login/", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    tokens.setAccess(data.access);
    tokens.setRefresh(data.refresh);
    const me = await api("/api/auth/me/");
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
