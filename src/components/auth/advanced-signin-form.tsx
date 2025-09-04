import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSecurity } from "@/hooks/use-security";
import { Eye, EyeOff, Mail, Phone, CreditCard, Chrome, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

const AdvancedSigninForm = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberedIdentifier, setRememberedIdentifier] = useLocalStorage('rememberedIdentifier', '');
  const { toast } = useToast();
  
  // Enhanced security hooks
  const { 
    checkLimit, 
    isAllowed, 
    getRemaining, 
    validateField,
    logAuthAttempt,
    logSuspiciousActivity 
  } = useSecurity();

  // Load remembered identifier on component mount
  useEffect(() => {
    if (rememberedIdentifier) {
      setIdentifier(rememberedIdentifier);
      setRememberMe(true);
    }
  }, [rememberedIdentifier]);

  const getIdentifierType = (value: string) => {
    if (value.includes('@')) return 'email';
    if (/^\d{11}$/.test(value.replace(/[^\d]/g, ''))) return 'cpf';
    if (/^\d{10,11}$/.test(value.replace(/[^\d]/g, ''))) return 'phone';
    return 'unknown';
  };

  const getIdentifierIcon = () => {
    const type = getIdentifierType(identifier);
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'cpf': return <CreditCard className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getIdentifierPlaceholder = () => {
    const type = getIdentifierType(identifier);
    switch (type) {
      case 'email': return 'Digite seu email';
      case 'cpf': return 'Digite seu CPF';
      case 'phone': return 'Digite seu telefone';
      default: return 'Email, CPF ou telefone';
    }
  };

  const formatIdentifier = (value: string) => {
    const type = getIdentifierType(value);
    const numbers = value.replace(/[^\d]/g, '');
    
    if (type === 'cpf' && numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    if (type === 'phone' && numbers.length <= 11) {
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return value;
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes('@')) {
      setIdentifier(value);
    } else {
      setIdentifier(formatIdentifier(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.info('[Auth] Submitting login form', { hasIdentifier: !!identifier, hasPassword: !!password });
    
    // Check rate limit first
    const rateLimitResult = await checkLimit('login_attempt', undefined, 5, 300); // 5 attempts per 5 minutes
    if (!rateLimitResult.allowed) {
      toast({
        title: "Muitas tentativas",
        description: `Limite de tentativas excedido. Tente novamente em alguns minutos.`,
        variant: "destructive",
      });
      await logSuspiciousActivity('excessive_login_attempts', {
        identifier: identifier.substring(0, 3) + '...',
        remaining: rateLimitResult.remaining
      });
      return;
    }
    
    // Validate inputs
    const identifierValidation = await validateField('identifier', identifier, 'text');
    const passwordValidation = await validateField('password', password, 'text');
    
    if (!identifierValidation.isValid || !passwordValidation.isValid) {
      toast({
        title: "Dados inválidos",
        description: "Verifique os dados informados",
        variant: "destructive",
      });
      return;
    }
    
    if (!identifier || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email/CPF/telefone e senha",
        variant: "destructive",
      });
      return;
    }

    // Log suspicious patterns
    if (identifier.includes('<script') || password.includes('<script') ||
        identifier.includes('javascript:') || password.includes('javascript:')) {
      await logSuspiciousActivity('xss_attempt_login', {
        identifier: identifier.substring(0, 3) + '...'
      });
    }

    setLoading(true);
    let timeoutId: number | undefined;
    timeoutId = window.setTimeout(() => {
      console.warn('[Auth] Login timeout - resetting state');
      setLoading(false);
      toast({ title: 'Tempo esgotado', description: 'A conexão demorou muito. Tente novamente.', variant: 'destructive' });
    }, 15000);

    try {
      console.info('[Auth] Calling signIn...');
      const { error } = await signIn(identifierValidation.sanitized, passwordValidation.sanitized);
      console.info('[Auth] signIn returned', { error });
      
      if (error) {
        throw error;
      }

      // Log successful authentication
      await logAuthAttempt(true, 'email_password', {
        identifierType: getIdentifierType(identifier)
      });

      // Save identifier if remember me is checked (no password storage)
      if (rememberMe) {
        setRememberedIdentifier(identifier);
      } else {
        setRememberedIdentifier('');
      }

      // Clear timeout on success
      if (timeoutId) window.clearTimeout(timeoutId);

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });

      console.info('[Auth] Login success, aguardando redirecionamento automático pelo AuthContext/Auth page');
    } catch (error: any) {
      if (timeoutId) window.clearTimeout(timeoutId);

      // Log failed authentication
      await logAuthAttempt(false, 'email_password', {
        identifierType: getIdentifierType(identifier),
        error: error?.message || 'Unknown error'
      });

      let errorMessage = "Erro no login. Tente novamente.";
      
      if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = "Email/CPF/telefone ou senha incorretos";
        
        // Log potential brute force attempt
        const remaining = rateLimitResult.remaining - 1;
        if (remaining <= 1) {
          await logSuspiciousActivity('potential_brute_force', {
            identifier: identifier.substring(0, 3) + '...',
            remaining
          });
        }
      } else if (error?.message?.includes('not found')) {
        errorMessage = "Usuário não encontrado";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      logger.error('[Auth] Login error', error);
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
      console.info('[Auth] Resetting loading state');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }

      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o Google",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login com Google",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Entrar na Conta</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Use email, CPF ou telefone para entrar
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Google Login - Temporarily disabled until OAuth is configured in Supabase */}
        {/* 
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <Chrome className="w-4 h-4 mr-2" />
          {googleLoading ? "Entrando..." : "Entrar com Google"}
        </Button>
        */}

        {/* Separator removed since Google login is disabled */}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email, CPF ou Telefone</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {getIdentifierIcon()}
              </div>
              <Input
                id="identifier"
                value={identifier}
                onChange={handleIdentifierChange}
                placeholder={getIdentifierPlaceholder()}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {getIdentifierType(identifier) === 'email' && "Digite seu email"}
              {getIdentifierType(identifier) === 'cpf' && "Digite seu CPF (apenas números)"}
              {getIdentifierType(identifier) === 'phone' && "Digite seu telefone com DDD"}
              {getIdentifierType(identifier) === 'unknown' && "Digite email, CPF ou telefone"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Lembrar usuário e senha
              </Label>
            </div>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                className="p-0 h-auto text-sm"
                onClick={async () => {
                  const type = getIdentifierType(identifier);
                  if (type !== 'email' || !identifier) {
                    toast({
                      title: 'Informe seu email',
                      description: 'Para recuperar a senha, digite seu email no campo acima.',
                      variant: 'destructive',
                    });
                    return;
                  }
                  try {
                    const redirectTo = `${window.location.origin}/auth?type=recovery`;
                    const { error } = await supabase.auth.resetPasswordForEmail(identifier, { redirectTo });
                    if (error) throw error;
                    toast({ title: 'Email enviado', description: 'Verifique sua caixa de entrada para redefinir a senha.' });
                  } catch (err: any) {
                    toast({ title: 'Erro ao enviar email', description: err?.message || 'Tente novamente', variant: 'destructive' });
                  }
                }}
              >
                Esqueci minha senha
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Ainda não tem conta? </span>
          <Button variant="link" size="sm" className="p-0 h-auto">
            Criar conta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSigninForm;