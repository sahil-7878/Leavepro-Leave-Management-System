import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem("leavepro_user");
    return s ? JSON.parse(s) : null;
  });
  useEffect(() => {
    if (user) localStorage.setItem("leavepro_user", JSON.stringify(user));
    else localStorage.removeItem("leavepro_user");
  }, [user]);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
