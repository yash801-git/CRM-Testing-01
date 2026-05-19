import { createCrudStore } from '@/services/storeFactory';

export const useCampaignStore = createCrudStore<any>('marketing');
