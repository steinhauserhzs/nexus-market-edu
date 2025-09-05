import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface TTSRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const {
      text,
      voice_id = '9BWtsMINqrJLrRacOk9x', // Default to Aria
      model_id = 'eleven_multilingual_v2',
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }: TTSRequest = await req.json();

    if (!text || text.trim().length === 0) {
      throw new Error('Text is required');
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      throw new Error('Text too long. Maximum 5000 characters allowed.');
    }

    console.log(`Generating speech for text: "${text.substring(0, 50)}..." with voice: ${voice_id}`);

    // Make request to ElevenLabs API
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${elevenLabsResponse.status} ${errorText}`);
    }

    // Get audio data as array buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    
    // Convert to base64 for transmission
    const audioArray = new Uint8Array(audioBuffer);
    const base64Audio = btoa(String.fromCharCode(...audioArray));
    
    // Create a data URL for the audio
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log(`Successfully generated ${audioBuffer.byteLength} bytes of audio`);

    return new Response(
      JSON.stringify({ 
        audio_url: audioUrl,
        size_bytes: audioBuffer.byteLength,
        voice_id,
        model_id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during speech generation',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});