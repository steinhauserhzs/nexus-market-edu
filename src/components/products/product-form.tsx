import React, { useState, useEffect } from "react";
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
import { validateAndSanitizeInput } from "@/utils/enhanced-validation";
import { useSecurity } from "@/hooks/use-security";
import { SecureForm } from "@/components/security/SecureForm";
import { FileText, Settings, Video, ArrowRight, Upload, Link as LinkIcon } from "lucide-react";
import ImageUpload from "./image-upload";
import EnhancedFileUpload from "../ui/enhanced-file-upload";
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
  initialData?: any;
  isEditing?: boolean;
}

// Componente para seleção do tipo de produto
const ProductTypeSelector = ({ selectedType, onTypeSelect }: { 
  selectedType: string; 
  onTypeSelect: (type: string) => void;
}) => {
  const productTypes = [
    {
      id: 'pdf',
      name: 'Ebook PDF',
      description: 'Livro digital, guia ou material em PDF',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'ferramenta',
      name: 'Ferramenta Digital',
      description: 'Software, planilha ou ferramenta digital',
      icon: Settings,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'curso',
      name: 'Curso em Vídeo',
      description: 'Curso online com módulos e vídeo-aulas',
      icon: Video,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Qual tipo de produto você quer criar?</h3>
        <p className="text-muted-foreground">Escolha o tipo para personalizar os campos necessários</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {productTypes.map((type) => (
          <Card 
            key={type.id} 
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              selectedType === type.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                  <type.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{type.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                </div>
                <Button 
                  variant={selectedType === type.id ? "default" : "outline"} 
                  size="sm"
                  className="w-full"
                >
                  {selectedType === type.id ? 'Selecionado' : 'Selecionar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Componente para campos específicos de PDF
const PDFProductFields = ({ formData, setFormData, selectedStoreId }: any) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'upload' | 'link'>('upload');

  return (
    <div className="space-y-6 p-6 bg-blue-50/50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">Configuração do Ebook PDF</h3>
      </div>

      <div className="space-y-4">
        <Label>Como você quer entregar o PDF?</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${
              deliveryMethod === 'upload' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border'
            }`}
            onClick={() => setDeliveryMethod('upload')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Upload do Arquivo</div>
                  <div className="text-sm text-muted-foreground">Envie o PDF direto na plataforma</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${
              deliveryMethod === 'link' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border'
            }`}
            onClick={() => setDeliveryMethod('link')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <LinkIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Link de Entrega</div>
                  <div className="text-sm text-muted-foreground">Link para Google Drive, Dropbox, etc.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {deliveryMethod === 'upload' ? (
          <div className="space-y-4">
            <Label>Upload do PDF</Label>
            <EnhancedFileUpload
              onFilesUploaded={(files) => setFormData((prev: any) => ({ 
                ...prev, 
                pdf_file_url: files[0]?.url || '',
                product_files: files 
              }))}
              acceptedTypes={['application/pdf']}
              storeId={selectedStoreId}
              maxFiles={1}
              maxFileSize={50 * 1024 * 1024} // 50MB
              allowExternalLinks={false}
            />
            {formData.pdf_file_url && (
              <p className="text-sm text-green-600">✓ PDF carregado com sucesso</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="download_link">Link de Entrega</Label>
            <Input
              id="download_link"
              type="url"
              value={formData.download_link || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, download_link: e.target.value }))}
              placeholder="https://drive.google.com/file/d/..."
            />
            <p className="text-xs text-muted-foreground">
              Cole o link compartilhável do seu Google Drive, Dropbox ou outro serviço
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para campos específicos de ferramenta
const ToolProductFields = ({ formData, setFormData, selectedStoreId }: any) => {
  return (
    <div className="space-y-6 p-6 bg-green-50/50 rounded-lg border border-green-200">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-900">Configuração da Ferramenta</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="access_link">Link de Acesso</Label>
          <Input
            id="access_link"
            type="url"
            value={formData.access_link || ''}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, access_link: e.target.value }))}
            placeholder="https://minhaferramenta.com/acesso"
          />
          <p className="text-xs text-muted-foreground">
            Link direto para acessar a ferramenta após a compra
          </p>
        </div>

        <div className="space-y-4">
          <Label>Arquivos da Ferramenta (Opcional)</Label>
          <EnhancedFileUpload
            onFilesUploaded={(files) => setFormData((prev: any) => ({ 
              ...prev, 
              product_files: [...(prev.product_files || []), ...files] 
            }))}
            acceptedTypes={['*/*']}
            storeId={selectedStoreId}
            maxFiles={5}
            maxFileSize={100 * 1024 * 1024} // 100MB
            allowExternalLinks={true}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instruções de Uso</Label>
          <Textarea
            id="instructions"
            value={formData.instructions || ''}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, instructions: e.target.value }))}
            placeholder="Como usar a ferramenta, credenciais de acesso, etc."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

// Componente para campos específicos de curso
const CourseProductFields = ({ formData, setFormData, selectedStoreId }: any) => {
  const [modules, setModules] = useState(formData.modules || []);

  const addModule = () => {
    const newModule = {
      id: Date.now(),
      title: '',
      lessons: []
    };
    const updatedModules = [...modules, newModule];
    setModules(updatedModules);
    setFormData((prev: any) => ({ ...prev, modules: updatedModules }));
  };

  const updateModule = (moduleId: number, field: string, value: any) => {
    const updatedModules = modules.map((module: any) => 
      module.id === moduleId ? { ...module, [field]: value } : module
    );
    setModules(updatedModules);
    setFormData((prev: any) => ({ ...prev, modules: updatedModules }));
  };

  const addLesson = (moduleId: number) => {
    const newLesson = {
      id: Date.now(),
      title: '',
      video_url: '',
      duration_minutes: 0
    };
    
    const updatedModules = modules.map((module: any) => 
      module.id === moduleId 
        ? { ...module, lessons: [...(module.lessons || []), newLesson] }
        : module
    );
    setModules(updatedModules);
    setFormData((prev: any) => ({ ...prev, modules: updatedModules }));
  };

  const updateLesson = (moduleId: number, lessonId: number, field: string, value: any) => {
    const updatedModules = modules.map((module: any) => 
      module.id === moduleId 
        ? {
            ...module, 
            lessons: module.lessons?.map((lesson: any) => 
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            )
          }
        : module
    );
    setModules(updatedModules);
    setFormData((prev: any) => ({ ...prev, modules: updatedModules }));
  };

  const removeModule = (moduleId: number) => {
    const updatedModules = modules.filter((module: any) => module.id !== moduleId);
    setModules(updatedModules);
    setFormData((prev: any) => ({ ...prev, modules: updatedModules }));
  };

  const removeLesson = (moduleId: number, lessonId: number) => {
    const updatedModules = modules.map((module: any) => 
      module.id === moduleId 
        ? { 
            ...module, 
            lessons: module.lessons?.filter((lesson: any) => lesson.id !== lessonId) 
          }
        : module
    );
    setModules(updatedModules);
    setFormData((prev: any) => ({ ...prev, modules: updatedModules }));
  };

  return (
    <div className="space-y-6 p-6 bg-purple-50/50 rounded-lg border border-purple-200">
      <div className="flex items-center gap-2">
        <Video className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">Estrutura do Curso</h3>
      </div>

      <div className="space-y-6">
        {modules.map((module: any, moduleIndex: number) => (
          <Card key={module.id} className="border border-purple-200">
            <CardHeader className="bg-purple-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Módulo {moduleIndex + 1}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeModule(module.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Título do Módulo</Label>
                <Input
                  value={module.title || ''}
                  onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                  placeholder="Ex: Introdução ao Marketing Digital"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Aulas</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => addLesson(module.id)}
                  >
                    + Adicionar Aula
                  </Button>
                </div>

                {module.lessons?.map((lesson: any, lessonIndex: number) => (
                  <Card key={lesson.id} className="bg-white">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Aula {lessonIndex + 1}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeLesson(module.id, lesson.id)}
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Título da Aula</Label>
                          <Input
                            value={lesson.title || ''}
                            onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                            placeholder="Título da aula"
                            size="sm"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Duração (minutos)</Label>
                          <Input
                            type="number"
                            value={lesson.duration_minutes || ''}
                            onChange={(e) => updateLesson(module.id, lesson.id, 'duration_minutes', parseInt(e.target.value) || 0)}
                            placeholder="30"
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">URL do Vídeo</Label>
                        <Input
                          value={lesson.video_url || ''}
                          onChange={(e) => updateLesson(module.id, lesson.id, 'video_url', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... ou Vimeo"
                          size="sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!module.lessons || module.lessons.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma aula adicionada ainda</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => addLesson(module.id)}
                    >
                      Adicionar Primeira Aula
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button 
          type="button" 
          variant="outline" 
          onClick={addModule}
          className="w-full border-dashed border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          + Adicionar Módulo
        </Button>
        
        {modules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h4 className="font-medium mb-2">Estruture seu curso em módulos</h4>
            <p className="text-sm">Organize o conteúdo em módulos e adicione as aulas de cada um</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductForm = ({ storeId, onSuccess, onCancel, initialData, isEditing = false }: ProductFormProps) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState(initialData?.store_id || storeId || '');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price_cents: initialData?.price_cents || 0,
    compare_price_cents: initialData?.compare_price_cents || 0,
    category_id: initialData?.category_id || '',
    type: initialData?.type || '',
    difficulty_level: initialData?.difficulty_level || '',
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    thumbnail_url: initialData?.thumbnail_url || '',
    images: initialData?.thumbnail_url ? [initialData.thumbnail_url] : [],
    product_files: initialData?.product_files || [],
    featured: initialData?.featured || false,
    allow_affiliates: initialData?.allow_affiliates || true,
    requires_shipping: initialData?.requires_shipping || false,
    weight_grams: initialData?.weight_grams || 0,
    total_lessons: initialData?.total_lessons || 0,
    total_duration_minutes: initialData?.total_duration_minutes || 0,
    // Campos específicos para PDF
    pdf_file_url: initialData?.pdf_file_url || '',
    download_link: initialData?.download_link || '',
    // Campos específicos para ferramenta
    access_link: initialData?.access_link || '',
    instructions: initialData?.instructions || '',
    // Campos específicos para curso
    modules: initialData?.modules || [],
  });
  
  // Estado para controlar o passo atual do formulário
  const [currentStep, setCurrentStep] = useState<'type' | 'details'>(!formData.type ? 'type' : 'details');
  const { toast } = useToast();
  const { logEvent } = useSecurity();

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

  const getTypeLabel = (type: string) => {
    const labels = {
      'pdf': 'Ebook PDF',
      'ferramenta': 'Ferramenta Digital',
      'curso': 'Curso em Vídeo'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações robustas
    if (!formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (formData.price_cents <= 0) {
      toast({
        title: "Erro de validação", 
        description: "O preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !selectedStoreId) {
      toast({
        title: "Erro",
        description: "Selecione uma loja antes de criar o produto.",
        variant: "destructive",
      });
      return;
    }

    // Gerar slug se não existir
    if (!formData.slug.trim()) {
      generateSlug();
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
        product_files: formData.product_files || [],
        featured: formData.featured,
        allow_affiliates: formData.allow_affiliates,
        requires_shipping: formData.requires_shipping,
        weight_grams: formData.requires_shipping ? formData.weight_grams : null,
        total_lessons: formData.total_lessons || null,
        total_duration_minutes: formData.total_duration_minutes || null,
        status: 'published',
        currency: 'BRL',
        // Campos específicos salvos em metadata
        metadata: {
          pdf_file_url: formData.pdf_file_url,
          download_link: formData.download_link,
          access_link: formData.access_link,
          instructions: formData.instructions,
          modules: formData.modules,
        }
      };

      let result;
      if (isEditing && initialData?.id) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id)
          .select();
      } else {
        // Create new product
        result = await supabase
          .from('products')
          .insert(productData);
      }

      const { error } = result;

      if (error) throw error;

      toast({
        title: isEditing ? "Produto atualizado!" : "Produto criado!",
        description: isEditing ? "Alterações salvas com sucesso" : "Seu produto foi criado com sucesso.",
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
      {/* Form */}
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 'type' ? 'Selecione o Tipo de Produto' : 'Detalhes do Produto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 'type' ? (
              <ProductTypeSelector 
                selectedType={formData.type} 
                onTypeSelect={(type) => {
                  setFormData(prev => ({ ...prev, type }));
                  setCurrentStep('details');
                }} 
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Botão de voltar */}
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentStep('type')}
                  >
                    ← Voltar
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Tipo selecionado: <strong>{getTypeLabel(formData.type)}</strong>
                  </span>
                </div>

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
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      <div className="flex flex-col xs:flex-row gap-2">
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="produto-exemplo"
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={generateSlug}
                          size="sm"
                          className="shrink-0"
                        >
                          <span className="hidden sm:inline">Gerar</span>
                          <span className="sm:hidden">Auto</span>
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

                  {/* Imagem de Capa */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Imagem de Capa</h4>
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                      storeId={selectedStoreId}
                    />
                  </div>
                </div>

                {/* Campos específicos por tipo */}
                {formData.type === 'pdf' && <PDFProductFields formData={formData} setFormData={setFormData} selectedStoreId={selectedStoreId} />}
                {formData.type === 'ferramenta' && <ToolProductFields formData={formData} setFormData={setFormData} selectedStoreId={selectedStoreId} />}
                {formData.type === 'curso' && <CourseProductFields formData={formData} setFormData={setFormData} selectedStoreId={selectedStoreId} />}

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preços</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                {/* Category and Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Categoria e Configurações</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex flex-col xs:flex-row gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || (!selectedStoreId && stores.length === 0)}
                    className="flex-1 xs:flex-none"
                  >
                    {loading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Produto')}
                  </Button>
                  {onCancel && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onCancel}
                      className="flex-1 xs:flex-none"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {currentStep === 'details' && (
        <div className="xl:col-span-1">
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
      )}
    </div>
  );
};

export default ProductForm;