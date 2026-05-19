import React, { createContext, useContext, useState } from "react";
import { getSession, logout as authLogout } from "../auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  function refresh() { setSession(getSession()); }
  function logout() { authLogout(); setSession(null); }

  return (
    <AuthContext.Provider value={{ session, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
