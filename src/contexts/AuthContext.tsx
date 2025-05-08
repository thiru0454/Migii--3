
import React, { createContext, useContext } from "react";
import { useAuthProvider } from "@/hooks/useAuthProvider";
import type { User, UserType } from "@/types/auth";

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  loginWithPhone: (phone: string) => Promise<string>;
  verifyOtp: (verificationId: string, otp: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
};

export * from "@/components/auth/ProtectedRoutes";
export type { User, UserType };
