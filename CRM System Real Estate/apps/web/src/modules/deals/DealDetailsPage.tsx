import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  User, 
  Plus,
  Home,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDealStore } from "./store";
import FollowUpTimeline from "../follow-ups/components/FollowUpTimeline";
import FollowUpForm from "../follow-ups/components/FollowUpForm";

const DealDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deals, fetchAll } = useDealStore();
  const [deal, setDeal] = useState<any>(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);

  useEffect(() => {
    if (deals.length === 0) fetchAll();
  }, [deals.length, fetchAll]);

  useEffect(() => {
    if (id && deals.length > 0) {
      const found = deals.find((d: any) => d.id === id);
      setDeal(found);
    }
  }, [id, deals]);

  if (!deal) return <div className="flex items-center justify-center h-[60vh] font-black text-primary animate-pulse">SYNCING DEAL ASSETS...</div>;

  const getStageColor = (stage: string) => {
    switch (stage?.toUpperCase()) {
      case 'INQUIRY': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'QUALIFICATION': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'PROPOSAL': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'NEGOTIATION': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'BOOKING': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CLOSED_WON': return 'bg-emerald-600 text-white border-emerald-600';
      case 'CLOSED_LOST': return 'bg-red-600 text-white border-red-600';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const handleOpenFollowUp = (f?: any) => {
    setEditingFollowUp(f || null);
    setFollowUpOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/pipeline')} className="h-10 w-10 rounded-xl bg-card hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">{deal.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${getStageColor(deal.stage)} uppercase tracking-widest`}>
              {deal.stage.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-black px-3 py-1 bg-secondary rounded-xl text-muted-foreground uppercase tracking-widest">
               Value: ₹{Number(deal.value).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Deal Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
               <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-primary/20 mx-auto mb-4">
                  <Briefcase className="h-10 w-10" />
               </div>
               <CardTitle className="text-center font-black tracking-tight">Deal Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client Name</span>
                    <span className="font-bold">{deal.lead?.name || 'Unknown'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center">
                    <Home className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property Unit</span>
                    <span className="font-bold">{deal.property?.title || 'No property linked'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expected Close</span>
                    <span className="font-bold">{deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString('en-GB') : 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                 <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Revenue Potential</span>
                       <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-black tracking-tighter text-emerald-600">₹{Number(deal.value).toLocaleString()}</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2.5rem]">
            <CardContent className="p-8">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Deal Strategy</h4>
               <div className="space-y-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal Notes</span>
                 <p className="text-sm font-medium text-muted-foreground bg-secondary/30 p-4 rounded-2xl italic">
                   {deal.notes || 'No specific strategy notes for this deal yet.'}
                 </p>
               </div>
               <Button className="w-full mt-6 rounded-2xl font-bold h-12 gap-2" variant="outline">
                  <FileText className="h-4 w-4" /> Generate Proposal
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activities & Follow-ups */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Deal Activity</h2>
            <Button onClick={() => handleOpenFollowUp()} className="h-10 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Log Interaction
            </Button>
          </div>

          <FollowUpTimeline dealId={deal.id} onEdit={handleOpenFollowUp} />
        </div>
      </div>

      <FollowUpForm 
        open={followUpOpen} 
        onOpenChange={setFollowUpOpen} 
        dealId={deal.id} 
        initialData={editingFollowUp}
      />
    </div>
  );
};

export default DealDetailsPage;
