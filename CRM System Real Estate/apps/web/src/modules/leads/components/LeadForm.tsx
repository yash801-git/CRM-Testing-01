import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeadStore } from "../store";
import { useAgentStore } from "@/modules/agents/store";
import { useUserStore } from "@/store/userStore";
import { usePermission } from "@/hooks/usePermission";
import { useNotificationStore } from "@/modules/notifications/store";
import { toast } from "sonner";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const LeadForm: React.FC<LeadFormProps> = ({ open, onOpenChange, initialData }) => {
  const { add, update } = useLeadStore();
  const { data: agents, fetchAll: fetchAgents } = useAgentStore();
  const { user } = useUserStore();
  const { isBroker } = usePermission();
  const { fetchAll: fetchNotifications } = useNotificationStore();
  const [status, setStatus] = useState(initialData?.status?.toLowerCase() || "new");
  const [ownerId, setOwnerId] = useState(initialData?.ownerId || "");

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (initialData) {
      setStatus(initialData.status?.toLowerCase());
      setOwnerId(initialData.ownerId || "");
    } else {
      setStatus("new");
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
      status: status.toUpperCase(),
      ownerId: ownerId || null,
      budget: data.budget ? parseFloat(data.budget as string) : null
    };

    try {
      if (initialData) {
        await update(initialData.id, payload);
        toast.success("Lead updated successfully!");
      } else {
        await add(payload);
        await fetchNotifications();
        toast.success("Lead created successfully!");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save lead");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl bg-card/90 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {initialData ? 'Edit Lead' : 'Capture New Lead'}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              {initialData ? 'Update lead information.' : 'Add a potential client to your database.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <Input id="name" name="name" defaultValue={initialData?.name} placeholder="e.g. Rahul Sharma" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <Input id="email" name="email" type="email" defaultValue={initialData?.email} placeholder="rahul@example.com" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={initialData?.phone} placeholder="+91 98765 43210" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="source" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Source</Label>
                <Input id="source" name="source" defaultValue={initialData?.source} placeholder="e.g. Website, Instagram" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="site_visit_scheduled">Site Visit Scheduled</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Assign Agent</Label>
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
              <Label htmlFor="budget" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Estimated Budget (₹)</Label>
              <Input id="budget" name="budget" type="number" defaultValue={initialData?.budget} placeholder="e.g. 5000000" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Requirements & Notes</Label>
              <textarea 
                id="notes" 
                name="notes" 
                defaultValue={initialData?.notes} 
                placeholder="e.g. Looking for a 3BHK with sea view..." 
                className="w-full min-h-[100px] rounded-2xl bg-secondary/50 border-none font-bold p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl font-bold px-8">Cancel</Button>
            <Button type="submit" className="h-12 rounded-2xl font-bold px-8 shadow-lg shadow-primary/20">
              {initialData ? 'Update Lead' : 'Save Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadForm;
