import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload = ({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: string[] = [];
    const totalImages = images.length + files.length;

    if (totalImages > maxImages) {
      toast({
        title: "Limite excedido",
        description: `Você pode adicionar no máximo ${maxImages} imagens`,
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              onImagesChange([...images, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const addImageByUrl = (url: string) => {
    if (images.length >= maxImages) {
      toast({
        title: "Limite excedido",
        description: `Você pode adicionar no máximo ${maxImages} imagens`,
        variant: "destructive",
      });
      return;
    }

    if (url && !images.includes(url)) {
      onImagesChange([...images, url]);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Imagens do Produto ({images.length}/{maxImages})</Label>
      
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border">
                <img
                  src={image}
                  alt={`Produto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Principal
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Adicionar imagens</p>
              <p className="text-sm text-muted-foreground">
                Arraste e solte ou clique para selecionar
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
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
      <div className="space-y-2">
        <Label>Ou adicione por URL</Label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
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