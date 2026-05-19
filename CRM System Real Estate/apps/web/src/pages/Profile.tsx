import React, { useState, useEffect } from 'react';
import { Mail, Phone, Shield, MapPin, Camera, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from '@/services/api';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        city: res.data.city || '',
        state: res.data.state || ''
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/users/me', formData);
      setUser(res.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('files', file);

    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = res.data.urls[0];
      
      // Update profile with new image
      const updatedUser = await api.patch('/users/me', { avatarUrl: imageUrl });
      setUser(updatedUser.data);
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px] font-black text-primary animate-pulse text-2xl">LOADING PROFILE...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">My Profile</h1>
          <p className="text-muted-foreground font-medium">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md overflow-hidden pt-8">
            <CardContent className="flex flex-col items-center">
              <div className="relative group">
                <div className="h-32 w-32 rounded-3xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-primary-foreground text-4xl font-black shadow-xl shadow-primary/20 border-4 border-background overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.split(' ').map((n: string) => n[0]).join('')
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95">
                  <Camera className={`h-4 w-4 text-primary-foreground ${uploading ? 'animate-spin' : ''}`} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              <h2 className="mt-6 text-2xl font-black">{user?.name}</h2>
              <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-1">{user?.role === 'BROKER' ? 'Broker Admin' : 'Property Agent'}</p>
              
              <div className="w-full mt-8 space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{user?.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{user?.city ? `${user.city}, ${user.state || ''}` : 'Location not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-primary/5 border border-primary/10">
            <CardContent className="pt-6 flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">Verified Account</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Your account is verified as a licensed real estate {user?.role?.toLowerCase()}.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2">
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl font-black tracking-tight">Account Settings</CardTitle>
              <CardDescription className="font-bold">Update your profile details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input id="name" value={formData.name} onChange={handleInputChange} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-2 focus-visible:ring-primary/20" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-2 focus-visible:ring-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={handleInputChange} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-2 focus-visible:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-black text-xs uppercase tracking-widest text-muted-foreground">City</Label>
                  <Input id="city" value={formData.city} onChange={handleInputChange} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-2 focus-visible:ring-primary/20" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Work Address</Label>
                <Input id="address" value={formData.address} onChange={handleInputChange} className="h-12 rounded-2xl bg-secondary/50 border-none font-bold focus-visible:ring-2 focus-visible:ring-primary/20" />
              </div>

              <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
                <Button variant="outline" className="h-12 rounded-2xl font-bold px-8">Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="h-12 rounded-2xl font-bold px-8 shadow-lg shadow-primary/20">
                  <Save className={`mr-2 h-4 w-4 ${saving ? 'animate-spin' : ''}`} /> 
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
