import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Star, Users } from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    onSearch?.(query);
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Nexus Market EDU - Marketplace de Cursos"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center text-primary-foreground animate-fade-in safe-area-top">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 py-8 md:py-0">
          {/* Main heading */}
          <div className="space-y-4 md:space-y-6 px-2">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-slide-up">
              Transforme seu
              <span className="text-accent block animate-bounce-in mt-2" style={{ animationDelay: '0.3s' }}>
                Conhecimento em Sucesso
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-foreground/90 max-w-4xl mx-auto leading-relaxed animate-slide-up px-4" style={{ animationDelay: '0.5s' }}>
              Descubra milhares de cursos e produtos digitais dos melhores especialistas. 
              Aprenda no seu ritmo e conquiste seus objetivos.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto animate-slide-up px-4" style={{ animationDelay: '0.7s' }}>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="search"
                  type="text"
                  placeholder="O que você quer aprender hoje?"
                  className="pl-12 pr-4 sm:pr-36 py-4 h-14 sm:h-16 text-base sm:text-lg bg-background/95 backdrop-blur-sm border-0 rounded-2xl shadow-xl focus:shadow-2xl transition-all duration-300 w-full"
                />
                <Button 
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="hidden sm:flex absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl px-6 md:px-8 font-semibold"
                >
                  Buscar
                </Button>
                <Button 
                  type="submit"
                  variant="accent"
                  size="sm"
                  className="sm:hidden absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl px-4 font-semibold"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 pt-4 md:pt-6 animate-slide-up px-4" style={{ animationDelay: '0.9s' }}>
            <div className="flex items-center gap-2 sm:gap-3 text-primary-foreground/90 bg-background/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0" />
              <span className="font-semibold">1000+ Cursos</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 text-primary-foreground/90 bg-background/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
              <Users className="w-4 h-4 sm:w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0" />
              <span className="font-semibold">50K+ Alunos</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 text-primary-foreground/90 bg-background/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
              <Star className="w-4 h-4 sm:w-5 h-5 md:w-6 md:h-6 text-accent fill-accent flex-shrink-0" />
              <span className="font-semibold">4.8 Avaliação</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 md:pt-6 animate-slide-up px-4" style={{ animationDelay: '1.1s' }}>
            <Button 
              variant="accent"
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl font-semibold"
            >
              Explorar Cursos
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-background/10 backdrop-blur-sm border-2 border-primary-foreground/30 text-primary-foreground hover:bg-background/20 font-semibold"
            >
              Vender Cursos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}