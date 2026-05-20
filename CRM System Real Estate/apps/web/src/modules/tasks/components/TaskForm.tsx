import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskStore } from "../store";
import { useAgentStore } from "@/modules/agents/store";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  leadId?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ open, onOpenChange, initialData }) => {
  const { add, update } = useTaskStore();
  const { data: agents, fetchAll: fetchAgents } = useAgentStore();
  const { user } = useUserStore();
  
  const [priority, setPriority] = useState(initialData?.priority || "MEDIUM");
  const [status, setStatus] = useState(initialData?.status || "PENDING");
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || "");

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (initialData) {
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setAssigneeId(initialData.assigneeId || "");
    } else {
      setPriority("MEDIUM");
      setStatus("PENDING");
      // If Agent is creating, default assignment to themselves
      setAssigneeId(user?.role === 'AGENT' ? user.id : "");
    }
  }, [initialData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      ...data,
      priority,
      status,
      assigneeId: assigneeId || null,
      dueDate: data.dueDate ? new Date(data.dueDate as string).toISOString() : null
    };

    try {
      if (initialData) {
        await update(initialData.id, payload);
        toast.success("Task updated successfully!");
      } else {
        await add(payload);
        toast.success("Task created successfully!");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save task");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-8">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {initialData ? 'Update Task' : 'Create New Task'}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground pt-2">
              Set objectives and assign responsibilities to your team.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Task Title</Label>
              <Input id="title" name="title" defaultValue={initialData?.title} placeholder="e.g. Follow up with Rahul" className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
              <Input id="description" name="description" defaultValue={initialData?.description} placeholder="Details about the task..." className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Due Date</Label>
                <Input 
                  id="dueDate" 
                  name="dueDate" 
                  type="date" 
                  defaultValue={initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''} 
                  className="h-12 rounded-2xl bg-secondary/50 border-none font-bold" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Assign To</Label>
                <Select 
                  value={assigneeId} 
                  onValueChange={setAssigneeId}
                  disabled={user?.role === 'AGENT'}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                    {user?.role === 'BROKER' && <SelectItem value="none">Unassigned</SelectItem>}
                    {user?.role === 'AGENT' ? (
                      <SelectItem value={user.id}>{user.name} (Me)</SelectItem>
                    ) : (
                      agents.map((agent: any) => (
                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-8 mt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl font-bold">Cancel</Button>
            <Button type="submit" className="h-12 rounded-2xl font-bold px-8 shadow-lg shadow-primary/20">
              {initialData ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
