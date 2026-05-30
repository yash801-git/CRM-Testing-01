import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Megaphone, TrendingUp, Users, CheckCircle2, Mail, MessageCircle, Phone, Share2, Trash2, Edit, ChevronDown, CircleDot, Link } from 'lucide-react';
import { CampaignAnalyticsCard } from './components/CampaignAnalyticsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCampaignStore } from './store';
import { useUserStore } from '@/store/userStore';
import { usePermission } from '@/hooks/usePermission';
import CampaignForm from './components/CampaignForm';
import api from '@/services/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'sonner';

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  EMAIL: <Mail className="h-4 w-4" />,
  WHATSAPP: <MessageCircle className="h-4 w-4" />,
  SMS: <Phone className="h-4 w-4" />,
  SOCIAL_MEDIA: <Share2 className="h-4 w-4" />,
  COLD_CALL: <Phone className="h-4 w-4" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  EMAIL: 'text-blue-500 bg-blue-500/10',
  WHATSAPP: 'text-emerald-500 bg-emerald-500/10',
  SMS: 'text-purple-500 bg-purple-500/10',
  SOCIAL_MEDIA: 'text-orange-500 bg-orange-500/10',
  COLD_CALL: 'text-amber-500 bg-amber-500/10',
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-500',
  ACTIVE: 'bg-emerald-500/10 text-emerald-600',
  PAUSED: 'bg-amber-500/10 text-amber-600',
  COMPLETED: 'bg-blue-500/10 text-blue-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
};

