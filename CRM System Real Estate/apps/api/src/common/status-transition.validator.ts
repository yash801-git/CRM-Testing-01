import { BadRequestException } from '@nestjs/common';

/**
 * Legal status transitions per entity type.
 * Key: current status → Value: array of allowed next statuses
 */
const TRANSITIONS: Record<string, Record<string, string[]>> = {
  Lead: {
    NEW: ['INTERESTED', 'FOLLOW_UP', 'LOST'],
    INTERESTED: ['FOLLOW_UP', 'CONVERTED', 'LOST'],
    FOLLOW_UP: ['INTERESTED', 'CONVERTED', 'LOST'],
    CONVERTED: [],
    LOST: ['NEW'], // Allow re-opening a lost lead
  },
  Deal: {
    INQUIRY: ['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'BOOKING', 'REGISTRATION', 'CLOSED_WON', 'CLOSED_LOST'],
    QUALIFICATION: ['PROPOSAL', 'NEGOTIATION', 'BOOKING', 'REGISTRATION', 'CLOSED_WON', 'CLOSED_LOST', 'INQUIRY'],
    PROPOSAL: ['NEGOTIATION', 'BOOKING', 'REGISTRATION', 'CLOSED_WON', 'CLOSED_LOST', 'QUALIFICATION'],
    NEGOTIATION: ['BOOKING', 'REGISTRATION', 'CLOSED_WON', 'CLOSED_LOST', 'PROPOSAL'],
    BOOKING: ['REGISTRATION', 'CLOSED_WON', 'CLOSED_LOST', 'NEGOTIATION'],
    REGISTRATION: ['CLOSED_WON', 'CLOSED_LOST', 'BOOKING'],
    CLOSED_WON: ['INQUIRY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'BOOKING', 'REGISTRATION'],
    CLOSED_LOST: ['INQUIRY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'BOOKING', 'REGISTRATION'],
  },
  Property: {
    AVAILABLE: ['UNDER_OFFER', 'RENTED', 'INACTIVE'],
    UNDER_OFFER: ['AVAILABLE', 'SOLD'],
    SOLD: [],
    RENTED: ['AVAILABLE'],
    INACTIVE: ['AVAILABLE'],
  },
  SiteVisit: {
    SCHEDULED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: ['SCHEDULED'], // Reschedule a no-show
  },
  Campaign: {
    DRAFT: ['ACTIVE', 'CANCELLED'],
    ACTIVE: ['PAUSED', 'COMPLETED', 'CANCELLED'],
    PAUSED: ['ACTIVE', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  },
};

/**
 * Validates a status transition. Throws BadRequestException if invalid.
 * @param entityType - e.g. 'Lead', 'Deal', 'Property'
 * @param from - current status value
 * @param to - requested new status value
 */
export function validateTransition(
  entityType: string,
  from: string,
  to: string,
): void {
  // If status is not changing, always allow
  if (from === to) return;

  const entityMap = TRANSITIONS[entityType];
  if (!entityMap) return; // Unknown entity — skip validation

  const allowed = entityMap[from] ?? [];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid status transition for ${entityType}: "${from}" → "${to}". ` +
        `Allowed: ${allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)'}`,
    );
  }
}

/**
 * Returns the allowed next statuses for a given entity and current status.
 * Used by the frontend to disable invalid options in dropdowns.
 */
export function getAllowedTransitions(
  entityType: string,
  currentStatus: string,
): string[] {
  return TRANSITIONS[entityType]?.[currentStatus] ?? [];
}
