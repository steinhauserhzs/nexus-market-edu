import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { Mic, MicOff, Volume2, VolumeX, Settings, Play, Pause, Square } from 'lucide-react';

export default function VoiceAssistant() {
  const { 
    isPlaying, 
    isLoading, 
    speak, 
    speakWithPreset, 
    stop, 
    pause, 
    resume, 
    voicePresets 
  } = useVoiceAssistant();

  const [testText, setTestText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof voicePresets>('narrator');

  const handleTestSpeak = async () => {
    if (!testText.trim()) return;
    
    try {
      await speakWithPreset(testText, selectedPreset);
    } catch (error) {
      console.error('Error speaking:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative"
        >
          {isPlaying ? (
            <Volume2 className="h-4 w-4 text-green-500" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          
          {isLoading && (
            <div className="absolute -top-1 -right-1">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Assistente de Voz
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isPlaying ? 'default' : 'secondary'}>
                {isLoading ? 'Processando...' : isPlaying ? 'Reproduzindo' : 'Parado'}
              </Badge>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {isPlaying ? (
                <>
                  <Button size="sm" variant="outline" onClick={pause}>
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={resume}>
                    <Play className="h-4 w-4" />
                  </Button>
                </>
              ) : null}
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={stop}
                disabled={!isPlaying}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>

            {/* Test Section */}
            <div className="space-y-3 pt-3 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Testar Voz:</label>
                
                <Select value={selectedPreset} onValueChange={(value: keyof typeof voicePresets) => setSelectedPreset(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="narrator">Narrador</SelectItem>
                    <SelectItem value="assistant">Assistente</SelectItem>
                    <SelectItem value="energetic">Energético</SelectItem>
                    <SelectItem value="calm">Calmo</SelectItem>
                  </SelectContent>
                </Select>
                
                <Textarea
                  placeholder="Digite o texto para testar..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  rows={3}
                />
                
                <Button 
                  size="sm" 
                  onClick={handleTestSpeak}
                  disabled={isLoading || !testText.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Processando...
                    </div>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Falar Texto
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-3 border-t">
              <label className="text-sm font-medium">Ações Rápidas:</label>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => speak('Bem-vindo à nossa plataforma!')}
                  disabled={isLoading}
                >
                  Boas-vindas
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => speak('Parabéns por completar este conteúdo!')}
                  disabled={isLoading}
                >
                  Parabéns
                </Button>
              </div>
            </div>

            {/* Voice Presets Info */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p><strong>Narrador:</strong> Ideal para conteúdo educacional</p>
              <p><strong>Assistente:</strong> Para notificações e avisos</p>
              <p><strong>Energético:</strong> Para conquistas e celebrações</p>
              <p><strong>Calmo:</strong> Para relaxamento e meditação</p>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}