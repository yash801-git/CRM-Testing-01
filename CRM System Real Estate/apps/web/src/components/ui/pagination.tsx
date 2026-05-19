import React from 'react';
import { Button } from "./button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  limit?: number;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  limit
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * (limit || 10) + 1;
  const endItem = Math.min(currentPage * (limit || 10), totalItems || 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-2">
      <div className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
        {totalItems ? (
          <>Showing <span className="text-foreground">{startItem}-{endItem}</span> of <span className="text-foreground">{totalItems}</span> records</>
        ) : (
          <>Page {currentPage} of {totalPages}</>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
          className="h-9 w-9 rounded-xl border-border/50 bg-card hover:bg-secondary transition-all"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="h-9 w-9 rounded-xl border-border/50 bg-card hover:bg-secondary transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 mx-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = currentPage;
            if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;

            if (pageNum <= 0 || pageNum > totalPages) return null;

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => onPageChange(pageNum)}
                className={`h-9 w-9 rounded-xl font-black text-xs transition-all ${
                  currentPage === pageNum 
                    ? "shadow-lg shadow-primary/20 scale-110" 
                    : "border-border/50 bg-card hover:bg-secondary"
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="h-9 w-9 rounded-xl border-border/50 bg-card hover:bg-secondary transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
          className="h-9 w-9 rounded-xl border-border/50 bg-card hover:bg-secondary transition-all"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
