// Validadores utilitários para formulários

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do algoritmo do CPF
  let sum = 0;
  let remainder;
  
  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Valida segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Deve ter 10 ou 11 dígitos
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Verifica código de área (11-99)
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  
  // Verifica se é celular (9 dígitos após área) ou fixo (8 dígitos)
  const restNumber = cleanPhone.substring(2);
  if (restNumber.length === 9) {
    // Celular - deve começar com 9
    return restNumber[0] === '9';
  } else if (restNumber.length === 8) {
    // Fixo - não pode começar com 0 ou 1
    return !['0', '1'].includes(restNumber[0]);
  }
  
  return false;
};

export const validateCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return cleanCEP.length === 8;
};

export const validatePassword = (password: string): { isValid: boolean; messages: string[] } => {
  const messages: string[] = [];
  
  if (password.length < 8) {
    messages.push("Deve ter pelo menos 8 caracteres");
  }
  
  if (!/[A-Z]/.test(password)) {
    messages.push("Deve conter pelo menos 1 letra maiúscula");
  }
  
  if (!/[a-z]/.test(password)) {
    messages.push("Deve conter pelo menos 1 letra minúscula");
  }
  
  if (!/\d/.test(password)) {
    messages.push("Deve conter pelo menos 1 número");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    messages.push("Deve conter pelo menos 1 caractere especial");
  }
  
  return {
    isValid: messages.length === 0,
    messages
  };
};

// Formatadores
export const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/[^\d]/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/[^\d]/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const formatCEP = (cep: string): string => {
  const numbers = cep.replace(/[^\d]/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatPrice = (cents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents / 100);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
};