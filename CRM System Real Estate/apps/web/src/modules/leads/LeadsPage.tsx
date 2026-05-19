import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Trash2, Edit2, Filter, Eye, MoreVertical, LayoutGrid, List, Wallet, Calendar } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeadForm from "./components/LeadForm";
import { useLeadStore } from "./store";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmDialog from "@/components/ConfirmDialog";
import { CircleDot, ChevronDown } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { useUserStore } from '@/store/userStore';
import { useAgentStore } from '@/modules/agents/store';
import { Pagination } from '@/components/ui/pagination';
import FollowUpForm from '@/modules/follow-ups/components/FollowUpForm';

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const { canDelete, isBroker } = usePermission();
  const { data: agents, fetchAll: fetchAgents } = useAgentStore();
  const [searchParams] = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpLeadId, setFollowUpLeadId] = useState<string | null>(null);

  const { data: leads, fetchAll, remove, update, loading, page, totalPages, total } = useLeadStore();

  useEffect(() => {
    fetchAll(true, 1, 12); // Grid looks better with multiples of 3/4
    if (isBroker) fetchAgents();
    
    const source = searchParams.get('source');
    if (source) setSourceFilter(source.toLowerCase());
  }, [fetchAll, fetchAgents, isBroker, searchParams]);

  const filteredLeads = React.useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           l.phone.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || l.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesSource = sourceFilter === "all" || l.source?.toLowerCase() === sourceFilter.toLowerCase();
      const matchesOwner = ownerFilter === "all" || l.ownerId === ownerFilter;
      
      return matchesSearch && matchesStatus && matchesSource && matchesOwner;
    });
  }, [leads, searchQuery, statusFilter, sourceFilter, ownerFilter]);

  const uniqueSources = React.useMemo(() => {
    const sources = leads.map(l => l.source).filter(Boolean);
    return Array.from(new Set(sources));
  }, [leads]);

  const handleDeleteClick = (id: string) => {
    setLeadToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (leadToDelete) {
      await remove(leadToDelete);
      setConfirmOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await update(id, { status: newStatus });
    if (newStatus === 'FOLLOW_UP') {
      setFollowUpLeadId(id);
      setFollowUpOpen(true);
    }
    fetchAll(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NEW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'CONTACTED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'INTERESTED': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'CONVERTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'LOST': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'FOLLOW_UP': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-display font-black tracking-tight text-foreground">Leads Management</h1>
          <p className="text-muted-foreground font-semibold mt-2">Manage and convert your potential property clients.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-secondary/30 p-1 rounded-2xl flex items-center gap-1 border border-border/50 shadow-inner">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className={`h-9 w-9 rounded-xl p-0 ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('table')}
                className={`h-9 w-9 rounded-xl p-0 ${viewMode === 'table' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}
              >
                <List className="h-4 w-4" />
              </Button>
           </div>
           <Button onClick={() => { setEditingLead(null); setFormOpen(true); }} className="h-12 rounded-2xl shadow-lg shadow-primary/25 font-bold px-8">
            <Plus className="mr-2 h-4 w-4" /> Capture New Lead
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-8 pt-10 px-10">
          <div className="flex items-center gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by name, contact or source..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 border-none bg-secondary/50 rounded-2xl font-bold text-base focus-visible:ring-2 focus-visible:ring-primary/20" 
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`h-14 rounded-2xl gap-3 font-bold px-8 ${(statusFilter !== 'all' || sourceFilter !== 'all' || ownerFilter !== 'all') ? 'bg-primary/10 text-primary border-primary/20 shadow-lg' : ''}`}>
                  <Filter className="h-4 w-4" /> Filters {(statusFilter !== 'all' || sourceFilter !== 'all' || ownerFilter !== 'all') && "(Active)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-[2rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground ml-1">Lead Status</h4>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none font-bold">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="all">All Statuses</SelectItem>
                        {['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'CONVERTED', 'LOST'].map(s => (
                          <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => { setStatusFilter("all"); setSourceFilter("all"); setOwnerFilter("all"); }}
                    className="w-full h-12 rounded-xl font-black text-primary hover:bg-primary/5 border border-primary/10"
                  >
                    Reset All Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {loading && <div className="text-center py-20 font-black text-primary animate-pulse">FETCHING LATEST LEADS...</div>}
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="group relative bg-secondary/20 hover:bg-secondary/40 border border-border/30 rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer overflow-hidden">
                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10 blur-2xl ${getStatusColor(lead.status).split(' ')[0]}`}></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                      {lead.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-2 min-w-[160px]">
                        <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)} className="rounded-xl px-3 py-2 text-xs font-bold gap-2 cursor-pointer mb-1">
                          <Eye className="h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingLead(lead); setFormOpen(true); }} className="rounded-xl px-3 py-2 text-xs font-bold gap-2 cursor-pointer mb-1">
                          <Edit2 className="h-4 w-4" /> Quick Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem onClick={() => handleDeleteClick(lead.id)} className="rounded-xl px-3 py-2 text-xs font-bold gap-2 cursor-pointer text-red-500 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" /> Delete Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div onClick={() => navigate(`/leads/${lead.id}`)}>
                    <h3 className="font-extrabold text-xl mb-1 group-hover:text-primary transition-colors truncate">{lead.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-6">
                      {lead.source || 'Direct Source'} • Created {new Date(lead.createdAt).toLocaleDateString()}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground group/item">
                        <Mail className="h-4 w-4 opacity-40 group-hover/item:text-primary transition-colors" />
                        <span className="truncate">{lead.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground group/item">
                        <Phone className="h-4 w-4 opacity-40 group-hover/item:text-primary transition-colors" />
                        <span>{lead.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border/30">
                      <div className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${getStatusColor(lead.status)} uppercase tracking-widest shadow-sm`}>
                        {lead.status}
                      </div>
                      <div className="flex items-center gap-1.5 text-primary">
                        <Wallet className="h-4 w-4 opacity-60" />
                        <span className="font-black text-sm">₹{lead.budget ? (Number(lead.budget) / 100000).toFixed(1) : '0'}L</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-8 pl-8">Client Information</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Contact Hub</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Budget</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground text-center">Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-secondary/30 transition-all border-none rounded-3xl group cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                    <TableCell className="py-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {lead.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <span className="font-extrabold text-lg block group-hover:text-primary transition-colors">{lead.name}</span>
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-60">Source: {lead.source || 'Direct'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm font-bold text-muted-foreground">
                        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 opacity-40" /> {lead.email || '—'}</div>
                        <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 opacity-40" /> {lead.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-black text-primary">
                         <Wallet className="h-4 w-4 opacity-40" /> ₹{lead.budget ? (Number(lead.budget) / 100000).toFixed(1) : '0'}L
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${getStatusColor(lead.status)} uppercase tracking-widest shadow-sm`}>
                        {lead.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                          <Eye className="h-5 w-5" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {filteredLeads.length === 0 && !loading && (
             <div className="py-24 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-xl font-black text-muted-foreground">No leads found</h3>
                <p className="text-sm text-muted-foreground/60 font-medium mt-1">Try adjusting your search or filters.</p>
             </div>
          )}

          <div className="px-8 mt-12 pt-8 border-t border-border/30">
            <Pagination currentPage={page} totalPages={totalPages} totalItems={total} limit={viewMode === 'grid' ? 12 : 10} onPageChange={(p) => fetchAll(true, p, viewMode === 'grid' ? 12 : 10)} />
          </div>
        </CardContent>
      </Card>

      <LeadForm open={formOpen} onOpenChange={setFormOpen} initialData={editingLead} />
      <FollowUpForm open={followUpOpen} onOpenChange={setFollowUpOpen} leadId={followUpLeadId || undefined} />
      <ConfirmDialog 
        open={confirmOpen} 
        onOpenChange={setConfirmOpen} 
        title="Delete Lead?" 
        description="This action cannot be undone." 
        onConfirm={handleConfirmDelete} 
        variant="danger" 
      />
    </div>
  );
};

export default Leads;
