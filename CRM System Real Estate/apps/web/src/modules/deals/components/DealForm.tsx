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
import { useDealStore } from "../store";
import { useLeadStore } from "@/modules/leads/store";
import { usePropertyStore } from "@/modules/properties/store";
import { useAgentStore } from "@/modules/agents/store";
import { useUserStore } from "@/store/userStore";
import { usePermission } from "@/hooks/usePermission";
import { useNotificationStore } from "@/modules/notifications/store";
import { toast } from "sonner";

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const DealForm: React.FC<DealFormProps> = ({ open, onOpenChange, initialData }) => {
  const { add, update } = useDealStore();
  const { data: leads, fetchAll: fetchLeads } = useLeadStore();
  const { data: properties, fetchAll: fetchProperties } = usePropertyStore();
  const { data: agents, fetchAll: fetchAgents } = useAgentStore();
  const { user } = useUserStore();
  const { isBroker } = usePermission();
  const { fetchAll: fetchNotifications } = useNotificationStore();
  
  const [stage, setStage] = useState(initialData?.stage?.toLowerCase() || "inquiry");
  const [leadId, setLeadId] = useState(initialData?.leadId || "");
  const [propertyId, setPropertyId] = useState(initialData?.propertyId || "");
  const [ownerId, setOwnerId] = useState(initialData?.ownerId || "");

  useEffect(() => {
    if (open) {
      fetchLeads();
      fetchProperties();
      fetchAgents();
    }
  }, [open, fetchLeads, fetchProperties, fetchAgents]);

  useEffect(() => {
    if (initialData) {
      setStage(initialData.stage?.toLowerCase());
      setLeadId(initialData.leadId || "");
      setPropertyId(initialData.propertyId || "");
      setOwnerId(initialData.ownerId || "");
    } else {
      setStage("inquiry");
      setLeadId("");
      setPropertyId("");
      // If Agent is creating, default assignment to themselves
      setOwnerId(user?.role === 'AGENT' ? user.id : "");
    }
  }, [initialData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      ...data,
      value: parseFloat(data.value as string),
      stage: stage.toUpperCase(),
      leadId: leadId || undefined,
      propertyId: propertyId || undefined,
      ownerId: ownerId === "unassigned" ? null : (ownerId || null),
    };

    try {
      if (initialData) {
        await update(initialData.id, payload);
        toast.success("Deal updated successfully!");
      } else {
        await add(payload);
        await fetchNotifications();
        toast.success("Deal created successfully!");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save deal");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl bg-card/90 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {initialData ? 'Edit Deal' : 'Create New Deal'}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              {initialData ? 'Update deal specifics and value.' : 'Track a new sales opportunity in your pipeline.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Deal Title</Label>
              <Input id="title" name="title" defaultValue={initialData?.title} placeholder="e.g. Skyline Apt - Unit 402" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Deal Value (₹)</Label>
                <Input id="value" name="value" type="number" defaultValue={initialData?.value} placeholder="e.g. 12000000" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stage" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Pipeline Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                    <SelectItem value="inquiry">Inquiry</SelectItem>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Deal Owner (Agent)</Label>
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

            <div className="grid gap-2">
              <Label htmlFor="leadId" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Associate Lead</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[250px]">
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="propertyId" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Associate Property</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[250px]">
                  {properties.map(prop => (
                    <SelectItem key={prop.id} value={prop.id}>{prop.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl font-bold px-8">Cancel</Button>
            <Button type="submit" className="h-12 rounded-2xl font-bold px-8 shadow-lg shadow-primary/20">
              {initialData ? 'Update Deal' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DealForm;
