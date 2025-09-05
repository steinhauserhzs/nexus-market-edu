import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberAreaVideoPlayerProps {
  src: string;
  title: string;
  description?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
  className?: string;
  isExclusive?: boolean;
  allowDownload?: boolean;
  showNotes?: boolean;
}

export const MemberAreaVideoPlayer = ({
  src,
  title,
  description,
  onProgress,
  onComplete,
  initialProgress = 0,
  className,
  isExclusive = false,
  allowDownload = false,
  showNotes = false
}: MemberAreaVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (playing && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [playing, showControls]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      onProgress?.(progress);
    };

    const handleDurationChange = () => setDuration(video.duration);
    const handleEnded = () => {
      setPlaying(false);
      onComplete?.();
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('progress', handleProgress);
    };
  }, [onProgress, onComplete]);

  // Set initial progress
  useEffect(() => {
    if (videoRef.current && initialProgress > 0 && duration > 0) {
      videoRef.current.currentTime = (initialProgress / 100) * duration;
    }
  }, [initialProgress, duration]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  }, [playing]);

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0] / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !muted;
      videoRef.current.muted = newMuted;
      setMuted(newMuted);
    }
  }, [muted]);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!fullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setFullscreen(!fullscreen);
    }
  }, [fullscreen]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn("relative overflow-hidden bg-black", className)}>
      <div 
        ref={containerRef}
        className="relative w-full aspect-video group"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={src}
          playsInline
          preload="metadata"
        />

        {/* Loading State */}
        {duration === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Exclusive Badge */}
        {isExclusive && (
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-primary text-primary-foreground">
              Conteúdo Exclusivo
            </Badge>
          </div>
        )}

        {/* Controls Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-white text-lg font-semibold mb-1">{title}</h3>
              {description && (
                <p className="text-white/80 text-sm">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              {allowDownload && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {showNotes && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="absolute top-16 right-4 bg-black/90 backdrop-blur-sm rounded-md p-2 min-w-[120px]">
              <div className="text-white text-sm font-medium mb-2">Velocidade</div>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <Button
                  key={rate}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-white/20",
                    playbackRate === rate && "bg-white/20"
                  )}
                  onClick={() => changePlaybackRate(rate)}
                >
                  {rate}x
                </Button>
              ))}
            </div>
          )}

          {/* Central Play Button */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                onClick={togglePlay}
              >
                <Play className="w-8 h-8 text-white fill-current" />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative">
                {/* Buffered Progress */}
                <div
                  className="absolute h-1 bg-white/30 rounded-full"
                  style={{ width: `${buffered}%` }}
                />
                {/* Current Progress */}
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => skip(-10)}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {playing ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => skip(10)}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[muted ? 0 : volume * 100]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Time Display */}
                <div className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};