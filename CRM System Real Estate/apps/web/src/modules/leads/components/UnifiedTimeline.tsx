import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, 
  Users, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  PlusCircle, 
  Briefcase,
  Home,
  UserCheck,
  Edit2
} from 'lucide-react';
import { useFollowUpStore } from "@/modules/follow-ups/store";
import { useTaskStore } from "@/modules/tasks/store";
import { useDealStore } from "@/modules/deals/store";
import { useVisitStore } from "@/modules/site-visits/store";
import api from '@/services/api';

interface UnifiedTimelineProps {
  leadId: string;
}

interface TimelineEvent {
  id: string;
  type: 'ACTIVITY' | 'FOLLOW_UP' | 'TASK' | 'DEAL' | 'SITE_VISIT';
  title: string;
  description?: string;
  date: Date;
  status?: string;
  icon: React.ReactNode;
  userName?: string;
  priority?: string;
}

const UnifiedTimeline: React.FC<UnifiedTimelineProps> = ({ leadId }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const { data: followUps, fetchAll: fetchFollowUps } = useFollowUpStore();
  const { data: tasks, fetchAll: fetchTasks } = useTaskStore();
  const { data: deals, fetchAll: fetchDeals } = useDealStore();
  const { data: visits, fetchAll: fetchVisits } = useVisitStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [activityRes] = await Promise.all([
          api.get(`/activity/Lead/${leadId}`),
          fetchFollowUps(true),
          fetchTasks(true),
          fetchDeals(true),
          fetchVisits(true)
        ]);
        setActivities(activityRes.data);
      } catch (err) {
        console.error("Failed to load timeline data", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [leadId, fetchFollowUps, fetchTasks, fetchDeals, fetchVisits]);

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // 1. Add Activity Logs
    activities.forEach(a => {
      let icon = <RefreshCw className="h-4 w-4" />;
      let title = a.action.replace('_', ' ');
      let description = a.newValue ? `Changed to ${a.newValue}` : undefined;
      
      if (a.action === 'CREATED') {
        icon = <PlusCircle className="h-4 w-4" />;
        title = "Lead Captured";
        description = "New lead entered the system";
      } else if (a.action === 'ASSIGNED') {
        icon = <UserCheck className="h-4 w-4" />;
        title = "Lead Assigned";
        description = `Assigned to agent`;
      } else if (a.action === 'STATUS_CHANGED') {
        icon = <RefreshCw className="h-4 w-4" />;
        title = "Status Updated";
        description = `Moved from ${a.oldValue || 'None'} to ${a.newValue}`;
      } else if (a.action === 'UPDATED') {
        icon = <Edit2 className="h-4 w-4" />;
        title = "Profile Updated";
      }

      events.push({
        id: a.id,
        type: 'ACTIVITY',
        title,
        description,
        date: new Date(a.createdAt),
        userName: a.user?.name,
        icon
      });
    });

    // 2. Add Follow-ups
    followUps.filter((f: any) => f.leadId === leadId).forEach(f => {
      let icon = <Phone className="h-4 w-4" />;
      if (f.type === 'WHATSAPP') icon = <MessageSquare className="h-4 w-4" />;
      if (f.type === 'EMAIL') icon = <Mail className="h-4 w-4" />;
      if (f.type === 'MEETING') icon = <Users className="h-4 w-4" />;

      events.push({
        id: f.id,
        type: 'FOLLOW_UP',
        title: f.title,
        description: f.notes,
        date: new Date(f.scheduledAt),
        status: f.status,
        icon
      });
    });

    // 3. Add Tasks
    tasks.filter((t: any) => t.relatedType === 'LEAD' && t.relatedId === leadId).forEach(t => {
      events.push({
        id: t.id,
        type: 'TASK',
        title: `Task: ${t.title}`,
        description: t.description,
        date: new Date(t.createdAt),
        status: t.status,
        priority: t.priority,
        icon: <CheckCircle2 className="h-4 w-4" />
      });
    });

    // 4. Add Deals
    deals.filter((d: any) => d.leadId === leadId).forEach(d => {
      events.push({
        id: d.id,
        type: 'DEAL',
        title: `Deal Opened: ${d.title}`,
        description: `Value: ₹${parseFloat(d.value).toLocaleString()}`,
        date: new Date(d.createdAt),
        status: d.stage,
        icon: <Briefcase className="h-4 w-4" />
      });
    });

    // 5. Add Site Visits
    visits.filter((v: any) => v.leadId === leadId).forEach(v => {
      events.push({
        id: v.id,
        type: 'SITE_VISIT',
        title: `Site Visit: ${v.property?.title || 'Property'}`,
        description: v.notes,
        date: new Date(v.scheduledAt),
        status: v.status,
        icon: <Home className="h-4 w-4" />
      });
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [activities, followUps, tasks, deals, visits, leadId]);

  if (loading) return <div className="text-center py-20 font-black text-primary animate-pulse tracking-widest uppercase">Syncing Timeline...</div>;

  return (
    <div className="space-y-6">
      {timelineEvents.length === 0 && (
        <div className="text-center py-20 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border/50">
          <p className="text-sm font-bold text-muted-foreground opacity-50">No activity recorded yet.</p>
        </div>
      )}

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/30 before:via-primary/10 before:to-transparent">
        {timelineEvents.map((event, idx) => {
          const isAutomated = event.userName === 'SYSTEM' || event.type === 'TASK' || event.type === 'DEAL';
          
          return (
            <div key={`${event.type}-${event.id}-${idx}`} className="relative flex items-start gap-6 group">
              {/* Icon Container */}
              <div className={`flex flex-shrink-0 h-10 w-10 rounded-2xl items-center justify-center shadow-lg transition-transform group-hover:scale-110 z-10 border border-white/10 ${
                event.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 
                event.status === 'CANCELLED' ? 'bg-red-500 text-white' : 
                isAutomated ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-primary text-white'
              }`}>
                {event.icon}
              </div>
              
              {/* Content Card */}
              <div className="flex-1 bg-card/40 backdrop-blur-md p-6 rounded-[2rem] border border-border/50 shadow-sm transition-all hover:shadow-xl hover:bg-card/70 hover:-translate-y-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                       <h4 className="text-lg font-black tracking-tight">{event.title}</h4>
                       {event.status && (
                          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-secondary text-muted-foreground border border-border/50`}>
                             {event.status.replace('_', ' ')}
                          </div>
                       )}
                       {isAutomated && (
                          <div className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                             Automated
                          </div>
                       )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                       <Clock className="h-3 w-3" /> {event.date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       {event.userName && <span className="ml-2 px-2 border-l border-border/50">By {event.userName}</span>}
                    </div>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed border-t border-border/30 pt-3">
                    {event.description}
                  </p>
                )}
                
                {event.priority && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <AlertCircle className={`h-3 w-3 ${event.priority === 'HIGH' ? 'text-red-500' : 'text-blue-500'}`} />
                    <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{event.priority} Priority</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedTimeline;
