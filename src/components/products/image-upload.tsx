import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Image as ImageIcon, Loader2, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  storeId?: string;
}

interface UploadingImage {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

const ImageUpload = ({ images, onImagesChange, maxImages, storeId }: ImageUploadProps) => {
  const { user } = useAuth();
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadToSupabase = useCallback(async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    if (storeId) formData.append('storeId', storeId);
    formData.append('fileType', 'product-image');

    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    // Upload using edge function
    const { data, error } = await supabase.functions.invoke('upload-file', {
      body: formData,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Falha no upload');
    }

    return data.url;
  }, [user, storeId]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (filesArray.length === 0) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    // Check max images limit (se definido)
    if (maxImages && images.length + filesArray.length > maxImages) {
      toast({
        title: "Limite excedido",
        description: `Você pode adicionar no máximo ${maxImages} imagens`,
        variant: "destructive",
      });
      return;
    }

    // Create uploading entries
    const newUploadingImages: UploadingImage[] = filesArray.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    // Upload files
    const uploadPromises = newUploadingImages.map(async (uploadingImage) => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id && img.progress < 90
                ? { ...img, progress: img.progress + 10 }
                : img
            )
          );
        }, 200);

        const url = await uploadToSupabase(uploadingImage.file);
        
        clearInterval(progressInterval);

        // Update to completed
        setUploadingImages(prev => 
          prev.map(img => 
            img.id === uploadingImage.id 
              ? { ...img, status: 'completed', progress: 100, url }
              : img
          )
        );

        // Add to final images after a short delay
        setTimeout(() => {
          onImagesChange([...images, url]);
          setUploadingImages(prev => prev.filter(img => img.id !== uploadingImage.id));
        }, 1000);

      } catch (error: any) {
        console.error('Upload error:', error);
        
        setUploadingImages(prev => 
          prev.map(img => 
            img.id === uploadingImage.id 
              ? { ...img, status: 'error', progress: 0, error: error.message }
              : img
          )
        );

        toast({
          title: "Erro no upload",
          description: `Falha ao enviar ${uploadingImage.file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    });

    await Promise.allSettled(uploadPromises);
  }, [images.length, maxImages, uploadToSupabase, onImagesChange, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const removeUploadingImage = useCallback((id: string) => {
    setUploadingImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const retryUpload = useCallback(async (id: string) => {
    const uploadingImage = uploadingImages.find(img => img.id === id);
    if (!uploadingImage) return;

    setUploadingImages(prev => 
      prev.map(img => 
        img.id === id 
          ? { ...img, status: 'uploading', progress: 0, error: undefined }
          : img
      )
    );

    await handleFileSelect(new DataTransfer().files);
  }, [uploadingImages, handleFileSelect]);

  const addImageByUrl = useCallback((url: string) => {
    if (maxImages && images.length >= maxImages) {
      toast({
        title: "Limite excedido",
        description: `Você pode adicionar no máximo ${maxImages} imagens`,
        variant: "destructive",
      });
      return;
    }

    if (url && !images.includes(url)) {
      onImagesChange([...images, url]);
      toast({
        title: "Imagem adicionada!",
        description: "Imagem adicionada por URL com sucesso",
      });
    }
  }, [images, maxImages, onImagesChange, toast]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Imagens do Produto ({images.length}{maxImages ? `/${maxImages}` : ''})
        </Label>
        {!maxImages && (
          <Badge variant="secondary" className="text-xs">
            Sem limite
          </Badge>
        )}
      </div>
      
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group animate-fade-in">
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-border/50 bg-muted">
                <img
                  src={image}
                  alt={`Produto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <Badge className="text-xs font-medium">
                    Principal
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading Images */}
      {uploadingImages.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Enviando arquivos...
          </Label>
          {uploadingImages.map((uploadingImage) => (
            <div key={uploadingImage.id} className="flex items-center gap-3 p-3 border rounded-lg animate-fade-in">
              <div className="flex-shrink-0">
                {uploadingImage.status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                {uploadingImage.status === 'completed' && <Check className="w-5 h-5 text-green-500" />}
                {uploadingImage.status === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">{uploadingImage.file.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(uploadingImage.file.size)}
                  </span>
                </div>
                
                {uploadingImage.status === 'uploading' && (
                  <Progress value={uploadingImage.progress} className="h-2" />
                )}
                
                {uploadingImage.status === 'error' && uploadingImage.error && (
                  <p className="text-xs text-destructive">{uploadingImage.error}</p>
                )}
              </div>

              <div className="flex gap-1">
                {uploadingImage.status === 'error' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryUpload(uploadingImage.id)}
                  >
                    Tentar novamente
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeUploadingImage(uploadingImage.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {(!maxImages || images.length < maxImages) && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Adicionar Imagens</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Arraste e solte ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Suporta: JPG, PNG, GIF, WebP • Sem limite de tamanho
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="pointer-events-none"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Imagens
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* URL Input */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ou adicione por URL</Label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                e.preventDefault();
                addImageByUrl(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input.value) {
                addImageByUrl(input.value);
                input.value = '';
              }
            }}
          >
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
