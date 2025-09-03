import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange: (slug: string | undefined) => void;
  className?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  className
}: CategoryFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={selectedCategory === undefined ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(undefined)}
        className="rounded-full transition-all duration-200"
      >
        Todas
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.slug ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(
            selectedCategory === category.slug ? undefined : category.slug
          )}
          className="rounded-full transition-all duration-200"
        >
          {category.icon && (
            <span className="mr-1">{category.icon}</span>
          )}
          {category.name}
        </Button>
      ))}
    </div>
  );
}