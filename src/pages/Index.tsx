import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/header";
import HeroSection from "@/components/marketplace/hero-section";
import FeaturedSection from "@/components/marketplace/featured-section";
import StatsSection from "@/components/marketplace/stats-section";
import CategoryFilter from "@/components/ui/category-filter";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'seller' | 'admin';
}

interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  comparePrice?: number;
  type: 'digital' | 'curso' | 'fisico' | 'servico' | 'bundle' | 'assinatura';
  rating?: number;
  totalLessons?: number;
  totalDuration?: number;
  studentCount?: number;
  instructor: string;
  featured?: boolean;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data - Replace with real data from Supabase
  const categories = [
    { id: '1', name: 'Desenvolvimento', slug: 'desenvolvimento', icon: '💻' },
    { id: '2', name: 'Design', slug: 'design', icon: '🎨' },
    { id: '3', name: 'Marketing', slug: 'marketing', icon: '📈' },
    { id: '4', name: 'Negócios', slug: 'negocios', icon: '💼' },
    { id: '5', name: 'Idiomas', slug: 'idiomas', icon: '🗣️' },
    { id: '6', name: 'Saúde', slug: 'saude', icon: '💪' },
  ];

  const featuredProducts: Product[] = [
    {
      id: '1',
      title: 'Desenvolvimento Web Completo',
      description: 'Aprenda React, Node.js, e muito mais para se tornar um desenvolvedor full-stack completo.',
      price: 19900, // R$ 199.00
      comparePrice: 29900,
      type: 'curso',
      rating: 4.9,
      totalLessons: 180,
      totalDuration: 2400, // 40 hours
      studentCount: 15420,
      instructor: 'João Silva',
      featured: true,
    },
    {
      id: '2',
      title: 'Design UX/UI Profissional',
      description: 'Domine as ferramentas e metodologias para criar interfaces incríveis e experiências únicas.',
      price: 14900,
      comparePrice: 19900,
      type: 'curso',
      rating: 4.8,
      totalLessons: 120,
      totalDuration: 1800,
      studentCount: 8930,
      instructor: 'Maria Santos',
      featured: true,
    },
    {
      id: '3',
      title: 'Marketing Digital Avançado',
      description: 'Estratégias comprovadas para aumentar vendas e engajamento nas redes sociais e Google Ads.',
      price: 12900,
      type: 'curso',
      rating: 4.7,
      totalLessons: 95,
      totalDuration: 1440,
      studentCount: 12500,
      instructor: 'Carlos Oliveira',
    },
    {
      id: '4',
      title: 'E-book: Empreendedorismo Digital',
      description: 'Guia completo para começar seu negócio digital do zero e alcançar a liberdade financeira.',
      price: 4900,
      comparePrice: 7900,
      type: 'digital',
      studentCount: 3200,
      instructor: 'Ana Costa',
    },
  ];

  const popularProducts: Product[] = [
    {
      id: '5',
      title: 'Python para Ciência de Dados',
      description: 'Análise de dados, machine learning e visualização com Python, pandas e scikit-learn.',
      price: 16900,
      type: 'curso',
      rating: 4.8,
      totalLessons: 140,
      totalDuration: 2100,
      studentCount: 9800,
      instructor: 'Dr. Roberto Lima',
    },
    {
      id: '6',
      title: 'Fotografia Profissional',
      description: 'Técnicas avançadas de fotografia, edição e composição para profissionais e entusiastas.',
      price: 11900,
      type: 'curso',
      rating: 4.9,
      totalLessons: 85,
      totalDuration: 1320,
      studentCount: 5670,
      instructor: 'Lucia Fernandes',
    },
    {
      id: '7',
      title: 'Inglês Fluente em 6 Meses',
      description: 'Método revolucionário para dominar o inglês rapidamente com foco na conversação.',
      price: 13900,
      type: 'curso',
      rating: 4.7,
      totalLessons: 200,
      totalDuration: 1800,
      studentCount: 18600,
      instructor: 'Michael Johnson',
    },
    {
      id: '8',
      title: 'Kit Músico Iniciante',
      description: 'Bundle completo com curso de violão, teoria musical e aplicativo de afinação.',
      price: 8900,
      comparePrice: 15900,
      type: 'bundle',
      studentCount: 4200,
      instructor: 'Pedro Música',
    },
  ];

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // In a real app, you'd fetch user profile from your profiles table
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            role: 'user', // This would come from your profiles table
          });
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            role: 'user',
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality
    toast({
      title: "Busca",
      description: `Buscando por: ${query}`
    });
  };

  const handleProductClick = (productId: string) => {
    console.log('Product clicked:', productId);
    // Navigate to product page
    toast({
      title: "Produto selecionado",
      description: `Navegando para o produto ${productId}`
    });
  };

  const handleCategoryChange = (slug: string | undefined) => {
    setSelectedCategory(slug);
    console.log('Category changed:', slug);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        cartCount={0}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />
      
      <main>
        {/* Hero Section */}
        <HeroSection onSearch={handleSearch} />
        
        {/* Stats Section */}
        <StatsSection />
        
        {/* Categories Filter */}
        <section className="py-8 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Explore por Categoria</h2>
              <p className="text-muted-foreground">
                Encontre o curso perfeito para suas necessidades
              </p>
            </div>
            
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              className="justify-center"
            />
          </div>
        </section>
        
        {/* Featured Courses */}
        <FeaturedSection
          title="Cursos em Destaque"
          description="Os melhores cursos selecionados pela nossa equipe"
          products={featuredProducts}
          showMore={true}
          onProductClick={handleProductClick}
          onShowMore={() => console.log('Show more featured')}
        />
        
        {/* Popular Courses */}
        <div className="bg-muted/20">
          <FeaturedSection
            title="Mais Populares"
            description="Os cursos mais procurados pelos nossos alunos"
            products={popularProducts}
            showMore={true}
            onProductClick={handleProductClick}
            onShowMore={() => console.log('Show more popular')}
          />
        </div>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-hero text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Pronto para Começar sua Jornada?
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Junte-se a milhares de alunos que já transformaram suas carreiras
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user ? (
                  <>
                    <button 
                      onClick={handleLogin}
                      className="bg-accent hover:bg-accent-hover text-accent-foreground px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg"
                    >
                      Começar Agora
                    </button>
                    <button 
                      onClick={handleLogin}
                      className="border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 rounded-full text-lg font-semibold transition-colors"
                    >
                      Vender Cursos
                    </button>
                  </>
                ) : (
                  <button className="bg-accent hover:bg-accent-hover text-accent-foreground px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg">
                    Explorar Mais Cursos
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-bold">N</span>
                </div>
                <span className="font-bold text-xl">Nexus Market</span>
              </div>
              <p className="text-primary-foreground/80">
                Transformando vidas através da educação digital de qualidade.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Licenças</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 Nexus Market EDU. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;