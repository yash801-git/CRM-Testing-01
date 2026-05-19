import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from 'sonner';
import { usePropertyStore } from "../store";
import { useAgentStore } from "@/modules/agents/store";
import { useUserStore } from "@/store/userStore";
import { usePermission } from "@/hooks/usePermission";
import { useNotificationStore } from "@/modules/notifications/store";
import api from '@/services/api';

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ open, onOpenChange, initialData }) => {
  const { add, update } = usePropertyStore();
  const { data: agents, fetchAll: fetchAgents } = useAgentStore();
  const { user } = useUserStore();
  const { isBroker } = usePermission();
  const { fetchAll: fetchNotifications } = useNotificationStore();
  
  // Controlled Select states
  const [type, setType] = useState(initialData?.type?.toLowerCase() || "apartment");
  const [status, setStatus] = useState(initialData?.status?.toLowerCase() || "available");
  const [ownerId, setOwnerId] = useState(initialData?.ownerId || "");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type?.toLowerCase());
      setStatus(initialData.status?.toLowerCase());
      setOwnerId(initialData.ownerId || "");
    } else {
      setType("apartment");
      setStatus("available");
      // If Agent is creating, default assignment to themselves
      setOwnerId(user?.role === 'AGENT' ? user.id : "");
    }
  }, [initialData, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    let uploadedUrls: string[] = [];
    if (files.length > 0) {
      const uploadData = new FormData();
      files.forEach(f => uploadData.append('files', f));
      try {
        const res = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls = res.data.urls;
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const rawData = Object.fromEntries(formData.entries());
    
    const manualImages = rawData.images ? (rawData.images as string).split(',').map(i => i.trim()).filter(Boolean) : [];
    const allImages = [...manualImages, ...uploadedUrls];

    const payload = {
      ...rawData,
      price: parseFloat(rawData.price as string),
      bedrooms: parseInt(rawData.bedrooms as string) || 0,
      bathrooms: parseInt(rawData.bathrooms as string) || 0,
      areaSqFt: parseInt(rawData.areaSqFt as string) || 0,
      status: status.toUpperCase(),
      type: type.toUpperCase(),
      ownerId: ownerId === "unassigned" ? null : (ownerId || null),
      description: rawData.description as string,
      amenities: rawData.amenities ? (rawData.amenities as string).split(',').map(a => a.trim()).filter(Boolean) : [],
      images: allImages,
    };

    try {
      if (initialData) {
        await update(initialData.id, payload);
        toast.success("Property updated successfully!");
      } else {
        await add(payload);
        await fetchNotifications();
        toast.success("Property added successfully!");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save property");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl bg-card/90 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {initialData ? 'Edit Property' : 'Add New Property'}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              Fill in the details to {initialData ? 'update' : 'list'} a property in the inventory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Property Title</Label>
              <Input id="title" name="title" defaultValue={initialData?.title} placeholder="e.g. Skyline Luxury Penthouse" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Property Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="under_offer">Under Offer</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Listing Agent (Assign Owner)</Label>
              <Select 
                value={ownerId} 
                onValueChange={setOwnerId}
                disabled={!isBroker}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                  <SelectValue placeholder="Assign to agent (Optional)" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                  {isBroker && <SelectItem value="unassigned">Unassigned</SelectItem>}
                  {!isBroker && user ? (
                    <SelectItem value={user.id}>{user.name} (Me)</SelectItem>
                  ) : (
                    agents.map((agent: any) => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="price" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Price (₹)</Label>
                <Input id="price" name="price" type="number" defaultValue={initialData?.price} placeholder="e.g. 12000000" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city" className="font-black text-xs uppercase tracking-widest text-muted-foreground">City</Label>
                <Input id="city" name="city" defaultValue={initialData?.city} placeholder="e.g. Mumbai" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="state" className="font-black text-xs uppercase tracking-widest text-muted-foreground">State</Label>
                <Input id="state" name="state" defaultValue={initialData?.state} placeholder="e.g. Maharashtra" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zipCode" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Zip Code</Label>
                <Input id="zipCode" name="zipCode" defaultValue={initialData?.zipCode} placeholder="e.g. 400018" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Address</Label>
                <Input id="address" name="address" defaultValue={initialData?.address} placeholder="e.g. Worli Sea Face" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unitNumber" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Unit Number / Floor</Label>
                <Input id="unitNumber" name="unitNumber" defaultValue={initialData?.unitNumber} placeholder="e.g. 101 or Floor 5" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bedrooms" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Beds</Label>
                <Input id="bedrooms" name="bedrooms" type="number" defaultValue={initialData?.bedrooms} placeholder="3" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bathrooms" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Baths</Label>
                <Input id="bathrooms" name="bathrooms" type="number" defaultValue={initialData?.bathrooms} placeholder="2" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="areaSqFt" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Area (Sqft)</Label>
                <Input id="areaSqFt" name="areaSqFt" type="number" defaultValue={initialData?.areaSqFt} placeholder="1450" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
              <textarea id="description" name="description" defaultValue={initialData?.description} placeholder="Property description..." className="min-h-[100px] p-4 rounded-2xl bg-secondary/50 border-none font-bold resize-none text-sm" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amenities" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Amenities (comma separated)</Label>
              <Input id="amenities" name="amenities" defaultValue={initialData?.amenities?.join(', ')} placeholder="e.g. Pool, Gym, Parking" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-upload" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Upload Local Images</Label>
              <Input 
                id="file-upload" 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="h-12 rounded-2xl bg-secondary/50 border-none font-bold pt-3" 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="images" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Or Existing / External Image URLs (comma separated)</Label>
              <Input id="images" name="images" defaultValue={initialData?.images?.join(', ')} placeholder="e.g. https://img1.jpg, https://img2.jpg" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl font-bold px-8">Cancel</Button>
            <Button type="submit" disabled={uploading} className="h-12 rounded-2xl font-bold px-8 shadow-lg shadow-primary/20">
              {uploading ? 'Uploading...' : initialData ? 'Update Property' : 'Save Property'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyForm;