const MarketingPage: React.FC = () => {
  const { canManageCampaigns, isBroker } = usePermission();
  const { data: campaigns, fetchAll, remove, update } = useCampaignStore();
  const { user } = useUserStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, totalLeadsReached: 0 });
  const [filter, setFilter] = useState('ALL');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
    api.get('/marketing/stats').then(r => setStats(r.data)).catch(() => {});
  }, [fetchAll]);

  const handleOpen = (campaign?: any) => {
    setEditingCampaign(campaign || null);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCampaignToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (campaignToDelete) {
      await remove(campaignToDelete);
      setStats(s => ({ ...s, total: s.total - 1 }));
      toast.success("Campaign deleted successfully");
      setConfirmOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      await update(id, { status: newStatus });
      toast.success("Campaign status updated");
      fetchAll();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleCopyLink = (campaign: any) => {
    let url = `${window.location.origin}/public/lead-form?campaignId=${campaign.id}&source=CRM+Ad+Form`;
    if (campaign.propertyId) {
      url += `&propertyId=${campaign.propertyId}`;
    }
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Ad form link copied to clipboard! Share it in your ads.');
    }).catch(() => {
      toast.error('Could not copy to clipboard');
    });
  };

  const filtered = useMemo(() => {
    if (filter === 'ALL') return campaigns;
    return campaigns.filter((c: any) => c.status === filter);
  }, [campaigns, filter]);

  const statCards = [
    { label: 'Total Campaigns', value: stats.total, icon: Megaphone, color: 'blue' },
    { label: 'Active Now', value: stats.active, icon: TrendingUp, color: 'emerald' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'purple' },
    { label: 'Leads Reached', value: stats.totalLeadsReached, icon: Users, color: 'orange' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">Marketing Hub</h1>
          <p className="text-muted-foreground font-medium">Create and manage outreach campaigns to convert leads into buyers.</p>
        </div>
        {canManageCampaigns && (
          <Button
            onClick={() => handleOpen()}
            className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/25 hover:scale-105 transition-transform font-bold gap-2"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <Card key={i} className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden group relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{s.label}</CardTitle>
              <div className={`p-2 rounded-xl bg-${s.color}-500/10 text-${s.color}-500`}>
                <s.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black tracking-tight">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {['ALL', 'DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Campaign Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-10 w-10 text-primary opacity-50" />
          </div>
          <h3 className="text-xl font-black text-muted-foreground">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground/60 max-w-xs">Launch your first campaign to start reaching leads at scale.</p>
          {canManageCampaigns && (
            <Button onClick={() => handleOpen()} className="mt-2 rounded-2xl font-bold gap-2">
              <Plus className="h-4 w-4" /> Create First Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((campaign: any) => {
            const leadCount = campaign._count?.leads ?? campaign.leads?.length ?? 0;
            const respondedCount = campaign.leads?.filter((cl: any) => cl.responded).length ?? 0;
            const responseRate = leadCount > 0 ? Math.round((respondedCount / leadCount) * 100) : 0;
            const budgetUsed = campaign.budget ? Math.round((Number(campaign.spent || 0) / Number(campaign.budget)) * 100) : 0;

            return (
              <Card key={campaign.id} className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden group hover:shadow-2xl transition-all duration-300 rounded-3xl flex flex-col">
                {/* Card Top Accent */}
                <div className={`h-1.5 w-full ${campaign.status === 'ACTIVE' ? 'bg-emerald-500' : campaign.status === 'DRAFT' ? 'bg-slate-400' : campaign.status === 'PAUSED' ? 'bg-amber-500' : campaign.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-red-500'}`}></div>

                <CardContent className="p-6 flex-1 flex flex-col gap-4">
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-base tracking-tight truncate">{campaign.title}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-widest">
                        by {campaign.createdBy?.name || 'System'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${STATUS_COLOR[campaign.status] || 'bg-secondary text-muted-foreground'}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>

                  {/* Channel + Property Badges */}
                  <div className="flex flex-wrap gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${CHANNEL_COLOR[campaign.type] || 'text-muted-foreground bg-secondary'}`}>
                      {CHANNEL_ICON[campaign.type]} {campaign.type?.replace('_', ' ')}
                    </div>
                    {campaign.property && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-orange-500/10 text-orange-500">
                        🏠 {campaign.property.title}
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  {campaign.content && (
                    <p className="text-xs text-muted-foreground bg-secondary/40 p-3 rounded-2xl italic line-clamp-2">
                      "{campaign.content}"
                    </p>
                  )}

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-secondary/50 rounded-2xl p-3 text-center">
                      <p className="text-xl font-black">{leadCount}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Leads</p>
                    </div>
                    <div className="bg-secondary/50 rounded-2xl p-3 text-center">
                      <p className="text-xl font-black">{responseRate}%</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Response</p>
                    </div>
                  </div>

                  {/* Analytics & Budget Bar */}
                  {(campaign.budget || campaign.spent) && (
                    <CampaignAnalyticsCard 
                      campaign={campaign} 
                      totalLeads={leadCount} 
                    />
                  )}

                  {/* Date Range */}
                  {(campaign.startDate || campaign.endDate) && (
                    <p className="text-[10px] font-bold text-muted-foreground">
                      📅 {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('en-GB') : '—'} → {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('en-GB') : 'Ongoing'}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={!canManageCampaigns}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex-1 rounded-xl font-bold text-xs gap-1.5 h-9 ${STATUS_COLOR[campaign.status] || ''}`}
                          disabled={!canManageCampaigns}
                        >
                          <CircleDot className="h-3 w-3" />
                          {campaign.status}
                          {canManageCampaigns && <ChevronDown className="h-3 w-3 opacity-50 ml-auto" />}
                        </Button>
                      </DropdownMenuTrigger>
                      {canManageCampaigns && (
                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl p-2 min-w-[140px]">
                          {Object.keys(STATUS_COLOR).map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => handleToggleStatus(campaign.id, s)}
                              className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest cursor-pointer mb-1 last:mb-0 ${campaign.status === s ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                            >
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      )}
                    </DropdownMenu>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyLink(campaign)}
                      className="h-9 w-9 rounded-xl hover:bg-violet-500/10 hover:text-violet-500"
                      title="Copy public ad form link"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    {canManageCampaigns && (
                      <Button size="sm" variant="ghost" onClick={() => handleOpen(campaign)} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {isBroker && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(campaign.id)} className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CampaignForm open={formOpen} onOpenChange={setFormOpen} initialData={editingCampaign} />
      
      <ConfirmDialog 
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Campaign?"
        description="Are you sure you want to delete this marketing campaign? This will remove all associated statistics."
        confirmText="Delete Campaign"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default MarketingPage;
