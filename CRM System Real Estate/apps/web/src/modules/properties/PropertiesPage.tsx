import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, BedDouble, Bath, Square, Star, Filter, Trash2, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PropertyForm from "./components/PropertyForm";
import { usePropertyStore } from "./store";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ChevronDown, CircleDot } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { useUserStore } from '@/store/userStore';
import { useAgentStore } from '@/modules/agents/store';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { canDelete, isBroker } = usePermission();
  const { user } = useUserStore();
  const { data: agents, fetchAll: fetchAgents } = useAgentStore();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedsFilter, setBedsFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  
  // Confirm Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  const { data: properties, fetchAll, remove, update, loading, page, totalPages, total } = usePropertyStore();

  useEffect(() => {
    fetchAll(true, 1, 9);
    if (isBroker) fetchAgents();
  }, [fetchAll, fetchAgents, isBroker]);

  const filteredProperties = React.useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.unitNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === "all" || p.type.toLowerCase() === typeFilter.toLowerCase();
      
      const price = parseFloat(p.price);
      const matchesMinPrice = !minPrice || price >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || price <= parseFloat(maxPrice);
      const matchesBeds = bedsFilter === "all" || p.bedrooms >= parseInt(bedsFilter);
      const matchesOwner = ownerFilter === "all" || p.ownerId === ownerFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesMinPrice && matchesMaxPrice && matchesBeds && matchesOwner;
    });
  }, [properties, searchQuery, statusFilter, typeFilter, minPrice, maxPrice, bedsFilter, ownerFilter]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPropertyToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (propertyToDelete) {
      await remove(propertyToDelete);
      setConfirmOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, property: any) => {
    e.stopPropagation();
    setEditingProperty(property);
    setFormOpen(true);
  };

  const handleStatusChange = async (e: React.MouseEvent, id: string, newStatus: string) => {
    e.stopPropagation();
    await update(id, { status: newStatus });
    fetchAll();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'sold': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'under_offer': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Property Inventory</h1>
            {!loading && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-sm font-black">
                {properties.length} Total
              </span>
            )}
          </div>
          <p className="text-muted-foreground font-medium">Browse and manage your exclusive real estate listings.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`flex-1 md:flex-none h-12 rounded-2xl border-primary/20 font-bold ${(statusFilter !== 'all' || typeFilter !== 'all' || minPrice || maxPrice || bedsFilter !== 'all' || ownerFilter !== 'all') ? 'bg-primary/10 text-primary' : 'text-primary'}`}>
                <Filter className="mr-2 h-4 w-4" /> Filters {(statusFilter !== 'all' || typeFilter !== 'all' || minPrice || maxPrice || bedsFilter !== 'all' || ownerFilter !== 'all') && "(Active)"}
              </Button>
            </PopoverTrigger>
             <PopoverContent className="w-80 rounded-[2rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground ml-1">Status</h4>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-11 rounded-xl bg-secondary/50 border-none font-bold">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="under_offer">Under Offer</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground ml-1">Type</h4>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-11 rounded-xl bg-secondary/50 border-none font-bold">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground ml-1">Price Range (₹)</h4>
                  <div className="flex gap-2">
                    <Input placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-11 rounded-xl bg-secondary/50 border-none font-bold text-xs" />
                    <Input placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-11 rounded-xl bg-secondary/50 border-none font-bold text-xs" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground ml-1">Bedrooms</h4>
                  <Select value={bedsFilter} onValueChange={setBedsFilter}>
                    <SelectTrigger className="h-11 rounded-xl bg-secondary/50 border-none font-bold">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="1">1+ BHK</SelectItem>
                      <SelectItem value="2">2+ BHK</SelectItem>
                      <SelectItem value="3">3+ BHK</SelectItem>
                      <SelectItem value="4">4+ BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isBroker && (
                  <div className="space-y-2">
                    <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground ml-1">Listing Agent</h4>
                    <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                      <SelectTrigger className="h-11 rounded-xl bg-secondary/50 border-none font-bold">
                        <SelectValue placeholder="All Agents" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="all">All Agents</SelectItem>
                        {agents.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  onClick={() => { 
                    setStatusFilter("all"); 
                    setTypeFilter("all"); 
                    setMinPrice(""); 
                    setMaxPrice(""); 
                    setBedsFilter("all"); 
                    setOwnerFilter("all");
                  }}
                  className="w-full h-11 rounded-xl font-black text-primary hover:bg-primary/5 border border-primary/10"
                >
                  Reset All Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={() => { setEditingProperty(null); setFormOpen(true); }} className="flex-1 md:flex-none h-12 rounded-2xl shadow-lg shadow-primary/25 font-bold">
            <Plus className="mr-2 h-4 w-4" /> Add Listing
          </Button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search by city, address, or development name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 border-none bg-card/50 backdrop-blur-md shadow-xl rounded-3xl text-lg focus-visible:ring-primary/20 transition-all duration-300" 
        />
      </div>

      {loading && <div className="text-center py-12 font-black text-primary animate-pulse">Loading Inventory...</div>}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.length === 0 && !loading && (
          <div className="col-span-full text-center py-24">
            <div className="text-4xl mb-4 text-muted-foreground opacity-20"><Search className="h-16 w-16 mx-auto" /></div>
            <h3 className="text-xl font-black text-muted-foreground">No properties match your criteria</h3>
            <p className="text-sm text-muted-foreground/60 font-medium">Try adjusting your filters or search terms.</p>
          </div>
        )}
        {filteredProperties.map(p => (
          <Card key={p.id} className="group overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-md rounded-[2rem] card-hover">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'} 
                alt={p.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="icon" onClick={(e) => handleEdit(e, p)} className="rounded-2xl h-10 w-10 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-primary transition-colors">
                  <Edit2 className="h-5 w-5" />
                </Button>
                {canDelete && (
                  <Button size="icon" onClick={(e) => handleDeleteClick(e, p.id)} className="rounded-2xl h-10 w-10 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-red-500 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-primary/90 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {p.type}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      onClick={(e) => e.stopPropagation()}
                      className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md h-auto ${getStatusColor(p.status)} gap-1.5`}
                    >
                      <CircleDot className="h-3 w-3" />
                      {p.status}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-2 min-w-[140px]">
                    {['AVAILABLE', 'UNDER_OFFER', 'SOLD', 'RENTED', 'INACTIVE'].map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={(e) => handleStatusChange(e as any, p.id, s)}
                        className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer mb-1 last:mb-0 ${p.status === s ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                      >
                        {s.replace('_', ' ')}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-white text-2xl font-black">₹{parseFloat(p.price).toLocaleString()}</div>
              </div>
            </div>
            <CardHeader className="pb-2 space-y-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-black tracking-tight truncate flex-1">{p.title}</CardTitle>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-xl text-xs font-black">
                  <Star className="h-3 w-3 fill-current" /> 4.8
                </div>
              </div>
              <div className="flex items-center text-muted-foreground font-bold text-xs gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {p.address}{p.unitNumber ? `, Unit ${p.unitNumber}` : ""}, {p.city}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-border/50 text-foreground font-bold text-sm">
                <div className="flex flex-col items-center gap-1 p-2 bg-secondary/50 rounded-2xl">
                  <BedDouble className="h-4 w-4 text-primary" />
                  <span>{p.bedrooms} Beds</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-secondary/50 rounded-2xl">
                  <Bath className="h-4 w-4 text-primary" />
                  <span>{p.bathrooms} Baths</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-secondary/50 rounded-2xl">
                  <Square className="h-4 w-4 text-primary" />
                  <span>{p.areaSqFt} ft²</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button onClick={() => navigate(`/properties/${p.id}`)} className="w-full h-12 rounded-2xl font-black bg-foreground text-background hover:opacity-90 transition-opacity">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="pt-8">
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          totalItems={total}
          limit={9}
          onPageChange={(newPage) => fetchAll(true, newPage, 9)} 
        />
      </div>

      <PropertyForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        initialData={editingProperty}
      />

      <ConfirmDialog 
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Property?"
        description="Are you sure you want to remove this property from your inventory? This action will permanently delete all associated data."
        confirmText="Delete Property"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Properties;
