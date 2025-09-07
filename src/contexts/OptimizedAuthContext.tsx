import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'seller' | 'admin';
  avatar_url: string | null;
  bio: string | null;
  pix_key: string | null;
  tax_id: string | null;
  seller_slug: string | null;
  is_verified: boolean;
  
  // Novos campos expandidos
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  gender: string | null;
  profession: string | null;
  company: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  
  // Endereço
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  
  // Preferências
  preferred_language: string;
  timezone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  
  // Verificações
  phone_verified: boolean;
  cpf_verified: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  login_method: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, additionalData?: any) => Promise<{ error: any }>;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  findUserByIdentifier: (identifier: string) => Promise<{ user: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const OptimizedAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cache profile data para evitar fetch desnecessário
  const profileCache = useMemo(() => new Map<string, { data: Profile | null; timestamp: number }>(), []);
  
  const fetchProfile = useCallback(async (userId: string) => {
    // Check cache first (5 minutes)
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        logger.error('Error fetching profile', error);
        return null;
      }
      
      const profileData = {
        ...data,
        role: (data.role as 'user' | 'seller' | 'admin') || 'user'
      };
      
      // Cache the result
      profileCache.set(userId, { data: profileData, timestamp: Date.now() });
      
      return profileData;
    } catch (error) {
      logger.error('Error fetching profile', error);
      return null;
    }
  }, [profileCache]);

  // Memoized handlers para evitar re-renders
  const findUserByIdentifier = useCallback(async (identifier: string) => {
    try {
      if (!identifier.includes('@')) {
        return { 
          user: null, 
          error: { message: 'Por segurança, use seu email para fazer login' } 
        };
      }

      const { data: emailExists, error } = await supabase.rpc('email_exists_for_login', {
        p_email: identifier
      });

      if (error) {
        console.error('[AuthContext] Email check error:', error);
        return { user: null, error };
      }

      if (!emailExists) {
        return { 
          user: null, 
          error: { message: 'Email não encontrado' } 
        };
      }

      return { user: { email: identifier }, error: null };
    } catch (error: any) {
      console.error('[AuthContext] findUserByIdentifier error:', error);
      return { user: null, error };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      // Clear cache to force refresh
      profileCache.delete(user.id);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile, profileCache]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }, []);

  const setupUserProfile = useCallback(async (user: User) => {
    try {
      const { data: existing, error: existingErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingErr || !existing) {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email || '',
          full_name: (user.user_metadata as any)?.full_name || null,
          avatar_url: (user.user_metadata as any)?.avatar_url || null,
          role: 'user',
          preferred_language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
        });
      }

      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    } catch (e) {
      console.error('Auth change post-processing error', e);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          setTimeout(() => {
            if (mounted) {
              setupUserProfile(session.user);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          profileCache.clear(); // Clear cache on signout
        }
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              setupUserProfile(session.user);
            }
          }, 0);
        }
      })
      .catch((error) => {
        console.error('Error getting session:', error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setupUserProfile, profileCache]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, additionalData: any = {}) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: additionalData.phone || null,
            cpf: additionalData.cpf || null,
            birth_date: additionalData.birth_date || null,
            gender: additionalData.gender || null,
            profession: additionalData.profession || null,
            city: additionalData.city || null,
            state: additionalData.state || null,
            role: 'seller',
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }, []);

  const signIn = useCallback(async (identifier: string, password: string) => {
    try {
      console.info('[AuthContext] signIn start', { identifierType: identifier.includes('@') ? 'email' : 'other' });
      let email = identifier;
      
      if (!identifier.includes('@')) {
        const { user: profileData, error: findError } = await findUserByIdentifier(identifier);
        console.info('[AuthContext] findUserByIdentifier', { hasUser: !!profileData, findError });
        
        if (findError || !profileData) {
          throw new Error('Usuário não encontrado com este CPF/telefone');
        }
        
        email = profileData.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.info('[AuthContext] signInWithPassword done', { error });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('[AuthContext] signIn error', error);
      return { error };
    }
  }, [findUserByIdentifier]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      profileCache.clear(); // Clear cache on signout
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [profileCache]);

  // Memoize value para evitar re-renders desnecessários
  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    findUserByIdentifier,
  }), [user, profile, session, loading, signUp, signIn, signInWithGoogle, signOut, refreshProfile, findUserByIdentifier]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};