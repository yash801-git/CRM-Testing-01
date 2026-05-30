import React from 'react';

interface Campaign {
  id: string;
  budget?: number | string | null;
  spent?: number | string | null;
  targetSegmentValue?: number | string | null;
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
      <div>
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
    </div>
  );
}
