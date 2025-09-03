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
import { Eye, EyeOff, Mail, Phone, CreditCard, Chrome } from "lucide-react";

const AdvancedSigninForm = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [savedCredentials, setSavedCredentials] = useLocalStorage('rememberedCredentials', null);
  const { toast } = useToast();

  // Load saved credentials on component mount
  useEffect(() => {
    if (savedCredentials) {
      setIdentifier(savedCredentials.identifier);
      setPassword(savedCredentials.password);
      setRememberMe(true);
    }
  }, [savedCredentials]);

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
    
    if (!identifier || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email/CPF/telefone e senha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(identifier, password);
      
      if (error) {
        throw error;
      }

      // Save credentials if remember me is checked
      if (rememberMe) {
        setSavedCredentials({ identifier, password });
      } else {
        setSavedCredentials(null);
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
      
      // Redirect será tratado pelo AuthContext
    } catch (error: any) {
      let errorMessage = "Erro no login. Tente novamente.";
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Email/CPF/telefone ou senha incorretos";
      } else if (error.message.includes('not found')) {
        errorMessage = "Usuário não encontrado";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
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
        {/* Google Login */}
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

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

          <div className="flex items-center justify-between">
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
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto text-sm"
            >
              Esqueci minha senha
            </Button>
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