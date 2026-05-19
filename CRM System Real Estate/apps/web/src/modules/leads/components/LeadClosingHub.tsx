import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Wallet, 
  TrendingUp, 
  ArrowRight,
  Calculator,
  PartyPopper
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeadStore } from "../store";
import { toast } from "sonner";
import confetti from 'canvas-confetti';

interface LeadClosingHubProps {
  lead: any;
}

const LeadClosingHub: React.FC<LeadClosingHubProps> = ({ lead }) => {
  const { update, fetchAll } = useLeadStore();
  const [negotiatedPrice, setNegotiatedPrice] = useState(lead.budget ? lead.budget.toString() : '');
  const [isClosing, setIsClosing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(lead.status === 'CONVERTED');

  const handleCloseDeal = async () => {
    if (!negotiatedPrice || parseFloat(negotiatedPrice) <= 0) {
      toast.error("Please enter a valid negotiated price");
      return;
    }

    setIsClosing(true);
    try {
      await update(lead.id, { 
        status: 'CONVERTED',
        budget: parseFloat(negotiatedPrice)
      });
      
      // Success effects
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B']
      });
      
      setIsSuccess(true);
      toast.success("Deal Closed Successfully!");
      fetchAll(true);
    } catch (error) {
      toast.error("Failed to close deal. Try again.");
    } finally {
      setIsClosing(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-none shadow-2xl bg-emerald-500/10 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-emerald-500/20 animate-in zoom-in-95 duration-500">
        <CardContent className="p-10 text-center space-y-6">
          <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
            <PartyPopper className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-600">Deal Secured!</h3>
            <p className="text-emerald-600/70 font-bold mt-1">Finalized at ₹{Number(negotiatedPrice).toLocaleString()}</p>
          </div>
          <Button variant="outline" onClick={() => setIsSuccess(false)} className="rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white">
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-primary/5 pb-6 pt-8 px-8 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-black tracking-tight">Closing Hub</CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Final Negotiation & Settlement</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Price Input Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agreed Final Price (₹)</label>
             <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">Current Budget: ₹{lead.budget ? Number(lead.budget).toLocaleString() : '0'}</span>
          </div>
          <div className="relative group">
            <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              type="number"
              placeholder="Enter negotiated amount..." 
              value={negotiatedPrice}
              onChange={(e) => setNegotiatedPrice(e.target.value)}
              className="pl-14 h-16 border-none bg-secondary/50 rounded-2xl text-xl font-black focus-visible:ring-2 focus-visible:ring-primary/20" 
            />
          </div>
        </div>

        {/* Quick Calculation Summary */}
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
              <span className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Expected Revenue</span>
              <span className="text-lg font-black text-foreground">₹{negotiatedPrice ? (parseFloat(negotiatedPrice) * 0.02).toLocaleString() : '0'}</span>
              <span className="text-[8px] font-bold text-emerald-500 block">2% Commission</span>
           </div>
           <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
              <span className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Price Delta</span>
              <span className="text-lg font-black text-foreground">
                {negotiatedPrice && lead.budget ? (parseFloat(negotiatedPrice) - parseFloat(lead.budget) >= 0 ? '+' : '') : ''}
                {negotiatedPrice && lead.budget ? (parseFloat(negotiatedPrice) - parseFloat(lead.budget)).toLocaleString() : '0'}
              </span>
              <span className="text-[8px] font-bold text-blue-500 block">Vs Initial Budget</span>
           </div>
        </div>

        {/* Closing Action */}
        <Button 
          onClick={handleCloseDeal} 
          disabled={isClosing}
          className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20 group transition-all"
        >
          {isClosing ? (
            <span className="animate-pulse">PROCESSING CLOSURE...</span>
          ) : (
            <>
              CONVERT TO DEAL
              <CheckCircle2 className="ml-3 h-6 w-6 group-hover:scale-110 transition-transform" />
            </>
          )}
        </Button>

        <p className="text-center text-[10px] font-bold text-muted-foreground opacity-50 px-6">
          By clicking convert, the lead status will be updated to CONVERTED and the final budget will be saved as the official deal value.
        </p>
      </CardContent>
    </Card>
  );
};

export default LeadClosingHub;
