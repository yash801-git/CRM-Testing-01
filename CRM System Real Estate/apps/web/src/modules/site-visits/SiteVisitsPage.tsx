import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, CheckCircle2, Trash2, Edit2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import VisitForm from "./components/VisitForm";
import { useVisitStore } from "./store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, CircleDot } from 'lucide-react';
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { usePermission } from "@/hooks/usePermission";

const SiteVisits: React.FC = () => {
  const { isBroker } = usePermission();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);
  const { data: visits, fetchAll, remove, update, loading } = useVisitStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredVisits = React.useMemo(() => {
    if (!searchQuery) return visits;
    return visits.filter(v => 
      (v.property?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (v.lead?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visits, searchQuery]);

  const handleOpenForm = (visit?: any) => {
    setSelectedVisit(visit || null);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setVisitToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (visitToDelete) {
      await remove(visitToDelete);
      toast.success("Site visit cancelled and deleted.");
      setConfirmOpen(false);
      setVisitToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await update(id, { status: newStatus });
      toast.success("Visit status updated");
      fetchAll();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">Site Visits</h1>
          <p className="text-muted-foreground font-medium">Manage and track your property showings and client tours.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search visits..." 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-border/50 bg-secondary/50 rounded-2xl font-bold" 
            />
          </div>
          <Button onClick={() => handleOpenForm()} className="h-12 rounded-2xl shadow-lg shadow-primary/25 font-bold px-6">
            <CalendarIcon className="mr-2 h-4 w-4" /> Schedule Visit
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {loading && <div className="text-center py-12 font-black text-primary animate-pulse">Syncing Appointments...</div>}
        
        {filteredVisits.length === 0 && !loading && (
          <div className="text-center py-24 bg-card/30 rounded-[2rem] border-2 border-dashed border-border/50">
            <div className="text-4xl mb-4 text-muted-foreground opacity-20"><CalendarIcon className="h-16 w-16 mx-auto" /></div>
            <h3 className="text-xl font-black text-muted-foreground">No visits found</h3>
            <p className="text-sm text-muted-foreground/60 font-medium">Try searching for a different property or client.</p>
          </div>
        )}

        {filteredVisits.map((visit) => (
          <Card key={visit.id} className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2rem] overflow-hidden card-hover">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${
                    visit.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 
                    visit.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    <CalendarIcon className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight">{visit.property?.title || 'Property Viewing'}</h3>
                    <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-primary" /> {visit.lead?.name || 'Private Client'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary opacity-50" /> {visit.property?.city || 'On-site'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12 w-full md:w-auto border-t md:border-t-0 md:border-l border-border/50 pt-6 md:pt-0 md:pl-12">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Date & Time</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-black text-foreground">
                        <CalendarIcon className="h-4 w-4 text-primary" /> {new Date(visit.scheduledAt).toLocaleDateString('en-GB')}
                      </div>
                      <div className="flex items-center gap-1.5 font-black text-foreground/70">
                        <Clock className="h-4 w-4 text-primary" /> {new Date(visit.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 min-w-[120px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Status</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          disabled={visit.status === 'COMPLETED' || visit.status === 'CANCELLED'}
                          className={`flex items-center gap-2 p-0 h-auto hover:bg-transparent ${
                            visit.status === 'COMPLETED' ? 'text-emerald-500' : 
                            visit.status === 'CANCELLED' ? 'text-red-500' : 'text-blue-500'
                          }`}
                        >
                          {visit.status === 'COMPLETED' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <CircleDot className="h-4 w-4 text-primary" />}
                          <span className="font-black uppercase tracking-widest text-[10px]">
                            {visit.status}
                          </span>
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-2 min-w-[140px]">
                        {['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => handleStatusChange(visit.id, s)}
                            className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer mb-1 last:mb-0 ${visit.status === s ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                          >
                            {s.replace('_', ' ')}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex gap-2">
                   <Button variant="ghost" size="icon" onClick={() => handleOpenForm(visit)} className="h-12 w-12 rounded-2xl bg-secondary hover:bg-primary/20">
                     <Edit2 className="h-5 w-5" />
                   </Button>
                   {isBroker && (
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(visit.id)} className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white">
                       <Trash2 className="h-5 w-5" />
                     </Button>
                   )}
                   <Button className="rounded-xl font-bold shadow-lg shadow-primary/10 ml-4" onClick={() => handleOpenForm(visit)}>View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <VisitForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        initialData={selectedVisit}
      />

      <ConfirmDialog 
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Visit?"
        description="Are you sure you want to cancel and delete this visit? This action cannot be undone."
        confirmText="Delete Visit"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SiteVisits;
