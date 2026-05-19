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
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useVisitStore } from "../store";
import { usePropertyStore } from "@/modules/properties/store";
import { useLeadStore } from "@/modules/leads/store";
import { useAgentStore } from "@/modules/agents/store";
import { useUserStore } from "@/store/userStore";
import { usePermission } from "@/hooks/usePermission";
import { useNotificationStore } from "@/modules/notifications/store";

interface VisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const VisitForm: React.FC<VisitFormProps> = ({ open, onOpenChange, initialData }) => {
  const { add, update } = useVisitStore();
  const { data: properties, fetchAll: fetchProperties } = usePropertyStore();
  const { data: leads, fetchAll: fetchLeads } = useLeadStore();
  const { data: agents, fetchAll: fetchAgents } = useAgentStore();
  const { user } = useUserStore();
  const { isBroker } = usePermission();
  const { fetchAll: fetchNotifications } = useNotificationStore();

  const [status, setStatus] = useState(initialData?.status?.toLowerCase() || "scheduled");
  const [propertyId, setPropertyId] = useState(initialData?.propertyId || "");
  const [leadId, setLeadId] = useState(initialData?.leadId || "");
  const [agentId, setAgentId] = useState(initialData?.agentId || "");

  useEffect(() => {
    fetchProperties();
    fetchLeads();
    fetchAgents();
    
    if (initialData) {
      setStatus(initialData.status?.toLowerCase());
      if (initialData.propertyId) setPropertyId(initialData.propertyId);
      if (initialData.leadId) setLeadId(initialData.leadId);
      if (initialData.agentId) setAgentId(initialData.agentId);
    } else {
      // If Agent is creating, default assignment to themselves
      setAgentId(user?.role === 'AGENT' ? user.id : "");
    }
  }, [initialData, fetchProperties, fetchLeads, fetchAgents, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Parse dd/mm/yyyy
    const dateParts = (data.date as string).split('/');
    if (dateParts.length !== 3) {
      toast.error("Invalid date format. Please use dd/mm/yyyy");
      return;
    }
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      toast.error("Invalid date values. Please enter a valid date.");
      return;
    }
    // Convert to ISO (yyyy-mm-dd) for Date constructor
    const isoDateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${data.time}`;
    const scheduledAt = new Date(isoDateStr).toISOString();

    const payload = {
      scheduledAt,
      status: status.toUpperCase(),
      feedback: data.feedback,
      leadId: leadId || undefined,
      propertyId: propertyId || undefined,
      agentId: agentId || undefined,
    };

    if (initialData) {
      await update(initialData.id, payload);
      toast.success("Site visit updated successfully!");
    } else {
      await add(payload as any);
      await fetchNotifications();
      toast.success("Site visit scheduled successfully!");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl bg-card/90 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {initialData ? 'Visit Details' : 'Schedule Site Visit'}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              {initialData ? 'Review or update property tour info.' : 'Set up a date and time for a property showing.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="propertyId" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Property</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[300px]">
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="leadId" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Lead / Visitor</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[300px]">
                  {leads.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name} - {l.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agentId" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Conducting Agent</Label>
              <Select 
                value={agentId} 
                onValueChange={setAgentId}
                disabled={!isBroker}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[300px]">
                  {!isBroker && user ? (
                    <SelectItem value={user.id}>{user.name} (Me)</SelectItem>
                  ) : (
                    agents.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
                <DateInput 
                  id="date" 
                  name="date"
                  defaultValue={initialData?.scheduledAt ? new Date(initialData.scheduledAt).toLocaleDateString('en-GB') : ''} 
                  className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" 
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Time</Label>
                <Input 
                  id="time" 
                  name="time"
                  type="time" 
                  defaultValue={initialData?.scheduledAt?.split('T')[1]?.substring(0, 5)} 
                  className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" 
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Visit Status</Label>
              <Select 
                value={status} 
                onValueChange={setStatus}
                disabled={initialData?.status === 'COMPLETED' || initialData?.status === 'CANCELLED'}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feedback" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Feedback / Notes</Label>
              <Input id="feedback" name="feedback" defaultValue={initialData?.feedback} placeholder="How was the tour?" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl font-bold px-8">Cancel</Button>
            <Button type="submit" className="h-12 rounded-2xl font-bold px-8 shadow-lg shadow-primary/20">
              {initialData ? 'Update Visit' : 'Schedule Visit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VisitForm;
