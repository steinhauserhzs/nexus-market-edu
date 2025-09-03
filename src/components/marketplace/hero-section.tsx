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
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
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
      <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Transforme seu
              <span className="text-accent block">
                Conhecimento em Sucesso
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
              Descubra milhares de cursos e produtos digitais dos melhores especialistas. 
              Aprenda no seu ritmo e conquiste seus objetivos.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="search"
                  type="text"
                  placeholder="O que você quer aprender hoje?"
                  className="pl-12 pr-32 py-4 text-lg bg-background/95 backdrop-blur-sm border-0 rounded-full shadow-lg"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6"
                >
                  Buscar
                </Button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-4">
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="font-semibold">1000+ Cursos</span>
            </div>
            
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Users className="w-5 h-5 text-accent" />
              <span className="font-semibold">50K+ Alunos</span>
            </div>
            
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="font-semibold">4.8 Avaliação</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 py-4 rounded-full shadow-lg">
              Explorar Cursos
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 rounded-full bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-background/20"
            >
              Vender Cursos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}