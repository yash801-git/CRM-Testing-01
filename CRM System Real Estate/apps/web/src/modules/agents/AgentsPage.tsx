import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Trash2, Edit2, Shield, UserCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AgentForm from "./components/AgentForm";
import { useAgentStore } from "./store";
import ConfirmDialog from "@/components/ConfirmDialog";

const AgentsPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Confirm Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

  const { data: agents, fetchAll, remove, loading } = useAgentStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredAgents = React.useMemo(() => {
    return (agents || []).filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           a.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [agents, searchQuery]);

  const handleDeleteClick = (id: string) => {
    setAgentToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (agentToDelete) {
      await remove(agentToDelete);
      setConfirmOpen(false);
      setAgentToDelete(null);
    }
  };

  const handleEdit = (agent: any) => {
    setEditingAgent(agent);
    setFormOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Team Management</h1>
            {!loading && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-sm font-black">
                {agents.length} Total
              </span>
            )}
          </div>
          <p className="text-muted-foreground font-medium">Manage your brokerage's agents and staff permissions.</p>
        </div>
        <Button onClick={() => { setEditingAgent(null); setFormOpen(true); }} className="h-12 rounded-2xl shadow-lg shadow-primary/25 font-bold px-6">
          <Plus className="mr-2 h-4 w-4" /> Add New Agent
        </Button>
      </div>

      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md overflow-hidden rounded-[2rem]">
        <CardHeader className="border-b border-border/50 pb-6 pt-8 px-8">
          <div className="relative group max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-none bg-secondary/50 rounded-2xl font-bold" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 px-4 pb-4">
          {loading && <div className="text-center py-12 font-black text-primary animate-pulse">Syncing Team Data...</div>}
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-6">Member</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Contact</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Role</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="text-4xl mb-4 text-muted-foreground opacity-20"><UserCircle2 className="h-12 w-12 mx-auto" /></div>
                    <h3 className="text-lg font-black text-muted-foreground">No team members found</h3>
                  </TableCell>
                </TableRow>
              )}
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-secondary/30 transition-colors border-border/30 rounded-2xl overflow-hidden">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
                        {agent.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-black leading-none mb-1">{agent.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agent ID: {agent.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs font-bold text-muted-foreground">
                      <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {agent.email}</div>
                      <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {agent.phone || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className={`h-4 w-4 ${agent.role === 'BROKER' ? 'text-purple-500' : 'text-blue-500'}`} />
                      <span className={`text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest ${agent.role === 'BROKER' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {agent.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      Active
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(agent)} className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-secondary">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(agent.id)} className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AgentForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        initialData={editingAgent}
      />

      <ConfirmDialog 
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove Team Member?"
        description="Are you sure you want to revoke system access for this agent? Their assigned data will remain but they will no longer be able to log in."
        confirmText="Remove Access"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default AgentsPage;
