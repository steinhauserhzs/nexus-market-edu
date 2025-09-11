import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useDeleteProduct } from "@/hooks/use-activity-logs";

interface DeleteProductDialogProps {
  productId: string;
  productTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

const DeleteProductDialog = ({
  productId,
  productTitle,
  isOpen,
  onOpenChange,
  onDeleted
}: DeleteProductDialogProps) => {
  const { deleteProduct, loading } = useDeleteProduct();

  const handleDelete = async () => {
    const success = await deleteProduct(productId);
    if (success) {
      onOpenChange(false);
      onDeleted?.();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Excluir Produto
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir o produto <strong>"{productTitle}"</strong>?
            </p>
            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Esta ação é irreversível!
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• O produto não será mais visível para compradores</li>
                <li>• Não será possível recuperar o produto após a exclusão</li>
                <li>• A ação será registrada no histórico de atividades</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Excluindo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Excluir Definitivamente
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductDialog;