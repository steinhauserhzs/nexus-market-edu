import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Check if user has already dismissed this before
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      if (!hasSeenPrompt) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      // Hide the install promotion
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 border-primary/20 bg-background/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-accent-foreground font-bold text-sm">N</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">Instalar Nexus Market</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Adicione à tela inicial para acesso rápido
            </p>
            
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstallClick} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Instalar
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Depois
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="w-8 h-8 p-0 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;