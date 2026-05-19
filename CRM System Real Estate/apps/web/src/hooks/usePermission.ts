import { useUserStore } from '@/store/userStore';

/**
 * Centralised permission hook.
 * Use this instead of inline `user?.role === 'BROKER'` checks across components.
 */
export function usePermission() {
  const { user } = useUserStore();
  const isBroker = user?.role === 'BROKER';

  return {
    isBroker,
    isAgent: !isBroker,
    /** Only brokers can delete any record */
    canDelete: isBroker,
    /** Only brokers can reassign leads/deals to other agents */
    canReassign: isBroker,
    /** Brokers see all records; agents see only their own */
    canViewAllRecords: isBroker,
    /** Only brokers can manage (create/edit/delete) other agents */
    canManageAgents: isBroker,
    /** Only brokers can create marketing campaigns */
    canManageCampaigns: isBroker,
  };
}
