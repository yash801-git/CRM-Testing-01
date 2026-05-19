import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      toast.success("Reset link sent!", {
        description: `We've sent a password reset link to ${email}`,
      });
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <Card className="w-full max-w-md border-none shadow-2xl bg-card/60 backdrop-blur-2xl rounded-[2.5rem] relative z-10 text-center p-10 animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-display italic tracking-tight text-foreground mb-4">Check your mail</CardTitle>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            We've sent a password recovery link to <span className="text-primary font-black">{email}</span>. Please check your inbox (and spam folder).
          </p>
          <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full h-14 rounded-2xl border-primary/20 text-primary font-black hover:bg-primary/5">
            Didn't receive? Try again
          </Button>
          <Link to="/auth" className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground mt-8 hover:text-primary transition-colors">
            <ChevronLeft className="h-3 w-3" /> Back to Login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/60 backdrop-blur-2xl rounded-[2.5rem] relative z-10 overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-3xl shadow-inner rotate-3">
              <KeyRound className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-display italic tracking-tight text-foreground">Reset Password</CardTitle>
          <CardDescription className="font-medium text-muted-foreground/70 px-6 leading-relaxed">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="pl-12 h-14 border-none bg-secondary/50 rounded-2xl font-bold text-sm focus-visible:ring-2 focus-visible:ring-primary/20" 
                  required 
                />
              </div>
            </div>

            <Button className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 font-black text-base mt-4" type="submit" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
              {!loading && <ArrowRight className="ml-3 h-5 w-5" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center pb-10">
          <Link to="/auth" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-3 w-3" /> Back to Role Selection
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
