import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DealForm from "./components/DealForm";
import { useDealStore } from "./store";
import ConfirmDialog from "@/components/ConfirmDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { toast } from 'sonner';

const Deals: React.FC = () => {
  const navigate = useNavigate();
  const { canDelete } = usePermission();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Confirm Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);

  const { data: deals, fetchAll, remove, update, loading } = useDealStore();

  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  const stages = [
    { id: 'INQUIRY', name: 'Inquiry' },
    { id: 'QUALIFICATION', name: 'Qualification' },
    { id: 'NEGOTIATION', name: 'Negotiation' },
    { id: 'CLOSED_WON', name: 'Closed Won' },
  ];

  const getDealsForStage = (stageId: string) => {
    return deals.filter(d => {
      const matchesStage = d.stage?.toUpperCase() === stageId;
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.lead?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStage && matchesSearch;
    });
  };

  const handleEdit = (deal: any) => {
    setEditingDeal(deal);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDealToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (dealToDelete) {
      try {
        await remove(dealToDelete);
        toast.success("Deal deleted successfully");
        setConfirmOpen(false);
        setDealToDelete(null);
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Failed to delete deal");
      }
    }
  };

  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  };

  const onDragEnter = (stageId: string) => {
    setIsDraggingOver(stageId);
  };

  const onDragLeave = () => {
    setIsDraggingOver(null);
  };

  const onDrop = async (e: React.DragEvent, stageId: string) => {
    setIsDraggingOver(null);
    const dealId = e.dataTransfer.getData("dealId");
    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.stage !== stageId) {
      try {
        await update(dealId, { stage: stageId });
        toast.success("Deal stage updated");
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Failed to update deal stage");
      }
    }
  };

  const handleStatusChange = async (dealId: string, newStage: string) => {
    try {
      await update(dealId, { stage: newStage });
      toast.success("Deal stage updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update deal stage");
    }
  };

  const getStageColor = (stageId: string) => {
    switch (stageId) {
      case 'INQUIRY': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'QUALIFICATION': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'NEGOTIATION': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'CLOSED_WON': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-secondary text-foreground';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Sales Pipeline</h1>
            {!loading && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-sm font-black">
                {deals.length} Total
              </span>
            )}
          </div>
          <p className="text-muted-foreground font-medium">Manage and move your deals across the sales funnel.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search deals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-border/50 bg-secondary/50 rounded-2xl font-bold" 
            />
          </div>
          <Button onClick={() => { setEditingDeal(null); setFormOpen(true); }} className="h-12 rounded-2xl shadow-lg shadow-primary/25 font-bold px-6">
            <Plus className="mr-2 h-4 w-4" /> New Deal
          </Button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide">
        {loading && <div className="absolute inset-0 flex items-center justify-center font-black text-primary bg-background/50 backdrop-blur-sm z-50">Syncing Pipeline...</div>}
        
        {stages.map((stage) => (
          <div key={stage.id} className="flex-none w-[320px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground opacity-80">{stage.name}</h3>
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                  {getDealsForStage(stage.id).length}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFormOpen(true)} className="h-8 w-8 rounded-xl text-muted-foreground">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div 
              className={`flex-1 rounded-[2rem] p-4 space-y-4 min-h-[500px] border transition-all duration-300 ${
                isDraggingOver === stage.id 
                  ? 'bg-primary/5 border-primary/50 shadow-inner' 
                  : 'bg-secondary/30 border-border/30'
              }`}
              onDragOver={onDragOver}
              onDragEnter={() => onDragEnter(stage.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, stage.id)}
            >
              {getDealsForStage(stage.id).map((deal) => (
                <Card 
                  key={deal.id} 
                  draggable 
                  onDragStart={(e) => onDragStart(e, deal.id)}
                  className="border-none shadow-xl bg-card rounded-3xl overflow-hidden card-hover cursor-grab active:cursor-grabbing group transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">{deal.title}</h4>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/pipeline/${deal.id}`)} className="h-7 w-7 rounded-lg text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(deal)} className="h-7 w-7 rounded-lg text-muted-foreground">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(deal.id)} className="h-7 w-7 rounded-lg text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-xl font-black text-primary mb-4">₹{parseFloat(deal.value).toLocaleString()}</div>
                    <div className="flex items-center justify-between mb-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`text-[10px] font-black px-3 py-1 rounded-full border ${getStageColor(deal.stage)} uppercase tracking-widest gap-1.5 h-6`}
                          >
                            {deal.stage.replace('_', ' ')}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-2 min-w-[140px]">
                          {stages.map((s) => (
                            <DropdownMenuItem
                              key={s.id}
                              onClick={() => handleStatusChange(deal.id, s.id)}
                              className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer mb-1 last:mb-0 ${deal.stage === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                            >
                              {s.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="text-[10px] font-black text-muted-foreground opacity-50 uppercase tracking-widest">
                        {new Date(deal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button 
                variant="ghost" 
                onClick={() => setFormOpen(true)}
                className="w-full h-14 rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground hover:bg-card hover:border-primary/50 hover:text-primary transition-all duration-300 font-bold"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Deal
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DealForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        initialData={editingDeal}
      />

      <ConfirmDialog 
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Deal?"
        description="Are you sure you want to remove this deal from the pipeline? This will permanently delete the deal record."
        confirmText="Delete Deal"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Deals;
