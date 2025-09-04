import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import EnhancedFileUpload from "@/components/ui/enhanced-file-upload";
import { 
  Search,
  Filter,
  Grid3x3,
  List,
  Trash2, 
  ExternalLink,
  Copy,
  Download,
  Edit,
  FolderPlus,
  Image,
  File,
  Video,
  Music,
  Archive,
  FileText,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoreAsset {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  alt_text?: string;
  created_at: string;
}

interface EnhancedStoreAssetManagerProps {
  storeId: string;
}

const EnhancedStoreAssetManager = ({ storeId }: EnhancedStoreAssetManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [assets, setAssets] = useState<StoreAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('store_assets')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setAssets(data || []);
    } catch (error: any) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar assets da loja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, sortOrder, toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(asset => {
        if (filterType === 'images') return asset.mime_type.startsWith('image/');
        if (filterType === 'videos') return asset.mime_type.startsWith('video/');
        if (filterType === 'audio') return asset.mime_type.startsWith('audio/');
        if (filterType === 'documents') return asset.mime_type.includes('pdf') || asset.mime_type.includes('document');
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.file_name.localeCompare(b.file_name);
          break;
        case 'size':
          comparison = a.file_size - b.file_size;
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [assets, searchTerm, filterType, sortBy, sortOrder]);

  // Utility functions
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-5 h-5 text-orange-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Actions
  const deleteAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('store_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Asset removido com sucesso",
      });

      setAssets(prev => prev.filter(a => a.id !== assetId));
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const bulkDelete = async () => {
    if (selectedAssets.size === 0) return;

    try {
      const { error } = await supabase
        .from('store_assets')
        .delete()
        .in('id', Array.from(selectedAssets));

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `${selectedAssets.size} asset(s) removido(s) com sucesso`,
      });

      setAssets(prev => prev.filter(a => !selectedAssets.has(a.id)));
      setSelectedAssets(new Set());
    } catch (error: any) {
      console.error('Error deleting assets:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const selectAll = () => {
    if (selectedAssets.size === filteredAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(filteredAssets.map(a => a.id)));
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const handleFilesUploaded = useCallback((uploadedFiles: any[]) => {
    // Refresh assets after upload
    fetchAssets();
    toast({
      title: "Upload concluído!",
      description: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
    });
  }, [fetchAssets, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Gerenciador de Assets</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {assets.length} arquivo(s)
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Gerenciar Assets</TabsTrigger>
              <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <EnhancedFileUpload
                onFilesUploaded={handleFilesUploaded}
                storeId={storeId}
                fileType="store-asset"
                acceptedTypes={['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*', 'application/zip']}
                className="mt-4"
              />
            </TabsContent>

            {/* Manage Tab */}
            <TabsContent value="manage" className="space-y-4">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar arquivos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="images">Imagens</SelectItem>
                      <SelectItem value="videos">Vídeos</SelectItem>
                      <SelectItem value="audio">Áudios</SelectItem>
                      <SelectItem value="documents">Documentos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [sort, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
                    setSortBy(sort);
                    setSortOrder(order);
                  }}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Mais recentes</SelectItem>
                      <SelectItem value="date-asc">Mais antigos</SelectItem>
                      <SelectItem value="name-asc">Nome A-Z</SelectItem>
                      <SelectItem value="name-desc">Nome Z-A</SelectItem>
                      <SelectItem value="size-desc">Maior tamanho</SelectItem>
                      <SelectItem value="size-asc">Menor tamanho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
                  </Button>

                  {selectedAssets.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={bulkDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir ({selectedAssets.size})
                    </Button>
                  )}
                </div>
              </div>

              {/* Select All */}
              {filteredAssets.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedAssets.size === filteredAssets.length && filteredAssets.length > 0}
                    onCheckedChange={selectAll}
                  />
                  <Label className="text-sm">
                    Selecionar todos ({filteredAssets.length})
                  </Label>
                </div>
              )}

              {/* Assets Display */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum asset encontrado</h3>
                  <p className="text-sm">
                    {assets.length === 0 
                      ? "Envie seus primeiros arquivos na aba 'Upload de Arquivos'"
                      : "Tente ajustar os filtros de busca"
                    }
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    : "space-y-2"
                }>
                  {filteredAssets.map((asset) => (
                    <div 
                      key={asset.id} 
                      className={`group relative border rounded-lg transition-all duration-200 hover:shadow-md ${
                        selectedAssets.has(asset.id) ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
                      } ${
                        viewMode === 'grid' ? 'p-3 space-y-3' : 'p-3 flex items-center gap-4'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <div className={viewMode === 'grid' ? 'absolute top-2 left-2 z-10' : ''}>
                        <Checkbox
                          checked={selectedAssets.has(asset.id)}
                          onCheckedChange={() => toggleAssetSelection(asset.id)}
                          className="bg-background border-2"
                        />
                      </div>

                      {viewMode === 'grid' ? (
                        // Grid View
                        <>
                          <div className="flex items-center gap-2 pt-6">
                            {getFileIcon(asset.mime_type)}
                            <Badge variant="outline" className="text-xs">
                              {asset.file_type}
                            </Badge>
                          </div>
                          
                          {asset.file_type === 'image' && (
                            <div className="aspect-square bg-muted rounded overflow-hidden">
                              <img
                                src={asset.file_path}
                                alt={asset.alt_text || asset.file_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          
                          <div>
                            <p className="font-medium text-sm truncate" title={asset.file_name}>
                              {asset.file_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(asset.file_size)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(asset.created_at)}
                            </p>
                          </div>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyUrl(asset.file_path)}
                              className="flex-1 h-8"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(asset.file_path, '_blank')}
                              className="h-8 px-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteAsset(asset.id)}
                              className="h-8 px-2"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        // List View
                        <>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {asset.file_type === 'image' ? (
                              <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={asset.file_path}
                                  alt={asset.alt_text || asset.file_name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                {getFileIcon(asset.mime_type)}
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate" title={asset.file_name}>
                                {asset.file_name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {asset.file_type}
                                </Badge>
                                <span>{formatFileSize(asset.file_size)}</span>
                                <span>•</span>
                                <span>{formatDate(asset.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => copyUrl(asset.file_path)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar URL
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(asset.file_path, '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteAsset(asset.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStoreAssetManager;