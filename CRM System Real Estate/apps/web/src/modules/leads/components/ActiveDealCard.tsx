import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Briefcase, TrendingUp, Building2, Plus } from 'lucide-react';
import { useDealStore } from "@/modules/deals/store";
import { toast } from "sonner";

interface ActiveDealCardProps {
  leadId: string;
}

const ActiveDealCard: React.FC<ActiveDealCardProps> = ({ leadId }) => {
  const { data: deals, update: updateDeal, fetchAll: fetchDeals } = useDealStore();
  
  const activeDeal = useMemo(() => deals.find(d => d.leadId === leadId), [deals, leadId]);

  const handleStageChange = async (newStage: string) => {
    if (activeDeal) {
      try {
        await updateDeal(activeDeal.id, { stage: newStage });
        toast.success(`Deal moved to ${newStage.replace('_', ' ')}`);
        fetchDeals(true);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update status");
      }
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'INQUIRY': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'QUALIFICATION': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'PROPOSAL': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'NEGOTIATION': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'BOOKING': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'REGISTRATION': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'CLOSED_WON': return 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20';
      case 'CLOSED_LOST': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden border-l-4 border-l-primary h-full">
      <CardHeader className="pb-2 pt-8 px-8">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-black tracking-tight">Active Deal</CardTitle>
          {activeDeal && <Briefcase className="h-5 w-5 text-primary opacity-50" />}
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {activeDeal ? (
          <div className="space-y-6 mt-4">
            <div className="p-4 rounded-3xl bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="h-4 w-4" />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Stage</div>
                    <div className={`text-sm font-black mt-0.5 ${getStageColor(activeDeal.stage).split(' ')[0]}`}>{activeDeal.stage}</div>
                 </div>
              </div>

              <Select value={activeDeal.stage} onValueChange={handleStageChange}>
                <SelectTrigger className="h-12 rounded-2xl bg-card border-none font-bold shadow-sm focus:ring-primary/20 focus:ring-offset-0 focus:ring-2">
                  <SelectValue placeholder="Change Stage" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl bg-card z-50">
                  <SelectItem value="INQUIRY">Inquiry</SelectItem>
                  <SelectItem value="QUALIFICATION">Qualification</SelectItem>
                  <SelectItem value="PROPOSAL">Proposal</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="BOOKING">Booking Done</SelectItem>
                  <SelectItem value="REGISTRATION">Registration</SelectItem>
                  <SelectItem value="CLOSED_WON">Closed (Won)</SelectItem>
                  <SelectItem value="CLOSED_LOST">Closed (Lost)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-muted-foreground">Deal Value</span>
                <span className="font-black text-primary">₹{parseFloat(activeDeal.value).toLocaleString()}</span>
              </div>
              {activeDeal.property && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-secondary/30 text-xs font-bold border border-border/30">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="truncate">{activeDeal.property.title}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 mt-4 border-2 border-dashed border-border/50 rounded-[2rem] bg-secondary/10">
            <p className="text-xs font-bold text-muted-foreground opacity-50 mb-4">No active deal for this client.</p>
            <Button variant="outline" className="rounded-2xl h-10 font-black text-[10px] uppercase tracking-widest">
              <Plus className="h-3 w-3 mr-2" /> Create Deal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveDealCard;
