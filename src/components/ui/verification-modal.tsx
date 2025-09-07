import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useVerification } from '@/hooks/use-verification';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'phone' | 'cpf';
  contactValue: string;
  onSuccess: () => void;
}

export const VerificationModal = ({
  isOpen,
  onClose,
  type,
  contactValue,
  onSuccess
}: VerificationModalProps) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { loading, verifyCode } = useVerification();

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setTimeLeft(300);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      return;
    }

    const result = await verifyCode(code, type);
    
    if (result.success) {
      onSuccess();
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTitle = () => {
    return type === 'phone' ? 'Verificar Telefone' : 'Verificar CPF';
  };

  const getDescription = () => {
    if (type === 'phone') {
      return `Enviamos um código de 6 dígitos via SMS para ${contactValue}`;
    }
    return `Código de verificação gerado para o CPF ${contactValue}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {getDescription()}
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="verification-code">Código de Verificação</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          {timeLeft > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Código expira em: <span className="font-medium">{formatTime(timeLeft)}</span>
            </p>
          )}

          {timeLeft === 0 && (
            <p className="text-sm text-destructive text-center">
              Código expirado. Solicite um novo código.
            </p>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleVerify} 
              disabled={loading || code.length !== 6 || timeLeft === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};