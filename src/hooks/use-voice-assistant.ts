import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceSettings {
  voice_id: string;
  model_id: string;
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export const useVoiceAssistant = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const defaultSettings: VoiceSettings = {
    voice_id: '9BWtsMINqrJLrRacOk9x', // Aria voice
    model_id: 'eleven_multilingual_v2',
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  };

  const speak = useCallback(async (
    text: string, 
    settings: Partial<VoiceSettings> = {}
  ) => {
    if (isLoading) return;

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setIsPlaying(false);
    }

    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }

    setIsLoading(true);
    abortController.current = new AbortController();

    try {
      const voiceSettings = { ...defaultSettings, ...settings };

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice_id: voiceSettings.voice_id,
          model_id: voiceSettings.model_id,
          voice_settings: {
            stability: voiceSettings.stability,
            similarity_boost: voiceSettings.similarity_boost,
            style: voiceSettings.style,
            use_speaker_boost: voiceSettings.use_speaker_boost
          }
        }
      });

      if (error) {
        console.error('Error generating speech:', error);
        return;
      }

      if (!data.audio_url) {
        console.error('No audio URL received');
        return;
      }

      // Create and play audio
      const audio = new Audio();
      audio.src = data.audio_url;
      
      audio.onloadstart = () => setIsLoading(false);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Speech generation was cancelled');
      } else {
        console.error('Error in speak:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentAudio]);

  const stop = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    }

    setIsPlaying(false);
    setIsLoading(false);
  }, [currentAudio]);

  const pause = useCallback(() => {
    if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  }, [currentAudio, isPlaying]);

  const resume = useCallback(() => {
    if (currentAudio && !isPlaying) {
      currentAudio.play();
      setIsPlaying(true);
    }
  }, [currentAudio, isPlaying]);

  // Predefined voice presets
  const voicePresets = {
    narrator: {
      voice_id: '9BWtsMINqrJLrRacOk9x', // Aria
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.2
    },
    assistant: {
      voice_id: 'EXAVITQu4vr4xnSDxMaL', // Sarah
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0
    },
    energetic: {
      voice_id: 'TX3LPaxmHKxFdv7VOQHJ', // Liam
      stability: 0.3,
      similarity_boost: 0.7,
      style: 0.5
    },
    calm: {
      voice_id: 'pFZP5JQG7iQjIQuC4Bku', // Lily
      stability: 0.8,
      similarity_boost: 0.8,
      style: 0.1
    }
  };

  const speakWithPreset = useCallback((
    text: string, 
    preset: keyof typeof voicePresets
  ) => {
    speak(text, voicePresets[preset]);
  }, [speak]);

  // Content narration helpers
  const narrateContent = useCallback((content: string) => {
    // Clean up HTML tags and format for speech
    const cleanText = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n+/g, '. ') // Replace line breaks with periods
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    speak(cleanText, voicePresets.narrator);
  }, [speak, voicePresets]);

  const announceAchievement = useCallback((title: string, description: string) => {
    const announcement = `Parabéns! Você conquistou: ${title}. ${description}`;
    speak(announcement, voicePresets.energetic);
  }, [speak, voicePresets]);

  const readNotification = useCallback((title: string, message: string) => {
    const notification = `Nova notificação: ${title}. ${message}`;
    speak(notification, voicePresets.assistant);
  }, [speak, voicePresets]);

  return {
    isPlaying,
    isLoading,
    speak,
    speakWithPreset,
    stop,
    pause,
    resume,
    narrateContent,
    announceAchievement,
    readNotification,
    voicePresets
  };
};