import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";

const IntegrationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Specific Meta Config State
  const [metaConfig, setMetaConfig] = useState({
    appId: '',
    pageId: '',
    accessToken: '',
  });
  
  const [isMetaActive, setIsMetaActive] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const res = await api.get('/integrations');
      const integrations = res.data;
      
      const metaIntegration = integrations.find((i: any) => i.provider === 'META_LEADS');
      if (metaIntegration) {
        setIsMetaActive(metaIntegration.isActive);
        if (metaIntegration.config) {
          setMetaConfig(metaIntegration.config);
        }
      }
    } catch (error) {
      console.error("Failed to load integrations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeta = async () => {
    setSaving(true);
    try {
      await api.post('/integrations/META_LEADS', {
        isActive: true,
        config: metaConfig,
        webhookSecret: 'meta-secret-' + Math.random().toString(36).substring(7) // Example secret generator
      });
      setIsMetaActive(true);
      toast.success("Meta Integration Saved Successfully!");
    } catch (error) {
      console.error("Failed to save meta integration", error);
      toast.error("Error saving integration configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectMeta = async () => {
    try {
      await api.post('/integrations/META_LEADS', {
        isActive: false,
        config: metaConfig,
      });
      setIsMetaActive(false);
      toast.success("Meta Integration Disconnected");
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">Integrations</h1>
        <p className="text-muted-foreground font-medium">Connect third-party apps to automate your real estate workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Meta Leads Card */}
        <Card className={`border-none shadow-xl ${isMetaActive ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-card/50'} backdrop-blur-md rounded-[2rem] overflow-hidden transition-all`}>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              {isMetaActive ? (
                <span className="flex items-center text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1"/> Connected</span>
              ) : (
                <span className="flex items-center text-xs font-black text-muted-foreground bg-secondary px-3 py-1 rounded-full"><XCircle className="w-3 h-3 mr-1"/> Disconnected</span>
              )}
            </div>
            <CardTitle className="mt-4 text-xl font-black">Facebook Leads</CardTitle>
            <CardDescription className="text-xs font-medium">Automatically sync leads from your Facebook Ad campaigns directly into the CRM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">App ID</Label>
              <Input 
                value={metaConfig.appId} 
                onChange={(e) => setMetaConfig({...metaConfig, appId: e.target.value})} 
                placeholder="e.g. 1029384756"
                className="h-10 bg-secondary/50 border-none rounded-xl font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Page ID</Label>
              <Input 
                value={metaConfig.pageId} 
                onChange={(e) => setMetaConfig({...metaConfig, pageId: e.target.value})} 
                placeholder="Your FB Page ID"
                className="h-10 bg-secondary/50 border-none rounded-xl font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Access Token</Label>
              <Input 
                type="password"
                value={metaConfig.accessToken} 
                onChange={(e) => setMetaConfig({...metaConfig, accessToken: e.target.value})} 
                placeholder="EAAI... long token string"
                className="h-10 bg-secondary/50 border-none rounded-xl font-medium"
              />
            </div>
            
            <div className="pt-4 flex gap-2">
              <Button onClick={handleSaveMeta} disabled={saving} className="flex-1 rounded-xl font-black shadow-lg shadow-primary/20">
                {saving ? 'Saving...' : (isMetaActive ? 'Update Config' : 'Connect')}
              </Button>
              {isMetaActive && (
                <Button onClick={handleDisconnectMeta} variant="destructive" className="rounded-xl px-3">
                  Disconnect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder: WhatsApp API */}
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-[2rem] overflow-hidden opacity-50 grayscale cursor-not-allowed">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <CardTitle className="mt-4 text-xl font-black">WhatsApp API</CardTitle>
            <CardDescription className="text-xs font-medium">Send automated updates and connect directly via WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled className="w-full rounded-xl">Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsPage;
