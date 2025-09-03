import { useState } from "react";
import { Card } from "@/components/ui/card";
import OptimizedImage from "@/components/ui/optimized-image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProductGalleryProps {
  images: string[];
  productTitle: string;
}

export default function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Add fallback image if no images provided
  const galleryImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  };

  const previousImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="relative overflow-hidden group">
        <div className="aspect-video relative">
          <OptimizedImage
            src={galleryImages[currentImage]}
            alt={`${productTitle} - Imagem ${currentImage + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Buttons */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          
          {/* Expand Button */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <div className="relative">
                <OptimizedImage
                  src={galleryImages[currentImage]}
                  alt={`${productTitle} - Imagem ampliada`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Image Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentImage + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail Grid */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentImage 
                  ? 'border-accent' 
                  : 'border-transparent hover:border-muted-foreground'
              }`}
            >
              <OptimizedImage
                src={image}
                alt={`${productTitle} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}