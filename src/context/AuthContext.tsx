"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (
    email: string,
    pass: string,
    fullName: string,
    phone: string,
    role: UserRole,
    vendorDetails?: {
      shopName: string;
      area: string;
      categories: string[];
      businessAddress: string;
    }
  ) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Safety timeout: Never leave loading true for more than 1.5s
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimer);
      setUser(currentUser);

      if (currentUser) {
        try {
          const res = await fetch(`/api/auth/profile?userId=${currentUser.uid}&email=${encodeURIComponent(currentUser.email || "")}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile) {
              setProfile(data.profile as UserProfile);
            }
          }
        } catch (err) {
          console.warn("Could not load user profile via API:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribeAuth();
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    return await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (
    email: string,
    pass: string,
    fullName: string,
    phone: string,
    role: UserRole,
    vendorDetails?: {
      shopName: string;
      area: string;
      categories: string[];
      businessAddress: string;
    }
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    try {
      // Send email verification link
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn("Failed to send verification email immediately:", e);
    }

    // Call secure server backend endpoint to register profile and assign verified custom claims
    const res = await fetch("/api/auth/register-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: uid,
        email,
        fullName,
        phoneNumber: phone,
        role,
        vendorDetails,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to initialize user profile on backend");
    }

    return cred.user;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const res = await fetch(`/api/auth/profile?userId=${user.uid}&email=${encodeURIComponent(user.email || "")}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile as UserProfile);
          }
        }
      } catch (e) {
        console.warn("Profile refresh error:", e);
      }
    }
  };

  const role = profile?.role || null;
  const isAdmin = role === "admin";
  const isVendor = role === "vendor";
  const isCustomer = role === "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isAdmin,
        isVendor,
        isCustomer,
        signIn,
        signUp,
        resetPassword,
        resendVerification,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
