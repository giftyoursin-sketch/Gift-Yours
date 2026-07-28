import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auth Methods
  const sendOtp = async (phone) => {
    // Format phone to E.164 if necessary (e.g. +91XXXXXXXXXX)
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });
    if (error) throw error;
    return data;
  };

  const verifyOtp = async (phone, token) => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms'
    });
    if (error) throw error;
    return data;
  };

  const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };
  
  const registerWithEmail = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      sendOtp,
      verifyOtp,
      loginWithEmail,
      registerWithEmail,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
