import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  X, 
  Image, 
  File, 
  Video,
  FileText,
  Music,
  Archive,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  ExternalLink,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { validateFileBeforeUpload, validateExternalURL, sanitizeFileName, validateFileContent } from "@/utils/file-security";
import { logSecurityEvent } from "@/utils/security";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface EnhancedFileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  storeId?: string;
  fileType?: string;
  acceptedTypes?: string[];
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  allowExternalLinks?: boolean;
  maxFileSize?: number;
}

const EnhancedFileUpload = ({ 
  onFilesUploaded, 
  storeId, 
  fileType = 'product-image',
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  maxFiles,
  className,
  disabled = false,
  allowExternalLinks = true,
  maxFileSize
}: EnhancedFileUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [showExternalInput, setShowExternalInput] = useState(false);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-5 h-5" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const fileId = Math.random().toString(36).substring(2);
    
    // Security validation before upload
    const validation = validateFileBeforeUpload(file);
    if (!validation.isValid) {
      const errorFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        status: 'error',
        progress: 0,
        error: validation.errors.join(', ')
      };
      
      setFiles(prev => [...prev, errorFile]);
      
      toast({
        title: "Arquivo rejeitado por segurança",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      
      return errorFile;
    }

    // Show security warnings if any
    if (validation.warnings.length > 0) {
      setSecurityWarnings(prev => [...prev, ...validation.warnings]);
    }
    
    // Content validation
    const isValidContent = await validateFileContent(file);
    if (!isValidContent) {
      logSecurityEvent('invalid_file_content', {
        fileName: file.name,
        mimeType: file.type
      }, 'high');
      
      const errorFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        status: 'error',
        progress: 0,
        error: 'File content validation failed'
      };
      
      setFiles(prev => [...prev, errorFile]);
      return errorFile;
    }
    
    const newFile: UploadedFile = {
      id: fileId,
      name: sanitizeFileName(file.name),
      size: file.size,
      type: file.type,
      url: '',
      status: 'uploading',
      progress: 0
    };

    setFiles(prev => [...prev, newFile]);

    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      if (storeId) formData.append('storeId', storeId);
      formData.append('fileType', fileType);

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

      const completedFile: UploadedFile = {
        ...newFile,
        url: data.url,
        status: 'completed',
        progress: 100
      };

      setFiles(prev => prev.map(f => f.id === fileId ? completedFile : f));
      
      return completedFile;

    } catch (error: any) {
      console.error('Upload error:', error);
      
      const errorFile: UploadedFile = {
        ...newFile,
        status: 'error',
        progress: 0,
        error: error.message || 'Erro no upload'
      };

      setFiles(prev => prev.map(f => f.id === fileId ? errorFile : f));
      
      toast({
        title: "Erro no upload",
        description: `Falha ao enviar ${file.name}: ${error.message}`,
        variant: "destructive",
      });

      return errorFile;
    }
  }, [user, storeId, fileType, toast]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    
    // Check max files limit
    if (maxFiles && files.length + filesArray.length > maxFiles) {
      toast({
        title: "Limite excedido",
        description: `Você pode enviar no máximo ${maxFiles} arquivo(s)`,
        variant: "destructive",
      });
      return;
    }

    // Additional size validation if maxFileSize is specified
    const oversizedFiles = filesArray.filter(file => 
      maxFileSize && file.size > maxFileSize
    );
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "Arquivos muito grandes",
        description: `Alguns arquivos excedem o tamanho máximo permitido`,
        variant: "destructive",
      });
      return;
    }

    // Upload files in parallel
    const uploadPromises = filesArray.map(uploadFile);
    
    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFiles.filter(f => f.status === 'completed');
      
      if (successfulUploads.length > 0) {
        onFilesUploaded(successfulUploads);
        toast({
          title: "Upload concluído!",
          description: `${successfulUploads.length} arquivo(s) enviado(s) com sucesso`,
        });
      }
    } catch (error) {
      console.error('Batch upload error:', error);
    }
  }, [files.length, maxFiles, maxFileSize, uploadFile, onFilesUploaded, toast]);

  const handleExternalUrl = useCallback(async () => {
    if (!externalUrl.trim()) return;
    
    const validation = validateExternalURL(externalUrl);
    
    if (!validation.isValid) {
      toast({
        title: "URL inválida",
        description: validation.warnings.join(', '),
        variant: "destructive",
      });
      return;
    }
    
    if (!validation.isSafe) {
      toast({
        title: "URL potencialmente perigosa",
        description: "Esta URL contém padrões suspeitos e pode não ser segura",
        variant: "destructive",
      });
      return;
    }
    
    if (validation.warnings.length > 0) {
      setSecurityWarnings(prev => [...prev, ...validation.warnings]);
    }
    
    // Create external file object
    const fileId = Math.random().toString(36).substring(2);
    const externalFile: UploadedFile = {
      id: fileId,
      name: `External Link: ${new URL(validation.sanitizedUrl).hostname}`,
      size: 0,
      type: 'external/link',
      url: validation.sanitizedUrl,
      status: 'completed',
      progress: 100
    };
    
    setFiles(prev => [...prev, externalFile]);
    onFilesUploaded([externalFile]);
    setExternalUrl('');
    setShowExternalInput(false);
    
    toast({
      title: "Link adicionado!",
      description: "Link externo adicionado com sucesso",
    });
  }, [externalUrl, onFilesUploaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const retryUpload = useCallback(async (fileId: string) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (!fileToRetry || !fileInputRef.current?.files) return;

    const originalFile = Array.from(fileInputRef.current.files).find(f => f.name === fileToRetry.name);
    if (originalFile) {
      // Remove failed file and retry
      setFiles(prev => prev.filter(f => f.id !== fileId));
      await uploadFile(originalFile);
    }
  }, [files, uploadFile]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Avisos de Segurança:</p>
              {securityWarnings.map((warning, index) => (
                <p key={index} className="text-sm">• {warning}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Drop Zone */}
      <Card 
        className={cn(
          "transition-colors duration-200 border-2 border-dashed cursor-pointer",
          dragOver && !disabled ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Upload Seguro de Arquivos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Arraste e solte ou clique para selecionar
              </p>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <p>Validação automática de segurança • Tipos permitidos: {acceptedTypes.join(', ')}</p>
                {maxFileSize && (
                  <p>Tamanho máximo: {formatFileSize(maxFileSize)}</p>
                )}
                {maxFiles && (
                  <p>Máximo: {maxFiles} arquivo(s)</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center w-full">
              {!disabled && (
                <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivos
                </Button>
              )}
              {allowExternalLinks && !disabled && (
                <Button 
                  variant="ghost" 
                  type="button"
                  onClick={() => setShowExternalInput(!showExternalInput)}
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Link Externo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External URL Input */}
      {showExternalInput && allowExternalLinks && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Label htmlFor="external-url">Adicionar Link Externo</Label>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Input
                  id="external-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="flex-1 min-w-0"
                />
                <Button type="button" onClick={handleExternalUrl} disabled={!externalUrl.trim()} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Links seguros: YouTube, Vimeo, Google Drive, Dropbox, GitHub
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple={!maxFiles || maxFiles > 1}
        accept={acceptedTypes.join(',')}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        disabled={disabled}
      />

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Arquivos ({files.length})</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 text-muted-foreground">
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <Badge 
                      variant={
                        file.status === 'completed' ? 'default' : 
                        file.status === 'error' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {file.status === 'uploading' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                      {file.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                      {file.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {file.status === 'uploading' ? 'Enviando' : 
                       file.status === 'completed' ? 'Concluído' : 
                       'Erro'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.type}</span>
                  </div>
                  
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}
                  
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {file.status === 'error' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryUpload(file.id)}
                    >
                      Tentar novamente
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedFileUpload;