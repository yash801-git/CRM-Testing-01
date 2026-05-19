import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampaignStore } from '../store';
import { useLeadStore } from '@/modules/leads/store';
import { usePropertyStore } from '@/modules/properties/store';
import { toast } from "sonner";

interface CampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ open, onOpenChange, initialData }) => {
  const { add, update } = useCampaignStore();
  const { data: leads, fetchAll: fetchLeads } = useLeadStore();
  const { data: properties, fetchAll: fetchProperties } = usePropertyStore();

  const [type, setType] = useState(initialData?.type || 'EMAIL');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [propertyId, setPropertyId] = useState(initialData?.propertyId || '');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>(
    initialData?.leads?.map((cl: any) => cl.leadId) || []
  );

  useEffect(() => {
    fetchLeads();
    fetchProperties();
  }, [fetchLeads, fetchProperties]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'EMAIL');
      setStatus(initialData.status || 'DRAFT');
      setPropertyId(initialData.propertyId || '');
      setSelectedLeadIds(initialData.leads?.map((cl: any) => cl.leadId) || []);
    } else {
      setType('EMAIL');
      setStatus('DRAFT');
      setPropertyId('');
      setSelectedLeadIds([]);
    }
  }, [initialData]);

  const toggleLead = (leadId: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const raw = Object.fromEntries(formData.entries());

    const payload = {
      ...raw,
      type,
      status,
      propertyId: propertyId || null,
      leadIds: selectedLeadIds,
    };

    try {
      if (initialData) {
        await update(initialData.id, payload);
        toast.success("Campaign updated successfully!");
      } else {
        await add(payload);
        toast.success("Campaign launched successfully!");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save campaign");
      console.error(err);
    }
  };

  const TYPE_ICONS: Record<string, string> = {
    EMAIL: '📧', WHATSAPP: '💬', SMS: '📱', SOCIAL_MEDIA: '📣', COLD_CALL: '📞'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto p-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {initialData ? 'Edit Campaign' : 'New Campaign'}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground pt-1">
              Design a targeted outreach campaign for your leads.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 mt-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Campaign Title</Label>
              <Input id="title" name="title" defaultValue={initialData?.title} placeholder="e.g. Monsoon Property Sale Blast" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Channel</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                    {Object.entries(TYPE_ICONS).map(([val, icon]) => (
                      <SelectItem key={val} value={val}>{icon} {val.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linked Property */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Promote Property (Optional)</Label>
              <Select value={propertyId || 'none'} onValueChange={v => setPropertyId(v === 'none' ? '' : v)}>
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                  <SelectValue placeholder="Select a property to promote..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                  <SelectItem value="none">No specific property</SelectItem>
                  {properties.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.title} — {p.city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget & Spent */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Total Budget (₹)</Label>
                <Input id="budget" name="budget" type="number" defaultValue={initialData?.budget} placeholder="e.g. 50000" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spent" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Amount Spent (₹)</Label>
                <Input id="spent" name="spent" type="number" defaultValue={initialData?.spent} placeholder="e.g. 1500" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Target Segment</Label>
              <Input id="targetAudience" name="targetAudience" defaultValue={initialData?.targetAudience} placeholder="e.g. Budget > 50L Leads" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ''} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">End Date</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
            </div>

            {/* Content / Message */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Message Content</Label>
              <textarea id="content" name="content" defaultValue={initialData?.content} placeholder="Write your campaign message here..." className="w-full min-h-[90px] p-4 rounded-2xl bg-secondary/50 border-none font-bold resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            {/* Target Leads */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Target Leads ({selectedLeadIds.length} selected)
              </Label>
              <div className="max-h-44 overflow-y-auto rounded-2xl bg-secondary/30 p-3 space-y-1.5 border border-border/30">
                {leads.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No leads found</p>}
                {leads.map((lead: any) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => toggleLead(lead.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/70'}`}
                    >
                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-primary-foreground border-primary-foreground' : 'border-muted-foreground/30'}`}>
                        {isSelected && <span className="text-primary text-[10px] font-black">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black truncate">{lead.name}</p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{lead.phone}</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary-foreground/20' : 'bg-secondary'}`}>{lead.status}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 mt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl font-bold">Cancel</Button>
            <Button type="submit" className="h-12 rounded-2xl font-bold px-8 shadow-lg shadow-primary/20">
              {initialData ? 'Save Changes' : 'Launch Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignForm;
