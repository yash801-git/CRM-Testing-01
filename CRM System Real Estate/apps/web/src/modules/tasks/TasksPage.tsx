import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import TaskForm from "./components/TaskForm";
import { useTaskStore } from "./store";
import { useUserStore } from "@/store/userStore";
import { usePermission } from "@/hooks/usePermission";
import { Pagination } from "@/components/ui/pagination";

const TasksPage: React.FC = () => {
  const { isBroker } = usePermission();
  const { user } = useUserStore();
  const { data: tasks, fetchAll, remove, update, loading, page, totalPages, total } = useTaskStore();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  const filteredTasks = React.useMemo(() => {
    let result = tasks;
    
    // Role based filtering: Agents only see their assigned tasks
    if (user?.role === 'AGENT') {
      result = result.filter((t: any) => t.assigneeId === user.id);
    }

    if (filterStatus !== "ALL") {
      result = result.filter((t: any) => t.status === filterStatus);
    }
    
    if (searchQuery) {
      result = result.filter((t: any) => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [tasks, searchQuery, filterStatus, user]);

  const handleOpenForm = (task?: any) => {
    setSelectedTask(task || null);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await remove(taskToDelete);
      toast.success("Task deleted successfully");
      setConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await update(id, { status: newStatus });
      toast.success("Task status updated");
      fetchAll(true);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-500 bg-red-500/10';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10';
      case 'MEDIUM': return 'text-blue-500 bg-blue-500/10';
      case 'LOW': return 'text-slate-500 bg-slate-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'CANCELLED': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-slate-300" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">Task Manager</h1>
          <p className="text-muted-foreground font-medium">Coordinate actions and track progress across the team.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-2xl bg-card border-border/50 font-bold" 
            />
          </div>
          <Button onClick={() => handleOpenForm()} className="h-12 rounded-2xl shadow-lg shadow-primary/25 font-black px-6 gap-2">
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
          <Button 
            key={s} 
            variant="ghost" 
            onClick={() => setFilterStatus(s)}
            className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filterStatus === s ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            {s.replace('_', ' ')}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {loading && <div className="text-center py-12 font-black text-primary animate-pulse">SYNCING TASKS...</div>}
        
        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-24 bg-card/30 rounded-[3rem] border-2 border-dashed border-border/50">
            <div className="text-4xl mb-4 opacity-10"><CheckCircle2 className="h-16 w-16 mx-auto" /></div>
            <h3 className="text-xl font-black text-muted-foreground">Clear for takeoff!</h3>
            <p className="text-sm text-muted-foreground/60 font-medium">No pending tasks found for this view.</p>
          </div>
        )}

        {filteredTasks.map((task: any) => (
          <Card key={task.id} className="group border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2rem] overflow-hidden hover:scale-[1.01] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <div className="mt-1 flex-shrink-0">
                  {getStatusIcon(task.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{task.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium line-clamp-1">{task.description || 'No description provided'}</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary">
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-2 min-w-[180px]">
                        <DropdownMenuItem onClick={() => handleOpenForm(task)} className="rounded-xl gap-2 font-bold focus:bg-primary focus:text-white">
                          <Edit2 className="h-4 w-4" /> Edit Task
                        </DropdownMenuItem>
                        
                        {/* Quick Status Changes */}
                        <div className="px-2 pt-2 pb-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Change Status</p>
                        </div>
                        {[
                          { id: 'PENDING', label: 'Pending', color: 'text-slate-500' },
                          { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-500' },
                          { id: 'COMPLETED', label: 'Completed', color: 'text-emerald-500' },
                          { id: 'CANCELLED', label: 'Cancelled', color: 'text-red-500' },
                        ].map((s) => (
                          <DropdownMenuItem
                            key={s.id}
                            onClick={() => handleStatusChange(task.id, s.id)}
                            className={`rounded-xl gap-2 font-bold ${task.status === s.id ? 'bg-secondary' : ''} ${s.color}`}
                          >
                            {getStatusIcon(s.id)} {s.label}
                          </DropdownMenuItem>
                        ))}

                        {isBroker && (
                          <DropdownMenuItem onClick={() => handleDeleteClick(task.id)} className="rounded-xl gap-2 font-bold text-red-500 focus:bg-red-500 focus:text-white mt-1">
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-6 pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-secondary flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Assignee: <span className="text-foreground">{task.assignee?.name || 'Unassigned'}</span>
                      </div>
                    </div>

                    {task.dueDate && (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-secondary flex items-center justify-center">
                          <Calendar className="h-3.5 w-3.5 text-orange-500" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Due: <span className="text-foreground">{new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                    )}

                    <div className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer uppercase tracking-widest" onClick={() => handleOpenForm(task)}>
                      View Details <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 px-2">
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          totalItems={total}
          limit={10}
          onPageChange={(newPage) => fetchAll(true, newPage, 10)} 
        />
      </div>

      <TaskForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        initialData={selectedTask}
      />

      <ConfirmDialog 
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Task?"
        description="Are you sure you want to permanently delete this task? This action cannot be undone."
        confirmText="Delete Task"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TasksPage;
