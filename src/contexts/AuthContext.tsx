import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      // Type conversion for role field
      return {
        ...data,
        role: (data.role as 'user' | 'seller' | 'admin') || 'user'
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Função para buscar usuário por CPF, telefone ou email
  const findUserByIdentifier = async (identifier: string) => {
    try {
      // Remove caracteres especiais
      const cleanIdentifier = identifier.replace(/[^\w@.-]/g, '');
      
      let query = supabase.from('profiles').select('*');
      
      // Determina o tipo de identificador
      if (cleanIdentifier.includes('@')) {
        // Email
        query = query.eq('email', cleanIdentifier);
      } else if (/^\d{10,11}$/.test(cleanIdentifier)) {
        // Telefone
        query = query.eq('phone', cleanIdentifier);
      } else if (/^\d{11}$/.test(cleanIdentifier)) {
        // CPF
        query = query.eq('cpf', cleanIdentifier);
      } else {
        return { user: null, error: { message: 'Formato de identificador inválido' } };
      }
      
      const { data, error } = await query.single();
      return { user: data, error };
    } catch (error: any) {
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

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = (event: string, session: Session | null) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        // Defer any async work to avoid deadlocks inside the callback
        setTimeout(async () => {
          try {
            // Ensure profile exists
            const { data: existing, error: existingErr } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user!.id)
              .maybeSingle();

            if (existingErr || !existing) {
              await supabase.from('profiles').upsert({
                id: session.user!.id,
                email: session.user!.email || '',
                full_name: (session.user!.user_metadata as any)?.full_name || null,
                avatar_url: (session.user!.user_metadata as any)?.avatar_url || null,
                role: 'user',
                preferred_language: 'pt-BR',
                timezone: 'America/Sao_Paulo',
              });
            }

            const profileData = await fetchProfile(session.user!.id);
            if (mounted) setProfile(profileData);
          } catch (e) {
            console.error('Auth change post-processing error', e);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setProfile(null);
      }

      if (mounted) setLoading(false);
    };

    // Subscribe FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthChange(event, session);
    });

    // THEN check existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        handleAuthChange('INITIAL_SESSION', session);
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
  }, []);

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
      
      // Se não for email, busca o email pelo CPF ou telefone (requer políticas que permitam esta leitura)
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

      // Atualizar método de login no perfil (adiado para fora do callback)
      setTimeout(async () => {
        try {
          await supabase
            .from('profiles')
            .update({ 
              login_method: identifier.includes('@') ? 'email' : (identifier.replace(/\D/g, '').length === 11 ? 'cpf' : 'phone'),
              last_login_at: new Date().toISOString()
            })
            .eq('email', email);
        } catch (e) {
          console.warn('[AuthContext] Failed to update profile login_method', e);
        }
      }, 500);

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