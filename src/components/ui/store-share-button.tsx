import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoreShareButtonProps {
  storeSlug: string;
  storeName: string;
  className?: string;
}

export default function StoreShareButton({ 
  storeSlug, 
  storeName,
  className 
}: StoreShareButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const storeUrl = `${window.location.origin}/loja/${storeSlug}`;
  const shareText = `Confira a loja ${storeName} na Nexus Market!`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: shareText,
          url: storeUrl,
        });
        toast.success('Compartilhado com sucesso!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Erro ao copiar link');
    }
  };

  const handleSocialShare = (platform: 'whatsapp' | 'telegram' | 'twitter') => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(storeUrl);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      toast.success('Abrindo compartilhamento...');
    }
  };

  // Se suporta Web Share API nativa, usar botão simples
  if (navigator.share) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Compartilhar
      </Button>
    );
  }

  // Fallback para dropdown com opções
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copiado!' : 'Copiar Link'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
          <span className="h-4 w-4 mr-2 text-green-600">📱</span>
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('telegram')}>
          <span className="h-4 w-4 mr-2 text-blue-500">✈️</span>
          Telegram
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
          <span className="h-4 w-4 mr-2 text-blue-400">🐦</span>
          Twitter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}