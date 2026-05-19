import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  Edit,
  ExternalLink,
  MessageCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UnifiedTimeline from "./UnifiedTimeline";
import LeadActionCenter from "./LeadActionCenter";
import FollowUpForm from "../../follow-ups/components/FollowUpForm";
import LeadForm from "./LeadForm";

interface LeadDetailViewProps {
  lead: any;
  onClose?: () => void;
}

const LeadDetailView: React.FC<LeadDetailViewProps> = ({ lead, onClose }) => {
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [leadFormOpen, setLeadFormOpen] = useState(false);

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
    <div className="space-y-10 h-full overflow-y-auto pr-4 custom-scrollbar">
      {/* Header Info */}
      <div className="flex flex-col gap-6 sticky top-0 bg-background/80 backdrop-blur-md z-10 pb-8 pt-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-display font-black tracking-tight text-foreground">{lead.name}</h2>
            <div className="flex items-center gap-3 mt-3">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${getStatusColor(lead.status)} uppercase tracking-widest`}>
                {lead.status}
              </span>
              <span className="text-[10px] font-black px-3 py-1 bg-secondary rounded-full text-muted-foreground uppercase tracking-widest">
                {lead.source || 'Direct'}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLeadFormOpen(true)} className="h-10 w-10 rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-all">
            <Edit className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Core Info - 5 cols */}
        <div className="xl:col-span-5 space-y-10">
          <Card className="border-none shadow-sm bg-card/40 rounded-[2.5rem] overflow-hidden">
             <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Mobile Contact</span>
                    <span className="text-base font-extrabold">{lead.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Email Address</span>
                    <span className="text-base font-extrabold truncate">{lead.email || 'No email registered'}</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/30">
                   <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 shadow-inner">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest opacity-80 mb-2 block">Investment Potential</span>
                      <p className="text-3xl font-black tracking-tighter text-primary">₹{lead.budget ? Number(lead.budget).toLocaleString() : '0'}</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <div className="sticky top-32">
            <LeadActionCenter leadId={lead.id} leadName={lead.name} />
          </div>
        </div>

        {/* Timeline - 7 cols */}
        <div className="xl:col-span-7 space-y-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">Engagement History</h3>
          </div>
          <UnifiedTimeline leadId={lead.id} />
        </div>
      </div>

      <FollowUpForm 
        open={followUpOpen} 
        onOpenChange={setFollowUpOpen} 
        leadId={lead.id} 
        initialData={editingFollowUp}
      />

      <LeadForm 
        open={leadFormOpen}
        onOpenChange={setLeadFormOpen}
        initialData={lead}
      />
    </div>
  );
};

export default LeadDetailView;
