import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Image, 
  File, 
  Trash2, 
  ExternalLink,
  Copy
} from "lucide-react";

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

interface StoreAssetManagerProps {
  storeId: string;
}

const StoreAssetManager = ({ storeId }: StoreAssetManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<StoreAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [storeId]);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('store_assets')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

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
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      // Save asset record
      const { error: dbError } = await supabase
        .from('store_assets')
        .insert({
          store_id: storeId,
          file_name: file.name,
          file_path: publicUrl,
          file_type: file.type.startsWith('image/') ? 'image' : 'file',
          file_size: file.size,
          mime_type: file.type,
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso!",
        description: "Asset enviado com sucesso",
      });

      fetchAssets();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

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

      fetchAssets();
    } catch (error: any) {
      console.error('Error deleting asset:', error);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Selecionar Arquivo</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*,font/*,.css,.js"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                }}
                disabled={uploading}
              />
            </div>
            
            {uploading && (
              <div className="text-sm text-muted-foreground">
                Enviando arquivo...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <Card>
        <CardHeader>
          <CardTitle>Assets da Loja ({assets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum asset encontrado</p>
              <p className="text-sm">Envie imagens, fontes ou arquivos CSS/JS</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    {asset.file_type === 'image' ? (
                      <Image className="w-5 h-5 text-blue-500" />
                    ) : (
                      <File className="w-5 h-5 text-gray-500" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {asset.file_type}
                    </Badge>
                  </div>
                  
                  {asset.file_type === 'image' && (
                    <div className="aspect-video bg-muted rounded overflow-hidden">
                      <img
                        src={asset.file_path}
                        alt={asset.alt_text || asset.file_name}
                        className="w-full h-full object-cover"
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
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyUrl(asset.file_path)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar URL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(asset.file_path, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAsset(asset.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreAssetManager;