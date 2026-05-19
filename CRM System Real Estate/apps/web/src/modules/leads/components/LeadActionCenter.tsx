import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Calendar, 
  CheckSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTaskStore } from "@/modules/tasks/store";
import { useVisitStore } from "@/modules/site-visits/store";
import FollowUpForm from "@/modules/follow-ups/components/FollowUpForm";
import TaskForm from "@/modules/tasks/components/TaskForm";
import VisitForm from "@/modules/site-visits/components/VisitForm";

interface LeadActionCenterProps {
  leadId: string;
  leadName: string;
}

const LeadActionCenter: React.FC<LeadActionCenterProps> = ({ leadId, leadName }) => {
  const { data: tasks } = useTaskStore();
  const { data: visits } = useVisitStore();

  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={() => setFollowUpOpen(true)}
        className="h-10 px-4 gap-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 transition-all"
      >
        <Phone className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Log Call</span>
      </Button>
      
      <Button 
        className="h-10 px-4 gap-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all"
        onClick={() => window.open(`https://wa.me/`, '_blank')}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">WhatsApp</span>
      </Button>

      <Button 
        onClick={() => setVisitOpen(true)}
        className="h-10 px-4 gap-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/20 transition-all"
      >
        <Calendar className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Site Visit</span>
      </Button>

      <Button 
        onClick={() => setTaskOpen(true)}
        className="h-10 px-4 gap-2 rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white border border-purple-500/20 transition-all"
      >
        <CheckSquare className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Task</span>
      </Button>

      {/* Forms */}
      <FollowUpForm 
        open={followUpOpen} 
        onOpenChange={setFollowUpOpen} 
        leadId={leadId} 
      />
      <TaskForm 
        open={taskOpen} 
        onOpenChange={setTaskOpen} 
        leadId={leadId}
      />
      <VisitForm 
        open={visitOpen} 
        onOpenChange={setVisitOpen} 
        initialData={undefined}
      />
    </div>
  );
};

export default LeadActionCenter;
