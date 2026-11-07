
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  getProfile,
  logoutUser
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("leavepro_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("leavepro_user");
      return null;
    }
  });

  const [loading, setLoading] = useState(
    () => !!localStorage.getItem("leavepro_token")
  );

  // Verify saved token when application loads
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("leavepro_token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // Save user session
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "leavepro_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("leavepro_user");
    }
  }, [user]);

  // Logout
  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
