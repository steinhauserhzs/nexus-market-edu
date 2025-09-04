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
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Marketplace de Cursos Online - Educação Digital"
        description="Descubra milhares de cursos online de qualidade. Aprenda desenvolvimento, design, marketing e muito mais com os melhores instrutores do Brasil."
        keywords="cursos online, educação digital, desenvolvimento, design, marketing, programação, nexus market"
        image="/hero-marketplace.jpg"
        url={window.location.href}
      />
      
      <MainHeader />
      
      <main>
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
        <section className="py-8 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Explore por Categoria</h2>
              <p className="text-muted-foreground">
                Encontre o curso perfeito para suas necessidades
              </p>
            </div>
            
            {categoriesLoading ? (
              <div className="flex justify-center">
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
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="bg-accent hover:bg-accent-hover text-accent-foreground px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg"
                    >
                      Começar Agora
                    </Button>
                    <Button 
                      onClick={() => navigate('/auth')}
                      variant="outline"
                      className="border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 rounded-full text-lg font-semibold transition-colors"
                    >
                      Vender Cursos
                    </Button>
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