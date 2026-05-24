export enum CRM_EVENTS {
  LEAD_CREATED = 'lead.created',
  DEAL_STATUS_CHANGED = 'deal.status_changed',
  SITE_VISIT_COMPLETED = 'visit.completed',
  SITE_VISIT_NO_SHOW = 'visit.no_show',
  LEAD_STATUS_CHANGED = 'lead.status_changed',
}

export class LeadCreatedEvent {
  constructor(
    public readonly leadId: string,
    public readonly ownerId: string,
    public readonly leadName: string,
    public readonly formId?: string,
  ) {}
}

export class DealStatusChangedEvent {
  constructor(
    public readonly dealId: string,
    public readonly ownerId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly leadId?: string,
    public readonly propertyId?: string,
  ) {}
}

export class SiteVisitStatusEvent {
  constructor(
    public readonly visitId: string,
    public readonly agentId: string,
    public readonly leadId?: string,
    public readonly propertyId?: string,
  ) {}
}

export class LeadStatusChangedEvent {
  constructor(
    public readonly leadId: string,
    public readonly ownerId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly leadName: string,
    public readonly budget?: number,
  ) {}
}
