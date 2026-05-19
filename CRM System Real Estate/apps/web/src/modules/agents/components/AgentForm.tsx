import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgentStore } from "../store";

interface AgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

const AgentForm: React.FC<AgentFormProps> = ({ open, onOpenChange, initialData }) => {
  const { add, update } = useAgentStore();
  
  const [role, setRole] = useState(initialData?.role || "AGENT");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRole(initialData.role || "AGENT");
    } else {
      setRole("AGENT");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      ...data,
      role: role.toUpperCase(),
    };

    if (initialData) {
      await update(initialData.id, payload);
    } else {
      await add(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">
            {initialData ? 'Edit Team Member' : 'Add New Agent'}
          </DialogTitle>
          <DialogDescription className="font-bold text-muted-foreground pt-2">
            Register a new employee and assign their role in the brokerage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <Input 
                id="name"
                name="name"
                defaultValue={initialData?.name}
                placeholder="e.g. Rahul Sharma"
                className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email}
                placeholder="rahul@estatesync.com"
                className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-primary/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                <Input 
                  id="phone"
                  name="phone"
                  defaultValue={initialData?.phone}
                  placeholder="+91 98765 43210"
                  className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">System Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-primary/20">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="AGENT">Agent (Staff)</SelectItem>
                    <SelectItem value="BROKER">Broker (Admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!initialData && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Password</Label>
                <div className="relative group">
                  <Input 
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pr-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-6">
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform"
            >
              {initialData ? 'Update Profile' : 'Register Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentForm;
