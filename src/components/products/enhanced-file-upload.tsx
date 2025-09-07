import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music, 
  Archive,
  Loader2, 
  AlertCircle, 
  Check,
  Youtube,
  ExternalLink,
  Link
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  storeId?: string;
  title?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface ExternalLink {
  id: string;
  type: 'youtube' | 'drive' | 'url';
  url: string;
  title?: string;
}

const EnhancedFileUpload = ({ 
  files, 
  onFilesChange, 
  acceptedTypes = ['*/*'], 
  maxFiles, 
  storeId, 
  title = "Arquivos do Produto" 
}: FileUploadProps) => {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf')) return FileText;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadToSupabase = useCallback(async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    if (storeId) formData.append('storeId', storeId);
    formData.append('fileType', 'product-asset');

    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    // Upload using edge function
    const { data, error } = await supabase.functions.invoke('upload-file', {
      body: formData,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Falha no upload');
    }

    return data.url;
  }, [user, storeId]);

  const handleFileSelect = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    
    // Check max files limit
    if (maxFiles && files.length + filesArray.length > maxFiles) {
      toast({
        title: "Limite excedido",
        description: `Você pode adicionar no máximo ${maxFiles} arquivos`,
        variant: "destructive",
      });
      return;
    }

    // Create uploading entries
    const newUploadingFiles: UploadingFile[] = filesArray.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files in parallel
    const uploadPromises = newUploadingFiles.map(async (uploadingFile) => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(f => 
              f.id === uploadingFile.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 300);

        const url = await uploadToSupabase(uploadingFile.file);
        
        clearInterval(progressInterval);

        // Update to completed
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, status: 'completed', progress: 100, url }
              : f
          )
        );

        // Add to final files after a short delay
        setTimeout(() => {
          onFilesChange([...files, url]);
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
        }, 1000);

      } catch (error: any) {
        console.error('Upload error:', error);
        
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, status: 'error', progress: 0, error: error.message }
              : f
          )
        );

        toast({
          title: "Erro no upload",
          description: `Falha ao enviar ${uploadingFile.file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    });

    await Promise.allSettled(uploadPromises);
  }, [files.length, maxFiles, uploadToSupabase, onFilesChange, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  }, [files, onFilesChange]);

  const removeUploadingFile = useCallback((id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const retryUpload = useCallback(async (id: string) => {
    const uploadingFile = uploadingFiles.find(f => f.id === id);
    if (!uploadingFile) return;

    setUploadingFiles(prev => 
      prev.map(f => 
        f.id === id 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      )
    );

    // Retry the upload
    const fileList = new DataTransfer();
    fileList.items.add(uploadingFile.file);
    await handleFileSelect(fileList.files);
  }, [uploadingFiles, handleFileSelect]);

  const addYouTubeLink = () => {
    if (!youtubeUrl.trim()) return;

    const newLink: ExternalLink = {
      id: Math.random().toString(36).substring(2),
      type: 'youtube',
      url: youtubeUrl,
      title: linkTitle || 'Vídeo do YouTube'
    };

    const linkData = JSON.stringify(newLink);
    onFilesChange([...files, linkData]);
    setExternalLinks(prev => [...prev, newLink]);
    setYoutubeUrl('');
    setLinkTitle('');

    toast({
      title: "Link adicionado!",
      description: "Link do YouTube adicionado com sucesso",
    });
  };

  const addDriveLink = () => {
    if (!driveUrl.trim()) return;

    const newLink: ExternalLink = {
      id: Math.random().toString(36).substring(2),
      type: 'drive',
      url: driveUrl,
      title: linkTitle || 'Arquivo do Google Drive'
    };

    const linkData = JSON.stringify(newLink);
    onFilesChange([...files, linkData]);
    setExternalLinks(prev => [...prev, newLink]);
    setDriveUrl('');
    setLinkTitle('');

    toast({
      title: "Link adicionado!",
      description: "Link do Google Drive adicionado com sucesso",
    });
  };

  const addCustomUrl = () => {
    if (!customUrl.trim()) return;

    const newLink: ExternalLink = {
      id: Math.random().toString(36).substring(2),
      type: 'url',
      url: customUrl,
      title: linkTitle || 'Link externo'
    };

    const linkData = JSON.stringify(newLink);
    onFilesChange([...files, linkData]);
    setExternalLinks(prev => [...prev, newLink]);
    setCustomUrl('');
    setLinkTitle('');

    toast({
      title: "Link adicionado!",
      description: "Link externo adicionado com sucesso",
    });
  };

  const removeExternalLink = (linkId: string) => {
    setExternalLinks(prev => prev.filter(link => link.id !== linkId));
    const newFiles = files.filter(file => {
      try {
        const linkData = JSON.parse(file);
        return linkData.id !== linkId;
      } catch {
        return true; // Keep regular files
      }
    });
    onFilesChange(newFiles);
  };

  const isFileUpload = (file: string) => {
    try {
      JSON.parse(file);
      return false; // It's a link
    } catch {
      return true; // It's a file URL
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          {title} ({files.length}{maxFiles ? `/${maxFiles}` : ''})
        </Label>
        {!maxFiles && (
          <Badge variant="secondary" className="text-xs">
            Sem limite
          </Badge>
        )}
      </div>
      
      {/* File Grid */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file, index) => {
              const isFile = isFileUpload(file);
              
              if (isFile) {
                // Regular file upload
                return (
                  <div key={index} className="relative group">
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              Arquivo {index + 1}
                            </p>
                            <a 
                              href={file} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Ver arquivo
                            </a>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              } else {
                // External link
                try {
                  const linkData: ExternalLink = JSON.parse(file);
                  const IconComponent = linkData.type === 'youtube' ? Youtube : 
                                      linkData.type === 'drive' ? ExternalLink : Link;
                  
                  return (
                    <div key={index} className="relative group">
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {linkData.title}
                              </p>
                              <a 
                                href={linkData.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Abrir link
                              </a>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeExternalLink(linkData.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                } catch {
                  return null;
                }
              }
            })}
          </div>
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Enviando arquivos...
          </Label>
          {uploadingFiles.map((uploadingFile) => {
            const FileIcon = getFileIcon(uploadingFile.file.type);
            
            return (
              <div key={uploadingFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {uploadingFile.status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                  {uploadingFile.status === 'completed' && <Check className="w-5 h-5 text-green-500" />}
                  {uploadingFile.status === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
                </div>
                
                <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(uploadingFile.file.size)}
                    </span>
                  </div>
                  
                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} className="h-2" />
                  )}
                  
                  {uploadingFile.status === 'error' && uploadingFile.error && (
                    <p className="text-xs text-destructive">{uploadingFile.error}</p>
                  )}
                </div>

                <div className="flex gap-1">
                  {uploadingFile.status === 'error' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryUpload(uploadingFile.id)}
                    >
                      Tentar novamente
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeUploadingFile(uploadingFile.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Area */}
      {(!maxFiles || files.length < maxFiles) && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Upload de Arquivos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Arraste e solte ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Suporta: Imagens, PDFs, Vídeos, Áudios, Documentos
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="pointer-events-none"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Arquivos
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* External Links Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* YouTube Link */}
          <Card className="p-4">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <Label className="font-medium">YouTube</Label>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Cole o link do YouTube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <Input
                  placeholder="Título do vídeo (opcional)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={addYouTubeLink}
                  disabled={!youtubeUrl.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Google Drive Link */}
          <Card className="p-4">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-500" />
                <Label className="font-medium">Google Drive</Label>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Cole o link do Google Drive"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                />
                <Input
                  placeholder="Título do arquivo (opcional)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={addDriveLink}
                  disabled={!driveUrl.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom URL */}
          <Card className="p-4">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-purple-500" />
                <Label className="font-medium">Link Personalizado</Label>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Cole qualquer URL"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <Input
                  placeholder="Título do link (opcional)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={addCustomUrl}
                  disabled={!customUrl.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFileUpload;