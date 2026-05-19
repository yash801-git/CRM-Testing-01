import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { toast } from 'sonner';

const Register: React.FC = () => {
  const role = 'BROKER';
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const name = (document.getElementById('name') as HTMLInputElement).value;
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const phone = (document.getElementById('phone') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      
      await api.post('/auth/register', { name, email, phone, password, role });
      
      toast.success("Registration successful! Please login.");
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to register. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]"></div>

      <Card className="w-full max-w-md border-none shadow-2xl bg-card/60 backdrop-blur-2xl rounded-[2.5rem] relative z-10 overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-3xl shadow-inner rotate-3">
              <Home className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-display italic tracking-tight text-foreground">Create account</CardTitle>
          <CardDescription className="font-medium text-muted-foreground/70">
            Join EstateSync as a Broker Admin
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="name" placeholder="John Doe" className="pl-12 h-12 border-none bg-secondary/50 rounded-2xl font-bold text-sm focus-visible:ring-2 focus-visible:ring-primary/20" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="email" type="email" placeholder="name@company.com" className="pl-12 h-12 border-none bg-secondary/50 rounded-2xl font-bold text-sm focus-visible:ring-2 focus-visible:ring-primary/20" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="phone" placeholder="+91 98765 43210" className="pl-12 h-12 border-none bg-secondary/50 rounded-2xl font-bold text-sm focus-visible:ring-2 focus-visible:ring-primary/20" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Password</Label>
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
              {loading ? "Creating your portal..." : "Launch Account"}
              {!loading && <ArrowRight className="ml-3 h-5 w-5" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center pb-10">
          <p className="text-xs font-bold text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary font-black hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
