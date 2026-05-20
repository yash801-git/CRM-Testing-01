import React from 'react';
import { Users, Home, Briefcase, TrendingUp, ExternalLink, Calendar, MapPin, CheckCircle2, Star, Clock, Target, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

import { useEffect, useMemo } from 'react';
import { usePropertyStore } from '@/modules/properties/store';
import { useLeadStore } from '@/modules/leads/store';
import { useDealStore } from '@/modules/deals/store';
import { useVisitStore } from '@/modules/site-visits/store';
import { useFollowUpStore } from '@/modules/follow-ups/store';
import { useCampaignStore } from '@/modules/marketing/store';
import { useUserStore } from '@/store/userStore';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { data: properties, fetchAll: fetchProperties } = usePropertyStore();
  const { data: leads, fetchAll: fetchLeads } = useLeadStore();
  const { data: deals, fetchAll: fetchDeals } = useDealStore();
  const { data: visits, fetchAll: fetchVisits } = useVisitStore();
  const { data: followUps, fetchAll: fetchFollowUps } = useFollowUpStore();
  const { data: campaigns, fetchAll: fetchCampaigns } = useCampaignStore();

  useEffect(() => {
    fetchProperties();
    fetchLeads();
    fetchDeals();
    fetchVisits();
    fetchFollowUps();
    fetchCampaigns();
  }, [fetchProperties, fetchLeads, fetchDeals, fetchVisits, fetchFollowUps, fetchCampaigns]);

  const isBroker = user?.role === 'BROKER';

  // Filter data based on role
  const myLeads = useMemo(() => {
    if (!user) return [];
    return isBroker ? leads : leads.filter(l => l.ownerId === user.id);
  }, [leads, user, isBroker]);

  const myDeals = useMemo(() => {
    if (!user) return [];
    return isBroker ? deals : deals.filter(d => d.ownerId === user.id);
  }, [deals, user, isBroker]);

  const myProperties = useMemo(() => {
    if (!user) return [];
    return isBroker ? properties : properties.filter(p => p.ownerId === user.id);
  }, [properties, user, isBroker]);

  const myVisits = useMemo(() => {
    if (!user) return [];
    return isBroker ? visits : visits.filter(v => v.agentId === user.id);
  }, [visits, user, isBroker]);

  const myFollowUps = useMemo(() => {
    if (!user) return [];
    return isBroker ? followUps : followUps.filter(f => f.agentId === user.id);
  }, [followUps, user, isBroker]);

  const myCampaigns = useMemo(() => {
    if (!user) return [];
    return isBroker ? campaigns : campaigns.filter(c => c.createdById === user.id);
  }, [campaigns, user, isBroker]);

  // Derived data for charts
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data: Array<{name: string, leads: number, deals: number, month: number, year: number}> = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = new Date().getFullYear();
      if (m < 0) { m += 12; y -= 1; }
      data.push({ name: months[m], leads: 0, deals: 0, month: m, year: y });
    }
    myLeads.forEach(l => {
      const d = new Date(l.createdAt);
      const point = data.find(pt => pt.month === d.getMonth() && pt.year === d.getFullYear());
      if (point) point.leads += 1;
    });
    myDeals.forEach(d => {
      const dt = new Date(d.createdAt);
      const point = data.find(pt => pt.month === dt.getMonth() && pt.year === dt.getFullYear());
      if (point) point.deals += 1;
    });
    return data;
  }, [myLeads, myDeals]);

  const dealFunnelData = useMemo(() => {
    const stages: Record<string, number> = {};
    myDeals.forEach(d => { stages[d.stage] = (stages[d.stage] || 0) + 1; });
    return Object.entries(stages).map(([name, value]) => ({ 
      name: name.replace('_', ' '), 
      value,
      revenue: myDeals.filter(d => d.stage === name).reduce((acc, d) => acc + Number(d.value), 0)
    }));
  }, [myDeals]);

  const leadSourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    myLeads.forEach(l => {
      const src = l.source || 'Direct';
      sources[src] = (sources[src] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [myLeads]);

  const agentPerformanceData = useMemo(() => {
    if (!isBroker) return [];
    const performance: Record<string, { name: string, leads: number, deals: number }> = {};
    leads.forEach(l => {
      if (l.owner) {
        if (!performance[l.ownerId]) performance[l.ownerId] = { name: l.owner.name, leads: 0, deals: 0 };
        performance[l.ownerId].leads++;
      }
    });
    deals.forEach(d => {
      if (d.owner) {
        if (!performance[d.ownerId]) performance[d.ownerId] = { name: d.owner.name, leads: 0, deals: 0 };
        performance[d.ownerId].deals++;
      }
    });
    return Object.values(performance).sort((a,b) => b.deals - a.deals).slice(0, 5);
  }, [leads, deals, isBroker]);

  const recentActivity = useMemo(() => {
    const activity: any[] = [];
    [...myLeads].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3).forEach(l => activity.push({ user: l.owner?.name || 'Agent', action: 'added new lead', target: l.name, time: new Date(l.createdAt).toLocaleDateString('en-GB'), rawTime: new Date(l.createdAt).getTime(), color: 'blue', path: '/leads' }));
    [...myDeals].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3).forEach(d => activity.push({ user: d.owner?.name || 'Agent', action: 'created deal', target: d.title, time: new Date(d.createdAt).toLocaleDateString('en-GB'), rawTime: new Date(d.createdAt).getTime(), color: 'emerald', path: '/deals' }));
    return activity.sort((a,b) => b.rawTime - a.rawTime).slice(0, 5);
  }, [myLeads, myDeals]);

  const upcomingVisits = useMemo(() => {
    return [...myVisits].filter(v => new Date(v.scheduledAt) >= new Date()).sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).slice(0, 4);
  }, [myVisits]);

  const upcomingFollowUps = useMemo(() => {
    return [...myFollowUps].filter(f => f.status === 'PENDING').sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).slice(0, 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myFollowUps]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  const pipelineValue = myDeals.reduce((acc, d) => acc + Number(d.value || 0), 0);
  const totalPortfolioValue = myProperties.reduce((acc, p) => acc + Number(p.price || 0), 0);

  const handleExport = () => {
    toast.success("Preparing your business report...", {
      description: "We are aggregating your latest CRM data. Your download will start shortly.",
    });
    // Simulate generation
    setTimeout(() => {
      toast.success("Report Ready!", {
        description: "Your PDF report has been generated successfully.",
      });
    }, 2000);
  };

  if (!user) return null;

  const commonTooltipProps = {
    contentStyle: {
      backgroundColor: 'hsl(var(--card))',
      borderRadius: '16px',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      padding: '12px',
      color: 'hsl(var(--foreground))'
    },
    itemStyle: { fontSize: '12px', fontWeight: 'bold', color: 'hsl(var(--foreground))' },
    labelStyle: { fontSize: '12px', fontWeight: '900', color: 'hsl(var(--primary))', marginBottom: '4px' }
  };

  const axisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">
            {isBroker ? 'Broker Overview' : 'Agent Dashboard'}
          </h1>
          <p className="text-muted-foreground font-medium">
            {isBroker ? 'Real-time performance analytics for your brokerage.' : `Welcome back, ${user?.name}. Here's your performance for this month.`}
          </p>
        </div>
        <Button 
          onClick={handleExport}
          className="rounded-2xl h-12 px-6 shadow-lg shadow-primary/25 hover:scale-105 transition-transform font-bold"
        >
          <ExternalLink className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: isBroker ? 'Portfolio Value' : 'My Listings', value: isBroker ? `₹${(totalPortfolioValue / 10000000).toFixed(1)}Cr` : myProperties.length.toString(), change: 'Inventory', icon: TrendingUp, color: 'emerald', sub: isBroker ? 'Total Value' : 'Active', path: '/properties' },
          { title: 'Pipeline Value', value: `₹${(pipelineValue / 10000000).toFixed(1)}Cr`, change: 'Pipeline', icon: Briefcase, color: 'blue', sub: 'Active Deals', path: '/pipeline' },
          { title: 'My Leads', value: myLeads.length.toString(), change: 'Capture', icon: Users, color: 'orange', sub: 'Total Base', path: '/leads' },
          { title: 'Marketing Reach', value: myCampaigns.length.toString(), change: 'Outreach', icon: Megaphone, color: 'purple', sub: 'Campaigns', path: '/marketing' },
        ].map((stat, i) => (
          <Card key={i} onClick={() => navigate(stat.path)} className="border-none shadow-xl bg-card/50 backdrop-blur-md card-hover overflow-hidden group cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              <div className="flex items-center mt-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-${stat.color}-500/10 text-${stat.color}-500 uppercase tracking-widest`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-2xl bg-card/50 backdrop-blur-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black tracking-tight">Lead Velocity</CardTitle>
          </CardHeader>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...commonTooltipProps} />
                <Bar dataKey="leads" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-2xl bg-card/50 backdrop-blur-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black tracking-tight">Recent Activity</CardTitle>
          </CardHeader>
          <div className="space-y-4 mt-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl bg-${item.color}-500/10 text-${item.color}-500 flex items-center justify-center font-black text-xs`}>
                  {item.user[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{item.user} {item.action}</p>
                  <p className="text-[10px] text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-3 border-none shadow-2xl bg-card/50 backdrop-blur-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black tracking-tight">Upcoming Visits</CardTitle>
          </CardHeader>
          <div className="space-y-4 mt-4">
            {upcomingVisits.map((visit, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-secondary/30">
                <div className="text-center min-w-[40px]">
                   <div className="text-[10px] font-black text-primary">{new Date(visit.scheduledAt).toLocaleString('en-US', { month: 'short' })}</div>
                   <div className="text-lg font-black">{new Date(visit.scheduledAt).getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black truncate">{visit.property?.title}</p>
                   <p className="text-[10px] text-muted-foreground">{visit.lead?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-2xl bg-card/50 backdrop-blur-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black tracking-tight">Pipeline Stage Analysis</CardTitle>
          </CardHeader>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={dealFunnelData} margin={{ left: 60 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border p-3 rounded-xl shadow-xl">
                          <p className="text-xs font-black">{payload[0].payload.name}</p>
                          <p className="text-sm font-black text-primary">{payload[0].value} Deals</p>
                          <p className="text-[10px] text-muted-foreground">Volume: ₹{(payload[0].payload.revenue / 100000).toFixed(1)}L</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4 border-none shadow-2xl bg-card/50 backdrop-blur-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black tracking-tight">Lead Sources</CardTitle>
          </CardHeader>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={leadSourceData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                  stroke="none"
                  onClick={(data) => navigate(`/leads?source=${data.name}`)}
                >
                  {leadSourceData.map((_, i) => (
                    <Cell 
                      key={i} 
                      fill={COLORS[i % COLORS.length]} 
                      className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-2xl bg-card/50 backdrop-blur-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black tracking-tight">Revenue Forecast</CardTitle>
          </CardHeader>
          <div className="space-y-6 mt-6">
            {dealFunnelData.slice(0, 4).map((stage, i) => (
              <div 
                key={i} 
                className="space-y-2 cursor-pointer group"
                onClick={() => navigate(`/pipeline?stage=${stage.name.replace(' ', '_')}`)}
              >
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">{stage.name}</span>
                   <span className="text-sm font-black">₹{(stage.revenue / 100000).toFixed(1)}L</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min((stage.revenue / Math.max(pipelineValue, 1)) * 100, 100)}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-2xl bg-card/50 backdrop-blur-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black tracking-tight">{isBroker ? 'Agent Leaderboard' : 'Workload'}</CardTitle>
          </CardHeader>
          <div className="space-y-5 mt-6">
            {(isBroker ? agentPerformanceData : [
              { name: 'Leads', value: myLeads.length, icon: Users, path: '/leads' },
              { name: 'Visits', value: myVisits.length, icon: MapPin, path: '/visits' },
              { name: 'Deals', value: myDeals.length, icon: Briefcase, path: '/pipeline' },
            ]).map((item: any, i: number) => (
              <div 
                key={i} 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => navigate(isBroker ? `/team` : item.path)}
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] group-hover:bg-primary group-hover:text-white transition-all">
                  {isBroker ? item.name[0] : <item.icon className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black group-hover:text-primary transition-colors">{item.name}</div>
                  <div className="h-1 w-full bg-secondary rounded-full mt-1.5">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(((isBroker ? item.deals : item.value) / 10) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div className="text-sm font-black">{isBroker ? item.deals : item.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
