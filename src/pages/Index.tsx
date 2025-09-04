import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "@/components/layout/main-header";
import HeroSection from "@/components/marketplace/hero-section";
import FeaturedSection from "@/components/marketplace/featured-section";
import StatsSection from "@/components/marketplace/stats-section";
import CategoryFilter from "@/components/ui/category-filter";
import LoadingSpinner from "@/components/ui/loading-spinner";
import SEOHead from "@/components/ui/seo-head";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-products";


const Index = () => {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();

  // Categories will be loaded from useCategories hook


  const handleCategoryChange = (slug: string | undefined) => {
    setSelectedCategory(slug);
    console.log('Category changed:', slug);
  };

  const handleProductClick = (slug: string) => {
    navigate(`/produto/${slug}`);
  };


  return (
    <div className="min-h-screen bg-background pb-20 safe-area-bottom">
      <SEOHead 
        title="Marketplace de Cursos Online - Educação Digital"
        description="Descubra milhares de cursos online de qualidade. Aprenda desenvolvimento, design, marketing e muito mais com os melhores instrutores do Brasil."
        keywords="cursos online, educação digital, desenvolvimento, design, marketing, programação, nexus market"
        image="/hero-marketplace.jpg"
        url={window.location.href}
      />
      
      <MainHeader />
      
      <main className="safe-area-top">
        {/* Hero Section com melhor performance */}
        <HeroSection onSearch={(query) => {
          console.log('Search:', query);
          if (query.trim()) {
            toast({
              title: "Busca realizada",
              description: `Buscando por: "${query}"`,
            });
          }
        }} />
        
        {/* Stats Section */}
        <StatsSection />
        
        {/* Categories Filter */}
        <section className="py-6 md:py-8 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="text-center mb-6 md:mb-8 px-2">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Explore por Categoria</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Encontre o curso perfeito para suas necessidades
              </p>
            </div>
            
            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner text="Carregando categorias..." />
              </div>
            ) : (
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                className="justify-center"
              />
            )}
          </div>
        </section>
        
        {/* Featured Courses */}
        <FeaturedSection
          title="Cursos em Destaque"
          description="Os melhores cursos selecionados pela nossa equipe"
          featured={true}
          showMore={true}
          categoryId={selectedCategory}
          onShowMore={() => {
            navigate('/biblioteca');
          }}
        />
        
        {/* Popular Courses */}
        <div className="bg-muted/20">
          <FeaturedSection
            title="Mais Populares"
            description="Os cursos mais procurados pelos nossos alunos"
            showMore={true}
            limit={4}
            categoryId={selectedCategory}
            onShowMore={() => {
              navigate('/biblioteca');
            }}
          />
        </div>
        
        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-hero text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-7xl">
            <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Pronto para Começar sua Jornada?
              </h2>
              <p className="text-lg sm:text-xl text-primary-foreground/90 px-4">
                Junte-se a milhares de alunos que já transformaram suas carreiras
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 px-4">
                {!user ? (
                  <>
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-auto rounded-xl sm:rounded-full text-base sm:text-lg font-semibold transition-colors shadow-lg"
                    >
                      Começar Agora
                    </Button>
                    <Button 
                      onClick={() => navigate('/auth')}
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-auto rounded-xl sm:rounded-full text-base sm:text-lg font-semibold transition-colors"
                    >
                      Vender Cursos
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => navigate('/biblioteca')}
                    className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-auto rounded-xl sm:rounded-full text-base sm:text-lg font-semibold transition-colors shadow-lg"
                  >
                    Explorar Mais Cursos
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="space-y-4 col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-bold">N</span>
                </div>
                <span className="font-bold text-lg sm:text-xl">Nexus Market</span>
              </div>
              <p className="text-sm sm:text-base text-primary-foreground/80">
                Transformando vidas através da educação digital de qualidade.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm sm:text-base">Plataforma</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Sobre</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Como Funciona</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Preços</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm sm:text-base">Suporte</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Contato</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">FAQ</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 md:mb-4 text-sm sm:text-base">Legal</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Cookies</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors min-h-[44px] flex items-center">Licenças</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs sm:text-sm text-primary-foreground/60">
            <p>&copy; 2024 Nexus Market EDU. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;