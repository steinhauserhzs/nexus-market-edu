import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./image-upload";
import ProductPreview from "./product-preview";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  storeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductForm = ({ storeId, onSuccess, onCancel }: ProductFormProps) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState(storeId || '');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price_cents: 0,
    compare_price_cents: 0,
    category_id: '',
    type: 'digital',
    difficulty_level: '',
    meta_title: '',
    meta_description: '',
    thumbnail_url: '',
    images: [] as string[],
    featured: false,
    allow_affiliates: true,
    requires_shipping: false,
    weight_grams: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchStores();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStores = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStores(data || []);
      
      // Auto-select first store if no storeId provided
      if (!selectedStoreId && data && data.length > 0) {
        setSelectedStoreId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
    }
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedStoreId) {
      toast({
        title: "Erro",
        description: "Selecione uma loja antes de criar o produto.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        store_id: selectedStoreId,
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        price_cents: formData.price_cents,
        compare_price_cents: formData.compare_price_cents || null,
        category_id: formData.category_id || null,
        type: formData.type,
        difficulty_level: formData.difficulty_level || null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        thumbnail_url: formData.images.length > 0 ? formData.images[0] : (formData.thumbnail_url || null),
        featured: formData.featured,
        allow_affiliates: formData.allow_affiliates,
        requires_shipping: formData.requires_shipping,
        weight_grams: formData.requires_shipping ? formData.weight_grams : null,
        status: 'draft',
        currency: 'BRL',
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Produto criado!",
        description: "Seu produto foi criado com sucesso.",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Novo Produto</CardTitle>
          </CardHeader>
          <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Selection */}
          {!storeId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Loja</h3>
              <div className="space-y-2">
                <Label htmlFor="store">Selecione a Loja *</Label>
                <Select
                  value={selectedStoreId}
                  onValueChange={setSelectedStoreId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {stores.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Você precisa criar uma loja primeiro para adicionar produtos.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="produto-exemplo"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Gerar
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
              storeId={selectedStoreId}
            />

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">URL da Imagem Adicional</Label>
              <Input
                id="thumbnail_url"
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Use este campo apenas se quiser adicionar uma imagem por URL separadamente
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preços</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_cents / 100}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                  }))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Valor: {formatCurrency(formData.price_cents)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="compare_price">Preço Original (R$)</Label>
                <Input
                  id="compare_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compare_price_cents / 100}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    compare_price_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                  }))}
                />
                {formData.compare_price_cents > 0 && (
                  <p className="text-xs text-muted-foreground">
                    De: {formatCurrency(formData.compare_price_cents)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalhes do Produto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="curso">Curso</SelectItem>
                    <SelectItem value="fisico">Físico</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                    <SelectItem value="assinatura">Assinatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Opções</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Produto em Destaque</Label>
                  <p className="text-sm text-muted-foreground">
                    Destacar este produto na página inicial
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow_affiliates">Permitir Afiliados</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que afiliados promovam este produto
                  </p>
                </div>
                <Switch
                  id="allow_affiliates"
                  checked={formData.allow_affiliates}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_affiliates: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requires_shipping">Requer Envio</Label>
                  <p className="text-sm text-muted-foreground">
                    Este produto precisa ser enviado fisicamente
                  </p>
                </div>
                <Switch
                  id="requires_shipping"
                  checked={formData.requires_shipping}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_shipping: checked }))}
                />
              </div>
              
              {formData.requires_shipping && (
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (gramas)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    value={formData.weight_grams}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight_grams: parseInt(e.target.value || '0') }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SEO</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Título</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="Título otimizado para SEO"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Descrição</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Descrição otimizada para SEO"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || (!selectedStoreId && stores.length === 0)}>
              {loading ? 'Criando...' : 'Criar Produto'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
          </form>
        </CardContent>
      </Card>
    </div>

    {/* Preview */}
    <div className="lg:col-span-1">
      <div className="sticky top-4">
        <ProductPreview
          title={formData.title}
          description={formData.description}
          price_cents={formData.price_cents}
          compare_price_cents={formData.compare_price_cents || undefined}
          images={formData.images}
          type={formData.type}
          difficulty_level={formData.difficulty_level}
          featured={formData.featured}
        />
      </div>
    </div>
  </div>
  );
};

export default ProductForm;