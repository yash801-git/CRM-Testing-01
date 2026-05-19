import React from 'react';
import { Phone, Users, Mail, MessageSquare, CheckCircle2, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useFollowUpStore } from "../store";

interface FollowUpTimelineProps {
  leadId?: string;
  dealId?: string;
  onEdit?: (followUp: any) => void;
}

const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({ leadId, dealId, onEdit }) => {
  const { data: followUps, remove, update, fetchAll } = useFollowUpStore();

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredFollowUps = React.useMemo(() => {
    return followUps.filter((f: any) => 
      (leadId && f.leadId === leadId) || (dealId && f.dealId === dealId)
    ).sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [followUps, leadId, dealId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="h-4 w-4" />;
      case 'MEETING': return <Users className="h-4 w-4" />;
      case 'EMAIL': return <Mail className="h-4 w-4" />;
      case 'WHATSAPP': return <MessageSquare className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-emerald-500 bg-emerald-500/10', label: 'Done' };
      case 'PENDING': return { icon: <Clock className="h-3 w-3" />, color: 'text-blue-500 bg-blue-500/10', label: 'Upcoming' };
      case 'MISSED': return { icon: <AlertCircle className="h-3 w-3" />, color: 'text-red-500 bg-red-500/10', label: 'Missed' };
      default: return { icon: <Clock className="h-3 w-3" />, color: 'text-slate-500 bg-slate-500/10', label: 'Unknown' };
    }
  };

  const handleToggleComplete = async (f: any) => {
    const newStatus = f.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await update(f.id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {filteredFollowUps.length === 0 && (
        <div className="text-center py-10 bg-secondary/20 rounded-3xl border border-dashed border-border/50">
          <p className="text-sm font-bold text-muted-foreground opacity-50">No follow-ups scheduled yet.</p>
        </div>
      )}

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-primary/10 before:to-transparent">
        {filteredFollowUps.map((f: any) => {
          const status = getStatusInfo(f.status);
          const isUpcoming = new Date(f.scheduledAt) > new Date();
          
          return (
            <div key={f.id} className="relative flex items-start gap-6 group">
              <div className={`flex flex-shrink-0 h-10 w-10 rounded-xl items-center justify-center shadow-lg transition-transform group-hover:scale-110 z-10 ${
                f.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 
                f.status === 'MISSED' ? 'bg-red-500 text-white' : 'bg-primary text-white'
              }`}>
                {getTypeIcon(f.type)}
              </div>
              
              <div className="flex-1 bg-card/40 backdrop-blur-sm p-5 rounded-[2rem] border border-border/50 shadow-sm transition-all hover:shadow-md hover:bg-card/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                       <h4 className="text-lg font-black tracking-tight">{f.title}</h4>
                       <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                          {status.icon} {status.label}
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                       <Clock className="h-3 w-3" /> {new Date(f.scheduledAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleToggleComplete(f)} className={`h-8 w-8 rounded-lg ${f.status === 'COMPLETED' ? 'text-emerald-500 bg-emerald-500/10' : 'text-blue-500 bg-blue-500/10'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit?.(f)} className="h-8 w-8 rounded-lg text-slate-500 bg-slate-500/10">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(f.id)} className="h-8 w-8 rounded-lg text-red-500 bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {f.notes && (
                  <p className="text-sm font-medium text-muted-foreground border-t border-border/30 pt-3 italic">"{f.notes}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FollowUpTimeline;
