import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SupabaseContext = createContext<{ supabase: SupabaseClient | null }>({ supabase: null });

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: 'https://gaznjgjkftybxfvtogmn.supabase.co'
            }
          });
          setAccessToken(token);
        } catch (error) {
          console.error('Error getting access token', error);
          setAccessToken(null);
        }
      } else {
        setAccessToken(null);
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const supabaseClient = useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: accessToken ? {
          Authorization: `Bearer ${accessToken}`,
        } : {},
      },
    });
  }, [accessToken]);

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);
