import { createCrudStore } from '@/services/storeFactory';

export const useLeadStore = createCrudStore<any>('leads');
