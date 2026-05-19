import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFollowUpStore } from "../store";
import { useLeadStore } from "@/modules/leads/store";
import { useDealStore } from "@/modules/deals/store";

interface FollowUpFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  leadId?: string;
  dealId?: string;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({ open, onOpenChange, initialData, leadId, dealId }) => {
  const { add, update } = useFollowUpStore();
  const { data: leads, fetchAll: fetchLeads } = useLeadStore();
  const { data: deals, fetchAll: fetchDeals } = useDealStore();

  const [type, setType] = useState(initialData?.type || "CALL");
  const [selectedLeadId, setSelectedLeadId] = useState(leadId || initialData?.leadId || "");
  const [selectedDealId, setSelectedDealId] = useState(dealId || initialData?.dealId || "");

  useEffect(() => {
    if (!leadId && !dealId) {
      fetchLeads();
      fetchDeals();
    }
  }, [leadId, dealId, fetchLeads, fetchDeals]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setSelectedLeadId(initialData.leadId || "");
      setSelectedDealId(initialData.dealId || "");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const { date, time, ...rest } = data;

    const payload = {
      ...rest,
      type,
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      leadId: selectedLeadId || null,
      dealId: selectedDealId || null,
    };

    if (initialData) {
      await update(initialData.id, payload);
    } else {
      await add(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {initialData ? 'Update Follow-up' : 'Schedule Follow-up'}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground pt-2">
              Plan your next interaction with the client.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Objective</Label>
              <Input id="title" name="title" defaultValue={initialData?.title} placeholder="e.g. Discuss site visit feedback" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                    <SelectItem value="CALL">Phone Call</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Linked To</Label>
                {!leadId && !dealId ? (
                   <Select value={selectedLeadId ? `lead:${selectedLeadId}` : (selectedDealId ? `deal:${selectedDealId}` : "")} onValueChange={(val) => {
                     const [t, id] = val.split(':');
                     if (t === 'lead') { setSelectedLeadId(id); setSelectedDealId(""); }
                     else { setSelectedDealId(id); setSelectedLeadId(""); }
                   }}>
                    <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                      <SelectValue placeholder="Select context" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                       <p className="px-2 py-1.5 text-[10px] font-black uppercase text-muted-foreground opacity-50">Leads</p>
                       {leads.map((l: any) => <SelectItem key={l.id} value={`lead:${l.id}`}>{l.name}</SelectItem>)}
                       <p className="px-2 py-1.5 text-[10px] font-black uppercase text-muted-foreground opacity-50 border-t mt-1">Deals</p>
                       {deals.map((d: any) => <SelectItem key={d.id} value={`deal:${d.id}`}>{d.title}</SelectItem>)}
                    </SelectContent>
                   </Select>
                ) : (
                  <div className="h-12 rounded-2xl bg-secondary/20 flex items-center px-4 font-black text-xs uppercase tracking-widest text-primary">
                    {leadId ? 'Current Lead' : 'Current Deal'}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().split('T')[0] : ''} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Time</Label>
                <Input id="time" name="time" type="time" defaultValue={initialData?.scheduledAt ? new Date(initialData.scheduledAt).toTimeString().substring(0, 5) : ''} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Notes</Label>
              <Input id="notes" name="notes" defaultValue={initialData?.notes} placeholder="What do you need to talk about?" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
            </div>
          </div>

          <DialogFooter className="pt-8 mt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl font-bold">Cancel</Button>
            <Button type="submit" className="h-12 rounded-2xl font-bold px-8 shadow-lg shadow-primary/20">
              {initialData ? 'Update Schedule' : 'Confirm Follow-up'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpForm;
