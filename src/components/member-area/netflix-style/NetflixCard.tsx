// Nexus Netflix-Style Member Area - Product Card Component

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Package } from 'lucide-react';
import { MemberProduct } from './types';
import NetflixBadgeStack from './NetflixBadgeStack';
import { shouldShowPromotionalBadge } from './badge-rotation';

interface NetflixCardProps {
  product: MemberProduct;
  itemIndex?: number;
  carouselType?: 'home' | 'bestsellers' | 'owned';
  storeSlug: string;
}

const NetflixCard = ({ 
  product, 
  itemIndex = 0, 
  carouselType = 'home',
  storeSlug 
}: NetflixCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (product.type === 'curso') {
      navigate(`/loja/${storeSlug}/area-membros/curso/${product.id}`);
    } else {
      navigate(`/loja/${storeSlug}/area-membros/produto/${product.id}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div
      className="group cursor-pointer flex-shrink-0"
      onClick={handleClick}
      style={{ width: '110px' }}
    >
      {/* Image Container - 2:3 aspect ratio */}
      <div className="relative aspect-[2/3] bg-secondary rounded-lg overflow-hidden mb-2">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-secondary animate-pulse" />
        )}
        
        {/* Product Cover Image */}
        <img
          src={product.cover}
          alt={product.title}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.type === 'curso' ? (
              <Play className="h-6 w-6 text-white fill-white" />
            ) : (
              <Package className="h-6 w-6 text-white" />
            )}
          </div>
        </div>

        {/* Badge Stack */}
        <NetflixBadgeStack
          owned={product.owned}
          isEligibleForPromotional={shouldShowPromotionalBadge(product.id, itemIndex)}
          salesBadge={product.badge && ['bestDay', 'bestWeek', 'bestMonth', 'best6Months', 'bestYear', 'bestAllTime'].includes(product.badge) ? product.badge as any : undefined}
        />
      </div>

      {/* Card Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {product.title}
        </h3>
        
        {/* Product Type */}
        <p className="text-xs text-muted-foreground capitalize">
          {product.type === 'curso' ? 'Curso' : 'Produto'}
        </p>
        
        {!product.owned && (
          <p className="text-xs sm:text-sm text-primary font-semibold">
            {formatPrice(product.price)}
          </p>
        )}
      </div>
    </div>
  );
};

export default NetflixCard;