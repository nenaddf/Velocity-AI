import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

const SupabaseContext = createContext<{ supabase: SupabaseClient | null }>({ supabase: null });

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(supabase);

  useEffect(() => {
    const setAuthHeader = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase credentials not found in environment variables.');
          }

          // Create a new client instance with the auth header
          const newClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });
          setSupabaseClient(newClient);
        } catch (error) {
          console.error('Error getting access token', error);
          setSupabaseClient(supabase); // Fallback to anon client
        }
      } else {
        setSupabaseClient(supabase); // Use anon client if not authenticated
      }
    };

    setAuthHeader();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);
