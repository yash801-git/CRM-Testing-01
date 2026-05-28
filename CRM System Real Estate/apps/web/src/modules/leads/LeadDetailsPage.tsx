import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Plus,
  ExternalLink,
  MessageCircle,
  Edit
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeadStore } from "./store";
import UnifiedTimeline from "./components/UnifiedTimeline";
import LeadActionCenter from "./components/LeadActionCenter";
import LeadClosingHub from "./components/LeadClosingHub";
import ActiveDealCard from "./components/ActiveDealCard";
import FollowUpForm from "../follow-ups/components/FollowUpForm";
import LeadForm from "./components/LeadForm";

const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: leads, fetchAll } = useLeadStore();
  const [lead, setLead] = useState<any>(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null);
  const [leadFormOpen, setLeadFormOpen] = useState(false);

  useEffect(() => {
    if (leads.length === 0) fetchAll();
  }, [leads.length, fetchAll]);

  useEffect(() => {
    if (id && leads.length > 0) {
      const found = leads.find((l: any) => l.id === id);
      setLead(found);
    }
  }, [id, leads]);

  if (!lead) return <div className="flex items-center justify-center h-[60vh] font-black text-primary animate-pulse">LOADING CLIENT PROFILE...</div>;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NEW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'INTERESTED': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'CONVERTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'LOST': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const handleOpenFollowUp = (f?: any) => {
    setEditingFollowUp(f || null);
    setFollowUpOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20 px-2 sm:px-6">
      
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl py-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-2 sm:-mx-6 px-2 sm:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/leads')} className="h-12 w-12 rounded-2xl bg-secondary/50 hover:bg-secondary">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-display italic tracking-tight text-foreground leading-none">{lead.name}</h1>
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${getStatusColor(lead.status)} uppercase tracking-widest`}>
                {lead.status}
              </span>
              <span className="text-[10px] font-black px-3 py-1 bg-secondary rounded-xl text-muted-foreground uppercase tracking-widest">
                Source: {lead.source || 'Direct'}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setLeadFormOpen(true)} className="h-7 px-3 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20">
                 <Edit className="h-3 w-3 mr-1" /> Edit Profile
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex-shrink-0">
          <LeadActionCenter leadId={lead.id} leadName={lead.name} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="bg-secondary/30 border border-border/50 rounded-[1.5rem] p-1.5 mb-8 h-auto flex flex-wrap max-w-fit">
          <TabsTrigger value="overview" className="rounded-xl px-6 py-3 font-black tracking-widest uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all">Overview</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-xl px-6 py-3 font-black tracking-widest uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all">Activity Timeline</TabsTrigger>
          <TabsTrigger value="closing" className="rounded-xl px-6 py-3 font-black tracking-widest uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all">Closing Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden flex flex-col h-full">
              <CardHeader className="bg-primary/5 pb-6">
                 <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-primary/20 mx-auto mb-4">
                    {lead.name.split(' ').map((n: string) => n[0]).join('')}
                 </div>
                 <CardTitle className="text-center font-black tracking-tight">{lead.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile Number</span>
                      <span className="font-bold">{lead.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</span>
                      <span className="font-bold">{lead.email || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lead Created</span>
                      <span className="font-bold">{new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Engagement Stats</h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                     <div className="p-4 rounded-3xl bg-secondary/30 border border-border/50">
                        <div className="text-2xl font-black text-primary">12</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Activities</div>
                     </div>
                     <div className="p-4 rounded-3xl bg-secondary/30 border border-border/50">
                        <div className="text-2xl font-black text-emerald-500">2</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Visits</div>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2.5rem] flex flex-col h-full">
              <CardContent className="p-8">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Budget & Requirements</h4>
                 
                 <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex flex-col justify-center mb-6">
                    <span className="text-xs font-black uppercase text-primary tracking-widest">Estimated Budget</span>
                    <p className="text-2xl xl:text-3xl 2xl:text-4xl font-black tracking-tighter text-primary mt-2 whitespace-nowrap">
                      ₹{lead.budget ? Number(lead.budget).toLocaleString() : 'Not Specified'}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-secondary/40 p-4 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property Type</span>
                      <p className="text-sm font-bold mt-1">{lead.propertyType || 'Any'}</p>
                    </div>
                    <div className="bg-secondary/40 p-4 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Size / BHK</span>
                      <p className="text-sm font-bold mt-1">{lead.bhk || 'Any'}</p>
                    </div>
                    <div className="bg-secondary/40 p-4 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Purpose</span>
                      <p className="text-sm font-bold mt-1">{lead.purpose || 'Not Specified'}</p>
                    </div>
                    <div className="bg-secondary/40 p-4 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timeline</span>
                      <p className="text-sm font-bold mt-1">{lead.timeline || 'Not Specified'}</p>
                    </div>
                 </div>

                 {lead.requiresLoan && (
                   <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mb-6 flex items-start gap-3">
                     <span className="text-xl">🏦</span>
                     <div>
                       <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Home Loan Assistance Requested</p>
                       <p className="text-[11px] text-emerald-600/70 font-medium mt-1">This lead has requested help with financing. Pitch partner banks.</p>
                     </div>
                   </div>
                 )}

                 <div className="space-y-3">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Additional Notes</span>
                   <p className="text-sm font-medium text-muted-foreground bg-secondary/30 p-5 rounded-[1.5rem] italic">
                     {lead.notes || 'No extra requirements specified yet.'}
                   </p>
                 </div>
              </CardContent>
            </Card>

            <ActiveDealCard leadId={lead.id} />
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-0 outline-none focus-visible:ring-0">
          <div className="max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tighter">Activity Feed</h3>
              <Button variant="outline" className="h-10 rounded-xl border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                Refresh Feed
              </Button>
            </div>
            <UnifiedTimeline leadId={lead.id} />
          </div>
        </TabsContent>

        <TabsContent value="closing" className="mt-0 outline-none focus-visible:ring-0">
          <div className="max-w-3xl">
            <LeadClosingHub lead={lead} />
          </div>
        </TabsContent>
      </Tabs>

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

export default LeadDetailsPage;
