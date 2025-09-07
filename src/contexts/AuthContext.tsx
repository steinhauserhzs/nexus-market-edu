import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  

  const fetchProfile = async (userId: string) => {
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
      
      // Type conversion for role field
      return {
        ...data,
        role: (data.role as 'user' | 'seller' | 'admin') || 'user'
      };
    } catch (error) {
      logger.error('Error fetching profile', error);
      return null;
    }
  };

  // Secure function - removed CPF/phone lookup for security reasons
  // Users should use their email to login to prevent enumeration attacks
  const findUserByIdentifier = async (identifier: string) => {
    try {
      // Only allow email-based lookups for security
      if (!identifier.includes('@')) {
        return { 
          user: null, 
          error: { message: 'Por segurança, use seu email para fazer login' } 
        };
      }

      // Check if email exists (secure boolean check only)
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
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Login com Google
  const signInWithGoogle = async () => {
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
  };

  // Separate function to handle profile setup outside auth callback
  const setupUserProfile = async (user: User) => {
    try {
      // Ensure profile exists
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
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          // Defer async profile setup to avoid callback deadlocks
          setTimeout(() => {
            if (mounted) {
              setupUserProfile(session.user);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
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
  }, []); // Empty dependencies - this effect should only run once

  const signUp = async (email: string, password: string, fullName: string, additionalData: any = {}) => {
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
            role: 'seller',  // Todos usuários começam como vendedores
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
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      console.info('[AuthContext] signIn start', { identifierType: identifier.includes('@') ? 'email' : 'other' });
      let email = identifier;
      
      // Se não for email, busca o email pelo CPF ou telefone
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
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};