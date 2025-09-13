// Nexus Netflix-Style Member Area - React Hook

import { useState, useEffect } from 'react';
import { MemberProduct, MemberAreaConfig } from '@/components/member-area/netflix-style/types';
import { useToast } from '@/hooks/use-toast';

export const useMemberAreaNetflix = (storeSlug: string | undefined) => {
  const [products, setProducts] = useState<MemberProduct[]>([]);
  const [config, setConfig] = useState<MemberAreaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (storeSlug) {
      loadMemberAreaData();
    }
  }, [storeSlug]);

  const loadMemberAreaData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls to Supabase
      // This is mock data for development
      
      const mockProducts: MemberProduct[] = [
        {
          id: '1',
          title: 'Curso de Marketing Digital Avançado',
          cover: '/placeholder-course.jpg',
          price: 299.90,
          owned: true,
          storeId: storeSlug!,
          type: 'curso',
          popularityScore: 95,
          badge: 'owned',
          description: 'Curso completo sobre marketing digital com estratégias avançadas para aumentar suas vendas online.'
        },
        {
          id: '2',
          title: 'E-book: Guia Completo de Vendas',
          cover: '/placeholder-ebook.jpg',
          price: 67.90,
          owned: false,
          storeId: storeSlug!,
          type: 'digital',
          popularityScore: 88,
          badge: 'new',
          description: 'Guia prático com técnicas comprovadas para aumentar suas vendas e converter mais clientes.'
        },
        {
          id: '3',
          title: 'Masterclass: SEO para Iniciantes',
          cover: '/placeholder-course2.jpg',
          price: 199.90,
          owned: true,
          storeId: storeSlug!,
          type: 'curso',
          popularityScore: 92,
          badge: 'owned',
          description: 'Aprenda SEO do zero com estratégias práticas para posicionar seu site no Google.'
        },
        {
          id: '4',
          title: 'Template Premium Landing Page',
          cover: '/placeholder-template.jpg',
          price: 89.90,
          owned: false,
          storeId: storeSlug!,
          type: 'digital',
          popularityScore: 85,
          description: 'Template profissional responsivo para criar landing pages de alta conversão.'
        },
        {
          id: '5',
          title: 'Curso: Instagram para Negócios',
          cover: '/placeholder-instagram.jpg',
          price: 149.90,
          owned: false,
          storeId: storeSlug!,
          type: 'curso',
          popularityScore: 90,
          badge: 'new',
          description: 'Estratégias completas para crescer e monetizar seu Instagram empresarial.'
        }
      ];

      const mockConfig: MemberAreaConfig = {
        storeId: storeSlug!,
        storeName: `Loja ${storeSlug}`,
        storeSlug: storeSlug!,
        logo: '/placeholder-logo.jpg',
        primaryColor: '#3B82F6',
        backgroundColor: '#0F172A',
        banners: [
          {
            id: '1',
            image: '/placeholder-banner.jpg',
            storeId: storeSlug!,
            link: `/loja/${storeSlug}/produtos`
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setProducts(mockProducts);
      setConfig(mockConfig);
    } catch (error) {
      console.error('Error loading member area data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da área de membros',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId) || null;
  };

  const getOwnedProducts = () => {
    return products.filter(p => p.owned);
  };

  const getCourseProducts = () => {
    return products.filter(p => p.type === 'curso');
  };

  const getDigitalProducts = () => {
    return products.filter(p => p.type === 'digital');
  };

  const refreshData = () => {
    if (storeSlug) {
      loadMemberAreaData();
    }
  };

  return {
    products,
    config,
    loading,
    getProductById,
    getOwnedProducts,
    getCourseProducts,
    getDigitalProducts,
    refreshData
  };
};