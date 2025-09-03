import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Mail, Phone, CreditCard, MapPin } from "lucide-react";

interface SignupFormData {
  // Dados básicos
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  
  // Dados pessoais
  phone: string;
  cpf: string;
  birth_date: string;
  gender: string;
  profession: string;
  
  // Endereço
  postal_code: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  
  // Preferências
  email_notifications: boolean;
  marketing_emails: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

const AdvancedSignupForm = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState("basic");
  const { toast } = useToast();

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    cpf: '',
    birth_date: '',
    gender: '',
    profession: '',
    postal_code: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    email_notifications: true,
    marketing_emails: false,
    terms_accepted: false,
    privacy_accepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    return true; // Validação básica - implementar algoritmo completo se necessário
  };

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  const validateStep = (step: string) => {
    const newErrors: Record<string, string> = {};

    if (step === "basic") {
      if (!formData.email) newErrors.email = "Email é obrigatório";
      if (!formData.email.includes('@')) newErrors.email = "Email inválido";
      if (!formData.password) newErrors.password = "Senha é obrigatória";
      if (formData.password.length < 6) newErrors.password = "Senha deve ter no mínimo 6 caracteres";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Senhas não coincidem";
      if (!formData.full_name) newErrors.full_name = "Nome completo é obrigatório";
    }

    if (step === "personal") {
      if (formData.phone && !validatePhone(formData.phone)) {
        newErrors.phone = "Telefone inválido";
      }
      if (formData.cpf && !validateCPF(formData.cpf)) {
        newErrors.cpf = "CPF inválido";
      }
    }

    if (step === "finish") {
      if (!formData.terms_accepted) newErrors.terms_accepted = "Aceite os termos de uso";
      if (!formData.privacy_accepted) newErrors.privacy_accepted = "Aceite a política de privacidade";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === "basic") setCurrentStep("personal");
      else if (currentStep === "personal") setCurrentStep("address");
      else if (currentStep === "address") setCurrentStep("finish");
    }
  };

  const handleBack = () => {
    if (currentStep === "personal") setCurrentStep("basic");
    else if (currentStep === "address") setCurrentStep("personal");
    else if (currentStep === "finish") setCurrentStep("address");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    if (currentStep !== "finish") {
      handleNext();
      return;
    }

    setLoading(true);
    try {
      const additionalData = {
        phone: formData.phone || null,
        cpf: formData.cpf || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        profession: formData.profession || null,
        postal_code: formData.postal_code || null,
        address_line1: formData.address_line1 || null,
        address_line2: formData.address_line2 || null,
        city: formData.city || null,
        state: formData.state || null,
        email_notifications: formData.email_notifications,
        marketing_emails: formData.marketing_emails,
      };

      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.full_name,
        additionalData
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para ativar sua conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const brasilStates = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Criar Conta Completa</CardTitle>
        <div className="flex justify-center space-x-2 mt-4">
          {["basic", "personal", "address", "finish"].map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${
                currentStep === step
                  ? "bg-accent"
                  : index < ["basic", "personal", "address", "finish"].indexOf(currentStep)
                  ? "bg-accent/60"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={currentStep} className="w-full">
            {/* Dados Básicos */}
            <TabsContent value="basic" className="space-y-4">
              <div className="text-center mb-4">
                <User className="w-12 h-12 mx-auto text-accent mb-2" />
                <h3 className="text-lg font-semibold">Dados Básicos</h3>
                <p className="text-sm text-muted-foreground">
                  Informações essenciais para sua conta
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className={errors.full_name ? "border-destructive" : ""}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={errors.password ? "border-destructive" : ""}
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
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            </TabsContent>

            {/* Dados Pessoais */}
            <TabsContent value="personal" className="space-y-4">
              <div className="text-center mb-4">
                <Phone className="w-12 h-12 mx-auto text-accent mb-2" />
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                <p className="text-sm text-muted-foreground">
                  Informações para personalizar sua experiência
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      phone: formatPhone(e.target.value) 
                    }))}
                    placeholder="(11) 99999-9999"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cpf: formatCPF(e.target.value) 
                    }))}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? "border-destructive" : ""}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">{errors.cpf}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="nao-binario">Não-binário</SelectItem>
                      <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profissão</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  placeholder="Ex: Desenvolvedor, Designer, etc."
                />
              </div>
            </TabsContent>

            {/* Endereço */}
            <TabsContent value="address" className="space-y-4">
              <div className="text-center mb-4">
                <MapPin className="w-12 h-12 mx-auto text-accent mb-2" />
                <h3 className="text-lg font-semibold">Endereço</h3>
                <p className="text-sm text-muted-foreground">
                  Informações de localização (opcional)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">CEP</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      postal_code: formatCEP(e.target.value) 
                    }))}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line1">Endereço</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                  placeholder="Rua, número"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line2">Complemento</Label>
                  <Input
                    id="address_line2"
                    value={formData.address_line2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                    placeholder="Apartamento, sala, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {brasilStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Finalização */}
            <TabsContent value="finish" className="space-y-4">
              <div className="text-center mb-4">
                <CreditCard className="w-12 h-12 mx-auto text-accent mb-2" />
                <h3 className="text-lg font-semibold">Finalizar Cadastro</h3>
                <p className="text-sm text-muted-foreground">
                  Preferências e aceite dos termos
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email_notifications"
                    checked={formData.email_notifications}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, email_notifications: !!checked }))
                    }
                  />
                  <Label htmlFor="email_notifications" className="text-sm">
                    Receber notificações por email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing_emails"
                    checked={formData.marketing_emails}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, marketing_emails: !!checked }))
                    }
                  />
                  <Label htmlFor="marketing_emails" className="text-sm">
                    Receber emails promocionais
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms_accepted"
                    checked={formData.terms_accepted}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, terms_accepted: !!checked }))
                    }
                  />
                  <Label htmlFor="terms_accepted" className="text-sm">
                    Aceito os <a href="#" className="text-accent hover:underline">termos de uso</a> *
                  </Label>
                </div>
                {errors.terms_accepted && (
                  <p className="text-sm text-destructive">{errors.terms_accepted}</p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy_accepted"
                    checked={formData.privacy_accepted}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, privacy_accepted: !!checked }))
                    }
                  />
                  <Label htmlFor="privacy_accepted" className="text-sm">
                    Aceito a <a href="#" className="text-accent hover:underline">política de privacidade</a> *
                  </Label>
                </div>
                {errors.privacy_accepted && (
                  <p className="text-sm text-destructive">{errors.privacy_accepted}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {currentStep !== "basic" && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            )}
            
            <div className="ml-auto">
              <Button type="submit" disabled={loading}>
                {loading 
                  ? "Criando conta..." 
                  : currentStep === "finish" 
                    ? "Criar Conta" 
                    : "Continuar"
                }
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdvancedSignupForm;