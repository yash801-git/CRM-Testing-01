import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { toast } from 'sonner';

const BrokerLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      
      const response = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.access_token);
      toast.success("Login successful!");
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to login. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/60 backdrop-blur-2xl rounded-[2.5rem] relative z-10 overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-3xl shadow-inner rotate-3">
              <Briefcase className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-display italic tracking-tight text-foreground">Broker Login</CardTitle>
          <CardDescription className="font-medium text-muted-foreground/70">
            Enter your credentials to access admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-4">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="email" type="email" placeholder="name@company.com" className="pl-12 h-12 border-none bg-secondary/50 rounded-2xl font-bold text-sm focus-visible:ring-2 focus-visible:ring-primary/20" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                <Link 
                  to="/forgot-password"
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-12 pr-12 h-12 border-none bg-secondary/50 rounded-2xl font-bold text-sm focus-visible:ring-2 focus-visible:ring-primary/20" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <Button className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 font-black text-base mt-4" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In as Broker"}
              {!loading && <ArrowRight className="ml-3 h-5 w-5" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center pb-10">
          <Link to="/auth" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors">
            ← Back to Role Selection
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BrokerLogin;
