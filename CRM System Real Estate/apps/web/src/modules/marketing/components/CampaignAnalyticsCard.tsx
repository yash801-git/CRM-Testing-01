import React, { useMemo } from 'react';

interface Campaign {
  id: string;
  budget?: number | string | null;
  spent?: number | string | null;
  targetSegmentValue?: number | string | null;
  clicksBySource?: Record<string, number> | null;
  leads?: any[];
  [key: string]: any;
}

interface CampaignAnalyticsCardProps {
  campaign: Campaign;
  totalLeads: number;
}

export function CampaignAnalyticsCard({ campaign, totalLeads }: CampaignAnalyticsCardProps) {
  // Parse decimal values from DB
  const budget = Number(campaign.budget || 0);
  const spent = Number(campaign.spent || 0);
  const targetSegmentValue = Number(campaign.targetSegmentValue || 0);

  // A. Budget Burn Rate
  const burnRate = budget > 0 ? (spent / budget) * 100 : 0;
  const clampedBurnRate = Math.min(Math.max(burnRate, 0), 100);

  // B. Cost Per Lead (CPL)
  const cpl = totalLeads > 0 ? (spent / totalLeads) : 0;

  // C. Potential Pipeline Value
  const pipelineValue = totalLeads * targetSegmentValue;

  // D. Source Analytics Breakdown
  const sourceAnalytics = useMemo(() => {
    const clicksBySource = (campaign.clicksBySource as Record<string, number>) || {};
    const leadsBySource: Record<string, number> = {};

    if (campaign.leads && Array.isArray(campaign.leads)) {
      campaign.leads.forEach((cl: any) => {
        const source = cl.lead?.source || 'CRM Ad Form';
        leadsBySource[source] = (leadsBySource[source] || 0) + 1;
      });
    }

    const allSources = Array.from(new Set([...Object.keys(clicksBySource), ...Object.keys(leadsBySource)]));

    return allSources.map(source => {
      const clicks = clicksBySource[source] || 0;
      const leads = leadsBySource[source] || 0;
      const conversionRate = clicks > 0 ? (leads / clicks) * 100 : 0;
      // Clamp bounce rate to 0 to avoid negative values if leads > clicks
      const bounceRate = clicks > 0 ? Math.max(((clicks - leads) / clicks) * 100, 0) : 0;

      return {
        source,
        clicks,
        leads,
        conversionRate,
        bounceRate
      };
    }).sort((a, b) => b.clicks - a.clicks); // Sort by highest clicks
  }, [campaign.clicksBySource, campaign.leads]);

  return (
    <div className="mt-4 pt-4 border-t border-primary/10">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Analytics & ROI</h4>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Cost Per Lead (CPL) */}
        <div className="bg-primary/5 rounded-2xl p-3 flex flex-col justify-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Cost Per Lead (CPL)</span>
          <span className="text-lg font-black text-primary mt-1">₹{cpl.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>

        {/* Potential Pipeline Value */}
        <div className="bg-emerald-500/10 rounded-2xl p-3 flex flex-col justify-center border border-emerald-500/20">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Pipeline Value</span>
          <span className="text-lg font-black text-emerald-600 mt-1">₹{pipelineValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Budget Burn Rate */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Burn Rate ({Math.round(burnRate)}%)</span>
          <span className="text-[10px] font-black">₹{spent.toLocaleString()} / ₹{budget.toLocaleString()}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${clampedBurnRate > 90 ? 'bg-red-500' : clampedBurnRate > 75 ? 'bg-amber-500' : 'bg-primary'}`}
            style={{ width: `${clampedBurnRate}%` }}
          />
        </div>
      </div>

      {/* Source Breakdown */}
      {sourceAnalytics.length > 0 && (
        <div className="bg-secondary/20 rounded-2xl p-3 border border-border/40">
          <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Performance by Source</h5>
          <div className="space-y-2">
            {sourceAnalytics.map((stat, i) => (
              <div key={i} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{stat.source}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {stat.clicks} Clicks → {stat.leads} Leads
                  </span>
                </div>
                <div className="flex justify-between items-center bg-secondary/50 rounded-lg p-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                    {Math.round(stat.conversionRate)}% Conversion
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
                    {Math.round(stat.bounceRate)}% Bounce
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
