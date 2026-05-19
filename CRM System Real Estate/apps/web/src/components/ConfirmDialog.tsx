import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  onConfirm, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = 'primary',
  loading = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`h-16 w-16 rounded-3xl flex items-center justify-center mb-6 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
            <AlertTriangle className="h-8 w-8" />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="text-2xl font-black tracking-tighter">{title}</DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground pt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <DialogFooter className="grid grid-cols-2 gap-4 pt-8 mt-4 border-t border-border/50">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
            className="h-12 rounded-2xl font-bold hover:bg-secondary/50"
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            onClick={() => {
              onConfirm();
            }}
            disabled={loading}
            className={`h-12 rounded-2xl font-bold shadow-lg ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' : 'bg-primary shadow-primary/25'}`}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
